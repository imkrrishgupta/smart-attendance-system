import mongoose, { Schema, model, models } from 'mongoose';

const SessionSchema = new Schema(
  {
    subject: { type: String, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    isActive: { type: Boolean, default: false },
    geoLocation: {
      lat: { type: Number },
      lng: { type: Number },
      radius: { type: Number }
    }
  },
  { timestamps: true }
);

export const Session = models.Session || model('Session', SessionSchema);
