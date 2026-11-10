// Generated from foundations/components/navigation/tabs/contract.json. Do not edit.
export type TabsAppearance = "contained" | "line";
export type TabsSize = "sm" | "md" | "lg";
export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivation = "automatic" | "manual";
export const defaults = {
  "value": "",
  "appearance": "contained",
  "size": "md",
  "orientation": "horizontal",
  "activation": "automatic"
} as const;
export const childDefaults = {
  "trigger": {
    "disabled": false
  },
  "panel": {}
} as const;
