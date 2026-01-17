import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Card from "../components/ui/Card"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import FileUpload from "../components/ui/FileUpload"
import { FiArrowLeft, FiImage } from "react-icons/fi"
import { useAuth } from "../context/AuthContext"
import { getProfile } from "../api/profile"
import { addProduct, updateProduct, getProductById } from "../api/products"
import { getCategories } from "../api/categories"

const CreateProduct = () => {
    const navigate = useNavigate()
    const { productId } = useParams()
    const isEditMode = Boolean(productId)

    const { user, loading: authLoading } = useAuth()

    const [profile, setProfile] = useState(null)
    const [categories, setCategories] = useState([])
    const [mainCategory, setMainCategory] = useState(null)
    const [subCategories, setSubCategories] = useState([])

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        img: null
    })

    const [existingImage, setExistingImage] = useState(null)
    const [formErrors, setFormErrors] = useState({})
    const [error, setError] = useState(null)

    // ---------- Категории ----------
    useEffect(() => {
        getCategories().then(res => setCategories(res.data))
    }, [])

    // ---------- Профиль ----------
    useEffect(() => {
        if (!authLoading && user) {
            getProfile().then(res => setProfile(res.data))
        }
    }, [authLoading, user])

    // ---------- Загрузка товара (EDIT MODE) ----------
    useEffect(() => {
        if (!isEditMode) return

        const loadProduct = async () => {
            const res = await getProductById(productId)
            const p = res.data

            setForm({
                name: p.name,
                description: p.description,
                price: p.price,
                img: null
            })

            setExistingImage(p.img)
            setMainCategory(p.mainCategoryId)
            setSubCategories(p.subCategoryIds ?? [])
        }

        loadProduct()
    }, [isEditMode, productId])

    // ---------- Валидация ----------
    const validateForm = () => {
        const errors = {}

        if (!form.name.trim()) errors.name = "Введите название товара"
        if (!form.price || Number(form.price) <= 0) errors.price = "Введите корректную цену"
        if (!isEditMode && !form.img) errors.img = "Добавьте изображение"
        if (!mainCategory) errors.mainCategory = "Выберите основную категорию"

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    // ---------- Submit ----------
    const submit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!validateForm()) return

        try {
            const data = new FormData()
            data.append("Name", form.name)
            data.append("Description", form.description)
            data.append("Price", form.price)
            data.append("ShopId", profile.shop.id)

            if (form.img) data.append("ImgFile", form.img)

            const categoriesToSend = [mainCategory, ...subCategories]
            categoriesToSend.forEach(id => data.append("SelectedCategoryIds", id))

            if (isEditMode) {
                await updateProduct(productId, data)
            } else {
                await addProduct(data)
            }

            navigate(`/shop/${profile.shop.id}`)
        } catch (err) {
            console.error("Ошибка при сохранении товара:", err)
            setError(err.response?.data?.message || "Ошибка при сохранении товара")
        }
    }

    if (!profile?.shop) return null

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <div className="flex justify-between mb-4">
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="flex gap-2"
                    >
                        <FiArrowLeft /> Назад
                    </Button>

                    <h1 className="text-xl font-semibold">
                        {isEditMode ? "Редактирование товара" : "Добавление товара"}
                    </h1>
                </div>

                {error && (
                    <p className="text-red-600 text-center mb-4">{error}</p>
                )}

                <form onSubmit={submit} className="space-y-4">

                    {/* Название */}
                    <div>
                        <Input
                            placeholder="Название товара"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            className={formErrors.name ? "border-red-500" : ""}
                        />
                        {formErrors.name && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                        )}
                    </div>

                    {/* Цена */}
                    <div>
                        <Input
                            type="number"
                            placeholder="Цена"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            className={formErrors.price ? "border-red-500" : ""}
                        />
                        {formErrors.price && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                        )}
                    </div>

                    {/* Описание */}
                    <div>
                        <textarea
                            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                            rows={4}
                            placeholder="Описание"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Изображение */}
                    <div>
                        <FileUpload
                            label={isEditMode ? "Выбрать новую картинку" : "Добавить изображение"}
                            icon={<FiImage />}
                            onChange={(e) => setForm({ ...form, img: e.target.files[0] })}
                        />
                        {formErrors.img && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.img}</p>
                        )}

                        {(form.img || existingImage) && (
                            <div className="mt-2 relative w-full h-64 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                                <img
                                    src={form.img ? URL.createObjectURL(form.img) : existingImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Основная категория */}
                    <div>
                        <select
                            value={mainCategory ?? ""}
                            onChange={e => setMainCategory(e.target.value)}
                            className={`w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 ${formErrors.mainCategory ? "border-red-500" : ""}`}
                        >
                            <option value="">Выберите основную категорию</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        {formErrors.mainCategory && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.mainCategory}</p>
                        )}
                    </div>

                    {/* Подкатегории */}
                    {mainCategory && categories.find(cat => cat.id === mainCategory)?.children?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {categories.find(cat => cat.id === mainCategory).children.map(sub => {
                                const isSelected = subCategories.includes(sub.id)
                                return (
                                    <button
                                        key={sub.id}
                                        type="button"
                                        onClick={() =>
                                            setSubCategories(prev =>
                                                prev.includes(sub.id) ? prev.filter(s => s !== sub.id) : [...prev, sub.id]
                                            )
                                        }
                                        className={`px-3 py-1 rounded-full border text-sm transition ${isSelected ? "bg-purple-500 text-white border-purple-500" : "bg-gray-100 hover:bg-gray-200"
                                            }`}
                                    >
                                        {sub.name}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Submit */}
                    <Button type="submit" className="w-full mt-4">
                        {isEditMode ? "Сохранить изменения" : "Добавить товар"}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

export default CreateProduct
