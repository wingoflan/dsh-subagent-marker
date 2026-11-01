# dsh-subagent-marker

**Marks the composer of a subagent session in DeepSeek Harness.**

A subagent session's composer looks exactly like a root session's. This plugin adds a `subagent` marker at the right end of the composer's tool row, just before the submit button, so you can tell which one you are typing into.

[English](https://github.com/wingoflan/dsh-subagent-marker/blob/main/README.en.md) | [中文](https://github.com/wingoflan/dsh-subagent-marker/blob/main/README.md)

![The subagent marker at the right end of a subagent session's composer](https://raw.githubusercontent.com/wingoflan/dsh-subagent-marker/main/assets/screenshot.png)

## What it does

- Renders the marker only when the open session is a subagent. Root sessions get nothing, so the row keeps its original layout and spacing.

One-shot subagents and subagents whose parent went offline get a read-only composer from DSH, which replaces the whole tool row. The marker does not appear there; those sessions cannot accept input anyway.

## Install

Manually:

```bash
dsh plugin add dsh-subagent-marker
```

From a local checkout:

```bash
dsh plugin add link:/absolute/path/to/dsh-subagent-marker
```

## Turning it off and on

Installing applies the plugin's own `cordis.patch.yml`. To switch it off, add one override row to the profile's `cordis.patch.yml`:

```yaml
- id: subagent-marker
  disabled: true
```

The profile layer is applied after every bundle layer, and a patch without `insert` overrides the entry with that id — so this one row reaches the row the bundle inserted. Deleting it switches the marker back on.

Do not repeat the `insert` block in the profile layer. Two entries with the same id both mount, and the marker would then register its slot entry twice.

## Uninstall

Delete the override row from the profile's `cordis.patch.yml`, then:

```bash
dsh plugin remove dsh-subagent-marker
```

## How it works

The package has two halves. `index.js` is the Host half and exports an empty `apply()`. Everything visible lives in `client.js`, which the Host serves to the page because `package.json` declares `dsh.client` and exports `./client`.

`client.js` registers one entry into the `conversation.input.right` slot — a list slot in the right control cluster of the composer tool row, next to the model selector and before the stop and submit buttons. The component reads `subagent` from the session snapshot and returns `null` on a root session, so nothing is added to the DOM.

## Development

There is no build step. `exports["./client"]` points straight at `client.js`, so editing that file is editing what the browser receives. The first install needs a Host restart before the new package loads.

## License

MIT
