'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, CheckCircle, Loader2, UserCheck, X } from 'lucide-react';

interface FaceCaptureProps {
    studentId: string;
    mode?: 'verify' | 'enroll';
    onVerified: (confidence: number) => void;
    onFailed: (error: string) => void;
    onCancel?: () => void;
}

export default function FaceCapture({ studentId, mode = 'verify', onVerified, onFailed, onCancel }: FaceCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const faceapiRef = useRef<any>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'processing' | 'done'>('idle');
    const [message, setMessage] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    const isEnroll = mode === 'enroll';

    // Initialize models
    useEffect(() => {
        const loadModels = async () => {
            setStatus('loading');
            setMessage('Initializing biometric engine...');
            try {
                // Dynamic import to avoid SSR errors during module evaluation
                const faceapi = await import('@vladmandic/face-api');
                faceapiRef.current = faceapi;

                console.log('[MODEL_LOAD] Starting model initialization...');

                // Load from public/models with better error messages
                const modelStartTime = Date.now();
                await Promise.all([
                    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
                        .catch(e => { throw new Error(`SSD Mobilenet failed: ${e.message}`); }),
                    faceapi.nets.faceLandmark68Net.loadFromUri('/models')
                        .catch(e => { throw new Error(`Face Landmark failed: ${e.message}`); }),
                    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
                        .catch(e => { throw new Error(`Face Recognition failed: ${e.message}`); })
                ]);
                
                const loadTime = Date.now() - modelStartTime;
                console.log(`[MODEL_LOAD] Models loaded successfully in ${loadTime}ms`);
                
                setModelsLoaded(true);
                setStatus('idle');
                setMessage('');
            } catch (err) {
                console.error('Face API model load error:', err);
                setMessage('');
                setStatus('idle');
                onFailed(`Failed to load face recognition models: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
        };
        loadModels();
    }, [onFailed]);

    const startCamera = useCallback(async () => {
        if (!modelsLoaded) return;
        setStatus('streaming');
        setMessage('Starting camera...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 },
                    // Add additional constraints for better performance
                    frameRate: { ideal: 30 }
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                // Ensure video plays
                try {
                    await videoRef.current.play();
                } catch (playErr) {
                    console.warn('Video autoplay issue (expected in some browsers):', playErr);
                }
                
                // Wait for video to be ready before allowing capture
                return new Promise<void>((resolve, reject) => {
                    let attempts = 0;
                    const maxAttempts = 50; // 5 seconds max
                    
                    const checkVideoReady = () => {
                        attempts++;
                        
                        if (videoRef.current && 
                            videoRef.current.readyState >= 2 && 
                            videoRef.current.videoWidth > 0 && 
                            videoRef.current.videoHeight > 0) {
                            console.log(`[CAMERA] Video ready on attempt ${attempts}. Dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
                            setMessage('');
                            resolve();
                        } else if (attempts >= maxAttempts) {
                            console.error('[CAMERA] Timeout waiting for video stream');
                            reject(new Error('Camera stream failed to initialize. Please check camera permissions and try again.'));
                        } else {
                            setTimeout(checkVideoReady, 100);
                        }
                    };
                    
                    checkVideoReady();
                });
            }
        } catch (err: any) {
            console.error('[CAMERA] Access error:', err);
            setMessage('');
            setStatus('idle');
            const errorMsg = err?.name === 'NotAllowedError' 
                ? 'Camera permission denied. Please allow camera access in your browser settings.' 
                : err?.name === 'NotFoundError'
                ? 'No camera device found. Please connect a camera.'
                : 'Camera access failed.';
            onFailed(errorMsg);
        }
    }, [onFailed, modelsLoaded]);

    const stopCamera = useCallback(() => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }, []);

    // Monitoring for face presence
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (status === 'streaming' && videoRef.current && faceapiRef.current) {
            interval = setInterval(async () => {
                if (!videoRef.current || !faceapiRef.current) return;
                try {
                    const detection = await faceapiRef.current.detectSingleFace(videoRef.current);
                    setFaceDetected(!!detection);
                } catch (err) {
                    console.warn('Face detection error during stream:', err);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const [enrollProgress, setEnrollProgress] = useState(0);
    const [capturedDescriptors, setCapturedDescriptors] = useState<number[][]>([]);
    const [lastLandmarks, setLastLandmarks] = useState<any>(null);
    const [movementDetected, setMovementDetected] = useState(false);
    const [isWaitingForAngle, setIsWaitingForAngle] = useState(false);

    // Metadata for liveness
    const checkMovement = (currentLandmarks: any) => {
        if (!lastLandmarks) {
            setLastLandmarks(currentLandmarks);
            return false;
        }
        // Calculate Euclidean distance between corresponding landmarks to detect movement
        const dist = Math.sqrt(
            Math.pow(currentLandmarks.positions[0].x - lastLandmarks.positions[0].x, 2) +
            Math.pow(currentLandmarks.positions[0].y - lastLandmarks.positions[0].y, 2)
        );
        // If movement is significant (> 2 pixels change)
        if (dist > 2) setMovementDetected(true);
        setLastLandmarks(currentLandmarks);
        return dist > 2;
    };

    const statusRef = useRef(status);
    const updateStatus = (newStatus: typeof status) => {
        setStatus(newStatus);
        statusRef.current = newStatus;
    };

    useEffect(() => { statusRef.current = status; }, [status]);

    const waitRef = useRef(false);
    const lastPreparedAngleIndexRef = useRef(-1);

    const captureAndProcess = async () => {
        if (!videoRef.current || !faceapiRef.current) return;
        
        // Ensure video is actually ready
        if (videoRef.current.readyState < 2) {
            onFailed('Camera not ready. Please wait a moment and try again.');
            return;
        }

        // Check if video has valid dimensions
        if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
            onFailed('Camera not providing video feed. Check camera permissions.');
            return;
        }

        updateStatus('processing');
        
        // Stabilization delay - let the video stream settle
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (isEnroll) {
            const descriptors: number[][] = [];
            let framesCaptured = 0;
            let consecutiveFailures = 0;
            setEnrollProgress(0);
            setMovementDetected(false);
            setLastLandmarks(null);
            setIsWaitingForAngle(false);
            waitRef.current = false;
            lastPreparedAngleIndexRef.current = -1;

            const angles = [
                { name: 'Look Straight', next: 'Rotate Slightly Left' },
                { name: 'Rotate Slightly Left', next: 'Rotate Slightly Right' },
                { name: 'Rotate Slightly Right', next: 'Look Slightly Up' },
                { name: 'Look Slightly Up', next: 'Look Slightly Down' },
                { name: 'Look Slightly Down', next: 'Finished' }
            ];

            const captureLoop = async () => {
                // Check if loop should stop or if video is lost
                if (statusRef.current === 'idle' || statusRef.current === 'done' || !videoRef.current) {
                    return;
                }

                // Verify video is still ready
                if (videoRef.current.readyState < 2) {
                    onFailed('Camera feed lost. Please try again.');
                    updateStatus('idle');
                    return;
                }

                if (framesCaptured >= 10) {
                    setMessage('Encrypting & Syncing Biometric Cluster...');
                    try {
                        const res = await fetch('/api/face-auth', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId, descriptors, mode: 'enroll' })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        
                        stopCamera();
                        updateStatus('done');
                        setMessage('Secure Biometric Profile Initialized!');
                        onVerified(100);
                    } catch (e: any) {
                        onFailed(e.message || 'Server synchronization failed.');
                        updateStatus('idle');
                    }
                    return;
                }

                const angleIndex = Math.floor(framesCaptured / 2);
                const currentAngle = angles[angleIndex];

                // Preparation Phase: Only enter if we haven't 'prepared' this angle yet
                if (lastPreparedAngleIndexRef.current < angleIndex) {
                    setIsWaitingForAngle(true);
                    waitRef.current = true;
                    setMessage(`STEP ${angleIndex + 1}/5: ${currentAngle.name.toUpperCase()}`);
                    
                    lastPreparedAngleIndexRef.current = angleIndex;
                    setTimeout(captureLoop, 2000); 
                    return;
                }

                // Exit waiting mode if we were in it
                if (waitRef.current) {
                    setIsWaitingForAngle(false);
                    waitRef.current = false;
                }

                setMessage(`CAPTURING BIOMETRICS [FRAME ${framesCaptured % 2 + 1}/2]`);
                
                try {
                    if (!videoRef.current) return;
                    
                    // Use explicit options to lower the detection threshold - improved reliability
                    const options = new faceapiRef.current.SsdMobilenetv1Options({ minConfidence: 0.3 });
                    const detection = await faceapiRef.current.detectSingleFace(videoRef.current, options)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (detection && detection.descriptor) {
                        console.log(`[FACE_SCAN] Frame ${framesCaptured + 1}/10 captured successfully. Confidence: ${detection.score?.toFixed(2)}`);
                        checkMovement(detection.landmarks);
                        descriptors.push(Array.from(detection.descriptor));
                        framesCaptured++;
                        setEnrollProgress(framesCaptured);
                        consecutiveFailures = 0;

                        // Brief pause between frames to allow video to update
                        setTimeout(captureLoop, 500);
                    } else {
                        consecutiveFailures++;
                        console.warn(`[FACE_SCAN] Detection failed (Attempt ${consecutiveFailures}/90). Score: ${detection?.score || 'N/A'}`);
                        
                        if (consecutiveFailures > 10) {
                            setMessage('FACE NOT DETECTED - ENSURE CLEAR LIGHTING & VISIBILITY');
                        }
                        if (consecutiveFailures > 90) {
                            throw new Error('Biometric capture timed out. Ensure your face is clearly visible, well-lit, and fill 50-80% of the frame.');
                        }
                        
                        // Adaptive delay - longer when failing more often
                        const delay = Math.min(800, 400 + consecutiveFailures * 5);
                        setTimeout(captureLoop, delay);
                    }
                } catch (e: any) {
                    console.error('Capture error:', e);
                    onFailed(e.message || 'Biometric analysis interrupted.');
                    updateStatus('idle');
                }
            };

            captureLoop();

        } else {
            setMessage('Bio-Identity Pulse Check...');
            const descriptors: number[][] = [];
            let framesCaptured = 0;
            let consecutiveFailures = 0;
            setMovementDetected(false);
            setLastLandmarks(null);

            const captureLoop = async () => {
                if (statusRef.current === 'idle' || statusRef.current === 'done' || !videoRef.current) {
                    return;
                }

                // Verify video is still ready
                if (videoRef.current.readyState < 2) {
                    onFailed('Camera feed lost. Please try again.');
                    updateStatus('idle');
                    return;
                }

                if (framesCaptured >= 3) {
                    if (!movementDetected) {
                        onFailed('Liveness check failed. Please move slightly during the scan.');
                        updateStatus('idle');
                        return;
                    }
                    
                    try {
                        const res = await fetch('/api/face-auth', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                studentId,
                                descriptors // Send all captured descriptors for better reliability
                            })
                        });

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);

                        stopCamera();
                        updateStatus('done');
                        setMessage(`Verified — Confidence ${data.confidence}%`);
                        onVerified(data.confidence);
                    } catch (err: any) {
                        onFailed(err.message || 'Verification failed.');
                        updateStatus('idle');
                    }
                    return;
                }

                try {
                    // Use explicit options for better reliability
                    const options = new faceapiRef.current.SsdMobilenetv1Options({ minConfidence: 0.3 });
                    const detection = await faceapiRef.current.detectSingleFace(videoRef.current, options)
                        .withFaceLandmarks()
                        .withFaceDescriptor();

                    if (detection && detection.descriptor) {
                        checkMovement(detection.landmarks);
                        descriptors.push(Array.from(detection.descriptor));
                        framesCaptured++;
                        consecutiveFailures = 0;
                        setTimeout(captureLoop, 500);
                    } else {
                        consecutiveFailures++;
                        console.warn(`[VERIFY_SCAN] Detection failed (Attempt ${consecutiveFailures}/15).`);
                        if (consecutiveFailures > 15) {
                            throw new Error('Verification timed out. Face not detected. Ensure clear visibility and good lighting.');
                        }
                        setTimeout(captureLoop, 600);
                    }
                } catch (e: any) {
                    console.error('Verification error:', e);
                    onFailed(e.message || 'Verification interrupted.');
                    updateStatus('idle');
                }
            };

            captureLoop();
        }
    };

    if (!modelsLoaded) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-900 rounded-3xl border border-slate-800 min-h-[400px] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />
                <div className="relative">
                    <div className="w-24 h-24 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin absolute -inset-2 opacity-30" />
                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                </div>
                <div className="mt-8 text-center space-y-2">
                    <p className="text-blue-200 font-bold tracking-widest uppercase text-xs">System Initialization</p>
                    <p className="text-slate-400 font-medium">{message}</p>
                </div>
                <div className="absolute top-6 left-6 w-2 h-2 bg-blue-500/20 rounded-full" />
                <div className="absolute top-6 right-6 w-2 h-2 bg-blue-500/20 rounded-full" />
                <div className="absolute bottom-6 left-6 w-2 h-2 bg-blue-500/20 rounded-full" />
                <div className="absolute bottom-6 right-6 w-2 h-2 bg-blue-500/20 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {status === 'idle' && (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center relative overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:rotate-12 transition-transform duration-500">
                        <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                        {isEnroll ? 'Biometric Enrollment' : 'Identity Verification'}
                    </h4>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        {isEnroll 
                          ? 'Register your facial profile to enable secure biometric attendance marking.' 
                          : 'Please look at the camera to verify your identity and mark attendance.'}
                    </p>
                    <button
                        onClick={startCamera}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black tracking-wide hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        <Camera className="w-5 h-5" />
                        {isEnroll ? 'START ENROLLMENT' : 'BEGIN SCAN'}
                    </button>
                    {onCancel && (
                        <button
                          onClick={onCancel}
                          className="block w-full mt-4 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
                        >
                          Cancel
                        </button>
                    )}
                </div>
            )}

            {(status === 'streaming' || status === 'processing' || status === 'done') && (
                <div className="relative overflow-hidden rounded-3xl bg-slate-950 aspect-video shadow-2xl ring-1 ring-white/10 group">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-700 ${status === 'processing' ? 'scale-100 opacity-90' : 'opacity-100'}`}
                    />

                    {/* HUD Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute inset-8 border transition-all duration-700 ${faceDetected ? 'border-blue-400 scale-100' : 'border-white/10 scale-110'} rounded-3xl`}>
                            <div className={`absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 transition-colors duration-300 ${faceDetected ? 'border-blue-500' : 'border-slate-700'} rounded-tl-xl`} />
                            <div className={`absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 transition-colors duration-300 ${faceDetected ? 'border-blue-500' : 'border-slate-700'} rounded-tr-xl`} />
                            <div className={`absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 transition-colors duration-300 ${faceDetected ? 'border-blue-500' : 'border-slate-700'} rounded-bl-xl`} />
                            <div className={`absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 transition-colors duration-300 ${faceDetected ? 'border-blue-500' : 'border-slate-700'} rounded-br-xl`} />
                            
                            {status === 'streaming' && (
                                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_20px_rgba(96,165,250,0.8)] animate-[scan_2.5s_ease-in-out_infinite]" />
                            )}
                        </div>

                        <div className="absolute bottom-6 left-8 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-blue-400/80">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                LIVE_FEED_ACTIVE
                            </div>
                            <div className="text-[10px] font-mono text-white/40">SYS_AUTH_v4.2 // NODE_68</div>
                        </div>

                        <div className="absolute top-6 left-0 right-0 flex justify-center">
                            <div className={`px-4 py-2 backdrop-blur-xl rounded-2xl border transition-all duration-500 flex items-center gap-3 ${faceDetected ? 'bg-blue-500/20 border-blue-400/30 -translate-y-0 opacity-100' : 'bg-slate-900/40 border-white/10 -translate-y-2 opacity-0'}`}>
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">
                                    Biometric Lock Engaged
                                </span>
                            </div>
                        </div>
                    </div>

                    {status === 'processing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-900/80 backdrop-blur-md">
                            {isWaitingForAngle ? (
                                <div className="text-center animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                        <RefreshCw className="w-10 h-10 text-white animate-spin-slow" />
                                    </div>
                                    <p className="text-blue-400 font-black tracking-[0.3em] uppercase text-xs mb-2">Preparation Phase</p>
                                    <h4 className="text-3xl font-black tracking-tight uppercase italic">{message}</h4>
                                    <p className="text-slate-400 text-xs mt-4 font-medium italic">Adjusting biometric sensor...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
                                        <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin" />
                                    </div>
                                    <h4 className="font-black text-xl tracking-widest uppercase mb-1 italic">{message}</h4>
                                    
                                    {isEnroll ? (
                                        <div className="w-64 mt-4 space-y-2">
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-500 transition-all duration-300" 
                                                    style={{ width: `${enrollProgress * 10}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                                <span>Capturing Biometrics</span>
                                                <span>{enrollProgress}/10</span>
                                            </div>
                                            {!movementDetected && enrollProgress > 3 && (
                                                <p className="text-center text-[10px] text-amber-400 animate-pulse mt-2">
                                                    HEAD MOVEMENT REQUIRED FOR LIVENESS CHECK
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-1">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {status === 'done' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/10 backdrop-blur-sm">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-in zoom-in-50 duration-500">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h4 className="text-3xl font-black text-white mb-2 tracking-tight uppercase italic underline decoration-green-400 underline-offset-8">Authorized</h4>
                            <p className="text-green-300 font-bold uppercase tracking-widest text-[10px]">Security Clearance Acknowledged</p>
                        </div>
                    )}
                </div>
            )}

            {status === 'streaming' && (
                <div className="flex gap-4">
                    <button
                        onClick={captureAndProcess}
                        disabled={!faceDetected}
                        className={`flex-1 group relative overflow-hidden py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] ${
                            faceDetected 
                            ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            <Camera className={`w-6 h-6 ${faceDetected ? 'animate-pulse' : ''}`} />
                            {isEnroll ? 'REGISTER IDENTITY' : 'VERIFY BIOMETRICS'}
                        </span>
                        {faceDetected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </button>
                    {onCancel && (
                        <button
                            onClick={() => { stopCamera(); onCancel(); }}
                            className="w-16 h-16 flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-colors group"
                        >
                            <X className="w-6 h-6 transform group-hover:rotate-90 transition-transform" />
                        </button>
                    )}
                </div>
            )}

            {status === 'done' && (
                <div className="p-6 bg-slate-900 rounded-3xl border border-white/5 flex items-center gap-5 text-white animate-in slide-in-from-bottom-6 duration-700">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                    </div>
                    <div>
                        <p className="text-white font-black uppercase tracking-tighter text-lg leading-none mb-1">Authenticated</p>
                        <p className="text-slate-400 text-xs font-medium tracking-wide">Syncing data to main cluster...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
