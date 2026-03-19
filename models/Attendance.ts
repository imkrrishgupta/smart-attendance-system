import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceSchema = new Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'absent'
    },
    faceVerified: { type: Boolean, default: false },
    locationVerified: { type: Boolean, default: false },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

export const Attendance =
  models.Attendance || model('Attendance', AttendanceSchema);
