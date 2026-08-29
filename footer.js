document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById('footer-placeholder') || document.getElementById('footer-container');
    if (!placeholder) return;

    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error(`Footer request failed: ${response.status}`);
            return response.text();
        })
        .then(html => {
            placeholder.innerHTML = html;

            placeholder.querySelectorAll('[data-current-year]').forEach(year => {
                year.textContent = new Date().getFullYear();
            });

            const preferencesLink = document.getElementById('cookie-preferences-link');
            if (preferencesLink && typeof MIRDCookieConsent !== 'undefined') {
                preferencesLink.dataset.consentBound = 'true';
                preferencesLink.addEventListener('click', event => {
                    event.preventDefault();
                    MIRDCookieConsent.showPreferencesModal();
                });
            }
        })
        .catch(err => console.error('Failed to load footer:', err));
});
