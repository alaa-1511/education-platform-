// Global variables
let currentTeacherId = null; // This should be set after login
let currentSection = 'dashboard';

// Global variables for chart instances
let progressChart = null;
let coursesChart = null;

// Global variable to store sections data
let sectionsData = [];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Get teacher ID from session or local storage
    currentTeacherId = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    if (!currentTeacherId || role !== 'Teacher') {
        showToast('Please log in as a teacher first', 'error');
        window.location.href = 'learning/login.html';
        return;
    }
  // Check authentication
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
      window.location.href = '../../../E-Learning/learning/login.html';
      return;
  }
    // Initialize sidebar
    initializeSidebar();
    
    // Initialize modals and load data
    initializeModals();
    
    // Load initial data
    loadDashboardData();
    
    // Load sections for course creation
    loadSections();
    // uploadProfileImage();
    loadProfileData();
    // إضافة مستمع حدث لرفع الصورة الشخصية
    const profileImageUpload = document.getElementById('profileImageUpload');
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                uploadProfileImage(e.target.files[0]);
            }
        });
    }
});

// Sidebar functionality
function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
        s.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(section).style.display = 'block';
    
    // Update active link
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'lessons':
            loadLessons();
            break;
        case 'quizzes':
            loadQuizzes();
            break;
        case 'exams':
            loadExams();
            break;
        case 'students':
            loadStudents();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

// Dashboard functions
function loadDashboardData() {
    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/dashboard_api.php?teacher_id=${currentTeacherId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            // Update stats
            document.getElementById('totalCourses').textContent = data.total_courses;
            document.getElementById('totalStudents').textContent = data.total_students;
            document.getElementById('totalLessons').textContent = data.total_lessons;
            document.getElementById('totalExams').textContent = data.total_exams;

            // Update recent activities
            const activitiesContainer = document.getElementById('recentActivities');
            activitiesContainer.innerHTML = data.recent_activities.map(activity => `
                <div class="activity-item mb-2">
                    <small class="text-muted">${new Date(activity.created_at).toLocaleString()}</small>
                    <p class="mb-0">${activity.activity}</p>
                </div>
            `).join('');

            // Update upcoming deadlines
            const deadlinesContainer = document.getElementById('upcomingDeadlines');
            deadlinesContainer.innerHTML = data.upcoming_deadlines.map(deadline => `
                <div class="deadline-item mb-2">
                    <small class="text-muted">${new Date(deadline.deadline_date).toLocaleString()}</small>
                    <p class="mb-0">${deadline.deadline}</p>
                </div>
            `).join('');

            // Update charts
            updateProgressChart(data.student_progress);
            updateCoursesChart(data.course_statistics);
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading dashboard data', 'error');
        });
}

function updateProgressChart(data) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(student => student.Username),
            datasets: [{
                label: 'Progress Percentage',
                data: data.map(student => student.progress_percentage),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgb(75, 192, 192)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Progress (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Students'
                    }
                }
            }
        }
    });
}

function updateCoursesChart(data) {
    const ctx = document.getElementById('coursesChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (coursesChart) {
        coursesChart.destroy();
    }
    
    coursesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(course => course.CourseName),
            datasets: [{
                label: 'Enrolled Students',
                data: data.map(course => course.enrolled_students),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Students'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Courses'
                    }
                }
            }
        }
    });
}

