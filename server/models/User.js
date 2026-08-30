import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    division: { type: String, default: '', trim: true },
    experience: { type: String, default: '0' },
    role: { type: String, enum: ['cso', 'nsso', 'admin'], default: 'cso', lowercase: true, trim: true },
    competencyScore: { type: Number, default: 78 },
    currentAssignment: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
