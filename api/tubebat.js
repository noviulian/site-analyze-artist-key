export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

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

        return new Response(JSON.stringify({ songs: allSongs }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ error: "Failed to fetch from Tunebat." }),
            {
                headers: { "Content-Type": "application/json" },
                status: 500,
            }
        );
    }
}
