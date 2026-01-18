// utils/gameId.ts
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ID_LENGTH = 5;

export function generateGameId(): string {
  let result = "";
  const n = ALPHABET.length;

  for (let i = 0; i < ID_LENGTH; i++) {
    const idx = Math.floor(Math.random() * n);
    result += ALPHABET[idx];
  }

  return result;
}
