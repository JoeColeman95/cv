# billing metrics + alarms only publish to us-east-1
# one-time console step: us-east-1 Billing > Preferences > "Receive Billing Alerts"
resource "aws_sns_topic" "billing" {
  provider = aws.use1
  name     = "cv-billing-alerts"
}

resource "aws_sns_topic_subscription" "billing_email" {
  provider  = aws.use1
  topic_arn = aws_sns_topic.billing.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "monthly_spend" {
  provider            = aws.use1
  alarm_name          = "cv-monthly-spend-over-${var.billing_threshold_usd}-usd"
  alarm_description   = "Monthly estimated AWS charges exceed $${var.billing_threshold_usd}."
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 21600 # 6h
  statistic           = "Maximum"
  threshold           = var.billing_threshold_usd
  dimensions = {
    Currency = "USD"
  }
  alarm_actions      = [aws_sns_topic.billing.arn]
  ok_actions         = [aws_sns_topic.billing.arn]
  treat_missing_data = "notBreaching"
}
