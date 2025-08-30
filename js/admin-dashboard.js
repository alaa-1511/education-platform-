// Admin Dashboard JavaScript

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
        window.location.href = '../../../E-Learning/learning/login.html';
        return;
    }

    // Initialize the dashboard
    initDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
});

// Initialize the dashboard
function initDashboard() {
    // Initialize charts
    initCharts();
    
    // Load initial data for each section
    loadUsers();
    loadCourses();
    loadSections();
    loadExams();
    loadReports();
    loadSettings();
}

// Set up event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Theme toggle
    document.querySelector('.theme-toggle').addEventListener('click', function(e) {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
    });
    
    // User management
    document.getElementById('addUserBtn').addEventListener('click', function() {
        showUserModal();
    });
    
    document.getElementById('saveUserBtn').addEventListener('click', function() {
        saveUser();
    });
    
    document.getElementById('role').addEventListener('change', function() {
        toggleUserFields();
    });
    
    // Course management
    document.getElementById('addCourseBtn').addEventListener('click', function() {
        showCourseModal();
    });
    
    document.getElementById('saveCourseBtn').addEventListener('click', function() {
        saveCourse();
    });
    
    document.getElementById('addContentItem').addEventListener('click', function() {
        addCourseContentItem();
    });
    
    // Section management
    document.getElementById('addSectionBtn').addEventListener('click', function() {
        showSectionModal();
    });
    
    document.getElementById('saveSectionBtn').addEventListener('click', function() {
        saveSection();
    });
    
    document.getElementById('academicYearFilter').addEventListener('change', function() {
        loadSections();
    });
    
    // Settings
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        saveSettings();
    });
    
}

// Show a specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
    }
}

