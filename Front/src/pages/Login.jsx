import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import { loginRequest } from "../api/auth"
import { useAuth } from "../context/AuthContext"

const Login = () => {
    const { login } = useAuth()
    const [userData, setUserData] = useState({
        Email: "",
        Password: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const submit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true);
            const response = await loginRequest(userData)
            const data = response.data

            if (data.status) {
                // Вызываем login с данными пользователя
                login({
                    user: data.user,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                })

                // Проверяем роль пользователя из ответа сервера
                const userRole = data.user?.role
                console.log("Роль пользователя:", userRole)

                if (userRole === 2) {
                    navigate("/moderator", { replace: true })
                } else {
                    navigate("/", { replace: true })
                }
            } else {
                setError(data.messageText || "Ошибка входа")
            }
        } catch (err) {
            setError(err.response?.data?.errors?.Email?.[0] ||
                err.response?.data?.message ||
                "Ошибка запроса")
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaff] p-4">
            <Card className="w-full max-w-sm">
                <h1 className="text-2xl font-semibold mb-4">Вход</h1>
                <form onSubmit={submit} className="space-y-4">
                    <Input
                        placeholder="Email"
                        value={userData.Email}
                        onChange={(e) => setUserData(prev => ({
                            ...prev,
                            Email: e.target.value
                        }))}
                    />
                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={userData.Password}
                        onChange={(e) => setUserData(prev => ({
                            ...prev,
                            Password: e.target.value
                        }))}
                    />
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Вход..." : "Войти"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-gray-500">
                    <span>Нет аккаунта? </span>
                    <button
                        type="button"
                        className="text-[#8b5cf6] font-semibold hover:underline"
                        onClick={() => navigate("/register")}
                    >
                        Зарегистрируйтесь
                    </button>
                </div>
            </Card>
        </div>
    )
}

export default Login