// api/tunebat.js
export default async function handler(req, res) {
    const { query } = req.query;
    const headers = {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        priority: "u=1, i",
        Referer: "https://tunebat.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
    };

    const allSongs = [];
    try {
        for (let page = 1; page <= 3; page++) {
            const response = await fetch(
                `https://api.tunebat.com/api/tracks/search?term=${encodeURIComponent(
                    query
                )}&page=${page}`,
                { headers }
            );
            const json = await response.json();
            allSongs.push(...(json?.data?.items || []));
        }
        res.status(200).json({ songs: allSongs });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch from Tunebat." });
    }
}
