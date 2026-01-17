import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiPackage, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { getAllProductsForShop } from "../../api/products"
import ShopStatusBadge from "../../components/ui/ShopStatusBadge"

const PAGE_SIZE = 6

const MyShopProducts = ({ shopId }) => {
    const navigate = useNavigate()

    const [products, setProducts] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const res = await getAllProductsForShop(page, PAGE_SIZE, shopId)

            setProducts(res.data.items)
            setTotalPages(res.data.totalPages)
        } catch {
            setError("Не удалось загрузить товары")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (shopId) fetchProducts()
    }, [shopId, page])

    if (loading) {
        return (
            <div className="text-gray-400 text-center py-10">
                Загрузка товаров...
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-red-600 text-center py-10">
                {error}
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <FiPackage className="text-purple-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">
                    Товары магазина
                </h2>
            </div>

            {products.length === 0 ? (
                <p className="text-gray-500 text-sm">
                    В магазине пока нет товаров
                </p>
            ) : (
                <>
                    {/* LIST */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map(product => (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/shop/${shopId}/product/${product.id}/edit`)}

                                className="flex gap-4 p-4 border rounded-2xl cursor-pointer hover:shadow transition"
                            >
                                <img
                                    src={product.img}
                                    alt={product.name}
                                    className="w-20 h-20 object-contain bg-gray-100 rounded-xl"
                                />

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900">
                                            {product.name}
                                        </h3>
                                        <ShopStatusBadge status={product.isModerated} />
                                    </div>

                                    <p className="text-sm text-gray-500 mt-1">
                                        ${product.price}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* PAGINATION */}
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-2 rounded-xl border disabled:opacity-40 hover:bg-gray-50"
                        >
                            <FiChevronLeft />
                        </button>

                        <span className="text-sm text-gray-600">
                            Страница {page} из {totalPages}
                        </span>

                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 rounded-xl border disabled:opacity-40 hover:bg-gray-50"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default MyShopProducts
