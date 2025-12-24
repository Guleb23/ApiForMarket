const Modal = ({ children, onClose }) => {
    return (
        <div
            className="
            fixed inset-0 z-50
            bg-black/70 backdrop-blur-sm
            flex items-center justify-center
            "
            onClick={onClose}
        >
            <div
                onClick={e => e.stopPropagation()}
                className="animate-scaleIn"
            >
                {children}
            </div>
        </div>
    )
}

export default Modal
