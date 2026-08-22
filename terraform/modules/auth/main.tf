resource "aws_cognito_user_pool" "pool" {
  name = "${var.name_prefix}-users"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = "OPTIONAL"

  password_policy {
    minimum_length                   = 10
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = false
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  tags = merge(var.tags, {
    Name    = "${var.name_prefix}-users"
    Purpose = "property-platform-auth"
  })
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.name_prefix}-web"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret                      = false
  prevent_user_existence_errors        = "ENABLED"
  enable_token_revocation              = true
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  callback_urls                        = var.callback_urls
  logout_urls                          = var.logout_urls
  supported_identity_providers         = ["COGNITO"]

  # V1 decision: verified email + password. Browser sign-in uses the Hosted UI
  # authorization-code flow with PKCE; these direct flows support recovery and SDK clients.
  explicit_auth_flows = [
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
  ]
}

resource "aws_cognito_user_pool_domain" "hosted_ui" {
  domain       = var.cognito_domain_prefix
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_group" "roles" {
  for_each = {
    Seeker   = 40
    Landlord = 30
    Agent    = 20
    Admin    = 10
  }

  user_pool_id = aws_cognito_user_pool.pool.id
  name         = each.key
  description  = "Accra Spaces ${lower(each.key)} role"
  precedence   = each.value
}
