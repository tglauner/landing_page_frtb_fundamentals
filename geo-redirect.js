document.addEventListener("DOMContentLoaded", () => {
    const euCountries = new Set([
        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
        "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
        "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB"
    ]);
    const regionStorageKey = "tgir_visitor_region";
    const preCheckoutUrl = "pre-checkout.html";
    const enrollmentLinks = Array.from(
        document.querySelectorAll('a[href*="udemy.com"][href*="couponCode="]')
    );

    if (!enrollmentLinks.length) return;

    enrollmentLinks.forEach((link) => {
        link.dataset.udemyUrl = link.getAttribute("href");
        link.setAttribute("href", preCheckoutUrl);
    });

    function applyRegion(region) {
        if (region !== "non-eu") return;

        enrollmentLinks.forEach((link) => {
            link.setAttribute("href", link.dataset.udemyUrl);
        });
    }

    try {
        const cachedRegion = window.sessionStorage.getItem(regionStorageKey);
        if (cachedRegion === "eu" || cachedRegion === "non-eu") {
            applyRegion(cachedRegion);
            return;
        }
    } catch (error) {
        // Storage can be unavailable in privacy-focused browsing modes.
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 2000);

    fetch("https://ipapi.co/json/", {
        signal: controller.signal,
        credentials: "omit",
        headers: { Accept: "application/json" }
    })
        .then((response) => {
            if (!response.ok) throw new Error(`Geolocation returned ${response.status}`);
            return response.json();
        })
        .then((data) => {
            const region = euCountries.has(data.country_code) ? "eu" : "non-eu";

            try {
                window.sessionStorage.setItem(regionStorageKey, region);
            } catch (error) {
                // The links still work without caching.
            }

            applyRegion(region);
        })
        .catch((error) => {
            console.warn("Using the compliance checkout fallback:", error.message);
        })
        .finally(() => window.clearTimeout(timeoutId));
});
