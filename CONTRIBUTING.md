# Working on Driving Display

Keep each milestone on a focused `codex/` feature branch and submit it through a pull request targeting `main`. Do not push development changes directly to `main` or merge without review.

Before opening or updating a pull request:

```sh
npm ci
npm run format:check
npm test
npm run build
git diff --check
```

Use `npm run format` to format source files. Include the lockfile when dependencies change; never commit `node_modules`, build output, or credentials.

Describe the user-visible change, how it was checked, and known limitations in the pull request. Keep local and remote feature branches synchronized by pushing completed commits. Fetch `origin` before starting new work and branch from the current `origin/main`.

Use separate pull requests for independent features; keep closely related implementation, tests, and documentation together. After a pull request merges, update local `main` with a fast-forward pull before starting the next milestone.
