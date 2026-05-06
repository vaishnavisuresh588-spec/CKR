import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  avatar:    { type: String, default: '' },   // base64 data-url or empty
  createdAt: { type: Date, default: Date.now },
});

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcryptjs.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcryptjs.compare(candidate, this.password);
};

let UserModel: mongoose.Model<IUser>;
try {
  UserModel = mongoose.model<IUser>('User');
} catch {
  UserModel = mongoose.model<IUser>('User', userSchema);
}

export default UserModel;
