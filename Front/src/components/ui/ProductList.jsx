import React from 'react'
import ProductCard from './ProductCard'

const ProductList = ({ products }) => {
    if (products == null || products.length == 0) {
        return (
            <p className='flex w-full justify-center'>Пока нету товаров</p>
        )
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, index) => (
                <ProductCard product={p} key={index} />
            ))}
        </div>
    )
}

export default ProductList
