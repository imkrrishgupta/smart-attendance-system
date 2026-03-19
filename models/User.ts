import { Schema, model, models, Document, CallbackError } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  department?: string;
  employeeId?: string;
  rollNumber?: string;
  enrollmentNo?: string;
  branch?: string;
  semester?: string;
  faceEmbeddings: number[][];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      required: true
    },
    isActive: { type: Boolean, default: true },
    department: { type: String },
    branch: { type: String },
    semester: { type: String },
    employeeId: { type: String, unique: true, sparse: true },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    enrollmentNo: {
      type: String,
    },
    faceEmbeddings: {
      type: [[Number]],
      default: []
    }
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) return;
  
  this.password = await bcrypt.hash(this.password as string, 10);
});

if (models.User) {
  delete (models as any).User;
}
export const User = model<IUser>('User', UserSchema);
