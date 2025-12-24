import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"


const ModeratorRedirect = ({ children }) => {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && user?.role === 2) {
            const currentPath = window.location.pathname
            const isModeratorPath = currentPath.startsWith('/moderator')

            if (!isModeratorPath) {
                navigate("/moderator", { replace: true })
            }
        }
    }, [user, loading, navigate])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-gray-500">Загрузка...</div>
            </div>
        )
    }
    if (user?.role === 2 && !window.location.pathname.startsWith('/moderator')) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Перенаправление на панель модератора...</p>
                </div>
            </div>
        )
    }

    return children
}

export default ModeratorRedirect