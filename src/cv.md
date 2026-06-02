# Joseph Coleman

## DevOps Engineer & Platform Engineer

<span class="ico-pin"></span>Bromborough, UK &nbsp; <span class="ico-mail"></span>[j@oseph.co.uk](mailto:j@oseph.co.uk) &nbsp; <span class="ico-phone"></span>07477 119471\
<span class="ico-globe"></span>[j.oseph.co.uk](https://j.oseph.co.uk) &nbsp; <span class="ico-linkedin"></span>[linkedin.com/in/j-oseph](https://www.linkedin.com/in/j-oseph/) &nbsp; <span class="ico-github"></span>[github.com/JoeColeman95](https://github.com/JoeColeman95)

---

## Professional Summary

DevOps Engineer and Platform Engineer with 4+ years building cloud platforms as code. Currently at Buildkite engaging directly with leading AI and tech customers and shipping Go across the public CLI, Go SDK and a new Terraform Elastic CI Stack module. Looking for a senior role as a DevOps Engineer or Platform Engineer with broader ownership of developer experience and reliability.

## Experience

### Buildkite
**DevOps Support Engineer** | June 2025 – Present

- Resolve 10+ customer escalations a month, unblocking developers at Buildkite's leading AI and tech customers across CI/CD pipelines, Kubernetes deployments via [`agent-stack-k8s`](https://github.com/buildkite/agent-stack-k8s), monitoring and platform incidents.
- Authored the public [`terraform-buildkite-elastic-ci-stack-for-aws`](https://github.com/buildkite/terraform-buildkite-elastic-ci-stack-for-aws) module, a from-scratch Terraform port of the CloudFormation Elastic CI Stack at 33 AWS resources across 14 `.tf` files, replacing CFN custom resources with `aws_lambda_invocation` and extracting repeated expressions into reusable locals. Released to public preview in November 2025 and adopted in production by around 60 organisations, with ongoing ownership through docs, examples, custom IAM roles, Renovate and tagging.
- Drove the [Buildkite CLI](https://github.com/buildkite/cli)'s migration from Cobra/Viper to Kong across every command group, including build, agent, job, cluster and artifacts. Stripped legacy TUI dependencies BubbleTea and Lipgloss in favour of plain ANSI output, trimming the binary by ~5 MB and yielding a more responsive CLI with cleaner output for scripts and AI agents to consume. Added cluster-queue commands, `bk job list/cancel`, agent pause/resume, and richer build filtering, keeping the Go SDK [`go-buildkite`](https://github.com/buildkite/go-buildkite) in lockstep with new service methods.
- Hardened public actions and hooks by adding retry with exponential backoff and jitter to [`trigger-pipeline-action`](https://github.com/buildkite/trigger-pipeline-action) for 5xx/429/network errors, and switching on automatic secret redaction in [`elastic-ci-stack-s3-secrets-hooks`](https://github.com/buildkite/elastic-ci-stack-s3-secrets-hooks) so pipeline secrets are scrubbed before logs leave the agent.
- Building OAuth alongside the existing PAT auth in the [Buildkite VS Code extension](https://github.com/buildkite/vscode-buildkite), a TypeScript refactor of auth, caching and logging into a dependency-injection pattern with token redaction across error paths.
- Opened ~100 pull requests across 18 Buildkite repositories with 92 merged, plus 135+ commits to the public documentation, all in under a year.

### Redcloud Technologies Ltd
**DevOps Engineer** | March 2022 – June 2025

- Broke down legacy monolithic systems into scalable, reproducible microservices defined as code.
- Architected Kafka clusters on AWS MSK using Terraform, supporting pub/sub and producer/consumer patterns for a range of systems; configured SCRAM authentication through AWS Secrets Manager. Ran a Confluent Schema Registry clone on ECS for schema management and extended in-house GitOps tooling to automate topic creation and ACL management.
- Designed and delivered a Magento infrastructure on a GitOps approach, with CI for PHP modules and CD for infrastructure and instance refreshes. Terraform formed the backbone, with application-specific deployments via cloud-init and Ansible fed from Git-based configuration. Wrote custom PHP modules to close gaps in Magento's non-cloud-native behaviour.
- Engineered a scalable, self-healing infrastructure monitoring system on AWS CloudWatch, New Relic and custom alerting scripts, reducing incident response times by 40%. Built automated remediation workflows that detect and resolve common issues without human intervention.
- Designed and managed transit gateways across 25 AWS accounts and 85+ VPCs in Terraform to enable secure cross-account and cross-VPC communication. Configured NAT gateways and central VPC routing to optimise traffic flow while enforcing least-privilege access.
- Rolled out a company-wide in-house VPN solution that uses RBAC over the transit gateway fabric to control access across systems and networks.
- Built a Terraform-managed DNS and SSL certificate solution, with Python pipeline tasks that iterate over each domain and certificate to alert on impending renewals.
- Co-built an in-house automated backup solution for a busy on-premises SSMS database cluster, minimising resource overhead, with automated restoration to limit data loss under disaster. Extended the same approach to Aurora databases in RDS using a mix of snapshots and DMS for a maximum 5-minute RPO with data integrity preserved.
- Refined CI/CD pipelines on Jenkins, CodeDeploy and Concourse to improve deployment efficiency. Integrated Terraform from GitHub for infrastructure automation, complemented by a custom in-house GitOps tool, for consistent and reliable deployments across environments.
- Conducted security audits across AWS and Azure environments, applying best practice to harden infrastructure, databases and application servers. Drove the internal technical readiness for ISO 27001 audits, remediating every point raised by compliance and passing with no major or minor findings.

### Focus IT Limited
**MSP Engineer** | May 2021 – March 2022

- Supported 100 client tenancies across Linux and Windows estates as day-to-day single point of contact, covering Office 365 (user lifecycle, SharePoint, Teams, Microsoft Defender), firewalls, VPN access, and Intune endpoint management (MDM, policies, software deployment, update rings).
- Administered Azure AD and on-premises AD (GPO, DHCP, DNS, IIS) across the client estate.
- Led migration and security-remediation projects end-to-end, owning scoping, delivery, and stakeholder updates.

### OBG Pharmaceuticals Ltd
**System Administrator** | March 2020 – May 2021

- Provided IT support across a group of 7 companies, including server maintenance and networking.
- Built PowerShell automation (via Adaxes) for AD and Exchange user-lifecycle tasks ahead of the Office 365 migration.
- Led migrations from on-premises AD to hybrid Azure AD, and on-premises Exchange + Skype to Office 365 + Teams.

## Skills

- **Cloud & IaC:** AWS, Azure, Terraform, Ansible, CloudFormation
- **Containers & orchestration:** Docker, Kubernetes, ECS, Lambda, GitOps
- **CI/CD:** Buildkite, Jenkins, GitHub Actions, Concourse, CodeDeploy
- **Data, messaging & observability:** SQL, MySQL, Redis, Elasticsearch, Apache Kafka (MSK), AWS CloudWatch, New Relic
- **Languages & scripting:** Go, Python, TypeScript, Bash, PowerShell, PHP, Java
- **Security & networking:** IAM, RBAC, high-scale networking, ISO 27001 readiness

## Education & Certifications

- **ITIL V4** | PeopleCert, 2020
- **Azure Fundamentals (AZ-900)** | Microsoft, 2020
- **CompTIA Network+** | CompTIA, 2016
- **Apprenticeship (NVQ, CompTIA A+, MCSA)** | Baltic Training, 2013–2015
