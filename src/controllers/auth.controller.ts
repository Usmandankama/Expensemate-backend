import { AuthService } from '../services/auth_service';

export class AuthController {
  static async register({ body, set }: any) {
    const { email, password } = body;

    try {
      const result = await AuthService.registerUser(email, password);
      set.status = 201;
      return { message: 'Registration successful', data: result };
    } catch (error: any) {
      if (error.message === 'User already exists') {
        set.status = 409;
        return { error: error.message };
      }
      set.status = 500;
      return { error: 'Internal server error' };
    }
  }

  static async login({ body, set }: any) {
    const { email, password } = body;

    try {
      const result = await AuthService.loginUser(email, password);
      set.status = 200;
      return { message: 'Login successful', data: result };
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        set.status = 401;
        return { error: error.message };
      }
      set.status = 500;
      return { error: 'Internal server error' };
    }
  }
}