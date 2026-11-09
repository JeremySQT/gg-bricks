// Generated from foundations/components/feedback/toast/contract.json. Do not edit.
export type ToastPlacement = "top-start" | "top-center" | "top-end" | "bottom-start" | "bottom-center" | "bottom-end";
export const defaults = {
  "placement": "bottom-end",
  "max": 3,
  "label": "Notifications"
} as const;
export type ToastItemIntent = "neutral" | "info" | "success" | "warning" | "danger";
export type ToastItemAppearance = "neutral" | "intense";
export const childDefaults = {
  "item": {
    "intent": "neutral",
    "appearance": "neutral",
    "description": "",
    "duration": 5000,
    "dismissLabel": "Dismiss",
    "closable": true
  }
} as const;
