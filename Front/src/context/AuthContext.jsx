import { createContext, useContext, useEffect, useRef, useState } from "react"
import api from "../api/axios"
import { refreshRequest } from "../api/auth"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const accessTokenRef = useRef(null)
    const isRefreshingRef = useRef(false)
    const interceptorEjectRef = useRef(null)

    const setSession = ({ user, accessToken, refreshToken }) => {
        setUser(user)
        accessTokenRef.current = accessToken
        localStorage.setItem("refreshToken", refreshToken)
        localStorage.setItem("userId", user.id)
    }

    const clearSession = () => {
        setUser(null)
        accessTokenRef.current = null
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userId")
    }

    const login = (data) => {
        setSession(data)
    }

    const logout = () => {
        clearSession()
    }

    const refresh = async () => {
        if (isRefreshingRef.current) return null

        try {
            isRefreshingRef.current = true

            const refreshToken = localStorage.getItem("refreshToken")
            const userId = localStorage.getItem("userId")
            if (!refreshToken || !userId) throw new Error("No refresh data")

            const res = await refreshRequest({
                Token: refreshToken,
                UserId: userId,
            })

            setSession(res.data)
            return res.data.accessToken
        } catch (e) {
            clearSession()
            throw e
        } finally {
            isRefreshingRef.current = false
        }
    }

    useEffect(() => {
        const init = async () => {
            try {
                const refreshToken = localStorage.getItem("refreshToken")
                const userId = localStorage.getItem("userId")

                if (refreshToken && userId) {

                    setUser({ id: userId })

                    try {
                        await refresh()
                    } catch (error) {
                        console.warn("Refresh failed on init:", error)

                        // clearSession() // раскомментировать, если нужно очищать при ошибке
                    }
                }
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])


    useEffect(() => {

        if (interceptorEjectRef.current) {
            interceptorEjectRef.current()
        }

        const reqInterceptor = api.interceptors.request.use((config) => {
            if (accessTokenRef.current) {
                config.headers.Authorization = `Bearer ${accessTokenRef.current}`
            }
            return config
        })

        const resInterceptor = api.interceptors.response.use(
            (res) => res,
            async (error) => {
                const originalRequest = error.config

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true

                    if (originalRequest.url.includes('/refresh')) {
                        return Promise.reject(error)
                    }

                    try {
                        const newToken = await refresh()
                        if (newToken) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`
                            return api(originalRequest)
                        }
                    } catch (refreshError) {
                        console.error("Refresh token failed:", refreshError)
                        if (refreshError.response?.status !== 401) {
                            clearSession()
                        }
                    }
                }

                return Promise.reject(error)
            }
        )

        interceptorEjectRef.current = () => {
            api.interceptors.request.eject(reqInterceptor)
            api.interceptors.response.eject(resInterceptor)
        }

        return () => {
            if (interceptorEjectRef.current) {
                interceptorEjectRef.current()
            }
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuth: !!user,
                isModerator: user?.role === 2,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
    return ctx
}