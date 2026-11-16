# Agent instructions

## Domain language

`CONTEXT.md` is the glossary of Uchimata's domain terms. Use those terms, and point out any usage that conflicts with them.

`CONTEXT.md` comes from the `domain-modeling` skill and follows that skill's glossary format. Update it through the skill, or keep to the same format when editing it by hand.

## Architecture decision records

All ADRs live in a single file, `docs/adr.md`, one `## NNNN: Title` section per decision. Add a new decision by appending a section with the next number. Do not create a `docs/adr/` directory or separate ADR files. This deliberately departs from the `domain-modeling` skill's default of one file per ADR in `docs/adr/`.
