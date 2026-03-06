import pool from '../config/db.js';

/**
 * GET /api/zonas
 * Devuelve todas las zonas territoriales registradas.
 * Incluye el cálculo IARRI simulado con los datos almacenados.
 */
export const obtenerZonas = async (req, res) => {
    try {
        const [zonas] = await pool.query(
            `SELECT id, municipio, av, ic, ed, ear, im, fecha_actualizacion FROM zonas_territoriales ORDER BY municipio`
        );

        // Calcular el IARRI de cada zona con las ponderaciones del modelo
        const ALPHA = 0.20, BETA = 0.25, GAMMA = 0.15, DELTA = 0.25, EPSILON = 0.15;

        const zonasConIarri = zonas.map(z => {
            const iarri = parseFloat((
                ALPHA * (1 - z.av) +
                BETA * (1 - z.ic) +
                GAMMA * (1 - z.ed) +
                DELTA * z.ear +
                EPSILON * z.im
            ).toFixed(4));

            let nivel_riesgo;
            if (iarri <= 0.33) nivel_riesgo = 'Bajo';
            else if (iarri <= 0.66) nivel_riesgo = 'Medio';
            else nivel_riesgo = 'Alto';

            return { ...z, iarri_calculado: iarri, nivel_riesgo };
        });

        res.status(200).json({ datos: zonasConIarri });
    } catch (error) {
        console.error("Error al obtener zonas:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * GET /api/zonas/:zona_id
 * Devuelve el detalle de una zona específica con su perfil metabólico ambiental.
 */
export const obtenerZonaPorId = async (req, res) => {
    try {
        const { zona_id } = req.params;
        const [zonas] = await pool.query(
            `SELECT * FROM zonas_territoriales WHERE id = ?`, [zona_id]
        );

        if (zonas.length === 0) {
            return res.status(404).json({ error: "Zona no encontrada." });
        }

        const z = zonas[0];
        const ALPHA = 0.20, BETA = 0.25, GAMMA = 0.15, DELTA = 0.25, EPSILON = 0.15;

        const iarri = parseFloat((
            ALPHA * (1 - z.av) +
            BETA * (1 - z.ic) +
            GAMMA * (1 - z.ed) +
            DELTA * z.ear +
            EPSILON * z.im
        ).toFixed(4));

        let nivel_riesgo;
        if (iarri <= 0.33) nivel_riesgo = 'Bajo';
        else if (iarri <= 0.66) nivel_riesgo = 'Medio';
        else nivel_riesgo = 'Alto';

        // Generar interpretación narrativa de cada variable
        const perfil = {
            ...z,
            iarri_calculado: iarri,
            nivel_riesgo,
            interpretacion: {
                av: z.av >= 0.7 ? "Bueno: acceso adecuado a áreas verdes" : z.av >= 0.4 ? "Regular: acceso limitado a áreas verdes" : "Crítico: sin acceso a áreas verdes",
                ic: z.ic >= 0.7 ? "Bueno: entorno altamente caminable" : z.ic >= 0.4 ? "Regular: caminabilidad moderada" : "Crítico: entorno poco peatonal",
                ed: z.ed >= 0.7 ? "Bueno: equipamiento deportivo suficiente" : z.ed >= 0.4 ? "Regular: equipamiento limitado" : "Crítico: carencia de espacios deportivos",
                ear: z.ear <= 0.3 ? "Bueno: entorno alimentario saludable" : z.ear <= 0.6 ? "Regular: presencia moderada de ultraprocesados" : "Crítico: alta densidad de alimentos ultraprocesados",
                im: z.im <= 0.3 ? "Bueno: baja marginación socioespacial" : z.im <= 0.6 ? "Regular: marginación moderada" : "Crítico: alta marginación"
            }
        };

        res.status(200).json({ datos: perfil });
    } catch (error) {
        console.error("Error al obtener zona:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * GET /api/zonas/historial/:usuario_id
 * Devuelve el historial de cálculos IARRI de un usuario.
 */
export const obtenerHistorialIarri = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // Verificar que el usuario que consulta sea el mismo autenticado
        if (parseInt(req.usuario.id) !== parseInt(usuario_id)) {
            return res.status(403).json({ error: "No tienes permiso para ver este historial." });
        }

        const [historial] = await pool.query(
            `SELECT h.id, h.iarri_score, h.nivel_riesgo, h.fecha_calculo, 
                    z.municipio
             FROM historial_iarri h
             JOIN zonas_territoriales z ON h.zona_id = z.id
             WHERE h.usuario_id = ?
             ORDER BY h.fecha_calculo DESC
             LIMIT 20`,
            [usuario_id]
        );

        res.status(200).json({ historial });
    } catch (error) {
        console.error("Error al obtener historial:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};