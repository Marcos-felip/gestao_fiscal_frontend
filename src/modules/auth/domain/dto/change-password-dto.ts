export class ChangePasswordDto {
  currentPassword: string
  newPassword: string
  confirmPassword: string

  constructor(fields: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    this.currentPassword = fields.currentPassword
    this.newPassword = fields.newPassword
    this.confirmPassword = fields.confirmPassword
  }
}
