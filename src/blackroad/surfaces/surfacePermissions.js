// BlackRoad OS — Surface Permissions
// Permission checks for gated surfaces (capture, roadnode, etc.)

import { UNIVERSAL_COPY } from '../productCopy.js';

// Permissions that require explicit user consent
const GATED_PERMISSIONS = ['capture', 'roadnode-consent', 'device-access', 'location'];

// Check if a surface requires permission
export function requiresPermission(surface) {
  if (!surface || !surface.permissions) return false;
  return surface.permissions.some(p => GATED_PERMISSIONS.includes(p));
}

// Get the consent message for a permission
export function getConsentMessage(permission) {
  switch (permission) {
    case 'capture':
      return 'Screen capture requires your explicit permission. BlackRoad does not capture automatically.';
    case 'roadnode-consent':
      return UNIVERSAL_COPY.roadNodeConsent;
    case 'device-access':
      return 'This surface requests access to device capabilities. You can grant or deny this at any time.';
    case 'location':
      return 'This surface requests location access. You can grant or deny this at any time.';
    default:
      return 'This surface requires additional permissions.';
  }
}

// Check all permissions for a surface
export function checkPermissions(surface) {
  if (!requiresPermission(surface)) return { allowed: true, gates: [] };

  const gates = surface.permissions
    .filter(p => GATED_PERMISSIONS.includes(p))
    .map(p => ({ permission: p, message: getConsentMessage(p), granted: false }));

  return { allowed: false, gates };
}
