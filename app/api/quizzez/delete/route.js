import { supabase } from '@lib/supabase';
import { NextResponse } from 'next/server';  // Import NextResponse for proper response handling

export async function DELETE(req) {
  const { quizId } = await req.json(); // Use .json() to parse the incoming request body

  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }

  try {
    // Delete the quiz from Supabase
    const { data, error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({ message: 'Quiz deleted successfully', data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
