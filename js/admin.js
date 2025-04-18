document.addEventListener('DOMContentLoaded', function() {
    // Demo credentials for admin login
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123';
    
    // DOM Elements - Login
    const loginSection = document.getElementById('login-section');
    const adminDashboard = document.getElementById('admin-dashboard');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    
    // DOM Elements - Navigation
    const dashboardSection = document.getElementById('dashboard-section');
    const manageTimingsSection = document.getElementById('manage-timings-section');
    const leadsConfirmationSection = document.getElementById('leads-confirmation-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // DOM Elements - Dashboard Stats
    const totalBookingsEl = document.getElementById('total-bookings');
    const pendingLeadsEl = document.getElementById('pending-leads');
    const availableSlotsEl = document.getElementById('available-slots');
    const recentActivityEl = document.getElementById('recent-activity');
    
    // DOM Elements - Manage Timings
    const addTimingForm = document.getElementById('add-timing-form');
    const addTimingError = document.getElementById('add-timing-error');
    const timingsTableBody = document.getElementById('timings-table-body');
    const filterDate = document.getElementById('filter-date');
    
    // DOM Elements - Leads Confirmation
    const leadsTableBody = document.getElementById('leads-table-body');
    const filterStatus = document.getElementById('filter-status');
    const searchLeads = document.getElementById('search-leads');
    
    // DOM Elements - Modals
    const editTimingModal = document.getElementById('edit-timing-modal');
    const editTimingForm = document.getElementById('edit-timing-form');
    const editTimingError = document.getElementById('edit-timing-error');
    const closeEditModal = document.getElementById('close-edit-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    
    const leadDetailsModal = document.getElementById('lead-details-modal');
    const leadDetailsContent = document.getElementById('lead-details-content');
    const closeLeadModal = document.getElementById('close-lead-modal');
    const closeLeadDetails = document.getElementById('close-lead-details');
    const confirmLeadBtn = document.getElementById('confirm-lead');
    const rejectLeadBtn = document.getElementById('reject-lead');
    
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationTitle = document.getElementById('confirmation-title');
    const confirmationMessage = document.getElementById('confirmation-message');
    const cancelConfirmation = document.getElementById('cancel-confirmation');
    const confirmAction = document.getElementById('confirm-action');
    
    // Data Storage
    let availableTimings = JSON.parse(localStorage.getItem('availableTimings')) || [];
    let leads = JSON.parse(localStorage.getItem('leads')) || [];
    let recentActivity = JSON.parse(localStorage.getItem('recentActivity')) || [];
    
    // Initialize date input min value to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    
    // Initialize quick action links
    const quickActionLinks = document.querySelectorAll('.quick-action-link');
    
    // ====================================
    // Login/Logout Functionality
    // ====================================
    
    // Handle login button click
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Successful login
                loginSection.classList.add('hidden');
                adminDashboard.classList.remove('hidden');
                
                // Store login state
                sessionStorage.setItem('adminLoggedIn', 'true');
                
                // Initialize dashboard
                updateDashboardStats();
                loadTimings();
                loadLeads();
            } else {
                // Failed login
                loginError.textContent = 'Invalid username or password';
                loginError.classList.remove('hidden');
            }
        });
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear login state
            sessionStorage.removeItem('adminLoggedIn');
            
            // Show login screen
            adminDashboard.classList.add('hidden');
            loginSection.classList.remove('hidden');
            
            // Clear form fields
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            loginError.classList.add('hidden');
        });
    }
    
    // Check if admin is logged in (on page load)
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        loginSection.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
        
        // Initialize dashboard
        updateDashboardStats();
        loadTimings();
        loadLeads();
    }
    
    // ====================================
    // Navigation Functionality
    // ====================================
    
    // Handle navigation between sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('href').substring(1);
            
            // Hide all sections
            dashboardSection.classList.add('hidden');
            manageTimingsSection.classList.add('hidden');
            leadsConfirmationSection.classList.add('hidden');
            
            // Show selected section
            if (target === 'dashboard') {
                dashboardSection.classList.remove('hidden');
                updateDashboardStats();
            } else if (target === 'manage-timings') {
                manageTimingsSection.classList.remove('hidden');
                loadTimings();
            } else if (target === 'leads-confirmation') {
                leadsConfirmationSection.classList.remove('hidden');
                loadLeads();
            }
            
            // Update active state for desktop nav
            document.querySelectorAll('.nav-link').forEach(navLink => {
                navLink.classList.remove('bg-primary', 'bg-opacity-10', 'text-primary');
                navLink.classList.add('hover:bg-primary', 'hover:bg-opacity-10');
            });
            
            // Desktop nav active state
            if (target === 'dashboard') {
                document.getElementById('dashboard-link').classList.add('bg-primary', 'bg-opacity-10', 'text-primary');
                document.getElementById('dashboard-link').classList.remove('hover:bg-primary', 'hover:bg-opacity-10');
            } else if (target === 'manage-timings') {
                document.getElementById('timings-link').classList.add('bg-primary', 'bg-opacity-10', 'text-primary');
                document.getElementById('timings-link').classList.remove('hover:bg-primary', 'hover:bg-opacity-10');
            } else if (target === 'leads-confirmation') {
                document.getElementById('leads-link').classList.add('bg-primary', 'bg-opacity-10', 'text-primary');
                document.getElementById('leads-link').classList.remove('hover:bg-primary', 'hover:bg-opacity-10');
            }
            
            // Mobile nav active state
            document.querySelectorAll('[id^="mobile-"]').forEach(mobileLink => {
                mobileLink.classList.remove('bg-primary', 'text-white');
                mobileLink.classList.add('bg-gray-200', 'text-dark');
            });
            
            if (target === 'dashboard') {
                document.getElementById('mobile-dashboard-link').classList.add('bg-primary', 'text-white');
                document.getElementById('mobile-dashboard-link').classList.remove('bg-gray-200', 'text-dark');
            } else if (target === 'manage-timings') {
                document.getElementById('mobile-timings-link').classList.add('bg-primary', 'text-white');
                document.getElementById('mobile-timings-link').classList.remove('bg-gray-200', 'text-dark');
            } else if (target === 'leads-confirmation') {
                document.getElementById('mobile-leads-link').classList.add('bg-primary', 'text-white');
                document.getElementById('mobile-leads-link').classList.remove('bg-gray-200', 'text-dark');
            }
        });
    });
    
    // Handle quick action links
    quickActionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = this.getAttribute('href').substring(1);
            
            // Trigger the corresponding nav link click
            document.querySelector(`[href="#${target}"]`).click();
        });
    });
    
    // ====================================
    // Dashboard Functionality
    // ====================================
    
    // Update dashboard statistics
    function updateDashboardStats() {
        // Count confirmed bookings
        const confirmedBookings = leads.filter(lead => lead.status === 'confirmed').length;
        
        // Count pending leads
        const pendingLeads = leads.filter(lead => lead.status === 'pending').length;
        
        // Count available time slots
        const availableSlots = availableTimings.filter(timing => timing.status === 'available').length;
        
        // Update UI
        totalBookingsEl.textContent = confirmedBookings;
        pendingLeadsEl.textContent = pendingLeads;
        availableSlotsEl.textContent = availableSlots;
        
        // Update recent activity
        updateRecentActivity();
    }
    
    // Update recent activity list
    function updateRecentActivity() {
        if (recentActivity.length === 0) {
            recentActivityEl.innerHTML = '<li class="text-gray-500 text-center py-4">No recent activity</li>';
            return;
        }
        
        // Sort activity by date (newest first)
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Limit to last 5 activities
        const recentItems = recentActivity.slice(0, 5);
        
        // Generate HTML
        let html = '';
        recentItems.forEach(activity => {
            html += `
                <li class="border-b border-gray-100 py-3">
                    <div class="flex items-start">
                        <div class="rounded-full bg-${getActivityColor(activity.type)}-100 p-2 mr-3">
                            <i class="fas fa-${getActivityIcon(activity.type)} text-${getActivityColor(activity.type)}-500 text-sm"></i>
                        </div>
                        <div>
                            <p class="font-medium">${activity.title}</p>
                            <p class="text-sm text-gray-600">${activity.description}</p>
                            <p class="text-xs text-gray-400 mt-1">${formatDateTime(activity.timestamp)}</p>
                        </div>
                    </div>
                </li>
            `;
        });
        
        recentActivityEl.innerHTML = html;
    }
    
    // Helper for activity icons
    function getActivityIcon(type) {
        switch (type) {
            case 'timing_added':
                return 'clock';
            case 'timing_edited':
                return 'edit';
            case 'timing_deleted':
                return 'trash-alt';
            case 'lead_confirmed':
                return 'check-circle';
            case 'lead_rejected':
                return 'times-circle';
            default:
                return 'info-circle';
        }
    }
    
    // Helper for activity colors
    function getActivityColor(type) {
        switch (type) {
            case 'timing_added':
                return 'green';
            case 'timing_edited':
                return 'blue';
            case 'timing_deleted':
                return 'red';
            case 'lead_confirmed':
                return 'green';
            case 'lead_rejected':
                return 'red';
            default:
                return 'gray';
        }
    }
    
    // Add new activity
    function addActivity(type, title, description) {
        const activity = {
            id: generateId(),
            type: type,
            title: title,
            description: description,
            timestamp: new Date().toISOString()
        };
        
        recentActivity.unshift(activity);
        
        // Limit to last 20 activities
        if (recentActivity.length > 20) {
            recentActivity.pop();
        }
        
        // Save to local storage
        localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
        
        // Update dashboard if visible
        if (!dashboardSection.classList.contains('hidden')) {
            updateRecentActivity();
        }
    }
    
    // ====================================
    // Manage Timings Functionality
    // ====================================
    
    // Add new timing
    if (addTimingForm) {
        addTimingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const date = document.getElementById('date').value;
            const startTime = document.getElementById('start-time').value;
            const endTime = document.getElementById('end-time').value;
            
            // Validate inputs
            if (!date || !startTime || !endTime) {
                addTimingError.textContent = 'All fields are required';
                addTimingError.classList.remove('hidden');
                return;
            }
            
            // Validate end time is after start time
            if (startTime >= endTime) {
                addTimingError.textContent = 'End time must be after start time';
                addTimingError.classList.remove('hidden');
                return;
            }
            
            // Create 30-minute time slots between start and end time
            const slots = generateTimeSlots(date, startTime, endTime);
            
            // Add slots to availableTimings
            availableTimings = [...availableTimings, ...slots];
            
            // Save to local storage
            localStorage.setItem('availableTimings', JSON.stringify(availableTimings));
            
            // Add activity
            addActivity(
                'timing_added',
                'New time slots added',
                `Added time slots for ${formatDate(date)} from ${formatTime(startTime)} to ${formatTime(endTime)}`
            );
            
            // Reset form
            addTimingForm.reset();
            addTimingError.classList.add('hidden');
            
            // Reload timings table
            loadTimings();
            
            // Update dashboard stats
            updateDashboardStats();
        });
    }
    
    // Generate 30-minute time slots between start and end time
    function generateTimeSlots(date, startTime, endTime) {
        const slots = [];
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        
        let currentTime = new Date(startDateTime);
        
        while (currentTime < endDateTime) {
            const slotEndTime = new Date(currentTime);
            slotEndTime.setMinutes(slotEndTime.getMinutes() + 30);
            
            // Only add if the slot end time is less than or equal to the end time
            if (slotEndTime <= endDateTime) {
                slots.push({
                    id: generateId(),
                    date: date,
                    startTime: currentTime.toTimeString().substring(0, 5),
                    endTime: slotEndTime.toTimeString().substring(0, 5),
                    status: 'available'
                });
            }
            
            // Move to next slot
            currentTime = slotEndTime;
        }
        
        return slots;
    }
    
    // Load timings into table
    function loadTimings() {
        if (availableTimings.length === 0) {
            timingsTableBody.innerHTML = '<tr><td colspan="4" class="py-4 px-4 text-center text-gray-500">No time slots added yet</td></tr>';
            return;
        }
        
        // Get filter value
        const filterValue = filterDate ? filterDate.value : 'all';
        
        // Filter timings
        let filteredTimings = [...availableTimings];
        if (filterValue !== 'all') {
            filteredTimings = filteredTimings.filter(timing => timing.date === filterValue);
        }
        
    // Sort by date and time
        filteredTimings.sort((a, b) => {
            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }
            return a.startTime.localeCompare(b.startTime);
        });
        
        // Generate HTML
        let html = '';
        filteredTimings.forEach(timing => {
            html += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${formatDate(timing.date)}</td>
                    <td class="py-3 px-4">${formatTime(timing.startTime)} - ${formatTime(timing.endTime)}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs ${timing.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            ${timing.status === 'available' ? 'Available' : 'Booked'}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center space-x-2">
                            <button class="edit-timing-btn text-blue-500 hover:text-blue-700" data-id="${timing.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-timing-btn text-red-500 hover:text-red-700" data-id="${timing.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        timingsTableBody.innerHTML = html;
        
        // Update date filter options
        if (filterDate) {
            updateDateFilterOptions();
        }
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-timing-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const timingId = this.getAttribute('data-id');
                openEditTimingModal(timingId);
            });
        });
        
        document.querySelectorAll('.delete-timing-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const timingId = this.getAttribute('data-id');
                openDeleteConfirmation(timingId);
            });
        });
    }
    
    // Update date filter options
    function updateDateFilterOptions() {
        // Get unique dates
        const dates = [...new Set(availableTimings.map(timing => timing.date))];
        
        // Sort dates
        dates.sort((a, b) => a.localeCompare(b));
        
        // Generate options
        let options = '<option value="all">All Dates</option>';
        dates.forEach(date => {
            options += `<option value="${date}">${formatDate(date)}</option>`;
        });
        
        filterDate.innerHTML = options;
    }
    
    // Open edit timing modal
    function openEditTimingModal(timingId) {
        const timing = availableTimings.find(t => t.id === timingId);
        
        if (!timing) return;
        
        // Fill form fields
        document.getElementById('edit-timing-id').value = timing.id;
        document.getElementById('edit-date').value = timing.date;
        document.getElementById('edit-start-time').value = timing.startTime;
        document.getElementById('edit-end-time').value = timing.endTime;
        
        // Show modal
        editTimingModal.classList.remove('hidden');
    }
    
    // Handle edit timing form submission
    if (editTimingForm) {
        editTimingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const timingId = document.getElementById('edit-timing-id').value;
            const date = document.getElementById('edit-date').value;
            const startTime = document.getElementById('edit-start-time').value;
            const endTime = document.getElementById('edit-end-time').value;
            
            // Validate inputs
            if (!date || !startTime || !endTime) {
                editTimingError.textContent = 'All fields are required';
                editTimingError.classList.remove('hidden');
                return;
            }
            
            // Validate end time is after start time
            if (startTime >= endTime) {
                editTimingError.textContent = 'End time must be after start time';
                editTimingError.classList.remove('hidden');
                return;
            }
            
            // Find and update timing
            const index = availableTimings.findIndex(t => t.id === timingId);
            
            if (index !== -1) {
                const oldTiming = availableTimings[index];
                availableTimings[index] = {
                    ...oldTiming,
                    date: date,
                    startTime: startTime,
                    endTime: endTime
                };
                
                // Save to local storage
                localStorage.setItem('availableTimings', JSON.stringify(availableTimings));
                
                // Add activity
                addActivity(
                    'timing_edited',
                    'Time slot edited',
                    `Edited time slot on ${formatDate(date)} from ${formatTime(startTime)} to ${formatTime(endTime)}`
                );
                
                // Close modal
                editTimingModal.classList.add('hidden');
                
                // Reload timings table
                loadTimings();
            }
        });
    }
    
    // Handle close edit modal
    if (closeEditModal) {
        closeEditModal.addEventListener('click', function() {
            editTimingModal.classList.add('hidden');
        });
    }
    
    // Handle cancel edit
    if (cancelEdit) {
        cancelEdit.addEventListener('click', function() {
            editTimingModal.classList.add('hidden');
        });
    }
    
    // Open delete confirmation
    function openDeleteConfirmation(timingId) {
        const timing = availableTimings.find(t => t.id === timingId);
        
        if (!timing) return;
        
        // Set confirmation message
        confirmationTitle.textContent = 'Delete Time Slot?';
        confirmationMessage.textContent = `Are you sure you want to delete the time slot on ${formatDate(timing.date)} from ${formatTime(timing.startTime)} to ${formatTime(timing.endTime)}?`;
        
        // Set confirm action
        confirmAction.onclick = function() {
            deleteTimingSlot(timingId);
            confirmationModal.classList.add('hidden');
        };
        
        // Show modal
        confirmationModal.classList.remove('hidden');
    }
    
    // Delete timing slot
    function deleteTimingSlot(timingId) {
        const timing = availableTimings.find(t => t.id === timingId);
        
        if (!timing) return;
        
        // Filter out the timing
        availableTimings = availableTimings.filter(t => t.id !== timingId);
        
        // Save to local storage
        localStorage.setItem('availableTimings', JSON.stringify(availableTimings));
        
        // Add activity
        addActivity(
            'timing_deleted',
            'Time slot deleted',
            `Deleted time slot on ${formatDate(timing.date)} from ${formatTime(timing.startTime)} to ${formatTime(timing.endTime)}`
        );
        
        // Reload timings table
        loadTimings();
        
        // Update dashboard stats
        updateDashboardStats();
    }
    
    // Handle cancel confirmation
    if (cancelConfirmation) {
        cancelConfirmation.addEventListener('click', function() {
            confirmationModal.classList.add('hidden');
        });
    }
    
    // ====================================
    // Leads Confirmation Functionality
    // ====================================
    
    // Load leads into table
    function loadLeads() {
        // Initialize with sample data if empty
        if (leads.length === 0) {
            initializeSampleLeads();
        }
        
        if (leads.length === 0) {
            leadsTableBody.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">No booking requests found</td></tr>';
            return;
        }
        
        // Get filter and search values
        const filterValue = filterStatus ? filterStatus.value : 'all';
        const searchValue = searchLeads ? searchLeads.value.toLowerCase() : '';
        
        // Filter leads
        let filteredLeads = [...leads];
        
        if (filterValue !== 'all') {
            filteredLeads = filteredLeads.filter(lead => lead.status === filterValue);
        }
        
        if (searchValue) {
            filteredLeads = filteredLeads.filter(lead => 
                lead.name.toLowerCase().includes(searchValue) || 
                lead.email.toLowerCase().includes(searchValue)
            );
        }
        
        // Sort by date and time (newest first)
        filteredLeads.sort((a, b) => {
            if (a.date !== b.date) {
                return b.date.localeCompare(a.date);
            }
            return b.time.localeCompare(a.time);
        });
        
        // Generate HTML
        let html = '';
        filteredLeads.forEach(lead => {
            html += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">
                        <div class="font-medium">${lead.name}</div>
                    </td>
                    <td class="py-3 px-4">
                        <div>${lead.email}</div>
                        <div class="text-sm text-gray-500">${lead.phone}</div>
                    </td>
                    <td class="py-3 px-4">
                        <div>${formatDate(lead.date)}</div>
                        <div class="text-sm text-gray-500">${lead.time}</div>
                    </td>
                    <td class="py-3 px-4">${lead.type}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs 
                            ${lead.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            lead.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}">
                            ${lead.status === 'confirmed' ? 'Confirmed' : 
                            lead.status === 'rejected' ? 'Rejected' : 
                            'Pending'}
                        </span>
                    </td>
                    <td class="py-3 px-4">
                        <div class="flex items-center space-x-2">
                            <button class="view-lead-btn text-blue-500 hover:text-blue-700" data-id="${lead.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${lead.status === 'pending' ? `
                                <button class="confirm-lead-btn text-green-500 hover:text-green-700" data-id="${lead.id}">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button class="reject-lead-btn text-red-500 hover:text-red-700" data-id="${lead.id}">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        });
        
        leadsTableBody.innerHTML = html;
        
        // Add event listeners to buttons
        document.querySelectorAll('.view-lead-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const leadId = this.getAttribute('data-id');
                openLeadDetailsModal(leadId);
            });
        });
        
        document.querySelectorAll('.confirm-lead-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const leadId = this.getAttribute('data-id');
                confirmLead(leadId);
            });
        });
        
        document.querySelectorAll('.reject-lead-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const leadId = this.getAttribute('data-id');
                openRejectConfirmation(leadId);
            });
        });
    }
    
    // Initialize sample leads data
    function initializeSampleLeads() {
        const sampleLeads = [
            {
                id: generateId(),
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+91 9876543210',
                date: '2023-12-10',
                time: '10:00',
                type: 'Counselling Psychologist',
                status: 'confirmed',
                notes: 'First-time client seeking help with anxiety.',
                price: '₹2300'
            },
            {
                id: generateId(),
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                phone: '+91 9876543211',
                date: '2023-12-12',
                time: '14:30',
                type: 'Clinical Psychologist',
                status: 'pending',
                notes: 'Returning client, needs follow-up on depression treatment.',
                price: '₹2700'
            },
            {
                id: generateId(),
                name: 'Rahul Sharma',
                email: 'rahul.sharma@example.com',
                phone: '+91 9876543212',
                date: '2023-12-15',
                time: '16:00',
                type: 'Counselling Psychologist',
                status: 'pending',
                notes: 'New client, relationship counseling.',
                price: '₹2300'
            }
        ];
        
        leads = [...sampleLeads];
        localStorage.setItem('leads', JSON.stringify(leads));
    }
    
    // Open lead details modal
    function openLeadDetailsModal(leadId) {
        const lead = leads.find(l => l.id === leadId);
        
        if (!lead) return;
        
        // Generate content
        let content = `
            <div class="space-y-3">
                <div class="flex justify-between">
                    <h4 class="font-bold">Client Information</h4>
                    <span class="px-2 py-1 rounded-full text-xs 
                        ${lead.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        lead.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}">
                        ${lead.status === 'confirmed' ? 'Confirmed' : 
                        lead.status === 'rejected' ? 'Rejected' : 
                        'Pending'}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <p class="text-sm text-gray-600">Name:</p>
                        <p class="font-medium">${lead.name}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Phone:</p>
                        <p class="font-medium">${lead.phone}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Email:</p>
                        <p class="font-medium">${lead.email}</p>
                    </div>
                </div>
            </div>
            
            <div class="space-y-3 mt-6">
                <h4 class="font-bold">Booking Details</h4>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <p class="text-sm text-gray-600">Date:</p>
                        <p class="font-medium">${formatDate(lead.date)}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Time:</p>
                        <p class="font-medium">${lead.time}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Type:</p>
                        <p class="font-medium">${lead.type}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Price:</p>
                        <p class="font-medium">${lead.price}</p>
                    </div>
                </div>
            </div>
            
            <div class="space-y-3 mt-6">
                <h4 class="font-bold">Notes</h4>
                <p class="text-gray-700 bg-gray-50 p-3 rounded">${lead.notes || 'No notes provided'}</p>
            </div>
        `;
        
        leadDetailsContent.innerHTML = content;
        
        // Configure action buttons
        confirmLeadBtn.classList.add('hidden');
        rejectLeadBtn.classList.add('hidden');
        
        if (lead.status === 'pending') {
            confirmLeadBtn.classList.remove('hidden');
            rejectLeadBtn.classList.remove('hidden');
            
            // Set button actions
            confirmLeadBtn.onclick = function() {
                confirmLead(leadId);
                leadDetailsModal.classList.add('hidden');
            };
            
            rejectLeadBtn.onclick = function() {
                rejectLead(leadId);
                leadDetailsModal.classList.add('hidden');
            };
        }
        
        // Show modal
        leadDetailsModal.classList.remove('hidden');
    }
    
    // Confirm lead
    function confirmLead(leadId) {
        const lead = leads.find(l => l.id === leadId);
        
        if (!lead) return;
        
        // Update lead status
        lead.status = 'confirmed';
        
        // Save to local storage
        localStorage.setItem('leads', JSON.stringify(leads));
        
        // Add activity
        addActivity(
            'lead_confirmed',
            'Booking confirmed',
            `Confirmed booking for ${lead.name} on ${formatDate(lead.date)} at ${lead.time}`
        );
        
        // Mark corresponding time slot as booked
        const timeSlot = availableTimings.find(timing => 
            timing.date === lead.date && 
            timing.startTime === lead.time
        );
        
        if (timeSlot) {
            timeSlot.status = 'booked';
            localStorage.setItem('availableTimings', JSON.stringify(availableTimings));
        }
        
        // Reload leads table
        loadLeads();
        
        // Update dashboard stats
        updateDashboardStats();
    }
    
    // Open reject confirmation
    function openRejectConfirmation(leadId) {
        const lead = leads.find(l => l.id === leadId);
        
        if (!lead) return;
        
        // Set confirmation message
        confirmationTitle.textContent = 'Reject Booking?';
        confirmationMessage.textContent = `Are you sure you want to reject the booking from ${lead.name} on ${formatDate(lead.date)} at ${lead.time}?`;
        
        // Set confirm action
        confirmAction.onclick = function() {
            rejectLead(leadId);
            confirmationModal.classList.add('hidden');
        };
        
        // Show modal
        confirmationModal.classList.remove('hidden');
    }
    
    // Reject lead
    function rejectLead(leadId) {
        const lead = leads.find(l => l.id === leadId);
        
        if (!lead) return;
        
        // Update lead status
        lead.status = 'rejected';
        
        // Save to local storage
        localStorage.setItem('leads', JSON.stringify(leads));
        
        // Add activity
        addActivity(
            'lead_rejected',
            'Booking rejected',
            `Rejected booking for ${lead.name} on ${formatDate(lead.date)} at ${lead.time}`
        );
        
        // Reload leads table
        loadLeads();
        
        // Update dashboard stats
        updateDashboardStats();
    }
    
    // Handle close lead details modal
    if (closeLeadModal) {
        closeLeadModal.addEventListener('click', function() {
            leadDetailsModal.classList.add('hidden');
        });
    }
    
    // Handle close lead details button
    if (closeLeadDetails) {
        closeLeadDetails.addEventListener('click', function() {
            leadDetailsModal.classList.add('hidden');
        });
    }
    
    // Handle filter status change
    if (filterStatus) {
        filterStatus.addEventListener('change', loadLeads);
    }
    
    // Handle search leads input
    if (searchLeads) {
        searchLeads.addEventListener('input', loadLeads);
    }
    
    // ====================================
    // Helper Functions
    // ====================================
    
    // Generate unique ID
    function generateId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    
    // Format date for display (YYYY-MM-DD to DD MMM YYYY)
    function formatDate(dateStr) {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }
    
    // Format time for display (HH:MM to h:MM AM/PM)
    function formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':');
        const hourNum = parseInt(hours);
        const period = hourNum >= 12 ? 'PM' : 'AM';
        const hour12 = hourNum % 12 || 12;
        return `${hour12}:${minutes} ${period}`;
    }
    
    // Format date and time for display
    function formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
});
