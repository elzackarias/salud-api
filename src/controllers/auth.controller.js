import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, apellidos, email, password } = req.body;
        if (!nombre || !apellidos || !email || !password) return res.status(400).json({ error: "Faltan campos." });

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, apellidos, email, password_hash) VALUES (?, ?, ?, ?)',
            [nombre, apellidos, email, passwordHash]
        );

        res.status(201).json({ mensaje: "Usuario registrado con éxito.", usuario_id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "El email ya está registrado." });
        res.status(500).json({ error: "Error interno." });
    }
};

export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [usuarios] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (usuarios.length === 0) return res.status(404).json({ error: "Usuario no encontrado." });

        const usuario = usuarios[0];
        const passValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passValida) return res.status(401).json({ error: "Contraseña incorrecta." });

        // Generar Token JWT
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ mensaje: "Login exitoso", token, usuario: { id: usuario.id, nombre: usuario.nombre, apellidos: usuario.apellidos } });
    } catch (error) {
        res.status(500).json({ error: "Error interno." });
    }
};
