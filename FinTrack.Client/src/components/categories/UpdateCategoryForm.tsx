import { FormEvent, useState } from "react";
import { Category, categoryTypeLabels, UpdateCategoryRequest } from "../../types/category";
import { CategoryWithDepth, getDescendantIds } from "../../utils/flattenCategories";

interface UpdateCategoryFormProps {
    category: Category;
    categories: CategoryWithDepth[];
    onSave: (id: string, request: UpdateCategoryRequest) => Promise<void>;
    onCancel: () => void;
}

export function UpdateCategoryForm({ category, categories, onSave, onCancel }: UpdateCategoryFormProps) {
    const [name, setName] = useState(category.name);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(category.parentCategoryId);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const descendantIds = getDescendantIds(category);
    const availableParents = categories.filter(candidate =>
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
        <form className="card-body px-0" onSubmit={handleSubmit}>
            <div className="row align-items-end">
                <div className="col-lg-4">
                    <label htmlFor="name" className="form-label">Название </label>
                    <input id="name" value={name} className="form-control"
                        onChange={event =>
                            setName(event.target.value)
                        }
                        required />
                </div>

                <div className="col-lg-4">
                    <label htmlFor="parentCategory" className="form-label">
                        Общая категория | {categoryTypeLabels[category.type]}
                    </label>
                    <select id="parentCategory" value={parentCategoryId ?? ""} className="form-select"
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

                <div className="col-lg-4">
                    <div className="d-flex gap-2 justify-content-end">
                        <button className="btn card-btn" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Обновляем..." : "Обновить"}
                        </button>
                        <button className="btn" type="button" onClick={onCancel} disabled={isSubmitting}>
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
            {error && <p className="alert alert-danger mt-4">{error}</p>}
        </form>
    );
}
