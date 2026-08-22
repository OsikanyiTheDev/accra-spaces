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

output "cognito_user_pool_client_id" {
  value = module.auth.user_pool_client_id
}
