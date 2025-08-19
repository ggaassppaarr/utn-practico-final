import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
  console.log('BODY:', req.body);
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ message: 'Email requerido' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.json({ token });
});

export default router;