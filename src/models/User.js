import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email address.'],
    unique: true,
    match: [/.+@.+\..+/, 'Please enter a valid email address.'],
    lowercase: true,
    index: true,
  },
  username: {
    type: String,
    required: [true, 'Please provide a username.'],
    unique: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password.'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Avoid "Cannot overwrite `User` model once compiled" error
export default mongoose.models.User || mongoose.model('User', UserSchema);
