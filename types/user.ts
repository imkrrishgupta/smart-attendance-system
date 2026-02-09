export type UserRole = 'admin' | 'teacher' | 'student';

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends BaseUser {
  role: 'student';
  rollNumber: string;
  department: string;
  year: number;
}

export interface Teacher extends BaseUser {
  role: 'teacher';
  employeeId: string;
  department: string;
}

export interface Admin extends BaseUser {
  role: 'admin';
}
