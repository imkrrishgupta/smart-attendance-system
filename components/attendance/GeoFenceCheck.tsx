'use client';

import { useState, useCallback } from 'react';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface GeoFenceCheckProps {
    sessionId: string;
    onVerified: (distance: number) => void;
    onFailed: (error: string) => void;
}

export default function GeoFenceCheck({ sessionId, onVerified, onFailed }: GeoFenceCheckProps) {
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
    const [message, setMessage] = useState('');

    const verify = useCallback(() => {
        setStatus('checking');
        setMessage('Requesting location access…');

        if (!navigator.geolocation) {
            setStatus('failed');
            setMessage('Geolocation not supported.');
            onFailed('Geolocation not supported by this browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setMessage('Verifying with server…');
                try {
                    const res = await fetch('/api/geofence', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sessionId,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        })
                    });
                    const data = await res.json();

                    if (res.ok && data.isInside) {
                        setStatus('success');
                        setMessage(`Inside classroom — ${data.distance}m away`);
                        onVerified(data.distance);
                    } else {
                        setStatus('failed');
                        const msg = data.error || `Outside geo-fence (${data.distance}m > ${data.allowedRadius}m)`;
                        setMessage(msg);
                        onFailed(msg);
                    }
                } catch {
                    setStatus('failed');
                    setMessage('Server error while verifying location.');
                    onFailed('Server error');
                }
            },
            (err) => {
                setStatus('failed');
                setMessage(`Location error: ${err.message}`);
                onFailed(err.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [sessionId, onVerified, onFailed]);

    return (
        <div className="space-y-2">
            {status === 'idle' && (
                <button
                    onClick={verify}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2"
                >
                    <MapPin className="w-4 h-4" /> Check My Location
                </button>
            )}

            {status === 'checking' && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> {message}
                </div>
            )}

            {status === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" /> {message}
                </div>
            )}

            {status === 'failed' && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                        <XCircle className="w-4 h-4" /> {message}
                    </div>
                    <button
                        onClick={() => { setStatus('idle'); setMessage(''); }}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
