import React from "react"
import {
    FiUser,
    FiShield,
    FiBell,
    FiMonitor,
    FiAlertTriangle,
} from "react-icons/fi"

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

            {/* HEADER */}
            <h1 className="text-2xl font-semibold text-gray-900">
                Настройки
            </h1>

            {/* ACCOUNT */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <FiUser className="text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Аккаунт
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Управление данными аккаунта (email, имя, профиль).
                </p>

                <button
                    disabled
                    className="mt-4 px-5 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm cursor-not-allowed"
                >
                    В разработке
                </button>
            </div>

            {/* SECURITY */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <FiShield className="text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Безопасность
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Смена пароля, двухфакторная аутентификация, активные сессии.
                </p>

                <button
                    disabled
                    className="mt-4 px-5 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm cursor-not-allowed"
                >
                    В разработке
                </button>
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <FiBell className="text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Уведомления
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Настройки уведомлений о заказах, оплатах и статусах.
                </p>

                <button
                    disabled
                    className="mt-4 px-5 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm cursor-not-allowed"
                >
                    В разработке
                </button>
            </div>

            {/* INTERFACE */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <FiMonitor className="text-purple-600" />
                    <h2 className="text-lg font-semibold text-gray-900">
                        Интерфейс
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Тема, язык и визуальные настройки интерфейса.
                </p>

                <button
                    disabled
                    className="mt-4 px-5 py-2 rounded-xl bg-gray-200 text-gray-500 text-sm cursor-not-allowed"
                >
                    В разработке
                </button>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-white rounded-3xl border border-red-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3 text-red-600">
                    <FiAlertTriangle />
                    <h2 className="text-lg font-semibold">
                        Опасная зона
                    </h2>
                </div>

                <p className="text-sm text-gray-500">
                    Удаление аккаунта и сброс данных.
                </p>

                <button
                    disabled
                    className="mt-4 px-5 py-2 rounded-xl bg-red-100 text-red-400 text-sm cursor-not-allowed"
                >
                    Удалить аккаунт (в разработке)
                </button>
            </div>

        </div>
    )
}

export default Settings
