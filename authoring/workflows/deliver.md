# Deliver a version

Merging a component or foundations pull request into `main` is not a release: Deliver publishes what `main` contains to its destinations (npm, Figma library, docs site) with a version.

## Procedure

1. **Scope the release.** Identify included components, source revisions, supported targets/contexts and intended destinations. Distinguish sharing a reference kit from publishing a production library.
2. **Prepare release facts.** Determine version under the adopted policy, changelog, dependency changes, compatibility and migration notes. If no versioning policy exists, propose it with the concrete release. Check the scoped definition of Done and outstanding blockers.
3. **Build artifacts.** Generate tokens and package outputs through existing scripts. Include version-aligned human and agent docs and verified examples. Inventory Figma component references and publishing requirements. Do not edit generated output by hand.
4. **Verify consumption.** Install the exact package artifact in an isolated representative project; exercise public imports, styles, required behavior and local documentation discovery. Inspect intended Figma usage and properties. Validate docs links and compatibility notes. Reuse evidence only when revisions and scope still match.
5. **Present the release for approval.** Supply exact artifacts/revisions, included changes, checks, limitations, migrations and intended destinations. Obtain any missing publication authorization only after the release is concrete and reviewable. Existing explicit authorization need not be requested again.
6. **Distribute within authorization.** Publish or make available only to authorized destinations. Verify the version is actually retrievable/usable. If one channel fails, record partial delivery and the successful channels; do not label the whole release published.
7. **Record delivery.** Save delivered identifiers, artifact digests, verification evidence and known limitations. Mark components Done only within their declared scope and when all completion conditions hold.

## Outputs

Release artifacts, release record, migration notes where relevant, availability evidence and updated status. Use [the release record](../templates/release-record.md). Registry, Figma-library and documentation-site publication are distinct operations; a successful local build does not perform any of them.
