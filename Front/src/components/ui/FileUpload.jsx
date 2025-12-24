import { FiUpload, FiImage } from "react-icons/fi"

const FileUpload = ({ label, file, onChange, icon }) => {
    return (
        <label
            className="
                flex flex-col items-center justify-center
                gap-2
                w-full
                h-32
                border-2 border-dashed border-purple-300
                rounded-2xl
                cursor-pointer
                bg-purple-50/50
                text-purple-700
                transition
                hover:bg-purple-100
                hover:border-purple-400
            "
        >
            <input
                type="file"
                accept="image/*"
                onChange={onChange}
                className="hidden"
            />

            <div className="text-2xl">
                {icon || <FiUpload />}
            </div>

            <span className="font-medium text-sm">
                {label}
            </span>

            <span className="text-xs text-purple-500">
                JPG / PNG
            </span>

            {file && (
                <span className="mt-1 text-xs text-gray-600">
                    {file.name}
                </span>
            )}
        </label>
    )
}

export default FileUpload
