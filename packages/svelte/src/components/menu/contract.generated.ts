// Generated from foundations/components/overlays/menu/contract.json. Do not edit.
export type MenuSide = "bottom" | "top";
export type MenuAlign = "start" | "center" | "end";
export const defaults = {
  "open": false,
  "side": "bottom",
  "align": "start"
} as const;
export type MenuItemIntent = "neutral" | "danger";
export const childDefaults = {
  "item": {
    "value": "",
    "intent": "neutral",
    "disabled": false
  },
  "separator": {},
  "group": {}
} as const;
