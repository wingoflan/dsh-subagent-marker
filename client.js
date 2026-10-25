/**
 * Browser half of dsh-subagent-marker.
 *
 * Registers one entry into the composer's left tool-row slot and renders a
 * small pill when the open session is a subagent. Root sessions render
 * nothing, so the row keeps its original layout there.
 *
 * Hand-written `__ModuleLoader__` package shell: no build step, so editing this
 * file is editing what the browser receives.
 */
window.__ModuleLoader__.load({
  id: 'dsh-subagent-marker',
  factory: (require) => {
    'use strict';
    const module = { exports: {} };
    const exports = module.exports;

    const React = require('react');
    const h = React.createElement;
    const { Tooltip } = require('@deepseek-ai/dsh-client-ui-primitives');

    /** Slot the pill occupies: left end of the composer tool row. */
    const SLOT = 'conversation.input.left';
    /** Registration id, unique among the slot's list entries. */
    const ENTRY_ID = 'subagent-marker';
    /** Locale namespace owned by this plugin. */
    const NS = 'subagent-marker';
    /** Stylesheet key, keeping one tag across mounts. */
    const STYLE_ID = 'dsh-subagent-marker/style';

    /**
     * Composer dictionaries. Plugin metadata (`meta.title`, `meta.description`)
     * lives in locale/*.json and is read by the Host; these objects are what the
     * browser translator serves.
     */
    const zh = {
      label: '子代理',
      'tip.mode': '模式：{mode}',
      'tip.parent': '父会话：{title}',
      'tip.parentUnavailable': '父会话：不可用',
      'tip.parentUnknown': '父会话：未知',
      'mode.continuable': '可继续',
      'mode.oneShot': '一次性',
      'mode.external': '外部',
      'mode.unknown': '模式未知',
    };

    const en = {
      label: 'subagent',
      'tip.mode': 'Mode: {mode}',
      'tip.parent': 'Parent: {title}',
      'tip.parentUnavailable': 'Parent: unavailable',
      'tip.parentUnknown': 'Parent: unknown',
      'mode.continuable': 'continuable',
      'mode.oneShot': 'one-shot',
      'mode.external': 'external',
      'mode.unknown': 'unknown mode',
    };

    /** Session snapshot `address.mode` values, mapped to dictionary keys. */
    const MODE_KEYS = {
      continuable: 'mode.continuable',
      'one-shot': 'mode.oneShot',
      external: 'mode.external',
    };

    const CSS = `
.dsmSubagentMarker {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  height: 22px;
  max-width: 160px;
  padding: 0 8px;
  border-radius: var(--dsw-radius-sm);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--dsw-alias-state-warn-primary);
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: default;
  user-select: none;
}`;

    /**
     * Install the stylesheet into document.head.
     * @returns disposer removing the tag this call created.
     */
    function mountStyles() {
      if (typeof document === 'undefined') return () => {};
      const existing = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`);
      if (existing !== null) return () => {};
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-subagent-marker';
      tag.dataset.pluginCss = STYLE_ID;
      tag.textContent = CSS;
      document.head.appendChild(tag);
      return () => {
        tag.remove();
      };
    }

    /**
     * The pill.
     *
     * Kit props used: `useSession` (this session's snapshot, source of the
     * `subagent` field), `useSessions` (session list, source of the parent
     * title), and `t` (this plugin's dictionary).
     *
     * Every selector returns a primitive or a string, never the `subagent`
     * object itself: the snapshot rebuilds that object on each change, so
     * selecting it would re-render on unrelated updates.
     *
     * @param props - standard slot props plus the namespace translator.
     * @returns the pill, or null on a root session.
     */
    function SubagentMarker({ useSession, useSessions, t }) {
      const isSubagent = useSession((snapshot) => snapshot.subagent !== null);
      const mode = useSession((snapshot) => snapshot.subagent?.address.mode);
      const parentSessionId = useSession((snapshot) => snapshot.subagent?.address.parentSessionId);
      const parentAvailable = useSession((snapshot) => snapshot.subagent?.parentAvailable);
      const parentTitle = useSessions((state) => {
        if (parentSessionId === undefined) return undefined;
        return state.byId[parentSessionId]?.title;
      });

      if (!isSubagent) return null;

      const modeKey = MODE_KEYS[mode] ?? 'mode.unknown';
      const parentLine = parentAvailable === false
        ? t('tip.parentUnavailable')
        : parentTitle === undefined
          ? t('tip.parentUnknown')
          : t('tip.parent', { title: parentTitle });
      const tip = `${t('tip.mode', { mode: t(modeKey) })} · ${parentLine}`;

      // The pill's own text is its accessible name; Tooltip attaches
      // aria-describedby for the detail line, so no aria-label is needed.
      return h(
        Tooltip,
        { label: tip, side: 'top', delayMs: 500 },
        h(
          'span',
          {
            className: 'dsmSubagentMarker',
            'data-subagent-mode': mode,
          },
          t('label'),
        ),
      );
    }

    /**
     * Mount the marker.
     * @param ctx - client root context.
     */
    function apply(ctx) {
      const locale = ctx.locale;
      ctx.effect(() => {
        try {
          return locale.register(NS, { zh, en });
        } catch {
          // A twin instance may already own the namespace during a hot
          // reload; `bind` still resolves the same dictionaries, and the
          // slot entry below supplies `t` through `locale: NS`.
          return () => {};
        }
      }, 'subagent-marker: dictionaries');
      ctx.effect(mountStyles, 'subagent-marker: stylesheet');

      // The slot is declared by dsh-client-ui-conversation; `inject` waits for
      // that declaration and re-registers if it is ever re-declared.
      ctx.slots.inject(SLOT, () => ctx.slots.register(
        {
          name: SLOT,
          id: ENTRY_ID,
          order: -10,
          locale: NS,
        },
        SubagentMarker,
      ));
    }

    exports.apply = apply;
    exports.inject = ['slots', 'locale'];

    return module.exports;
  },
});
