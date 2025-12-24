import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import { createShop } from "../api/shops"
import FileUpload from "../components/ui/FileUpload"
import { FaCube } from "react-icons/fa"
import { FiImage } from "react-icons/fi"
import { FiArrowLeft } from "react-icons/fi"
const CreateShop = () => {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        name: "",
        description: "",
        walpaperImg: null,
        iconImg: null,
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const submit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!form.name || !form.walpaperImg || !form.iconImg) {
            setError("Заполните все обязательные поля")
            return
        }

        try {
            setLoading(true)

            const data = new FormData()
            data.append("Name", form.name)
            data.append("Description", form.description)
            data.append("WalpaperImg", form.walpaperImg)
            data.append("IconImg", form.iconImg)

            await createShop(data)

            navigate("/profile")
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Ошибка при создании магазина"
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="
                    mb-4
                    flex items-center gap-2
                    text-sm font-medium
                    text-gray-600
                    hover:text-purple-600
                    transition
                "
                >
                    <FiArrowLeft />
                    Назад
                </button>

                <Card>
                    <h1 className="text-2xl font-semibold mb-6">
                        Создание магазина
                    </h1>

                    <form onSubmit={submit} className="space-y-5">
                        {/* NAME */}
                        <Input
                            placeholder="Название магазина"
                            value={form.name}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />

                        {/* DESCRIPTION */}
                        <textarea
                            placeholder="Описание (необязательно)"
                            value={form.description}
                            onChange={(e) =>
                                setForm(prev => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            rows={4}
                            className="
                            w-full rounded-xl border border-gray-300 px-4 py-2
                            text-sm text-gray-800
                            focus:outline-none focus:ring-2 focus:ring-purple-400
                        "
                        />

                        {/* WALLPAPER */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Обои магазина
                            </label>
                            <FileUpload
                                label="Загрузить обои магазина"
                                file={form.walpaperImg}
                                icon={<FiImage />}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        walpaperImg: e.target.files[0],
                                    }))
                                }
                            />
                        </div>

                        {/* ICON */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Иконка магазина
                            </label>
                            <FileUpload
                                label="Загрузить иконку магазина"
                                file={form.iconImg}
                                icon={<FaCube />}
                                onChange={(e) =>
                                    setForm(prev => ({
                                        ...prev,
                                        iconImg: e.target.files[0],
                                    }))
                                }
                            />
                        </div>

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
                            {loading ? "Создание..." : "Создать магазин"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )

}

export default CreateShop
