import { IncomingMessage, ServerResponse } from "http";
import { verify, type JwtPayload } from "jsonwebtoken";
import { isTokenRevoked } from "../models";
import config from "../config";

/**
 * Extends the standard IncomingMessage interface to include user information
 * from a JWT token after successful authentication.
 * 
 * @interface AuthenticatedRequest
 * @extends {IncomingMessage}
 */
export interface AuthenticatedRequest extends IncomingMessage {
  /**
   * The decoded JWT payload containing user information.
   * Set after successful token verification.
   */
  user?: JwtPayload | string;
}

/**
 * Middleware to authenticate requests using JWT tokens.
 * 
 * @param {AuthenticatedRequest} req - The HTTP request object
 * @param {ServerResponse} res - The HTTP response object
 * @returns {Promise<boolean>} True if authentication is successful, false otherwise
 * 
 * @description
 * This middleware:
 * 1. Extracts the JWT token from the Authorization header
 * 2. Verifies the token exists (returns 401 if missing)
 * 3. Checks if the token has been revoked (returns 403 if revoked)
 * 4. Validates the token signature (returns 403 if invalid)
 * 5. Attaches the decoded user information to the request object
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: ServerResponse
): Promise<boolean> => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(!token) {
        res.statusCode = 401;
        res.end(JSON.stringify({ message: "Unauthorized" }));
        return false;
    }

    if(isTokenRevoked(token)){
        res.statusCode = 403;
        res.end(JSON.stringify({ message: "Forbidden" }));
        return false;
    }

    try {
        const decoded = verify(token, config.jwtsecret)
        req.user = decoded;
        return true;
    } catch (_err) {
        res.statusCode = 403;
        res.end(JSON.stringify({ message: "Forbidden" }));
        return false;
    }
};
