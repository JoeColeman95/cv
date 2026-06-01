variable "aws_region" {
  type        = string
  default     = "eu-west-2"
  description = "AWS region for the Terraform state bucket."
}

variable "state_bucket_name" {
  type        = string
  description = "Name of the S3 bucket used as the Terraform state backend. Must be globally unique."

  validation {
    condition     = length(var.state_bucket_name) >= 3 && length(var.state_bucket_name) <= 63
    error_message = "S3 bucket names must be 3-63 characters."
  }
}

variable "tags" {
  type        = map(string)
  description = "Default tags applied to all resources."
  default = {
    Project   = "cv"
    Component = "tfstate"
    ManagedBy = "Terraform"
  }
}
