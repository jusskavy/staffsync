const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['hr', 'manager', 'employee'], default: 'employee' },
    department: { type: String, default: 'General' },
    designation: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dateOfBirth: { type: Date },
    dateOfJoining: { type: Date, default: Date.now },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    leaveBalance: { type: Number, default: 24 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.employeeId) {
    // Generates IDs like EMP1001, EMP1002 ...
    const User = mongoose.model('User');
    let n = 1001 + (await User.countDocuments());
    while (await User.exists({ employeeId: 'EMP' + n })) n++;
    this.employeeId = 'EMP' + n;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
