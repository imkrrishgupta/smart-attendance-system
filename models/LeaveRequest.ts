import mongoose, { Schema, model, models } from 'mongoose';

const LeaveRequestSchema = new Schema(
    {
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export const LeaveRequest = models.LeaveRequest || model('LeaveRequest', LeaveRequestSchema);
