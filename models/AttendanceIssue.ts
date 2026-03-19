import mongoose, { Schema, model, models } from 'mongoose';

const AttendanceIssueSchema = new Schema(
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
        issueType: {
            type: String,
            required: true,
            enum: ['face_mismatch', 'location_fail', 'session_inactive', 'other']
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'resolved'],
            default: 'pending'
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    { timestamps: true }
);

export const AttendanceIssue = models.AttendanceIssue || model('AttendanceIssue', AttendanceIssueSchema);
