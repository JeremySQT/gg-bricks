// Generated from foundations/components/forms/select/contract.json. Do not edit.
export type SelectSize = "sm" | "md" | "lg";
export interface SelectOptionsRecord {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}
export const defaults = {
  "value": "",
  "options": [],
  "size": "md",
  "open": false,
  "disabled": false,
  "readonly": false,
  "invalid": false,
  "required": false
} as const;
export const childDefaults = {
  "panel": {},
  "option": {},
  "group": {}
} as const;
