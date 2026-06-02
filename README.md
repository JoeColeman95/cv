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

Three workflows, all OIDC-federated to AWS (no long-lived keys anywhere):

**Content deploy** (`deploy.yml`). On push to `main` touching `src/` or `build.sh`: assume the `cv-github-deploy` role, run `build.sh`, sync `dist/` into S3 with tiered cache-control, invalidate the relevant CloudFront paths. The role can do `s3:PutObject` / `s3:DeleteObject` / `s3:GetObject` / `s3:ListBucket` on the site bucket and `cloudfront:CreateInvalidation` on this distribution. Nothing else.

**Terraform plan** (`terraform-plan.yml`). On PR touching `infra/`, `bootstrap/`, `mise.toml` or the terraform workflows: assume the `cv-github-terraform` role, run `terraform init` + `fmt -check` + `validate` + `plan`, post the plan as a collapsible PR comment.

**Terraform apply** (`terraform-apply.yml`). On push to `main` touching `infra/`: gated on the `production` GitHub Environment (requires manual approval from a configured reviewer), then runs `terraform apply` with the same role.

The `cv-github-terraform` role gets service-scoped permissions (`s3:*`, `cloudfront:*`, `acm:*`, `route53:*`, plus the specific IAM actions the module needs), deliberately not `AdministratorAccess`. The trust policy on both roles is scoped to `repo:JoeColeman95/cv:*`, so nothing in any other repo can assume them.

## Costs

About £6/year steady state. Almost all of it is the Route 53 hosted zone fee ($0.50/month). The CloudWatch billing alarm fires at $10/month into an SNS email subscription, as a tripwire.

## Steal this

Help yourself. If you're building your own CV or personal site, anything in this repo is fair game:

- The Terraform in `infra/` is a clean reference for **S3 + CloudFront + ACM + Route 53 with the modern OAC**, plus **GitHub Actions OIDC** and a **billing alarm**. Drop your own values into `terraform.tfvars` and it should work.
- The site in `src/site/` is plain HTML/CSS/JS. No framework, no build step.
- The CV is `cv.md`, rendered by `build.sh`.
- Cover letters use the same toolchain. Drop a `<company>.md` into `src/cover-letters/` and `bash build.sh` produces `dist/cover-letter-<company>.pdf` with the matching masthead. `src/cover-letters/example.md` is a committed template showing the structure; everything else under that directory is gitignored because cover letters are per-application and tend to contain things you don't want public.

In return: a ⭐ or a fork is the only thank-you I'm asking for. No attribution required, no email, no fuss. PRs welcome if you fix something or improve a pattern.

Code is MIT-licensed (see `LICENSE`). The CV *content* (employment history, achievements) obviously isn't transferable, that's mine. Anything else, go nuts.

---

Built by Joseph Coleman · <https://j.oseph.co.uk>