// Courses functions
function loadCourses() {
    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/courses_api.php?teacher_id=${currentTeacherId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            const container = document.getElementById('coursesContainer');
            container.innerHTML = data.map(course => `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm">
                        <div class="position-relative">
                            <img src="${course.urlIMG || './IMG/math.jpg'}" 
                                 class="card-img-top" alt="${course.CourseName}"
                                 style="height: 200px; object-fit: cover;">
                            <div class="position-absolute top-0 end-0 m-2">
                                <div class="dropdown">
                                    <button class="btn btn-sm btn-light rounded-circle" data-bs-toggle="dropdown">
                                        <i class="fas fa-ellipsis-v"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                        
                                        <li><a class="dropdown-item" href="#" onclick="editCourse(${course.CourseID})">
                                            <i class="fas fa-edit me-2"></i>Edit
                                        </a></li>
                                        <li><a class="dropdown-item text-danger" href="#" onclick="deleteCourse(${course.CourseID})">
                                            <i class="fas fa-trash me-2"></i>Delete
                                        </a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${course.CourseName}</h5>
                            <p class="card-text text-muted small">${course.Description || 'No description available'}</p>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary">${course.SectionName || 'No Section'}</span>
                                <span class="badge bg-info">${course.GradeLevel || 'No Grade'}</span>
                            </div>
                            <div class="course-stats">
                                <div class="row g-2">
                                    <div class="col-6">
                                        <div class="stat-item text-center p-2 bg-light rounded">
                                            <i class="fas fa-users text-primary"></i>
                                            <div class="stat-value">${course.total_students || 0}</div>
                                            <div class="stat-label small">Students</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="stat-item text-center p-2 bg-light rounded">
                                            <i class="fas fa-book text-success"></i>
                                            <div class="stat-value">${course.total_lessons || 0}</div>
                                            <div class="stat-label small">Lessons</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="stat-item text-center p-2 bg-light rounded">
                                            <i class="fas fa-question-circle text-warning"></i>
                                            <div class="stat-value">${course.total_quizzes || 0}</div>
                                            <div class="stat-label small">Quizzes</div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="stat-item text-center p-2 bg-light rounded">
                                            <i class="fas fa-file-alt text-danger"></i>
                                            <div class="stat-value">${course.total_exams || 0}</div>
                                            <div class="stat-label small">Exams</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading courses', 'error');
        });
}

// Lessons functions
function loadLessons() {
    fetch(`http://localhost/E-Learning/backend/api/lessons_api.php?teacher_id=${currentTeacherId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast('Error loading lessons', 'error');
                return;
            }

            const tbody = document.getElementById('lessonsTableBody');
            tbody.innerHTML = data.map(lesson => `
                <tr>
                    <td>${lesson.LessonName}</td>
                    <td>${lesson.CourseName}</td>
                    <td>${lesson.Duration}</td>
                    <td>${new Date(lesson.CreatedAt).toLocaleString()}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editLesson(${lesson.LessonID})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteLesson(${lesson.LessonID})">Delete</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading lessons', 'error');
        });
}

// Quizzes functions
function loadQuizzes() {
    fetch(`http://localhost/E-Learning/backend/api/quizzes_api.php?teacher_id=${currentTeacherId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast('Error loading quizzes', 'error');
                return;
            }

            const tbody = document.getElementById('quizzesTableBody');
            tbody.innerHTML = data.map(quiz => `
                <tr>
                    <td>${quiz.QuizName}</td>
                    <td>${quiz.CourseName}</td>
                    <td>${quiz.LessonName}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteQuiz(${quiz.QuizID})">Delete</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading quizzes', 'error');
        });
}

// Exams functions
function loadExams() {
    fetch(`http://localhost/E-Learning/backend/api/exams_api.php?teacher_id=${currentTeacherId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast('Error loading exams', 'error');
                return;
            }

            const tbody = document.getElementById('examsTableBody');
            if (!data.data || !Array.isArray(data.data)) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No exams found</td></tr>';
                return;
            }

            tbody.innerHTML = data.data.map(exam => `
                <tr>
                    <td>${exam.ExamName}</td>
                    <td>${exam.CourseName}</td>
                    <td>${exam.Duration}</td>
                    <td>
                        <button class="btn btn-smbtn-primary" onclick="editExam(${exam.ExamID})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteExam(${exam.ExamID})">Delete</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading exams', 'error');
        });
}

// Students functions
function loadStudents() {
    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    console.log('Loading students for teacher ID:', currentTeacherId);
    
    fetch(`http://localhost/E-Learning/backend/api/students_api.php?teacher_id=${currentTeacherId}`)
        .then(response => {
            console.log('API Response Status:', response.status);
            console.log('API Response Headers:', response.headers);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response Data:', data);
            console.log('Number of students:', data.length);
            console.log('First student data:', data[0]);
            
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            const tbody = document.getElementById('studentsTableBody');
            if (!tbody) {
                console.error('Students table body not found');
                return;
            }

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">No students found</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(student => `
                <tr>
                    <td>${student.Username || 'N/A'}</td>
                    <td>${student.SectionName || 'N/A'}</td>
                    <td>${student.GradeLevel || 'N/A'}</td>
                    <td>${student.enrolled_courses || 0}</td>
                    
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteStudent(${student.UserID})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error loading students:', error);
            showToast('Error loading students: ' + error.message, 'error');
            const tbody = document.getElementById('studentsTableBody');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center">Error loading students: ' + error.message + '</td></tr>';
            }
        });
}

