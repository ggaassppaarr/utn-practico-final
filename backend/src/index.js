import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import multer from 'multer'
import { parse } from 'csv-parse'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authRoutes from '../routes/auth.js'

const app = express()
const prisma = new PrismaClient()
const upload = multer({ storage: multer.memoryStorage() })

const PORT = process.env.PORT || 3001
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(helmet())
app.use(cors({ origin: ORIGIN, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
app.use('/auth', authRoutes)

// --- Auth (basic) ---
app.post('/auth/register', async (req, res) => {
  const { email, password, role = 'ADMIN' } = req.body
  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { email, password: hashed, role } })
  res.json({ id: user.id, email: user.email, role: user.role })
})

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } })
})

// Helpers
async function getLatestFile() {
  const file = await prisma.file.findFirst({ orderBy: { createdAt: 'desc' } })
  return file
}
function inferType(values) {
  const sample = values.slice(0, Math.min(50, values.length))
  const asNumber = sample.length > 0 && sample.every(v => v !== '' && !isNaN(Number(v)))
  if (asNumber) return 'number'
  const asBool =
    sample.length > 0 &&
    sample.every(v => ['true', 'false', '1', '0'].includes(String(v).toLowerCase()))
  if (asBool) return 'boolean'
  const asDate = sample.length > 0 && sample.every(v => !isNaN(Date.parse(v)))
  if (asDate) return 'date'
  return 'string'
}
function isEmptyRow(obj) {
  if (!obj || typeof obj !== 'object') return true
  const keys = Object.keys(obj)
  if (keys.length === 0) return true
  return keys.every(k => obj[k] === '' || obj[k] === null || obj[k] === undefined)
}

// --- Upload CSV (keeps frontend route) ---
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' })
    const text = req.file.buffer.toString('utf8')
    const records = []
    const parser = parse(text, { columns: true, trim: true, skip_empty_lines: true })
    for await (const rec of parser) records.push(rec)

    if (records.length === 0) return res.status(400).json({ error: 'CSV vacío o sin cabecera' })
    const headers = Object.keys(records[0])
    const columns = headers.map(h => {
      const values = records.map(r => r[h]).filter(v => v !== undefined)
      return { name: h, type: inferType(values), required: false }
    })

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname.replace(/\.csv$/i, ''),
        columns: JSON.stringify(columns),
        rowCount: records.length
      }
    })

    const batch = records.map(r => ({ fileId: file.id, data: JSON.stringify(r) }))
    while (batch.length) {
      const chunk = batch.splice(0, 500)
      await prisma.row.createMany({ data: chunk })
    }
    res.json({ ok: true, fileId: file.id })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Upload failed' })
  }
})

// --- Data endpoints compatible with existing frontend ---

// GET /data -> return rows of latest file
app.get('/data', async (req, res) => {
  const file = await getLatestFile()
  if (!file) return res.json([])
  const rows = await prisma.row.findMany({
    where: { fileId: file.id },
    orderBy: { createdAt: 'asc' }
  })
  res.json(rows.map(r => JSON.parse(r.data)))
})

// POST /data -> append a row to latest file (or create default file)
app.post('/data', async (req, res) => {
  let file = await getLatestFile()
  const row = req.body

  // Evitar filas vacías
  if (isEmptyRow(row)) {
    return res.status(400).json({ error: 'Fila vacía: completá al menos un campo' })
  }

  if (!file) {
    const columns = Object.keys(row).map(n => ({ name: n, type: 'string', required: false }))
    file = await prisma.file.create({
      data: { name: 'dataset', columns: JSON.stringify(columns), rowCount: 0 }
    })
  }
  await prisma.row.create({ data: { fileId: file.id, data: JSON.stringify(row) } })
  await prisma.file.update({ where: { id: file.id }, data: { rowCount: { increment: 1 } } })
  res.json({ ok: true })
})

