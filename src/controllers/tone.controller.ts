import { Request, Response } from 'express';
import { tonePracticeQuestions, minimalPairs, toneSandhiRules } from '../content/tones';

// Get tone practice questions (optionally filtered by difficulty)
export const getToneQuestions = (req: Request, res: Response): void => {
  try {
    const { count = '20', difficulty } = req.query;
    const countNum = Math.min(parseInt(count as string) || 20, 80);
    
    let questions = [...tonePracticeQuestions];
    
    // Filter by difficulty if provided
    if (difficulty === 'beginner') {
      // Beginner: only tones 1 and 4 (easier to distinguish)
      questions = questions.filter(q => q.correctTone === 1 || q.correctTone === 4);
    } else if (difficulty === 'intermediate') {
      // Intermediate: all tones
      questions = tonePracticeQuestions;
    } else if (difficulty === 'advanced') {
      // Advanced: focus on tones 2 and 3 (harder to distinguish)
      questions = questions.filter(q => q.correctTone === 2 || q.correctTone === 3);
    }
    
    // Shuffle
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    res.json({
      success: true,
      data: questions.slice(0, countNum),
    });
  } catch (error) {
    console.error('Error fetching tone questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tone questions',
    });
  }
};

// Get minimal pairs for comparison
export const getMinimalPairs = (req: Request, res: Response): void => {
  try {
    res.json({
      success: true,
      data: minimalPairs,
    });
  } catch (error) {
    console.error('Error fetching minimal pairs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch minimal pairs',
    });
  }
};

// Get tone sandhi rules
export const getToneSandhiRules = (req: Request, res: Response): void => {
  try {
    res.json({
      success: true,
      data: toneSandhiRules,
    });
  } catch (error) {
    console.error('Error fetching tone sandhi rules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tone sandhi rules',
    });
  }
};