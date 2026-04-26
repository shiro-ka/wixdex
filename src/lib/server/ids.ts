import { customAlphabet } from 'nanoid';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const newUserId = customAlphabet(ALPHABET, 21);
export const newSessionId = customAlphabet(ALPHABET, 32);
export const newDeckId = customAlphabet(ALPHABET, 21);
