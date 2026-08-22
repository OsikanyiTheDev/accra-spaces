terraform {
  backend "s3" {
    bucket       = "osikanyithedev-terraform-state-2026"
    key          = "accra-spaces/dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
