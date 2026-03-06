import pool from '../config/db.js';

/**
 * GET /api/usuarios/perfil/:usuario_id
 * Devuelve el perfil completo del usuario.
 */
export const obtenerPerfil = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        if (parseInt(req.usuario.id) !== parseInt(usuario_id)) {
            return res.status(403).json({ error: "No tienes permiso para ver este perfil." });
        }

        const [usuarios] = await pool.query(
            `SELECT id, nombre, apellidos, email, fecha_registro FROM usuarios WHERE id = ?`,
            [usuario_id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.status(200).json({ usuario: usuarios[0] });
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};

/**
 * GET /api/usuarios/dashboard/:usuario_id
 * Endpoint de dashboard: retorna en una sola llamada el perfil metabólico
 * completo del usuario (último IARRI + retos + insignias + progreso educativo).
 * Diseñado para la pantalla principal de la app móvil.
 */
export const obtenerDashboard = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        if (parseInt(req.usuario.id) !== parseInt(usuario_id)) {
            return res.status(403).json({ error: "No tienes permiso para ver este dashboard." });
        }

        // 1. Datos básicos del usuario
        const [usuarios] = await pool.query(
            `SELECT id, nombre, apellidos, email, fecha_registro FROM usuarios WHERE id = ?`,
            [usuario_id]
        );
        if (usuarios.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // 2. Último cálculo IARRI
        const [ultimoIarri] = await pool.query(
            `SELECT h.iarri_score, h.nivel_riesgo, h.fecha_calculo, z.municipio
             FROM historial_iarri h
             JOIN zonas_territoriales z ON h.zona_id = z.id
             WHERE h.usuario_id = ?
             ORDER BY h.fecha_calculo DESC
             LIMIT 1`,
            [usuario_id]
        );

        // 3. Retos activos/completados del usuario
        const [retos] = await pool.query(
            `SELECT r.descripcion, r.meta_pasos, r.puntos_recompensa, 
                    IFNULL(pr.estado, 'No Iniciado') as estado
             FROM retos r
             LEFT JOIN progreso_retos pr ON r.id = pr.reto_id AND pr.usuario_id = ?`,
            [usuario_id]
        );

        // 4. Insignias obtenidas
        const [insignias] = await pool.query(
            `SELECT i.nombre, i.descripcion, i.icono_url, ui.fecha_obtenida
             FROM usuario_insignias ui
             JOIN insignias i ON ui.insignia_id = i.id
             WHERE ui.usuario_id = ?`,
            [usuario_id]
        );

        // 5. Progreso educativo
        const [progreso] = await pool.query(
            `SELECT m.titulo, pe.calificacion, pe.completado, pe.fecha_evaluacion
             FROM progreso_educativo pe
             JOIN microcursos m ON pe.curso_id = m.id
             WHERE pe.usuario_id = ?`,
            [usuario_id]
        );

        // 6. Resumen de puntos (suma de recompensas de retos completados)
        const [puntos] = await pool.query(
            `SELECT IFNULL(SUM(r.puntos_recompensa), 0) as total_puntos
             FROM progreso_retos pr
             JOIN retos r ON pr.reto_id = r.id
             WHERE pr.usuario_id = ? AND pr.estado = 'Completado'`,
            [usuario_id]
        );

        // 7. Recomendaciones personalizadas según el nivel de riesgo actual
        const nivelRiesgo = ultimoIarri.length > 0 ? ultimoIarri[0].nivel_riesgo : null;
        let recomendaciones = [];

        if (nivelRiesgo) {
            const todasRecomendaciones = [
                { tipo: "Conductual", accion: "Crear ruta peatonal diaria", aplica: ['Medio', 'Alto'] },
                { tipo: "Arquitectónico", accion: "Rediseño de patio o vivienda", aplica: ['Alto'] },
                { tipo: "Arquitectónico", accion: "Mejorar ventilación y luz natural", aplica: ['Bajo', 'Medio', 'Alto'] },
                { tipo: "Arquitectónico", accion: "Instalar microhuerto urbano", aplica: ['Medio', 'Alto'] },
                { tipo: "Arquitectónico", accion: "Visibilizar escaleras como opción activa", aplica: ['Bajo', 'Medio'] }
            ];
            recomendaciones = todasRecomendaciones.filter(r => r.aplica.includes(nivelRiesgo));
        }

        res.status(200).json({
            usuario: usuarios[0],
            perfil_metabolico: {
                ultimo_iarri: ultimoIarri.length > 0 ? ultimoIarri[0] : null,
                total_puntos: puntos[0].total_puntos
            },
            retos,
            insignias,
            progreso_educativo: progreso,
            recomendaciones
        });
    } catch (error) {
        console.error("Error al obtener dashboard:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
};