// Initialize charts
function initCharts() {
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
    window.userGrowthChart = new Chart(userGrowthCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Course Enrollment Chart
    const courseEnrollmentCtx = document.getElementById('courseEnrollmentChart').getContext('2d');
    window.courseEnrollmentChart = new Chart(courseEnrollmentCtx, {
        type: 'bar',
        data: {
            labels: ['Course 1', 'Course 2', 'Course 3', 'Course 4', 'Course 5'],
            datasets: [{
                label: 'Enrollments',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Student Performance Chart
    const studentPerformanceCtx = document.getElementById('studentPerformanceChart').getContext('2d');
    window.studentPerformanceChart = new Chart(studentPerformanceCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Average Score',
                data: [0, 0, 0, 0, 0, 0],
                borderColor: 'rgba(255, 99, 132, 1)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Course Completion Chart
    const courseCompletionCtx = document.getElementById('courseCompletionChart').getContext('2d');
    window.courseCompletionChart = new Chart(courseCompletionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(201, 203, 207, 0.5)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(201, 203, 207, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Load dashboard data
function loadDashboardData() {
    // Load statistics
    loadStatistics();
    
    // Load charts data
    loadChartsData();
    
    // Load recent activities
    loadRecentActivities();
}

// Load statistics
function loadStatistics() {
    // Fetch user statistics from API
    fetch('http://localhost/E-Learning/backend/admin/admin_users_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const users = data.data;
                const totalUsers = users.length;
                const activeStudents = users.filter(user => user.Role === 'Student').length;
                const totalTeachers = users.filter(user => user.Role === 'Teacher').length;
                
                document.getElementById('totalUsers').textContent = totalUsers;
                document.getElementById('activeStudents').textContent = activeStudents;
                document.getElementById('totalTeachers').textContent = totalTeachers;
            }
        })
        .catch(error => console.error('Error loading user statistics:', error));
    
    // Fetch course statistics from API
    fetch('http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const courses = data.data;
                document.getElementById('totalCourses').textContent = courses.length;
            }
        })
        .catch(error => console.error('Error loading course statistics:', error));
}

// Load charts data
function loadChartsData() {
    // User Growth Chart - This would typically come from an API
    const userGrowthData = Array.from({length: 6}, () => Math.floor(Math.random() * 100));
    window.userGrowthChart.data.datasets[0].data = userGrowthData;
    window.userGrowthChart.update();
    
    // Course Enrollment Chart - This would typically come from an API
    const courseEnrollmentData = Array.from({length: 5}, () => Math.floor(Math.random() * 200));
    window.courseEnrollmentChart.data.datasets[0].data = courseEnrollmentData;
    window.courseEnrollmentChart.update();
    
    // Student Performance Chart - This would typically come from an API
    const studentPerformanceData = Array.from({length: 6}, () => Math.floor(Math.random() * 40) + 60);
    window.studentPerformanceChart.data.datasets[0].data = studentPerformanceData;
    window.studentPerformanceChart.update();
    
    // Course Completion Chart - This would typically come from an API
    const courseCompletionData = [
        Math.floor(Math.random() * 60) + 20,
        Math.floor(Math.random() * 30) + 10,
        Math.floor(Math.random() * 20)
    ];
    window.courseCompletionChart.data.datasets[0].data = courseCompletionData;
    window.courseCompletionChart.update();
}

// Load recent activities
function loadRecentActivities() {
    const activitiesTable = document.getElementById('recentActivitiesTable');
    activitiesTable.innerHTML = '';
    
    // This would typically be an API call
    // For now, we'll simulate with sample data
    const activities = [
        { user: 'John Doe', action: 'Logged in', details: 'From IP: 192.168.1.1', time: '2 minutes ago' },
        { user: 'Jane Smith', action: 'Completed course', details: 'Web Development Basics', time: '15 minutes ago' },
        { user: 'Admin', action: 'Added new user', details: 'New teacher account created', time: '1 hour ago' },
        { user: 'Mike Johnson', action: 'Submitted exam', details: 'Math Exam - Score: 85%', time: '2 hours ago' },
    ];
    
    activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.user}</td>
            <td>${activity.action}</td>
            <td>${activity.details}</td>
            <td>${activity.time}</td>
        `;
        activitiesTable.appendChild(row);
    });
}

// Load users
function loadUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading users...</td></tr>';
    
    // Fetch users from API
    fetch('http://localhost/E-Learning/backend/admin/admin_users_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
        usersTableBody.innerHTML = '';
        
            if (data.success) {
                const users = data.data;
                
                if (users.length === 0) {
                    usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
                    return;
                }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${user.UserID}</td>
                        <td>${user.Username}</td>
                        <td>${user.Email}</td>
                        <td>${user.Role}</td>
                        <td><span class="badge bg-success">Active</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${user.UserID})">
                        <i class="fas fa-edit"></i>
                    </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.UserID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
            } else {
                usersTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${data.message}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            usersTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading users</td></tr>';
        });
}

// Show user modal
function showUserModal(userId = null) {
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    const modalTitle = document.getElementById('userModalLabel');
    const userIdInput = document.getElementById('userId');
    
    // Reset form
    document.getElementById('userForm').reset();
    
    if (userId) {
        // Edit mode
        modalTitle.textContent = 'Edit User';
        userIdInput.value = userId;
        
        // Fetch user data from API
        fetch(`http://localhost/E-Learning/backend/admin/admin_users_api.php?action=getById&userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const user = data.data;
                    
                    document.getElementById('username').value = user.Username;
                    document.getElementById('email').value = user.Email;
                    document.getElementById('role').value = user.Role;
                    
                    if (user.Role === 'Student') {
                        document.getElementById('section').value = user.SectionID || '';
                        document.getElementById('academicYear').value = user.AcademicYear || '';
            document.getElementById('sectionField').style.display = 'block';
            document.getElementById('academicYearField').style.display = 'block';
        }
                } else {
                    alert('Error loading user data: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                alert('Error loading user data');
            });
    } else {
        // Add mode
        modalTitle.textContent = 'Add New User';
        userIdInput.value = '';
        document.getElementById('sectionField').style.display = 'none';
        document.getElementById('academicYearField').style.display = 'none';
    }
    
    modal.show();
}

// Toggle user fields based on role
function toggleUserFields() {
    const role = document.getElementById('role').value;
    const sectionField = document.getElementById('sectionField');
    const academicYearField = document.getElementById('academicYearField');
    
    if (role === 'Student') {
        sectionField.style.display = 'block';
        academicYearField.style.display = 'block';
    } else {
        sectionField.style.display = 'none';
        academicYearField.style.display = 'none';
    }
}

// Save user
function saveUser() {
    const userId = document.getElementById('userId').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const sectionId = document.getElementById('section').value;
    const academicYear = document.getElementById('academicYear').value;
    
    // Validate form
    if (!username || !email || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Prepare user data
    const userData = {
        username: username,
        email: email,
        role: role
    };
    
    // Add password only if provided
    if (password) {
        userData.password = password;
    }
    
    // Add section and academic year for students
    if (role === 'Student') {
        userData.sectionId = sectionId;
        userData.academicYear = academicYear;
    }
    
    // Determine if this is an add or update operation
    const isUpdate = userId !== '';
    const url = isUpdate 
        ? `http://localhost/E-Learning/backend/admin/admin_users_api.php?action=update&userId=${userId}`
        : 'http://localhost/E-Learning/backend/admin/admin_users_api.php?action=add';
    
    // Send request to API
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    modal.hide();
    
    // Show success message
            alert(isUpdate ? 'User updated successfully' : 'User added successfully');
    
    // Reload users
    loadUsers();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving user:', error);
        alert('Error saving user');
    });
}

// Edit user
function editUser(userId) {
    showUserModal(userId);
}

// Delete user
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        // Send delete request to API
        fetch(`http://localhost/E-Learning/backend/admin/admin_users_api.php?action=delete&userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
        alert('User deleted successfully');
        loadUsers();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting user:', error);
                alert('Error deleting user');
            });
    }
}

// Load courses
function loadCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    coursesContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Fetch courses from API
    fetch('http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
        coursesContainer.innerHTML = '';
        
            if (data.success) {
                const courses = data.data;
                
                if (courses.length === 0) {
                    coursesContainer.innerHTML = '<div class="col-12 text-center">No courses found</div>';
                    return;
                }
        
        courses.forEach(course => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            col.innerHTML = `
                <div class="card h-100 shadow-sm">
                            <img src="${course.urlIMG || 'IMG/course-placeholder.jpg'}" class="card-img-top" alt="${course.CourseName}" style="height: 160px; object-fit: cover;">
                    <div class="card-body">
                                <h5 class="card-title">${course.CourseName}</h5>
                                <p class="card-text"><small class="text-muted">Instructor: ${course.TeacherName || 'Not assigned'}</small></p>
                                <p class="card-text"><small class="text-muted">Section: ${course.SectionName || 'Not assigned'}</small></p>
                    </div>
                    <div class="card-footer bg-transparent border-top-0">
                        <div class="d-flex justify-content-between">
                                    <button class="btn btn-sm btn-outline-primary" onclick="editCourse(${course.CourseID})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse(${course.CourseID})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
            coursesContainer.appendChild(col);
        });
            } else {
                coursesContainer.innerHTML = `<div class="col-12 text-center">Error: ${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            coursesContainer.innerHTML = '<div class="col-12 text-center">Error loading courses</div>';
        });
}

// Show course modal
function showCourseModal(courseId = null) {
    const modal = new bootstrap.Modal(document.getElementById('courseModal'));
    const modalTitle = document.getElementById('courseModalLabel');
    const courseIdInput = document.getElementById('courseId');
    
    // Reset form
    document.getElementById('courseForm').reset();
    document.getElementById('courseContentItems').innerHTML = '';
    
    if (courseId) {
        // Edit mode
        modalTitle.textContent = 'Edit Course';
        courseIdInput.value = courseId;
        
        // Fetch course data from API
        fetch(`http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=getById&courseId=${courseId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const course = data.data;
                    
                    document.getElementById('courseTitle').value = course.CourseName;
                    document.getElementById('courseInstructor').value = course.TeacherID || '';
                    document.getElementById('courseDescription').value = course.Description || '';
                    
                    // Add lessons if available
                    if (course.lessons && course.lessons.length > 0) {
                        course.lessons.forEach(lesson => {
                            addCourseContentItem(lesson.LessonName, lesson.Duration);
                        });
                    } else {
                        // Add a default content item
                        addCourseContentItem();
                    }
                } else {
                    alert('Error loading course data: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching course data:', error);
                alert('Error loading course data');
        });
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Course';
        courseIdInput.value = '';
        
        // Add a default content item
        addCourseContentItem();
    }
    
    // Load instructors
    loadInstructors();
    
    modal.show();
}

