import mongoose from 'mongoose';

const EmployeeCardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    nid: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    photoBase64: {
      type: String,
      required: true,
    },
    originalPhotoBase64: {
      type: String,
      default: '',
    },
    photoScale: {
      type: Number,
      default: 1,
    },
    photoOffsetX: {
      type: Number,
      default: 0,
    },
    photoOffsetY: {
      type: Number,
      default: 0,
    },
    useAiPhoto: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite in serverless hot reloads
const EmployeeCard = mongoose.models.EmployeeCard || mongoose.model('EmployeeCard', EmployeeCardSchema);

export default EmployeeCard;
