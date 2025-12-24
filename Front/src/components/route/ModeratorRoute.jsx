import { Navigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const ModeratorRoute = ({ children }) => {
    const { isAuth, isModerator, loading } = useAuth()

    if (loading) return null

    if (!isAuth) {
        return <Navigate to="/login" replace />
    }

    if (!isModerator) {
        return <Navigate to="/" replace />
    }

    return children
}

export default ModeratorRoute
