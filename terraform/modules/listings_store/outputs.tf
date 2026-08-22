output "table_name" {
  value = aws_dynamodb_table.listings.name
}

output "table_arn" {
  value = aws_dynamodb_table.listings.arn
}