// PUT /data/:index -> update row by index (createdAt asc) con MERGE
app.put('/data/:index', async (req, res) => {
  const file = await getLatestFile()
  if (!file) return res.status(404).json({ error: 'No file' })
  const rows = await prisma.row.findMany({
    where: { fileId: file.id },
    orderBy: { createdAt: 'asc' }
  })
  const i = parseInt(req.params.index, 10)
  if (isNaN(i) || i < 0 || i >= rows.length)
    return res.status(400).json({ error: 'Index out of range' })
  const rowId = rows[i].id

  const current = JSON.parse(rows[i].data)
  const merged = { ...current, ...req.body }
  await prisma.row.update({ where: { id: rowId }, data: { data: JSON.stringify(merged) } })
  res.json({ ok: true })
})

// DELETE /data/:index -> delete row by index (createdAt asc)
app.delete('/data/:index', async (req, res) => {
  const file = await getLatestFile()
  if (!file) return res.status(404).json({ error: 'No file' })
  const rows = await prisma.row.findMany({
    where: { fileId: file.id },
    orderBy: { createdAt: 'asc' }
  })
  const i = parseInt(req.params.index, 10)
  if (isNaN(i) || i < 0 || i >= rows.length)
    return res.status(400).json({ error: 'Index out of range' })
  const rowId = rows[i].id
  await prisma.row.delete({ where: { id: rowId } })
  await prisma.file.update({ where: { id: file.id }, data: { rowCount: { decrement: 1 } } })
  res.json({ ok: true })
})

// Export latest file as CSV
app.get('/export', async (req, res) => {
  const file = await getLatestFile()
  if (!file) return res.status(404).send('No data')
  const rows = await prisma.row.findMany({
    where: { fileId: file.id },
    orderBy: { createdAt: 'asc' }
  })
  const columns = JSON.parse(file.columns)
  const header = columns.map(c => c.name).join(',')
  const lines = rows
    .map(r => {
      const d = JSON.parse(r.data)
      return columns.map(c => JSON.stringify((d || {})[c.name] ?? '')).join(',')
    })
    .join('\n')
  const csv = header + '\n' + lines
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}.csv"`)
  res.send(csv)
})

// Simple merge endpoint (advanced feature)
app.post('/merge', async (req, res) => {
  const { leftName, rightName, on = [], how = 'inner', name = 'merge' } = req.body
  const left = (await prisma.file.findFirst({ where: { name: leftName } })) || (await getLatestFile())
  const right = await prisma
    .file
    .findMany({ take: 2, orderBy: { createdAt: 'desc' } })
    .then(a => a[1])
  if (!left || !right) return res.status(400).json({ error: 'Files not found' })

  const leftRows = await prisma.row.findMany({ where: { fileId: left.id } })
  const rightRows = await prisma.row.findMany({ where: { fileId: right.id } })

  const indexRight = new Map()
  for (const r of rightRows) {
    const rdata = JSON.parse(r.data)
    const key = on.map(k => (rdata || {})[k]).join('|')
    const arr = indexRight.get(key) || []
    arr.push(rdata || {})
    indexRight.set(key, arr)
  }

  const result = []
  const rightMatched = new Set()

  for (const l of leftRows) {
    const ldata = JSON.parse(l.data)
    const key = on.map(k => (ldata || {})[k]).join('|')
    const matches = indexRight.get(key) || []
    if (matches.length) {
      for (const m of matches) {
        rightMatched.add(JSON.stringify(m))
        result.push({ ...m, ...ldata })
      }
    } else if (['left', 'outer'].includes(how)) {
      result.push({ ...ldata })
    }
  }

  if (['right', 'outer'].includes(how)) {
    for (const r of rightRows) {
      const rdata = JSON.parse(r.data)
      const s = JSON.stringify(rdata || {})
      if (!rightMatched.has(s)) result.push({ ...rdata })
    }
  }

  const columns = Array.from(new Set(result.flatMap(o => Object.keys(o)))).map(n => ({
    name: n,
    type: 'string',
    required: false
  }))
  const merged = await prisma.file.create({
    data: { name, columns: JSON.stringify(columns), rowCount: result.length }
  })
  const batch = result.map(r => ({ fileId: merged.id, data: JSON.stringify(r) }))
  while (batch.length) {
    const chunk = batch.splice(0, 500)
    await prisma.row.createMany({ data: chunk })
  }
  res.json({ ok: true, fileId: merged.id, rowCount: result.length })
})

app.get('/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`[api] http://localhost:${PORT}`))
