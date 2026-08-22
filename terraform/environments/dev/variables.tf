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
  description = "Monthly account-level AWS budget alert threshold in USD; not a hard spending cap."
  default     = 10
}

variable "api_throttling_burst_limit" {
  type        = number
  description = "Short API request burst allowed in the dev environment."
  default     = 5

  validation {
    condition     = var.api_throttling_burst_limit >= 1 && floor(var.api_throttling_burst_limit) == var.api_throttling_burst_limit
    error_message = "api_throttling_burst_limit must be a positive whole number."
  }
}

variable "api_throttling_rate_limit" {
  type        = number
  description = "Sustained API requests per second allowed in the dev environment."
  default     = 2

  validation {
    condition     = var.api_throttling_rate_limit > 0
    error_message = "api_throttling_rate_limit must be greater than zero."
  }
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
