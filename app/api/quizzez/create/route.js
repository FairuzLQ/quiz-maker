// F:\RK\Tadsheen\quiz-maker\app\api\quizzez\create\route.js

import { supabase } from '@lib/supabase';

export async function POST(req) {
  try {
    const { title, author, questions, user_id } = await req.json(); // Parse request body

    // Insert the quiz into the Supabase database
    const { data, error } = await supabase
      .from('quizzes')
      .insert([
        {
          title,
          author,
          questions: JSON.stringify(questions), // Store questions as JSON
          user_id, // Associate with the authenticated user
        },
      ]);

    if (error) {
      console.error('Error inserting quiz:', error);
      return new Response(JSON.stringify({ message: 'Failed to create quiz' }), { status: 500 });
    }

    // Return success response
    return new Response(
      JSON.stringify({ message: 'Quiz created successfully', quiz: data }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
