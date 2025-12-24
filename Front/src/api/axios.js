import axios from "axios"

const api = axios.create({
    baseURL: "http://62.113.36.15:8080/api",
    withCredentials: false,
})

export default api
