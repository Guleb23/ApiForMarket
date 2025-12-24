import React from 'react'
import { useNavigate, useNavigation } from 'react-router'

const ShopCard = ({ shop }) => {
    const navigation = useNavigate();
    return (
        <div
            onClick={() => navigation(`/shop/${shop.id}`)}
            key={shop.id}
            className="group relative rounded-xl border border-purple-100 bg-purple-50 p-4 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
        >
            {/* ICON */}
            <div className="w-16 h-16 mb-3 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {shop.icon ? (
                    <img
                        src={shop.icon}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-purple-100" />
                )}
            </div>

            {/* NAME */}
            <h3 className="text-base font-semibold text-gray-900 line-clamp-1 mb-1">
                {shop.name}
            </h3>

            {/* DESCRIPTION */}
            <p className="text-xs text-gray-500 line-clamp-3">
                {shop.description}
            </p>
        </div>
    )
}

export default ShopCard
