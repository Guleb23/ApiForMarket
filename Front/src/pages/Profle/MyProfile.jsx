import React, { useEffect, useState } from "react"
import { FiUser, FiMail, FiShield } from "react-icons/fi"
import { getProfile } from "../../api/profile"
import { useAuth } from "../../context/AuthContext"

const MyProfile = () => {
    const { user } = useAuth()

    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const res = await getProfile()
            setProfile(res.data)
        } catch {
            setError("Не удалось загрузить профиль")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

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
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

            {/* HEADER */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <FiUser className="text-purple-600 text-2xl" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                    Мой профиль
                </h1>
            </div>

            {/* PROFILE CARD */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                    <FiMail className="text-purple-500" />
                    <span className="font-medium">Email:</span>
                    <span className="text-gray-900">{profile.email}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                    <FiUser className="text-purple-500" />
                    <span className="font-medium">User ID:</span>
                    <span className="text-gray-900 text-sm break-all">
                        {user?.id}
                    </span>
                </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <FiShield className="text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Безопасность
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Здесь будут настройки пароля, двухфакторная аутентификация и сессии.
                </p>

                <button
                    disabled
                    className="mt-4 px-5 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm cursor-not-allowed"
                >
                    В разработке
                </button>
            </div>
        </div>
    )
}

export default MyProfile
