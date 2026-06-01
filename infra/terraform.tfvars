# Values committed to Git per the GitOps approach.

# The site lives at j.oseph.co.uk (a subdomain of the registered oseph.co.uk).
# A Route 53 hosted zone is created for j.oseph.co.uk and delegated from your
# current DNS provider via NS records; the rest of oseph.co.uk (notably the MX
# / SPF / DKIM / DMARC records for j@oseph.co.uk email) stays put untouched.
site_domain      = "j.oseph.co.uk"
site_bucket_name = "joseph-coleman-cv-site"

github_repo           = "JoeColeman95/cv"
github_deploy_branch  = "main"
aws_region            = "eu-west-2"
price_class           = "PriceClass_100"
alert_email           = "j@oseph.co.uk"
billing_threshold_usd = 10

tags = {
  Project   = "cv"
  ManagedBy = "Terraform"
  Owner     = "JoeColeman95"
}
