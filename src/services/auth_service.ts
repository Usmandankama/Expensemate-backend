import User from '../models/user.model';
import * as jwt from 'jsonwebtoken';

// In a production environment, ensure JWT_SECRET is heavily randomized 
// and injected strictly via process.env
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';
const JWT_EXPIRES_IN = '15m'; // Short-lived access to minimize replay attack windows
const REFRESH_EXPIRES_IN = '7d'; // Long-lived session recovery

export class AuthService {
  /**
   * Hashes a raw password using Bun's native, highly optimized Argon2 implementation.
   * Argon2id is the current cryptographic gold standard, providing maximum 
   * resistance against GPU-based cracking and side-channel attacks.
   */
  static async hashPassword(password: string): Promise<string> {
    return await Bun.password.hash(password, {
      algorithm: "argon2id",
      memoryCost: 65536, // 64MB memory cost
      timeCost: 3,       // 3 linear iterations
    });
  }

  /**
   * Verifies a raw password against the stored Argon2id hash.
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(password, hash);
  }

  /**
   * Generates a short-lived JWT Access Token for API authorization.
   */
  static generateAccessToken(userId: string): string {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Generates a long-lived Refresh Token for obtaining new Access Tokens 
   * once the short-lived token expires.
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
  }

  /**
   * Orchestrates the user registration flow.
   * Enforces uniqueness and delegates hashing/token generation.
   */
  static async registerUser(email: string, rawPassword: string) {
    // 1. Enforce unique email constraint at the application level
    // (Ensure your MySQL database also has a UNIQUE constraint on the email column)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // 2. Hash the password securely via Bun
    const passwordHash = await this.hashPassword(rawPassword);

    // 3. Persist the new user via Sequelize
    const newUser = await User.create({
      email,
      passwordHash,
    });

    // 4. Generate the stateless authentication tokens
    const accessToken = this.generateAccessToken(newUser.id);
    const refreshToken = this.generateRefreshToken(newUser.id);

    return {
      user: { id: newUser.id, email: newUser.email },
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Orchestrates the user login flow.
   * Validates identity and issues fresh tokens for the session.
   */
  static async loginUser(email: string, rawPassword: string) {
    // 1. Retrieve the user record
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Cryptographically verify the password
    const isPasswordValid = await this.verifyPassword(rawPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // 3. Issue fresh tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    return {
      user: { id: user.id, email: user.email },
      tokens: { accessToken, refreshToken },
    };
  }
}