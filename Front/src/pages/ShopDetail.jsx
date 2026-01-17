import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FiArrowLeft } from "react-icons/fi"
import { getAllProductsForShop } from "../api/products"
import { getShopById } from "../api/shops"
import { isOwned } from "../api/profile"
import { useAuth } from "../context/AuthContext"
import ProductList from "../components/ui/ProductList"
import Pagination from "../components/ui/Pagination"

const ShopDetail = () => {
    const { shopId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [shop, setShop] = useState(null)
    const [products, setProducts] = useState([])
    const [isOwner, setIsOwner] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    // Пагинация
    const [page, setPage] = useState(1)
    const [pageSize] = useState(12)
    const [totalPages, setTotalPages] = useState(1)

    // Загрузка данных магазина
    useEffect(() => {
        const loadShopData = async () => {
            if (!shopId) {
                setError("Магазин не найден")
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                setError(null)

                console.log("Загрузка информации о магазине:", shopId)

                // 1. Загружаем информацию о магазине
                const shopRes = await getShopById(shopId)
                setShop(shopRes.data)
                console.log("Магазин загружен:", shopRes.data)

                // 2. Проверяем владение магазином
                try {
                    const ownershipRes = await isOwned(shopId)
                    console.log("Результат проверки владения:", ownershipRes.data)

                    let ownerStatus = false
                    if (ownershipRes.data && typeof ownershipRes.data.canAddProduct !== 'undefined') {
                        ownerStatus = ownershipRes.data.canAddProduct
                    } else if (ownershipRes.data && typeof ownershipRes.data.isOwned !== 'undefined') {
                        ownerStatus = ownershipRes.data.isOwned
                    } else if (ownershipRes.data === true || ownershipRes.data === false) {
                        ownerStatus = ownershipRes.data
                    }

                    setIsOwner(ownerStatus)
                    console.log("Статус владельца:", ownerStatus)

                } catch (ownershipErr) {
                    console.warn("Ошибка при проверке владения:", ownershipErr)
                    setIsOwner(false)
                }

            } catch (err) {
                console.error("Ошибка при загрузке магазина:", err)
                if (err.response?.status === 401) {
                    setError("Необходима авторизация")
                } else if (err.response?.status === 404) {
                    setError("Магазин не найден")
                } else {
                    setError(err.response?.data?.message || "Ошибка при загрузке магазина")
                }
            } finally {
                setIsLoading(false)
            }
        }

        loadShopData()
    }, [shopId])

    // Загрузка товаров (отдельный эффект)
    useEffect(() => {
        const loadProducts = async () => {
            if (!shopId || !shop) return // Ждем загрузки shop

            try {
                console.log(`Загрузка товаров для магазина ${shopId}, страница ${page}`)

                const res = await getAllProductsForShop(page, pageSize, shopId)
                console.log("Товары получены:", res.data)

                // Фильтруем товары в зависимости от прав
                let filteredProducts = res.data.items || []

                if (!isOwner) {
                    // Для не-владельцев показываем только опубликованные товары
                    filteredProducts = filteredProducts.filter(product =>
                        product.isModerated === 2 || product.isModerated === undefined
                    )
                }

                setProducts(filteredProducts)
                setTotalPages(res.data.totalPages || 1)

            } catch (err) {
                console.error("Ошибка при загрузке товаров:", err)
                if (err.response?.status === 401 || err.response?.status === 404) {
                    setProducts([]) // Пользователь не авторизован или товаров нет
                }
            }
        }

        loadProducts()
    }, [shopId, shop, page, isOwner, pageSize])

    // Обработчик клика по товару
    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`)
    }

    // Обработчик смены страницы
    const handlePageChange = (newPage) => {
        if (newPage !== page) {
            setPage(newPage)
            // Прокрутка вверх
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    // Отображение ошибок
    if (error && !shop) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-red-600">
                <p className="mb-4">{error}</p>
                {error === "Необходима авторизация" && (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Войти
                    </button>
                )}
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                    Назад
                </button>
            </div>
        )
    }

    // Отображение загрузки
    if (isLoading && !shop) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Загрузка магазина...</p>
                </div>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
                <p className="text-lg mb-4">Магазин не найден</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Назад
                </button>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* HERO */}
            <div className="relative h-[340px] w-full">
                {shop.walpaper ? (
                    <img
                        src={shop.walpaper}
                        alt={shop.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-gray-50" />
                <div className="absolute top-6 left-6 z-20">
                    <button
                        onClick={() => navigate(-1)}
                        className="
                            flex items-center gap-2
                            rounded-full bg-white/80 backdrop-blur-md
                            px-4 py-2 text-sm font-medium text-gray-800
                            border border-white/60 shadow-md
                            transition hover:bg-white hover:-translate-y-0.5
                            hover:shadow-lg active:translate-y-0
                        "
                    >
                        <FiArrowLeft className="text-base" />
                        Назад
                    </button>
                </div>

                {/* HERO CARD */}
                <div className="relative max-w-7xl mx-auto px-6 h-full flex items-end">
                    <div className="mb-[-56px] w-full max-w-2xl rounded-3xl bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl p-6 flex gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-purple-100 overflow-hidden flex-shrink-0">
                            {shop.icon ? (
                                <img
                                    src={shop.icon}
                                    alt={shop.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = '/default-shop-icon.png'
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-purple-200 text-purple-600">
                                    <span className="text-2xl font-bold">{shop.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-semibold text-gray-900 truncate">{shop.name}</h1>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{shop.description}</p>

                            <div className="flex items-center gap-3 mt-3">
                                {shop.isModerated !== 2 && (
                                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                        На модерации
                                    </span>
                                )}

                                {isOwner && (
                                    <span className="inline-block text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                                        Вы владелец
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-6 pt-20 pb-8">
                <div className="rounded-3xl bg-white shadow-xl border border-gray-200 p-8 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="text-center">
                                <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 text-gray-500">Загрузка товаров...</p>
                            </div>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <ProductList
                                products={products}
                                onProductClick={handleProductClick}
                                showAdminActions={isOwner}
                            />

                            {totalPages > 1 && (
                                <div className="mt-8">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">В этом магазине пока нет товаров</p>
                            {shop.isModerated !== 2 && (
                                <p className="text-gray-400 text-sm mt-2">
                                    Добавление товаров возможно после модерации магазина
                                </p>
                            )}
                            {isOwner && shop.isModerated === 2 && (
                                <button
                                    onClick={() => navigate(`/shop/${shopId}/add-product`)}
                                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Добавить первый товар
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShopDetail