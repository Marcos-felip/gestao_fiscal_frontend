export interface ChangePasswordResult {
  id: string
  name: string
  email: string
  forcePasswordChange: boolean
  passwordChangedAt: string | null
}
