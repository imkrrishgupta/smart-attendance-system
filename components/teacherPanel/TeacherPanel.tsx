"use client";

import axios from "axios";

export default function TeacherPanel({ classId }: { classId: string }) {
  const startSession = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await axios.post("/api/attendance/start", {
            lat: latitude,
            lng: longitude,
            classId: classId,
          });

          alert(res.data.message || "Session started successfully");
        } catch (error: any) {
          if (error.response) {
            alert(error.response.data?.error || "Failed to start session");
          } else {
            alert("Something went wrong");
          }
        }
      },
      () => {
        alert("Location permission required");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  return (
    <button 
      onClick={startSession}
    >
      Start Attendance Session
    </button>
  );
}