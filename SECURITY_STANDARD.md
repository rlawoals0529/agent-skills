# Repository security standard

This is the shared baseline for repositories owned by `rlawoals0529`. Controls are applied according to the actual attack surface: a static site does not need database RLS, and a single-user local CLI does not need browser CSRF, but those controls become mandatory when the corresponding surface is introduced.

## Required in every repository

- Never commit API keys, passwords, private keys, `.env` files, `.dev.vars`, logs containing credentials, or production data.
- Local environment files must be ignored before secrets are introduced. Commit only clearly safe templates such as `.env.example`.
- Any credential that ever reaches GitHub, an issue, CI log, artifact, or shared transcript must be revoked/rotated. Removing the current file is not enough.
- Dependency locks must resolve cleanly. npm projects run `npm ci --ignore-scripts` and a high-severity production dependency audit in the shared baseline.
- Do not enable wildcard CORS in application code. Use an explicit origin allowlist when browser cross-origin access is actually required.
- Do not render untrusted HTML. Prefer framework escaping/text APIs; if raw HTML is unavoidable, sanitize it with a maintained allowlist sanitizer.
- Do not return stack traces, credentials, raw provider errors, or sensitive records to end users.
- Logs must exclude secrets and minimize PII.
- Public deployments use HTTPS and appropriate security headers. Browser apps should include CSP, anti-framing, MIME-sniffing, referrer, permissions, and HSTS controls where the hosting platform permits them.

## When a server/API exists

- Treat all client input as untrusted. Validate type, length/range, enum membership, and request/body size on the server.
- Authenticate every non-public route at the server boundary, not only in UI navigation.
- Authorize each object access. A caller-controlled object ID must never substitute for an ownership predicate.
- Rate-limit abuse-sensitive routes. Login/signup/password reset and paid/expensive provider endpoints require server/edge limits.
- Use parameterized queries/ORM bind parameters. Never interpolate request data into SQL.
- State-changing browser requests using cookies require CSRF protection or a comparably strong same-origin mechanism.
- Sessions/tokens must expire. Session cookies must be `HttpOnly`, `Secure` under HTTPS, and `SameSite` appropriate to the flow. Rotate session IDs after authentication/privilege changes.
- Passwords must be delegated to a maintained auth provider or hashed with a modern password hash (`password_hash`/Argon2/bcrypt with appropriate parameters). Never store or compare plaintext passwords.

## When user-owned database data exists

- Enforce ownership at the database query boundary for every read/write/delete.
- Enable Row Level Security for every user-owned table when the database supports it and the architecture uses a database identity that makes RLS effective. MySQL applications must enforce equivalent ownership predicates plus a least-privilege database account.
- Back up persistent data and test restoration. A backup that has never been restored is unverified.

## When uploads/object storage exist

- Validate upload status, maximum byte size, extension and actual MIME/content characteristics on the server.
- Generate server-side storage names; prevent path traversal and overwrite races.
- Store private uploads outside the public app root or in private object-storage buckets. Download/export routes must re-check authorization before streaming content.
- Treat image/document metadata and parsed content as untrusted.

## When webhooks exist

- Verify provider signatures against the exact raw request payload before acting.
- Reject stale/replayed events when the provider supports timestamps/event IDs.
- Make side effects idempotent where providers may retry.

## When AI/agents exist

- Keep provider keys server-side and set provider/cloud quota or budget alerts/caps outside the repository.
- Treat retrieved documents, web pages, dataset cells, tool output and user prompts as untrusted instructions. They cannot override the application policy/system task.
- Give the model only the tools required for the task. Bound tool arguments, result sizes, execution time, recursion/steps and total spend.
- Never let model text become executable shell, SQL, code, file paths, URLs, or privileged tool arguments without deterministic validation/allowlisting and appropriate human confirmation.
- Rate-limit paid AI endpoints and cap context/output sizes.

## Local privileged tools

Desktop extensions, audit collectors, LAN utilities and CLIs do not automatically inherit web controls such as CORS/CSRF/RLS. Their equivalent boundary is capability control: constrain file paths, process execution, network destinations, payload sizes, and destructive actions. Require explicit confirmation before actions such as pushing code, deleting data, or modifying the system.

## Deployment/account controls that CI cannot prove

Repository CI cannot prove or configure all external controls. Review these in the service dashboards whenever the relevant service exists:

- GitHub secret scanning/push protection and credential rotation history
- Cloudflare/custom-domain HTTPS enforcement
- OpenAI/Anthropic/Gemini/cloud quotas, spending limits and alerts
- managed-database RLS/policies, least-privilege credentials and network rules
- private bucket/object-storage ACLs
- encrypted backups and a tested restore
- webhook secrets and provider-side endpoint configuration

The reusable workflow is a regression gate, not a substitute for architecture review or an authorized security test of a deployed application.
