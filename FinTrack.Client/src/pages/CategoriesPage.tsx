import { archiveCategory, getCategories, restoreCategory, updateCategory } from "../api/categoriesApi";
import { FormEvent, useEffect, useState } from "react";
import { CategoryCard } from "../components/categories/CategoryCard";
import { CreateCategoryForm } from "../components/categories/CreateCategoryForm";
import { CategoryType, categoryTypeLabels, UpdateCategoryRequest } from "../types/category";
import { CategoryWithDepth, flattenCategoriesWithDepth } from "../utils/flattenCategories";

export function CategoriesPage() {
    const [categories, setCategories] = useState<CategoryWithDepth[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [type, setType] = useState<CategoryType | null>(null);
    const [includeArchived, setIncludeArchived] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const typeOptions = Object.entries(categoryTypeLabels).map(([type, label]) => (
        <option key={type} value={type}>{label}</option>
    ));

    const incomeCategories = categories.filter(
        category => category.category.type === CategoryType.Income
    );

    const expenseCategories = categories.filter(
        category => category.category.type === CategoryType.Expense
    );


    async function loadCategories() {
        setError(null);
        setIsLoading(true);
        try {
            const response = await getCategories(type, includeArchived);
            setCategories(flattenCategoriesWithDepth(response));
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
        <div className="m-4">
            <div className="row d-flex justify-content-between">
                <h2 className="col-auto"> Ваши категории </h2>
                {!isCreating && <button className="col-auto btn"
                    onClick={event =>
                        setIsCreating(true)
                    }> +&nbsp;Новая категория</button>}
                {isCreating && <button className="col-auto btn card-btn"
                    onClick={event =>
                        setIsCreating(false)
                    }> Назад к категориям</button>}
            </div>

            <form className="row d-flex justify-content-start align-items-end pb-3 border-bottom"
                onSubmit={handleSubmit}>
                <div className="col-auto">
                    <label htmlFor="type" className="form-label m-0">Тип</label>
                    <select id="type" className="form-select" value={type ?? ""}
                        onChange={event => {
                            const value = event.target.value;
                            setType(value === "" ? null : Number(value) as CategoryType)
                        }
                        }>
                        <option value="">Все типы</option>
                        {typeOptions}
                    </select>
                </div>

                <div className="col-auto form-check form-switch mb-2">
                    <label className="form-check-label" htmlFor="archived">
                        <input className="form-check-input me-2" id="archived" type="checkbox" role="switch" checked={includeArchived}
                            onChange={event =>
                                setIncludeArchived(event.target.checked)
                            }
                        />
                        Показывать заархивированные
                    </label>
                </div>

                <button className="col-auto btn card-btn" type="submit" disabled={isLoading || isCreating}>
                    {isLoading ? "Загружаем..." : "Применить"}
                </button>
            </form>

            {!isCreating && <div>
                {isLoading && (<p className="py-4 text-secondary">Загружаем категории...</p>)}
                {!isLoading && error && (<p className="alert alert-danger mt-4">{error}</p>)}
                {!isLoading && !error && categories.length === 0 && (
                    <p className="py-5 text-center text-secondary">У вас пока нет категорий</p>
                )}
                {!isLoading && !error && categories.length > 0 && (
                    <div className="row g-5 pt-2">

                        {type !== CategoryType.Expense && (
                            <div className="col-lg-6">
                                <div className="d-flex align-items-center pb-2 mb-1 border-bottom">
                                    <h3 className="mb-0">Доходы</h3>
                                </div>
                                <div style={{
                                    height: '65vh',
                                    overflowY: 'auto',
                                    overflowX: 'hidden'
                                }}>
                                    {incomeCategories.length === 0 ? (
                                        <div className="py-4 text-secondary">Нет категорий доходов</div>
                                    ) : (
                                        incomeCategories.map(category => (
                                            <CategoryCard key={category.category.id} category={category.category}
                                                categories={categories} depth={category.depth}
                                                onArchive={handleArchive} onRestore={handleRestore} onUpdate={handleUpdate}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {type !== CategoryType.Income && (
                            <div className="col-lg-6">
                                <div className="d-flex align-items-center pb-2 mb-1 border-bottom">
                                    <h3 className="mb-0">Расходы</h3>
                                </div>

                                <div style={{
                                    height: '65vh',
                                    overflowY: 'auto',
                                    overflowX: 'hidden'
                                }}>
                                    {expenseCategories.length === 0 ? (
                                        <div className="py-4 text-secondary">Нет категорий расходов</div>
                                    ) : (
                                        expenseCategories.map(category => (
                                            <CategoryCard key={category.category.id} category={category.category}
                                                categories={categories} depth={category.depth}
                                                onArchive={handleArchive} onRestore={handleRestore} onUpdate={handleUpdate}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>}

            {isCreating && <div className="pt-3">
                <h2>Добавить новую категорию</h2>
                <CreateCategoryForm categories={categories} onCreate={handleCategoryCreated} />
            </div>}
        </div>
    );
}