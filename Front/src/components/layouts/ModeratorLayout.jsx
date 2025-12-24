import { Outlet, Link, useLocation } from "react-router-dom"
import { FiPackage, FiShoppingBag, FiLogOut } from "react-icons/fi"

const ModeratorLayout = () => {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header с навигацией */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="font-semibold text-lg text-gray-800">
                            Панель модератора
                        </h1>

                        {/* Навигация */}
                        <nav className="flex items-center gap-1">
                            <Link
                                to="/moderator/products"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${location.pathname === '/moderator/products'
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <FiPackage className="text-sm" />
                                <span>Товары</span>
                            </Link>

                            <Link
                                to="/moderator/shops"
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${location.pathname === '/moderator/shops'
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <FiShoppingBag className="text-sm" />
                                <span>Магазины</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Кнопка выхода или другая информация */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                // Логика выхода
                                localStorage.removeItem('accessToken')
                                window.location.href = '/login'
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                            <FiLogOut />
                            <span>Выйти</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Основной контент */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <Outlet />
            </main>
        </div>
    )
}

export default ModeratorLayout