// Load instructors
function loadInstructors() {
    const instructorSelect = document.getElementById('courseInstructor');
    instructorSelect.innerHTML = '<option value="">Select Instructor</option>';
    
    // Fetch teachers from API
    fetch('http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=getTeachers')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const teachers = data.data;
                
                teachers.forEach(teacher => {
        const option = document.createElement('option');
                    option.value = teacher.UserID;
                    option.textContent = teacher.FullName || teacher.Username;
        instructorSelect.appendChild(option);
                });
            } else {
                console.error('Error loading teachers:', data.message);
            }
        })
        .catch(error => {
            console.error('Error loading teachers:', error);
    });
}

// Add course content item
function addCourseContentItem(title = '', duration = '') {
    const contentItems = document.getElementById('courseContentItems');
    const itemId = Date.now();
    
    const item = document.createElement('div');
    item.className = 'card mb-2';
    item.innerHTML = `
        <div class="card-body">
            <div class="row">
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="Content Title" value="${title}">
                </div>
                <div class="col-md-5">
                    <input type="text" class="form-control" placeholder="Duration" value="${duration}">
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeContentItem(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    contentItems.appendChild(item);
}

// Remove content item
function removeContentItem(button) {
    button.closest('.card').remove();
}

// Save course
function saveCourse() {
    const courseId = document.getElementById('courseId').value;
    const title = document.getElementById('courseTitle').value;
    const instructor = document.getElementById('courseInstructor').value;
    const description = document.getElementById('courseDescription').value;
    
    // Validate form
    if (!title || !instructor) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Prepare course data
    const courseData = {
        courseName: title,
        teacherId: instructor,
        description: description
    };
    
    // Get content items
    const contentItems = document.querySelectorAll('#courseContentItems .card');
    const lessons = [];
    
    contentItems.forEach(item => {
        const titleInput = item.querySelector('input[placeholder="Content Title"]');
        const durationInput = item.querySelector('input[placeholder="Duration"]');
        
        if (titleInput.value) {
            lessons.push({
                lessonName: titleInput.value,
                duration: durationInput.value || '30m'
            });
        }
    });
    
    courseData.lessons = lessons;
    
    // Determine if this is an add or update operation
    const isUpdate = courseId !== '';
    const url = isUpdate 
        ? `http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=update&courseId=${courseId}`
        : 'http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=add';
    
    // Send request to API
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
    modal.hide();
    
    // Show success message
            alert(isUpdate ? 'Course updated successfully' : 'Course added successfully');
    
    // Reload courses
    loadCourses();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving course:', error);
        alert('Error saving course');
    });
}

// Edit course
function editCourse(courseId) {
    showCourseModal(courseId);
}

// Delete course
function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        // Send delete request to API
        fetch(`http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=delete&courseId=${courseId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
        alert('Course deleted successfully');
        loadCourses();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting course:', error);
                alert('Error deleting course');
            });
    }
}

