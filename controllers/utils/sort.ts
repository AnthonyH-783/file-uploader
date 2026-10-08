// Fields that exist on both Folder and File, since one orderBy is used for both
const SORTABLE_FIELDS = ["name", "createdAt", "updatedAt"] as const;
export type SortField = (typeof SORTABLE_FIELDS)[number];

export const isSortField = (value: unknown): value is SortField =>
    typeof value === "string" && (SORTABLE_FIELDS as readonly string[]).includes(value);