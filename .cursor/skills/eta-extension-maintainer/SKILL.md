---
name: eta-extension-maintainer
description: Maintain VS Code/Cursor Eta extension manifest and command wiring consistently. Use when changing package.json contributes, activationEvents, command IDs, keybindings, or extension.js command/formatter registration.
---

# Eta Extension Maintainer

## Purpose

Keep extension runtime behavior and manifest declarations synchronized.

## Trigger Scenarios

Use this skill when tasks mention:
- command registration
- activation events
- keybindings
- formatter provider wiring
- extension settings keys

## Workflow

1. Read `package.json` and `extension.js`.
2. Map command IDs across:
   - `contributes.commands`
   - `activationEvents`
   - `vscode.commands.registerCommand(...)`
3. Verify keybinding scope and `when` clause still match Eta-only intent.
4. Verify formatter settings keys in manifest and runtime access code are identical.
5. If behavior changed, update `README.md` in the same task.

## Checklist

- [ ] Manifest and runtime command IDs are exact matches.
- [ ] `eta.formatDocument` path still triggers format command flow.
- [ ] `eta.debugBlockComment` handles selection and line-level usage.
- [ ] Eta-only keybinding does not leak into other languages.
- [ ] User-facing behavior changes are documented.

## Minimal Validation

1. Open `.eta` file in development host.
2. Run `Eta: Format Document`.
3. Trigger `cmd+/` for comment wrapping behavior.
4. Confirm behavior in a non-eta file is unchanged.

