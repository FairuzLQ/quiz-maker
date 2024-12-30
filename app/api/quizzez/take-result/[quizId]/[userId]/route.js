import { NextResponse } from 'next/server';
import { supabase } from '@lib/supabase';

export async function GET(req, { params }) {
  // Await params before using them
  const { quizId, userId } = await params;

  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('quiz_id, user_id, score')
      .eq('user_id', userId)  // Filter by userId
      .order('created_at', { ascending: false })  // Order by created_at, descending (most recent first)
      .limit(1);  // Get only the most recent result

    if (error) {
      console.error('Error fetching result:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No result found for the given userId' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });  // Return the most recent result
  } catch (err) {
    console.error('Error in GET request:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
