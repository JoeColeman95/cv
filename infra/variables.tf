variable "site_domain" {
  type        = string
  description = "FQDN the site serves from. Becomes the Route 53 zone name."

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.site_domain))
    error_message = "site_domain must be a valid lowercase hostname like j.oseph.co.uk."
  }
}

variable "site_bucket_name" {
  type        = string
  description = "S3 bucket for site content. Globally unique. Keep it dotless (CloudFront SSL hates dots in bucket names)."

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.site_bucket_name)) && length(var.site_bucket_name) >= 3 && length(var.site_bucket_name) <= 63
    error_message = "site_bucket_name must be lowercase letters, numbers, hyphens, 3-63 chars (no dots)."
  }
}

variable "github_repo" {
  type        = string
  description = "owner/repo for the GitHub Actions OIDC trust (e.g. JoeColeman95/cv)."

  validation {
    condition     = can(regex("^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$", var.github_repo))
    error_message = "github_repo must look like owner/repo."
  }
}

variable "github_deploy_branch" {
  type        = string
  default     = "main"
  description = "Branch allowed to assume the deploy role."
}

variable "aws_region" {
  type        = string
  default     = "eu-west-2"
  description = "Region for the S3 site bucket and Route 53 hosted zone."
}

variable "price_class" {
  type        = string
  default     = "PriceClass_100"
  description = "CloudFront price class. 100 = NA + EU; 200 adds Asia + ME + ZA; All = global."

  validation {
    condition     = contains(["PriceClass_100", "PriceClass_200", "PriceClass_All"], var.price_class)
    error_message = "Must be PriceClass_100, PriceClass_200, or PriceClass_All."
  }
}

variable "alert_email" {
  type        = string
  description = "Email subscribed to the billing-alarm SNS topic."

  validation {
    condition     = can(regex("^[^@]+@[^@]+\\.[^@]+$", var.alert_email))
    error_message = "alert_email must look like an email address."
  }
}

variable "billing_threshold_usd" {
  type        = number
  default     = 10
  description = "Billing alarm threshold. AWS billing metrics are USD-only."
}

variable "tags" {
  type        = map(string)
  description = "Default tags applied to every resource."
  default = {
    Project   = "cv"
    ManagedBy = "Terraform"
  }
}
