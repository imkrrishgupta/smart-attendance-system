import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { getFaceEmbedding } from '@/lib/faceRecognition';

/**
 * POST /api/face-auth
 * 
 * Secure Biometric Authentication API.
 * Handles both direct descriptor (already processed by client)
 * and raw image (base64, processed on server).
 */

function euclideanDistance(arr1: number[], arr2: number[]): number {
  if (arr1.length !== arr2.length) return 1.0;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
}

export async function POST(req: Request) {
  try {
    const { studentId, descriptor, descriptors, image, mode } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    await dbConnect();

    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Resolve descriptors: either multiple from client (enrollment) or single
    let activeDescriptors: any[] | null = descriptors || (descriptor ? [descriptor] : null);

    if (image && !activeDescriptors) {
      const imageBuffer = Buffer.from(image.split(',')[1], 'base64');
      const extracted = await getFaceEmbedding(imageBuffer);
      if (!extracted) {
        return NextResponse.json({ error: 'Could not detect face in image' }, { status: 422 });
      }
      activeDescriptors = [Array.from(extracted)];
    }

    if (!activeDescriptors || !Array.isArray(activeDescriptors)) {
      return NextResponse.json({ error: 'Valid face data is required' }, { status: 400 });
    }

    // Enrollment: Store descriptors
    // Triggered by explicit mode or if profile is completely empty
    const isEnrollMode = mode === 'enroll' || !student.faceEmbeddings || student.faceEmbeddings.length === 0;

    if (isEnrollMode) {
      const enrollmentDescriptors = descriptors || (descriptor ? [descriptor] : null);
      
      if (enrollmentDescriptors) {
        // If it's plural enrollment (from capture loop), require minimum 5 frames
        if (descriptors && enrollmentDescriptors.length < 5) {
          return NextResponse.json({ 
            error: `Insufficient frames for biometric profile. ${enrollmentDescriptors.length}/10 frames captured. Minimum 5 frames required. Please try again.` 
          }, { status: 400 });
        }
        
        // Store descriptors
        student.faceEmbeddings = enrollmentDescriptors;
        
        student.markModified('faceEmbeddings');
        await student.save();
        console.log(`[SUCCESS] Biometric profile updated for student: ${studentId} with ${enrollmentDescriptors.length} frames`);

        return NextResponse.json({
          verified: true,
          confidence: 100,
          message: `Biometric enrollment successful. ${enrollmentDescriptors.length} frames stored.`
        });
      }
    }

    // Comparison: Compare current descriptor against all stored profiles
    if (!student.faceEmbeddings || student.faceEmbeddings.length === 0) {
       return NextResponse.json({
        verified: false,
        error: 'No biometric profile found. Please enroll first.'
      }, { status: 401 });
    }

    // Compare current descriptor(s) against all stored profiles
    // We check each input descriptor; if any one matches any stored profile, verified = true
    const inputDescriptors = activeDescriptors; 
    let minDistance = 1.0;

    for (const currentDesc of inputDescriptors) {
      for (const storedDescriptor of student.faceEmbeddings) {
        const dist = euclideanDistance(currentDesc, storedDescriptor);
        if (dist < minDistance) minDistance = dist;
      }
    }

    const threshold = 0.60; // Slightly relaxed for better reliability
    const verified = minDistance < threshold;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - minDistance) * 100)));

    console.log(`[FACE_AUTH] Verification: ${verified}, MinDist: ${minDistance.toFixed(4)}, Stored: ${student.faceEmbeddings.length}`);

    if (!verified) {
      return NextResponse.json({
        verified: false,
        confidence,
        error: `Face verification failed. Confidence: ${confidence}%. (Dist: ${minDistance.toFixed(3)})`
      }, { status: 401 });
    }

    return NextResponse.json({ verified: true, confidence });

    } catch (error: any) {
    console.error('Face auth server error:', error);
    return NextResponse.json({ 
      error: 'Biometric server error',
      details: error.message 
    }, { status: 500 });
  }
}
