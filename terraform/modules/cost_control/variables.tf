variable "name_prefix" {
  type        = string
  description = "Prefix applied to the budget name."
}

variable "monthly_budget_usd" {
  type        = number
  description = "Monthly account-level budget alert threshold in USD; AWS Budgets does not cap spending."
  default     = 10
}

variable "alert_email" {
  type        = string
  description = "Email address for budget alerts. Empty disables the budget."
  default     = ""
}
