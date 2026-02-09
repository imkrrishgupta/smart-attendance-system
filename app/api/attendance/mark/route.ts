import { NextResponse } from "next/server";
import { Session } from "@/models/Session";
import { Attendance } from "@/models/Attendance";
import { getDistanceInMeters } from "@/utils/distance";
import { dbConnect } from "@/lib/db";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const {
      sessionId,
      studentId,
      latitude,
      longitude,
      accuracy,
    } = await req.json();

    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
      return NextResponse.json(
        { message: "Session not active" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < session.startTime || now > session.endTime) {
      return NextResponse.json(
        { message: "Outside session time window" },
        { status: 403 }
      );
    }

    if (accuracy > 25) {
      return NextResponse.json(
        { message: "GPS accuracy too low. Move near window." },
        { status: 400 }
      );
    }

    const distance = getDistanceInMeters(
      latitude,
      longitude,
      session.geoLocation.lat,
      session.geoLocation.lng
    );

    if (distance > 20) {
      return NextResponse.json(
        {
          message: `You must be within 10 meters of classroom. Current distance: ${Math.round(
            distance
          )}m`,
        },
        { status: 403 }
      );
    }

    const existing = await Attendance.findOne({
      studentId,
      sessionId,
    });

    if (existing) {
      return NextResponse.json(
        { message: "Attendance already marked" },
        { status: 409 }
      );
    }

    await Attendance.create({
      studentId,
      sessionId,
      status: "present",
      location: {
        lat: latitude,
        lng: longitude,
      },
      accuracy,
    });

    return NextResponse.json({
      message: "Attendance marked successfully",
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}