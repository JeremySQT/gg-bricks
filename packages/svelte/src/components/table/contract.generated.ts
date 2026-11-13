// Generated from foundations/components/data/table/contract.json. Do not edit.
export type TableSize = "sm" | "md" | "lg";
export const defaults = {
  "hideCaption": false,
  "size": "md",
  "columnLines": false
} as const;
export type TableHeadingAlign = "start" | "center" | "end";
export type TableCellAlign = "start" | "center" | "end";
export const childDefaults = {
  "header": {},
  "body": {},
  "footer": {},
  "row": {},
  "heading": {
    "align": "start"
  },
  "cell": {
    "align": "start",
    "rowHeader": false
  }
} as const;
