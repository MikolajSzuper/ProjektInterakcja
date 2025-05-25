import React, { useState } from 'react';
import Checkbox from "./Checkbox.jsx";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../AuthContext.jsx";

function MainContent() {
    const [averageSalary, setAverageSalary] = useState(false);
    const [minimalSalary, setMinimalSalary] = useState(false);
    const [minimalPension, setMinimalPension] = useState(false);
    const [averagePension, setAveragePension] = useState(false);
    const [careAllowance, setCareAllowance] = useState(false);
    const [naturalDisasters, setNaturalDisasters] = useState(false);
    const [inflation, setInflation] = useState(false);
    const [pkb, setPkb] = useState(false);
    const [pkbPerCapita, setPkbPerCapita] = useState(false);
    const [ppp, setPpp] = useState(false);
    const [pppPerCapita, setPppPerCapita] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {username} = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const filters = {
            averageSalary,
            minimalSalary,
            minimalPension,
            averagePension,
            careAllowance,
            naturalDisasters,
            pkb,
            pkbPerCapita,
            ppp,
            pppPerCapita,
            inflation,
            dateFrom,
            dateTo
        };
        const params = new URLSearchParams(filters).toString();
        const url = `http://localhost:3000/api/test?${params}`;
        setLoading(true);
        try {
            const respon = await fetch(url, {
                method: 'GET',
                credentials: 'include',
            });

            const dataReceived = await respon.json();
            navigate('/results', { state: dataReceived });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>
            )}
            {username && (
            <form onSubmit={handleSubmit} className="form-container">
                <h2 className="form-title">Filtruj dane</h2>

                <div className="form-section">
                    <fieldset className="form-fieldset">
                        <legend className="form-legend">Świadczenia</legend>
                        <div className="form-checkbox-group">
                            <Checkbox value="Średnia pensja" onChange={setAverageSalary} />
                            <Checkbox value="Płaca minimalna" onChange={setMinimalSalary} />
                            <Checkbox value="Minimalna emerytura" onChange={setMinimalPension} />
                            <Checkbox value="Średnia emerytura" onChange={setAveragePension} />
                            <Checkbox value="Zasiłek pielęgnacyjny" onChange={setCareAllowance} />
                            <Checkbox value="Kwota na osobe po klęsce żywiołowej" onChange={setNaturalDisasters} />
                        </div>
                    </fieldset>

                    <fieldset className="form-fieldset">
                        <legend className="form-legend">Wskaźniki makroekonomiczne</legend>
                        <div className="form-checkbox-group">
                            <Checkbox value="inflation" onChange={setInflation} />
                            <Checkbox value="pkb" onChange={setPkb} />
                            <Checkbox value="pkbPerCapita" onChange={setPkbPerCapita} />
                            <Checkbox value="ppp" onChange={setPpp} />
                            <Checkbox value="pppPerCapita" onChange={setPppPerCapita} />
                        </div>
                    </fieldset>
                </div>

                <div className="form-section">
                    <div>
                        <label className="block font-medium">Data od:</label>
                        <input
                            type="month"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="form-input"
                        />
                    </div>
                    <div>
                        <label className="block font-medium">Data do:</label>
                        <input
                            type="month"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-button-container">
                    <button type="submit" className="form-button">
                        Filtruj
                    </button>
                </div>
            </form>
            )}
        </>
    );
}

export default MainContent;