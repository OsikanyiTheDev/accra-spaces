variable "aws_region" {
  type        = string
  description = "AWS region for the dev environment."
  default     = "us-east-1"
}

variable "media_bucket_name" {
  type        = string
  description = "Globally unique private photo bucket name."
}

variable "allowed_origins" {
  type        = list(string)
  description = "CORS origins for the API and media bucket."
  default     = ["http://localhost:3000"]
}

variable "alert_email" {
  type        = string
  description = "Operational email for budget and alarm notifications."
  default     = ""
}

variable "monthly_budget_usd" {
  type        = number
  description = "Monthly AWS budget guardrail in USD."
  default     = 10
}

variable "cognito_domain_prefix" {
  type        = string
  description = "Globally unique Cognito Hosted UI domain prefix."
}

variable "auth_callback_urls" {
  type        = list(string)
  description = "Cognito OAuth callback URLs."
  default     = ["http://localhost:3000"]
}

variable "auth_logout_urls" {
  type        = list(string)
  description = "Cognito OAuth logout URLs."
  default     = ["http://localhost:3000"]
}
