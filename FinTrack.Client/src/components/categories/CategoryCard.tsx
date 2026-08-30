import { FormEvent, useState } from "react";
import { UpdateCategoryForm } from "./UpdateCategoryForm";
import { Category, categoryTypeLabels, UpdateCategoryRequest } from "../../types/category";

interface CategoryCardProps {
    category: Category;
    categories: Category[];
    onArchive: (id: string) => Promise<void>;
    onRestore: (id: string) => Promise<void>;
    onUpdate: (id: string, request: UpdateCategoryRequest) => Promise<void>;
}

export function CategoryCard({ category, categories, onArchive, onRestore, onUpdate }: CategoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return (
            <UpdateCategoryForm category={category} categories={categories}
                onSave={onUpdate} onCancel={() => setIsEditing(false)} />
        );
    }

    return (
        <article className="card">
            <div className="card-body">
                <div className="card-title">
                    <h3>{category.name}</h3>
                    {!category.isArchived && (
                        <button className="card-btn" onClick={() => setIsEditing(true)}>Редактировать</button>
                    )}
                </div>
                <div className="card-text">Тип: {categoryTypeLabels[category.type]}</div>
                {category.children.length != 0 &&
                    <div>
                        <h4>Подкатегории</h4>
                        {category.children.map(child => (
                            <CategoryCard key={child.id} category={child} categories={categories} onRestore={onRestore} onArchive={onArchive} onUpdate={onUpdate} />
                        ))}
                    </div>
                }
                {category.isArchived ?
                    (<div>
                        Архивная
                        <button className="card-btn" onClick={() => onRestore(category.id)}>Восстановить</button>
                    </div>) :
                    <div><button className="card-btn" onClick={() => onArchive(category.id)}>Архивировать</button></div>
                }
            </div>
        </article>
    );
}