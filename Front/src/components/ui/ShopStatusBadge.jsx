const ShopStatusBadge = ({ status }) => {
    if (status === 2) {
        return (
            <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 w-fit">
                Активен
            </span>
        )
    }

    if (status === 3) {
        return (
            <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-700 w-fit">
                Отклонён
            </span>
        )
    }

    return (
        <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 w-fit">
            На модерации
        </span>
    )
}

export default ShopStatusBadge;
