// src/auth.js

class Auth {
  static cookieName = 'auth_token';
  static cookieExpiry = 30 * 24 * 60 * 60; // 30 天，单位为秒

  static async validatePassword(password, env) {
    if (!env.AUTH_PASSWORD) {
      throw new Error('AUTH_PASSWORD is not set in environment variables');
    }
    return password === env.AUTH_PASSWORD;
  }

  static async generateToken(env) {
    if (!env.AUTH_PASSWORD) {
      throw new Error('AUTH_PASSWORD is not set in environment variables');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(env.AUTH_PASSWORD);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  static createCookie(token) {
    return `${this.cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${this.cookieExpiry}`;
  }

  static createExpiredCookie() {
    return `${this.cookieName}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
  }

  static async verifyAuth(request, env) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return false;

    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [name, ...rest] = c.trim().split('=');
        return [name, rest.join('=')];
      })
    );

    const token = cookies[this.cookieName];
    if (!token) return false;

    const validToken = await this.generateToken(env);
    return token === validToken;
  }
}

export { Auth };
