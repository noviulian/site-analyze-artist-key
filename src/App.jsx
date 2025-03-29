import { useState } from "react";
import "./App.css";
import Chart from "chart.js/auto";

function App() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchData(e) {
        e.preventDefault();
        if (!query) return;
        setLoading(true);
        const res = await fetch(
            `/api/tunebat?query=${encodeURIComponent(query)}`
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
        setLoading(false);
        renderChart(grouped);
    }

    function renderChart(data) {
        const canvas = document.getElementById("chart");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (window.keyChart) window.keyChart.destroy();

        window.keyChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map((d) => d.key),
                datasets: [
                    {
                        label: "Number of Songs",
                        data: data.map((d) => d.numberOfSongs),
                        backgroundColor: "rgba(135, 206, 250, 0.6)",
                        borderColor: "rgba(135, 206, 250, 1)",
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                plugins: {
                    legend: { labels: { color: "white" } },
                },
                scales: {
                    x: { ticks: { color: "white" } },
                    y: { ticks: { color: "white" } },
                },
            },
        });
    }

    return (
        <div className="container">
            <h1>Songs Grouped by Key</h1>
            <form onSubmit={fetchData}>
                <input
                    type="text"
                    value={query}
                    placeholder="e.g. the weeknd"
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <canvas id="chart" width="400" height="200"></canvas>

            {loading && <p>Loading...</p>}
            {results.map((group, i) => (
                <div className="card" key={i}>
                    <div className="key-title">
                        {group.key} ({group.numberOfSongs} songs)
                    </div>
                    <ul>
                        {group.songs.map((song, j) => (
                            <li key={j}>{song}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default App;