function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    console.log('Deleting student with ID:', studentId);
    
    fetch(`http://localhost/E-Learning/backend/api/students_api.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            student_id: studentId,
            teacher_id: currentTeacherId
        })
    })
    .then(response => {
        console.log('Delete API Response Status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Delete API Response Data:', data);
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Student deleted successfully', 'success');
            loadStudents(); // Reload the students list
        }
    })
    .catch(error => {
        console.error('Error deleting student:', error);
        showToast('Error deleting student: ' + error.message, 'error');
    });
}

// تحميل بيانات الملف الشخصي من API
function loadProfileData() {
    fetch('http://localhost/E-Learning/backend/profile_api.php', {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // تعبئة النموذج ببيانات المستخدم
            const elements = {
                'username': data.username || '',
                'email': data.email || '',
                'firstName': data.firstName || '',
                'lastName': data.lastName || '',
                'bio': data.bio || ''
                // 'profilePicture':data.imageUrl
            };

            // تحديث قيم العناصر فقط إذا كانت موجودة
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value;
                }
            });
            console.log(data.imageUrl);
            // تعيين صورة الملف الشخصي في قسم البروفايل
            const profileImg = document.getElementById('profilePicture');
            if (profileImg) {
                if (data.profilePicture) {
                    // profileImg.src = data.profilePicture;
                    profileImg.src = data.imageUrl + '?t=' + new Date().getTime();

                } else {
                    profileImg.src = './IMG/avatar.png';
                }
            }
            
            // تعيين صورة الملف الشخصي في شريط التنقل
            const navImg = document.getElementById('sprofilePicture');
            if (navImg) {
                if (data.profilePicture) {
                    navImg.src = data.imageUrl + '?t=' + new Date().getTime();
                } else {
                    navImg.src = './IMG/avatar.png';
                }
            }
        })
        .catch(error => {
            console.error('Error loading profile data:', error);
            showToast('Failed to load profile data: ' + error.message, 'error');
        });
}

// حفظ التغييرات على الملف الشخصي
function saveProfileChanges() {
    const profileData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        bio: document.getElementById('bio').value,
    };
    
    fetch('http://localhost/E-Learning/backend/profile_api.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showToast('Profile updated successfully!');
            loadProfileData(); // إعادة تحميل البيانات للتأكد من التحديث
        } else {
            throw new Error(data.error || 'Failed to update profile');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        showToast('Failed to update profile: ' + error.message, 'error');
    });
}

function uploadProfileImage(file) {
    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    if (!file) {
        showToast('No file selected', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('teacher_id', currentTeacherId);

    fetch('http://localhost/E-Learning/backend/profile_api.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Network response was not ok');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            // تحديث الصورة في الواجهة
            const profilePicture = document.getElementById('profilePicture');
            if (profilePicture) {
                // profilePicture.src =data.imageUrl;   
                // profilePicture.src = data.imageUrl + '?t=' + new Date().getTime();
                profilePicture.src = data.imageUrl + '?t=' + new Date().getTime();

            }
            showToast(data.message || 'Profile picture updated successfully', 'success');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error uploading profile picture: ' + error.message, 'error');
    });
}

// تغيير كلمة المرور
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New password and confirmation do not match!', 'error');
        return;
    }
    
    fetch('http://localhost/E-Learning/backend/change_password_api.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            currentPassword: currentPassword,
            newPassword: newPassword
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showToast('Password changed successfully!');
            document.getElementById('passwordForm').reset();
        } else {
            throw new Error(data.error || 'Failed to change password');
        }
    })
    .catch(error => {
        console.error('Error changing password:', error);
        showToast('Failed to change password: ' + error.message, 'error');
    });
}

// تأكيد حذف الحساب
function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        deleteAccount();
    }
}

// حذف الحساب
function deleteAccount() {
    fetch('http://localhost/E-Learning/backend/delete_account_api.php', {
        method: 'DELETE',
        credentials: 'same-origin'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showToast('Account deleted successfully. You will be redirected to the home page.');
            setTimeout(() => {
                window.location.href = 'logout.php'; // أو الصفحة الرئيسية
            }, 2000);
        } else {
            throw new Error(data.error || 'Failed to delete account');
        }
    })
    .catch(error => {
        console.error('Error deleting account:', error);
        showToast('Failed to delete account: ' + error.message, 'error');
    });
}


// Utility functions
function showToast(message, type = 'info') {
    const toast = document.querySelector('.toast');
    const toastBody = toast.querySelector('.toast-body');
    toastBody.textContent = message;
    toast.classList.add(`bg-${type}`);
    new bootstrap.Toast(toast).show();
}

//////////////////////////////////////// Logout Function /////////////////////////////////////
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '../../../E-Learning/learning/login.html';
}

// Initialize modals
function initializeModals() {
    // Load sections when the page loads
    loadSections();
    loadCoursesForSelect();

    // Add event listeners for course selection changes
    document.getElementById('lessonCourseSelect')?.addEventListener('change', function() {
        loadLessonsForSelect(this.value, 'lessonSelect');
    });

    document.getElementById('quizCourseSelect')?.addEventListener('change', function() {
        loadLessonsForSelect(this.value, 'quizLessonSelect');
    });

    // Add event listeners for modals
    document.getElementById('saveCourseBtn')?.addEventListener('click', saveCourse);
    document.getElementById('saveLessonBtn')?.addEventListener('click', saveLesson);
    document.getElementById('saveQuizBtn')?.addEventListener('click', saveQuiz);
    document.getElementById('saveExamBtn')?.addEventListener('click', saveExam);

    // Add event listeners for quiz question management
    document.getElementById('addQuestionBtn')?.addEventListener('click', addQuizQuestion);
    document.querySelectorAll('.add-option').forEach(button => {
        button.addEventListener('click', addQuizOption);
    });
    document.querySelectorAll('.remove-question').forEach(button => {
        button.addEventListener('click', removeQuizQuestion);
    });

    // Add event listeners for exam question management
    document.getElementById('addExamQuestionBtn')?.addEventListener('click', addExamQuestion);
    document.querySelectorAll('#examQuestions .add-option').forEach(button => {
        button.addEventListener('click', addExamOption);
    });
    document.querySelectorAll('#examQuestions .remove-question').forEach(button => {
        button.addEventListener('click', removeExamQuestion);
    });

    // Add event listeners for edit exam question management
    document.querySelectorAll('#editExamQuestions .add-option').forEach(button => {
        button.addEventListener('click', addExamOption);
    });
    document.querySelectorAll('#editExamQuestions .remove-question').forEach(button => {
        button.addEventListener('click', removeExamQuestion);
    });
}

// Save functions for modals
function saveCourse() {
    const form = document.getElementById('addCourseForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const courseName = formData.get('courseName');
    const description = formData.get('description');
    const sectionId = formData.get('sectionId');
    // const image = formData.get('courseImage');
    // console.log(image);
    const image = document.getElementById('courseImage');
    const file = image.files[0];

    if (!courseName || !description || !sectionId) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
        const reader = new FileReader();

        reader.onload = function (e) {
        const base64Image = e.target.result; // ← Base64 string

    const data = {
        courseName: courseName,
        description: description,
        sectionId: sectionId,
        filename: file.name,
        mime_type: file.type,
        file_data: base64Image,
        teacherId: currentTeacherId
    };
        console.log(data);
    fetch('http://localhost/E-Learning/backend/api/courses_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response =>response.json() 
        // if (!response.ok) {
        //     throw new Error('Network response was not ok');
        // }
        // return response.json();
    )
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Course created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide();
            loadCourses();
        }
    })
    .catch(error => {
      
            bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide();
    });
      };
    reader.readAsDataURL(file); 
}

function saveLesson() {
    const form = document.getElementById('addLessonForm');
    const formData = new FormData(form);
    const data = {
        courseId: formData.get('courseId'),
        lessonName: formData.get('lessonName'),
        content: formData.get('content'),
        videoUrl: formData.get('videoUrl'),
        duration: formData.get('duration'),
        teacherId: currentTeacherId
    };

    fetch('http://localhost/E-Learning/backend/api/lessons_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast('Error creating lesson', 'error');
        } else {
            showToast('Lesson created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addLessonModal')).hide();
            loadLessons();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error creating lesson', 'error');
    });
}

function saveQuiz() {
    const form = document.getElementById('addQuizForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const courseId = formData.get('courseId');
    const lessonId = formData.get('lessonId');
    const quizTitle = formData.get('quizTitle');
    
    if (!courseId || courseId === '') {
        showToast('Please select a course', 'error');
        return;
    }
    
    if (!lessonId || lessonId === '') {
        showToast('Please select a lesson', 'error');
        return;
    }
    
    if (!quizTitle || quizTitle.trim() === '') {
        showToast('Please enter a quiz title', 'error');
        return;
    }

    // Collect questions data
    const questions = [];
    const questionElements = document.querySelectorAll('#quizQuestions .question');
    
    if (questionElements.length === 0) {
        showToast('Please add at least one question', 'error');
        return;
    }

    let hasError = false;
    questionElements.forEach((questionElement, index) => {
        const questionText = questionElement.querySelector('input[name^="questions"][name$="[text]"]').value;
        const correctAnswer = questionElement.querySelector('input[name^="questions"][name$="[correctAnswer]"]').value;
        const options = Array.from(questionElement.querySelectorAll('.options input')).map(input => input.value);
        
        if (!questionText || questionText.trim() === '') {
            showToast(`Please enter the question text for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        if (!correctAnswer || correctAnswer.trim() === '') {
            showToast(`Please enter the correct answer for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        if (options.length < 2) {
            showToast(`Please add at least 2 options for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        // Check if any option is empty
        if (options.some(option => !option.trim())) {
            showToast(`Please fill in all options for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        // Structure the question data for the API
        questions.push({
            question_text: questionText,
            answers: options.map(option => ({
                answer_text: option,
                is_correct: option === correctAnswer ? 1 : 0
            }))
        });
    });

    if (hasError) {
        return;
    }

    // Prepare data according to database structure
    const data = {
        lesson_id: parseInt(lessonId),
        quiz_name: quizTitle,
        questions: questions,
        teacher_id: currentTeacherId
    };

    console.log('Sending quiz data:', data);

    fetch('http://localhost/E-Learning/backend/api/quizzes_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Quiz created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addQuizModal')).hide();
            loadQuizzes();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error creating quiz: ' + error.message, 'error');
    });
}

function saveExam() {
    const form = document.getElementById('addExamForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const courseId = formData.get('courseId');
    const examTitle = formData.get('examTitle');
    const timeLimit = formData.get('timeLimit');
    const passingScore = formData.get('passingScore');
    
    if (!courseId || courseId === '') {
        showToast('Please select a course', 'error');
        return;
    }
    
    if (!examTitle || examTitle.trim() === '') {
        showToast('Please enter an exam title', 'error');
        return;
    }

    if (!timeLimit || isNaN(timeLimit) || timeLimit <= 0) {
        showToast('Please enter a valid time limit', 'error');
        return;
    }

    if (!passingScore || isNaN(passingScore) || passingScore <= 0) {
        showToast('Please enter a valid passing score', 'error');
        return;
    }

    // Collect questions data
    const questions = [];
    const questionElements = document.querySelectorAll('#examQuestions .question');
    
    if (questionElements.length === 0) {
        showToast('Please add at least one question', 'error');
        return;
    }

    let hasError = false;
    questionElements.forEach((questionElement, index) => {
        const questionText = questionElement.querySelector('input[name^="questions"][name$="[text]"]').value.trim();
        const correctAnswer = questionElement.querySelector('input[name^="questions"][name$="[correctAnswer]"]').value.trim();
        const points = questionElement.querySelector('input[name^="questions"][name$="[points]"]').value;
        const options = Array.from(questionElement.querySelectorAll('.options input')).map(input => input.value.trim());
        
        if (!questionText) {
            showToast(`Please enter the question text for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        if (!correctAnswer) {
            showToast(`Please enter the correct answer for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        if (!points || isNaN(points) || points <= 0) {
            showToast(`Please enter valid points for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        if (options.length < 2) {
            showToast(`Please add at least 2 options for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        // Check if any option is empty
        if (options.some(option => !option)) {
            showToast(`Please fill in all options for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        // Check if correct answer exists in options
        if (!options.includes(correctAnswer)) {
            showToast(`Correct answer must match one of the options for Question ${index + 1}`, 'error');
            hasError = true;
            return;
        }
        
        // Structure the question data for the API
        questions.push({
            text: questionText,
            points: parseInt(points),
            options: options,
            correctAnswer: correctAnswer
        });
    });

    if (hasError) {
        return;
    }

    // Prepare data according to database structure
    const data = {
        course_id: parseInt(courseId),
        exam_name: examTitle,
        time_limit: parseInt(timeLimit),
        passing_score: parseInt(passingScore),
        questions: questions,
        teacher_id: currentTeacherId
    };

    console.log('Sending exam data:', data);

    fetch('http://localhost/E-Learning/backend/api/exams_api.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Exam created successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('addExamModal')).hide();
            loadExams();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error creating exam: ' + error.message, 'error');
    });
}

function loadSections() {
    fetch('http://localhost/E-Learning/backend/api/sections_api.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            sectionsData = data;
            
            // Update all section select elements
            const sectionSelects = [
                document.querySelector('select[name="sectionId"]'), // Add Course Modal
                document.getElementById('editSectionId'), // Edit Course Modal
                // Add more select elements as needed
            ];

            sectionSelects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">Select Section</option>' + 
                        data.map(section => 
                            `<option value="${section.SectionID}">${section.SectionName}</option>`
                        ).join('');
                }
            });
        })
        .catch(error => {
            console.error('Error loading sections:', error);
            showToast('Error loading sections', 'error');
        });
}

// Function to load courses for select elements
function loadCoursesForSelect() {
    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/courses_api.php?teacher_id=${currentTeacherId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            // Update course select elements
            const courseSelects = [
                document.getElementById('lessonCourseSelect'), // Add Lesson Modal
                document.getElementById('quizCourseSelect'), // Add Quiz Modal
                document.getElementById('examCourseSelect') // Add Exam Modal
            ];

            courseSelects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">Select Course</option>' + 
                        data.map(course => 
                            `<option value="${course.CourseID}">${course.CourseName}</option>`
                        ).join('');
                }
            });
        })
        .catch(error => {
            console.error('Error loading courses:', error);
            showToast('Error loading courses', 'error');
        });
}

