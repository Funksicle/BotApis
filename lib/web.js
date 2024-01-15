export async function webGet(url) {
    try {
        const resp = await fetch(url);
        const text = await resp.text();
        return text;
    } catch (err) {
        console.log(err);
    }
}