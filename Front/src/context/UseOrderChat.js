import { useEffect, useState, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import { getHistoryMessages } from "../api/order"; // Импортируем ваш API метод

export const useOrderChat = (orderId, isPaid = false) => {
    const { user, getAccessToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [connectionState, setConnectionState] = useState("Disconnected");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const connectionRef = useRef(null);

    // Загрузка истории сообщений через REST API
    const loadHistory = useCallback(async () => {
        if (!orderId || !user?.id) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await getHistoryMessages(orderId);

            if (response.data && Array.isArray(response.data)) {
                // Добавляем флаг isMyMessage для удобства
                const formattedMessages = response.data.map(msg => ({
                    ...msg,
                    isMyMessage: String(msg.senderId) === String(user?.id)
                }));

                setMessages(formattedMessages);
            } else {
                setMessages([]);
            }

            setError(null);
        } catch (err) {
            console.error("❌ Ошибка загрузки истории:", err);
            setError("Не удалось загрузить историю сообщений");
            setMessages([]);
        } finally {
            setIsLoading(false);
        }
    }, [orderId, user?.id]);

    // Подключение к SignalR хабу
    useEffect(() => {
        console.log("🔵 useOrderChat effect:", {
            orderId,
            isPaid,
            userId: user?.id
        });

        // Проверка условий для подключения
        const isPaidValue = isPaid === true || isPaid === 1 || isPaid === "true" || isPaid === "1";
        const shouldConnect = user?.id && orderId && isPaidValue;

        if (!shouldConnect) {
            console.log("❌ Условия не выполнены, отключаемся");
            if (connectionRef.current) {
                connectionRef.current.stop().catch(console.warn);
                connectionRef.current = null;
            }
            setConnectionState("Disconnected");
            setIsLoading(false);
            return;
        }

        let mounted = true;

        const connect = async () => {
            try {
                const token = getAccessToken?.();
                if (!token) {
                    console.error("❌ Токен отсутствует");
                    if (mounted) {
                        setError("Токен авторизации не найден");
                        setIsLoading(false);
                    }
                    return;
                }

                // Останавливаем существующее соединение
                if (connectionRef.current) {
                    await connectionRef.current.stop().catch(console.warn);
                }

                // Создаем новое соединение
                const hubUrl = `https://localhost:7125/hubs/order-chat?orderId=${orderId}`;
                console.log("🔗 Подключаемся к:", hubUrl);

                const connection = new signalR.HubConnectionBuilder()
                    .withUrl(hubUrl, {
                        accessTokenFactory: () => token,
                        skipNegotiation: false,
                        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
                    })
                    .withAutomaticReconnect({
                        nextRetryDelayInMilliseconds: (retryContext) => {
                            const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000);
                            console.log(`🔄 Переподключение ${retryContext.previousRetryCount + 1}, задержка: ${delay}ms`);
                            return delay;
                        }
                    })
                    .configureLogging(signalR.LogLevel.Warning)
                    .build();

                // Обработчик новых сообщений
                connection.on("ReceiveMessage", (newMessage) => {
                    if (!mounted) return;

                    console.log("📨 Получено новое сообщение:", newMessage);

                    setMessages(prev => {
                        // Проверяем на дубликаты
                        const exists = prev.some(m =>
                            m.id === newMessage.id ||
                            (m.text === newMessage.text &&
                                m.senderId === newMessage.senderId &&
                                Math.abs(new Date(m.createdAt).getTime() - new Date(newMessage.createdAt).getTime()) < 1000)
                        );

                        if (exists) return prev;

                        // Добавляем новое сообщение
                        return [...prev, {
                            ...newMessage,
                            isMyMessage: String(newMessage.senderId) === String(user?.id)
                        }];
                    });
                });

                // Обработчик прав доступа
                connection.on("ChatPermissions", (permissions) => {
                    if (!mounted) return;
                    console.log("🔐 Права доступа:", permissions);
                });

                // Обработчики состояния соединения
                connection.onclose((error) => {
                    if (mounted) {
                        console.log("🔌 Соединение закрыто", error ? `с ошибкой: ${error.message}` : "");
                        setConnectionState("Disconnected");
                        if (error) {
                            setError("Соединение потеряно");
                        }
                    }
                });

                connection.onreconnecting((error) => {
                    if (mounted) {
                        console.log("🔄 Переподключение...", error?.message);
                        setConnectionState("Reconnecting");
                        setError("Переподключение...");
                    }
                });

                connection.onreconnected((connectionId) => {
                    if (mounted) {
                        console.log("✅ Переподключение успешно:", connectionId);
                        setConnectionState("Connected");
                        setError(null);
                    }
                });

                // Подключаемся
                setConnectionState("Connecting");
                setError(null);

                await connection.start();
                console.log("✅ SignalR подключен. Connection ID:", connection.connectionId);

                if (mounted) {
                    connectionRef.current = connection;
                    setConnectionState("Connected");

                    // Загружаем историю сообщений после успешного подключения
                    await loadHistory();
                }

            } catch (error) {
                console.error("❌ Ошибка подключения SignalR:", error);
                if (mounted) {
                    setConnectionState("Failed");
                    setError(`Ошибка подключения: ${error.message}`);
                    setIsLoading(false);

                    // Все равно загружаем историю, даже если SignalR не подключился
                    await loadHistory();
                }
            }
        };

        connect();

        // Очистка при размонтировании
        return () => {
            console.log("🧹 Очистка чата");
            mounted = false;
            if (connectionRef.current) {
                connectionRef.current.stop().catch(console.warn);
                connectionRef.current = null;
            }
        };
    }, [user, orderId, isPaid, getAccessToken, loadHistory]);

    // Функция отправки сообщения
    const sendMessage = useCallback(async (text) => {
        if (!text?.trim()) {
            setError("Сообщение не может быть пустым");
            return false;
        }

        if (!connectionRef.current) {
            setError("Соединение не установлено");
            return false;
        }

        const trimmedText = text.trim();

        try {
            // Оптимистичное обновление UI
            const tempMessage = {
                id: `temp-${Date.now()}-${Math.random()}`,
                text: trimmedText,
                senderId: user?.id,
                createdAt: new Date().toISOString(),
                isMyMessage: true,
                isSending: true
            };

            setMessages(prev => [...prev, tempMessage]);

            // Отправка через SignalR
            await connectionRef.current.invoke("SendMessage", orderId, trimmedText);

            // Убираем временный флаг (сообщение заменится реальным с сервера)
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === tempMessage.id
                        ? { ...msg, isSending: false }
                        : msg
                )
            );

            return true;

        } catch (error) {
            console.error("❌ Ошибка отправки сообщения:", error);
            setError(`Ошибка отправки: ${error.message}`);

            // Удаляем временное сообщение при ошибке
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));

            return false;
        }
    }, [orderId, user?.id]);

    // Функция для ручного переподключения
    const reconnect = useCallback(async () => {
        if (connectionRef.current) {
            try {
                setConnectionState("Connecting");
                setError(null);
                setIsLoading(true);
                await connectionRef.current.start();
                setConnectionState("Connected");
            } catch (error) {
                console.error("❌ Ошибка при ручном переподключении:", error);
                setConnectionState("Failed");
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    // Функция для перезагрузки истории
    const reloadHistory = useCallback(async () => {
        await loadHistory();
    }, [loadHistory]);

    return {
        messages,
        sendMessage,
        connectionState,
        isLoading,
        error,
        reconnect,
        reloadHistory,
        hasConnection: connectionState === "Connected"
    };
};