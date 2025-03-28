import { IncomingMessage, ServerResponse } from "http";
import {
  addRevokeToken,
  authSchema,
  createUser,
  findUserByEmail,
  HttpMethods,
  revokeUserToken,
  validatePassword,
} from "../models";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";
import { sign } from "jsonwebtoken";
import config from "../config";
import type { AuthenticatedRequest } from "../middleware/authentication";


/**
 * Handles authentication routes for user registration, login, and logout.
 * 
 * @param {IncomingMessage} req - The HTTP request object
 * @param {ServerResponse} res - The HTTP response object
 * 
 * @description
 * This router handles three authentication endpoints:
 * - POST /auth/register: Creates a new user account
 * - POST /auth/login: Authenticates a user and issues access/refresh tokens
 * - POST /auth/logout: Invalidates tokens and logs out the user
 * 
 * If no route matches, returns a 404 Not Found response.
 */
export const authRouter = async (req: IncomingMessage, res: ServerResponse) => {
  const { method, url } = req;
  if (url === "auth/register" && method === HttpMethods.POST) {
    const body = await parseBody(req);
    const result = safeParse(authSchema, body);
    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Bad r¿Request" }));
      return;
    }

    const { email, password } = body;

    try {
      const user = await createUser(email, password);
      res.statusCode = 201;
      res.end(JSON.stringify(user));
    } catch (error) {
      if (error instanceof Error) {
        res.end(JSON.stringify({ message: error.message }));
      } else {
        res.end(JSON.stringify({ message: "Internal Server Error" }));
      }
    }
  }

  if (url === "auth/login" && method === HttpMethods.POST) {
    const body = await parseBody(req);
    const result = safeParse(authSchema, body);
    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: "Bad Request" }));
      return;
    }

    const { email, password } = body;
    const user = findUserByEmail(email);

    if (!user || !(await validatePassword(user, password))) {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "Invalid credentials" }));
      return;
    }

    const accessToken = sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      config.jwtsecret,
      { expiresIn: "1h" }
    );

    const refreshToken = sign(
      {
        id: user.id,
      },
      config.jwtsecret,
      { expiresIn: "1d" }
    );

    user.refreshToken = refreshToken;

    res.end(JSON.stringify({ accessToken, refreshToken }));
    return;
  }

  if (url === "auth/logout" && method === HttpMethods.POST) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      addRevokeToken(token);

      const formatedReq = req as AuthenticatedRequest;
      if (
        formatedReq.user &&
        typeof formatedReq.user === "object" &&
        "id" in formatedReq.user
      ) {
        const result = revokeUserToken(formatedReq.user.email);
        if (!result) {
          res.statusCode = 403;
          res.end(JSON.stringify({ message: "Forbidden" }));
        }
      }
      res.end(JSON.stringify({ message: "Logged out" }));
    }

  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Not Found" }));
};