// Load sections
function loadSections() {
    const sectionsTableBody = document.getElementById('sectionsTableBody');
    sectionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading sections...</td></tr>';
    
    const academicYear = document.getElementById('academicYearFilter').value;
    
    // Determine which API endpoint to use
    const baseUrl = 'http://localhost/E-Learning/backend/admin/admin_sections_api.php';
    const url = academicYear 
        ? `${baseUrl}?action=${encodeURIComponent('getByAcademicYear')}&academicYear=${encodeURIComponent(academicYear)}`
        : `${baseUrl}?action=${encodeURIComponent('getAll')}`;
    
    // Fetch sections from API
    fetch(url)
        .then(response => response.json())
        .then(data => {
        sectionsTableBody.innerHTML = '';
        
            if (data.success) {
                const sections = data.data;
                
                if (sections.length === 0) {
            sectionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No sections found</td></tr>';
            return;
        }
        
                sections.forEach(section => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${section.SectionID}</td>
                        <td>${section.SectionName}</td>
                        <td>${section.GradeLevel}</td>
                        <td>${section.AcademicYear}</td>
                        <td>${section.StudentCount}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editSection(${section.SectionID})">
                        <i class="fas fa-edit"></i>
                    </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteSection(${section.SectionID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            sectionsTableBody.appendChild(row);
        });
            } else {
                sectionsTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${data.message}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error loading sections:', error);
            sectionsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading sections</td></tr>';
        });
}

// Show section modal
function showSectionModal(sectionId = null) {
    const modal = new bootstrap.Modal(document.getElementById('sectionModal'));
    const modalTitle = document.getElementById('sectionModalLabel');
    const sectionIdInput = document.getElementById('sectionId');
    
    // Reset form
    document.getElementById('sectionForm').reset();
    
    if (sectionId) {
        // Edit mode
        modalTitle.textContent = 'Edit Section';
        sectionIdInput.value = sectionId;
        
        // Fetch section data from API
        fetch(`http://localhost/E-Learning/backend/admin/admin_sections_api.php?action=getById&sectionId=${sectionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const section = data.data;
                    
                    document.getElementById('sectionName').value = section.SectionName;
                    document.getElementById('gradeLevel').value = section.GradeLevel;
                    document.getElementById('sectionAcademicYear').value = section.AcademicYear;
                } else {
                    alert('Error loading section data: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching section data:', error);
                alert('Error loading section data');
            });
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Section';
        sectionIdInput.value = '';
    }
    
    modal.show();
}

// Save section
function saveSection() {
    const sectionId = document.getElementById('sectionId').value;
    const name = document.getElementById('sectionName').value;
    const gradeLevel = document.getElementById('gradeLevel').value;
    const academicYear = document.getElementById('sectionAcademicYear').value;
    
    // Validate form
    if (!name || !gradeLevel || !academicYear) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Prepare section data
    const sectionData = {
        sectionName: name,
        gradeLevel: gradeLevel,
        academicYear: academicYear
    };
    
    // Determine if this is an add or update operation
    const isUpdate = sectionId !== '';
    const url = isUpdate 
        ? `http://localhost/E-Learning/backend/admin/admin_sections_api.php?action=update&sectionId=${sectionId}`
        : 'http://localhost/E-Learning/backend/admin/admin_sections_api.php?action=add';
    
    // Send request to API
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sectionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('sectionModal'));
    modal.hide();
    
    // Show success message
            alert(isUpdate ? 'Section updated successfully' : 'Section added successfully');
    
    // Reload sections
    loadSections();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving section:', error);
        alert('Error saving section');
    });
}

// Edit section
function editSection(sectionId) {
    showSectionModal(sectionId);
}

// Delete section
function deleteSection(sectionId) {
    if (confirm('Are you sure you want to delete this section?')) {
        // Send delete request to API
        fetch(`http://localhost/E-Learning/backend/admin/admin_sections_api.php?action=delete&sectionId=${sectionId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
        alert('Section deleted successfully');
        loadSections();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting section:', error);
                alert('Error deleting section');
            });
    }
}

// Load exams
function loadExams() {
    const examsTableBody = document.getElementById('examsTableBody');
    examsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading exams...</td></tr>';
    
    // Fetch exams from API
    fetch('http://localhost/E-Learning/backend/admin/admin_exams_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
        examsTableBody.innerHTML = '';
        
            if (data.success) {
                const exams = data.data;
                
                if (exams.length === 0) {
                    examsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No exams found</td></tr>';
                    return;
                }
        
        exams.forEach(exam => {
            const row = document.createElement('tr');
            row.innerHTML = `
                        <td>${exam.ExamID}</td>
                        <td>${exam.ExamName}</td>
                        <td>${exam.CourseName}</td>
                        <td>${exam.CreatedAt}</td>
                        <td>${exam.Duration}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="editExam(${exam.ExamID})">
                        <i class="fas fa-edit"></i>
                    </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteExam(${exam.ExamID})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            examsTableBody.appendChild(row);
        });
            } else {
                examsTableBody.innerHTML = `<tr><td colspan="6" class="text-center">Error: ${data.message}</td></tr>`;
            }
        })
        .catch(error => {
            console.error('Error loading exams:', error);
            examsTableBody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading exams</td></tr>';
        });
}