// Function to load lessons for a specific course
function loadLessonsForSelect(courseId, targetSelectId) {
    if (!courseId) return;

    fetch(`http://localhost/E-Learning/backend/api/lessons_api.php?course_id=${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            const select = document.getElementById(targetSelectId);
            if (select) {
                select.innerHTML = '<option value="">Select Lesson</option>' + 
                    data.map(lesson => 
                        `<option value="${lesson.LessonID}">${lesson.LessonName}</option>`
                    ).join('');
            }
        })
        .catch(error => {
            console.error('Error loading lessons:', error);
            showToast('Error loading lessons', 'error');
        });
}

// Course detail functions
function viewCourseDetails(courseId) {
    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/courses_api.php?course_id=${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            // Update modal content
            const elements = {
                'courseDetailName': data.CourseName,
                'courseDetailDescription': data.Description,
                'courseDetailSection': data.SectionName,
                'courseDetailGradeLevel': data.GradeLevel,
                'courseDetailCreatedAt': new Date(data.CreatedAt).toLocaleString(),
                'courseDetailUpdatedAt': new Date(data.UpdatedAt).toLocaleString(),
                'courseTotalLessons': data.total_lessons || 0,
                'courseTotalQuizzes': data.total_quizzes || 0,
                'courseTotalExams': data.total_exams || 0,
                'courseTotalStudents': data.total_students || 0
            };

            // Safely update each element
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });

            // Load course students
            loadCourseStudents(courseId);

            // Show the modal
            const courseDetailModal = document.getElementById('courseDetailModal');
            if (courseDetailModal) {
                const modal = new bootstrap.Modal(courseDetailModal);
                modal.show();
            } else {
                showToast('Course detail modal not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading course details: ' + error.message, 'error');
        });
}

function loadCourseStudents(courseId) {
    fetch(`http://localhost/E-Learning/backend/api/courses_api.php?course_id=${courseId}&students=true`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            const tbody = document.getElementById('courseStudentsTableBody');
            if (!tbody) {
                console.warn('Course students table body not found');
                return;
            }

            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No students enrolled</td></tr>';
                return;
            }

            tbody.innerHTML = data.map(student => `
                <tr>
                    <td>${student.Username || 'N/A'}</td>
                    <td>${student.Email || 'N/A'}</td>
                    <td>${Math.round((student.completed_lessons / (student.total_lessons || 1)) * 100)}%</td>
                    <td>${Math.round(student.quiz_avg || 0)}%</td>
                    <td>${Math.round(student.exam_avg || 0)}%</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="unenrollStudent(${student.UserID}, ${courseId})">Unenroll</button>
                    </td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading course students: ' + error.message, 'error');
        });
}

function unenrollStudent(studentId, courseId) {
    if (!confirm('Are you sure you want to unenroll this student?')) {
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/students_api.php?student_id=${studentId}&course_id=${courseId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Student unenrolled successfully', 'success');
            loadCourseStudents(courseId); // Refresh the student list
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error unenrolling student: ' + error.message, 'error');
    });
}

function editCourse(courseId) {
    fetch(`http://localhost/E-Learning/backend/api/courses_api.php?course_id=${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(course => {
            if (course.error) {
                showToast(course.error, 'error');
                return;
            }

            // Set form values
            document.getElementById('editCourseName').value = course.CourseName;
            document.getElementById('editCourseDescription').value = course.Description;
            document.getElementById('editSectionId').value = course.SectionID;
            document.getElementById('editAcademicYear').value = course.AcademicYear || '';
            
            // Show current image if exists
            const currentImage = document.getElementById('currentCourseImage');
            if (course.urlIMG) {
                currentImage.src = course.urlIMG;
                currentImage.style.display = 'block';
            } else {
                currentImage.style.display = 'none';
            }

            // Store course ID for update
            window.currentEditingCourseId = courseId;
            
            // Show modal
            const editModal = new bootstrap.Modal(document.getElementById('editCourseModal'));
            editModal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading course details', 'error');
        });
}

