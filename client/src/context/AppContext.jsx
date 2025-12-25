import { createContext } from "react";

export const AppContent = createContext()

export const AppContextProvider = (prop) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(false)
    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData
    }

    return (
        <AppContent.Provider value={value}>
            {prop.children}
        </AppContent.Provider>
    )

}