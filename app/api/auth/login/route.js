import { NextResponse } from 'next/server';
import { supabase } from '@lib/supabase';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    const token = data?.session?.access_token;
    if (token) {

      const response = NextResponse.json({ message: 'Login successful', user: data.user }, { status: 200 });

      // Set the token in cookies
      response.cookies.set('auth_token', token, {
        httpOnly: true, // Cookie will be inaccessible to JavaScript
        secure: process.env.NODE_ENV === 'production', // Set cookie as secure in production
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week expiration
      });

      return response;
    } else {
      return NextResponse.json({ message: 'Session not available.' }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred. Please try again later.' }, { status: 500 });
  }
}
