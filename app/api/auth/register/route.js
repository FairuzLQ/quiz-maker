// app/api/auth/register/route.js
import { supabase } from '@lib/supabase';  // Correct import for Supabase
import { NextResponse } from 'next/server'; // Import NextResponse for the new API route handling

// Named export for POST method
export async function POST(req) {
  try {
    // Parse request body
    const { email, password } = await req.json(); // Only get email and password from the request body

    // Validate input (optional but good for robustness)
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Example Supabase user creation logic
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert the user data into the "users" table without the "name"
    await supabase.from('users').insert([{ email, user_id: data.user.id }]);

    return NextResponse.json({ message: 'User created successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
