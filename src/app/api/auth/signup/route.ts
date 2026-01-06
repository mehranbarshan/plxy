
import { NextResponse, type NextRequest } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User.js';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ message: 'Email and password are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (password.length < 6) {
        return new NextResponse(
            JSON.stringify({ message: 'Password must be at least 6 characters long.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const lowercasedEmail = email.toLowerCase();
    const username = lowercasedEmail.split('@')[0];

    // Check if a user with the given email or username already exists
    const existingUser = await User.findOne({ 
        $or: [{ email: lowercasedEmail }, { username: username }] 
    });

    if (existingUser) {
        if (existingUser.email === lowercasedEmail) {
            return new NextResponse(
                JSON.stringify({ message: 'An account with this email already exists.' }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }
        if (existingUser.username === username) {
            return new NextResponse(
                JSON.stringify({ message: 'A user with this username already exists. Please choose a different email.' }),
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = await User.create({
      email: lowercasedEmail,
      username: username,
      password: hashedPassword,
    });

    return new NextResponse(
      JSON.stringify({ message: 'User created successfully.', user: { id: newUser.id, email: newUser.email, username: newUser.username, createdAt: newUser.createdAt } }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Signup Error:', error);
    // Handle potential MongoDB duplicate key error during race conditions
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return new NextResponse(
            JSON.stringify({ message: `An account with this ${field} already exists.` }),
            { status: 409, headers: { 'Content-Type': 'application/json' } }
        );
    }
    return new NextResponse(
      JSON.stringify({ message: 'An internal server error occurred.', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
