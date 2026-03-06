import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import metabolismoRoutes from './routes/metabolismo.routes.js';
import educacionRoutes from './routes/educacion.routes.js';
import gamificacionRoutes from './routes/gamificacion.routes.js';
import recomendacionesRoutes from './routes/recomendaciones.routes.js';
import zonasRoutes from './routes/zonas.routes.js';
import usuariosRoutes from './routes/usuarios.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────────
//  Rutas públicas
// ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/educacion', educacionRoutes);   // GET cursos y quiz son públicos
app.use('/api/zonas', zonasRoutes);            // GET zonas son públicas

// ──────────────────────────────────────────
//  Rutas protegidas (requieren JWT)
// ──────────────────────────────────────────
app.use('/api/iarri', metabolismoRoutes);
app.use('/api/gamificacion', gamificacionRoutes);
app.use('/api/recomendaciones', recomendacionesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// ──────────────────────────────────────────
//  Health check
// ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        mensaje: '🚀 API ARQ-Salud Metabólica MX operando correctamente',
        version: '1.0.0'
    });
});

// ──────────────────────────────────────────
//  Manejo de rutas no encontradas (404)
// ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada." });
});

// ──────────────────────────────────────────
//  Manejo global de errores (500)
// ──────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("Error no manejado:", err);
    res.status(500).json({ error: "Error interno del servidor." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API ARQ-Salud Metabólica MX corriendo en el puerto ${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   POST   /api/auth/registro`);
    console.log(`   POST   /api/auth/login`);
    console.log(`   GET    /api/zonas`);
    console.log(`   GET    /api/zonas/:zona_id`);
    console.log(`   GET    /api/zonas/historial/:usuario_id  [JWT]`);
    console.log(`   POST   /api/iarri/calcular               [JWT]`);
    console.log(`   GET    /api/educacion/cursos`);
    console.log(`   GET    /api/educacion/cursos/:id/quiz`);
    console.log(`   POST   /api/educacion/evaluar            [JWT]`);
    console.log(`   GET    /api/gamificacion/retos/:uid`);
    console.log(`   POST   /api/gamificacion/retos/iniciar   [JWT]`);
    console.log(`   PUT    /api/gamificacion/retos/completar [JWT]`);
    console.log(`   GET    /api/gamificacion/insignias/:uid`);
    console.log(`   POST   /api/gamificacion/insignias       [JWT]`);
    console.log(`   GET    /api/recomendaciones/:uid         [JWT]`);
    console.log(`   GET    /api/usuarios/perfil/:uid         [JWT]`);
    console.log(`   GET    /api/usuarios/dashboard/:uid      [JWT]`);
    console.log(`   GET    /api/health`);
});