document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Initialize date picker
    const datePickerElement = document.getElementById('appointment-date');
    let selectedDate = null;
    let selectedTimeSlot = null;
    
    // Initialize Stripe with test publishable key
    let stripe = Stripe('pk_test_51O5JqWSJHBF5RVTEVGjZWbIQkmAFpkEDgkPYxTNOYPyNLpS7ytD6oS5HZqAWfRnJEpHnVcYvqpT5eFyiCwgBICkY00CtOZGxlN');
    let elements;
    let paymentElement;
    
    if (datePickerElement) {
        console.log('Found date picker element');
        try {
            // Initialize Pikaday
            const picker = new Pikaday({
                field: datePickerElement,
                format: 'YYYY-MM-DD',
                minDate: new Date(),
                disableDayFn: function(date) {
                    // Disable Sundays (0 is Sunday)
                    return date.getDay() === 0;
                },
                onSelect: function(date) {
                    const dateStr = this.toString('YYYY-MM-DD');
                    console.log('Date selected:', dateStr);
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
                    
                    // Update summary
                    updateBookingSummary();
                }
            });
            console.log('Date picker initialized successfully');
        } catch (error) {
            console.error('Error initializing date picker:', error);
        }
    }
    
    // Function to update available time slots based on selected date
    function updateAvailableTimeSlots(dateStr) {
        console.log('Updating time slots for date:', dateStr);
        const timeSlotsContainer = document.getElementById('time-slots');
        if (!timeSlotsContainer) return;
        
        // Clear existing time slots
        timeSlotsContainer.innerHTML = '';
        
        // Generate time slots (this would normally come from an API)
        const timeSlots = generateTimeSlots(dateStr);
        
        // Add time slots to container
        timeSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `time-slot ${
                slot.available 
                    ? 'hover:bg-primary hover:text-white hover:border-primary bg-white' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } p-4 rounded-lg border-2 border-gray-200 text-center cursor-pointer mb-3 transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md`;
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
                    this.classList.add('selected', 'bg-primary', 'text-white', 'border-primary', 'shadow-lg', 'scale-105');
                    
                    // Store selected time slot
                    selectedTimeSlot = this.dataset.time;
                    
                    // Show booking form
                    const bookingFormContainer = document.getElementById('booking-form-container');
                    if (bookingFormContainer) {
                        bookingFormContainer.classList.remove('hidden');
                        
                        // Initialize Stripe payment element
                        initializeStripe();
                    }
                    
                    // Update summary
                    updateBookingSummary();
                });
            }
            
            timeSlotsContainer.appendChild(slotElement);
        });
    }
    
    // Function to generate time slots
    function generateTimeSlots(dateStr) {
        const slots = [];
        const selectedDay = new Date(dateStr).getDay();
        
        const startHour = (selectedDay === 6) ? 10 : 9; // Start at 10AM on Saturdays, 9AM other days
        const endHour = (selectedDay === 6) ? 15 : 18;  // End at 3PM on Saturdays, 6PM other days
        
        for (let hour = startHour; hour < endHour; hour++) {
            const period = hour >= 12 ? 'PM' : 'AM';
            let displayHour = hour > 12 ? hour - 12 : hour;
            // Handle 12 PM and 12 AM cases
            if (hour === 0) displayHour = 12;
            if (hour === 12) displayHour = 12;
            
            // Add full hour slot
            slots.push({
                time: `${displayHour}:00 ${period}`,
                available: Math.random() > 0.3 // 70% chance of being available
            });
            
            // Add half hour slot
            slots.push({
                time: `${displayHour}:30 ${period}`,
                available: Math.random() > 0.3 // 70% chance of being available
            });
        }
        
        return slots;
    }
    
    // Update booking summary
    function updateBookingSummary() {
        console.log('Updating booking summary');
        const summaryDate = document.getElementById('summary-date');
        const summaryTime = document.getElementById('summary-time');
        const summaryType = document.getElementById('summary-type');
        const summaryPrice = document.getElementById('summary-price');
        
        if (summaryDate) {
            if (selectedDate) {
                const formattedDate = new Date(selectedDate).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });
                summaryDate.textContent = formattedDate;
            } else {
                summaryDate.textContent = 'Not selected';
            }
        }
        if (summaryTime) summaryTime.textContent = selectedTimeSlot || 'Not selected';
        
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
    
    // Initialize Stripe Elements
    async function initializeStripe() {
        try {
            const appearance = {
                theme: 'stripe',
                variables: {
                    colorPrimary: '#8368A8',
                    colorBackground: '#ffffff',
                    colorText: '#333333',
                    colorDanger: '#ef4444',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    borderRadius: '8px',
                    spacingUnit: '4px'
                }
            };

            // Create Elements instance
            elements = stripe.elements({ appearance });

            // Create and mount the Payment Element
            paymentElement = elements.create('payment', {
                layout: {
                    type: 'tabs',
                    defaultCollapsed: false
                }
            });
            
            const paymentElementContainer = document.getElementById('payment-element');
            if (paymentElementContainer) {
                paymentElement.mount('#payment-element');
                console.log('Payment element mounted successfully');
            } else {
                console.error('Payment element container not found');
            }
        } catch (error) {
            console.error('Error initializing Stripe:', error);
        }
    }
    
    // Form validation and submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
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
                // Show loading state
                const submitButton = document.getElementById('submit-button');
                const buttonText = document.getElementById('button-text');
                const spinner = document.getElementById('spinner');
                const paymentMessage = document.getElementById('payment-message');

                submitButton.disabled = true;
                buttonText.classList.add('hidden');
                spinner.classList.remove('hidden');
                paymentMessage.classList.add('hidden');

                try {
                    // Get selected psychologist type
                    const psychologistType = document.querySelector('input[name="psychologist-type"]:checked');
                    
                    // Create the booking
                    const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: fullName.value,
                            email: email.value,
                            phone: phone.value,
                            date: selectedDate,
                            time: selectedTimeSlot,
                            type: psychologistType.dataset.label,
                            price: psychologistType.dataset.price
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to create booking');
                    }

                    const { clientSecret } = await response.json();

                    // Handle payment
                    const { error } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            return_url: `${window.location.origin}/pages/booking-confirmation.html`,
                            payment_method_data: {
                                billing_details: {
                                    name: fullName.value,
                                    email: email.value,
                                    phone: phone.value
                                }
                            }
                        }
                    });

                    if (error) {
                        throw error;
                    }

                    // If we get here, the payment is processing or succeeded
                    // The customer will be redirected to the return_url
                } catch (error) {
                    console.error('Error:', error);
                    paymentMessage.textContent = error.message || 'An error occurred while processing your request.';
                    paymentMessage.classList.remove('hidden');
                    
                    // Reset button state
                    submitButton.disabled = false;
                    buttonText.classList.remove('hidden');
                    spinner.classList.add('hidden');
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
