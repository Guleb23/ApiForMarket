import React, { useState, useRef, useEffect } from "react";
import { useOrderChat } from "../context/UseOrderChat";
import { useAuth } from "../context/AuthContext";
import {
    FiSend,
    FiAlertCircle,
    FiWifi,
    FiWifiOff,
    FiLock,
    FiMessageSquare,
    FiClock,
    FiRefreshCw
} from "react-icons/fi";

const OrderChat = ({ orderId, isPaid, role = "Buyer" }) => {
    const { user } = useAuth();
    const {
        messages,
        sendMessage,
        connectionState,
        isLoading,
        error,
        reloadHistory
    } = useOrderChat(orderId, isPaid);

    const [text, setText] = useState("");
    const messagesEndRef = useRef(null);
    const chatRef = useRef(null);

    const isSeller = role === "Seller";
    const accent = isSeller ? "purple" : "blue";

    /* === AUTOSCROLL === */
    useEffect(() => {
        if (!chatRef.current || messages.length === 0) return;

        const el = chatRef.current;
        const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;

        if (isNearBottom) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [messages]);

    const handleSend = async () => {
        if (!text.trim() || !isPaid) return;
        const value = text.trim();
        setText("");
        await sendMessage(value);
    };

    const formatTime = (date) => {
        try {
            const d = new Date(date);
            return d.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "--:--";
        }
    };

    const formatDate = (date) => {
        try {
            const d = new Date(date);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (d.toDateString() === today.toDateString()) {
                return "Сегодня";
            } else if (d.toDateString() === yesterday.toDateString()) {
                return "Вчера";
            } else {
                return d.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short"
                });
            }
        } catch {
            return "";
        }
    };

    /* === ГРУППИРОВКА СООБЩЕНИЙ ПО ДАТАМ === */
    const groupedMessages = messages.reduce((groups, message) => {
        const date = formatDate(message.createdAt);
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(message);
        return groups;
    }, {});

    /* === CONNECTION STATE === */
    const connectionBadge = {
        Connected: {
            text: "Онлайн",
            icon: <FiWifi className="text-green-500" />,
            class: "text-green-600 bg-green-50 border border-green-200",
        },
        Reconnecting: {
            text: "Переподключение…",
            icon: <FiClock className="text-yellow-500 animate-pulse" />,
            class: "text-yellow-600 bg-yellow-50 border border-yellow-200",
        },
        Failed: {
            text: "Нет соединения",
            icon: <FiWifiOff className="text-red-500" />,
            class: "text-red-600 bg-red-50 border border-red-200",
        },
    }[connectionState];

    return (
        <div className="flex flex-col h-[480px] bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* HEADER */}
            <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${accent}-100 text-${accent}-600`}>
                            <FiMessageSquare size={18} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">
                                {isSeller ? "Чат с покупателем" : "Чат с продавцом"}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-500">
                                    ID заказа: {orderId?.slice(0, 8)}...
                                </p>
                                {isLoading && (
                                    <span className="text-xs text-blue-600 animate-pulse">
                                        Загрузка...
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {connectionBadge && (
                            <div className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-2 ${connectionBadge.class}`}>
                                {connectionBadge.icon}
                                <span className="font-medium">{connectionBadge.text}</span>
                            </div>
                        )}
                        <button
                            onClick={reloadHistory}
                            className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                            title="Обновить историю"
                        >
                            <FiRefreshCw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* LOCK INFO */}
            {!isPaid && (
                <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-amber-100 border-b text-amber-800 text-sm flex items-center gap-2">
                    <FiLock className="flex-shrink-0" />
                    <span className="font-medium">Для общения необходимо оплатить заказ</span>
                </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
                <div className="px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 border-b text-red-700 text-sm flex items-center gap-2">
                    <FiAlertCircle className="flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* MESSAGES CONTAINER */}
            <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 "
            >
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                        <p className="text-gray-500 text-sm">Загрузка сообщений...</p>
                    </div>
                ) : Object.keys(groupedMessages).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <FiMessageSquare size={24} />
                        </div>
                        <p className="font-medium text-gray-500 mb-1">
                            {isPaid ? "Начните общение" : "Оплатите заказ"}
                        </p>
                        <p className="text-sm text-center max-w-xs text-gray-400">
                            {isPaid
                                ? "Напишите сообщение, чтобы обсудить детали заказа"
                                : "После оплаты вы сможете общаться с продавцом"}
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, dateMessages]) => (
                        <div key={date} className="space-y-3">
                            {/* DATE SEPARATOR */}
                            <div className="flex items-center justify-center">
                                <div className="px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                                    {date}
                                </div>
                            </div>

                            {/* MESSAGES FOR THIS DATE */}
                            {dateMessages.map((msg, index) => {
                                const isMine = msg.isMyMessage;
                                const isSending = msg.isSending;

                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[70%] px-4 py-3 rounded-2xl relative
                                                ${isMine
                                                    ? `bg-gradient-to-r from-${accent}-500 to-${accent}-600 text-white rounded-br-none`
                                                    : "bg-white border border-gray-200 rounded-bl-none"
                                                }
                                                ${isSending ? "opacity-70" : ""}
                                            `}
                                        >
                                            {isSending && (
                                                <div className="absolute -top-1 -right-1 w-4 h-4">
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed">{msg.text}</p>
                                            <div
                                                className={`text-[11px] mt-1.5 flex items-center justify-between
                                                    ${isMine ? "text-white/80" : "text-gray-500"}
                                                `}
                                            >
                                                <span>{formatTime(msg.createdAt)}</span>
                                                {isMine && <span className="ml-2">Вы</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* INPUT AREA */}
            <div className="border-t bg-white">
                {isPaid ? (
                    <div className="p-3">
                        <div className="flex gap-2">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={
                                    connectionState === "Connected"
                                        ? "Напишите сообщение..."
                                        : "Подключение..."
                                }
                                disabled={connectionState !== "Connected" || isLoading}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition disabled:bg-gray-100 disabled:text-gray-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!text.trim() || connectionState !== "Connected" || isLoading}
                                className={`px-5 py-3 rounded-xl flex items-center justify-center transition
                                    ${!text.trim() || connectionState !== "Connected" || isLoading
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : `bg-${accent}-600 hover:bg-${accent}-700 text-white hover:shadow-md`
                                    }`}
                            >
                                <FiSend size={18} />
                            </button>
                        </div>

                        {/* HELPER TEXT */}
                        <div className="flex items-center justify-between mt-2 px-1">
                            <div className="text-xs text-gray-400">
                                {connectionState === "Connected" ? (
                                    <span className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Соединение установлено
                                    </span>
                                ) : connectionState === "Reconnecting" ? (
                                    <span className="text-yellow-600">Переподключение...</span>
                                ) : (
                                    <span>Подключение...</span>
                                )}
                            </div>
                            <div className="text-xs text-gray-400">
                                Нажмите Enter для отправки
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 text-center">
                        <div className="text-gray-400 text-sm inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                            <FiLock size={14} />
                            Чат заблокирован до оплаты заказа
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderChat;