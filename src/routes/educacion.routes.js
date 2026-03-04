import { Router } from 'express';
import { 
    obtenerMicrocursos, 
    obtenerQuizPorCurso, 
    evaluarQuiz 
} from '../controllers/educacion.controller.js';

const router = Router();

// Endpoint: GET /api/educacion/cursos
router.get('/cursos', obtenerMicrocursos);

// Endpoint: GET /api/educacion/cursos/:curso_id/quiz
router.get('/cursos/:curso_id/quiz', obtenerQuizPorCurso);

// Endpoint: POST /api/educacion/evaluar
router.post('/evaluar', evaluarQuiz);

export default router;
