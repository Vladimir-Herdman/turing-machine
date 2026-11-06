import { inflate, deflate } from 'pako';

const decoder = new TextDecoder();
const encoder = new TextEncoder();

//compress a string to a base64 encoded compressed string.
export function compress(str: string): string {
  const compressedBytes = deflate(encoder.encode(str));
  return btoa(String.fromCharCode(...compressedBytes));
}

//decompress a base64 encoded string to original text.
export function decompress(str: string): string {
  const compressedBytes = new Uint8Array([...atob(str)].map((ch) => ch.charCodeAt(0)));
  const uncompressedBytes = inflate(compressedBytes);
  return decoder.decode(uncompressedBytes);
}
