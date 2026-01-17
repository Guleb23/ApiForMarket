import { Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import Home from "../pages/Home"
import ProtectedRoute from "../components/route/ProtectedRoute"
import ModeratorRoute from "../components/route/ModeratorRoute"
import Register from "../pages/Register"
import Shops from "../pages/Shops"
import Products from "../pages/Products"
import NotFound from "../pages/NotFound"
import ShopDetail from "../pages/ShopDetail"
import FullWidthLayout from "../components/layouts/FullWidthLayout"
import BaseLayout from "../components/layouts/BaseLayout"
import ProductDetail from "../pages/ProductDetail"
import Profile from "../pages/Profile"
import CreateShop from "../pages/CreateShop"
import CreateProduct from "../pages/CreateProduct"
import ModeratorLayout from "../components/layouts/ModeratorLayout"
import ModerationProducts from "../components/ui/Moderator/ModerationProducts"
import ModerationShops from "../components/ui/Moderator/ModerationShops"
import ModeratorRedirect from "../components/route/ModeratorRedirect"
import OrderDetail from "../pages/OrderDetail"
import ProfileLayout from "../components/layouts/ProfileLayout"
import MyProfile from "../pages/Profle/MyProfile"
import MyOrders from "../pages/Profle/MyOrders"
import MyShop from "../pages/Profle/MyShop"
import Settings from "../pages/Profle/Settings"

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Обычные роуты - обернуты в ModeratorRedirect */}
            <Route
                element={
                    <ProtectedRoute>
                        <ModeratorRedirect>
                            <BaseLayout />
                        </ModeratorRedirect>
                    </ProtectedRoute>
                }>
                <Route path="/" element={<Shops />} />
                <Route path="/products" element={<Products />} />
            </Route>

            <Route element={
                <ProtectedRoute>
                    <ModeratorRedirect>
                        <FullWidthLayout />
                    </ModeratorRedirect>
                </ProtectedRoute>
            }>
                <Route path="/shop/:shopId" element={<ShopDetail />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/profile" element={<ProfileLayout />}>
                    <Route index element={<MyProfile />} />
                    <Route path="orders" element={<MyOrders />} />
                    <Route path="shop" element={<MyShop />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="/shop/create" element={<CreateShop />} />
                <Route path="/order/:orderId" element={<OrderDetail />} />
                <Route path="/shop/:shopId/add-product" element={<CreateProduct />} />
                <Route path="/shop/:shopId/product/:productId/edit" element={<CreateProduct />} />
            </Route>

            {/* Роуты модератора */}
            <Route path="/moderator" element={
                <ModeratorRoute>
                    <ModeratorLayout />
                </ModeratorRoute>
            }>
                <Route index element={<Navigate to="products" replace />} />

                <Route path="shops" element={<ModerationShops />} />
                <Route path="products" element={<ModerationProducts />} />
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>

    )
}

export default AppRouter
