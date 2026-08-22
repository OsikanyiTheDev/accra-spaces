data "archive_file" "api" {
  type        = "zip"
  source_dir  = var.lambda_source_dir
  output_path = "${path.module}/accra-spaces-api.zip"
}

locals {
  functions = {
    health = {
      handler   = "handlers.health.lambda_handler"
      route_key = "GET /health"
      auth      = "NONE"
    }
    list_listings = {
      handler   = "handlers.list_listings.lambda_handler"
      route_key = "GET /listings"
      auth      = "NONE"
    }
    get_listing = {
      handler   = "handlers.get_listing.lambda_handler"
      route_key = "GET /listings/{id}"
      auth      = "NONE"
    }
    media_urls = {
      handler   = "handlers.media_urls.lambda_handler"
      route_key = "POST /media/urls"
      auth      = "NONE"
    }
    create_listing = {
      handler   = "handlers.create_listing.lambda_handler"
      route_key = "POST /listings"
      auth      = "JWT"
    }
    update_listing = {
      handler   = "handlers.update_listing.lambda_handler"
      route_key = "PATCH /listings/{id}"
      auth      = "JWT"
    }
    request_upload = {
      handler   = "handlers.request_upload.lambda_handler"
      route_key = "POST /listings/{id}/media/presign"
      auth      = "JWT"
    }
    create_viewing_request = {
      handler   = "handlers.create_viewing_request.lambda_handler"
      route_key = "POST /listings/{id}/viewing-requests"
      auth      = "JWT"
    }
    create_offer = {
      handler   = "handlers.create_offer.lambda_handler"
      route_key = "POST /listings/{id}/offers"
      auth      = "JWT"
    }
    report_listing = {
      handler   = "handlers.report_listing.lambda_handler"
      route_key = "POST /listings/{id}/report"
      auth      = "NONE"
    }
    add_favorite = {
      handler   = "handlers.add_favorite.lambda_handler"
      route_key = "POST /me/favorites/{id}"
      auth      = "JWT"
    }
    list_favorites = {
      handler   = "handlers.list_favorites.lambda_handler"
      route_key = "GET /me/favorites"
      auth      = "JWT"
    }
    remove_favorite = {
      handler   = "handlers.remove_favorite.lambda_handler"
      route_key = "DELETE /me/favorites/{id}"
      auth      = "JWT"
    }
    list_saved_searches = {
      handler   = "handlers.list_saved_searches.lambda_handler"
      route_key = "GET /me/saved-searches"
      auth      = "JWT"
    }
    create_saved_search = {
      handler   = "handlers.create_saved_search.lambda_handler"
      route_key = "POST /me/saved-searches"
      auth      = "JWT"
    }
    delete_saved_search = {
      handler   = "handlers.delete_saved_search.lambda_handler"
      route_key = "DELETE /me/saved-searches/{id}"
      auth      = "JWT"
    }
    select_role = {
      handler   = "handlers.select_role.lambda_handler"
      route_key = "POST /me/role"
      auth      = "JWT"
    }
    update_listing_status = {
      handler   = "handlers.update_listing_status.lambda_handler"
      route_key = "PATCH /admin/listings/{id}/status"
      auth      = "AWS_IAM"
    }
  }
}

resource "aws_iam_role" "lambda" {
  name = "${var.name_prefix}-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "api_data_access" {
  name = "${var.name_prefix}-api-data-access"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListingsTable"
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
        ]
        Resource = [var.listings_table_arn, "${var.listings_table_arn}/index/*"]
      },
      {
        Sid    = "MediaReadWrite"
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:GetObject"]
        Resource = [
          "${var.media_bucket_arn}/listings/*",
          "${var.media_bucket_arn}/pending/*",
        ]
      },
      {
        Sid      = "AssignSelfDeclaredPostingRole"
        Effect   = "Allow"
        Action   = ["cognito-idp:AdminAddUserToGroup"]
        Resource = var.cognito_user_pool_arn
      },
    ]
  })
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each          = local.functions
  name              = "/aws/lambda/${var.name_prefix}-${each.key}"
  retention_in_days = var.log_retention_days

  tags = var.tags
}

resource "aws_lambda_function" "api" {
  for_each         = local.functions
  function_name    = "${var.name_prefix}-${each.key}"
  description      = "Accra Spaces ${replace(each.key, "_", " ")} API handler"
  filename         = data.archive_file.api.output_path
  source_code_hash = data.archive_file.api.output_base64sha256
  role             = aws_iam_role.lambda.arn
  handler          = each.value.handler
  runtime          = "python3.12"
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      LISTINGS_TABLE       = var.listings_table_name
      MEDIA_BUCKET         = var.media_bucket_name
      COGNITO_USER_POOL_ID = var.cognito_user_pool_id
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-${each.key}"
    Purpose = "accra-spaces-api"
  })
}

resource "aws_apigatewayv2_api" "public" {
  name          = "${var.name_prefix}-api"
  protocol_type = "HTTP"
  description   = "Accra Spaces property listing API"

  cors_configuration {
    allow_credentials = false
    allow_headers     = ["content-type", "authorization"]
    allow_methods     = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]
    allow_origins     = var.allowed_origins
    max_age           = 300
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-api"
    Purpose = "property-listing-api"
  })
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.name_prefix}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.public.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.name_prefix}-cognito-jwt"

  jwt_configuration {
    audience = [var.cognito_user_pool_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.public.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      sourceIp         = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "lambda" {
  for_each               = local.functions
  api_id                 = aws_apigatewayv2_api.public.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api[each.key].invoke_arn
  payload_format_version = "2.0"
  integration_method     = "POST"
}

resource "aws_apigatewayv2_route" "lambda" {
  for_each           = local.functions
  api_id             = aws_apigatewayv2_api.public.id
  route_key          = each.value.route_key
  target             = "integrations/${aws_apigatewayv2_integration.lambda[each.key].id}"
  authorization_type = each.value.auth
  authorizer_id      = each.value.auth == "JWT" ? aws_apigatewayv2_authorizer.cognito.id : null
}

resource "aws_lambda_permission" "api_gateway" {
  for_each      = local.functions
  statement_id  = "AllowApiGatewayInvoke-${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.public.execution_arn}/*/*"
}
