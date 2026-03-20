import mongoose, { Schema, model, models } from 'mongoose';

const TimetableSchema = new Schema(
  {
    subject: { type: String, required: true },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true },
    branch: { type: String },
    semester: { type: String }
  },
  { timestamps: true }
);

if (models.Timetable) {
  delete (models as any).Timetable;
}
export const Timetable = model('Timetable', TimetableSchema);
