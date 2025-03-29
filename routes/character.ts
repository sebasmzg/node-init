import { IncomingMessage, ServerResponse } from "http";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authentication";
import {
  addCharacter,
  characterById,
  characterSchema,
  deleteCharacter,
  getAllCharacters,
  HttpMethods,
  Role,
  updateCharacter,
  type Character,
} from "../models";
import { authorizedRoles } from "../middleware/authorization";
import { parseBody } from "../utils/parseBody";
import { safeParse } from "valibot";

export const characterRouter = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  const { method, url } = req;

  if (!(await authenticateToken(req as AuthenticatedRequest, res))) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return;
  }

  if (url === "/characters" && method === HttpMethods.GET) {
    const characters = getAllCharacters();
    if (characters.length === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "No characters created" }));
      return;
    }
    if (!characters) {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "Internal Server Error" }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify(characters));
    return;
  }

  if (url?.startsWith("/characters/") && method === HttpMethods.GET) {
    const id = parseInt(url.split("/").pop() as string, 10);
    const character = characterById(id);

    if (!character) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Character not found" }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(character));
    return;
  }

  if (url === "/characters" && method === HttpMethods.POST) {
    if (
      !(await authorizedRoles(Role.ADMIN, Role.USER)(
        req as AuthenticatedRequest,
        res
      ))
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const body = await parseBody(req);
    const result = safeParse(characterSchema, body);
    if (result.issues) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: result.issues }));
      return;
    }

    const character: Character = body;

    addCharacter(character);

    res.statusCode = 201;
    res.end(JSON.stringify(character));

    return;
  }

  if (url?.startsWith("/characters/") && method === HttpMethods.PATCH) {
    if (
      !(await authorizedRoles(Role.ADMIN)(req as AuthenticatedRequest, res))
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const body = await parseBody(req);
    const id = parseInt(url.split("/").pop() as string, 10);
    const character: Character = body;
    const updatedCharacter = updateCharacter(id, character);

    if (!updatedCharacter) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Character not found" }));
      return;
    } else {
      res.statusCode = 200;
      res.end(JSON.stringify(updatedCharacter));
    }

    return;
  }

  if (url?.startsWith("/characters/") && method === HttpMethods.DELETE) {
    if (
      !(await authorizedRoles(Role.ADMIN)(req as AuthenticatedRequest, res))
    ) {
      res.statusCode = 403;
      res.end(JSON.stringify({ message: "Forbidden" }));
      return;
    }

    const id = parseInt(url.split("/").pop() as string, 10);
    const success = deleteCharacter(id);

    if (!success) {
      res.statusCode = 404;
      res.end(JSON.stringify({ message: "Character not found" }));
      return;
    } else {
      res.statusCode = 204;
      res.end(JSON.stringify({ message: "Character deleted" }));
    }

    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "Not Found" }));
};
