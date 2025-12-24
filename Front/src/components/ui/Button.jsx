// src/components/ui/Button.jsx
const Button = ({ children, className = "", ...props }) => {
    return (
        <button
            {...props}
            className={`bg-[#8b5cf6] text-white py-2 px-4 rounded-xl hover:bg-[#7c3aed] transition ${className}`}
        >
            {children}
        </button>
    )
}

export default Button
