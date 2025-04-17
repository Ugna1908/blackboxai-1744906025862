document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle active state
            this.classList.toggle('active');
            answer.classList.toggle('hidden');
            
            // Update icon
            if (icon) {
                icon.classList.toggle('transform');
                icon.classList.toggle('rotate-180');
            }
            
            // Close other FAQs
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherIcon = otherQuestion.querySelector('i');
                    
                    otherQuestion.classList.remove('active');
                    otherAnswer.classList.add('hidden');
                    
                    if (otherIcon) {
                        otherIcon.classList.remove('transform');
                        otherIcon.classList.remove('rotate-180');
                    }
                }
            });
        });
    });
    
    // Counter Animation for Statistics
    const statItems = document.querySelectorAll('.stat-item');
    let hasAnimated = false;
    
    function animateStats() {
        if (hasAnimated) return;
        
        statItems.forEach(item => {
            const countElement = item.querySelector('p:first-child');
            if (!countElement) return;
            
            const target = parseInt(countElement.textContent);
            let count = 0;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            
            const counter = setInterval(() => {
                count += increment;
                if (count >= target) {
                    countElement.textContent = target + '+';
                    clearInterval(counter);
                } else {
                    countElement.textContent = Math.floor(count) + '+';
                }
            }, 16);
        });
        
        hasAnimated = true;
    }
    
    // Animate stats when they come into view
    function checkIfInView() {
        if (!statItems.length) return;
        
        const statsSection = statItems[0].closest('section');
        if (!statsSection) return;
        
        const sectionTop = statsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
            animateStats();
            window.removeEventListener('scroll', checkIfInView);
        }
    }
    
    window.addEventListener('scroll', checkIfInView);
    checkIfInView(); // Check on initial load
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
});
