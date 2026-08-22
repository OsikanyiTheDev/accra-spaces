variable "bucket_name" {
  type        = string
  description = "Globally unique private photo bucket name."
}

variable "allowed_origins" {
  type        = list(string)
  description = "CORS origins allowed to upload."
  default     = ["http://localhost:3000"]
}

variable "tags" {
  type        = map(string)
  description = "Common AWS resource tags."
  default     = {}
}
