import { Elysia, t } from 'elysia';
import { AuthController } from '../controllers/auth.controller';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/register', AuthController.register, {
    // Elysia has built-in strict validation (like Zod)
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
    })
  })
  .post('/login', AuthController.login, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String(),
    })
  });