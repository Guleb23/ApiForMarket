import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getOrderById } from "../api/orders" // <-- функция для получения заказа
import { FiCheckCircle } from "react-icons/fi"

const OrderSuccess = () => {
    const { orderId } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getOrderById(orderId)
                setOrder(response.data)
            } catch (err) {
                setError(
                    err.response?.data?.message || err.message || "Ошибка при загрузке заказа"
                )
            } finally {
                setLoading(false)
            }
        }

        if (orderId) fetchOrder()
    }, [orderId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Загрузка заказа...
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

    if (!order) return null

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
                <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Заказ создан!</h1>
                <p className="text-gray-600 mb-4">
                    Ваш заказ на <strong>{order.nameProduct}</strong> из магазина <strong>{order.shopName}</strong> успешно создан.
                </p>
                <p className="text-gray-600 mb-6">
                    Сумма: <strong>${order.price}</strong>
                </p>

                <button
                    onClick={() => navigate(`/payment/${order.id}`)} // редирект на оплату
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium shadow-md hover:bg-purple-700 transition"
                >
                    Перейти к оплате
                </button>

                <button
                    onClick={() => navigate("/")}
                    className="mt-4 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium shadow-md hover:bg-gray-300 transition"
                >
                    Вернуться на главную
                </button>
            </div>
        </div>
    )
}

export default OrderSuccess
