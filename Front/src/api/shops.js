import api from "./axios"

export const getShops = (page = 1, pageSize = 10) =>
    api.get('/Shop/allshops', {
        params: {
            page: page,
            pageSize: pageSize
        }
    })

export const getShopById = (id) =>
    api.get(`/Shop/${id}`)

export const createShop = (data) =>
    api.post("/Shop", data)
export const getAllShops = (page = 1, pageSize = 10) =>
    api.get(`/shop/all`, {
        params: {
            page: page,
            pageSize: pageSize
        }
    })
export const moderate = (id, data) =>
    api.patch(`/shop/${id}`, data)