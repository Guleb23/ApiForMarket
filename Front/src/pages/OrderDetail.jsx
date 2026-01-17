import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, buy } from "../api/order";
import {
    FiArrowLeft,
    FiShoppingBag,
    FiUser,
    FiPackage,
    FiCheck,
    FiCreditCard,
    FiDownload,
    FiAlertCircle,
    FiCheckCircle
} from "react-icons/fi";
import { FaStore, FaSpinner } from "react-icons/fa";
import OrderChat from "../components/OrderChat";

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const statusMap = {
        0: { label: "Ожидает оплаты", color: "bg-yellow-100 text-yellow-800", icon: "⏳" },
        1: { label: "Оплачен", color: "bg-blue-100 text-blue-800", icon: "✅" },
        2: { label: "Отправлен", color: "bg-purple-100 text-purple-800", icon: "🚚" },
        3: { label: "Завершён", color: "bg-green-100 text-green-800", icon: "🏁" },
        4: { label: "Отменён", color: "bg-red-100 text-red-800", icon: "❌" },
    };

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await getOrderById(orderId);
                setOrder(res.data);
            } catch (err) {
                console.error("Ошибка загрузки заказа:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const handleBuy = async () => {
        if (!orderId || processing) return;

        try {
            setProcessing(true);
            setError(null);

            const response = await buy(orderId);

            if (response.data) {
                setSuccess(true);
                // Обновляем статус заказа локально
                setOrder(prev => ({
                    ...prev,
                    status: 1, // Оплачен
                    statusLabel: "Оплачен"
                }));

                // Показываем сообщение об успехе на 3 секунды
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ошибка при покупке. Попробуйте снова.");
            console.error("Ошибка покупки:", err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <FaSpinner className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                </div>
                <p className="mt-4 text-gray-600 font-medium">Загружаем информацию о заказе...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="text-red-600 text-3xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Заказ не найден</h2>
                    <p className="text-gray-600 mb-6">Запрашиваемый заказ не существует или был удален</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                    >
                        Вернуться на главную
                    </button>
                </div>
            </div>
        );
    }

    const isSeller = order.role === 1;
    const isBuyer = order.role === 0;
    const accentColor = isSeller ? "purple" : "blue";
    const status = statusMap[order.status];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Top Navigation */}
            <div className="max-w-4xl mx-auto px-4 pt-6">
                <button
                    onClick={() => navigate(-1)}
                    className="group inline-flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                >
                    <FiArrowLeft className="text-gray-500 group-hover:text-blue-600 transition-transform group-hover:-translate-x-1" />
                    <span className="text-gray-700 font-medium group-hover:text-blue-600">Назад</span>
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Status & Role Banner */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`relative p-3 rounded-2xl bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-600 text-white`}>
                                {isSeller ? <FaStore size={22} /> : <FiUser size={22} />}
                                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${isSeller ? 'bg-purple-200 text-purple-700' : 'bg-blue-200 text-blue-700'} flex items-center justify-center text-xs font-bold`}>
                                    {isSeller ? "S" : "B"}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isSeller ? "Продавец • Заказ" : "Покупатель • Ваш заказ"}
                                </h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${status.color}`}>
                                        <span className="text-lg">{status.icon}</span>
                                        {status.label}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        #{order.orderId?.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 min-w-[180px]">
                            <div className="text-sm text-gray-500 mb-1">Сумма заказа</div>
                            <div className={`text-3xl font-bold text-${accentColor}-700`}>
                                ${order.price}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-r-lg p-4 animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <FiCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                            <div>
                                <p className="font-medium text-green-800">Заказ успешно оплачен!</p>
                                <p className="text-sm text-green-700 mt-1">
                                    Теперь вы можете общаться с продавцом и отслеживать статус заказа.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-r-lg p-4 animate-fadeIn">
                        <div className="flex items-center gap-3">
                            <FiAlertCircle className="text-red-600 text-xl flex-shrink-0" />
                            <div>
                                <p className="font-medium text-red-800">Ошибка оплаты</p>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <div className={`p-2 rounded-lg bg-${accentColor}-100 text-${accentColor}-600`}>
                                <FiPackage size={18} />
                            </div>
                            Товар
                        </h3>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-2/5">
                                <div className="relative">
                                    <img
                                        src={order.productImage}
                                        alt={order.nameProduct}
                                        className="w-full h-64 object-cover rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                                    />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${isSeller ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                                        {isSeller ? "ПРОДАЮ" : "ПОКУПКА"}
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-3/5">
                                <div className="mb-6">
                                    <h4 className="text-2xl font-bold text-gray-900 mb-3">
                                        {order.nameProduct}
                                    </h4>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium">
                                        <FiCheck className="text-green-600" />
                                        Товар в наличии
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className={`p-4 rounded-xl border border-${accentColor}-200 bg-gradient-to-br from-${accentColor}-50/50 to-white`}>
                                            <div className="text-sm text-gray-500 mb-1">Цена товара</div>
                                            <div className="text-2xl font-bold text-gray-900">${order.price}</div>
                                        </div>

                                        <div className={`p-4 rounded-xl border border-${accentColor}-200 bg-gradient-to-br from-${accentColor}-50/50 to-white`}>
                                            <div className="text-sm text-gray-500 mb-1">Количество</div>
                                            <div className="text-2xl font-bold text-gray-900">1 шт.</div>
                                        </div>
                                    </div>

                                    <div className={`p-4 rounded-xl border border-${accentColor}-200 bg-gradient-to-br from-${accentColor}-50/30 to-white`}>
                                        <div className="text-sm text-gray-500 mb-2">Идентификаторы</div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">ID заказа:</span>
                                                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                                    {order.orderId?.slice(0, 12)}...
                                                </code>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">ID товара:</span>
                                                <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                                    {order.productId?.slice(0, 12)}...
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${accentColor}-100 text-${accentColor}-600`}>
                            <FaStore size={16} />
                        </div>
                        {isSeller ? "Ваш магазин" : "Магазин продавца"}
                    </h3>

                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${accentColor}-500 to-${accentColor}-600 flex items-center justify-center shadow-md`}>
                                <FaStore className="text-white text-xl" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{order.shopName}</h4>
                                <p className="text-sm text-gray-500 mt-1">ID: {order.shopId?.slice(0, 8)}...</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/shop/${order.shopId}`)}
                            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${isSeller
                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 hover:shadow-md'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-md'}`}
                        >
                            {isSeller ? "Управлять" : "Посмотреть"}
                        </button>
                    </div>
                </div>

                {/* Chat Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Общение по заказу
                        </h3>
                        <div className="bg-gradient-to-b from-gray-50/50 to-white rounded-xl">
                            <OrderChat
                                orderId={order.id || order.orderId || orderId}
                                isPaid={order.status === 1}
                                role={isSeller ? "Seller" : "Buyer"}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {isBuyer && order.status === 0 && (
                            <button
                                onClick={handleBuy}
                                disabled={processing}
                                className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${processing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : `bg-gradient-to-r from-${accentColor}-600 to-${accentColor}-700 hover:from-${accentColor}-700 hover:to-${accentColor}-800`} text-white`}
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Обработка...
                                    </>
                                ) : (
                                    <>
                                        <FiCreditCard size={22} />
                                        Купить сейчас за ${order.price}
                                    </>
                                )}
                            </button>
                        )}

                        {isBuyer && order.status === 1 && (
                            <button
                                onClick={() => console.log("Скачать товар")}
                                className={`flex-1 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white`}
                            >
                                <FiDownload size={22} />
                                Скачать товар
                            </button>
                        )}

                        <button
                            onClick={() => navigate("/")}
                            className="flex-1 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            На главную
                        </button>
                    </div>

                    {/* Helper Text */}
                    <div className={`mt-6 p-4 rounded-lg border ${isSeller ? 'border-purple-200 bg-purple-50/50' : 'border-blue-200 bg-blue-50/50'}`}>
                        <p className={`text-sm ${isSeller ? 'text-purple-700' : 'text-blue-700'} font-medium`}>
                            {isSeller
                                ? "💼 Вы продавец этого товара. Отслеживайте статус заказа и общайтесь с покупателем."
                                : "🛒 Вы покупатель этого товара. После оплаты вы сможете скачать товар и общаться с продавцом."}
                        </p>
                    </div>
                </div>

                {/* Order Info Footer */}
                <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">
                        ID заказа: <code className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">{order.orderId}</code>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;