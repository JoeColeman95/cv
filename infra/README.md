# infra/

Terraform module that hosts the CV at `j.oseph.co.uk` on AWS:

- **Route 53** hosted zone for `j.oseph.co.uk` (subdomain delegation)
- **ACM** TLS certificate in us-east-1 (CloudFront constraint), DNS-validated
- **S3** private bucket for site content, encrypted, versioned, lifecycle-managed
- **CloudFront** distribution with the modern Origin Access Control, HTTP/3,
  managed security-headers policy, IPv6
- **IAM OIDC provider + role** for the GitHub Actions deploy workflow
- **Billing alarm** at $10/month with SNS email notification (tripwire)

No VPCs, no NAT gateways, no databases. Managed services only.

## DNS delegation strategy

The registered domain is `oseph.co.uk` and email lives there (`j@oseph.co.uk`,
plus the MX, SPF, DKIM and DMARC records that keep mail flowing). We don't want
to migrate the whole zone to Route 53 just to host a site, that's risk for no
gain.

Instead, we create a Route 53 hosted zone for `j.oseph.co.uk` and **delegate
only that subdomain** by adding four `NS` records at the current DNS provider:

```
At your current DNS provider for oseph.co.uk:

  j   IN  NS   ns-AAA.awsdns-XX.com.
  j   IN  NS   ns-BBB.awsdns-YY.net.
  j   IN  NS   ns-CCC.awsdns-ZZ.org.
  j   IN  NS   ns-DDD.awsdns-WW.co.uk.
```

The exact NS hostnames come from `terraform output nameservers` after the
first apply. Everything under `j.oseph.co.uk` resolves via Route 53; everything
else under `oseph.co.uk` (email, the apex, other subdomains) stays where it is.

## Topology

```
j.oseph.co.uk
     |
     v
Route 53 alias (A + AAAA, at the apex of the j.oseph.co.uk zone)
     |
     v
CloudFront distribution (TLS via ACM in us-east-1)
     |
     v   (OAC, SigV4)
S3 site bucket (private)

GitHub Actions
     |
     v   (OIDC, scoped to repo + branch)
IAM role: cv-github-deploy
     |
     v
s3:PutObject + cloudfront:CreateInvalidation
```

## State

Backend is the S3 bucket created by `../bootstrap/`. Native S3 conditional-write
locking (Terraform 1.10+, no DynamoDB). Bucket name hardcoded in `versions.tf`
because backend blocks can't use variables.

## First-time setup

Tool versions are pinned via [mise](https://mise.jdx.dev/) in `mise.toml` at
the repo root. Run `mise install` once to get the right Terraform locally.

1. `mise install` (one-time, gets Terraform 1.15.5)
2. `mise run bootstrap` (one-time, creates the state bucket)
3. Enable "Receive Billing Alerts" in the us-east-1 AWS console → Billing → Preferences. Terraform can't toggle this flag.
4. (Optional) update `terraform.tfvars` with any overrides; defaults match the j.oseph.co.uk plan.
5. `mise run plan` (review the change set)
6. `mise run apply`
7. `mise run nameservers`, then add those four values as `NS` records for the name `j` at your current DNS provider for `oseph.co.uk`.
8. Wait for DNS propagation (1-4 hours typically), then confirm at https://j.oseph.co.uk.

The non-mise equivalents are `terraform init`, `terraform plan`, `terraform
apply`, `terraform output nameservers` from inside `infra/`.

## Day-to-day

Content changes (under `src/`) deploy via `.github/workflows/deploy.yml` on
push to `main`. Infrastructure changes (under `infra/`) currently apply from
your laptop. Adding a Terraform CI workflow with a second OIDC role is the
next obvious step; deliberately deferred to keep v1 focused.

## Costs (steady state, for ~tens of visits/day)

| Item | Approx |
|------|--------|
| Route 53 hosted zone | $0.50/month |
| S3 storage + requests | pennies |
| CloudFront requests + transfer | within free tier (1 TB/month, 10M HTTPS reqs) |
| ACM cert | $0 |
| CloudWatch alarm + SNS | $0 within free tier |
| **Total** | **~$0.50-1.00/month** |
