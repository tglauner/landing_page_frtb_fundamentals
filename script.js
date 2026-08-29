document.addEventListener("DOMContentLoaded", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("primary-nav");

    function closeMenu() {
        if (!menuButton || !navigation) return;
        menuButton.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
        document.body.classList.remove("nav-open");
    }

    if (menuButton && navigation) {
        menuButton.addEventListener("click", () => {
            const isOpen = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!isOpen));
            navigation.classList.toggle("is-open", !isOpen);
            document.body.classList.toggle("nav-open", !isOpen);
        });

        navigation.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 760) closeMenu();
        });
    }

    document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const panelId = trigger.getAttribute("aria-controls");
            const panel = panelId ? document.getElementById(panelId) : null;
            if (!panel) return;

            const isOpen = trigger.getAttribute("aria-expanded") === "true";
            trigger.setAttribute("aria-expanded", String(!isOpen));
            panel.hidden = isOpen;

            const icon = trigger.querySelector(".toggle-icon");
            if (icon) icon.textContent = isOpen ? "+" : "-";
        });
    });

    const revealTargets = document.querySelectorAll(".reveal, .reveal-on-load");
    const showAll = () => revealTargets.forEach((target) => target.classList.add("is-visible"));

    if (reduceMotion || !("IntersectionObserver" in window)) {
        showAll();
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        revealTargets.forEach((target) => observer.observe(target));
        window.setTimeout(() => {
            document.querySelectorAll(".reveal-on-load").forEach((target) => target.classList.add("is-visible"));
        }, 100);
    }

    const preview = document.querySelector(".video-preview");
    if (preview) {
        preview.addEventListener("click", () => {
            const previewUrl = preview.dataset.previewUrl;
            if (previewUrl) window.open(previewUrl, "_blank", "noopener,noreferrer");
        });
    }

    const couponButton = document.querySelector("[data-copy-coupon]");
    if (couponButton) {
        couponButton.addEventListener("click", async () => {
            const coupon = couponButton.dataset.copyCoupon || "";
            const code = couponButton.querySelector("code");
            const original = code ? code.textContent : coupon;

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(coupon);
                } else {
                    const input = document.createElement("textarea");
                    input.value = coupon;
                    input.setAttribute("readonly", "");
                    input.style.position = "fixed";
                    input.style.opacity = "0";
                    document.body.appendChild(input);
                    input.select();
                    document.execCommand("copy");
                    input.remove();
                }

                if (code) code.textContent = "Copied to clipboard";
                window.setTimeout(() => {
                    if (code) code.textContent = original;
                }, 1600);
            } catch (error) {
                if (code) code.textContent = "Select and copy: " + coupon;
            }
        });
    }

    const offerDeadline = document.body.dataset.offerDeadline || "2026-09-01T03:59:59Z";
    const countdownTarget = new Date(offerDeadline).getTime();
    const countdownValues = {
        days: document.querySelector('[data-countdown="days"]'),
        hours: document.querySelector('[data-countdown="hours"]'),
        minutes: document.querySelector('[data-countdown="minutes"]'),
        seconds: document.querySelector('[data-countdown="seconds"]')
    };
    const countdownSummary = document.querySelector("[data-countdown-summary]");

    function updateCountdown() {
        const distance = Math.max(0, countdownTarget - Date.now());
        const days = Math.floor(distance / 86400000);
        const hours = Math.floor((distance % 86400000) / 3600000);
        const minutes = Math.floor((distance % 3600000) / 60000);
        const seconds = Math.floor((distance % 60000) / 1000);

        if (countdownValues.days) countdownValues.days.textContent = String(days);
        if (countdownValues.hours) countdownValues.hours.textContent = String(hours).padStart(2, "0");
        if (countdownValues.minutes) countdownValues.minutes.textContent = String(minutes).padStart(2, "0");
        if (countdownValues.seconds) countdownValues.seconds.textContent = String(seconds).padStart(2, "0");

        if (countdownSummary) {
            countdownSummary.textContent = distance > 0
                ? `Offer ends in ${days}d ${hours}h ${minutes}m`
                : "August offer has ended";
        }

        return distance;
    }

    if (updateCountdown() > 0) {
        const countdownInterval = window.setInterval(() => {
            if (updateCountdown() === 0) window.clearInterval(countdownInterval);
        }, 1000);
    }
});
