import React, {useEffect, useRef, useState} from "react";
import Chart from "chart.js/auto";
import Button from "./Button.jsx";
import TextArea from "./TextArea.jsx";
import {useLocation} from "react-router-dom";
import builder from "xmlbuilder"
function alignData(sourceDates, sourceValues, allLabels) {
    const dateValueMap = {};
    sourceDates.forEach((date, index) => {
        dateValueMap[date] = sourceValues[index];
    });

    return allLabels.map(date => dateValueMap[date] ?? null);
}
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function exportToJson(jsonData){
    const json = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.json';
    link.click();
};

function exportToXml(jsonData){
    const doc = builder.create("data");
    doc.ele("Download-date")
        .txt(Date())
        .up()
    Object.keys(jsonData).forEach((key) => {
        const section = doc.ele(key);
        try {
            if (key==="date"){
                section.txt(jsonData[key])
            }
            if (Array.isArray(jsonData[key].articles)) {
                jsonData[key].articles.forEach((article) => {
                    const articleElement = section.ele("article");
                    Object.keys(article).forEach((prop) => {
                        if (typeof article[prop] === "object" && article[prop] !== null) {
                            const nested = articleElement.ele(prop);
                            Object.keys(article[prop]).forEach((nestedKey) => {
                                nested.ele(nestedKey).txt(article[prop][nestedKey]).up();
                            });
                        } else {
                            articleElement.ele(prop).txt(article[prop]).up();
                        }
                    });
                });
            }
            else if (
                Array.isArray(jsonData[key].dates) &&
                Array.isArray(jsonData[key].values)
            ) {
                for (let i = 0; i < jsonData[key].dates.length; i++) {
                    section.ele("value", { date: jsonData[key].dates[i] })
                        .txt(jsonData[key].values[i])
                        .up();
                }
            }

        } catch (e) {
            console.log("Błąd przy przetwarzaniu klucza:", key, e);
        }
    });
    const blob = new Blob([doc], { type: 'application/xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.xml';
    link.click();

}


export default function Results() {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const location = useLocation();
    const { state } = location;
    const [global, setGlobal] = useState(null);
    const [polish, setPolish] = useState(null);
    useEffect(() => {
        console.log(state)
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        const allDates = [...new Set([
        ])];
        const allData = []
        Object.keys(state).map((key) => {
            try{
                allDates.push(...state[key].dates);
            }
            catch (e){
            }
        });
        allDates.sort((a, b) => new Date(a) - new Date(b));
        let kolor = getRandomColor();
        Object.keys(state).map((key) => {
            kolor = getRandomColor();
            try{
                if(key==="inflation"  || key==="pkb" || key==="pkbPerCapita" || key==="gva" || key==="gvaPerCapita"  ){
                    allData.push({
                        label: key,
                        data: alignData(state[key].dates, state[key].values, allDates),
                        borderColor: kolor,
                        backgroundColor: kolor,
                        spanGaps:true,
                        yAxisID: 'y1'
                    })
                }
                else if(key === 'globalNews'){
                    setGlobal(1)
                }
                else if(key === 'polishNews'){
                    setPolish(1)
                }
                else{
                    allData.push({
                        label: key,
                        data: alignData(state[key].dates, state[key].values, allDates),
                        borderColor: kolor,
                        backgroundColor: kolor,
                        spanGaps:true,
                        yAxisID: 'y'
                    })
                }

            }
            catch (e){
            }
        });
        const data = {
            labels: allDates,
            datasets: allData
        };
        chartInstanceRef.current = new Chart(chartRef.current, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Porownanie danych i wskaznikow'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                }
            },
        });
        return () => {
            chartInstanceRef.current?.destroy();
        };
    }, [state]);
    return(
            <>
                <div className="maincontent">
                    <h1>Wyniki</h1>
                    <canvas ref={chartRef}></canvas>
                    <Button text="Eksport do JSON" action={() => exportToJson(state)} />
                    <Button text="Eksport do XML" action={() => exportToXml(state)} />
                </div>
                <div className="news-section">
                        {global ? (
                            state.globalNews.articles.map((article, index) => (
                                <TextArea key={`global-${index}`} props={article} />
                            ))
                        ) : (
                            <p>Brak informacji ze świata</p>
                        )}

                        {polish ? (
                            state.polishNews.articles.map((article, index) => (
                                <TextArea key={`polish-${index}`} props={article} />
                            ))
                        ) : (
                            <p>Brak informacji z Polski</p>
                        )}
                </div>
            </>
    );
}
