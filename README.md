# CV

My CV. The Markdown source for the PDF, a static site that wraps it, and the AWS infrastructure that hosts it.

- Live: <https://j.oseph.co.uk>
- PDF: <https://j.oseph.co.uk/cv.pdf>
- GitHub activity (live from the API): <https://j.oseph.co.uk/github.html>

## How it's built

```
src/cv.md   ──>  pandoc + weasyprint  ──>  dist/cv.pdf
src/site/*  ──>  copied as-is         ──>  dist/

                            dist/
                              │
                              │  aws s3 sync
                              ▼
                       S3 bucket (private)
                              ▲
                              │  OAC (SigV4)
                              │
                         CloudFront
                  (HTTP/3, TLS 1.2+, edge cache)
                              │
                              ▼
                      j.oseph.co.uk
              (Route 53 alias, IPv4 + IPv6)
```

23 Terraform resources. No VPC, no servers, no databases. Managed services only. About £6/year, with a billing tripwire at $10/month.

## Repo layout

```
src/cv.md            CV content. Single source for both the PDF and the site.
src/cv.css           stylesheet for the PDF and the embedded HTML sheet
src/linkedin.md      LinkedIn copy-paste version
src/site/            the website (homepage, CV page, GitHub activity page)
build.sh             pandoc + copy → dist/

bootstrap/           one-time: creates the S3 state bucket
infra/               the AWS infra (S3, CloudFront, ACM, Route 53, IAM/OIDC, billing alarm)

mise.toml            pinned tool versions + project tasks
.github/workflows/   CI: content deploys via OIDC
AGENTS.md            instructions for AI coding agents working in this repo
```

## Local dev

```sh
mise install          # pulls Terraform 1.15.5
bash build.sh         # builds dist/

mise run plan         # plan the site infra
mise run apply        # apply
mise run nameservers  # NS values for the j subdomain delegation
mise run outputs      # bucket, distribution ID, role ARN, etc.
mise run validate     # fmt -check + validate on both modules
```

## CI/CD

Push to `main` → GitHub Actions assumes an OIDC-federated IAM role (no long-lived AWS keys), runs `build.sh`, syncs `dist/` into S3 with tiered cache-control, then invalidates the relevant CloudFront paths.

The role can do `s3:PutObject` / `s3:DeleteObject` / `s3:GetObject` on the site bucket, `s3:ListBucket` on the same bucket, and `cloudfront:CreateInvalidation` on this distribution. Nothing else. The trust policy is scoped to `repo:JoeColeman95/cv:ref:refs/heads/main`, so nothing in any other repo or branch can assume it.

Terraform itself is currently applied from a laptop. Adding plan-on-PR / apply-on-main with a second OIDC role is a one-evening job that's been deliberately deferred.

## Costs

About £6/year steady state. Almost all of it is the Route 53 hosted zone fee ($0.50/month). The CloudWatch billing alarm fires at $10/month into an SNS email subscription, as a tripwire.

## Steal this

Help yourself. If you're building your own CV or personal site, anything in this repo is fair game:

- The Terraform in `infra/` is a clean reference for **S3 + CloudFront + ACM + Route 53 with the modern OAC**, plus **GitHub Actions OIDC** and a **billing alarm**. Drop your own values into `terraform.tfvars` and it should work.
- The site in `src/site/` is plain HTML/CSS/JS. No framework, no build step.
- The CV is `cv.md`, rendered by `build.sh`.

In return: a ⭐ or a fork is the only thank-you I'm asking for. No attribution required, no email, no fuss. PRs welcome if you fix something or improve a pattern.

Code is MIT-licensed (see `LICENSE`). The CV *content* (employment history, achievements) obviously isn't transferable, that's mine. Anything else, go nuts.

---

Built by Joseph Coleman · <https://j.oseph.co.uk>
