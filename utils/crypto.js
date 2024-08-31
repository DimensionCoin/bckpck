// utils/crypto.js
import crypto from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

export function encrypt(text) {
  const iv = crypto.randomBytes(16); // Generate a random Initialization Vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), content: encrypted }; // Return the iv and encrypted content
}

export function decrypt(encrypted) {
  const iv = Buffer.from(encrypted.iv, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted; // Return the decrypted text
}
