import { NextResponse } from 'next/server';
import { supabase } from '@lib/supabase';

export async function POST(req) {
  const { quizId, userId, score } = await req.json(); // Parse the JSON body

  try {
    // Insert the result into the 'quiz_results' table
    const { data, error } = await supabase
      .from('quiz_results')
      .insert([{ quiz_id: quizId, user_id: userId, score }]);

    // Log the inserted data for debugging
    console.log('Inserted Data:', data);

    if (error) {
      console.error('Error inserting result:', error.message); // Log error message
      throw error;
    }

    return NextResponse.json({ message: 'Result submitted successfully' }, { status: 200 });
  } catch (err) {
    // Log error details for debugging
    console.error('Error in POST request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
