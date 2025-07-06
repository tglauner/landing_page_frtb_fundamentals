/**
 * MIRD Cookie Consent Manager
 * Version: 1.0.0
 * Last Updated: May 28, 2025
 */

const MIRDCookieConsent = (function() {
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
            showConsentBanner();
        }
        
        // Add event listener for preference button in footer
        addPreferenceButtonListener();
    }
    
    /**
     * Check for existing consent in localStorage
     */
    function checkExistingConsent() {
        const storedConsent = localStorage.getItem('mird_consent');
        if (storedConsent) {
            try {
                currentConsent = JSON.parse(storedConsent);
            } catch (e) {
                console.error('Error parsing stored consent:', e);
                currentConsent = {...defaultConsent};
            }
        }
    }
    
    /**
     * Show the cookie consent banner
     */
    function showConsentBanner() {
        // Create banner element
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        
        // Set banner content
        banner.innerHTML = `
            <div class="consent-content">
                <div class="consent-text">
                    <h3>Cookie Consent</h3>
                    <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies. Visit our 
                    <a href="cookie-policy.html">Cookie Policy</a> to learn more.</p>
                </div>
                <div class="consent-buttons">
                    <button id="consent-accept-all" class="consent-button accept">Accept All</button>
                    <button id="consent-accept-essential" class="consent-button essential">Essential Only</button>
                    <button id="consent-customize" class="consent-button customize">Customize</button>
                </div>
            </div>
        `;
        
        // Add banner to page
        document.body.appendChild(banner);
        
        // Add event listeners to buttons
        document.getElementById('consent-accept-all').addEventListener('click', () => {
            acceptAllCookies();
            hideBanner();
        });
        
        document.getElementById('consent-accept-essential').addEventListener('click', () => {
            acceptEssentialCookies();
            hideBanner();
        });
        
        document.getElementById('consent-customize').addEventListener('click', () => {
            showPreferencesModal();
        });
    }
    
    /**
     * Hide the consent banner
     */
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.classList.add('hidden');
            setTimeout(() => {
                banner.remove();
            }, 500);
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
        updateAnalyticsConsent();
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
        updateAnalyticsConsent();
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
        updateAnalyticsConsent();
    }
    
    /**
     * Save consent to localStorage
     */
    function saveConsent() {
        localStorage.setItem('mird_consent', JSON.stringify(currentConsent));
    }
    
    /**
     * Update analytics consent
     */
    function updateAnalyticsConsent() {
        // If MIRDAnalytics exists, update consent
        if (window.MIRDAnalytics && typeof window.MIRDAnalytics.updateConsent === 'function') {
            window.MIRDAnalytics.updateConsent(currentConsent.analytics);
        }
    }
    
    /**
     * Add event listener for cookie preferences button in footer
     */
    function addPreferenceButtonListener() {
        // Add a small delay to ensure the DOM is fully loaded
        setTimeout(() => {
            // Create the cookie preferences link if it doesn't exist
            const footerLegal = document.querySelector('.footer-column h3:contains("Legal")');
            if (footerLegal) {
                const legalList = footerLegal.nextElementSibling;
                if (legalList) {
                    // Check if the cookie preferences link already exists
                    const existingLink = Array.from(legalList.querySelectorAll('a')).find(a => 
                        a.textContent.includes('Cookie Preferences')
                    );
                    
                    if (!existingLink) {
                        const listItem = document.createElement('li');
                        const link = document.createElement('a');
                        link.href = 'javascript:void(0);';
                        link.textContent = 'Cookie Preferences';
                        link.id = 'cookie-preferences-link';
                        listItem.appendChild(link);
                        legalList.appendChild(listItem);
                        
                        // Add event listener
                        link.addEventListener('click', showPreferencesModal);
                    }
                }
            }
        }, 500);
    }
    
    // Public API
    return {
        init: init,
        showPreferencesModal: showPreferencesModal
    };
})();

// Initialize cookie consent when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    MIRDCookieConsent.init();
});