// Edit exam
function editExam(examId) {
    const modal = new bootstrap.Modal(document.getElementById('examModal'));
    const modalTitle = document.getElementById('examModalLabel');
    const examIdInput = document.getElementById('examId');
    
    // Reset form
    document.getElementById('examForm').reset();
    document.getElementById('examQuestions').innerHTML = '';
    
    if (examId) {
        // Edit mode
        modalTitle.textContent = 'Edit Exam';
        examIdInput.value = examId;
        
        // Fetch exam data from API
        fetch(`http://localhost/E-Learning/backend/admin/admin_exams_api.php?action=getById&examId=${examId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const exam = data.data;
                    
                    document.getElementById('examName').value = exam.ExamName;
                    document.getElementById('examCourse').value = exam.CourseID;
                    document.getElementById('examDuration').value = exam.Duration;
                    
                    // Add questions if available
                    if (exam.questions && exam.questions.length > 0) {
                        exam.questions.forEach(question => {
                            addExamQuestion(question);
                        });
                    } else {
                        // Add a default question
                        addExamQuestion();
                    }
                } else {
                    alert('Error loading exam data: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error fetching exam data:', error);
                alert('Error loading exam data');
            });
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Exam';
        examIdInput.value = '';
        
        // Add a default question
        addExamQuestion();
    }
    
    // Load courses
    loadExamCourses();
    
    modal.show();
}

// Delete exam
function deleteExam(examId) {
    if (confirm('Are you sure you want to delete this exam?')) {
        // Send delete request to API
        fetch(`http://localhost/E-Learning/backend/admin/admin_exams_api.php?action=delete&examId=${examId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
        alert('Exam deleted successfully');
        loadExams();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting exam:', error);
                alert('Error deleting exam');
            });
    }
}

