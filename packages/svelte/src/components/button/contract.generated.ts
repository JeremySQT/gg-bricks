// Generated from foundations/components/actions/button/contract.json. Do not edit.
export type ButtonIntent = "accent" | "neutral" | "danger";
export type ButtonAppearance = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export const defaults = {
  "intent": "accent",
  "appearance": "solid",
  "size": "md",
  "disabled": false,
  "loading": false
} as const;
