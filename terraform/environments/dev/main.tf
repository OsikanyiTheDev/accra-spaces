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


module "api" {
  source                      = "../../modules/lambda_api"
  name_prefix                 = local.name_prefix
  lambda_source_dir           = abspath("${path.root}/../../../lambda/src")
  listings_table_name         = module.listings_store.table_name
  listings_table_arn          = module.listings_store.table_arn
  media_bucket_name           = module.media_storage.bucket_name
  media_bucket_arn            = module.media_storage.bucket_arn
  allowed_origins             = var.allowed_origins
  aws_region                  = var.aws_region
  cognito_user_pool_id        = module.auth.user_pool_id
  cognito_user_pool_arn       = module.auth.user_pool_arn
  cognito_user_pool_client_id = module.auth.user_pool_client_id
  throttling_burst_limit      = var.api_throttling_burst_limit
  throttling_rate_limit       = var.api_throttling_rate_limit
  tags                        = local.common_tags
}

module "observability" {
  source                     = "../../modules/observability"
  name_prefix                = local.name_prefix
  lambda_function_names      = module.api.function_names
  api_access_log_group_name  = module.api.api_access_log_group_name
  enable_lambda_error_alarms = false
  alert_email                = var.alert_email
  tags                       = local.common_tags
}
