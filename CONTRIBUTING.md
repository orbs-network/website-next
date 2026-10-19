# Contributing

Use a feature branch and a pull request for every change. Contributors without
access to `orbs-network/website-next` can fork this public repository and open a
PR from their fork. Use a separate automation account for automated PRs so
`sarbloc` can review them independently.

Before requesting review, run:

```sh
npm ci
npx playwright install chromium
npm run format:check
npm run lint
npx next typegen
npx tsc --noEmit
npm test
```

For layout changes, check desktop and mobile in both themes. Follow the build
and overflow-check instructions in `CLAUDE.md`; production builds need Contentful
configuration and are not part of the credential-free fork CI job.

Keep PRs focused and describe the visible result and validation. Do not commit
tokens, keys, local environment files, Contentful CLI credentials, raw Figma
exports or visual-review output. CI does not need application secrets.

Request review from `sarbloc`. New commits require renewed approval once the
main ruleset is configured. Independent automated review supplements that
approval; it does not replace it. Do not merge with failed checks or deploy
unreviewed code. Production deployment is handled separately by an authorized
maintainer.

Repository owners must finish the enforcement steps in
[Repository protection](docs/repository-protection.md). CODEOWNERS alone requests
review; the ruleset makes approval and CI mandatory.
