import { useEffect, useState } from "react"
import { FiCheck, FiX, FiImage, FiAlertCircle } from "react-icons/fi"
import Button from "../Button"
import Modal from "../Moderator/Modal"
import {
    getAllProducts,
    moderate // добавляем функцию модерации
} from "../../../api/products"

const ModerationProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [previewImg, setPreviewImg] = useState(null)
    const [processingId, setProcessingId] = useState(null) // для отслеживания обработки
    const [successMessage, setSuccessMessage] = useState(null) // для успешных сообщений
    const [noProducts, setNoProducts] = useState(false)

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)
            setSuccessMessage(null)
            setNoProducts(false)

            const res = await getAllProducts(page, 10)

            setProducts(res.data.items)
            setTotalPages(res.data.totalPages)
        } catch (e) {
            if (e.response?.status === 404) {
                // ✅ НЕТ ТОВАРОВ — ЭТО НЕ ОШИБКА
                setProducts([])
                setTotalPages(1)
                setNoProducts(true)
            } else {
                setError(
                    "Ошибка загрузки товаров: " +
                    (e.response?.data?.message || e.message)
                )
            }
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchProducts()
    }, [page])

    const handleApprove = async (id) => {
        try {
            setProcessingId(id)

            // Отправляем данные для модерации
            // Если API ожидает { result: true } или { isModerated: true }
            const data = { result: true } // или { result: true } в зависимости от API

            await moderate(id, data)

            // Показываем сообщение об успехе
            setSuccessMessage(`Товар #${id} успешно одобрен`)

            // Обновляем список через 1 секунду
            setTimeout(() => {
                fetchProducts()
            }, 1000)

        } catch (e) {
            setError("Ошибка при одобрении товара: " + (e.response?.data?.message || e.message))
            console.error("Ошибка одобрения:", e)
        } finally {
            setProcessingId(null)

            // Через 3 секунды убираем сообщение об ошибке/успехе
            setTimeout(() => {
                setError(null)
                setSuccessMessage(null)
            }, 3000)
        }
    }

    const handleReject = async (id) => {
        try {
            setProcessingId(id)
            const data = { result: false } // или { result: false } в зависимости от API

            await moderate(id, data)

            // Показываем сообщение об успехе
            setSuccessMessage(`Товар #${id} отклонен`)

            // Обновляем список через 1 секунду
            setTimeout(() => {
                fetchProducts()
            }, 1000)

        } catch (e) {
            setError("Ошибка при отклонении товара: " + (e.response?.data?.message || e.message))
            console.error("Ошибка отклонения:", e)
        } finally {
            setProcessingId(null)

            // Через 3 секунды убираем сообщение об ошибке/успехе
            setTimeout(() => {
                setError(null)
                setSuccessMessage(null)
            }, 3000)
        }
    }


    if (loading && products.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Загрузка товаров...</p>
                </div>
            </div>
        )
    }

    if (error && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <FiAlertCircle className="text-3xl mb-2" />
                <p>{error}</p>
                <Button
                    onClick={fetchProducts}
                    className="mt-4"
                    variant="secondary"
                >
                    Попробовать снова
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Модерация товаров
                </h1>
                <p className="text-gray-600 mt-1">
                    Список товаров для модерации
                </p>
            </div>

            {/* Сообщения об ошибках и успехе */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                        <FiCheck />
                        <span>{successMessage}</span>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full">
                    <thead className="text-left text-gray-500 border-b bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 font-medium">Фото</th>
                            <th className="py-3 px-4 font-medium">Название</th>
                            <th className="py-3 px-4 font-medium">Цена</th>
                            <th className="py-3 px-4 font-medium">Статус</th>
                            <th className="py-3 px-4 font-medium text-right">Действия</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map(p => {
                            const isProcessing = processingId === p.id

                            // Определяем статус товара
                            const getStatusText = () => {
                                if (p.isModerated === true || p.isModerated === 1) {
                                    return "На модерации"
                                } else if (p.isModerated === false || p.isModerated === 2) {
                                    return "Одобрено"
                                } else if (p.isModerated === 2) {
                                    return "Отклонено"
                                }
                                return "Неизвестно"
                            }

                            const getStatusClass = () => {
                                if (p.isModerated === true || p.isModerated === 2) {
                                    return "bg-green-100 text-green-800"
                                } else if (p.isModerated === false || p.isModerated === 1) {
                                    return "bg-yellow-100 text-yellow-800"
                                } else if (p.isModerated === 3) {
                                    return "bg-red-100 text-red-800"
                                }
                                return "bg-gray-100 text-gray-800"
                            }

                            return (
                                <tr
                                    key={p.id}
                                    className={`border-b hover:bg-gray-50 transition ${isProcessing ? 'opacity-70' : ''
                                        }`}
                                >
                                    <td className="py-3 px-4">
                                        <button
                                            onClick={() => setPreviewImg(p.img)}
                                            className="w-14 h-14 rounded-lg overflow-hidden border hover:scale-105 transition"
                                            disabled={isProcessing}
                                        >
                                            <img
                                                src={p.img || "/placeholder-image.png"}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = "/placeholder-image.png"
                                                }}
                                            />
                                        </button>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="font-medium">
                                            {p.name}
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-2">
                                            {p.description}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            ID: {p.id}
                                        </div>
                                    </td>

                                    <td className="py-3 px-4 font-semibold">
                                        {p.price ? `${p.price} ₽` : "—"}
                                    </td>

                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded ${getStatusClass()}`}>
                                            {getStatusText()}
                                        </span>
                                    </td>

                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleApprove(p.id)}

                                                loading={isProcessing}
                                            >
                                                <FiCheck className="text-sm" />
                                                {isProcessing ? "Обработка..." : ""}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleReject(p.id)}

                                                loading={isProcessing}
                                            >
                                                <FiX className="text-sm" />
                                                {isProcessing ? "Обработка..." : ""}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {(noProducts || products.length === 0) && !loading && (
                    <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-3">
                        <FiImage className="text-4xl text-gray-300" />
                        <p className="text-lg font-medium">
                            Нет товаров для модерации
                        </p>
                        <p className="text-sm text-gray-400">
                            Все товары уже проверены или пока не добавлены
                        </p>
                    </div>
                )}

            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500">
                        Показано {products.length} товаров
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            disabled={page === 1 || loading}
                            onClick={() => setPage(p => p - 1)}
                            variant="secondary"
                            size="sm"
                        >
                            Назад
                        </Button>

                        <span className="px-4 py-2 text-sm text-gray-600">
                            Страница {page} из {totalPages}
                        </span>

                        <Button
                            disabled={page === totalPages || loading}
                            onClick={() => setPage(p => p + 1)}
                            variant="secondary"
                            size="sm"
                        >
                            Вперёд
                        </Button>
                    </div>
                </div>
            )}

            {/* IMAGE PREVIEW */}
            {previewImg && (
                <Modal
                    onClose={() => setPreviewImg(null)}
                    title="Просмотр изображения"
                    size="lg"
                >
                    <div className="p-4">
                        <img
                            src={previewImg}
                            alt="preview"
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.target.src = "/placeholder-image.png"
                            }}
                        />
                    </div>
                </Modal>
            )}
        </>
    )
}

export default ModerationProducts