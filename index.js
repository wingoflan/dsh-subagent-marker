/**
 * Host half of dsh-subagent-marker.
 *
 * The marker is a pure browser-side affordance: `client.js` registers one slot
 * entry into the composer tool row. Nothing runs on the Host, but the loader
 * row in cordis.patch.yml mounts this module, so it has to export a callable
 * `apply`.
 *
 * No `export default`: the loader unwraps `exports.default ?? exports`, which
 * would discard the module namespace and with it any named export a future
 * change adds. Keep the namespace intact.
 */

/** Mount point for the Host half. Intentionally empty. */
export function apply() {}