async function saveCourseEdit() {
    try {
        if (!window.currentEditingCourseId) {
            showToast('No course selected for editing', 'error');
            return;
        }

        const data = {
            courseId: window.currentEditingCourseId,
            teacherId: currentTeacherId,
            courseName: document.getElementById('editCourseName').value,
            description: document.getElementById('editCourseDescription').value,
            sectionId: document.getElementById('editSectionId').value,
            academicYear: document.getElementById('editAcademicYear').value
        };

        // Handle image file
        const imageFile = document.getElementById('editCourseImage').files[0];
        if (imageFile) {
            // Get only the file name
            const fileName = imageFile.name;
            data.imageName = fileName;
        }

        console.log('Sending data:', data);

        const response = await fetch('http://localhost/E-Learning/backend/api/courses_api.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            throw new Error('Invalid response from server');
        }

        if (result.error) {
            throw new Error(result.error);
        }

        showToast('Course updated successfully', 'success');
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCourseModal'));
        if (modal) {
            modal.hide();
        }
        loadCourses();
    } catch (error) {
        console.error('Error updating course:', error);
        showToast(error.message || 'Failed to update course', 'error');
    }
}

function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/courses_api.php?course_id=${courseId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Course deleted successfully', 'success');
            loadCourses(); // Refresh the courses list
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error deleting course', 'error');
    });
}

