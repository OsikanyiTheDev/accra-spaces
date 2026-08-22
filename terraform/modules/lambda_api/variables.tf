variable "name_prefix" {
  type        = string
  description = "Name prefix for Accra Spaces API resources."
}

variable "lambda_source_dir" {
  type        = string
  description = "Absolute path to the Lambda source directory to package."
}

variable "listings_table_name" {
  type        = string
  description = "DynamoDB listings table name."
}

variable "listings_table_arn" {
  type        = string
  description = "DynamoDB listings table ARN."
}

variable "media_bucket_name" {
  type        = string
  description = "Private media bucket name."
}

variable "media_bucket_arn" {
  type        = string
  description = "Private media bucket ARN."
}

variable "allowed_origins" {
  type        = list(string)
  description = "CORS origins for the API."
  default     = ["http://localhost:3000"]
}

variable "aws_region" {
  type        = string
  description = "AWS region for the Cognito JWT issuer."
  default     = "us-east-1"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "Cognito user pool ID for the JWT authorizer."
}

variable "cognito_user_pool_arn" {
  type        = string
  description = "Cognito user pool ARN for scoped role-assignment permission."
}

variable "cognito_user_pool_client_id" {
  type        = string
  description = "Cognito user pool client ID (JWT audience)."
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch log retention in days."
  default     = 14
}

variable "throttling_burst_limit" {
  type        = number
  description = "API Gateway throttling burst limit."
  default     = 20
}

variable "throttling_rate_limit" {
  type        = number
  description = "API Gateway throttling rate limit."
  default     = 10
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
