locals {
  name_prefix = "accraspaces-dev"

  common_tags = {
    Project     = "AccraSpaces"
    Environment = "dev"
    ManagedBy   = "terraform"
    Owner       = "OsikanyiTheDev"
  }
}