function enrollNewStudent() {
    // Implementation for enrolling a new student
    // This will be added in the next step
    showToast('Student enrollment feature coming soon', 'info');
}

// Lesson management functions
function editLesson(lessonId) {
    window.currentEditingLessonId = lessonId;
    fetch(`http://localhost/E-Learning/backend/api/lessons_api.php?lesson_id=${lessonId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(lesson => {
            if (lesson.error) {
                showToast(lesson.error, 'error');
                return;
            }

            // Set form values
            const editLessonName = document.getElementById('editLessonName');
            const editLessonContent = document.getElementById('editLessonContent');
            const editLessonVideoUrl = document.getElementById('editLessonVideoUrl');
            const editLessonDuration = document.getElementById('editLessonDuration');
            const editLessonCourseSelect = document.getElementById('editLessonCourseSelect');

            if (editLessonName) editLessonName.value = lesson.LessonName || '';
            if (editLessonContent) editLessonContent.value = lesson.Content || '';
            if (editLessonVideoUrl) editLessonVideoUrl.value = lesson.VideoUrl || '';
            if (editLessonDuration) editLessonDuration.value = lesson.Duration || '';
            
            // Load courses for the select element
            if (editLessonCourseSelect) {
                fetch(`http://localhost/E-Learning/backend/api/courses_api.php?teacher_id=${currentTeacherId}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(courses => {
                        if (courses.error) {
                            showToast(courses.error, 'error');
                            return;
                        }

                        editLessonCourseSelect.innerHTML = '<option value="">Select Course</option>';
                        
                        courses.forEach(course => {
                            const option = document.createElement('option');
                            option.value = course.CourseID;
                            option.textContent = course.CourseName;
                            if (course.CourseID === lesson.CourseID) {
                                option.selected = true;
                            }
                            editLessonCourseSelect.appendChild(option);
                        });
                    })
                    .catch(error => {
                        console.error('Error loading courses:', error);
                        showToast('Error loading courses', 'error');
                    });
            }
            
            // Show the edit modal
            const editModal = new bootstrap.Modal(document.getElementById('editLessonModal'));
            editModal.show();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading lesson for editing', 'error');
        });
}

function saveLessonEdit() {
    const lessonId = window.currentEditingLessonId;
    if (!lessonId) {
        showToast('No lesson selected for editing', 'error');
        return;
    }

    const data = {
        lessonId: lessonId,
        lessonName: document.getElementById('editLessonName').value,
        content: document.getElementById('editLessonContent').value,
        videoUrl: document.getElementById('editLessonVideoUrl').value,
        duration: document.getElementById('editLessonDuration').value,
        courseId: document.getElementById('editLessonCourseSelect').value,
        teacherId: currentTeacherId
    };

    fetch('http://localhost/E-Learning/backend/api/lessons_api.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Lesson updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editLessonModal')).hide();
            loadLessons(); // Refresh the lessons list
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error updating lesson', 'error');
    });
}

