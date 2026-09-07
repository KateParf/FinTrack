import { FormEvent, useState } from "react";
import { CategoryType, categoryTypeLabels } from "../../types/category";
import { createCategory } from "../../api/categoriesApi";
import { CategoryWithDepth } from "../../utils/flattenCategories";

interface CreateCategoryFormProps {
    categories: CategoryWithDepth[];
    onCreate: () => Promise<void>;
}

export function CreateCategoryForm({ categories, onCreate }: CreateCategoryFormProps) {
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<CategoryType>(CategoryType.Income);
    const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const typeOptions = Object.entries(categoryTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));

    const allCategories = categories.filter(category => !category.category.isArchived);

    function handleParentChange(value: string) {
        if (value === "") {
            setParentCategoryId(null);
            return;
        }
        const parent = allCategories.find(category => category.category.id === value);
        if (!parent) return;
        setParentCategoryId(parent.category.id);
        setType(parent.category.type);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);
        try {
            await createCategory({
                name,
                type,
                parentCategoryId
            });
            await onCreate();
            setName("");
            setType(CategoryType.Income);
            setParentCategoryId(null);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось создать категорию");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <article className="card col-12 ms-0 mb-3">
            <form className="card-body" onSubmit={handleSubmit}>
                <div className="row align-items-end">
                    <div className="col-lg-4">
                        <label htmlFor="name" className="form-label">Название </label>
                        <input id="name" value={name} className="form-control"
                            onChange={event =>
                                setName(event.target.value)
                            }
                            required />
                    </div>

                    <div className="col-lg-2">
                        <label htmlFor="type" className="form-label">Тип </label>
                        <select id="type" value={type}
                            className="form-select" disabled={parentCategoryId !== null}
                            onChange={event => {
                                const value = event.target.value;
                                setType(Number(value) as CategoryType)
                            }}>
                            {typeOptions}
                        </select>
                    </div>

                    <div className="col-lg-4">
                        <label htmlFor="parentCategory" className="form-label">Общая категория </label>
                        <select id="parentCategory" value={parentCategoryId ?? ""} className="form-select"
                            onChange={event =>
                                handleParentChange(event.target.value)
                            }>
                            <option value="">Без общей категории</option>
                            {allCategories.map(({ category, depth }) => (
                                <option key={category.id} value={category.id}>
                                    {"— ".repeat(depth)}{category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-lg-2 d-flex justify-content-end">
                        <button className="btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Создать"}</button>
                    </div>
                </div>
            </form>
        </article>
    );
}
