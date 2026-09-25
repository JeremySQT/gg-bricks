# Consumer entry point

Read index.json, then only the relevant sections of button.md. Prefer exported DS components over rebuilding their appearance. The local contract records platform-independent options and rules; the Markdown documents the actual Svelte API.

Import tokens.css once and set the three theme attributes on one ancestor. Do not copy Figma internal collections, variant scaffolding or fixture implementation into application code. Slots inherit color; icons use currentColor. Use snippets only for allowed non-interactive contents. Do not assume snippets enforce component identity.

Button is currently the only implementation. Alternative components named in the guide are planned, not exports. No component or documentation is publicly released by this package.
