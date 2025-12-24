import api from "./axios"
export const getProfile = () =>
    api.get(`/user`)

export const isOwned = (shopId) =>
    api.get(`user/shop/${shopId}/isowned`)

