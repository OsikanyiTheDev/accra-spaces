variable "name_prefix" {
  type        = string
  description = "Prefix applied to the DynamoDB table name."
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
