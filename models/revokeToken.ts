const revokedTokens: Set<string> = new Set();

/**
 * Add a token to the revoked tokens list
 * @param {string} token - Token to revoke
 */
export const addRevokeToken = (token: string): void => {
    revokedTokens.add(token);
}

/**
 * Verify if a token is revoked
 * @param {string} token - token to check
 * @return {boolean} - Return true if the token is revoked, false otherwise
 */
export const isTokenRevoked = (token: string): boolean => {
    return revokedTokens.has(token);
}