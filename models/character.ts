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
 * Obtiene todos los personajes almacenados
 * @return {Character[]} Lista de personajes
 */
export const getAllCharacters = (): Character[] => {
    return Array.from(characters.values());
}

/**
 * Busca un personaje por ID
 * @param {number} id - ID del personaje
 * @return {Character | undefined} - Retorna el personaje si existe, `undefined` si no
 */
export const characterById = (id: number): Character | undefined => {
    return characters.get(id);
}

/**
 * Agrega un nuevo personaje al mapa
 * @param {Character} character - Datos del personaje a agregar
 * @return {Character} - Retorna el personaje creado con un ID único
 */
export const addCharacter = (character: Character): Character => {
    const newCharacter = {
        ...character,
        id: new Date().getTime(),
    }

    characters.set(newCharacter.id, newCharacter);

    return newCharacter;
}

/**
 * Actualiza un personaje existente
 * @param {number} id - ID del personaje a actualizar
 * @param {Character} updatedCharacter - Datos actualizados
 * @return {Character | null} - Retorna el personaje actualizado o `null` si no se encuentra
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
 * Elimina un personaje por ID
 * @param {number} id - ID del personaje a eliminar
 * @return {boolean} - Retorna `true` si el personaje fue eliminado, `false` si no se encontró
 */
export const deleteCharacter = (id: number): boolean => {
    if(!characters.has(id)){
        console.error(`Character with ${id} not found`);
        return false;
    }

    characters.delete(id);
    return true;
}