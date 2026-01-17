import api from "./axios"

export const getProducts = (page = 1, pageSize = 10) =>
    api.get('/product', {
        params: {
            page: page,
            pageSize: pageSize
        }
    })

export const getAllProductsForShop = (page = 1, pageSize = 10, shopId) =>
    api.get(`/product/all/${shopId}`, {
        params: {
            page: page,
            pageSize: pageSize
        }
    })


export const getProductById = (id) =>
    api.get(`/product/${id}`)

export const updateProduct = (id, data) =>
    api.patch(`/product/${id}/edit`, data)

export const addProduct = (data) =>
    api.post(`/product`, data)

export const getAllProducts = (page = 1, pageSize = 10) =>
    api.get(`/product/all/`, {
        params: {
            page: page,
            pageSize: pageSize
        }
    })
export const moderate = (id, data) =>
    api.patch(`/product/${id}`, data)

