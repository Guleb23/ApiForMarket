import { useEffect, useState } from "react"
import { FiCheck, FiX, FiAlertCircle, FiImage, FiShoppingBag } from "react-icons/fi"
import Button from "../Button"
import Modal from "../Moderator/Modal"
import {
    getAllShops,
    moderate
} from "../../../api/shops"

const ModerationShops = () => {
    const [shops, setShops] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [previewImage, setPreviewImage] = useState(null)
    const [processingId, setProcessingId] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [noShops, setNoShops] = useState(false)
    const [previewType, setPreviewType] = useState(null) // 'icon' или 'walpaper'

    const fetchShops = async () => {
        try {
            setLoading(true)
            setError(null)
            setSuccessMessage(null)
            setNoShops(false)

            const res = await getAllShops(page, 10)

            setShops(res.data.items)
            setTotalPages(res.data.totalPages)

            if (res.data.items.length === 0) {
                setNoShops(true)
            }
        } catch (e) {
            if (e.response?.status === 404) {
                // Нет магазинов — это не ошибка
                setShops([])
                setTotalPages(1)
                setNoShops(true)
            } else {
                setError(
                    "Ошибка загрузки магазинов: " +
                    (e.response?.data?.message || e.message)
                )
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchShops()
    }, [page])

    const handleApprove = async (id) => {
        try {
            setProcessingId(id)

            // Отправляем данные для модерации магазина
            const data = { result: true }

            await moderate(id, data)

            setSuccessMessage(`Магазин #${id} успешно одобрен`)

            // Обновляем список через 1 секунду
            setTimeout(() => {
                fetchShops()
            }, 1000)

        } catch (e) {
            setError("Ошибка при одобрении магазина: " + (e.response?.data?.message || e.message))
            console.error("Ошибка одобрения магазина:", e)
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
            const data = { result: false }

            await moderate(id, data)

            setSuccessMessage(`Магазин #${id} отклонен`)

            setTimeout(() => {
                fetchShops()
            }, 1000)

        } catch (e) {
            setError("Ошибка при отклонении магазина: " + (e.response?.data?.message || e.message))
            console.error("Ошибка отклонения магазина:", e)
        } finally {
            setProcessingId(null)

            setTimeout(() => {
                setError(null)
                setSuccessMessage(null)
            }, 3000)
        }
    }

    const openImagePreview = (imageUrl, type) => {
        setPreviewImage(imageUrl)
        setPreviewType(type)
    }

    const getStatusText = (isModerated) => {
        switch (isModerated) {
            case 1:
            case null:
            case undefined:
                return "На модерации"
            case 2:
                return "Одобрено"
            case 3:
                return "Отклонено"
            default:
                return "Неизвестно"
        }
    }

    // Функция для получения классов статуса
    const getStatusClass = (isModerated) => {
        switch (isModerated) {
            case 1:
            case null:
            case undefined:
                return "bg-yellow-100 text-yellow-800"
            case 2:
                return "bg-green-100 text-green-800"
            case 3:
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    // Функция для сокращения описания
    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return "—"
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + "..."
    }

    if (loading && shops.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">Загрузка магазинов...</p>
                </div>
            </div>
        )
    }

    if (error && shops.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-600">
                <FiAlertCircle className="text-3xl mb-2" />
                <p>{error}</p>
                <Button
                    onClick={fetchShops}
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
                    Модерация магазинов
                </h1>
                <p className="text-gray-600 mt-1">
                    Список магазинов для модерации
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
                            <th className="py-3 px-4 font-medium">Иконка</th>
                            <th className="py-3 px-4 font-medium">Обложка</th>
                            <th className="py-3 px-4 font-medium">Название</th>
                            <th className="py-3 px-4 font-medium">Описание</th>
                            <th className="py-3 px-4 font-medium">Статус</th>
                            <th className="py-3 px-4 font-medium text-right">Действия</th>
                        </tr>
                    </thead>

                    <tbody>
                        {shops.map(shop => {
                            const isProcessing = processingId === shop.id

                            return (
                                <tr
                                    key={shop.id}
                                    className={`border-b hover:bg-gray-50 transition ${isProcessing ? 'opacity-70' : ''
                                        }`}
                                >
                                    {/* Иконка магазина */}
                                    <td className="py-3 px-4">
                                        {shop.icon ? (
                                            <button
                                                onClick={() => openImagePreview(shop.icon, 'icon')}
                                                className="w-12 h-12 rounded-lg overflow-hidden border hover:scale-105 transition"
                                                disabled={isProcessing}
                                                title="Просмотр иконки"
                                            >
                                                <img
                                                    src={shop.icon}
                                                    alt={`Иконка ${shop.name}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder-image.png"
                                                    }}
                                                />
                                            </button>
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                <FiShoppingBag className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>

                                    {/* Обложка магазина */}
                                    <td className="py-3 px-4">
                                        {shop.walpaper ? (
                                            <button
                                                onClick={() => openImagePreview(shop.walpaper, 'walpaper')}
                                                className="w-20 h-12 rounded-lg overflow-hidden border hover:scale-105 transition"
                                                disabled={isProcessing}
                                                title="Просмотр обложки"
                                            >
                                                <img
                                                    src={shop.walpaper}
                                                    alt={`Обложка ${shop.name}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = "/placeholder-image.png"
                                                    }}
                                                />
                                            </button>
                                        ) : (
                                            <div className="w-20 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <FiImage className="text-gray-400" />
                                            </div>
                                        )}
                                    </td>

                                    {/* Название магазина */}
                                    <td className="py-3 px-4">
                                        <div className="font-medium">
                                            {shop.name || "—"}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            ID: {shop.id}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Владелец: {shop.userId}
                                        </div>
                                    </td>

                                    {/* Описание магазина */}
                                    <td className="py-3 px-4">
                                        <div className="text-sm text-gray-600 max-w-xs">
                                            {truncateDescription(shop.description)}
                                        </div>
                                    </td>

                                    {/* Статус модерации */}
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs rounded ${getStatusClass(shop.isModerated)}`}>
                                            {getStatusText(shop.isModerated)}
                                        </span>
                                    </td>

                                    {/* Действия */}
                                    <td className="py-3 px-4">
                                        <div className="flex justify-end gap-2">

                                            <Button
                                                size="sm"
                                                variant="success"
                                                onClick={() => handleApprove(shop.id)}
                                                disabled={isProcessing}
                                                loading={isProcessing && processingId === shop.id}
                                            >
                                                <FiCheck className="text-sm" />
                                                {isProcessing && processingId === shop.id ? "..." : ""}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleReject(shop.id)}
                                                disabled={isProcessing}
                                                loading={isProcessing && processingId === shop.id}
                                            >
                                                <FiX className="text-sm" />
                                                {isProcessing && processingId === shop.id ? "..." : ""}
                                            </Button>


                                            {shop.isModerated === 2 && (
                                                <span className="text-xs text-green-600 font-medium px-2 py-1">
                                                    Одобрен
                                                </span>
                                            )}
                                            {shop.isModerated === 3 && (
                                                <span className="text-xs text-red-600 font-medium px-2 py-1">
                                                    Отклонён
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {(noShops || shops.length === 0) && !loading && (
                    <div className="text-center py-16 text-gray-500 flex flex-col items-center gap-3">
                        <FiShoppingBag className="text-4xl text-gray-300" />
                        <p className="text-lg font-medium">
                            Нет магазинов для модерации
                        </p>
                        <p className="text-sm text-gray-400">
                            Все магазины уже проверены или пока не добавлены
                        </p>
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-500">
                        Показано {shops.length} магазинов
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

            {/* MODAL ДЛЯ ПРЕДПРОСМОТРА ИЗОБРАЖЕНИЙ */}
            {previewImage && (
                <Modal
                    onClose={() => {
                        setPreviewImage(null)
                        setPreviewType(null)
                    }}
                    title={`Просмотр ${previewType === 'icon' ? 'иконки' : 'обложки'}`}
                    size="lg"
                >
                    <div className="p-4">
                        <img
                            src={previewImage}
                            alt={`Просмотр ${previewType}`}
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                            onError={(e) => {
                                e.target.src = "/placeholder-image.png"
                            }}
                        />
                        <div className="mt-4 text-sm text-gray-500 text-center">
                            {previewType === 'icon' ? 'Иконка магазина' : 'Обложка магазина'}
                        </div>
                    </div>
                </Modal>
            )}
        </>
    )
}

export default ModerationShops