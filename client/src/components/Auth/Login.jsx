import { useState } from "react";
import { useAuth } from "../../AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUsername } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username: login, password: password })
            });
            if (!res.ok) {
                throw new Error('Błędny login lub hasło');
            }
            setUsername(login);
            console.log('Zalogowano pomyślnie');
            navigate("/");
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="login" className="form-label">Login:</label>
                    <input
                        type="text"
                        id="login"
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Hasło:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                {error && <div className="form-error">{error}</div>}
                <button type="submit" className="form-button">
                    Zaloguj się
                </button>
            </form>
        </div>
    );
}