/**
 * EU Geolocation Detection and Redirect
 * Version: 1.0.0
 * Last Updated: May 28, 2025
 * 
 * This script detects if a visitor is from the EU and redirects accordingly:
 * - EU visitors: Shown the pre-checkout page with required compliance information
 * - Non-EU visitors: Redirected directly to Udemy
 */

const EURedirect = (function() {
    // List of EU country codes
    const euCountries = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
        'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
        'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
        // Include EEA countries as they follow similar regulations
        'IS', 'LI', 'NO',
        // Include UK as they still follow similar consumer protection laws
        'GB'
    ];
    
    // Default Udemy URL with coupon
    const udemyURL = "https://www.udemy.com/course/fundamental-review-of-the-trading-book/?couponCode=25OFF_TG_OCT_2026";
    
    /**
     * Check if the user is in the EU based on their IP address
     * @returns {Promise<boolean>} True if user is in the EU, false otherwise
     */
    async function isEUVisitor() {
        try {
            // Use a free geolocation API to get country information
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 3000);
            let response;
            try {
                response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            } finally {
                clearTimeout(timeout);
            }
            if (!response.ok) throw new Error('Location lookup failed');
            const data = await response.json();
            
            // Check if the country code is in the EU list
            return euCountries.includes(data.country_code);
        } catch (error) {
            console.error('Error detecting location:', error);
            // Default to showing the pre-checkout page if there's an error
            // This ensures compliance even when geolocation fails
            return true;
        }
    }
    
    /**
     * Handle the enrollment button click
     * @param {Event} event - Click event
     */
    async function handleEnrollClick(event) {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        
        // Show loading state
        const button = event.currentTarget;
        const originalText = button.textContent;
        button.textContent = 'Processing...';
        button.style.opacity = '0.7';
        
        try {
            // Check if the visitor is from the EU
            const isEU = await isEUVisitor();
            
            // Redirect based on location
            if (isEU) {
                // EU visitors see the pre-checkout page
                window.location.href = 'pre-checkout.html';
            } else {
                // Non-EU visitors go directly to Udemy
                window.location.href = udemyURL;
            }
        } catch (error) {
            console.error('Error in redirect:', error);
            // Reset button state
            button.textContent = originalText;
            button.style.opacity = '1';
            
            // Default to pre-checkout page on error for compliance
            window.location.href = 'pre-checkout.html';
        }
    }
    
    /**
     * Initialize the EU redirect functionality
     */
    function init() {
        // Coupon links enroll; preview and on-page links retain their own destinations.
        document.querySelectorAll('a[href*="udemy.com/course/"][href*="couponCode="]').forEach(link => {
            link.addEventListener('click', handleEnrollClick);
        });
    }
    
    // Return public API
    return {
        init: init,
        isEUVisitor: isEUVisitor
    };
})();

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    EURedirect.init();
});
