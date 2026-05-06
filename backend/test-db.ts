// Quick test: connect to MongoDB and try creating a user
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password as string, 12);
  next();
});

mongoose.connect(MONGODB_URI, { family: 4 }).then(async () => {
  console.log('Connected!');
  try {
    const User = mongoose.model('TestUser', userSchema);
    const u = new User({ name: 'Test', email: 'testdbcheck@test.com', password: 'test123' });
    await u.save();
    console.log('User created:', u._id);
    await User.deleteOne({ email: 'testdbcheck@test.com' });
    console.log('Cleaned up. DB write works!');
  } catch(e: any) {
    console.error('DB test error:', e.message);
  }
  process.exit(0);
}).catch(e => { console.error('Connect failed:', e.message); process.exit(1); });
