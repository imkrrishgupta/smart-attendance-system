"use client";

export default function TeacherPanel(classId: string){
  const startSession = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      await fetch('/api/attendance/start', {
        method: 'POST',
        body: JSON.stringify({ lat: latitude, lng: longitude, classId: classId })
      });
    });
  };

  return <button onClick={startSession}>Start Attendance Now</button>;
}