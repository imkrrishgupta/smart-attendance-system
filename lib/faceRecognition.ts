// TextEncoder/Decoder polyfills for Node.js environment
if (typeof global.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util');
    (global as any).TextEncoder = TextEncoder;
    (global as any).TextDecoder = TextDecoder;
}

import { Canvas, Image, ImageData } from 'canvas';
import path from 'path';

let modelsLoaded = false;
let faceapiInstance: any = null;

async function getFaceApi() {
    if (!faceapiInstance) {
        faceapiInstance = await import('@vladmandic/face-api');
        // Patch Node.js environment
        faceapiInstance.env.monkeyPatch({ Canvas, Image, ImageData } as any);
    }
    return faceapiInstance;
}

export async function loadFaceModels() {
    if (modelsLoaded) return;

    const faceapi = await getFaceApi();
    const modelsPath = path.join(process.cwd(), 'public', 'models');

    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath),
            faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath),
            faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath)
        ]);
        modelsLoaded = true;
        console.log('Face Recognition models loaded successfully');
    } catch (error) {
        console.error('Failed to load Face Recognition models', error);
    }
}

export async function getFaceEmbedding(imageBuffer: Buffer): Promise<Float32Array | null> {
    const faceapi = await getFaceApi();
    await loadFaceModels();

    try {
        // Decode image buffer to canvas Image
        const img = new Image();
        img.src = imageBuffer;

        const canvas = new Canvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const detection = await faceapi.detectSingleFace(canvas as any)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return null;
        return detection.descriptor;
    } catch (error) {
        console.error('Error getting face embedding:', error);
        return null;
    }
}

// Calculate cosine similarity between two descriptors
export async function calculateSimilarity(desc1: Float32Array | number[], desc2: Float32Array | number[]): Promise<number> {
    const faceapi = await getFaceApi();
    const a = desc1 instanceof Float32Array ? desc1 : new Float32Array(desc1);
    const b = desc2 instanceof Float32Array ? desc2 : new Float32Array(desc2);

    // face-api.js euclideanDistance
    const distance = faceapi.euclideanDistance(a, b);

    // Convert mathematical distance to a percentage confidence (1 - distance)
    // Common face-api threshold is 0.6 distance (so roughly >40% mathematically, but we scale it for UX)
    // For a threshold of 0.6, let's map it so 0.6 distance = 85% confidence for UI purposes.
    // distance 0 = 100%, distance 0.6 = 85%.
    const confidence = Math.max(0, 100 - (distance * (15 / 0.6)));

    return Math.round(confidence * 100) / 100;
}
