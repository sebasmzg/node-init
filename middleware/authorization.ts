import type { User } from "../models";
import type { AuthenticatedRequest } from "./authentication"
import type { ServerResponse } from "http"

/**
 * Creates a middleware function that checks if the authenticated user has one of the specified roles.
 * 
 * @param {...string} roles - An array of role names that are authorized to access the resource
 * @returns {Function} A middleware function that validates user roles
 */
export const authorizedRoles = (...roles: string[]) => {
   
    return async (
        req: AuthenticatedRequest,
        res: ServerResponse,
    ) : Promise<boolean> => {
        const userRole = (req.user as User).role;
        if(!userRole || !roles.includes(userRole)){
            res.statusCode = 403;
            res.end(JSON.stringify({ message: "Forbidden" }));
            return false;
        }

        return true;
    }
}