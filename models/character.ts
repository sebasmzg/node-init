import { minLength, object, pipe, string, type InferInput } from "valibot";

export const characterSchema = object({
    name: pipe(string(), minLength(1)),
    lastName: pipe(string(),minLength(1)),
})

export type Character = InferInput<typeof characterSchema> & {
    id: number;
}

const characters : Map<number, Character> = new Map();

/**
 * Gets all stored characters
 * @return {Character[]} List of characters
 */
export const getAllCharacters = (): Character[] => {
    return Array.from(characters.values());
}

/**
 * Finds a character by ID
 * @param {number} id - ID of the character
 * @return {Character | undefined} - Returns the character if it exists, `undefined` otherwise
 */
export const characterById = (id: number): Character | undefined => {
    return characters.get(id);
}

/**
 * Adds a new character to the map
 * @param {Character} character - Character data to add
 * @return {Character} - Returns the created character with a unique ID
 */
export const addCharacter = (character: Character): Character => {
    if(!characters.has(character.id)){
        console.error(`Character with id ${character.id} already exists`);
        return character;
    }
    const newCharacter = {
        ...character,
        id: new Date().getTime(),
    }

    characters.set(newCharacter.id, newCharacter);

    return newCharacter;
}

/**
 * Updates an existing character
 * @param {number} id - ID of the character to update
 * @param {Character} updatedCharacter - Updated data
 * @return {Character | null} - Returns the updated character or `null` if not found
 */
export const updateCharacter = (id: number, updatedCharacter: Character): Character | null => {
    if(!characters.has(id)) {
        console.error(`Character with id ${id} not found`);
        return null;
    };

    characters.set(id, updatedCharacter);
    return updatedCharacter;
}

/**
 * Deletes a character by ID
 * @param {number} id - ID of the character to delete
 * @return {boolean} - Returns `true` if the character was deleted, `false` if not found
 */
export const deleteCharacter = (id: number): boolean => {
    if(!characters.has(id)){
        console.error(`Character with ${id} not found`);
        return false;
    }

    characters.delete(id);
    return true;
}