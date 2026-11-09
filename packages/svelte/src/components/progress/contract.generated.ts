// Generated from foundations/components/feedback/progress/contract.json. Do not edit.
export type ProgressIntent = "accent" | "success" | "warning" | "danger";
export type ProgressSize = "sm" | "md" | "lg";
export const defaults = {
  "value": 0,
  "max": 100,
  "indeterminate": false,
  "showLabel": true,
  "showValue": false,
  "intent": "accent",
  "size": "md"
} as const;
