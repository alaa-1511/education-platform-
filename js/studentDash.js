//////////////////////////////////////// Logout Function /////////////////////////////////////


// Chart instances
let progressChart = null;
let resultsChart = null;

// Dashboard statistics
const dashboardStats = {
    enrolledCourses: 0,
    completedLessons: 0,
    averageScore: 0,
    upcomingExams: [],
    recentResults: []
};

loadProfileData();

// Initialize charts
function initializeProgressChart(data) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Progress',
                data: data.values,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#4CAF50',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: value => value + '%'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initializeResultsChart(data) {
    const ctx = document.getElementById('resultsChart').getContext('2d');
    
    if (resultsChart) {
        resultsChart.destroy();
    }

    resultsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Score',
                data: data.values,
                backgroundColor: '#2196F3',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#2196F3',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: value => value + '%'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Handle window resize
function handleResize() {
    if (progressChart) progressChart.resize();
    if (resultsChart) resultsChart.resize();
}

// Loading state management
function showLoadingState(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('loading');
    }
}

function hideLoadingState(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('loading');
    }
}

// Toast notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

class StudentDashboard {
    constructor() {
        this.initialize();
    }

    //////////////////////////////////////// Initialization /////////////////////////////////////
    initialize() {
        document.addEventListener("DOMContentLoaded", () => {
            // Check authentication
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) {
                window.location.href = '../../../E-Learning/learning/login.html';
                return;
            }

            this.loadAllData();
            this.setupEventListeners();
            this.setupSearchFunctionality();
            this.loadDashboardStats();
            this.loadChartData();
            
        });
    }

    setupEventListeners() {
        // Add event delegation for quiz buttons (since they're dynamically loaded)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.take-quiz-btn')) {
                const quizId = e.target.closest('.take-quiz-btn').getAttribute('data-quiz-id');
                this.startQuiz(quizId);
            }
        });
        
        // Add event listener for sidebar navigation
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
                
                // Update active state
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Load section-specific data
                if (section === 'dashboard') {
                    this.loadDashboardStats();
                    this.loadChartData();
                } else if (section === 'all-courses') {
                    this.loadAllCourses();
                }
            });
        });
        
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
            });
        }
        
        // Window resize handler
        window.addEventListener('resize', handleResize);
    }

    async loadAllData() {
        await this.loadCourses();
        await this.loadExams();
        await this.fetchExamResults();
        
        // Check if all-courses section is visible and load courses if it is
        const allCoursesSection = document.getElementById('all-courses');
        if (allCoursesSection && allCoursesSection.style.display !== 'none') {
            await this.loadAllCourses();
        }
    }

    //////////////////////////////////////// Authentication /////////////////////////////////////
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        window.location.href = '../../../E-Learning/learning/login.html';
    }

    //////////////////////////////////////// Data Fetching /////////////////////////////////////
    async fetchData(url) {
        try {
            const response = await fetch(url);
            const text = await response.text();
            
            if (text.startsWith('<!DOCTYPE') || text.includes('<html')) {
                throw new Error('Server returned HTML instead of JSON');
            }
            
            const data = JSON.parse(text);
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error("Fetch error for URL:", url, error);
            return {
                status: "error",
                message: error.message || "Failed to fetch data",
                error: error
            };
        }
    }

    //////////////////////////////////////// Dashboard Statistics /////////////////////////////////////
    async loadDashboardStats() {
        try {
            showLoadingState('dashboard');
            
            // Fetch enrolled courses
            const enrollmentsResponse = await fetch('http://localhost/E-Learning/backend/enrollments.php');
            if (!enrollmentsResponse.ok) throw new Error('Failed to fetch enrollments');
            const enrollmentsData = await enrollmentsResponse.json();
            dashboardStats.enrolledCourses = enrollmentsData.courses ? enrollmentsData.courses.length : 0;

            // Fetch completed lessons
            const lessonsResponse = await fetch('http://localhost/E-Learning/backend/completed_lessons.php');
            if (!lessonsResponse.ok) throw new Error('Failed to fetch completed lessons');
            const lessonsData = await lessonsResponse.json();
            dashboardStats.completedLessons = lessonsData.completed_lessons || 0;

            // Fetch average scores
            const scoresResponse = await fetch('http://localhost/E-Learning/backend/average_scores.php');
            if (!scoresResponse.ok) throw new Error('Failed to fetch average scores');
            const scoresData = await scoresResponse.json();
            dashboardStats.averageScore = scoresData.highest_score || 0;

            // Fetch upcoming exams
            const examsResponse = await fetch('http://localhost/E-Learning/backend/exams.php');
            if (!examsResponse.ok) throw new Error('Failed to fetch exams');
            const examsData = await examsResponse.json();
            dashboardStats.upcomingExams = examsData.exams ? examsData.exams.filter(exam => new Date(exam.ExamCreateDate) > new Date())
                .sort((a, b) => new Date(a.ExamCreateDate) - new Date(b.ExamCreateDate))
                .slice(0, 5) : [];

            // Fetch recent results
            const resultsResponse = await fetch('http://localhost/E-Learning/backend/exam_results.php');
            if (!resultsResponse.ok) throw new Error('Failed to fetch exam results');
            const resultsData = await resultsResponse.json();
            dashboardStats.recentResults = resultsData.all_results ? resultsData.all_results.slice(0, 5) : [];

            this.updateDashboardStats();
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
            showToast('Failed to load dashboard statistics', 'error');
        } finally {
            hideLoadingState('dashboard');
        }
    }

    updateDashboardStats() {
        // Update statistics cards
        const enrolledCoursesElement = document.querySelector('.dashcard:nth-child(1) .card-text');
        const completedLessonsElement = document.querySelector('.dashcard:nth-child(2) .card-text');
        const averageScoreElement = document.querySelector('.dashcard:nth-child(3) .card-text');
        
        if (enrolledCoursesElement) enrolledCoursesElement.textContent = `${dashboardStats.enrolledCourses} Courses`;
        if (completedLessonsElement) completedLessonsElement.textContent = `${dashboardStats.completedLessons} Lessons`;
        if (averageScoreElement) averageScoreElement.textContent = `${dashboardStats.averageScore}%`;
    }

    //////////////////////////////////////// Chart Data /////////////////////////////////////
    async loadChartData() {
        try {
            showLoadingState('dashboard');
            
            // Generate progress data for the last 6 months
            const progressData = this.generateProgressData();
            initializeProgressChart(progressData);

            // Fetch exam results by subject
            const resultsResponse = await fetch('http://localhost/E-Learning/backend/exam_results.php');
            if (!resultsResponse.ok) throw new Error('Failed to fetch exam results');
            const resultsData = await resultsResponse.json();
            
            // Group results by subject
            const subjectResults = {};
            if (resultsData.all_results) {
                resultsData.all_results.forEach(result => {
                    const subject = result.course_name;
                    if (!subjectResults[subject]) {
                        subjectResults[subject] = {
                            total: 0,
                            count: 0
                        };
                    }
                    subjectResults[subject].total += result.score;
                    subjectResults[subject].count++;
                });
            }

            // Calculate averages
            const chartData = {
                labels: Object.keys(subjectResults),
                values: Object.values(subjectResults).map(result => result.total / result.count)
            };

            initializeResultsChart(chartData);
        } catch (error) {
            console.error('Error loading chart data:', error);
            showToast('Failed to load chart data', 'error');
            
            // Initialize charts with default data
            initializeProgressChart({
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                values: [0, 0, 0, 0, 0, 0]
            });

            initializeResultsChart({
                labels: ['No Data'],
                values: [0]
            });
        } finally {
            hideLoadingState('dashboard');
        }
    }

    generateProgressData() {
        const months = [];
        const values = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push(date.toLocaleString('default', { month: 'short' }));
            
            // Generate random progress values between 0 and 100
            // In a real application, this would come from the backend
            const progress = Math.floor(Math.random() * 100);
            values.push(progress);
        }
        
        return {
            labels: months,
            values: values
        };
    }

    //////////////////////////////////////// Courses Management /////////////////////////////////////
    async loadCourses() {
        const data = await this.fetchData("http://localhost/E-Learning/backend/enrollments.php");
        if (data && data.status === "success") {
            this.updateCoursesUI(data.courses, "coursesContainer1");
            this.updateCoursesUI(data.courses, "coursesContainer2");
        } else {
            console.error("Error loading courses");
            this.showError("coursesContainer1", "Failed to load courses. Please try again.");
        }
    }

    updateCoursesUI(courses, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = courses.length
            ? courses.map(course => this.createCourseCard(course)).join("")
            : `<p class="text-center text-muted">No courses available</p>`;
    }

    createCourseCard(course) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card course-card shadow-lg border-0 rounded-4 h-100 overflow-hidden">
                    <div class="card-header-course position-relative">
                        <img src="${course.urlIMG || 'IMG/math.jpg'}" class="card-img-top course-img" alt="Course Thumbnail">
                        <span class="badge bg-success position-absolute top-0 end-0 m-2">Ongoing</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary fw-bold">${course.CourseName}</h5>
                        <div class="course-meta text-muted">
                            <i class="fas fa-user-tie"></i> Prof. ${course.TeacherName}
                        </div>
                        <div class="course-meta text-muted">
                            <i class="fas fa-users"></i> ${course.SectionName || 'No Section'}
                        </div>
                        <div class="course-meta text-muted">
                            <i class="fas fa-calendar"></i> ${course.AcademicYear || 'No Year'}
                        </div>
                        <p class="card-text flex-grow-1">${course.Description || 'No description available'}</p>
                        <div class="mt-auto">
                            <a href="#" class="btn btn-sm sidebar-link" onclick="studentDashboard.handleMaterials(${course.CourseID})">
                                <i class="fas fa-file-alt"></i> Materials
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    handleMaterials(courseId) {
        localStorage.setItem("selectedCourseId", courseId);
        this.showSection('CourseMaterials');
        this.loadCourseMaterials();
    }

    showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            console.error("Element with ID '" + sectionId + "' not found.");
        }
    }

    //////////////////////////////////////// Course Materials /////////////////////////////////////
    async loadCourseMaterials() {
        const courseId = localStorage.getItem("selectedCourseId");
        if (!courseId) {
            console.error("Course ID not found.");
            this.showError("lessonsContainer", "Course information is missing");
            return;
        }
        
        const data = await this.fetchData(`http://localhost/E-Learning/backend/course_material.php?course_id=${courseId}`);
        if (data && data.course) {
            this.renderCourseMaterials(data);
        } else {
            console.error("Error loading course materials", data);
            this.showError("lessonsContainer", "Failed to load course materials");
        }
    }

    renderCourseMaterials(data) {
        // Update Course Header
        this.updateElementContent('courseTitle', data.course.name);
        this.updateElementContent('totalLessons', `<i class="fas fa-book-open me-2"></i>${data.course.stats.total_lessons} Lessons`);
        this.updateElementContent('totalQuizzes', `<i class="fas fa-question-circle me-2"></i>${data.course.stats.total_quizzes} Quizzes`);
        this.updateElementContent('courseDuration', `<i class="fas fa-clock me-2"></i>${data.course.stats.total_duration}`);

        // Update Progress
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${data.progress.percentage}%`;
            progressBar.textContent = `${data.progress.percentage}%`;
        }
        this.updateElementContent('completedLessons', `${data.progress.completed_lessons}/${data.course.stats.total_lessons}`);
        this.updateElementContent('completedQuizzes', `${data.progress.completed_quizzes}/${data.course.stats.total_quizzes}`);

        // Update Sidebar Navigation
        const lessonsNav = document.getElementById('lessonsNavigation');
        if (lessonsNav) {
            lessonsNav.innerHTML = data.lessons.map((lesson, index) => `
                <a href="#" class="list-group-item list-group-item-action lesson-nav-item ${index === 0 ? 'active' : ''}" 
                   data-lesson-id="${lesson.id}" onclick="studentDashboard.showLessonContent('${lesson.id}')">
                    <i class="${lesson.is_completed ? 'fas' : 'far'} fa-play-circle me-2"></i>
                    ${lesson.title}
                </a>
            `).join('');
        }

        // Store lessons data
        localStorage.setItem('courseLessons', JSON.stringify(data.lessons));

        // Show first lesson
        if (data.lessons.length > 0) {
            this.showLessonContent(data.lessons[0].id);
        }
    }

    updateElementContent(id, content) {
        const element = document.getElementById(id);
        if (element) element.innerHTML = content;
    }

    showLessonContent(lessonId) {
        const lessons = JSON.parse(localStorage.getItem('courseLessons'));
        const lesson = lessons?.find(l => l.id == lessonId);
        
        if (!lesson) {
            console.error("Lesson not found");
            return;
        }

        const lessonsContainer = document.getElementById('lessonsContainer');
        if (!lessonsContainer) return;

        lessonsContainer.innerHTML = `
            <div class="lesson-card mb-4">
                <div class="lesson-header p-3 rounded-top d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="mb-0">${lesson.title}</h4>
                        <p class="text-muted mb-0 mt-1">${lesson.sections} Sections • ${lesson.duration}</p>
                    </div>
                    ${lesson.is_completed ? 
                        '<span class="badge bg-success">Completed <i class="fas fa-check-circle ms-2"></i></span>' : ''}
                </div>
                <div class="lesson-content p-3 border">
                    <div class="learning-material mb-4">
                        <div class="d-flex align-items-center mb-3">
                            <i class="fas fa-video me-3 text-primary"></i>
                            <h5 class="mb-0">Video Tutorial</h5>
                            <span class="ms-3 text-muted">${lesson.duration}</span>
                        </div>
                        <div class="video-container bg-dark rounded ratio ratio-16x9">
                            ${lesson.video_url ? 
                                `<iframe src="https://www.youtube.com/embed/${this.extractYouTubeId(lesson.video_url)}" 
                                        frameborder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowfullscreen></iframe>` :
                                '<button class="btn btn-lg btn-play"><i class="fas fa-play text-white"></i></button>'}
                        </div>
                    </div>
                    ${lesson.quizzes?.length > 0 ? this.renderQuizSection(lesson.quizzes) : ''}
                </div>
            </div>`;
        
        // Highlight active lesson in sidebar
        document.querySelectorAll('.lesson-nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-lesson-id') == lessonId) {
                item.classList.add('active');
            }
        });
    }

    extractYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    renderQuizSection(quizzes) {
        // Filter out quizzes with no questions
        const validQuizzes = quizzes.filter(quiz => quiz.QuestionCount > 0);
        
        if (validQuizzes.length === 0) {
            return `
                <div class="quizzes-section">
                    <h5 class="mb-3"><i class="fas fa-question-circle me-2 text-warning"></i>Lesson Quizzes</h5>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> No quizzes available for this lesson.
                    </div>
                </div>`;
        }

        return `
            <div class="quizzes-section">
                <h5 class="mb-3"><i class="fas fa-question-circle me-2 text-warning"></i>Lesson Quizzes</h5>
                ${validQuizzes.map(quiz => `
                    <div class="quiz-card mb-3 p-3 border rounded">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">${quiz.QuizName}</h6>
                                <p class="text-muted mb-0">${quiz.QuestionCount || 0} questions</p>
                                ${quiz.is_completed ? 
                                    `<p class="text-success mb-0"><i class="fas fa-check-circle me-1"></i>Completed (${quiz.score}%)</p>` : 
                                    ''}
                            </div>
                            <div>
                                ${quiz.is_completed ? 
                                    `<button class="btn btn-secondary btn-sm" disabled>
                                        <i class="fas fa-check-circle me-1"></i>Completed
                                    </button>` :
                                    `<button class="btn btn-primary btn-sm take-quiz-btn" data-quiz-id="${quiz.QuizID}">
                                        Take Quiz <i class="fas fa-arrow-right ms-2"></i>
                                    </button>`
                                }
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    }
    
    //////////////////////////////////////// Quiz Management /////////////////////////////////////
    async startQuiz(quizId) {
        try {
            const data = await this.fetchData(
                `http://localhost/E-Learning/backend/take_quiz.php?quiz_id=${quizId}`
            );
            
            if (data && data.status === "success") {
                this.showQuizView(data.quiz, data.questions);
            } else if (data && data.message === "Quiz not available or already completed") {
                // Show a message that the quiz has already been completed
                this.showToast('You have already completed this quiz.', 'info');
                
                // Optionally show the previous score if available
                if (data.previousScore) {
                    this.showToast(`Your previous score: ${data.previousScore}%`, 'info');
                }
            } else {
                throw new Error(data?.message || "Error loading quiz");
            }
        } catch (error) {
            console.error("Error starting quiz:", error);
            this.showToast(error.message, 'error');
        }
    }

    showQuizView(quiz, questions) {
        // Hide the current lesson content
        document.getElementById('lessonsContainer').style.display = 'none';
        
        // Create and show quiz container
        const quizContainer = document.createElement('div');
        quizContainer.id = 'quizView';
        quizContainer.className = 'quiz-container p-4 border rounded';
        quizContainer.innerHTML = `
            <div class="quiz-header mb-4">
                <h3 class="text-primary">${quiz.QuizName}</h3>
                <p class="text-muted">Please answer all questions</p>
                <hr>
            </div>
            <form id="quizForm">
                <div id="quizQuestionsContainer"></div>
                <div class="d-flex justify-content-between mt-4">
                    <button type="button" class="btn btn-secondary" id="backToLesson">
                        <i class="fas fa-arrow-left me-2"></i> Back to Lesson
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Submit Quiz <i class="fas fa-check ms-2"></i>
                    </button>
                </div>
            </form>
        `;
        
        // Insert the quiz container after the lessons container
        const lessonsContainer = document.getElementById('lessonsContainer');
        lessonsContainer.parentNode.insertBefore(quizContainer, lessonsContainer.nextSibling);

        // Display questions
        const questionsContainer = document.getElementById('quizQuestionsContainer');
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question mb-4 p-3 border rounded';
            questionDiv.innerHTML = this.createQuizQuestionHtml(question, index);
            questionsContainer.appendChild(questionDiv);
        });

        // Back button event
        document.getElementById('backToLesson').addEventListener('click', () => {
            quizContainer.remove();
            document.getElementById('lessonsContainer').style.display = 'block';
        });

        // Form submission event
        document.getElementById('quizForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitQuiz(quiz.QuizID);
        });
    }

    createQuizQuestionHtml(question, index) {
        return `
            <div class="question mb-4 p-3 border rounded">
                <h5 class="mb-3">Question ${index + 1}: ${this.escapeHtml(question.QuestionText)}</h5>
                <div class="answers ps-3">
                    ${question.answers.map(answer => `
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" 
                                   name="answers[${this.escapeHtml(question.QuestionID)}]" 
                                   id="quiz_answer_${this.escapeHtml(answer.AnswerID)}" 
                                   value="${this.escapeHtml(answer.AnswerID)}" required>
                            <label class="form-check-label" for="quiz_answer_${this.escapeHtml(answer.AnswerID)}">
                                ${this.escapeHtml(answer.AnswerText)}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }

    async submitQuiz(quizId) {
        const form = document.getElementById('quizForm');
        const answers = {};
        
        // Collect selected answers
        const selectedAnswers = form.querySelectorAll('input[type="radio"]:checked');
        
        if (selectedAnswers.length === 0) {
            alert("Please answer at least one question before submitting");
            return;
        }

        selectedAnswers.forEach(answer => {
            const questionId = answer.name.match(/answers\[(\d+)\]/)[1];
            answers[questionId] = answer.value;
        });

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

            const result = await fetch('http://localhost/E-Learning/backend/submit_quiz.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quiz_id: quizId,
                    answers: answers
                })
            });

            const data = await result.json();

            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Quiz';

            if (data.status === 'success') {
                alert(`Quiz submitted successfully! Score: ${data.score}%`);
                
                // Remove quiz view and show lesson content
                document.getElementById('quizView').remove();
                document.getElementById('lessonsContainer').style.display = 'block';
                
                // Refresh course materials to update progress
                this.loadCourseMaterials();
            } else {
                throw new Error(data.message || 'Error submitting quiz');
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    }

    //////////////////////////////////////// Exams Management /////////////////////////////////////
    async loadExams() {
        try {
            const data = await this.fetchData("http://localhost/E-Learning/backend/exams.php");
            if (data && data.status === "success") {
                this.updateExamsTable(data.exams);
            } else {
                throw new Error(data?.message || "Failed to load exams");
            }
        } catch (error) {
            console.error("Error loading exams:", error);
            this.showErrorMessage("examTableBody", error.message);
        }
    }

    updateExamsTable(exams) {
        const tableBody = document.getElementById("examTableBody");
        if (!tableBody) return;

        tableBody.innerHTML = exams.length
            ? exams.map(exam => this.createExamRow(exam)).join("")
            : `<tr><td colspan="5" class="text-center text-muted">No exams available</td></tr>`;
        
        // Add event listeners to Take Exam buttons
        document.querySelectorAll('.take-exam-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const examId = btn.getAttribute('data-exam-id');
                this.startExam(examId);
            });
        });
    }

    createExamRow(exam) {
        const hasTaken = exam.Score >= 0;
        const actionBtn = hasTaken 
            ? `<button class="btn btn-sm btn-secondary" disabled>Completed (${exam.Score}%)</button>`
            : `<button class="btn btn-sm btn-primary take-exam-btn" data-exam-id="${exam.ExamID}">Take Exam</button>`;
        
        return `
            <tr>
                <td>${exam.ExamTitle}</td>
                <td>${exam.CourseName}</td>
                <td>${this.formatDate(exam.ExamCreateDate)}</td>
                <td>${exam.Duration}</td>
                <td>${actionBtn}</td>
            </tr>`;
    }

    async startExam(examId) {
        try {
            const data = await this.fetchData(`http://localhost/E-Learning/backend/take_exam.php?exam_id=${examId}`);
            
            if (data && data.status === "success") {
                this.showExamView(data.exam, data.questions);
            } else {
                throw new Error(data?.message || "Error loading exam");
            }
        } catch (error) {
            console.error("Error starting exam:", error);
            alert(error.message);
        }
    }

    showExamView(exam, questions) {
        // Hide exams list and show exam form
        document.getElementById('exams').style.display = 'none';
        const examView = document.getElementById('examView');
        examView.style.display = 'block';

        // Fill exam info
        document.getElementById('examTitle').textContent = exam.ExamName;
        document.getElementById('examDuration').textContent = exam.Duration;

        // Display questions
        const container = document.getElementById('examQuestionsContainer');
        container.innerHTML = '';
        
        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question mb-4 p-3 border rounded';
            questionDiv.innerHTML = this.createQuestionHtml(question, index);
            container.appendChild(questionDiv);
        });

        // Back button event
        document.getElementById('backToExams').onclick = () => {
            examView.style.display = 'none';
            document.getElementById('exams').style.display = 'block';
        };

        // Form submission event
        document.getElementById('examForm').onsubmit = (e) => {
            e.preventDefault();
            this.submitExam(exam.ExamID);
        };
    }

    createQuestionHtml(question, index) {
        return `
            <div class="question mb-4 p-3 border rounded">
                <h5 class="mb-3">Question ${index + 1}: ${this.escapeHtml(question.QuestionText)}</h5>
                <div class="answers ps-3">
                    ${question.answers.map(answer => `
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="radio" 
                                   name="answers[${this.escapeHtml(question.QuestionID)}]" 
                                   id="answer_${this.escapeHtml(answer.AnswerID)}" 
                                   value="${this.escapeHtml(answer.AnswerID)}" required>
                            <label class="form-check-label" for="answer_${this.escapeHtml(answer.AnswerID)}">
                                ${this.escapeHtml(answer.AnswerText)}
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>`;
    }

    async submitExam(examId) {
        if (!examId) {
            alert("Exam identification error, please try again");
            return;
        }

        const form = document.getElementById('examForm');
        const answers = {};
        
        // Collect selected answers
        const selectedAnswers = form.querySelectorAll('input[type="radio"]:checked');
        
        if (selectedAnswers.length === 0) {
            alert("Please answer the exam questions first");
            return;
        }

        selectedAnswers.forEach(answer => {
            const questionId = answer.name.match(/answers\[(\d+)\]/)[1];
            answers[questionId] = answer.value;
        });

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

            const result = await fetch('http://localhost/E-Learning/backend/submit_exam.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    exam_id: examId,
                    answers: answers
                })
            });

            const data = await result.json();

            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Exam';

            if (data.status === 'success') {
                alert(`Exam submitted successfully! Score: ${data.percentage} %`);
                // Return to exams list
                document.getElementById('examView').style.display = 'none';
                document.getElementById('exams').style.display = 'block';
                // Refresh exams list
                this.loadExams();
            } else {
                throw new Error(data.message || 'Error submitting exam');
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    }

    //////////////////////////////////////// Exam Results /////////////////////////////////////
    async fetchExamResults() {
        const data = await this.fetchData("http://localhost/E-Learning/backend/exam_results.php");
        if (data && data.status === "success") {
            this.updateResultsTable(data.all_results);
        } else {
            console.error("Error loading exam results");
            this.showError("resultsTableBody", "Failed to load exam results");
        }
    }

    updateResultsTable(results) {
        const tableBody = document.getElementById("resultsTableBody");
        if (!tableBody) return;

        tableBody.innerHTML = results.length
            ? results.map(result => this.createResultRow(result)).join("")
            : `<tr><td colspan="5" class="text-center text-muted">No exam results available</td></tr>`;
    }

    createResultRow(result) {
        return `
            <tr>
                <td>${result.exam_name ?? result.quiz_name}</td>
                <td>${result.course_name}</td>
                <td>${this.formatDate(result.date)}</td>
                <td>${result.score}%</td>
                <td>${this.getStatusBadge(result.score)}</td>
            </tr>`;
    }

    //////////////////////////////////////// Helper Methods /////////////////////////////////////
    getStatusBadge(score) {
        if (score >= 85) return `<span class="badge bg-success">Excellent</span>`;
        if (score >= 60) return `<span class="badge bg-warning">Needs Improvement</span>`;
        return `<span class="badge bg-danger">Failed</span>`;
    }

    formatDate(dateString) {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    escapeHtml(unsafe) {
        return unsafe?.toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;") || '';
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error("Container not found:", containerId);
            return;
        }
        
        container.innerHTML = `
            <div class="alert alert-danger d-flex align-items-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <div>
                    <h6 class="alert-heading mb-1">Error</h6>
                    <p class="mb-0">${message}</p>
                </div>
                <button class="btn-close ms-auto" onclick="this.parentElement.remove()"></button>
            </div>
        `;
        
        // Scroll to the error message
        container.scrollIntoView({ behavior: 'smooth' });
    }

    showErrorMessage(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${message}</td></tr>`;
        }
    }

    //////////////////////////////////////// All Courses Management /////////////////////////////////////
    async loadAllCourses() {
        try {
            const container = document.getElementById('allCoursesContainer');
            if (!container) return;
            
            // Show loading state
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2">Loading courses...</p>
                </div>
            `;
            
            const response = await fetch('http://localhost/E-Learning/backend/all_courses.php');
            const data = await response.json();
            
            if (data.success === true) {
                this.displayAllCourses(data.data);
            } else {
                this.showError('Failed to load courses: ' + data.message);
            }
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showError('Failed to load courses. Please try again later.');
        }
    }

    // Display all available courses
    displayAllCourses(courses) {
        const container = document.getElementById('allCoursesContainer');
        if (!container) return;
        
        if (courses.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted">No courses available at the moment.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = courses.map(course => this.createAllCourseCard(course)).join('');
        
        // Add event listeners to enroll buttons
        document.querySelectorAll('.enroll-btn').forEach(button => {
            button.addEventListener('click', () => {
                const courseId = button.getAttribute('data-course-id');
                this.enrollInCourse(courseId);
            });
        });
    }

    // Create a course card HTML for all courses
    createAllCourseCard(course) {
        return `
            <div class="col-md-4 mb-4">
                <div class="card course-card shadow-lg border-0 rounded-4 h-100 overflow-hidden">
                    <div class="card-header-course position-relative">
                        <img src="${course.image || 'IMG/math.jpg'}" class="card-img-top course-img" alt="Course Thumbnail">
                        <span class="badge bg-primary position-absolute top-0 end-0 m-2">Available</span>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary fw-bold">${course.name}</h5>
                        <div class="course-meta text-muted">
                            <i class="fas fa-user-tie"></i> Prof. ${course.teacher || 'Unknown'}
                        </div>
                        <div class="course-meta text-muted">
                            <i class="fas fa-users"></i> ${course.section || 'All Sections'}
                        </div>
                        <div class="course-meta text-muted">
                            <i class="fas fa-calendar"></i> ${course.year || 'All Years'}
                        </div>
                        <p class="card-text flex-grow-1">${course.description || 'No description available'}</p>
                        <div class="mt-auto">
                            <button class="btn btn-primary w-100 enroll-btn" data-course-id="${course.id}">
                                <i class="fas fa-plus-circle me-2"></i> Enroll Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Enroll in a course
    async enrollInCourse(courseId) {
        try {
            const formData = new FormData();
            formData.append('course_id', courseId);
            
            const response = await fetch('http://localhost/E-Learning/backend/enroll_course.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                this.showToast('Successfully enrolled in the course!', 'success');
                
                // Update the button to show enrolled status
                const button = document.querySelector(`.enroll-btn[data-course-id="${courseId}"]`);
                if (button) {
                    button.disabled = true;
                    button.innerHTML = '<i class="fas fa-check-circle me-2"></i> Enrolled';
                    button.classList.remove('btn-primary');
                    button.classList.add('btn-success');
                }
                
                // Refresh enrolled courses
                this.loadCourses();
            } else {
                this.showToast(data.message || 'Failed to enroll in the course.', 'error');
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            this.showToast('Failed to enroll in the course. Please try again later.', 'error');
        }
    }

    // Show toast notification
    showToast(message, type = 'success') {
        showToast(message, type);
    }

    // Show error message
    showError(message) {
        const container = document.getElementById('allCoursesContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i> ${message}
                </div>
            </div>
        `;
    }

    // Setup search functionality for all courses
    setupSearchFunctionality() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        
        if (searchInput && searchButton) {
            // Search on button click
            searchButton.addEventListener('click', () => {
                this.filterCourses(searchInput.value);
            });
            
            // Search on Enter key
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.filterCourses(searchInput.value);
                }
            });
        }
    }
    
    // Filter courses based on search input
    filterCourses(searchTerm) {
        const container = document.getElementById('allCoursesContainer');
        if (!container) return;
        
        const courseCards = container.querySelectorAll('.col-md-4');
        
        courseCards.forEach(card => {
            const courseName = card.querySelector('.card-title').textContent.toLowerCase();
            const courseDescription = card.querySelector('.card-text').textContent.toLowerCase();
            const searchTermLower = searchTerm.toLowerCase();
            
            if (courseName.includes(searchTermLower) || courseDescription.includes(searchTermLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Create an instance of the StudentDashboard class
const studentDashboard = new StudentDashboard();

// تحميل بيانات الملف الشخصي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إعداد معالج لرفع الصورة
    const profileImageUpload = document.getElementById('profileImageUpload');
    if (profileImageUpload) {
        profileImageUpload.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                uploadProfileImage(e.target.files[0]);
            }
        });
    }
    
    // إضافة مستمع لحدث النقر على روابط القائمة الجانبية
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const section = this.getAttribute('data-section');
            if (section === 'profile') {
                // تحميل بيانات الملف الشخصي عند فتح قسم الملف الشخصي
                setTimeout(loadProfileData, 300);
                
            } else if (section === 'all-courses') {
                // تحميل جميع الكورسات المتاحة عند فتح قسم الكورسات المتاحة
                studentDashboard.loadAllCourses();
            }
        });
    });
    
    // إضافة مستمع لحدث النقر على روابط التبويب
    document.querySelectorAll('.nav-link[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            if (e.target.getAttribute('href') === '#profile-tab') {
                // إعادة تحميل بيانات الملف الشخصي عند التبديل إلى تبويب الملف الشخصي
                loadProfileData();
            }
        });
    });
});

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
        };
        
        // console.log(elements);

        // تحديث قيم العناصر فقط إذا كانت موجودة
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        });
        
        // تعيين صورة الملف الشخصي في قسم البروفايل
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
            navImg.src = data.imageUrl || 'http://bootdey.com/img/Content/avatar/avatar1.png';
        }
    })
    .catch(error => {
        console.error('Error loading profile data:', error);
        showToast('Failed to load profile data: ' + error.message, 'error');
    });
}

// حفظ التغييرات على الملف الشخصي شغاله تمام
function saveProfileChanges() {
    const profileData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        bio: document.getElementById('bio').value
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

// شغاله تمام
function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    fetch('http://localhost/E-Learning/backend/profile_api.php', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || 'Network response was not ok') });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            const imagePath = 'http://localhost/E-Learning/IMG/' + data.imageUrl;
            // تحديث صورة الملف الشخصي في قسم البروفايل
           const profilePic = document.getElementById('profilePicture');
if (profilePic) profilePic.src = imagePath;

const sProfilePic = document.getElementById('sprofilePicture');
if (sProfilePic) sProfilePic.src = imagePath;

            showToast(data.message || 'Profile picture updated successfully!');
        } else {
            throw new Error(data.error || 'Failed to upload image');
        }
    })
    .catch(error => {
    console.error('Error uploading profile image:', error);
    alert('Upload failed: ' + error.message); // لعرض الخطأ للمستخدم مباشرة
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

// Add CSS for loading overlay and toast notifications
const style = document.createElement('style');
style.textContent = `
    .loading {
        position: relative;
        pointer-events: none;
    }
    
    .loading::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
        z-index: 1;
    }
    
    .loading::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 30px;
        height: 30px;
        margin: -15px 0 0 -15px;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-top-color: #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 2;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: #333;
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .toast.success {
        background: #4CAF50;
    }
    
    .toast.error {
        background: #F44336;
    }
    
    .toast.warning {
        background: #FF9800;
    }
    
    .toast.info {
        background: #2196F3;
    }
`;
document.head.appendChild(style);