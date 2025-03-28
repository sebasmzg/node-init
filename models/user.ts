import { compare, hash } from "bcrypt";
import { email, minLength, object, pipe, string, type InferInput } from "valibot";

const emailSchema = pipe(string(), email());
const passwordSchema = pipe(string(), minLength(6));

export const authSchema = object({
    email: emailSchema,
    password: passwordSchema
})

export type User = InferInput<typeof authSchema> & {
    id: number;
    role: Role;
    refreshToken?: string;
};

export enum Role {
    "ADMIN" = "admin",
    "USER" = "user",
}

const users: Map<string, User> = new Map();
/**
 * Create a new user with the given email and password
 * The password is hashed before being stored
 * 
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @return {Promise<User>} The created user
 */
export const createUser = async (
    email: string,
    password: string
): Promise<User> => {

    const hashedPassword = await hash(password,10);

    const newUser: User = {
        id: Date.now(),
        email,
        password: hashedPassword,
        role: Role.USER,
    }

    users.set(email, newUser);

    return newUser;
}

/**
 * find a user by a given email
 * 
 * @param {string} email - The email of the user to find
 * @return {User | undefined} The user if found, undefined otherwise
 */
export const findUserByEmail = (email: string): User | undefined => {
    return users.get(email);
}

/**
 * validates the user password
 * 
 * @param {User} user - The user whose password is to be validated
 * @param {string} password - The password to validate
 * @returns {Promise<boolean>} true if the password is valid, false otherwise
 */
export const validatePassword = async (user: User, password: string): Promise<boolean> => {
    return compare(password, user.password);
}

/**
 * Revoke token
 * 
 * @param {string} email - The email of the user to revoke the token from
 * @return {Promise<boolean>} - True if the token was revoked, false otherwise
 */
export const revokeUserToken = async (email: string): Promise<boolean> => {
    const foundUser = findUserByEmail(email);
    if (!foundUser) return false;

    users.set(email, {...foundUser, refreshToken: undefined});
    return true;
}