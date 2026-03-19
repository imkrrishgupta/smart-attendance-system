import mongoose, { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'teacher' | 'student';

const UserSchema = new Schema(
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
    employeeId: { type: String, unique: true, sparse: true },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    enrollmentNo: {
      type: String,
    },
    faceEmbedding: {
      type: [Number],
      default: []
    },
    faceEmbeddings: {
      type: [[Number]],
      default: []
    }
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

export const User = models.User || model('User', UserSchema);
