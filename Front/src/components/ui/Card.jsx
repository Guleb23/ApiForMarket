
const Card = ({ children, className = "" }) => {
    return (
        <div className={`bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(139,92,246,0.15)] ${className}`}>
            {children}
        </div>
    )
}

export default Card
