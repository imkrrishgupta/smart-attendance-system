export type SessionStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export interface Session {
  id: string;
  subject: string;
  teacherId: string;
  classRoom: string;
  startTime: Date;
  endTime: Date;
  geoFenceRadius: number;
  status: SessionStatus;
  createdAt: Date;
}
