output "nameservers" {
  value       = aws_route53_zone.site.name_servers
  description = "NS values to paste at the parent registrar for the j subdomain."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.site.id
  description = "Distribution ID for cache invalidations."
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.site.domain_name
  description = "Direct CloudFront domain. Useful for testing before DNS propagates."
}

output "site_bucket" {
  value       = aws_s3_bucket.site.id
  description = "Bucket the deploy syncs into."
}

output "github_deploy_role_arn" {
  value       = aws_iam_role.github_deploy.arn
  description = "ARN the deploy workflow assumes via OIDC."
}

output "github_terraform_role_arn" {
  value       = aws_iam_role.github_terraform.arn
  description = "ARN the terraform plan/apply workflows assume via OIDC."
}

output "billing_alarm_name" {
  value       = aws_cloudwatch_metric_alarm.monthly_spend.alarm_name
  description = "Billing tripwire alarm name."
}
