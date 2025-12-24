import React from 'react'
import ShopCard from './ShopCard'

const ShopList = ({ shops }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((s, index) => (
                <ShopCard shop={s} key={index} />
            ))}
        </div>
    )
}

export default ShopList
