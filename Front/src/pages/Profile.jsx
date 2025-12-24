import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FiPlus, FiShoppingCart } from "react-icons/fi"
import { getProfile } from "../api/profile"
import ShopStatusBadge from "../components/ui/ShopStatusBadge"
import { useAuth } from "../context/AuthContext"

const Profile = () => {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { user, loading: authLoading } = useAuth()
    const fetchProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getProfile()
            setProfile(response.data)
            console.log(response.data);

        } catch (err) {
            setError("Ошибка при загрузке профиля")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if (!authLoading && user) {
            fetchProfile()
        }
    }, [authLoading, user])



    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-gray-400">
                Загрузка профиля...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-red-600">
                {error}
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

                {/* PROFILE CARD */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                    <h1 className="text-xl font-semibold text-gray-900">Профиль</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        {profile.email}
                    </p>
                </div>

                {/* SHOP SECTION */}
                {profile.shop ? (
                    <>
                        <h1 className="text-xl font-semibold">Информация о магазине</h1>
                        <div
                            onClick={() => navigate(`/shop/${profile.shop.id}`)}
                            className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 flex items-center gap-5 cursor-pointer hover:shadow-md transition"
                        >
                            <div className="w-16 h-16 rounded-xl bg-purple-100 overflow-hidden flex-shrink-0">
                                <img
                                    src={profile.shop.icon}
                                    alt={profile.shop.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {profile.shop.name}
                                    </h2>
                                    <ShopStatusBadge status={profile.shop.isModerated} />
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    {profile.shop.description}
                                </p>

                                {profile.shop.isModerated !== 2 && (
                                    <p className="mt-2 text-xs text-gray-400">
                                        Магазин пока не отображается в поиске
                                    </p>
                                )}

                                {profile.shop.isModerated === 2 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/shop/${profile.shop.id}/add-product`);
                                        }}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white text-sm font-medium shadow-md hover:bg-purple-700 transition"
                                    >
                                        <FiPlus />
                                        Добавить товар
                                    </button>
                                )}
                            </div>

                            <FiShoppingCart className="text-purple-400 text-xl" />
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                                <FiShoppingCart className="text-purple-500 text-2xl" />
                            </div>
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900">
                            У вас ещё нет магазина
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Создайте магазин и начните продавать товары
                        </p>

                        <button
                            onClick={() => navigate("/shop/create")}
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-white text-sm font-medium shadow-md hover:bg-purple-700 transition"
                        >
                            <FiPlus />
                            Создать магазин
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
