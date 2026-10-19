# Repository protection

## Prepared in the repository

- `.github/CODEOWNERS` assigns every file, including itself and workflows, to
  `@sarbloc`.
- The `CI` workflow runs formatting, lint, generated Next.js route types,
  TypeScript and tests. Its job name remains `test`, including for fork PRs.
- Actions are pinned to commit SHAs. The workflow token has read-only contents
  access, checkout does not persist credentials, and jobs time out after 15
  minutes. CI does not receive Contentful, Resend or deployment credentials.
- PRs use the normal `pull_request` event. Do not switch to
  `pull_request_target` to execute contributor code with elevated access.

These files do not change repository settings or enforce merge restrictions on
their own. The `CI` workflow was re-enabled on 19 October 2026; verify its current
state in Actions when applying the settings below.

## Admin handoff

An Orbs repository or organization administrator must update the active
[`main` ruleset](https://github.com/orbs-network/website-next/rules/24995757).
`sarbloc` currently has Write access, which is enough to be a code owner but
does not grant permission to change that ruleset.

Apply these settings after CODEOWNERS has merged into `main` and the new CI job
has completed successfully:

1. Keep enforcement **Active**, targeting only `refs/heads/main`.
2. Require a pull request and **one approving review**.
3. Enable **Require review from Code Owners**. This makes `sarbloc`'s approval
   mandatory; one approval without this setting permits another writer to
   approve instead.
4. Keep **Dismiss stale pull request approvals when new commits are pushed**
   enabled, and require review conversations to be resolved.
5. Require the successful **`test`** status check from **GitHub Actions**.
   Select the check actually reported by this workflow; do not accept an
   identically named result from an arbitrary integration. Require the branch
   to be up to date before merging.
6. Keep force pushes and branch deletion blocked. Do not add the automation
   account or App to any ruleset bypass list. Audit existing bypass actors so
   routine contributions cannot skip these requirements.

Keep the workflow enabled. Disabling a required workflow prevents contributors
from obtaining the successful check required for a merge.

CODEOWNERS uses the base branch, so editing ownership or workflow files must
also receive `sarbloc`'s approval after enforcement is enabled. GitHub does not
allow a PR author to approve their own PR. Move automation to the reserved
account before relying on this gate: its fork PRs can be approved by `sarbloc`
without giving the automation account organization membership or upstream
Write access. Human PRs authored by `sarbloc` also cannot be self-approved;
agree a separate review arrangement before using that path.

## Production access

The Vercel production branch is `main`. Review team/project access separately:
GitHub rules cannot stop someone with independent production-deploy permissions
from deploying through Vercel. Give contributors only the access they need,
keep production credentials out of preview builds, and do not grant the fork
account deployment access merely to let it submit code.

An admin should also check that GitHub secret scanning and push protection are
enabled and review the list of repository administrators. Those settings are
outside the protection supplied by this PR.

## Verify enforcement

After configuring the ruleset, use a harmless PR from a non-owner account to
check that:

- It cannot merge before `sarbloc` approves, even if another writer approves.
- It cannot merge while `test` is pending or failing, or conversations remain
  unresolved.
- Pushing a further change dismisses the previous approval and requires CI and
  review again.

Inspect the effective rules and account permissions rather than testing a
destructive force push or deletion against `main`.

References: [GitHub CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners),
[ruleset options](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets),
[Vercel access roles](https://vercel.com/docs/rbac/access-roles).
