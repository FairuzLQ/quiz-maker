import { supabase } from '@lib/supabase';

export async function PUT(req) {
  try {
    const body = await req.json();
    const { quizId, title, author, questions } = body;

    if (!quizId || !title || !author || !questions) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('quizzes')
      .update({
        title,
        author,
        questions, // Supabase handles JSONB directly
      })
      .eq('id', quizId);

    if (error) {
      console.error('Supabase error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Failed to update quiz' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Quiz updated successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err.message);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
