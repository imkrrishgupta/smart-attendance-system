"use client";

import { useState } from "react";
import axios from "axios";

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
          const res = await axios.post("/api/attendance/mark", {
            sessionId,
            studentId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });

          alert(res.data.message);
        } catch (error: any) {
          if (error.response) {
            alert(error.response.data?.error || "Attendance failed");
          } else {
            alert("Something went wrong");
          }
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
      },
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
