import { NextResponse } from "next/server";
import { Session } from "@/models/Session";
import { Attendance } from "@/models/Attendance";
import { calculateDistance } from "@/utils/geoFence";
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

    if (!sessionId || !studentId || !latitude || !longitude) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const session = await Session.findById(sessionId);

    if (!session || !session.isActive) {
      return NextResponse.json(
        { message: "Session not active" },
        { status: 400 }
      );
    }

    const now = new Date();

    if (
      !session.startTime ||
      now < session.startTime ||
      (session.endTime && now > session.endTime)
    ) {
      return NextResponse.json(
        { message: "Outside session time window" },
        { status: 403 }
      );
    }

    if (accuracy && accuracy > 30) {
      return NextResponse.json(
        { message: "GPS accuracy too low. Please move near window." },
        { status: 400 }
      );
    }

    const teacherLat = session.geoLocation?.lat;
    const teacherLng = session.geoLocation?.lng;

    if (!teacherLat || !teacherLng) {
      return NextResponse.json(
        { message: "Session location not set" },
        { status: 500 }
      );
    }

    const distance = calculateDistance(
      latitude,
      longitude,
      teacherLat,
      teacherLng
    );

    if (distance > 20) {
      return NextResponse.json(
        {
          message: `You must be within 20 meters. Current distance: ${Math.round(
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
  } catch (error) {
    console.error("Attendance Error:", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
