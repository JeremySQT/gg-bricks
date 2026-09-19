---
name: ds-component-contract
description: Scope and draft or revise a compact platform-independent JSON contract for a design-system component, including parts, states, tokens and intrinsic rules. Use before component design or when its public conceptual behavior changes.
---

# DS component contract

Read [decisions](../../docs/decisions.md), [the contract guide](../../docs/contract-guide.md), the target component status and relevant existing contracts. Keep this skill alongside these shared repo references.

1. Identify the component's purpose, alternatives, boundaries and required subcomponents. Ask only about consequential choices not covered by approved conventions.
2. Inspect actual token sources and supported contexts. Use existing semantic roles; propose missing roles with their scope and fallback coverage.
3. Draft from [the minimal skeleton](../../templates/component-contract.json), preserving the five substantive blocks. Use the repository's established nested notation when available. Exact JSON Schema is not yet approved; label newly proposed notation accordingly.
4. Make defaults, optionality, allowed slot contents and relevant state interactions explicit without speculative features. Keep intrinsic rules short, factual and English.
5. Check portability. Move DOM/CSS/Svelte/Figma mechanics to implementation or adapter notes while retaining underlying behavioral requirements in the contract.
6. Review internal consistency and token references. Use available schema and semantic validators; state which checks actually ran and which remain manual. Parsing JSON is not schema validation.
7. Present the draft with only the decisions and differences the user needs to assess. Capture contract approval against its exact revision through [the lifecycle](../../docs/workflow.md).

Do not copy a partial pilot contract as though complete. Do not invent component names, token paths, events, dependencies or accepted decisions. Do not omit indispensable interaction rules to minimize file size.

Outputs: draft/revised contract, token proposals if needed, resolved/open decisions, verification evidence and updated status. No Figma or code generation is required merely to draft the contract.
