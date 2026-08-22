module "listings_store" {
  source      = "../../modules/listings_store"
  name_prefix = local.name_prefix
  tags        = local.common_tags
}

module "media_storage" {
  source          = "../../modules/media_storage"
  bucket_name     = var.media_bucket_name
  allowed_origins = var.allowed_origins
  tags            = local.common_tags
}

module "auth" {
  source                = "../../modules/auth"
  name_prefix           = local.name_prefix
  cognito_domain_prefix = var.cognito_domain_prefix
  callback_urls         = var.auth_callback_urls
  logout_urls           = var.auth_logout_urls
  tags                  = local.common_tags
}

module "cost_control" {
  source             = "../../modules/cost_control"
  name_prefix        = local.name_prefix
  monthly_budget_usd = var.monthly_budget_usd
  alert_email        = var.alert_email
}

# NOTE: the lambda_api and observability modules land with the API handlers
# milestone. This file is intentionally minimal until then.
