import pool from '../config/db.js';

// 1. Obtener todos los microcursos disponibles
export const obtenerMicrocursos = async (req, res) => {
    try {
        const [cursos] = await pool.query('SELECT id, titulo, descripcion FROM microcursos');
        res.status(200).json({ datos: cursos });
    } catch (error) {
        console.error("Error al obtener microcursos:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// 2. Obtener el contenido del curso y su evaluación tipo quiz
export const obtenerQuizPorCurso = async (req, res) => {
    try {
        const { curso_id } = req.params;

        // Obtener detalles del curso
        const [cursoInfo] = await pool.query('SELECT * FROM microcursos WHERE id = ?', [curso_id]);
        
        if (cursoInfo.length === 0) {
            return res.status(404).json({ error: "Curso no encontrado." });
        }

        // Obtener las preguntas del quiz (sin enviar la respuesta correcta al frontend)
        const queryPreguntas = `
            SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d 
            FROM preguntas_quiz 
            WHERE curso_id = ?
        `;
        const [preguntas] = await pool.query(queryPreguntas, [curso_id]);

        res.status(200).json({
            curso: cursoInfo[0],
            quiz: preguntas
        });

    } catch (error) {
        console.error("Error al obtener el quiz:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

// 3. Evaluar el quiz y registrar el progreso
export const evaluarQuiz = async (req, res) => {
    try {
        const { usuario_id, curso_id, respuestas_usuario } = req.body;
        // respuestas_usuario debe ser un array de objetos: [{ pregunta_id: 1, respuesta: 'A' }, ...]

        if (!usuario_id || !curso_id || !respuestas_usuario) {
            return res.status(400).json({ error: "Faltan datos requeridos para la evaluación." });
        }

        // Obtener las respuestas correctas de la base de datos
        const [preguntasDB] = await pool.query('SELECT id, respuesta_correcta FROM preguntas_quiz WHERE curso_id = ?', [curso_id]);
        
        if (preguntasDB.length === 0) {
            return res.status(404).json({ error: "No hay preguntas registradas para este curso." });
        }

        // Calcular la calificación
        let respuestasCorrectas = 0;
        const totalPreguntas = preguntasDB.length;

        respuestas_usuario.forEach(respUser => {
            const preguntaMatch = preguntasDB.find(p => p.id === respUser.pregunta_id);
            if (preguntaMatch && preguntaMatch.respuesta_correcta === respUser.respuesta.toUpperCase()) {
                respuestasCorrectas++;
            }
        });

        const calificacionFinal = (respuestasCorrectas / totalPreguntas) * 100;
        const completado = calificacionFinal >= 70; // Se aprueba con 70% o más

        // Guardar o actualizar el progreso del usuario
        const queryProgreso = `
            INSERT INTO progreso_educativo (usuario_id, curso_id, calificacion, completado) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE calificacion = ?, completado = ?
        `;
        
        await pool.query(queryProgreso, [
            usuario_id, curso_id, calificacionFinal, completado,
            calificacionFinal, completado
        ]);

        res.status(200).json({
            mensaje: completado ? "¡Quiz aprobado!" : "Quiz no aprobado, intenta de nuevo.",
            calificacion: calificacionFinal,
            aprobado: completado
        });

    } catch (error) {
        console.error("Error al evaluar el quiz:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};