// Load reports
function loadReports() {
    const reportsTableBody = document.getElementById('reportsTableBody');
    reportsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Loading reports...</td></tr>';
    
    // Fetch reports from API
    Promise.all([
        fetch('http://localhost/E-Learning/backend/admin/admin_reports_api.php?action=studentPerformance'),
        fetch('http://localhost/E-Learning/backend/admin/admin_reports_api.php?action=courseEnrollment'),
        fetch('http://localhost/E-Learning/backend/admin/admin_reports_api.php?action=examResults')
    ])
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(([studentPerformance, courseEnrollment, examResults]) => {
        reportsTableBody.innerHTML = '';
        
        const reports = [
            { name: 'Student Performance Report', data: studentPerformance, id: 1 },
            { name: 'Course Enrollment Report', data: courseEnrollment, id: 2 },
            { name: 'Exam Results Report', data: examResults, id: 3 }
        ];
        
        reports.forEach(report => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${report.name}</td>
                <td>${report.data.generatedAt}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="viewReport(${report.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="downloadReport('${report.data.filename}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                </td>
            `;
            reportsTableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Error loading reports:', error);
        reportsTableBody.innerHTML = '<tr><td colspan="3" class="text-center">Error loading reports</td></tr>';
    });
}

// View report
function viewReport(reportId) {
    // This would typically open a modal to view the report
    const modal = new bootstrap.Modal(document.getElementById('reportModal'));
    const modalTitle = document.getElementById('reportModalLabel');
    const reportContent = document.getElementById('reportContent');
    
    modalTitle.textContent = 'Report Details';
    reportContent.innerHTML = '<div class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // Fetch report data from API
    let apiAction;
    switch (reportId) {
        case 1:
            apiAction = 'studentPerformance';
            break;
        case 2:
            apiAction = 'courseEnrollment';
            break;
        case 3:
            apiAction = 'examResults';
            break;
        default:
            return;
    }
    
    fetch(`http://localhost/E-Learning/backend/admin/admin_reports_api.php?action=${apiAction}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Create a table to display the report data
                let table = '<table class="table table-striped">';
                
                // Add headers
                if (data.data.length > 0) {
                    table += '<thead><tr>';
                    Object.keys(data.data[0]).forEach(key => {
                        table += `<th>${key}</th>`;
                    });
                    table += '</tr></thead>';
                    
                    // Add data rows
                    table += '<tbody>';
                    data.data.forEach(row => {
                        table += '<tr>';
                        Object.values(row).forEach(value => {
                            table += `<td>${value}</td>`;
                        });
                        table += '</tr>';
                    });
                    table += '</tbody>';
                }
                
                table += '</table>';
                reportContent.innerHTML = table;
            } else {
                reportContent.innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error loading report:', error);
            reportContent.innerHTML = '<div class="alert alert-danger">Error loading report</div>';
        });
    
    modal.show();
}

// Download report
function downloadReport(filename) {
    window.location.href = `http://localhost/E-Learning/backend/admin/${filename}`;
}

// Load settings
function loadSettings() {
    // Fetch settings from API
    fetch('http://localhost/E-Learning/backend/admin/admin_settings_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const settings = data.data;
                
                document.getElementById('siteName').value = settings.siteName || 'EduFun';
                document.getElementById('siteEmail').value = settings.siteEmail || 'admin@edufun.com';
                document.getElementById('maintenanceMode').checked = settings.maintenanceMode === 'true';
                document.getElementById('currentAcademicYear').value = settings.currentAcademicYear || '2023-2024';
                document.getElementById('defaultSectionCount').value = settings.defaultSectionCount || '6';
                document.getElementById('smtpHost').value = settings.smtpHost || 'smtp.example.com';
                document.getElementById('smtpPort').value = settings.smtpPort || '587';
                document.getElementById('smtpUsername').value = settings.smtpUsername || 'admin@example.com';
                document.getElementById('smtpPassword').value = settings.smtpPassword || '********';
            }
        })
        .catch(error => {
            console.error('Error loading settings:', error);
        });
}

