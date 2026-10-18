# Changesets

Every pull request that changes `packages/topclassui` adds one file here: `pnpm changeset`, pick `topclassui`, pick the bump, write one line a user can read.

The line is `0.x`: a breaking change may land in a minor, and its changeset carries the migration note.

Releases are in beta pre-mode (`pre.json`): `pnpm changeset version` writes `0.1.0-beta.N` and `packages/topclassui/CHANGELOG.md`. `pnpm changeset pre exit` ends the line when `0.1.0` goes to `latest`. The publish itself is by hand, from the laptop, on the `beta` tag.
