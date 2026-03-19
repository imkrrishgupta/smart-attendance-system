import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Session } from '@/models/Session';

/**
 * Calculate distance between two coordinates (meters)
 */
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * POST: Validate geo-fence
 * Body:
 *  - sessionId
 *  - latitude
 *  - longitude
 */
export async function POST(request: Request) {
  await dbConnect();

  const body = await request.json();
  const { sessionId, latitude, longitude } = body;

  if (!sessionId || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: 'sessionId, latitude and longitude are required' },
      { status: 400 }
    );
  }

  const session = await Session.findById(sessionId);

  if (!session || !session.isActive) {
    return NextResponse.json(
      { error: 'Session not active or not found' },
      { status: 400 }
    );
  }

  const { geoLocation } = session;

  if (!geoLocation) {
    return NextResponse.json(
      { error: 'Geo-fence not configured for this session' },
      { status: 400 }
    );
  }

  const distance = getDistance(
    geoLocation.lat,
    geoLocation.lng,
    latitude,
    longitude
  );

  // Buffer: allow 20m extra to account for GPS drift indoors
  const buffer = 20;
  const isInside = distance <= (geoLocation.radius + buffer);

  return NextResponse.json({
    isInside,
    distance: Math.round(distance),
    allowedRadius: geoLocation.radius
  });
}