// Save settings
function saveSettings() {
    const settings = {
        siteName: document.getElementById('siteName').value,
        siteEmail: document.getElementById('siteEmail').value,
        maintenanceMode: document.getElementById('maintenanceMode').checked.toString(),
        currentAcademicYear: document.getElementById('currentAcademicYear').value,
        defaultSectionCount: document.getElementById('defaultSectionCount').value,
        smtpHost: document.getElementById('smtpHost').value,
        smtpPort: document.getElementById('smtpPort').value,
        smtpUsername: document.getElementById('smtpUsername').value,
        smtpPassword: document.getElementById('smtpPassword').value
    };
    
    // Send settings to API
    fetch('http://localhost/E-Learning/backend/admin/admin_settings_api.php?action=update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
    alert('Settings saved successfully');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving settings:', error);
        alert('Error saving settings');
    });
}


// Logout function
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '../../../E-Learning/learning/login.html';
}

// Add exam question
function addExamQuestion(question = null) {
    const questionsContainer = document.getElementById('examQuestions');
    const questionId = Date.now();
    
    const questionCard = document.createElement('div');
    questionCard.className = 'card mb-3';
    questionCard.id = `question-${questionId}`;
    
    let questionType = question ? question.QuestionType : 'multiple-choice';
    let questionText = question ? question.QuestionText : '';
    let options = question ? JSON.parse(question.Options).join('\n') : '';
    let correctAnswer = question ? question.CorrectAnswer : '';
    let points = question ? question.Points : 1;
    
    questionCard.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Question</h6>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeQuestion(${questionId})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mb-3">
                <label class="form-label">Question Text</label>
                <input type="text" class="form-control" placeholder="Question Text" value="${questionText}">
            </div>
            <div class="mb-3">
                <label class="form-label">Question Type</label>
                <select class="form-select" onchange="toggleOptionsField(${questionId})">
                    <option value="multiple-choice" ${questionType === 'multiple-choice' ? 'selected' : ''}>Multiple Choice</option>
                    <option value="true-false" ${questionType === 'true-false' ? 'selected' : ''}>True/False</option>
                    <option value="short-answer" ${questionType === 'short-answer' ? 'selected' : ''}>Short Answer</option>
                </select>
            </div>
            <div class="mb-3" id="options-${questionId}">
                <label class="form-label">Options (one per line)</label>
                <textarea class="form-control" rows="3">${options}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Correct Answer</label>
                <input type="text" class="form-control" placeholder="Correct Answer" value="${correctAnswer}">
            </div>
            <div class="mb-3">
                <label class="form-label">Points</label>
                <input type="number" class="form-control" placeholder="Points" value="${points}" min="1">
            </div>
        </div>
    `;
    
    questionsContainer.appendChild(questionCard);
    
    // Initialize options field visibility
    toggleOptionsField(questionId);
}

// Toggle options field visibility based on question type
function toggleOptionsField(questionId) {
    const questionCard = document.getElementById(`question-${questionId}`);
    const questionType = questionCard.querySelector('select').value;
    const optionsField = document.getElementById(`options-${questionId}`);
    
    if (questionType === 'multiple-choice') {
        optionsField.style.display = 'block';
    } else {
        optionsField.style.display = 'none';
    }
}

// Remove question
function removeQuestion(questionId) {
    const questionCard = document.getElementById(`question-${questionId}`);
    questionCard.remove();
}

// Load courses for exam modal
function loadExamCourses() {
    const courseSelect = document.getElementById('examCourse');
    courseSelect.innerHTML = '<option value="">Select Course</option>';
    
    // Fetch courses from API
    fetch('http://localhost/E-Learning/backend/admin/admin_courses_api.php?action=getAll')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const courses = data.data;
                
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.CourseID;
                    option.textContent = course.CourseName;
                    courseSelect.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            alert('Error loading courses. Please try again.');
        });
}

// Save exam
function saveExam() {
    const examId = document.getElementById('examId').value;
    const courseId = document.getElementById('examCourse').value;
    const examName = document.getElementById('examName').value;
    const duration = document.getElementById('examDuration').value;
    
    if (!courseId || !examName || !duration) {
        alert('Please fill in all required fields');
        return;
    }
    
    const examData = {
        courseId: courseId,
        examName: examName,
        duration: duration
    };
    
    // Collect questions
    const questions = [];
    const questionCards = document.querySelectorAll('#examQuestions .card');
    
    questionCards.forEach(card => {
        const questionText = card.querySelector('input[placeholder="Question Text"]').value;
        const questionType = card.querySelector('select').value;
        const options = card.querySelector('textarea').value.split('\n').filter(opt => opt.trim());
        const correctAnswer = card.querySelector('input[placeholder="Correct Answer"]').value;
        const points = card.querySelector('input[placeholder="Points"]').value;
        
        if (!questionText || !correctAnswer || !points) {
            alert('Please fill in all question fields');
            return;
        }
        
        questions.push({
            text: questionText,
            type: questionType,
            options: options,
            correctAnswer: correctAnswer,
            points: points
        });
    });
    
    if (questions.length === 0) {
        alert('Please add at least one question');
        return;
    }
    
    examData.questions = questions;
    
    // Send to API
    const url = examId ? 
        `http://localhost/E-Learning/backend/admin/admin_exams_api.php?action=update&id=${examId}` :
        'http://localhost/E-Learning/backend/admin/admin_exams_api.php?action=add';
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(examData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(examId ? 'Exam updated successfully' : 'Exam added successfully');
            // Use Bootstrap's modal API instead of jQuery
            const examModal = document.getElementById('examModal');
            const modal = bootstrap.Modal.getInstance(examModal);
            modal.hide();
            loadExams();
        } else {
            alert(data.message || 'Error saving exam');
        }
    })
    .catch(error => {
        console.error('Error saving exam:', error);
        alert('Error saving exam. Please try again.');
    });
}

// Show exam modal
function showExamModal() {
    const modal = new bootstrap.Modal(document.getElementById('examModal'));
    const modalTitle = document.getElementById('examModalLabel');
    const examIdInput = document.getElementById('examId');
    
    // Reset form
    document.getElementById('examForm').reset();
    document.getElementById('examQuestions').innerHTML = '';
    
    // Add mode
    modalTitle.textContent = 'Add Exam';
    examIdInput.value = '';
    
    // Load courses
    loadExamCourses();
    
    // Add a default question
    addExamQuestion();
    
    modal.show();
}