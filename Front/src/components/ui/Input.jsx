// src/components/ui/Input.jsx
const Input = ({ className = "", ...props }) => {
    return (
        <input
            {...props}
            className={`border border-[#ddd6fe] rounded-xl px-3 py-2 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none ${className} w-full`}
        />
    )
}

export default Input
