terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # No backend block as this module is applied once with local state to create
  # the S3 bucket that the main infra/ module will use as its remote backend.
}