function deleteLesson(lessonId) {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
        return;
    }

    fetch(`http://localhost/E-Learning/backend/api/lessons_api.php?lesson_id=${lessonId}&teacher_id=${currentTeacherId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Lesson deleted successfully', 'success');
            loadLessons(); // Refresh the lessons list
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error deleting lesson', 'error');
    });
}

// Quiz question management functions
function addQuizQuestion() {
    const questionsContainer = document.getElementById('quizQuestions');
    const questionCount = questionsContainer.children.length;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question mb-3 border p-3 rounded';
    questionDiv.innerHTML = `
        <label class="form-label">Question ${questionCount + 1}</label>
        <input type="text" class="form-control mb-2" name="questions[${questionCount}][text]" placeholder="Question text" required>
        <input type="text" class="form-control mb-2" name="questions[${questionCount}][correctAnswer]" placeholder="Correct answer" required>
        <div class="options">
            <input type="text" class="form-control mb-2" name="questions[${questionCount}][options][]" placeholder="Option 1" required>
            <input type="text" class="form-control mb-2" name="questions[${questionCount}][options][]" placeholder="Option 2" required>
            <button type="button" class="btn btn-sm btn-outline-primary add-option">Add Option</button>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-question">Remove Question</button>
    `;
    
    questionsContainer.appendChild(questionDiv);
    
    // Add event listeners to new buttons
    questionDiv.querySelector('.add-option').addEventListener('click', addQuizOption);
    questionDiv.querySelector('.remove-question').addEventListener('click', removeQuizQuestion);
}

function addQuizOption(event) {
    const optionsContainer = event.target.parentElement;
    const questionIndex = Array.from(optionsContainer.parentElement.parentElement.children).indexOf(optionsContainer.parentElement);
    const optionCount = optionsContainer.querySelectorAll('input[type="text"]').length;
    
    const optionInput = document.createElement('input');
    optionInput.type = 'text';
    optionInput.className = 'form-control mb-2';
    optionInput.name = `questions[${questionIndex}][options][]`;
    optionInput.placeholder = `Option ${optionCount + 1}`;
    optionInput.required = true;
    
    // Insert before the "Add Option" button
    optionsContainer.insertBefore(optionInput, event.target);
}

function removeQuizQuestion(event) {
    const questionDiv = event.target.parentElement;
    const questionsContainer = document.getElementById('quizQuestions');
    
    if (questionsContainer.children.length > 1) {
        questionDiv.remove();
        // Update question numbers
        Array.from(questionsContainer.children).forEach((question, index) => {
            question.querySelector('label').textContent = `Question ${index + 1}`;
            // Update all input names to reflect new question index
            question.querySelectorAll('input').forEach(input => {
                const name = input.name;
                input.name = name.replace(/questions\[\d+\]/, `questions[${index}]`);
            });
        });
    } else {
        showToast('Quiz must have at least one question', 'error');
    }
}

// Quiz management functions
function editQuiz(quizId) {
    window.currentEditingQuizId = quizId;
    fetch(`http://localhost/E-Learning/backend/api/quizzes_api.php?quiz_id=${quizId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            // Update quiz name
            const quizNameInput = document.getElementById('editQuizName');
            if (quizNameInput) {
                quizNameInput.value = data.QuizName;
            }

            // Update lesson ID
            const lessonIdInput = document.getElementById('editLessonId');
            if (lessonIdInput) {
                lessonIdInput.value = data.LessonID;
            }

            // Update questions
            const questionsContainer = document.getElementById('editQuizQuestions');
            if (questionsContainer) {
                questionsContainer.innerHTML = '';
                data.questions.forEach((question, index) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question mb-3 border p-3 rounded';
                    
                    // Find the correct answer
                    const correctAnswer = question.answers.find(answer => answer.is_correct === 1)?.answer_text || '';
                    
                    questionDiv.innerHTML = `
                        <label class="form-label">Question ${index + 1}</label>
                        <input type="text" class="form-control mb-2" name="questions[${index}][text]" 
                               value="${question.question_text}" required>
                        <input type="text" class="form-control mb-2" name="questions[${index}][correctAnswer]" 
                               value="${correctAnswer}" required>
                        <div class="options">
                            ${question.answers.map((answer, optIndex) => `
                                <input type="text" class="form-control mb-2" 
                                       name="questions[${index}][options][]" 
                                       value="${answer.answer_text}" required>
                            `).join('')}
                            <button type="button" class="btn btn-sm btn-outline-primary add-option">Add Option</button>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-question">Remove Question</button>
                    `;
                    questionsContainer.appendChild(questionDiv);
                });
            }

            // Show the edit modal
            const editModal = document.getElementById('editQuizModal');
            if (editModal) {
                const modal = new bootstrap.Modal(editModal);
                modal.show();
            } else {
                showToast('Edit quiz modal not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading quiz for editing', 'error');
        });
}

function saveQuizEdit() {
    const quizId = window.currentEditingQuizId;
    if (!quizId) {
        showToast('No quiz selected for editing', 'error');
        return;
    }

    const form = document.getElementById('editQuizForm');
    const formData = new FormData(form);
    const questions = [];
    const questionElements = document.querySelectorAll('#editQuizQuestions .question');
    
    questionElements.forEach((questionElement, index) => {
        const questionText = questionElement.querySelector('input[name^="questions"][name$="[text]"]').value;
        const correctAnswer = questionElement.querySelector('input[name^="questions"][name$="[correctAnswer]"]').value;
        const options = Array.from(questionElement.querySelectorAll('.options input')).map(input => input.value);
        
        questions.push({
            question_text: questionText,
            answers: options.map(option => ({
                answer_text: option,
                is_correct: option === correctAnswer ? 1 : 0
            }))
        });
    });

    const data = {
        quiz_id: quizId,
        quiz_name: formData.get('quizName'),
        lesson_id: parseInt(formData.get('lessonId')),
        questions: questions
    };

    fetch('http://localhost/E-Learning/backend/api/quizzes_api.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Quiz updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editQuizModal')).hide();
            loadQuizzes();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error updating quiz', 'error');
    });
}

function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
        return;
    }

    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    // Construct the URL with query parameters
    const url = `http://localhost/E-Learning/backend/api/quizzes_api.php?quiz_id=${quizId}&teacher_id=${currentTeacherId}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Quiz deleted successfully', 'success');
            loadQuizzes(); // Refresh the quizzes list
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error deleting quiz: ' + error.message, 'error');
    });
}

// Exam management functions
function editExam(examId) {
    window.currentEditingExamId = examId;
    fetch(`http://localhost/E-Learning/backend/api/exams_api.php?exam_id=${examId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast(data.error, 'error');
                return;
            }

            // Update exam details
            const examNameInput = document.getElementById('editExamName');
            if (examNameInput) {
                examNameInput.value = data.ExamName;
            }

            const timeLimitInput = document.getElementById('editTimeLimit');
            if (timeLimitInput) {
                timeLimitInput.value = data.TimeLimit;
            }

            const passingScoreInput = document.getElementById('editPassingScore');
            if (passingScoreInput) {
                passingScoreInput.value = data.PassingScore;
            }

            // Update course selection
            const courseSelect = document.getElementById('editExamCourseSelect');
            if (courseSelect) {
                courseSelect.value = data.CourseID;
            }

            // Update questions
            const questionsContainer = document.getElementById('editExamQuestions');
            if (questionsContainer) {
                questionsContainer.innerHTML = '';
                data.questions.forEach((question, index) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = 'question mb-3 border p-3 rounded';
                    
                    // Find the correct answer
                    const correctAnswer = question.answers.find(answer => answer.is_correct === 1)?.answer_text || '';
                    
                    questionDiv.innerHTML = `
                        <label class="form-label">Question ${index + 1}</label>
                        <input type="text" class="form-control mb-2" name="questions[${index}][text]" 
                               value="${question.question_text}" required>
                        <input type="number" class="form-control mb-2" name="questions[${index}][points]" 
                               value="${question.points}" required>
                        <input type="text" class="form-control mb-2" name="questions[${index}][correctAnswer]" 
                               value="${correctAnswer}" required>
                        <div class="options">
                            ${question.answers.map((answer, optIndex) => `
                                <input type="text" class="form-control mb-2" 
                                       name="questions[${index}][options][]" 
                                       value="${answer.answer_text}" required>
                            `).join('')}
                            <button type="button" class="btn btn-sm btn-outline-primary add-option">Add Option</button>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger remove-question">Remove Question</button>
                    `;
                    questionsContainer.appendChild(questionDiv);
                });
            }

            // Show the edit modal
            const editModal = document.getElementById('editExamModal');
            if (editModal) {
                const modal = new bootstrap.Modal(editModal);
                modal.show();
            } else {
                showToast('Edit exam modal not found', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error loading exam for editing', 'error');
        });
}

