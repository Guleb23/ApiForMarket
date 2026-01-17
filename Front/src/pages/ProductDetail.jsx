import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProductById } from "../api/products"
import { createOrder } from "../api/order"
import { FiArrowLeft } from "react-icons/fi"

const ProductDetail = () => {
    const { productId } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [buying, setBuying] = useState(false)
    const [buyError, setBuyError] = useState(null)

    const fetchProduct = async (id) => {
        try {
            setLoading(true)
            setError(null)
            const response = await getProductById(id)
            setProduct(response.data)
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Ошибка при загрузке продукта"
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (productId) fetchProduct(productId)
    }, [productId])

    const handleBuy = async () => {
        if (!product) return
        setBuying(true)
        setBuyError(null)

        try {
            const response = await createOrder({ productId: product.id })
            console.log("Order created:", response.data)
            navigate(`/order/${response.data.orderId}`)
        } catch (err) {
            console.error(err)
            setBuyError(err.response?.data || "Ошибка при покупке")
        } finally {
            setBuying(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Загрузка продукта...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-red-600">
                {error}
            </div>
        )
    }

    if (!product) return null

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* HEADER с кнопкой назад */}
            <div className="max-w-5xl mx-auto pt-8 flex items-center">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-medium text-gray-800 border border-white/60 shadow-md transition hover:bg-white hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                >
                    <FiArrowLeft className="text-base" />
                    Назад
                </button>
            </div>

            {/* PRODUCT CARD */}
            <div className="max-w-5xl mx-auto mt-6 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row">
                {/* LEFT: IMAGE */}
                <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-6">
                    <img
                        src={product.img}
                        alt={product.name}
                        className="object-contain h-96 w-full rounded-xl"
                    />
                </div>

                {/* RIGHT: INFO */}
                <div className="md:w-1/2 p-8 flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>
                        <p className="mt-4 text-gray-600">{product.description}</p>
                    </div>

                    <div className="mt-6 flex flex-col md:flex-row items-center md:justify-between gap-3">
                        <span className="text-2xl font-bold text-purple-600">${product.price}</span>
                        <button
                            onClick={handleBuy}
                            disabled={buying}
                            className={`px-6 py-3 bg-purple-600 text-white rounded-xl font-medium shadow-md hover:bg-purple-700 transition ${buying ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {buying ? "Покупка..." : "Купить"}
                        </button>
                    </div>
                    {buyError && <p className="mt-2 text-red-600 text-sm">{buyError}</p>}
                </div>
            </div>

            {/* SHOP CARD */}
            {product.shop && (
                <div
                    onClick={() => navigate(`/shop/${product.shop.id}`)}
                    className="max-w-5xl mx-auto mt-8 flex items-center gap-4 p-6 bg-gray-50 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition"
                >
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-purple-100 flex-shrink-0">
                        <img
                            src={product.shop.icon}
                            alt={product.shop.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 text-lg">{product.shop.name}</h2>
                        <p className="text-sm text-gray-500">{product.shop.description}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDetail
