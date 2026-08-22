variable "state_bucket_name" {
  type        = string
  description = "Name of the Terraform remote state S3 bucket."
}

variable "lock_table_name" {
  type        = string
  description = "Name of the DynamoDB table used for state locking."
  default     = "terraform-state-locks"
}

variable "region" {
  type        = string
  description = "AWS region for state resources."
  default     = "us-east-1"
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
