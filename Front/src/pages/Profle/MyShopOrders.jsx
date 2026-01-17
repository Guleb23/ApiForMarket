import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { getShopOrders } from "../../api/order";

const PAGE_SIZE = 6;

const statusLabels = {
    0: "Новый",
    1: "В обработке",
    2: "Отправлен",
    3: "Завершен",
    4: "Отменен",
};

const MyShopOrders = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getShopOrders();
            // пагинацию делаем вручную, если бэкенд не возвращает
            const start = (page - 1) * PAGE_SIZE;
            const paged = res.data.slice(start, start + PAGE_SIZE);
            setOrders(paged);
            setTotalPages(Math.ceil(res.data.length / PAGE_SIZE));
        } catch (e) {
            console.error(e);
            setError("Не удалось загрузить заказы магазина");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    if (loading) {
        return (
            <div className="text-gray-400 text-center py-10">Загрузка заказов...</div>
        );
    }

    if (error) {
        return (
            <div className="text-red-600 text-center py-10">{error}</div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
                <FiShoppingCart className="text-purple-600 text-xl" />
                <h2 className="text-lg font-semibold text-gray-900">Заказы магазина</h2>
            </div>

            {orders.length === 0 ? (
                <p className="text-gray-500 text-sm">Пока нет заказов</p>
            ) : (
                <>
                    {/* LIST */}
                    <div className="flex flex-col gap-4">
                        {orders.map(order => (
                            <div
                                key={order.orderId}
                                onClick={() => navigate(`/order/${order.orderId}`)}
                                className="flex gap-4 p-4 border rounded-2xl cursor-pointer hover:shadow transition w-full"
                            >
                                <img
                                    src={order.productImage}
                                    alt={order.nameProduct}
                                    className="w-24 h-24 object-contain bg-gray-100 rounded-xl flex-shrink-0"
                                />

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {order.nameProduct}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">{order.shopName}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm font-medium text-gray-700">
                                            {order.price} ₽
                                        </span>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-xl font-semibold ${order.status === 0
                                                ? "bg-yellow-100 text-yellow-800"
                                                : order.status === 1
                                                    ? "bg-blue-100 text-blue-800"
                                                    : order.status === 2
                                                        ? "bg-purple-100 text-purple-800"
                                                        : order.status === 3
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {statusLabels[order.status] || "Неизвестно"}
                                        </span>
                                    </div>
                                </div>

                                <FiShoppingCart className="text-purple-400 text-2xl self-start" />
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
    );
};

export default MyShopOrders;
