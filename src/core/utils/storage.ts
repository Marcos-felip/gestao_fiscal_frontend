const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const ACTIVE_COMPANY_KEY = 'active_company'
const USER_KEY = 'user'

export class StorageService {
  static getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  }

  static removeToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }

  static getActiveCompanyId(): string | null {
    return localStorage.getItem(ACTIVE_COMPANY_KEY)
  }

  static setActiveCompanyId(id: string): void {
    localStorage.setItem(ACTIVE_COMPANY_KEY, id)
  }

  static removeActiveCompanyId(): void {
    localStorage.removeItem(ACTIVE_COMPANY_KEY)
  }

  static getUser(): Record<string, unknown> | null {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as unknown
      if (!parsed || typeof parsed !== 'object') return null
      return parsed as Record<string, unknown>
    } catch {
      return null
    }
  }

  static setUser(user: Record<string, unknown>): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  static removeUser(): void {
    localStorage.removeItem(USER_KEY)
  }

  static clearAll(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(ACTIVE_COMPANY_KEY)
    localStorage.removeItem(USER_KEY)
  }
}
