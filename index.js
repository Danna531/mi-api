const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crea la tabla si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL
  )
`).then(() => console.log('Tabla lista'))
  .catch(err => console.error('Error creando tabla:', err));

app.get('/', (req, res) => res.send('API funcionando'));

// Listar
app.get('/tareas', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tareas ORDER BY id');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Crear
app.post('/tareas', async (req, res) => {
  try {
    const { titulo } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO tareas (titulo) VALUES ($1) RETURNING *',
      [titulo]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Borrar
app.delete('/tareas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tareas WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Servidor en puerto ' + PORT));
