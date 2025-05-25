import { useState } from "react";

export default function Register() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        if (password !== repeatPassword) {
            setError("Hasła nie są takie same");
            return;
        }

        try {
            const res = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: login, password: password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Błąd podczas rejestracji');
                return;
            }

            setSuccess(data.message || "Zarejestrowano pomyślnie! Możesz się zalogować.");
            setLogin('');
            setPassword('');
            setRepeatPassword('');
        } catch (err) {
            setError("Błąd połączenia z serwerem");
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
                <div className="form-group">
                    <label htmlFor="repeatPassword" className="form-label">Powtórz hasło:</label>
                    <input
                        type="password"
                        id="repeatPassword"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        required
                        className="form-input"
                    />
                </div>
                {error && <div className="form-error">{error}</div>}
                {success && <div className="form-success">{success}</div>}
                <button type="submit" className="form-button">
                    Zarejestruj się
                </button>
            </form>
        </div>
    );
}