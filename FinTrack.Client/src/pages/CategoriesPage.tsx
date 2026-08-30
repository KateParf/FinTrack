import { archiveCategory, getCategories, restoreCategory, updateCategory } from "../api/categoriesApi";
import { FormEvent, useEffect, useState } from "react";
import { CategoryCard } from "../components/categories/CategoryCard";
import { CreateCategoryForm } from "../components/categories/CreateCategoryForm";
import { Category, CategoryType, categoryTypeLabels, UpdateCategoryRequest } from "../types/category";

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<CategoryType | null>(null);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const typeOptions = Object.entries(categoryTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));


    async function loadCategories() {
        setError(null);
        setIsLoading(true);
        try {
            const response = await getCategories(type, includeArchived);
            setCategories(response);
        } catch (error) {
            setError(error instanceof Error ? error.message : "Ошибка при загрузке категорий");
            setCategories([]);
        } finally {
            setIsLoading(false);
        }
    }
    useEffect(() => { void loadCategories(); }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await loadCategories();
    }

    async function handleCategoryCreated() {
        await loadCategories();
    }

    async function handleArchive(id: string) {
        try {
            await archiveCategory(id);
            await loadCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось архивировать категорию");
        }
    }

    async function handleRestore(id: string) {
        try {
            await restoreCategory(id);
            await loadCategories();
        } catch (error) {
            setError(error instanceof Error ? error.message : "Не удалось восстановить категорию");
        }
    }

    async function handleUpdate(id: string, request: UpdateCategoryRequest) {
        await updateCategory(id, request);
        await loadCategories();
    }

    return (
        <div>
            <h1>Ваши категории</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="type">Тип </label>
                    <select id="type" value={type ?? ""}
                        onChange={event => {
                            const value = event.target.value;
                            setType(value === "" ? null : Number(value) as CategoryType)
                        }
                        }>
                        <option value="">Все типы</option>
                        {typeOptions}
                    </select>
                </div>

                <div>
                    <label htmlFor="archived">
                        <input id="archived" type="checkbox" checked={includeArchived}
                            onChange={event =>
                                setIncludeArchived(event.target.checked)
                            }
                        />
                        Показывать заархивированные
                    </label>
                </div>

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            <div>
                {isLoading && (<p>Загружаем категории...</p>)}
                {!isLoading && error && (<p>{error}</p>)}
                {!isLoading && !error && categories.length === 0 && (<p>У вас пока нет категорий</p>)}

                {!isLoading && !error &&
                    categories.map(category => (
                        <CategoryCard key={category.id} category={category} categories = {categories}
                        onArchive={handleArchive} onRestore={handleRestore} onUpdate={handleUpdate}/>
                    ))}
            </div>

            <div>
                <h2>Добавить новую категорию</h2>
                <CreateCategoryForm categories={categories} onCreate={handleCategoryCreated} />
            </div>
        </div>
    );
}