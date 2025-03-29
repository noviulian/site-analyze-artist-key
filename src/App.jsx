"use client";

import { useState, useEffect, useRef } from "react";
import "./App.css";
import Chart from "chart.js/auto";

function App() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chart, setChart] = useState(null);
    const canvasRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chart) chart.destroy();
        };
    }, [chart]);

    // Re-render chart after results update
    useEffect(() => {
        if (results.length === 0) return;
        renderChart(results);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [results]);

    async function fetchData(e) {
        e.preventDefault();
        if (!query.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch(
                `/api/tunebat?query=${encodeURIComponent(query.trim())}`
            );
            const data = await res.json();
            const allSongs = data.songs || [];

            const keyMap = {};
            const lowerQuery = query.toLowerCase();
            for (const song of allSongs) {
                const artists = song.as.map((a) => a.toLowerCase());
                const mainArtist = artists[0];
                if (!mainArtist.includes(lowerQuery)) continue;

                const key = song.k || "Unknown";
                if (!keyMap[key]) keyMap[key] = [];
                keyMap[key].push(song);
            }

            const grouped = Object.entries(keyMap)
                .map(([key, songs]) => ({
                    key,
                    numberOfSongs: songs.length,
                    songs: songs.map((s) => s.n.trim()),
                }))
                .sort((a, b) => b.numberOfSongs - a.numberOfSongs);

            setResults(grouped);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }

    function renderChart(data) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (chart) chart.destroy();

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.8)");
        gradient.addColorStop(1, "rgba(129, 140, 248, 0.8)");

        const newChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map((d) => d.key),
                datasets: [
                    {
                        label: "Number of Songs",
                        data: data.map((d) => d.numberOfSongs),
                        backgroundColor: gradient,
                        borderColor: "#38bdf8",
                        borderWidth: 1,
                        borderRadius: 6,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: "#e2e8f0",
                            font: { family: "'Inter', sans-serif", size: 14 },
                        },
                    },
                    tooltip: {
                        backgroundColor: "#1e293b",
                        titleColor: "#e2e8f0",
                        bodyColor: "#e2e8f0",
                        borderColor: "#334155",
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 14,
                            weight: "bold",
                        },
                        bodyFont: { family: "'Inter', sans-serif", size: 14 },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: "#e2e8f0",
                            font: { family: "'Inter', sans-serif" },
                        },
                        grid: { color: "#334155", drawBorder: false },
                    },
                    y: {
                        ticks: {
                            color: "#e2e8f0",
                            font: { family: "'Inter', sans-serif" },
                        },
                        grid: { color: "#334155", drawBorder: false },
                        beginAtZero: true,
                    },
                },
                animation: { duration: 1000, easing: "easeOutQuart" },
            },
        });

        setChart(newChart);
    }

    return (
        <main className="container">
            <h1>Songs Grouped by Key</h1>

            <form onSubmit={fetchData} className="search-form">
                <input
                    type="text"
                    value={query}
                    placeholder="Enter artist name (e.g. The Weeknd)"
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !query.trim()}>
                    {loading ? "Searching..." : "Search"}
                </button>
            </form>

            {loading && (
                <div className="loader">
                    <div className="spinner"></div>
                </div>
            )}

            {results.length > 0 && (
                <>
                    <div className="chart-container">
                        <canvas ref={canvasRef}></canvas>
                    </div>

                    <div className="results-grid">
                        {results.map((group, i) => (
                            <div className="card" key={i}>
                                <div className="key-title">
                                    <span>{group.key}</span>
                                    <span className="key-count">
                                        {group.numberOfSongs}
                                    </span>
                                </div>
                                <ul>
                                    {group.songs.map((song, j) => (
                                        <li key={j}>{song}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </main>
    );
}

export default App;
