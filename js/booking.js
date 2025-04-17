document.addEventListener('DOMContentLoaded', function() {
    // Initialize date picker
    const datePickerElement = document.getElementById('appointment-date');
    let selectedDate = null;
    let selectedTimeSlot = null;
    
    if (datePickerElement) {
        // Initialize flatpickr
        const datePicker = flatpickr(datePickerElement, {
            minDate: "today",
            dateFormat: "Y-m-d",
            disable: [
                function(date) {
                    // Disable weekends (0 is Sunday, 6 is Saturday)
                    return (date.getDay() === 0); // Only disable Sundays, keep Saturdays available
                }
            ],
            onChange: function(selectedDates, dateStr) {
                selectedDate = dateStr;
                updateAvailableTimeSlots(dateStr);
                
                // Show time slots container
                const timeSlotsContainer = document.getElementById('time-slots-container');
                if (timeSlotsContainer) {
                    timeSlotsContainer.classList.remove('hidden');
                }
                
                // Reset selected time slot
                selectedTimeSlot = null;
                
                // Hide booking form if it was visible
                const bookingFormContainer = document.getElementById('booking-form-container');
                if (bookingFormContainer) {
                    bookingFormContainer.classList.add('hidden');
                }
            }
        });
    }
    
    // Function to update available time slots based on selected date
    function updateAvailableTimeSlots(dateStr) {
        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) return;
        
        // Clear existing time slots
        timeSlotsContainer.innerHTML = '';
        
        // Generate time slots (this would normally come from an API)
        const timeSlots = generateTimeSlots(dateStr);
        
        // Add time slots to container
        timeSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${slot.available ? '' : 'unavailable'} p-3 rounded-lg border-2 text-center cursor-pointer mb-2`;
            slotElement.textContent = slot.time;
            slotElement.dataset.time = slot.time;
            slotElement.dataset.available = slot.available;
            
            if (slot.available) {
                slotElement.addEventListener('click', function() {
                    // Remove selected class from all time slots
                    document.querySelectorAll('.time-slot').forEach(el => {
                        el.classList.remove('selected', 'bg-primary', 'text-white');
                    });
                    
                    // Add selected class to clicked time slot
                    this.classList.add('selected', 'bg-primary', 'text-white');
                    
                    // Store selected time slot
                    selectedTimeSlot = this.dataset.time;
                    
                    // Show booking form
                    const bookingFormContainer = document.getElementById('booking-form-container');
                    if (bookingFormContainer) {
                        bookingFormContainer.classList.remove('hidden');
                    }
                    
                    // Update summary
                    updateBookingSummary();
                });
            }
            
            timeSlotsContainer.appendChild(slotElement);
        });
    }
    
    // Function to generate time slots (simulated data)
    function generateTimeSlots(dateStr) {
        // This would typically come from an API
        // For now, we'll simulate some available and unavailable slots
        
        const slots = [];
        const selectedDay = new Date(dateStr).getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Different schedules for different days
        const startHour = (selectedDay === 6) ? 10 : 9; // Start at 10AM on Saturdays, 9AM other days
        const endHour = (selectedDay === 6) ? 15 : 18;  // End at 3PM on Saturdays, 6PM other days
        
        for (let hour = startHour; hour < endHour; hour++) {
            // Add full hour slot
            slots.push({
                time: `${hour}:00`,
                available: Math.random() > 0.3 // 70% chance of being available
            });
            
            // Add half hour slot
            slots.push({
                time: `${hour}:30`,
                available: Math.random() > 0.3 // 70% chance of being available
            });
        }
        
        return slots;
    }
    
    // Update booking summary
    function updateBookingSummary() {
        const summaryDate = document.getElementById('summary-date');
        const summaryTime = document.getElementById('summary-time');
        const summaryType = document.getElementById('summary-type');
        const summaryPrice = document.getElementById('summary-price');
        
        if (summaryDate) summaryDate.textContent = selectedDate;
        if (summaryTime) summaryTime.textContent = selectedTimeSlot;
        
        // Get selected psychologist type
        const psychologistType = document.querySelector('input[name="psychologist-type"]:checked');
        if (psychologistType && summaryType) {
            summaryType.textContent = psychologistType.dataset.label;
        }
        
        // Update price based on psychologist type
        if (psychologistType && summaryPrice) {
            summaryPrice.textContent = psychologistType.dataset.price;
        }
    }
    
    // Add event listeners to psychologist type radio buttons
    const psychologistTypeInputs = document.querySelectorAll('input[name="psychologist-type"]');
    psychologistTypeInputs.forEach(input => {
        input.addEventListener('change', updateBookingSummary);
    });
    
    // Form validation
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form inputs
            const fullName = document.getElementById('full-name');
            const email = document.getElementById('email');
            const phone = document.getElementById('phone');
            
            // Reset error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error', 'border-red-500'));
            
            // Validate inputs
            let valid = true;
            
            if (!fullName.value.trim()) {
                showError(fullName, 'Full name is required');
                valid = false;
            }
            
            if (!email.value.trim()) {
                showError(email, 'Email address is required');
                valid = false;
            } else if (!isValidEmail(email.value)) {
                showError(email, 'Please enter a valid email address');
                valid = false;
            }
            
            if (!phone.value.trim()) {
                showError(phone, 'Phone number is required');
                valid = false;
            } else if (!isValidPhone(phone.value)) {
                showError(phone, 'Please enter a valid phone number');
                valid = false;
            }
            
            if (!selectedDate) {
                alert('Please select a date');
                valid = false;
            }
            
            if (!selectedTimeSlot) {
                alert('Please select a time slot');
                valid = false;
            }
            
            if (valid) {
                // Submit form (this would typically be an AJAX request to a backend API)
                // For now, we'll simulate a successful booking
                
                // Hide form
                bookingForm.classList.add('hidden');
                
                // Show confirmation message
                const confirmationMessage = document.getElementById('confirmation-message');
                if (confirmationMessage) {
                    confirmationMessage.classList.remove('hidden');
                    confirmationMessage.classList.add('show');
                    confirmationMessage.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }
    
    // Helper function to show error message
    function showError(inputElement, message) {
        // Add error class to input
        inputElement.classList.add('error', 'border-red-500');
        
        // Create error message element
        const errorElement = document.createElement('p');
        errorElement.className = 'error-message text-red-500 text-sm mt-1';
        errorElement.textContent = message;
        
        // Insert error message after input
        inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
    }
    
    // Helper function to validate email
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }
    
    // Helper function to validate phone number
    function isValidPhone(phone) {
        const re = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
        return re.test(phone);
    }
});
