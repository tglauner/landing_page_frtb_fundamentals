/**
 * MIRD Analytics - Basic First-Party Analytics Tracking
 * Version: 1.0.0
 * Last Updated: May 28, 2025
 */

// Initialize analytics namespace
const MIRDAnalytics = (function() {
    // Private variables
    let consentGiven = false;
    let sessionId = '';
    let pageViewCount = 0;
    let startTime = null;
    let events = [];
    
    // Configuration
    const config = {
        endpoint: '/analytics', // This would be a server endpoint in production
        sessionDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
        trackingEnabled: true,
        anonymizeIp: true
    };
    
    /**
     * Initialize the analytics module
     */
    function init() {
        // Check for existing consent
        checkConsent();
        
        // Generate or retrieve session ID
        initSession();
        
        // Set up event listeners
        if (consentGiven) {
            setupEventListeners();
        }
        
        // Track initial page view
        trackPageView();
    }
    
    /**
     * Check if user has given consent for analytics
     */
    function checkConsent() {
        const cookieConsent = localStorage.getItem('mird_consent');
        if (cookieConsent) {
            try {
                const consentObj = JSON.parse(cookieConsent);
                consentGiven = consentObj.analytics === true;
            } catch (e) {
                consentGiven = false;
            }
        } else {
            consentGiven = false;
        }
    }
    
    /**
     * Update consent status
     * @param {boolean} consent - Whether consent is given
     */
    function updateConsent(consent) {
        consentGiven = consent;
        
        if (consent) {
            setupEventListeners();
            trackPageView();
        } else {
            removeEventListeners();
        }
    }
    
    /**
     * Initialize or retrieve session
     */
    function initSession() {
        // Try to get existing session
        sessionId = sessionStorage.getItem('mird_session');
        
        // If no session exists, create one
        if (!sessionId) {
            sessionId = generateUUID();
            sessionStorage.setItem('mird_session', sessionId);
            pageViewCount = 0;
        } else {
            // Get existing page view count
            const storedCount = sessionStorage.getItem('mird_pageviews');
            pageViewCount = storedCount ? parseInt(storedCount, 10) : 0;
        }
        
        // Set session start time
        startTime = new Date().getTime();
        
        // Set session timeout
        resetSessionTimeout();
    }
    
    /**
     * Reset session timeout
     */
    function resetSessionTimeout() {
        // Clear any existing timeout
        if (window.sessionTimeoutId) {
            clearTimeout(window.sessionTimeoutId);
        }
        
        // Set new timeout
        window.sessionTimeoutId = setTimeout(() => {
            // End current session
            sessionId = generateUUID();
            sessionStorage.setItem('mird_session', sessionId);
            pageViewCount = 0;
            sessionStorage.setItem('mird_pageviews', pageViewCount);
            startTime = new Date().getTime();
        }, config.sessionDuration);
    }
    
    /**
     * Generate a UUID for session identification
     * @returns {string} UUID
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * Set up event listeners for tracking
     */
    function setupEventListeners() {
        if (!consentGiven) return;
        
        // Track clicks on CTA buttons
        document.querySelectorAll('.cta-button, .primary-cta, .secondary-cta, .nav-cta').forEach(button => {
            button.addEventListener('click', handleCTAClick);
        });
        
        // Track video preview clicks
        const videoPreview = document.querySelector('.video-preview');
        if (videoPreview) {
            videoPreview.addEventListener('click', handleVideoPreviewClick);
        }
        
        // Track module expansions
        document.querySelectorAll('.module-header').forEach(header => {
            header.addEventListener('click', handleModuleExpansion);
        });
        
        // Track external link clicks
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.addEventListener('click', handleExternalLinkClick);
        });
        
        // Track scroll depth
        window.addEventListener('scroll', throttle(handleScroll, 500));

        // Track when the user leaves the page
        window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    /**
     * Remove event listeners
     */
    function removeEventListeners() {
        document.querySelectorAll('.cta-button, .primary-cta, .secondary-cta, .nav-cta').forEach(button => {
            button.removeEventListener('click', handleCTAClick);
        });
        
        const videoPreview = document.querySelector('.video-preview');
        if (videoPreview) {
            videoPreview.removeEventListener('click', handleVideoPreviewClick);
        }
        
        document.querySelectorAll('.module-header').forEach(header => {
            header.removeEventListener('click', handleModuleExpansion);
        });
        
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            link.removeEventListener('click', handleExternalLinkClick);
        });

        window.removeEventListener('scroll', handleScroll);

        window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    
    /**
     * Track a page view
     */
    function trackPageView() {
        if (!consentGiven || !config.trackingEnabled) return;
        
        pageViewCount++;
        sessionStorage.setItem('mird_pageviews', pageViewCount);
        
        const data = {
            type: 'pageview',
            page: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            pageViewCount: pageViewCount
        };
        
        sendData(data);
        resetSessionTimeout();
    }
    
    /**
     * Track an event
     * @param {string} category - Event category
     * @param {string} action - Event action
     * @param {string} label - Event label (optional)
     * @param {number} value - Event value (optional)
     */
    function trackEvent(category, action, label = null, value = null) {
        if (!consentGiven || !config.trackingEnabled) return;
        
        const data = {
            type: 'event',
            category: category,
            action: action,
            label: label,
            value: value,
            page: window.location.pathname,
            timestamp: new Date().toISOString(),
            sessionId: sessionId
        };
        
        sendData(data);
        resetSessionTimeout();
    }
    
    /**
     * Handle CTA button clicks
     * @param {Event} e - Click event
     */
    function handleCTAClick(e) {
        const buttonText = e.currentTarget.textContent.trim();
        trackEvent('Engagement', 'CTA Click', buttonText);
    }
    
    /**
     * Handle video preview clicks
     */
    function handleVideoPreviewClick() {
        trackEvent('Engagement', 'Video Preview Click');
    }
    
    /**
     * Handle module expansion
     * @param {Event} e - Click event
     */
    function handleModuleExpansion(e) {
        const moduleTitle = e.currentTarget.querySelector('h3').textContent.trim();
        trackEvent('Engagement', 'Module Expansion', moduleTitle);
    }
    
    /**
     * Handle external link clicks
     * @param {Event} e - Click event
     */
    function handleExternalLinkClick(e) {
        const href = e.currentTarget.href;
        const linkText = e.currentTarget.textContent.trim();
        trackEvent('Navigation', 'External Link Click', `${linkText} (${href})`);
    }
    
    /**
     * Handle scroll depth tracking
     */
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        if (documentHeight <= windowHeight) return;
        
        const scrollPercent = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);
        
        // Track scroll depth at 25%, 50%, 75%, and 100%
        const depths = [25, 50, 75, 100];
        depths.forEach(depth => {
            if (scrollPercent >= depth && !events.includes(`scroll_${depth}`)) {
                events.push(`scroll_${depth}`);
                trackEvent('Engagement', 'Scroll Depth', `${depth}%`);
            }
        });
    }
    
    /**
     * Throttle function to limit execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Send data using navigator.sendBeacon (for unload events)
     * @param {Object} data - Data to send
     */
    function sendBeaconData(data) {
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon('track.php', blob);
        } else {
            // Fallback to regular send
            sendData(data);
        }
    }

    /**
     * Handle user leaving the page
     */
    function handleBeforeUnload() {
        if (!consentGiven || !config.trackingEnabled) return;

        const data = {
            type: 'session_end',
            timestamp: new Date().toISOString(),
            sessionId: sessionId,
            pageViewCount: pageViewCount
        };

        sendBeaconData(data);
    }
    
    /**
     * Send data to the analytics endpoint
     * @param {Object} data - Data to send
     */
    function sendData(data) {
        // Log to console for debugging
        console.log('Analytics data:', data);
        
        // Store in localStorage as backup
        const storedData = localStorage.getItem('mird_analytics_data');
        let analyticsData = storedData ? JSON.parse(storedData) : [];
        analyticsData.push(data);
        localStorage.setItem('mird_analytics_data', JSON.stringify(analyticsData));
        
        // Send data to server endpoint
        fetch('track.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Analytics-Token': 'mird_analytics_token_2025'
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            console.log('Analytics sent successfully:', result);
        })
        .catch(error => {
            console.error('Error sending analytics:', error);
            // Store failed requests for retry
            const failedRequests = localStorage.getItem('mird_failed_analytics') || '[]';
            const failedArray = JSON.parse(failedRequests);
            failedArray.push(data);
            localStorage.setItem('mird_failed_analytics', JSON.stringify(failedArray));
        });
    }
    
    // Public API
    return {
        init: init,
        trackEvent: trackEvent,
        trackPageView: trackPageView,
        updateConsent: updateConsent
    };
})();

// Initialize analytics when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    MIRDAnalytics.init();
});
