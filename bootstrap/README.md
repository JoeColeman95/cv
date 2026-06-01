# bootstrap/

Creates the single S3 bucket used as the Terraform state backend for the main
`infra/` module. Applied once with local state, then never touched again.

## Why this is separate

Chicken-and-egg. The main module's `backend "s3"` block needs the bucket to
exist before `terraform init`, so we can't manage that bucket from inside the
module itself.

## How to apply

```bash
mise install      # gets the Terraform version pinned in mise.toml
mise run bootstrap
```

(or `cd bootstrap && terraform init && terraform apply` if you don't use mise.)

Use your own AWS credentials for this (an admin SSO session is fine). The
bucket is in S3's global namespace, so `state_bucket_name` in `terraform.tfvars`
must be unique across all AWS accounts.

## Local state

The local `terraform.tfstate` file produced by this apply is regenerable from
the AWS console if it gets lost (the bucket itself is the only thing that
matters). It's in `.gitignore`; don't commit it.

If you want belt and braces, copy the file to a private location after applying.
