/**
 * Browser half of dsh-subagent-marker.
 *
 * Registers one entry into the composer's left tool-row slot and renders a
 * small marker when the open session is a subagent. Root sessions render
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

    /** Slot the marker occupies: left end of the composer tool row. */
    const SLOT = 'conversation.input.left';
    /** Registration id, unique among the slot's list entries. */
    const ENTRY_ID = 'subagent-marker';
    /** Stylesheet key, keeping one tag across mounts. */
    const STYLE_ID = 'dsh-subagent-marker/style';

    const CSS = `
.dsmSubagentMarker {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--dsw-radius-sm);
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary) 12%, transparent);
  color: var(--dsw-alias-state-warn-primary);
  font-size: 12px;
  white-space: nowrap;
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
     * The marker.
     * @param props - standard slot props.
     * @param props.useSession - this session's snapshot selector.
     * @returns the marker, or null on a root session.
     */
    function SubagentMarker({ useSession }) {
      const isSubagent = useSession((snapshot) => snapshot.subagent !== null);
      if (!isSubagent) return null;
      return React.createElement('span', { className: 'dsmSubagentMarker' }, 'subagent');
    }

    /**
     * Mount the marker.
     * @param ctx - client root context.
     */
    function apply(ctx) {
      ctx.effect(mountStyles, 'subagent-marker: stylesheet');

      // The slot is declared by dsh-client-ui-conversation; `inject` waits for
      // that declaration and re-registers if it is ever re-declared.
      ctx.slots.inject(SLOT, () => ctx.slots.register(
        {
          name: SLOT,
          id: ENTRY_ID,
          order: -10,
        },
        SubagentMarker,
      ));
    }

    exports.apply = apply;
    exports.inject = ['slots'];

    return module.exports;
  },
});
