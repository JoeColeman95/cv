provider "aws" {
  region = var.aws_region
  default_tags {
    tags = var.tags
  }
}

# CloudFront viewer certs + billing alarms must live in us-east-1
provider "aws" {
  alias  = "use1"
  region = "us-east-1"
  default_tags {
    tags = var.tags
  }
}

data "aws_caller_identity" "current" {}
