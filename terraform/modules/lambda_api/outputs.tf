output "api_url" {
  value = aws_apigatewayv2_api.public.api_endpoint
}

output "api_execution_arn" {
  value = aws_apigatewayv2_api.public.execution_arn
}

output "function_names" {
  value = [for fn in aws_lambda_function.api : fn.function_name]
}

output "function_names_map" {
  value = { for key, fn in aws_lambda_function.api : key => fn.function_name }
}

output "api_access_log_group_name" {
  value = aws_cloudwatch_log_group.api_gateway.name
}
