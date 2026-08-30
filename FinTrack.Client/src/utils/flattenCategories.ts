import { Category } from "../types/category";

export interface CategoryWithDepth {
    category: Category;
    depth: number;
}

export function flattenCategoriesWithDepth(categories: Category[], depth = 0): CategoryWithDepth[] {
    return categories.flatMap(category => [
        { category, depth },
        ...flattenCategoriesWithDepth(category.children, depth + 1)
    ]);
}

export function getDescendantIds(category: Category): Set<string> {
    const ids = new Set<string>();
    function collect(current: Category) {
        for (const child of current.children) {
            ids.add(child.id);
            collect(child);
        }
    }
    collect(category);
    return ids;
}