import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  googleId: { type: String, unique: true, sparse: true, select: false },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'warden', 'technician'], 
    default: 'student' 
  },
  requestedRole: { type: String, enum: ['student', 'admin', 'warden', 'technician'] },
  roleApproval: { type: String, enum: ['pending', 'approved'], default: 'approved' },
  rollNumber: { type: String },
  department: { type: String },
  hostel: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
