// Generated from foundations/components/forms/combobox/contract.json. Do not edit.
export type ComboboxFilter = "contains" | "none";
export type ComboboxSize = "sm" | "md" | "lg";
export interface ComboboxOptionsRecord {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}
export const defaults = {
  "value": "",
  "inputValue": "",
  "options": [],
  "filter": "contains",
  "emptyLabel": "No results",
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
