# Pilot evidence and limitations

Source: ds-token-pilot.zip, version 1, read for this consolidation. Full scripts, fixtures and report remain in that archive.

Figma: https://www.figma.com/design/rbSwsS9s9SaWSRL7qTPiPE

Recorded initial experiment: base plus two brands, two appearances and three densities; 18 combinations from one Button component. 324 checks passed. Independent mode switching on a single instance was verified. The user subsequently checked modes and variables and accepted the pilot.

Recorded synchronization experiment:
- Three source changes propagated as four variable-mode writes.
- Repeat synchronization performed zero writes.
- 469 checks passed across 19 instances, 27 variables and one component.
- Temporary label overrides and the user's additional instance survived.
- Rollback performed four inverse writes; another 469 checks passed.
- Original labels and token values were restored.

Scope: existing scalar values and aliases only. No validation of a complete Button, token rename/removal/type migration, component structure migration, publication, concurrent editing, mobile adaptation or cross-file consumers.

Typography was not validated: Inter substituted for unavailable Arial. The generic resolver and synchronizer are experimental, not complete DTCG or production compatibility guarantees.
