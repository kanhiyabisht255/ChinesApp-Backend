import { Router } from 'express';
import { getToneQuestions, getMinimalPairs, getToneSandhiRules } from '../controllers/tone.controller';

const router = Router();

// GET /api/tones/questions - Get practice questions
router.get('/questions', getToneQuestions);

// GET /api/tones/minimal-pairs - Get minimal pairs
router.get('/minimal-pairs', getMinimalPairs);

// GET /api/tones/sandhi-rules - Get tone change rules
router.get('/sandhi-rules', getToneSandhiRules);

export default router;