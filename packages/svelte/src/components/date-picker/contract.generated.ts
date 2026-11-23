// Generated from foundations/components/forms/date-picker/contract.json. Do not edit.
export type DatePickerSize = "sm" | "md" | "lg";
export const defaults = {
  "value": "",
  "locale": "en",
  "size": "md",
  "open": false,
  "disabled": false,
  "readonly": false,
  "invalid": false,
  "required": false,
  "openLabel": "Choose date",
  "previousLabel": "Previous month",
  "nextLabel": "Next month"
} as const;
export const childDefaults = {
  "panel": {},
  "day": {}
} as const;
