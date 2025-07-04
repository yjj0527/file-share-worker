// src/utils/id.js

export function generateId(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const cryptoObj = crypto || window.crypto; // 支持浏览器和Node.js

  for (let i = 0; i < length; i++) {
    const randomValue = cryptoObj.getRandomValues(new Uint32Array(1))[0];
    result += chars[randomValue % chars.length];
  }

  return result;
}
