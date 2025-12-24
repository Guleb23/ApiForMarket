import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import { registerRequest } from "../api/auth"
import { useAuth } from "../context/AuthContext"

const Register = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [user, setUser] = useState({
        email: "",
        password: ""
    })
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const submit = async (e) => {
        e.preventDefault()
        setError(null)

        if (user.password !== confirmPassword) {
            setError("Пароли не совпадают")
            return
        }

        try {
            setLoading(true)

            const response = await registerRequest(user)
            const data = response.data

            login({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            })

            navigate("/")
        } catch (err) {
            setError(
                err.response?.data?.errors?.Email?.[0] ||
                err.response?.data?.message ||
                "Ошибка регистрации"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaff] p-4">
            <Card className="w-full max-w-sm">
                <h1 className="text-2xl font-semibold mb-4">
                    Регистрация
                </h1>

                <form onSubmit={submit} className="space-y-4">
                    <Input
                        placeholder="Email"
                        value={user.email}
                        onChange={(e) =>
                            setUser(prev => ({
                                ...prev,
                                email: e.target.value
                            }))
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Пароль"
                        value={user.password}
                        onChange={(e) =>
                            setUser(prev => ({
                                ...prev,
                                password: e.target.value
                            }))
                        }
                    />

                    <Input
                        type="password"
                        placeholder="Подтвердите пароль"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && (
                        <div className="text-sm text-red-600 text-center">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-gray-500">
                    <span>Уже есть аккаунт? </span>
                    <button
                        type="button"
                        className="text-[#8b5cf6] font-semibold hover:underline"
                        onClick={() => navigate("/login")}
                    >
                        Войти
                    </button>
                </div>
            </Card>
        </div>
    )
}

export default Register
