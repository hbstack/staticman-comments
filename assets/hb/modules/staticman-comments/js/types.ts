export interface Data {
  'g-recaptcha-response'?: string
  fields: Record<string, string>
  options: Record<string, string | Record<string, string>>
}

export interface Response {
  success: boolean
  message: string
}
