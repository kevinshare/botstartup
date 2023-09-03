export default async (page, latitude, longitude) => {
    try {
        await page.setGeolocation({
            latitude,
            longitude,
        });
    } catch(e) {
        console.log("Geo Location Error", e);
    }
}