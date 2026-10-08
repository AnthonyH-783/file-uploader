import { SortField } from "./sort"

export const pageHref = (p:number, sort: SortField, dir : "asc" | "desc", limit:number) => {
    const params = new URLSearchParams({sort, dir, page: String(p)});
    if(limit) params.set("limit", String(limit));
    return `?${params}`;
}