/**
 * FRTB Cookie Consent Manager
 * Version: 1.0.0
 * Last Updated: May 28, 2025
 */

const FRTBCookieConsent = (function() {
    const CONSENT_KEY = 'frtb_consent';
    const LEGACY_CONSENT_KEY = 'mird_consent';

    // Default consent settings
    const defaultConsent = {
        essential: true,  // Always required
        functional: false,
        analytics: false,
        accepted: false,
        timestamp: null
    };
    
    // Current consent settings
    let currentConsent = {...defaultConsent};
    
    /**
     * Initialize the cookie consent manager
     */
    function init() {
        // Check for existing consent
        checkExistingConsent();
        
        // If no consent has been given yet, show the banner
        if (!currentConsent.accepted) {
            const banner = document.getElementById("cookie-consent");
            if (banner) {
                banner.style.display = "flex"; // Show the banner
            }
        }
        
        // Add event listeners to buttons
        const acceptButton = document.getElementById("accept-cookies");
        if (acceptButton) {
            acceptButton.addEventListener("click", () => {
                acceptAllCookies();
                hideBanner();
            });
        }
        
        const declineButton = document.getElementById("decline-cookies");
        if (declineButton) {
            declineButton.addEventListener("click", () => {
                acceptEssentialCookies();
                hideBanner();
            });
        }
        
        // Add event listener for preference button in footer
        addPreferenceButtonListener();
    }
    
    /**
     * Check for existing consent in localStorage
     */
    function checkExistingConsent() {
        const storedConsent =
            localStorage.getItem(CONSENT_KEY) || localStorage.getItem(LEGACY_CONSENT_KEY);
        if (storedConsent) {
            try {
                currentConsent = JSON.parse(storedConsent);
                // Migrate legacy key if present.
                saveConsent();
                if (currentConsent.accepted) {
                    const banner = document.getElementById("cookie-consent");
                    if (banner) {
                        banner.style.display = "none"; // Hide if already accepted
                    }
                }
            } catch (e) {
                console.error("Error parsing stored consent:", e);
                currentConsent = {...defaultConsent};
            }
        }
    }
    
    /**
     * Hide the consent banner
     */
    function hideBanner() {
        const banner = document.getElementById("cookie-consent");
        if (banner) {
            banner.style.display = "none";
        }
    }
    
    /**
     * Show the preferences modal
     */
    function showPreferencesModal() {
        // Hide banner if it exists
        hideBanner();
        
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'cookie-preferences-modal';
        modal.className = 'cookie-preferences-modal';
        
        // Set modal content
        modal.innerHTML = `
            <div class="preferences-content">
                <div class="preferences-header">
                    <h3>Cookie Preferences</h3>
                    <button id="preferences-close" class="preferences-close">&times;</button>
                </div>
                <div class="preferences-body">
                    <p>Manage your cookie preferences below. Essential cookies are always enabled as they are necessary for the website to function properly.</p>
                    
                    <div class="preference-item">
                        <div class="preference-info">
                            <h4>Essential Cookies</h4>
                            <p>These cookies are necessary for the website to function and cannot be switched off.</p>
                        </div>
                        <div class="preference-toggle">
                            <input type="checkbox" id="essential-cookies" checked disabled>
                            <label for="essential-cookies">Always Active</label>
                        </div>
                    </div>
                    
                    <div class="preference-item">
                        <div class="preference-info">
                            <h4>Functional Cookies</h4>
                            <p>These cookies enable personalized features and functionality.</p>
                        </div>
                        <div class="preference-toggle">
                            <input type="checkbox" id="functional-cookies" ${currentConsent.functional ? 'checked' : ''}>
                            <label for="functional-cookies">Active</label>
                        </div>
                    </div>
                    
                    <div class="preference-item">
                        <div class="preference-info">
                            <h4>Analytics Cookies</h4>
                            <p>These cookies help us understand how visitors interact with our website.</p>
                        </div>
                        <div class="preference-toggle">
                            <input type="checkbox" id="analytics-cookies" ${currentConsent.analytics ? 'checked' : ''}>
                            <label for="analytics-cookies">Active</label>
                        </div>
                    </div>
                </div>
                <div class="preferences-footer">
                    <button id="preferences-save" class="preferences-save">Save Preferences</button>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('preferences-close').addEventListener('click', () => {
            closePreferencesModal();
        });
        
        document.getElementById('preferences-save').addEventListener('click', () => {
            savePreferences();
            closePreferencesModal();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePreferencesModal();
            }
        });
        
        // Prevent scrolling on body
        document.body.style.overflow = 'hidden';
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
    
    /**
     * Close the preferences modal
     */
    function closePreferencesModal() {
        const modal = document.getElementById('cookie-preferences-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    /**
     * Save user preferences
     */
    function savePreferences() {
        const functionalConsent = document.getElementById('functional-cookies').checked;
        const analyticsConsent = document.getElementById('analytics-cookies').checked;
        
        currentConsent = {
            essential: true,
            functional: functionalConsent,
            analytics: analyticsConsent,
            accepted: true,
            timestamp: new Date().toISOString()
        };
        
        saveConsent();
    }
    
    /**
     * Accept all cookies
     */
    function acceptAllCookies() {
        currentConsent = {
            essential: true,
            functional: true,
            analytics: true,
            accepted: true,
            timestamp: new Date().toISOString()
        };
        
        saveConsent();
    }
    
    /**
     * Accept only essential cookies
     */
    function acceptEssentialCookies() {
        currentConsent = {
            essential: true,
            functional: false,
            analytics: false,
            accepted: true,
            timestamp: new Date().toISOString()
        };
        
        saveConsent();
    }
    
    /**
     * Save consent to localStorage
     */
    function saveConsent() {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(currentConsent));
    }
    
    /**
     * Add event listener for cookie preferences button in footer
     */
    function addPreferenceButtonListener() {
        const maxAttempts = 20;
        const retryDelayMs = 250;
        let attempts = 0;

        const bindWhenAvailable = () => {
            const preferenceLink = document.getElementById('cookie-preferences-link');
            if (preferenceLink) {
                if (preferenceLink.dataset.cookiePrefsBound !== 'true') {
                    preferenceLink.addEventListener('click', (event) => {
                        event.preventDefault();
                        showPreferencesModal();
                    });
                    preferenceLink.dataset.cookiePrefsBound = 'true';
                }
                return;
            }

            attempts += 1;
            if (attempts < maxAttempts) {
                setTimeout(bindWhenAvailable, retryDelayMs);
            }
        };

        bindWhenAvailable();
    }
    
    // Public API
    return {
        init: init,
        showPreferencesModal: showPreferencesModal
    };
})();

// Initialize cookie consent when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    FRTBCookieConsent.init();
});
