import { Outlet } from "react-router-dom"
import Navbar from "../ui/Navbar"


const BaseLayout = () => {
    return (
        <>
            <Navbar />
            <main className="p-6 max-w-7xl mx-auto">
                <Outlet />
            </main>
        </>
    )
}

export default BaseLayout
