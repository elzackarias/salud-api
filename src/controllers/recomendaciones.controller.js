import pool from '../config/db.js';

export const obtenerRecomendaciones = async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // 1. Obtener el último cálculo de riesgo del usuario
        const [historial] = await pool.query(
            'SELECT nivel_riesgo FROM historial_iarri WHERE usuario_id = ? ORDER BY fecha_calculo DESC LIMIT 1',
            [usuario_id]
        );

        let riesgo = historial.length > 0 ? historial[0].nivel_riesgo : 'Medio'; // Por defecto

        // 2. Base de recomendaciones según PDF de Arquitectura Preventiva
        const recomendaciones = [
            { tipo: "Conductual", accion: "Crear ruta peatonal diaria", aplica_riesgo: ['Medio', 'Alto'] },
            { tipo: "Arquitectónico", accion: "Rediseño de patio o vivienda", aplica_riesgo: ['Alto'] },
            { tipo: "Arquitectónico", accion: "Ventilación y luz natural", aplica_riesgo: ['Bajo', 'Medio', 'Alto'] },
            { tipo: "Arquitectónico", accion: "Microhuertos urbanos", aplica_riesgo: ['Medio', 'Alto'] },
            { tipo: "Arquitectónico", accion: "Espacios activos (escaleras visibles)", aplica_riesgo: ['Bajo', 'Medio'] }
        ];

        // 3. Filtrar según el riesgo del usuario
        const recomendacionesPersonalizadas = recomendaciones.filter(r => r.aplica_riesgo.includes(riesgo));

        res.status(200).json({ nivel_riesgo_actual: riesgo, recomendaciones: recomendacionesPersonalizadas });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener recomendaciones." });
    }
};
