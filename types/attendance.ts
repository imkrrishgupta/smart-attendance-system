export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: Date;
  faceVerified: boolean;
  locationVerified: boolean;
}
