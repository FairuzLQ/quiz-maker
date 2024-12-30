import { supabase } from '@lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { quizId, quizData } = req.body;
    
    // Update quiz in the database
    const { error } = await supabase
      .from('quizzes')
      .update(quizData)
      .eq('id', quizId);

    if (error) {
      return res.status(500).json({ message: 'Failed to update quiz', error });
    }

    res.status(200).json({ message: 'Quiz updated successfully' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
