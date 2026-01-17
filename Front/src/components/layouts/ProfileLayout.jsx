import { NavLink, Outlet } from "react-router-dom"
import { FiUser, FiShoppingBag, FiSettings } from "react-icons/fi"
import { FaStore } from "react-icons/fa"

const ProfileLayout = () => {
    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
        ${isActive
            ? "bg-purple-600 text-white shadow-md"
            : "text-gray-600 hover:bg-gray-100"
        }`

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8">

                {/* SIDEBAR */}
                <aside className="w-64 bg-white rounded-3xl border border-gray-200 shadow-sm p-4 h-fit">
                    <nav className="space-y-2">
                        <NavLink to="/profile" end className={linkClass}>
                            <FiUser />
                            Профиль
                        </NavLink>

                        <NavLink to="/profile/orders" className={linkClass}>
                            <FiShoppingBag />
                            Мои заказы
                        </NavLink>

                        <NavLink to="/profile/shop" className={linkClass}>
                            <FaStore />
                            Мой магазин
                        </NavLink>

                        <NavLink to="/profile/settings" className={linkClass}>
                            <FiSettings />
                            Настройки
                        </NavLink>
                    </nav>
                </aside>

                {/* CONTENT */}
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default ProfileLayout
