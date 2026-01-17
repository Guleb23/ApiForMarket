import React, { useRef, useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { FiChevronDown, FiCheck, FiX } from "react-icons/fi"

const DropdownPortal = ({ children }) =>
    ReactDOM.createPortal(children, document.body)

/* =========================
   Helpers
========================= */
const collectCategoryIds = (category) => {
    let ids = [category.id]
    category.children?.forEach((child) => {
        ids = ids.concat(collectCategoryIds(child))
    })
    return ids
}

/* =========================
   Component
========================= */
const HorizontalCategoryFilter = ({ categories, selectedIds, onChange }) => {
    const [openId, setOpenId] = useState(null)
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 })
    const [searchTerm, setSearchTerm] = useState("")
    const [showAllSelected, setShowAllSelected] = useState(false)

    const closeTimer = useRef(null)
    const containerRef = useRef(null)
    const dropdownRef = useRef(null)

    /* =========================
       Outside click
    ========================= */
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setOpenId(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    /* =========================
       Dropdown positioning
    ========================= */
    const openDropdown = (cat, e) => {
        if (!cat.children?.length) return

        clearTimeout(closeTimer.current)

        const rect = e.currentTarget.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const dropdownHeight = 420

        const spaceBelow = viewportHeight - rect.bottom
        const spaceAbove = rect.top

        const openTop = spaceBelow < dropdownHeight && spaceAbove > spaceBelow

        setPos({
            top: openTop
                ? rect.top + window.scrollY - dropdownHeight - 8
                : rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
            width: Math.min(rect.width * 1.6, 320),
            height: dropdownHeight,
            position: openTop ? "top" : "bottom",
        })

        setSearchTerm("")
        setOpenId(cat.id)
    }

    const scheduleClose = () => {
        closeTimer.current = setTimeout(() => setOpenId(null), 250)
    }

    const cancelClose = () => clearTimeout(closeTimer.current)

    /* =========================
       Selection logic
    ========================= */
    const toggleRootCategory = (cat) => {
        const ids = collectCategoryIds(cat)
        const allSelected = ids.every((id) => selectedIds.includes(id))

        if (allSelected) {
            onChange(selectedIds.filter((id) => !ids.includes(id)))
        } else {
            onChange(Array.from(new Set([...selectedIds, ...ids])))
        }
    }

    const toggleCategory = (id) => {
        selectedIds.includes(id)
            ? onChange(selectedIds.filter((c) => c !== id))
            : onChange([...selectedIds, id])
    }

    const clearAll = () => onChange([])

    /* =========================
       Helpers
    ========================= */
    const getCategoryPath = (categoryId) => {
        const find = (cats, id, path = []) => {
            for (const c of cats) {
                if (c.id === id) return [...path, c.name]
                if (c.children?.length) {
                    const res = find(c.children, id, [...path, c.name])
                    if (res) return res
                }
            }
            return null
        }
        return find(categories, categoryId)?.join(" → ")
    }

    const activeCategory = categories.find((c) => c.id === openId)

    const filteredChildren =
        activeCategory?.children?.filter((c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) || []

    const selectedCategories = selectedIds
        .map((id) => ({ id, name: getCategoryPath(id) }))
        .filter((c) => c.name)

    /* =========================
       Render
    ========================= */
    return (
        <div
            ref={containerRef}
            className="relative bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
            {/* Selected */}
            {selectedCategories.length > 0 && (
                <div className="px-5 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                            Выбрано: {selectedCategories.length}
                        </span>
                        <button
                            onClick={clearAll}
                            className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition"
                        >
                            <FiX size={14} />
                            Очистить
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {selectedCategories
                            .slice(0, showAllSelected ? undefined : 5)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-full px-3 py-1 text-sm text-purple-800"
                                >
                                    <span>{item.name}</span>
                                    <button
                                        onClick={() => toggleCategory(item.id)}
                                        className="text-purple-400 hover:text-red-500 transition"
                                    >
                                        <FiX size={12} />
                                    </button>
                                </div>
                            ))}

                        {selectedCategories.length > 5 && (
                            <button
                                onClick={() => setShowAllSelected(!showAllSelected)}
                                className="text-sm font-medium text-purple-600 hover:text-purple-800"
                            >
                                {showAllSelected
                                    ? "Свернуть"
                                    : `+${selectedCategories.length - 5} ещё`}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Root categories */}
            <div className="flex gap-2 px-5 py-4 overflow-x-auto scrollbar-thin">
                {categories.map((cat) => {
                    const ids = collectCategoryIds(cat)
                    const isSelected = ids.every((id) => selectedIds.includes(id))
                    const isPartial =
                        ids.some((id) => selectedIds.includes(id)) && !isSelected

                    return (
                        <div
                            key={cat.id}
                            onMouseEnter={(e) => openDropdown(cat, e)}
                            onMouseLeave={scheduleClose}
                        >
                            <button
                                onClick={() => toggleRootCategory(cat)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                  ${isSelected
                                        ? "bg-purple-600 text-white border-purple-600"
                                        : isPartial
                                            ? "bg-purple-100 text-purple-800 border-purple-300"
                                            : "bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:text-purple-700"
                                    }`}
                            >
                                {cat.name}
                                {cat.children?.length > 0 && (
                                    <FiChevronDown
                                        className={`transition-transform ${openId === cat.id ? "rotate-180" : ""
                                            }`}
                                    />
                                )}
                            </button>
                        </div>
                    )
                })}
            </div>

            {/* Dropdown */}
            {openId && activeCategory?.children?.length > 0 && (
                <DropdownPortal>
                    <div
                        ref={dropdownRef}
                        style={{
                            top: pos.top,
                            left: pos.left,
                            width: pos.width,
                            maxHeight: pos.height,
                        }}
                        onMouseEnter={cancelClose}
                        onMouseLeave={scheduleClose}
                        className={`absolute z-[9999] bg-white border border-gray-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden ${pos.position === "top" ? "shadow-top" : "shadow-bottom"
                            }`}
                    >
                        {/* Header */}
                        <div className="p-4 border-b bg-gradient-to-r from-purple-50/70 to-white">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-900">
                                    {activeCategory.name}
                                </h3>
                                <button
                                    onClick={() => {
                                        toggleRootCategory(activeCategory)
                                        setOpenId(null)
                                    }}
                                    className="text-xs font-semibold text-purple-600 hover:text-purple-800"
                                >
                                    {collectCategoryIds(activeCategory).every((id) =>
                                        selectedIds.includes(id)
                                    )
                                        ? "Снять все"
                                        : "Выбрать все"}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Поиск..."
                                    className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400"
                                />
                                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredChildren.length ? (
                                filteredChildren.map((child) => {
                                    const isSelected = selectedIds.includes(child.id)
                                    return (
                                        <button
                                            key={child.id}
                                            onClick={() => toggleCategory(child.id)}
                                            className={`w-full px-4 py-3 flex justify-between items-center text-sm border-b last:border-b-0 transition hover:bg-purple-50/60 ${isSelected
                                                    ? "bg-purple-50 text-purple-800"
                                                    : "text-gray-700"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected
                                                            ? "bg-purple-600 border-purple-600"
                                                            : "border-gray-300"
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <FiCheck size={12} className="text-white" />
                                                    )}
                                                </div>
                                                {child.name}
                                            </div>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    Ничего не найдено
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {filteredChildren.length > 0 && (
                            <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
                                Выбрано:{" "}
                                {
                                    filteredChildren.filter((c) =>
                                        selectedIds.includes(c.id)
                                    ).length
                                }{" "}
                                из {filteredChildren.length}
                            </div>
                        )}
                    </div>
                </DropdownPortal>
            )}
        </div>
    )
}

/* =========================
   Styles
========================= */
const styles = `
.scrollbar-thin::-webkit-scrollbar { height: 6px; }
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #d8b4fe, #c084fc);
  border-radius: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #c084fc, #a855f7);
}
.shadow-top { box-shadow: 0 -20px 50px rgba(0,0,0,0.12); }
.shadow-bottom { box-shadow: 0 20px 50px rgba(0,0,0,0.12); }
`

if (typeof document !== "undefined") {
    const style = document.createElement("style")
    style.innerHTML = styles
    document.head.appendChild(style)
}

export default HorizontalCategoryFilter
