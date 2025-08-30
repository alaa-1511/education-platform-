// Handle Login Form Submit
document.getElementById('sumbitLogin').addEventListener('click', function(e) {
    e.preventDefault();
    // جمع بيانات النموذج
    const email = document.getElementById('Email').value; 
    const password = document.getElementById('password').value;
    // إعداد البيانات لإرسالها مع طلب الـ fetch
    const formData = {
        username: email,
        password: password
    };
    fetch('http://localhost/E-Learning/backend/admin/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        console.log('Response Status:', response.status);
        return response.text();
    })
    .then(data => {
        console.log('Response Data:', data);  
        try {
            const jsonData = JSON.parse(data);
            console.log('Parsed Data:', jsonData);
            if (jsonData.status === "success") {
                alert(jsonData.message);
                localStorage.setItem('username', jsonData.user_id);
                localStorage.setItem('auth_token', jsonData.auth_token);
                localStorage.setItem('role', jsonData.role);
                if (jsonData.role === "Student") {
                    window.location.href = '../StudentDash.html';
                } else if (jsonData.role === "Teacher") {
                    window.location.href = '../TeacherDash.html';
                } else if (jsonData.role === "A==") {
                    window.location.href = '../admin-dashboard.html';
                }
            } else {
                console.log('Login error:', jsonData.message);
                alert('Login failed: ' + jsonData.message);
            }
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('errorMessage').innerText = 'An error occurred, please try again.';
        document.getElementById('errorMessage').classList.remove('d-none');
    });
});

// تحميل الأقسام عند تغيير السنة الدراسية
document.getElementById('academicYearRegister').addEventListener('change', function() {
    const academicYear = this.value;
    if (academicYear) {
        loadSections(academicYear);
    } else {
        document.getElementById('sectionRegister').innerHTML = '<option value="">Select Section</option>';
    }
});

// تحميل الأقسام المتاحة للسنة الدراسية المحددة
function loadSections(academicYear) {
    fetch(`http://localhost/E-Learning/backend/admin/validate_section.php?academic_year=${academicYear}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const sectionSelect = document.getElementById('sectionRegister');
                sectionSelect.innerHTML = '<option value="">اختر الشعبة</option>';
                
                // Add sections directly without grouping
                data.sections.forEach(section => {
                    const option = document.createElement('option');
                    option.value = section.SectionID;
                    option.textContent = `شعبة ${section.SectionName}`;
                    sectionSelect.appendChild(option);
                });
            } else {
                console.error('Error loading sections:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// إظهار/إخفاء حقول القسم والسنة الدراسية بناءً على الدور المحدد
document.getElementById('roleRegister').addEventListener('change', function() {
    const role = this.value;
    const sectionContainer = document.getElementById('sectionContainer');
    const academicYearContainer = document.getElementById('academicYearContainer');
    
    if (role === 'Student') {
        sectionContainer.style.display = 'block';
        academicYearContainer.style.display = 'block';
    } else {
        sectionContainer.style.display = 'none';
        academicYearContainer.style.display = 'none';
    }
});

document.getElementById('submitRegister').addEventListener('click', function(e) {
    e.preventDefault();

    // Collect form data
    const username = document.getElementById('useNameregister').value;
    const email = document.getElementById('emailregister').value;
    const password = document.getElementById('passwordregister').value;
    const role = document.getElementById('roleRegister').value;
    const section_id = document.getElementById('sectionRegister').value;
    const academic_year = document.getElementById('academicYearRegister').value;

    // Validate inputs
    if (username === "" || email === "" || password === "") {
        document.getElementById('errorMessageregister').innerText = 'Please fill in all fields.';
        document.getElementById('errorMessageregister').classList.remove('d-none');
        return;
    }

    // Validate section and academic year for students
    if (role === 'Student' && (!section_id || !academic_year)) {
        document.getElementById('errorMessageregister').innerText = 'Please select both section and academic year.';
        document.getElementById('errorMessageregister').classList.remove('d-none');
        return;
    }

    // Simple email validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        document.getElementById('errorMessageregister').innerText = 'Please enter a valid email address.';
        document.getElementById('errorMessageregister').classList.remove('d-none');
        return;
    }

    // Hide error message if all fields are valid
    document.getElementById('errorMessageregister').classList.add('d-none');

    // Show loading spinner
    document.getElementById('spinner').classList.add('show');

    // Create the data object as JSON
    const formData = {
        username: username,
        email: email,
        password: password,
        role: role,
        section_id: section_id || null,
        academic_year: academic_year || null
    };

    // Send registration request to API
    fetch('http://localhost/E-Learning/backend/admin/signup.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        // First check if the response is OK (status 200-299)
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(text || 'Network response was not ok');
            });
        }
        return response.json();
    })
    .then(data => {
        // Hide loading spinner
        document.getElementById('spinner').classList.remove('show');
    
        // Handle response
        if (data.status === "success") {
            alert(data.message);
            // Redirect to login page after successful registration
            window.location.href = 'login.html';
        } else {
            document.getElementById('errorMessageregister').innerText = data.message;
            document.getElementById('errorMessageregister').classList.remove('d-none');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('spinner').classList.remove('show');
        document.getElementById('errorMessageregister').innerText = 'An error occurred: ' + error.message;
        document.getElementById('errorMessageregister').classList.remove('d-none');
    });
});
