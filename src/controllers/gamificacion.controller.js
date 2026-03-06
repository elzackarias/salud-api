import pool from '../config/db.js';

/**
 * GET /api/gamificacion/retos/:usuario_id
 * Devuelve todos los retos con el estado actual del usuario.
 */
export const obtenerRetosActivos = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [retos] = await pool.query(
            `SELECT r.id, r.descripcion, r.meta_pasos, r.puntos_recompensa,
                    IFNULL(pr.estado, 'No Iniciado') as estado_usuario,
                    pr.fecha_inicio
             FROM retos r
             LEFT JOIN progreso_retos pr ON r.id = pr.reto_id AND pr.usuario_id = ?
             ORDER BY r.id`,
            [usuario_id]
        );

        res.status(200).json({ retos });
    } catch (error) {
        console.error("Error al obtener retos:", error);
        res.status(500).json({ error: "Error al obtener retos." });
    }
};

/**
 * POST /api/gamificacion/retos/iniciar
 * Registra que el usuario comenzó un reto.
 * Body: { reto_id }
 */
export const iniciarReto = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { reto_id } = req.body;

        if (!reto_id) {
            return res.status(400).json({ error: "Falta el reto_id." });
        }

        // Verificar que el reto exista
        const [retos] = await pool.query('SELECT * FROM retos WHERE id = ?', [reto_id]);
        if (retos.length === 0) {
            return res.status(404).json({ error: "Reto no encontrado." });
        }

        // Verificar si ya lo tiene en progreso
        const [existente] = await pool.query(
            'SELECT * FROM progreso_retos WHERE usuario_id = ? AND reto_id = ?',
            [usuario_id, reto_id]
        );

        if (existente.length > 0) {
            return res.status(400).json({
                error: `El reto ya se encuentra en estado: ${existente[0].estado}`
            });
        }

        await pool.query(
            `INSERT INTO progreso_retos (usuario_id, reto_id, estado) VALUES (?, ?, 'Activo')`,
            [usuario_id, reto_id]
        );

        res.status(201).json({ mensaje: "Reto iniciado con éxito. ¡Tú puedes!" });
    } catch (error) {
        console.error("Error al iniciar reto:", error);
        res.status(500).json({ error: "Error al iniciar reto." });
    }
};

/**
 * PUT /api/gamificacion/retos/completar
 * Marca un reto como completado y otorga la insignia correspondiente si aplica.
 * Body: { reto_id }
 */
export const completarReto = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const { reto_id } = req.body;

        if (!reto_id) {
            return res.status(400).json({ error: "Falta el reto_id." });
        }

        // Verificar que el reto esté activo para este usuario
        const [progreso] = await pool.query(
            `SELECT * FROM progreso_retos WHERE usuario_id = ? AND reto_id = ?`,
            [usuario_id, reto_id]
        );

        if (progreso.length === 0) {
            return res.status(404).json({ error: "No has iniciado este reto todavía." });
        }
        if (progreso[0].estado === 'Completado') {
            return res.status(400).json({ error: "Este reto ya fue completado." });
        }

        // Marcar como completado
        await pool.query(
            `UPDATE progreso_retos SET estado = 'Completado' WHERE usuario_id = ? AND reto_id = ?`,
            [usuario_id, reto_id]
        );

        // Contar retos completados para otorgar insignias automáticamente
        const [retosCompletados] = await pool.query(
            `SELECT COUNT(*) as total FROM progreso_retos WHERE usuario_id = ? AND estado = 'Completado'`,
            [usuario_id]
        );
        const total = retosCompletados[0].total;

        // Lógica de insignias automáticas basada en el PDF:
        // Reto 1 (pasos) → Agente Metabólico (id=3)
        // Reto 2 (rediseño espacio) → Diseñador Preventivo (id=2)
        // Completar ambos → Arquitecto Bioactivo (id=1)
        const insigniasOtorgadas = [];

        if (reto_id === 1) {
            await pool.query(
                'INSERT IGNORE INTO usuario_insignias (usuario_id, insignia_id) VALUES (?, 3)',
                [usuario_id]
            );
            insigniasOtorgadas.push('Agente Metabólico');
        }
        if (reto_id === 2) {
            await pool.query(
                'INSERT IGNORE INTO usuario_insignias (usuario_id, insignia_id) VALUES (?, 2)',
                [usuario_id]
            );
            insigniasOtorgadas.push('Diseñador Preventivo');
        }
        if (total >= 2) {
            await pool.query(
                'INSERT IGNORE INTO usuario_insignias (usuario_id, insignia_id) VALUES (?, 1)',
                [usuario_id]
            );
            insigniasOtorgadas.push('Arquitecto Bioactivo');
        }

        // Obtener los puntos del reto
        const [reto] = await pool.query('SELECT puntos_recompensa FROM retos WHERE id = ?', [reto_id]);

        res.status(200).json({
            mensaje: "¡Reto completado! 🎉",
            puntos_ganados: reto[0].puntos_recompensa,
            insignias_desbloqueadas: insigniasOtorgadas.length > 0 ? insigniasOtorgadas : null
        });
    } catch (error) {
        console.error("Error al completar reto:", error);
        res.status(500).json({ error: "Error al completar reto." });
    }
};

/**
 * POST /api/gamificacion/insignias
 * Otorga una insignia manualmente a un usuario (admin o lógica especial).
 * Body: { usuario_id, insignia_id }
 */
export const otorgarInsignia = async (req, res) => {
    try {
        const { usuario_id, insignia_id } = req.body;

        if (!usuario_id || !insignia_id) {
            return res.status(400).json({ error: "Faltan datos: usuario_id e insignia_id son requeridos." });
        }

        await pool.query(
            'INSERT IGNORE INTO usuario_insignias (usuario_id, insignia_id) VALUES (?, ?)',
            [usuario_id, insignia_id]
        );

        res.status(200).json({ mensaje: "Insignia otorgada con éxito." });
    } catch (error) {
        console.error("Error al otorgar insignia:", error);
        res.status(500).json({ error: "Error al otorgar insignia." });
    }
};

/**
 * GET /api/gamificacion/insignias/:usuario_id
 * Devuelve todas las insignias de un usuario.
 */
export const obtenerInsigniasUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const [insignias] = await pool.query(
            `SELECT i.id, i.nombre, i.descripcion, i.icono_url, ui.fecha_obtenida
             FROM usuario_insignias ui
             JOIN insignias i ON ui.insignia_id = i.id
             WHERE ui.usuario_id = ?
             ORDER BY ui.fecha_obtenida DESC`,
            [usuario_id]
        );

        res.status(200).json({ insignias });
    } catch (error) {
        console.error("Error al obtener insignias:", error);
        res.status(500).json({ error: "Error al obtener insignias." });
    }
};