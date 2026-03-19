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

    // Lazy migration: if they have the old field but not the new one
    if ((!student.faceEmbeddings || student.faceEmbeddings.length === 0) && 
        (student.faceEmbedding && student.faceEmbedding.length > 0)) {
        student.faceEmbeddings = [student.faceEmbedding];
        await student.save();
    }

    // Resolve descriptors: either multiple from client (enrollment) or single
    let activeDescriptors = descriptors || (descriptor ? [descriptor] : null);

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

    // Enrollment: Store multiple descriptors
    // Triggered by explicit mode or if profile is completely empty
    const isEnrollMode = mode === 'enroll' || !student.faceEmbeddings || student.faceEmbeddings.length === 0;

    if (isEnrollMode && descriptors) {
      // Validate we have enough frames for a robust profile (require at least 5 out of 10)
      if (activeDescriptors.length < 5) {
        return NextResponse.json({ 
          error: `Insufficient frames for biometric profile. ${activeDescriptors.length}/10 frames captured. Minimum 5 frames required. Please try again.` 
        }, { status: 400 });
      }
      
      // Store all descriptors for multi-angle matching (more robust)
      student.faceEmbeddings = activeDescriptors;
      // Also clear old legacy field to prevent re-migration
      student.faceEmbedding = []; 
      
      // Explicitly tell Mongoose that the nested array has been modified
      student.markModified('faceEmbeddings');
      student.markModified('faceEmbedding');
      
      await student.save();
      console.log(`[SUCCESS] Biometric profile updated for student: ${studentId} with ${activeDescriptors.length} frames`);

      return NextResponse.json({
        verified: true,
        confidence: 100,
        message: `Multi-profile biometric enrollment successful. ${activeDescriptors.length} frames stored.`
      });
    }

    // Comparison: Compare current descriptor against all stored profiles
    // We take the best match (minimum distance)
    const currentDescriptor = activeDescriptors[0];
    let minDistance = 1.0;

    for (const storedDescriptor of student.faceEmbeddings) {
      const dist = euclideanDistance(currentDescriptor, storedDescriptor);
      if (dist < minDistance) minDistance = dist;
    }

    /**
     * With multiple embeddings (multi-angle), we can be slightly stricter.
     * 0.55 is a balanced threshold for face-api.js.
     */
    const threshold = 0.55;
    const verified = minDistance < threshold;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - minDistance) * 100)));

    if (!verified) {
      return NextResponse.json({
        verified: false,
        confidence,
        error: 'Face verification failed. Bio-identity mismatch.'
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
