// Generated from foundations/components/navigation/pagination/contract.json. Do not edit.
export type PaginationSize = "sm" | "md" | "lg";
export const defaults = {
  "page": 1,
  "pageCount": 1,
  "siblingCount": 1,
  "showEdges": false,
  "size": "md",
  "label": "Pagination",
  "previousLabel": "Previous page",
  "nextLabel": "Next page",
  "firstLabel": "First page",
  "lastLabel": "Last page"
} as const;
export const childDefaults = {
  "item": {},
  "ellipsis": {}
} as const;
