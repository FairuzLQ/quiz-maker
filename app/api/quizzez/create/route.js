import { supabase } from '@lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { title, author, questions, user_id } = req.body;

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
        return res.status(500).json({ message: 'Failed to create quiz' });
      }

      // Return success response
      return res.status(200).json({ message: 'Quiz created successfully', quiz: data });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
