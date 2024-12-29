// app/api/auth/register/route.js
import { supabase } from '@lib/supabase';  // Correct import for Supabase
import { NextResponse } from 'next/server'; // Import NextResponse for the new API route handling

// Named export for POST method
export async function POST(req) {
  try {
    // Parse request body
    const { name, email, password } = await req.json(); // Assuming the data comes from the request body

    // Validate input (optional but good for robustness)
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Example Supabase user creation logic
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Insert the user data into the "users" table
    await supabase.from('users').insert([{ name, email, user_id: data.user.id }]);

    return NextResponse.json({ message: 'User created successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
