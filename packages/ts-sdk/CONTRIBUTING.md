# Contributing to docmaps ts-sdk

We welcome contributions from anyone interested in improving [Project Name]! Before you get started, please read through the guidelines below to ensure that your contributions are effective and useful.

## Workflow
1. Fork the repository and clone it locally, or create a branch.
2. [Recommended] Install pnpm if you haven't already: `npm install -g pnpm`
3. Run pnpm install in the package directory to install all dependencies for the project.
4. Add, commit, and push your changes to your fork/branch.
5. Submit a pull request (PR) to the main branch of the `docmaps-project/docmaps` repository.

## Contributing Guidelines
1. Follow the code of conduct.
2. Before starting any work, make sure to check the issues and pull requests to see if your contribution has already been discussed or implemented.
3. If you are working on a new feature or bug fix, create a new issue to discuss it with the maintainers and other contributors.
4. Before submitting a PR, make sure your code is properly formatted, tested, and documented.
5. Make sure your commit messages are descriptive and follow the conventional commit format (imperative tense). Your PR will be merged with a squash.

Write new tests to cover any new functionality or bug fixes.

## Code Review
All PRs will be reviewed by at least one maintainer or contributor.
Reviewers may request changes or ask for clarifications on the PR.
Once the changes have been made, the PR will be merged by a maintainer or contributor.

## Local development

[`nvm`](https://github.com/nvm-sh/nvm) is a good local Node version manager.

```
nvm use 18.14.0
```

I recommend you use `pnpm` for best performance. Alternatively you can use `npm`.

```bash
pnpm install
pnpm test && pnpm build
```

If these exit zero, you're good to get started with your changes.

## Tests

Tests are written BDD-style. You should make meaningful assertions that cover
any new complex logic. You don't have to cover every possible case. It is recommended
to follow the red-green-refactor pattern by writing tests first. As a rule of thumb,
if your code change can be reverted while leaving your test changes in place, and the
suites still pass, your test coverage or specificity should be increased.

**Hanging tests.**
Test are run using [AVA](https://github.com/avajs/ava). This has much smaller dependency footprint than Jest. 
However it runs `tsc` in a hidden way such that if compilation fails, you will get `Timed out while running tests`
rather than a useful error. Diagnose this issue by running `pnpm build` yourself to get a better error message.

Every PR is validated by a Github Actions workflow for EVERY package in the repo, not just the
one you are developing on.

Thanks for contributing!
