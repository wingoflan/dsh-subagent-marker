# dsh-subagent-marker

**Marks the composer of a subagent session in DeepSeek Harness.**

A subagent session's composer looks exactly like a root session's. This plugin adds a small pill at the left end of the composer's tool row, so you can tell which one you are typing into.

The label follows the browser language: Chinese uses 「子代理」, every other locale uses `subagent`.

[English](README.md) | [中文](README.zh.md)

## What it does

- Renders the pill only when the open session is a subagent. Root sessions get nothing, so the row keeps its original layout and spacing.
- Hovering the pill names the mode (`continuable`, `one-shot`, `external`, or `unknown mode`) and the parent session's title.
- Colors come from the theme's warning token, so light and dark both work without a hardcoded palette.
- One slot entry, no Host logic, no network access.

One-shot subagents and subagents whose parent went offline get a read-only composer from DSH, which replaces the whole tool row. The pill does not appear there; those sessions cannot accept input anyway.

## Requirements

- DSH 0.2.1-rc.2 or newer. The plugin reads `subagent.address` from the session snapshot and registers into `conversation.input.left`, both of which exist at that version.

## Install

From the plugin market, once listed: **Settings → Plugin Manager** → search `dsh-subagent-marker` → install.

Manually:

```bash
dsh plugin add dsh-subagent-marker
```

From a local checkout:

```bash
dsh plugin add link:/absolute/path/to/dsh-subagent-marker
```

## Turning it off and on

Installing applies the plugin's own `cordis.patch.yml`. To make the switch a one-line edit, add one override row to the profile's `cordis.patch.yml`:

```yaml
- id: subagent-marker
  disabled: true
```

The profile layer is applied after every bundle layer, and a patch without `insert` overrides the entry with that id — so this one row reaches the row the bundle inserted. Deleting it switches the marker back on. Save the file and the Host recomposes the plugin tree; the browser module graph follows, so the pill appears or disappears without a restart or a page reload.

Do not repeat the `insert` block in the profile layer. Two entries with the same id both mount, and the marker would then register its slot entry twice.

## Uninstall

Delete the row from the profile's `cordis.patch.yml`, then:

```bash
dsh plugin remove dsh-subagent-marker
```

## How it works

The package has two halves. `index.js` is the Host half and exports an empty `apply()`. Everything visible lives in `client.js`, which the Host serves to the page because `package.json` declares `dsh.client` and exports `./client`.

`client.js` registers one entry into the `conversation.input.left` slot — a list slot at the left end of the composer tool row, after the permission selector and the plan control. The component reads `subagent` from the session snapshot: `null` on a root session, `{ address, parentAvailable? }` on a subagent. When it is `null` the component returns `null`, so nothing is added to the DOM.

## Development

There is no build step. `exports["./client"]` points straight at `client.js`, so editing that file is editing what the browser receives. Restart the Host once after the first install; after that, saving any file takes effect on the next load.

## Publishing

Not published to npm or to a plugin market index yet. Release steps are still to be decided.

## License

MIT
