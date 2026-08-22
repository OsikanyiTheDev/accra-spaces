variable "name_prefix" {
  type        = string
  description = "Prefix applied to Cognito resource names."
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Globally unique Cognito Hosted UI domain prefix."
}

variable "callback_urls" {
  type        = list(string)
  description = "Cognito OAuth callback URLs."
}

variable "logout_urls" {
  type        = list(string)
  description = "Cognito OAuth logout URLs."
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
