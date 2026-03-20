import mongoose, { Schema, model, models } from 'mongoose';

const LeaveRequestSchema = new Schema(
    {
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
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

if (models.LeaveRequestV2) {
    delete (models as any).LeaveRequestV2;
}
export const LeaveRequest = model('LeaveRequestV2', LeaveRequestSchema, 'leaverequests');
