import type { IncomingMessage } from 'http';
import { StringDecoder } from 'string_decoder';

/**
 * Parses the body of an HTTP request into a JSON object.
 * 
 * @param {IncomingMessage} req - The HTTP request object containing the body to parse
 * @returns {Promise<any>} A promise that resolves to the parsed JSON data
 * 
 * @description
 * This utility function:
 * 1. Creates a UTF-8 string decoder
 * 2. Collects chunks of data from the request stream
 * 3. Concatenates the chunks into a single string
 * 4. Parses the string as JSON
 * 5. Resolves the promise with the parsed object
 * 
 * @throws {Error} Rejects the promise if JSON parsing fails
 */
export const parseBody = (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
        const decoder = new StringDecoder('utf-8');
        let buffer = "";

        req.on("data", (chunk) => {
            buffer += decoder.write(chunk);
        })

        req.on("end", () => {
            buffer += decoder.end();
            try {
                resolve(JSON.parse(buffer));
            } catch (err) {
                reject(err)
            }
        })
    })

}