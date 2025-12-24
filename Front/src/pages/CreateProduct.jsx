import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import FileUpload from "../components/ui/FileUpload"
import { FiArrowLeft, FiImage } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { getProfile, isOwned } from "../api/profile"
import { addProduct } from "../api/products"

const AddProduct = () => {
    const navigate = useNavigate()
    const { user, loading: authLoading } = useAuth()

    const [profile, setProfile] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [loadingOwnership, setLoadingOwnership] = useState(true)
    const [canAddProduct, setCanAddProduct] = useState(false)
    const [error, setError] = useState(null)

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        img: null
    })

    // Загрузка профиля
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoadingProfile(true)
                setError(null)
                const res = await getProfile()
                setProfile(res.data)
            } catch (err) {
                console.error(err)
                if (err.response?.status === 401) {
                    setError("Необходима авторизация")
                } else {
                    setError("Ошибка при загрузке профиля")
                }
            } finally {
                setLoadingProfile(false)
            }
        }

        if (!authLoading && user) fetchProfile()
    }, [authLoading, user])

    // Проверка владения магазином
    useEffect(() => {
        const checkOwnership = async () => {
            if (!profile?.shop) {
                setCanAddProduct(false)
                setLoadingOwnership(false)
                return
            }
            try {
                setLoadingOwnership(true)
                const res = await isOwned(profile.shop.id)
                console.log('Ownership check result:', res.data)

                if (res.data && typeof res.data.canAddProduct !== 'undefined') {
                    setCanAddProduct(res.data.canAddProduct)
                } else if (res.data && typeof res.data.isOwned !== 'undefined') {

                    setCanAddProduct(res.data.isOwned)
                } else if (res.data === true || res.data === false) {

                    setCanAddProduct(res.data)
                } else {
                    console.warn('Unexpected response format from isOwned:', res.data)
                    setCanAddProduct(false)
                }
            } catch (err) {
                console.error('Ownership check error:', err)
                console.error('Error response:', err.response)
                setError("Не удалось проверить права на магазин")
                setCanAddProduct(false)
            } finally {
                setLoadingOwnership(false)
            }
        }

        if (profile) checkOwnership()
    }, [profile])

    const submit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!form.name || !form.price || !form.img) {
            setError("Заполните все обязательные поля")
            return
        }

        try {
            const data = new FormData()
            data.append("Name", form.name)
            data.append("Description", form.description)
            data.append("Price", form.price)
            // Используйте "ImgFile" вместо "Img"
            data.append("ImgFile", form.img)
            data.append("ShopId", profile.shop.id)

            console.log('FormData contents:')
            for (let [key, value] of data.entries()) {
                console.log(key, value)
            }

            await addProduct(data)
            navigate(`/shop/${profile.shop.id}`)
        } catch (err) {
            console.error('Add product error:', err)
            console.error('Error response:', err.response?.data)

            // Проверяем, возможно сервер тоже проверяет права
            if (err.response?.status === 403) {
                setError("У вас нет прав для добавления товара в этот магазин")
            } else if (err.response?.status === 400) {
                // Обработка ошибок валидации
                const validationErrors = err.response?.data?.errors
                if (validationErrors) {
                    const errorMessages = []
                    for (const key in validationErrors) {
                        if (validationErrors[key]) {
                            errorMessages.push(...validationErrors[key])
                        }
                    }
                    setError(errorMessages.join('. ') || "Ошибка валидации данных")
                } else {
                    setError(err.response?.data?.title || "Ошибка при добавлении товара")
                }
            } else {
                setError(err.response?.data?.message || "Ошибка при добавлении товара")
            }
        }
    }

    const isLoading = loadingProfile || loadingOwnership || authLoading

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Загрузка...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-red-600">
                <p>{error}</p>
                {error === "Необходима авторизация" && (
                    <Button onClick={() => navigate("/login")}>Войти</Button>
                )}
            </div>
        )
    }

    if (!profile?.shop) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
                <p>Сначала создайте магазин</p>
                <Button className="mt-4" onClick={() => navigate("/shop/create")}>
                    Создать магазин
                </Button>
            </div>
        )
    }

    if (!canAddProduct) {
        console.log('canAddProduct is false, rendering access denied message')
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-600">
                <p>Вы не можете добавить товар, так как не владеете магазином.</p>
                <Button className="mt-4" onClick={() => navigate(`/shop/${profile.shop.id}`)}>
                    Назад к магазину
                </Button>
            </div>
        )
    }

    console.log('canAddProduct is true, rendering form')

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                    <Button
                        onClick={() => navigate(`/shop/${profile.shop.id}`)}
                        className="flex items-center gap-2 text-sm px-3 py-1.5"
                        variant="secondary"
                    >
                        <FiArrowLeft /> Назад
                    </Button>
                    <h1 className="text-2xl font-semibold">Добавление товара</h1>

                </div>

                <form onSubmit={submit} className="space-y-4">
                    <Input
                        placeholder="Название товара"
                        value={form.name}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, name: e.target.value }))
                        }
                    />
                    <Input
                        placeholder="Цена"
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, price: e.target.value }))
                        }
                    />
                    <textarea
                        placeholder="Описание (необязательно)"
                        value={form.description}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, description: e.target.value }))
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        rows={4}
                    />
                    <FileUpload
                        label="Изображение товара"
                        file={form.img}
                        icon={<FiImage />}
                        onChange={(e) =>
                            setForm(prev => ({ ...prev, img: e.target.files[0] }))
                        }
                    />
                    <Button type="submit" className="w-full">
                        Добавить товар
                    </Button>
                </form>
            </Card>
        </div>
    )
}

export default AddProduct