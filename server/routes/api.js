const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const router = express.Router();
const { sequelize, QueryResult } = require('../db');
const { Sequelize } = require('sequelize');
const xml2js = require('xml2js');
const SECRET_KEY = 'e91f696e93ce5cb5a43208aa0368aae3f711f1a03a66bb052290a22df6fd266fz';

router.use(cookieParser());

router.get('/test', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Brak tokena' });
    const decoded = jwt.verify(token, SECRET_KEY);
    const userName = decoded.username
    const {
        averageSalary, minimalSalary, minimalPension, averagePension, careAllowance,
        naturalDisasters, pkb, pkbPerCapita, ppp, pppPerCapita, inflation,
        dateFrom, dateTo
    } = req.query;

    const fetchAverageSalary = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const yearParams = years.map(y => `year=${y}`).join('&');
            const url = `https://bdl.stat.gov.pl/api/v1/data/by-variable/64428?format=json&${yearParams}&unit-level=0`;

            const response = await axios.get(url);
            const results = response.data.results?.[0]?.values || [];

            const values = results.map(item => item.val);
            const dates = results.map(item => `${item.year}-01-01`);

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania średniej pensji:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchMinimalSalary = async (dateFrom, dateTo) => {
        try {
            const url = 'https://www.zus.pl/baza-wiedzy/skladki-wskazniki-odsetki/wskazniki/minimalne-wynagrodzenie-za-prace-od-2003-r';
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const values = [];
            const dates = [];

            const from = dateFrom ? new Date(dateFrom + '-01') : null;
            const to = dateTo ? new Date(dateTo + '-01') : null;

            $('.zus-cms ul li').each((i, el) => {
                const valueText = $(el).find('strong').first().text().replace(/\s|zł|&nbsp;/g, '').replace(',', '.');
                const value = parseFloat(valueText);

                const dateMatch = $(el).text().match(/od\s+(\d+)\s+(\w+)\s+(\d{4})/i);
                if (value && dateMatch) {
                    const months = {
                        'stycznia': '01',
                        'lutego': '02',
                        'marca': '03',
                        'kwietnia': '04',
                        'maja': '05',
                        'czerwca': '06',
                        'lipca': '07',
                        'sierpnia': '08',
                        'września': '09',
                        'października': '10',
                        'listopada': '11',
                        'grudnia': '12'
                    };
                    const day = dateMatch[1].padStart(2, '0');
                    const month = months[dateMatch[2]] || '01';
                    const year = dateMatch[3];
                    const dateStr = `${year}-${month}-${day}`;
                    const dateObj = new Date(dateStr);

                    if (
                        (!from || dateObj >= from) &&
                        (!to || dateObj <= to)
                    ) {
                        values.push(value);
                        dates.push(dateStr);
                    }
                }
            });

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania minimalnego wynagrodzenia:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchMinimalPension = async (dateFrom, dateTo) => {
        try {
            const url = 'https://zus.pox.pl/zus/emerytura-minimalna-wartosci-historyczne.htm';
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const values = [];
            const dates = [];

            const from = dateFrom ? new Date(dateFrom + '-01') : null;
            const to = dateTo ? new Date(dateTo + '-01') : null;

            $('table tbody tr').each((i, el) => {
                const tds = $(el).find('td');
                if (tds.length === 2) {
                    const period = $(tds[0]).text().trim();
                    const valueText = $(tds[1]).text().replace(/\s|zł|&nbsp;/g, '').replace(',', '.');
                    const value = parseFloat(valueText);

                    const dateMatch = period.match(/(\d{2})\.(\d{4})/);
                    if (value && dateMatch) {
                        const month = dateMatch[1];
                        const year = dateMatch[2];
                        const dateStr = `${year}-${month}-01`;
                        const dateObj = new Date(dateStr);

                        if (
                            (!from || dateObj >= from) &&
                            (!to || dateObj <= to)
                        ) {
                            values.push(value);
                            dates.push(dateStr);
                        }
                    }
                }
            });

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania minimalnej emerytury:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchAveragePension = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const yearParams = years.map(y => `year=${y}`).join('&');
            const url = `https://bdl.stat.gov.pl/api/v1/data/by-variable/155057?format=json&${yearParams}&unit-level=0`;

            const response = await axios.get(url);
            const results = response.data.results?.[0]?.values || [];

            const values = results.map(item => item.val);
            const dates = results.map(item => `${item.year}-01-01`);

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania przeciętnej emerytury:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchCareAllowance = async (dateFrom, dateTo) => {
        try {
            const fromDate = dateFrom ? new Date(dateFrom + '-01') : null;
            const toDate = dateTo ? new Date(dateTo + '-01') : null;

            const values = [];
            const dates = [];

            if (!fromDate || !toDate) return { values, dates };

            let current = new Date(fromDate);

            while (current <= toDate) {
                const year = current.getFullYear();
                const month = current.getMonth() + 1;
                const okresId = 246 + month;

                const url = `https://api-dbw.stat.gov.pl/api/variable/variable-data-section?id-zmienna=289&id-przekroj=16&id-rok=${year}&id-okres=${okresId}&ile-na-stronie=10&numer-strony=0&lang=pl`;

                try {
                    const response = await axios.get(url);
                    setTimeout(() => {}, 200);
                    const dataArr = response.data.data || [];
                    const row = dataArr.find(item => item.rownumber === 3);

                    if (row && typeof row.wartosc === 'number') {
                        values.push(row.wartosc);
                        dates.push(`${year}-${month.toString().padStart(2, '0')}-01`);
                    }
                } catch (err) {
                    // Pomijamy błędy dla pojedynczych miesięcy
                }

                current.setMonth(current.getMonth() + 1);
            }

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania zasiłku pielęgnacyjnego:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchPKB = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const yearParams = years.map(y => `year=${y}`).join('&');
            const url = `https://bdl.stat.gov.pl/api/v1/data/by-variable/458271?format=json&${yearParams}&unit-level=0`;
            const response = await axios.get(url);
            const results = response.data.results[0]?.values || [];
            const values = results.map(item => item.val * 1000000);
            const dates = results.map(item => `${item.year}-01-01`);

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania PKB:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchPKBPerCapita = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const yearParams = years.map(y => `year=${y}`).join('&');
            const url = `https://bdl.stat.gov.pl/api/v1/data/by-variable/458421?format=xml&${yearParams}&unit-level=0`;

            const response = await axios.get(url, { responseType: 'text' });
            const xml = response.data;

            // Parsowanie XML do JS
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xml);

            let values = [];
            let dates = [];

            const yearVals = result.singleVariableData?.results?.[0]?.unitData?.[0]?.values?.[0]?.yearVal || [];
            yearVals.forEach(item => {
                const year = item.year?.[0];
                const val = parseFloat(item.val?.[0]);
                if (year && !isNaN(val)) {
                    values.push(val);
                    dates.push(`${year}-01-01`);
                }
            });

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania PKB per capita (XML):', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchGVA = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const yearParams = years.map(y => `year=${y}`).join('&');
            const url = `https://bdl.stat.gov.pl/api/v1/data/by-variable/458291?format=xml&${yearParams}&unit-level=0`;

            const response = await axios.get(url, { responseType: 'text' });
            const xml = response.data;

            // Parsowanie XML do JS
            const parser = new xml2js.Parser();
            const result = await parser.parseStringPromise(xml);

            let values = [];
            let dates = [];

            const yearVals = result.singleVariableData?.results?.[0]?.unitData?.[0]?.values?.[0]?.yearVal || [];
            yearVals.forEach(item => {
                const year = item.year?.[0];
                const val = parseFloat(item.val?.[0]) * 1000000;
                if (year && !isNaN(val)) {
                    values.push(val);
                    dates.push(`${year}-01-01`);
                }
            });

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania GVA (XML):', error.message);
            return { values: [], dates: [] };
        }
    };
    const fetchNaturalDisasters = async (dateFrom, dateTo) => {
            try {
                let years = [];
                if (dateFrom && dateTo) {
                    const fromYear = parseInt(dateFrom.split('-')[0]);
                    const toYear = parseInt(dateTo.split('-')[0]);
                    for (let y = fromYear; y <= toYear; y++) {
                        years.push(y);
                    }
                }
                const yearParams = years.map(y => `year=${y}`).join('&');
                const [respA, respB] = await Promise.all([
                    axios.get(`https://bdl.stat.gov.pl/api/v1/data/by-variable/196453?format=json&${yearParams}&unit-level=0`),
                    axios.get(`https://bdl.stat.gov.pl/api/v1/data/by-variable/196452?format=json&${yearParams}&unit-level=0`)
                ]);

                const resultsA = respA.data.results?.[0]?.values || [];
                const resultsB = respB.data.results?.[0]?.values || [];

                const values = [];
                const dates = [];

                years.forEach(year => {
                    const a = resultsA.find(item => item.year == year);
                    const b = resultsB.find(item => item.year == year);
                    if (a && b && b.val !== 0) {
                        values.push(a.val / b.val);
                        dates.push(`${year}-01-01`);
                    }
                });

                return {
                    values,
                    dates
                };
            } catch (error) {
                console.error('Błąd pobierania custom ratio:', error.message);
                return { values: [], dates: [] };
            }
    };
    const fetchGVAPerCapita = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const yearParams = years.map(y => `year=${y}`).join('&');
            const url = `https://bdl.stat.gov.pl/api/v1/data/by-variable/458443?format=json&${yearParams}&unit-level=0`;

            const response = await axios.get(url);
            const results = response.data.results?.[0]?.values || [];

            const values = results.map(item => item.val);
            const dates = results.map(item => `${item.year}-01-01`);

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania GVA per Capita:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchInflation = async (dateFrom, dateTo) => {
        try {
            const fromDate = dateFrom ? new Date(dateFrom + '-01') : null;
            const toDate = dateTo ? new Date(dateTo + '-01') : null;

            const values = [];
            const dates = [];

            if (!fromDate || !toDate) return { values, dates };

            let current = new Date(fromDate);

            while (current <= toDate) {
                const year = current.getFullYear();
                const month = current.getMonth() + 1;
                const okresId = 246 + month;

                const url = `https://api-dbw.stat.gov.pl/api/variable/variable-data-section?id-zmienna=305&id-przekroj=736&id-rok=${year}&id-okres=${okresId}&ile-na-stronie=2&numer-strony=0&lang=pl`;
                try {
                    const response = await axios.get(url);
                    setTimeout(() => {}, 100);
                    const row = response.data.data[1] || [];
                    if (row && typeof row.wartosc === 'number') {
                        values.push(row.wartosc-100);
                        dates.push(`${year}-${month.toString().padStart(2, '0')}-01`);
                    }
                } catch (err) {
                    // Pomijamy błędy dla pojedynczych miesięcy
                }

                current.setMonth(current.getMonth() + 1);
            }

            return {
                values,
                dates
            };
        } catch (error) {
            console.error('Błąd pobierania inflacji:', error.message);
            return { values: [], dates: [] };
        }
    };

    const fetchGlobalNews = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }
            const articles = [];
            for (const year of years) {
                const from = `${year}-01-01T00:00:00Z`;
                const to = `${year}-12-31T23:59:59Z`;
                const url = `https://gnews.io/api/v4/search?q=global&category=business&lang=en&from=${from}&to=${to}&max=1&apikey=70dbd09cd5b78d9ff8af22c38a3b2f4f`;
                try {
                    const response = await axios.get(url);
                    const news = response.data.articles?.[0];
                    console.log(news);
                    if (news) {
                        articles.push({
                            title: news.title,
                            description: news.description,
                            content: news.content,
                            url: news.url,
                            image: news.image,
                            publishedAt: news.publishedAt,
                            source: {
                                name: news.source?.name,
                                url: news.source?.url
                            }
                        });
                    }
                } catch (err) {
                    // Pomijamy błędy dla danego roku
                }
                await new Promise(res => setTimeout(res, 500));
            }
            return { articles };
        } catch (error) {
            console.error('Błąd pobierania global news:', error.message);
            return { articles: [] };
        }
    };

    const fetchPolishNews = async (dateFrom, dateTo) => {
        try {
            let years = [];
            if (dateFrom && dateTo) {
                const fromYear = parseInt(dateFrom.split('-')[0]);
                const toYear = parseInt(dateTo.split('-')[0]);
                for (let y = fromYear; y <= toYear; y++) {
                    years.push(y);
                }
            }

            const articles = [];
            for (const year of years) {
                const from = `${year}-01-01T00:00:00Z`;
                const to = `${year}-12-31T23:59:59Z`;
                const url = `https://gnews.io/api/v4/search?q=Poland&lang=en&category=business&from=${from}&to=${to}&max=1&apikey=080e3de2b00eddd09a9ff97335c13b4f`;
                try {
                    const response = await axios.get(url);
                    const news = response.data.articles?.[0];
                    if (news) {
                        articles.push({
                            title: news.title,
                            description: news.description,
                            content: news.content,
                            url: news.url,
                            image: news.image,
                            publishedAt: news.publishedAt,
                            source: {
                                name: news.source?.name,
                                url: news.source?.url
                            }
                        });
                    }
                } catch (err) {
                    // Pomijamy błędy dla danego roku
                }
                await new Promise(res => setTimeout(res, 500));
            }
            return { articles };
        } catch (error) {
            console.error('Błąd pobierania global news:', error.message);
            return { articles: [] };
        }
    };

    const responseData = {};
    const t = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
    try {

        if (averageSalary === 'true') {
            responseData.averageSalary = await fetchAverageSalary(dateFrom, dateTo);
        }
        if (minimalSalary === 'true') {
            responseData.minimalSalary = await fetchMinimalSalary(dateFrom, dateTo);
        }
        if (minimalPension === 'true') {
            responseData.minimalPension = await fetchMinimalPension(dateFrom, dateTo);
        }
        if (averagePension === 'true') {
            responseData.averagePension = await fetchAveragePension(dateFrom, dateTo);
        }
        if (careAllowance === 'true') {
            responseData.careAllowance = await fetchCareAllowance(dateFrom, dateTo);
        }
        if (naturalDisasters === 'true') {
            responseData.naturalDisaster = await fetchNaturalDisasters(dateFrom, dateTo);
        }
        if (pkb === 'true') {
            responseData.pkb = await fetchPKB(dateFrom, dateTo);
        }
        if (pkbPerCapita === 'true') {
            responseData.pkbPerCapita = await fetchPKBPerCapita(dateFrom, dateTo);
        }
        if (ppp === 'true') {
            responseData.ppp = await fetchGVA(dateFrom, dateTo);
        }
        if (pppPerCapita === 'true') {
            responseData.pppPerCapita = await fetchGVAPerCapita(dateFrom, dateTo);
        }
        if (inflation === 'true') {
            responseData.inflation = await fetchInflation(dateFrom, dateTo);
        }

        responseData.globalNews = await fetchGlobalNews(dateFrom, dateTo);

        responseData.polishNews = await fetchPolishNews(dateFrom, dateTo);

        await QueryResult.create({
            username: userName,
            responseData: responseData
        }, { transaction: t });
        await t.commit();
        res.json(responseData);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

router.get('/latest', async (req, res) => {
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({ message: 'Brak tokena' });}
    let decoded;
    try {
        decoded = jwt.verify(token, SECRET_KEY);
    } catch {
        return res.status(401).json({ message: 'Nieprawidłowy token' });
    }
    const userName = decoded.username;
    const t = await sequelize.transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED });
    try {
        const results = await QueryResult.findAll({
            where: { username: userName },
            order: [['createdAt', 'DESC']],
            limit: 5,
            transaction: t
        });
        await t.commit();

        const keys = ['first', 'second', 'third', 'fourth', 'fifth'];
        const response = {};
        results.forEach((row, idx) => {
            response[keys[idx]] = {
                date: row.createdAt.toISOString().replace('T', ' ').slice(0, 19),
                ...row.responseData
            };
        });
        res.json(response);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ message: 'Błąd serwera' });
    }
});

module.exports = router;
