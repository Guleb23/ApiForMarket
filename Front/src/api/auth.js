import api from "./axios"
import refApi from "./axiosRefresh"

export const loginRequest = (data) =>
    api.post("/auth/login", data)

export const registerRequest = (data) =>
    api.post("/Auth/register", data)

export const refreshRequest = (data) =>
    refApi.post("/auth/refresh", data)
