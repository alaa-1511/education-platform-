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
        document.getElementById('username').value = data.username || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('firstName').value = data.firstName || '';
        document.getElementById('lastName').value = data.lastName || '';
        document.getElementById('bio').value = data.bio || '';
        
        // إضافة معلومات القسم والسنة الدراسية
        if (data.section) {
            document.getElementById('section').value = data.section.SectionName || '';
            document.getElementById('gradeLevel').value = data.section.GradeLevel || '';
        }
        document.getElementById('academicYear').value = data.academicYear || '';
        
        // تعيين صورة الملف الشخصي
        const profileImg = document.getElementById('profilePicture');
        profileImg.src = data.profilePicture || 'http://bootdey.com/img/Content/avatar/avatar1.png';
    })
    .catch(error => {
        console.error('Error loading profile data:', error);
        alert('Failed to load profile data. Please try again.');
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
        section_id: document.getElementById('section').value,
        academic_year: document.getElementById('academicYear').value
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
            alert('Profile updated successfully!');
            loadProfileData(); // إعادة تحميل البيانات للتأكد من التحديث
        } else {
            throw new Error(data.error || 'Failed to update profile');
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile: ' + error.message);
    });
} 