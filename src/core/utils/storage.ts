import { StorageKeys } from '@/core/constants/storage-keys'

export class StorageService {
  static getToken(): string | null {
    return localStorage.getItem(StorageKeys.TOKEN)
  }

  static setToken(token: string): void {
    localStorage.setItem(StorageKeys.TOKEN, token)
  }

  static removeToken(): void {
    localStorage.removeItem(StorageKeys.TOKEN)
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(StorageKeys.REFRESH_TOKEN)
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(StorageKeys.REFRESH_TOKEN, token)
  }

  static removeRefreshToken(): void {
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN)
  }

  static getActiveCompanyId(): string | null {
    return localStorage.getItem(StorageKeys.ACTIVE_COMPANY)
  }

  static setActiveCompanyId(id: string): void {
    localStorage.setItem(StorageKeys.ACTIVE_COMPANY, id)
  }

  static removeActiveCompanyId(): void {
    localStorage.removeItem(StorageKeys.ACTIVE_COMPANY)
  }

  static getUser(): Record<string, unknown> | null {
    const raw = localStorage.getItem(StorageKeys.USER)
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
    localStorage.setItem(StorageKeys.USER, JSON.stringify(user))
  }

  static removeUser(): void {
    localStorage.removeItem(StorageKeys.USER)
  }

  static clearAll(): void {
    localStorage.removeItem(StorageKeys.TOKEN)
    localStorage.removeItem(StorageKeys.REFRESH_TOKEN)
    localStorage.removeItem(StorageKeys.ACTIVE_COMPANY)
    localStorage.removeItem(StorageKeys.USER)
  }
}
