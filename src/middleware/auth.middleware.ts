// import * as jwt from 'jsonwebtoken';

// const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback-key';

// export class AuthMiddleware {
//   /**
//    * Parses the Authorization header, verifies the JWT, and extracts the User ID.
//    * Throws strictly typed errors that your routing layer can catch and convert 
//    * into 401 Unauthorized responses.
//    * * @param authHeader The raw 'Authorization' header string from the request
//    * @returns The authenticated userId (sub)
//    */
//   static verifyToken(authHeader?: string | null): string {
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new Error('MISSING_TOKEN');
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//       // Verify the signature and expiration
//     //   const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      
//       // Return the User ID so the controller knows whose expenses to modify
//       return decoded.sub; 
//     } catch (error: any) {
//       if (error.name === 'TokenExpiredError') {
//         throw new Error('TOKEN_EXPIRED');
//       }
//       throw new Error('INVALID_TOKEN');
//     }
//   }
// }