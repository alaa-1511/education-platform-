createCourseCard(course) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card course-card shadow-lg border-0 rounded-4 h-100 overflow-hidden">
                <div class="card-header-course position-relative">
                    <img src="${course.urlIMG}" class="card-img-top course-img" alt="Course Thumbnail">
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
                    <p class="card-text flex-grow-1">${course.Description}</p>
                    <div class="mt-auto">
                        <a href="#" class="btn btn-sm sidebar-link" onclick="studentDashboard.handleMaterials(${course.CourseID})">
                            <i class="fas fa-file-alt"></i> Materials
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
} 