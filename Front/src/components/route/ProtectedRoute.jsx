import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const { isAuth, loading, initialized, user, getAccessToken } = useAuth();

    if (loading || !initialized) {
        return <div>Проверка авторизации...</div>;
    }

    // Добавь это условие — очень помогает
    if (initialized && !getAccessToken()) {
        console.log("Initialized but NO access token → forcing logout");
        return <Navigate to="/login" replace />;
    }

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
