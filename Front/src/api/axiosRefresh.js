import axios from "axios"

const axiosRefresh = axios.create({
    baseURL: "https://localhost:7125/api",
})

export default axiosRefresh
