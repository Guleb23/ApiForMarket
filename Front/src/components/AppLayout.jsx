const AppLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-bg text-gray-900">
            <div className="max-w-md mx-auto px-4 py-10">
                {children}
            </div>
        </div>
    )
}

export default AppLayout
