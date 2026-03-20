import mongoose, { Schema, model, models } from 'mongoose';

const ScheduleExceptionSchema = new Schema(
    {
        timetableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Timetable',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['cancelled', 'substituted'],
            required: true,
            default: 'cancelled'
        },
        substituteTeacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    { timestamps: true }
);

// Ensure unique exception per timetable entry per date
ScheduleExceptionSchema.index({ timetableId: 1, date: 1 }, { unique: true });

export const ScheduleException = models.ScheduleException || model('ScheduleException', ScheduleExceptionSchema);
