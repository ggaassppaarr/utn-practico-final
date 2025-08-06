import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

let data = []; // Simula una base de datos en memoria

// Cargar CSV
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    const content = req.file.buffer.toString();
    data = parse(content, { columns: true, skip_empty_lines: true });
    res.json({ message: 'Datos cargados', data });
  } catch (err) {
    res.status(400).json({ error: 'Error al procesar el archivo CSV' });
  }
});

// Obtener datos
app.get('/data', (req, res) => {
  res.json(data);
});

// Crear nuevo registro
app.post('/data', (req, res) => {
  data.push(req.body);
  res.json({ message: 'Registro agregado', data });
});

// Actualizar registro
app.put('/data/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < data.length) {
    data[index] = req.body;
    res.json({ message: 'Registro actualizado', data });
  } else {
    res.status(404).json({ error: 'Índice no encontrado' });
  }
});

// Eliminar registro
app.delete('/data/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < data.length) {
    data.splice(index, 1);
    res.json({ message: 'Registro eliminado', data });
  } else {
    res.status(404).json({ error: 'Índice no encontrado' });
  }
});

// Descargar CSV
app.get('/export', (req, res) => {
  const csv = stringify(data, { header: true });
  const filePath = join(__dirname, 'export.csv');
  fs.writeFileSync(filePath, csv);
  res.download(filePath);
});

app.listen(PORT, () => console.log(`Servidor backend en http://localhost:${PORT}`));
