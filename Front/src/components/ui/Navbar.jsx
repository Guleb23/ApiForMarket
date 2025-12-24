import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Navbar = () => {
    const { user, logout } = useAuth()
    const location = useLocation()

    return (
        <header className="bg-purple-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* Навигация слева */}
                <nav className="flex gap-6 text-sm font-medium text-gray-800">
                    <Link
                        to="/"
                        className={`relative py-1 px-1 hover:text-purple-600 transition ${location.pathname === "/" ? "after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-purple-300" : ""
                            }`}
                    >
                        Магазины
                    </Link>
                    <Link
                        to="/products"
                        className={`relative py-1 px-1 hover:text-purple-600 transition ${location.pathname === "/products" ? "after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-purple-300" : ""
                            }`}
                    >
                        Товары
                    </Link>
                </nav>

                {/* Профиль справа */}
                <div className="relative group">
                    <div className="flex items-center gap-2 cursor-pointer select-none p-1 rounded hover:bg-purple-100 transition">
                        {/* Иконка пользователя */}
                        <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-sm font-semibold text-gray-700">
                            {user?.email?.[0]?.toUpperCase()}
                        </div>

                        {/* Email */}
                        <span className="text-sm text-gray-700 opacity-90 truncate max-w-[120px]">
                            {user?.email}
                        </span>
                    </div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link
                            to="/profile"
                            className="block px-4 py-2 text-sm hover:bg-purple-50 rounded-t-md"
                        >
                            Профиль
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-purple-50 rounded-b-md"
                        >
                            Выйти
                        </button>
                    </div>
                </div>

            </div>
        </header>
    )
}

export default Navbar
