import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { refreshRequest } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const accessTokenRef = useRef(null);
    const isRefreshingRef = useRef(false);
    const interceptorEjectRef = useRef(null);

    // Сохраняем сессию - ИСПРАВЛЕНО!
    const setSession = (responseData) => {
        console.log("Setting session with:", responseData);

        // Извлекаем данные
        const { user: userData, accessToken } = responseData;

        // ВАЖНО: refreshToken может быть на верхнем уровне ИЛИ в user объекте
        let refreshToken = responseData.refreshToken;
        if (!refreshToken && userData?.refreshToken) {
            refreshToken = userData.refreshToken;
        }

        // Сохраняем пользователя
        setUser(userData);
        accessTokenRef.current = accessToken;

        // ВАЖНО: Всегда сохраняем refreshToken
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken);
            console.log("Refresh token saved to localStorage");
        } else {
            console.warn("No refresh token in response!");
        }

        if (userData?.id) {
            localStorage.setItem("userId", userData.id);
        }

        if (accessToken) {
            sessionStorage.setItem("accessToken", accessToken);
        }

        if (userData?.role !== undefined) {
            localStorage.setItem("role", userData.role.toString());
        }
    };

    // Очищаем сессию
    const clearSession = () => {
        console.log("Clearing session");
        setUser(null);
        accessTokenRef.current = null;
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        sessionStorage.removeItem("accessToken");
    };

    const login = (data) => {
        console.log("Login with data:", data);
        setSession(data);
    };

    const logout = () => {
        console.log("Logout called");
        clearSession();
        window.location.href = "/login";
    };

    // Обновление accessToken - ИСПРАВЛЕНО!
    const refresh = async () => {
        if (isRefreshingRef.current) {
            console.log("Refresh already in progress, skipping");
            return null;
        }

        try {
            isRefreshingRef.current = true;
            const refreshToken = localStorage.getItem("refreshToken");
            const userId = localStorage.getItem("userId");

            console.log("Refresh attempt - userId:", userId, "token exists:", !!refreshToken);

            if (!refreshToken || !userId) {
                console.warn("No refresh token or user ID found");
                throw new Error("No refresh data");
            }

            const res = await refreshRequest({
                Token: refreshToken,
                UserId: userId,
            });

            console.log("Refresh response:", res.data);

            if (!res.data?.accessToken) {
                throw new Error("No access token in response");
            }

            // Обновляем сессию с новыми данными
            setSession(res.data);

            console.log("Refresh successful, new token saved");
            return res.data.accessToken;
        } catch (e) {
            console.error("Refresh error:", e);
            // Не очищаем сессию сразу при ошибке refresh
            // Пусть это сделает interceptor или пользователь
            throw e;
        } finally {
            isRefreshingRef.current = false;
        }
    };

    // Инициализация при загрузке страницы - БЕЗОПАСНАЯ ВЕРСИЯ
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setInitialized(false);

            const rt = localStorage.getItem("refreshToken");
            const uid = localStorage.getItem("userId");

            console.log("INIT START → rt:", !!rt, "uid:", !!uid);

            if (!rt || !uid) {
                console.log("No tokens → clear & logout");
                clearSession();
                setLoading(false);
                setInitialized(true);
                return;
            }

            try {
                const newToken = await refresh();
                console.log("REFRESH УСПЕШНО → token:", newToken ? "yes" : "no!");
            } catch (err) {
                console.log("REFRESH СЛОМАЛСЯ →", err.message || err);
                clearSession();
            }

            setLoading(false);
            setInitialized(true);
        };

        init();
    }, []);

    // Интерцепторы axios - УПРОЩЕННАЯ ВЕРСИЯ
    useEffect(() => {
        if (interceptorEjectRef.current) {
            interceptorEjectRef.current();
        }

        // Request interceptor
        const reqInterceptor = api.interceptors.request.use(
            (config) => {
                if (accessTokenRef.current) {
                    config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - НАДЕЖНАЯ ВЕРСИЯ
        const resInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // Пропускаем если это уже повторный запрос
                if (originalRequest._retry || error.response?.status !== 401) {
                    return Promise.reject(error);
                }

                // Пропускаем запросы к refresh endpoint
                if (originalRequest.url.includes("/refresh")) {
                    console.log("Refresh endpoint failed, logging out");
                    clearSession();
                    return Promise.reject(error);
                }

                originalRequest._retry = true;
                console.log("401 detected, attempting refresh...");

                try {
                    const newToken = await refresh();
                    if (newToken) {
                        // Обновляем заголовок и повторяем запрос
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Refresh failed in interceptor:", refreshError);
                    // Только здесь очищаем сессию при реальной ошибке refresh
                    clearSession();

                    // Редирект только если на странице профиля
                    if (window.location.pathname.includes("/profile")) {
                        setTimeout(() => {
                            window.location.href = "/login";
                        }, 100);
                    }
                }

                return Promise.reject(error);
            }
        );

        interceptorEjectRef.current = () => {
            api.interceptors.request.eject(reqInterceptor);
            api.interceptors.response.eject(resInterceptor);
        };

        return () => {
            if (interceptorEjectRef.current) {
                interceptorEjectRef.current();
            }
        };
    }, []);

    const getAccessToken = () => {
        return accessTokenRef.current || "";
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuth: !!user && !!accessTokenRef.current,
                isModerator: user?.role === 2,
                loading,
                initialized,
                getAccessToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};