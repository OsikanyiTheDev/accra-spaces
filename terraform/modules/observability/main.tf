resource "aws_sns_topic" "alarms" {
  count = var.alert_email == "" ? 0 : 1
  name  = "${var.name_prefix}-alarms"

  tags = merge(var.tags, {
    Purpose = "accra-spaces-alarms"
  })
}

resource "aws_sns_topic_subscription" "alarms_email" {
  count     = var.alert_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alarms[0].arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_log_metric_filter" "api_5xx" {
  count          = var.alert_email == "" ? 0 : 1
  name           = "${var.name_prefix}-api-5xx"
  pattern        = "{ $.status >= 500 }"
  log_group_name = var.api_access_log_group_name

  metric_transformation {
    name      = "${var.name_prefix}-api-5xx-count"
    namespace = "AccraSpaces"
    value     = "1"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_5xx" {
  count               = var.alert_email == "" ? 0 : 1
  alarm_name          = "${var.name_prefix}-api-5xx-alarm"
  namespace           = "AccraSpaces"
  metric_name         = "${var.name_prefix}-api-5xx-count"
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  alarm_description   = "API Gateway returned 5xx responses in the last 5 minutes."
  alarm_actions       = [aws_sns_topic.alarms[0].arn]
  ok_actions          = [aws_sns_topic.alarms[0].arn]

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  for_each = var.alert_email == "" ? {} : { for name in var.lambda_function_names : name => name }

  alarm_name  = "${var.name_prefix}-${each.key}-errors-alarm"
  namespace   = "AWS/Lambda"
  metric_name = "Errors"
  dimensions = {
    FunctionName = each.value
  }
  statistic           = "Sum"
  period              = 300
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  alarm_description   = "Lambda ${each.value} reported errors in the last 5 minutes."
  alarm_actions       = [aws_sns_topic.alarms[0].arn]
  ok_actions          = [aws_sns_topic.alarms[0].arn]

  tags = var.tags
}
