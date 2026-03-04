import pool from '../config/db.js';

// Ponderaciones iniciales del modelo matemático
const ALPHA = 0.20;
const BETA = 0.25;
const GAMMA = 0.15;
const DELTA = 0.25;
const EPSILON = 0.15;

export const calcularRiesgoIarri = async (req, res) => {
    try {
        const { usuario_id, zona_id, av, ic, ed, ear, im } = req.body;

        // Validación básica
        if (!usuario_id || !zona_id || [av, ic, ed, ear, im].some(v => v === undefined)) {
            return res.status(400).json({ error: "Faltan datos requeridos." });
        }

        if ([av, ic, ed, ear, im].some(val => val < 0 || val > 1)) {
            return res.status(400).json({ error: "Las variables deben estar normalizadas entre 0 y 1." });
        }

        // Cálculo del IARRI
        const iarriScore = 
            (ALPHA * (1 - av)) + 
            (BETA * (1 - ic)) + 
            (GAMMA * (1 - ed)) + 
            (DELTA * ear) + 
            (EPSILON * im);

        // Clasificación del Riesgo (Bajo, Medio, Alto)
        let nivelRiesgo = '';
        if (iarriScore >= 0 && iarriScore <= 0.33) {
            nivelRiesgo = 'Bajo';
        } else if (iarriScore > 0.33 && iarriScore <= 0.66) {
            nivelRiesgo = 'Medio';
        } else {
            nivelRiesgo = 'Alto';
        }

        // Guardar en la base de datos
        const query = `
            INSERT INTO historial_iarri (usuario_id, zona_id, iarri_score, nivel_riesgo) 
            VALUES (?, ?, ?, ?)
        `;
        
        await pool.query(query, [usuario_id, zona_id, iarriScore.toFixed(4), nivelRiesgo]);

        res.status(200).json({
            mensaje: "Cálculo completado con éxito.",
            datos: {
                iarri_score: parseFloat(iarriScore.toFixed(4)),
                nivel_riesgo: nivelRiesgo
            }
        });

    } catch (error) {
        console.error("Error al calcular el IARRI:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};
