"use client";

import { useState } from "react";

export default function MarkAttendance({
  sessionId,
  studentId,
}: {
  sessionId: string;
  studentId: string;
}) {
  const [loading, setLoading] = useState(false);

  const markAttendance = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/attendance/mark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              studentId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });

          const data = await res.json();
          alert(data.message);
        } catch (err) {
          alert("Something went wrong");
        } finally {
          setLoading(false);
        }
      },
      () => {
        alert("Location permission required");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <button
      onClick={markAttendance}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      {loading ? "Checking Location..." : "Mark Attendance"}
    </button>
  );
}
