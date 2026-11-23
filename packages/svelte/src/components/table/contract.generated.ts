// Generated from foundations/components/data/table/contract.json. Do not edit.

export const defaults = {
  "hideCaption": false,
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
