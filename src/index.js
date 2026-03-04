import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import metabolismoRoutes from './routes/metabolismo.routes.js';
import educacionRoutes from './routes/educacion.routes.js';
import gamificacionRoutes from './routes/gamificacion.routes.js';
import recomendacionesRoutes from './routes/recomendaciones.routes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Montar rutas
app.use('/api/auth', authRoutes);
app.use('/api/iarri', metabolismoRoutes);
app.use('/api/educacion', educacionRoutes);
app.use('/api/gamificacion', gamificacionRoutes);
app.use('/api/recomendaciones', recomendacionesRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API ARQ-Salud Metabólica corriendo al 100% en el puerto ${PORT}`);
});
