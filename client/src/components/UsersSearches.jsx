import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UsersSearches() {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);

    const handleChange = (e) => {
        const index = e.target.value;
        if (index !== '') {
            navigate('/results', { state: results[index] });
        }
    };

    useEffect(() => {
        async function pobierz() {
            try {
                const respo = await fetch("http://localhost:3000/api/latest", {
                    credentials: "include"
                });
                if (!respo.ok) throw new Error("Brak danych lub błąd autoryzacji");
                const data = await respo.json();
                // Zbierz tylko te, które istnieją i mają datę
                const keys = ["first", "second", "third", "fourth", "fifth"];
                const arr = keys.map(k => data[k]).filter(r => r && r.date);
                setResults(arr);
            } catch (error) {
                setResults([]);
                console.error("Błąd podczas pobierania danych:", error);
            }
        }
        pobierz();
    }, []);

    if (results.length === 0) {
        return <p className="text-gray-500 text-sm mt-2">Brak zapisanych zapytań.</p>;
    }
    return (
        <select
            onChange={handleChange}
            defaultValue=""
            className="form-select"
        >
            <option value="" disabled>Wybierz datę</option>
            {results.map((res, index) => (
                <option key={index} value={index}>{res.date}</option>
            ))}
        </select>
    );
}