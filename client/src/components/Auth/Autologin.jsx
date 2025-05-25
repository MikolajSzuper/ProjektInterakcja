import {useEffect} from "react";
import {useAuth} from "../../AuthContext.jsx";
import Button from "../Button.jsx";

export default function Autologin() {
    const { username, setUsername, loading, setLoading } = useAuth();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:3000/auth/me", {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Nie zalogowany");
                const data = await res.json();
                setUsername(data.username);
            } catch {
                setUsername(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading || !username) return null;

    return (
        // <Button text={`Witaj ${username}`} action={() => console.log("Zalogowany")} />
        <p>
            Witaj, <strong>{username}</strong>!
        </p>
    );
}
