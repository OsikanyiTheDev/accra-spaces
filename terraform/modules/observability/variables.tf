variable "name_prefix" {
  type        = string
  description = "Prefix applied to observability resources."
}

variable "lambda_function_names" {
  type        = list(string)
  description = "Lambda function names to alarm on."
}

variable "api_access_log_group_name" {
  type        = string
  description = "CloudWatch log group for API Gateway access logs."
}

variable "enable_lambda_error_alarms" {
  type        = bool
  description = "Create one CloudWatch error alarm per Lambda function. Disabled in cost-conscious dev."
  default     = false
}

variable "alert_email" {
  type        = string
  description = "Email for alarm notifications. Empty disables the topic."
  default     = ""
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
