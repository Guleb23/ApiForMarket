import { Outlet } from "react-router";
import Navbar from "../components/ui/Navbar";
import { useAuth } from "../context/AuthContext"

const Home = () => {
    const { user } = useAuth()

    return (
        <>
            <Navbar />

            <main className="p-6 max-w-7xl mx-auto">

                <Outlet />
            </main>

        </>
    )
}


export default Home;