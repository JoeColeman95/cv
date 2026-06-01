terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # state bucket comes from bootstrap/. lockfile = native S3 locking, no DynamoDB
  backend "s3" {
    bucket       = "j.oseph"
    key          = "cv/terraform.tfstate"
    region       = "eu-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
