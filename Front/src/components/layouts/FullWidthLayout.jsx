import { Outlet } from "react-router-dom"
import Navbar from "../ui/Navbar"

const FullWidthLayout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    )
}

export default FullWidthLayout
