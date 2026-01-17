import { useEffect, useState } from 'react'
import { getProducts } from '../api/products'
import { getCategories, getProductsByCategory } from '../api/categories'
import ProductList from '../components/ui/ProductList'
import HorizontalCategoryFilter from '../components/ui/HorizontalCategoryFilter'

const Products = () => {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 12,
        totalCount: 0,
    })

    const fetchProducts = async (page = 1, pageSize = 12, categoryIds = selectedCategories) => {
        try {
            setLoading(true)
            setError(null)
            const response = await getProductsByCategory(page, pageSize, categoryIds)
            const data = response.data

            setProducts(data.items)
            setPagination({
                page: data.page || page,
                pageSize: data.pageSize || pageSize,
                totalCount: data.totalCount || 0,
            })
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка при загрузке продуктов')
        } finally {
            setLoading(false)
        }
    }


    const fetchCategories = async () => {
        try {
            const res = await getCategories()
            setCategories(res.data)
        } catch (err) {
            console.error('Ошибка при загрузке категорий:', err)
        }
    }
    useEffect(() => {
        fetchProducts(pagination.page, pagination.pageSize)
        fetchCategories()
    }, [selectedCategories, pagination.page, pagination.pageSize])

    const handleCategoryChange = (selectedIds) => {
        setSelectedCategories(selectedIds)
        // Пока просто отображаем выбор
        console.log('Выбранные категории:', selectedIds)
    }

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, page: newPage }))
    }

    const handlePageSizeChange = (newPageSize) => {
        setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }))
    }

    if (loading && products.length === 0) {
        return <div className="flex items-center justify-center py-24 text-gray-500">Загрузка продуктов...</div>
    }

    if (error && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-24">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => fetchProducts(pagination.page, pagination.pageSize)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
                >
                    Попробовать снова
                </button>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-7xl px-8 py-8 bg-gray-50 flex flex-col gap-8">
            <div className='flex flex-col'>
                <h1 className='text-lg font-semibold'>Фильтры</h1>
                <HorizontalCategoryFilter
                    categories={categories}
                    selectedIds={selectedCategories}
                    onChange={handleCategoryChange}
                />

            </div>

            {/* Список продуктов */}
            <main className="flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">Продукты</h1>
                    <span className="text-sm text-gray-500">Всего: {pagination.totalCount}</span>
                </div>

                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>
                        <button
                            onClick={() => fetchProducts(pagination.page, pagination.pageSize)}
                            className="font-medium hover:underline"
                        >
                            Обновить
                        </button>
                    </div>
                )}

                <div className="relative">
                    {loading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm text-sm text-gray-500">
                            Обновление данных...
                        </div>
                    )}
                    <ProductList products={products} />
                </div>

                {!loading && products.length === 0 && (
                    <div className="mt-12 text-center text-gray-500">Продукты не найдены</div>
                )}

                {pagination.totalCount > 0 && (
                    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1 || loading}
                                className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                ← Назад
                            </button>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page >= Math.ceil(pagination.totalCount / pagination.pageSize) || loading}
                                className="rounded-lg border px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Вперёд →
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            Страница {pagination.page} из {Math.ceil(pagination.totalCount / pagination.pageSize)}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">На странице:</span>
                            <select
                                value={pagination.pageSize}
                                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                                disabled={loading}
                                className="rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="6">6</option>
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="48">48</option>
                            </select>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Products
