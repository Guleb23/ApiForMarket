import api from "./axios";


export const getCategories = () =>
    api.get(`/category`)

export const getProductsByCategory = (page = 1, pageSize = 10, categoryIds) =>
    api.get(`/category/filter`, {
        params: {
            page,
            pageSize,
            categories: categoryIds
        },
        paramsSerializer: params => {

            return Object.keys(params)
                .map(key =>
                    Array.isArray(params[key])
                        ? params[key].map(val => `${key}=${val}`).join('&')
                        : `${key}=${params[key]}`
                )
                .join('&')
        }
    })