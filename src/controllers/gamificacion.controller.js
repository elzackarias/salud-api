import pool from '../config/db.js';

// Obtener retos disponibles para el usuario
export const obtenerRetosActivos = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        
        // Traemos los retos y vemos si el usuario ya los tiene en progreso
        const query = `
            SELECT r.id, r.descripcion, r.meta_pasos, r.puntos_recompensa, IFNULL(pr.estado, 'No Iniciado') as estado_usuario
            FROM retos r
            LEFT JOIN progreso_retos pr ON r.id = pr.reto_id AND pr.usuario_id = ?
        `;
        const [retos] = await pool.query(query, [usuario_id]);
        res.status(200).json({ retos });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener retos." });
    }
};

// Registrar que un usuario completó un reto o ganó una insignia
export const otorgarInsignia = async (req, res) => {
    try {
        const { usuario_id, insignia_id } = req.body;

        await pool.query(
            'INSERT IGNORE INTO usuario_insignias (usuario_id, insignia_id) VALUES (?, ?)',
            [usuario_id, insignia_id]
        );
        res.status(200).json({ mensaje: "Insignia otorgada/actualizada con éxito." });
    } catch (error) {
        res.status(500).json({ error: "Error al otorgar insignia." });
    }
};

// Obtener las insignias de un usuario
export const obtenerInsigniasUsuario = async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const query = `
            SELECT i.nombre, i.descripcion, ui.fecha_obtenida 
            FROM usuario_insignias ui
            JOIN insignias i ON ui.insignia_id = i.id
            WHERE ui.usuario_id = ?
        `;
        const [insignias] = await pool.query(query, [usuario_id]);
        res.status(200).json({ insignias });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener insignias." });
    }
};
