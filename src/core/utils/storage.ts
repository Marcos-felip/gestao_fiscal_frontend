const TOKEN_KEY = 'gf_access_token'
const REFRESH_TOKEN_KEY = 'gf_refresh_token'
const ACTIVE_COMPANY_KEY = 'gf_active_company'

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

  static clearAll(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(ACTIVE_COMPANY_KEY)
  }
}