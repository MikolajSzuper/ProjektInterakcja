import {useAuth} from "../../AuthContext.jsx";
import Button from "../Button.jsx";
import {useNavigate} from "react-router-dom";

export default function Logout(){
    const {username, setUsername, loading, setLoading} = useAuth();
    const navigate = useNavigate();
    const logout = async () => {
            await fetch("http://localhost:3000/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            setUsername(null);
            navigate("/");
    };
    return (
        <Button text="Wyloguj" action={logout} />
    );
}