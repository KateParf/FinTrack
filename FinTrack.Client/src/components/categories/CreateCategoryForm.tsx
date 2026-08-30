import { FormEvent, useState } from "react";
import { Category, CategoryType, categoryTypeLabels } from "../../types/category";
import { createCategory } from "../../api/categoriesApi";
import { flattenCategoriesWithDepth } from "../../utils/flattenCategories";

interface CreateCategoryFormProps {
    categories: Category[];
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

    const allCategories = flattenCategoriesWithDepth(categories).filter(category => !category.category.isArchived);

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
                    <label htmlFor="type">Тип </label>
                    <select id="type" value={type} disabled={parentCategoryId !== null}
                        onChange={event => {
                            const value = event.target.value;
                            setType(Number(value) as CategoryType)
                        }}>
                        {typeOptions}
                    </select>
                </div>

                <div className="card-text">
                    <label htmlFor="parentCategory">Общая категория </label>
                    <select id="parentCategory" value={parentCategoryId ?? ""}
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

                <button className="card-btn" type="submit" disabled={isSubmitting}>{isSubmitting ? "Создаём..." : "Создать"}</button>
            </div>
        </form>
    );
}
