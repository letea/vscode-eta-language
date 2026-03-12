---
name: eta-formatter-guardrails
description: Protect Eta formatter behavior while evolving indentation logic. Use when editing formatter.js, indentation depth logic, mixed Eta/HTML line handling, or format output examples.
---

# Eta Formatter Guardrails

## Purpose

Evolve formatting behavior without changing Eta template semantics.

## Canonical Syntax Reference

Prioritize Eta official docs: <https://eta.js.org/>

Focus areas:
- Interpolation tags (`<%= ... %>`)
- Raw output tags (`<%~ ... %>`)
- Script/comment blocks (`<% ... %>`, `/* ... */`)
- Whitespace control markers (`-`)

## Workflow

1. Read `formatter.js` and identify the exact decision points being changed.
2. Define before/after output examples first.
3. Keep the algorithm deterministic for:
   - HTML depth transitions
   - Eta structure depth transitions
   - mixed Eta+HTML line splitting
4. Avoid rewriting JS expressions inside Eta tags.
5. If output behavior changes, sync examples in `README.md`.

## Safety Rules

- Do not reorder user code across `%>` boundaries.
- Do not strip meaningful markers or delimiters.
- Do not apply broad normalization that alters template intent.
- Prefer minimal, local changes over large rewrites.

## Minimal Validation Cases

- Eta-only multi-line code block with nested braces.
- HTML nesting with Eta interpolation content.
- One line that mixes Eta closing tag and following HTML.
- Comment block rendering pattern with Eta wrapper.

