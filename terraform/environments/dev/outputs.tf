output "listings_table_name" {
  value = module.listings_store.table_name
}

output "listings_table_arn" {
  value = module.listings_store.table_arn
}

output "media_bucket_name" {
  value = module.media_storage.bucket_name
}

output "media_bucket_arn" {
  value = module.media_storage.bucket_arn
}

output "cognito_user_pool_id" {
  value = module.auth.user_pool_id
}

output "cognito_user_pool_arn" {
  value = module.auth.user_pool_arn
}

output "cognito_user_pool_domain_prefix" {
  value = module.auth.user_pool_domain
}

output "cognito_user_pool_domain_url" {
  value = "https://${module.auth.user_pool_domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "cognito_user_pool_client_id" {
  value = module.auth.user_pool_client_id
}

output "api_url" {
  value = module.api.api_url
}

output "api_execution_arn" {
  value = module.api.api_execution_arn
}
