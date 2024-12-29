// app/api/auth/login/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@lib/supabase';

export async function POST(req) {
  try {
    // Parse the incoming JSON request body
    const { email, password } = await req.json();

    // Validate input fields
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Use Supabase Auth to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If there's an error (e.g., invalid credentials), return a 401 Unauthorized response
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    // Successful login response
    return NextResponse.json({ message: 'Login successful', user: data.user }, { status: 200 });
  } catch (error) {
    console.error(error);
    // Internal server error
    return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
