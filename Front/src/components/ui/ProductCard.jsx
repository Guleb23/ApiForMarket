import { useNavigate } from "react-router"
import ShopStatusBadge from "./ShopStatusBadge";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/product/${product.id}`)}
            className="group relative rounded-xl border border-purple-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-purple-200">
            {/* Image */}
            <div className="relative aspect-[5/3] overflow-hidden rounded-t-xl bg-purple-50">
                <img
                    src={product.img}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Soft gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-purple-50/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5 p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                    {product.name}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2">
                    {product.description}
                </p>

                <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-500">
                        {product.price} ₽
                    </span>

                    <button className="text-xs text-gray-400 transition hover:text-purple-600">
                        Подробнее →
                    </button>
                </div>
                {product.isModerated == 2 ? <></> : <ShopStatusBadge status={product.isModerated} />}

            </div>

        </div>
    )
}

export default ProductCard
