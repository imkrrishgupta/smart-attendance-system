import mongoose, { Schema, model, models } from 'mongoose';

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
    faceEmbedding: {
      type: [Number],
      default: []
    }
  },
  { timestamps: true }
);

export const User = models.User || model('User', UserSchema);
