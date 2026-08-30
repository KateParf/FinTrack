import { FormEvent, useState } from "react";
import { Category, categoryTypeLabels, UpdateCategoryRequest } from "../../types/category";
import { flattenCategoriesWithDepth, getDescendantIds } from "../../utils/flattenCategories";

interface UpdateCategoryFormProps {
    category: Category;
    categories: Category[];
    onSave: (id: string, request: UpdateCategoryRequest) => Promise<void>;
    onCancel: () => void;
}

export function UpdateCategoryForm({ category, categories, onSave, onCancel }: UpdateCategoryFormProps) {
    const [name, setName] = useState(category.name);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(category.parentCategoryId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const allCategories = flattenCategoriesWithDepth(categories);
    const descendantIds = getDescendantIds(category);
    const availableParents = allCategories.filter(candidate =>
        candidate.category.id !== category.id &&
        !descendantIds.has(candidate.category.id) &&
        candidate.category.type === category.type &&
        !candidate.category.isArchived
    );

    function handleParentChange(value: string) {
        if (value === "") {
            setParentCategoryId(null);
            return;
        }
        const parent = availableParents.find(category => category.category.id === value);
        if (!parent) return;
        setParentCategoryId(parent.category.id);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await onSave(category.id, {
                name,
                parentCategoryId
            });
            onCancel();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось обновить категорию");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="card" onSubmit={handleSubmit}>
            <div className="card-body">
                <div className="card-text">
                    <label htmlFor="name">Название </label>
                    <input id="name" value={name}
                        onChange={event =>
                            setName(event.target.value)
                        }
                        required />
                </div>

                <div className="card-text">
                    Тип: {categoryTypeLabels[category.type]}
                </div>

                <div className="card-text">
                    <label htmlFor="parentCategory">Общая категория </label>
                    <select id="parentCategory" value={parentCategoryId ?? ""}
                        onChange={event =>
                            handleParentChange(event.target.value)
                        }>
                        <option value="">Без общей категории</option>
                        {availableParents.map(({ category, depth }) => (
                            <option key={category.id} value={category.id}>
                                {"— ".repeat(depth)}{category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Обновляем..." : "Обновить"}</button>
                <button className="card-btn" type="button" onClick={() => onCancel()}>Отмена</button>
            </div>
        </form>
    );
}
