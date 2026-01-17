import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiShoppingBag, FiChevronDown } from "react-icons/fi"
import { getMyOrders } from "../../api/order"

const statusMap = {
    0: { label: "Создан", color: "bg-gray-100 text-gray-700" },
    1: { label: "Оплачен", color: "bg-blue-100 text-blue-700" },
    2: { label: "Отправлен", color: "bg-yellow-100 text-yellow-700" },
    3: { label: "Завершён", color: "bg-green-100 text-green-700" },
    4: { label: "Отменён", color: "bg-red-100 text-red-700" },
}

const FILTERS = [
    { key: "all", label: "Все заказы" },
    { key: "unpaid", label: "Неоплаченные" },
    { key: "completed", label: "Завершённые" },
    { key: "cancelled", label: "Отменённые" },
]


const MyOrders = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [activeFilter, setActiveFilter] = useState("all")
    const [openFilter, setOpenFilter] = useState(false)

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await getMyOrders()
            setOrders(response.data)
        } catch {
            setError("Не удалось загрузить заказы")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const filteredOrders = useMemo(() => {
        switch (activeFilter) {
            case "unpaid":
                return orders.filter(o => o.status === 0)
            case "completed":
                return orders.filter(o => o.status === 3)
            case "cancelled":
                return orders.filter(o => o.status === 4)
            default:
                return orders
        }
    }, [orders, activeFilter])


    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Загрузка заказов...
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

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                    Мои заказы
                </h1>

                {/* FILTER DROPDOWN */}
                <div className="relative">
                    <button
                        onClick={() => setOpenFilter(v => !v)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl shadow-sm text-sm hover:bg-gray-50 transition"
                    >
                        {FILTERS.find(f => f.key === activeFilter)?.label}
                        <FiChevronDown className={`transition ${openFilter ? "rotate-180" : ""}`} />
                    </button>

                    {openFilter && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">
                            {FILTERS.map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => {
                                        setActiveFilter(filter.key)
                                        setOpenFilter(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition
                                        ${activeFilter === filter.key ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"}
                                    `}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* EMPTY */}
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                    <FiShoppingBag className="text-4xl mb-4" />
                    Нет заказов в этой категории
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const status = statusMap[order.status]

                        return (
                            <div
                                key={order.orderId}
                                onClick={() => navigate(`/order/${order.orderId}`)}
                                className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition"
                            >
                                {/* LEFT */}
                                <div>
                                    <h2 className="font-medium text-gray-900">
                                        {order.nameProduct}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Магазин: {order.shopName}
                                    </p>
                                </div>

                                {/* RIGHT */}
                                <div className="text-right flex flex-col items-end gap-2">
                                    <span className="font-semibold text-purple-600">
                                        ${order.price}
                                    </span>

                                    {status && (
                                        <span
                                            className={`text-xs px-3 py-1 rounded-full ${status.color}`}
                                        >
                                            {status.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default MyOrders