function saveExamEdit() {
    const examId = window.currentEditingExamId;
    if (!examId) {
        showToast('No exam selected for editing', 'error');
        return;
    }

    const form = document.getElementById('editExamForm');
    const formData = new FormData(form);
    const questions = [];
    const questionElements = document.querySelectorAll('#editExamQuestions .question');
    
    questionElements.forEach((questionElement, index) => {
        const questionText = questionElement.querySelector('input[name^="questions"][name$="[text]"]').value;
        const correctAnswer = questionElement.querySelector('input[name^="questions"][name$="[correctAnswer]"]').value;
        const points = questionElement.querySelector('input[name^="questions"][name$="[points]"]').value;
        const options = Array.from(questionElement.querySelectorAll('.options input')).map(input => input.value);
        
        questions.push({
            question_text: questionText,
            points: parseInt(points),
            answers: options.map(option => ({
                answer_text: option,
                is_correct: option === correctAnswer ? 1 : 0
            }))
        });
    });

    const data = {
        exam_id: examId,
        exam_name: formData.get('examName'),
        course_id: parseInt(formData.get('courseId')),
        time_limit: parseInt(formData.get('timeLimit')),
        passing_score: parseInt(formData.get('passingScore')),
        questions: questions,
        teacher_id: currentTeacherId
    };

    fetch('http://localhost/E-Learning/backend/api/exams_api.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Exam updated successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editExamModal')).hide();
            loadExams();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error updating exam: ' + error.message, 'error');
    });
}

function deleteExam(examId) {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
        return;
    }

    if (!currentTeacherId) {
        showToast('Please log in first', 'error');
        return;
    }

    // Construct the URL with query parameters
    const url = `http://localhost/E-Learning/backend/api/exams_api.php?exam_id=${examId}&teacher_id=${currentTeacherId}`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            showToast(data.error, 'error');
        } else {
            showToast('Exam deleted successfully', 'success');
            loadExams(); // Refresh the exams list
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Error deleting exam: ' + error.message, 'error');
    });
}

// Exam question management functions
function addExamQuestion() {
    const questionsContainer = document.getElementById('examQuestions');
    const questionCount = questionsContainer.children.length;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question mb-3 border p-3 rounded';
    questionDiv.innerHTML = `
        <label class="form-label">Question ${questionCount + 1}</label>
        <input type="text" class="form-control mb-2" name="questions[${questionCount}][text]" placeholder="Question text" required>
        <input type="number" class="form-control mb-2" name="questions[${questionCount}][points]" placeholder="Points" min="1" required>
        <input type="text" class="form-control mb-2" name="questions[${questionCount}][correctAnswer]" placeholder="Correct answer" required>
        <div class="options">
            <input type="text" class="form-control mb-2" name="questions[${questionCount}][options][]" placeholder="Option 1" required>
            <input type="text" class="form-control mb-2" name="questions[${questionCount}][options][]" placeholder="Option 2" required>
            <button type="button" class="btn btn-sm btn-outline-primary add-option">Add Option</button>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-question">Remove Question</button>
    `;
    
    questionsContainer.appendChild(questionDiv);
    
    // Add event listeners to new buttons
    questionDiv.querySelector('.add-option').addEventListener('click', addExamOption);
    questionDiv.querySelector('.remove-question').addEventListener('click', removeExamQuestion);
}

function addExamOption(event) {
    const optionsContainer = event.target.parentElement;
    const questionIndex = Array.from(optionsContainer.parentElement.parentElement.children).indexOf(optionsContainer.parentElement);
    const optionCount = optionsContainer.querySelectorAll('input[type="text"]').length;
    
    const optionInput = document.createElement('input');
    optionInput.type = 'text';
    optionInput.className = 'form-control mb-2';
    optionInput.name = `questions[${questionIndex}][options][]`;
    optionInput.placeholder = `Option ${optionCount + 1}`;
    optionInput.required = true;
    
    // Insert before the "Add Option" button
    optionsContainer.insertBefore(optionInput, event.target);
}

function removeExamQuestion(event) {
    const questionDiv = event.target.parentElement;
    const questionsContainer = document.getElementById('examQuestions');
    
    if (questionsContainer.children.length > 1) {
        questionDiv.remove();
        // Update question numbers
        Array.from(questionsContainer.children).forEach((question, index) => {
            question.querySelector('label').textContent = `Question ${index + 1}`;
            // Update all input names to reflect new question index
            question.querySelectorAll('input').forEach(input => {
                const name = input.name;
                input.name = name.replace(/questions\[\d+\]/, `questions[${index}]`);
            });
        });
    } else {
        showToast('Exam must have at least one question', 'error');
    }
}

// Fix ARIA issue in modals
document.addEventListener('DOMContentLoaded', function() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            this.removeAttribute('aria-hidden');
        });
        modal.addEventListener('hidden.bs.modal', function() {
            this.setAttribute('aria-hidden', 'true');
        });
    });
}); 