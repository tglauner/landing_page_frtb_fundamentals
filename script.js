// Countdown Timer Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set the countdown date (3 days from now)
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 3);
    
    // Update countdown every second
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = countdownDate - now;
        
        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update all countdown displays
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
        
        document.getElementById('days-offer').textContent = days;
        document.getElementById('hours-offer').textContent = hours;
        document.getElementById('minutes-offer').textContent = minutes;
        document.getElementById('seconds-offer').textContent = seconds;
        
        document.getElementById('final-timer').textContent = `${days} days, ${hours} hours, ${minutes} minutes`;
        
        // If countdown is finished
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = "EXPIRED";
            document.getElementById('countdown-offer').innerHTML = "EXPIRED";
            document.getElementById('final-timer').textContent = "EXPIRED";
        }
    }
    
    // Initial call
    updateCountdown();
    
    // Update every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Module accordion functionality
    const moduleHeaders = document.querySelectorAll('.module-header');
    moduleHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon i');
            
            // Toggle content visibility
            if (content.style.display === 'block') {
                content.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            } else {
                content.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        });
    });
    
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('.toggle-icon i');
            
            // Toggle answer visibility
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.classList.remove('fa-minus');
                icon.classList.add('fa-plus');
            } else {
                answer.style.display = 'block';
                icon.classList.remove('fa-plus');
                icon.classList.add('fa-minus');
            }
        });
    });
    
    // Coupon code copy functionality
    const couponCode = document.querySelector('.code');
    if (couponCode) {
        couponCode.addEventListener('click', function() {
            const tempInput = document.createElement('input');
            tempInput.value = this.textContent;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            
            // Show copied message
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 1500);
        });
    }
    
    // Remaining seats counter (simulated)
    const seatsElement = document.querySelector('.seats-limited .highlight');
    if (seatsElement) {
        // Randomly decrease seats every few minutes to create urgency
        const decreaseSeats = () => {
            const currentSeats = parseInt(seatsElement.textContent);
            if (currentSeats > 1) {
                seatsElement.textContent = (currentSeats - 1).toString();
            }
        };
        
        // Set random intervals to decrease seats
        setTimeout(decreaseSeats, 180000); // 3 minutes
        setTimeout(decreaseSeats, 420000); // 7 minutes
    }
    
    // Video preview click handler
    const videoPreview = document.querySelector('.video-preview');
    if (videoPreview) {
        videoPreview.addEventListener('click', function() {
            // In a real implementation, this would open a video modal
            // For this demo, we'll just redirect to the Udemy course preview
            window.open('https://www.udemy.com/course/mastering-interest-rate-derivatives/', '_blank');
        });
    }
});
