import { FormEvent, useState } from "react";
import { UpdateCategoryForm } from "./UpdateCategoryForm";
import { Category, CategoryType, UpdateCategoryRequest } from "../../types/category";
import { Cart3, Coin } from "react-bootstrap-icons";
import { CategoryWithDepth } from "../../utils/flattenCategories";

interface CategoryCardProps {
    category: Category;
    categories: CategoryWithDepth[];
    depth?: number;
    onArchive: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
    onUpdate: (id: string, request: UpdateCategoryRequest) => Promise<void>;
}

export function CategoryCard({ category, categories, depth = 0, onArchive, onRestore, onUpdate }: CategoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <article className="category-row">
                <UpdateCategoryForm category={category} categories={categories}
                    onSave={onUpdate} onCancel={() => setIsEditing(false)} />
            </article>
        );
    }

    return (
        <article className={`category-row ${category.isArchived ? "category-row-archived" : ""}`}
            style={{ paddingLeft: `${depth * 32}px` }}>
            <div className="d-flex align-items-center justify-content-between py-3">
                <div className="d-flex align-items-center gap-3">

                    <div className={`rounded category-icon 
                        ${category.type === CategoryType.Income ? "category-icon-income" : "category-icon-expense"}`}>
                        {category.type === CategoryType.Income ? <Coin className="fs-4" /> : <Cart3 className="fs-4" />}
                    </div>

                    <div>
                        <div className="d-flex align-items-center gap-2">
                            <div className="text-success fw-bold">{category.name}</div>
                            {category.isArchived && (
                                <div className="badge text-bg-secondary">Архивная</div>
                            )}
                        </div>

                        {depth > 0 && (
                            <div className="small text-secondary">Подкатегория</div>
                        )}
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2 justify-content-end">
                    {!category.isArchived &&
                        <button className="btn card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
                    }

                    {category.isArchived ?
                        <button className="btn card-btn" onClick={() => onRestore(category.id)}>Восстановить</button>
                        :
                        <button className="btn card-btn" onClick={() => onArchive(category.id)}>Архивировать</button>
                    }
                </div>
            </div>
        </article >
    );
}