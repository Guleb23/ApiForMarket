import api from "./axios"

export const createOrder = (data) =>
    api.post(`/order`, data)

export const getOrderById = (id) =>
    api.get(`/order/${id}`)

export const getMyOrders = () =>
    api.get(`/order/my`)

export const getShopOrders = () =>
    api.get(`/order/myshop`)

export const buy = (orderId) =>
    api.get(`/order/buy/${orderId}`)

export const getHistoryMessages = (orderId) =>
    api.get(`/order/${orderId}/messages`)