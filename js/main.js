// ========== Sidebar Toggle ==========
function initSidebarToggle() {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      // Update localStorage to persist the state
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // Check localStorage on page load
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      sidebar.classList.add('collapsed');
    }
  }
}

// ========== Theme Management ==========
function toggleRootClass() {
  const current = document.documentElement.getAttribute("data-bs-theme");
  const inverted = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", inverted);
}

function toggleLocalStorage() {
  if (isLightTheme()) {
    localStorage.removeItem("light");
  } else {
    localStorage.setItem("light", "set");
  }
}

function isLightTheme() {
  return localStorage.getItem("light");
}

function initializeTheme() {
  if (isLightTheme()) {
    toggleRootClass();
  }

  document.querySelector(".theme-toggle").addEventListener("click", () => {
    toggleLocalStorage();
    toggleRootClass();
  });
}

// ========== Initialize Dashboard ==========
function initializeDashboard() {
  const dashboardSection = document.getElementById("dashboard");
  if (dashboardSection) {
    dashboardSection.style.display = "block";
    dashboardSection.classList.add("active");
    document
        .querySelector('.sidebar-link[data-section="dashboard"]')
        .classList.add("active");
  }
}

// ========== Sidebar Section Navigation ==========
function setupSectionNavigation() {
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const targetSection = this.getAttribute("data-section");

      if (!targetSection) {
        console.error("The data-section attribute is missing for this link.");
        return;
      }

      // Handle logout separately
      if (targetSection === 'logout') {
        logout();
        return;
      }

      localStorage.setItem("activeSection", targetSection);

      sidebarLinks.forEach((link) => link.classList.remove("active"));

      this.classList.add("active");

      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
        section.classList.remove("active");
      });

      const sectionToShow = document.getElementById(targetSection);
      if (sectionToShow) {
        sectionToShow.style.display = "block";
        sectionToShow.classList.add("active");
      } else {
        console.error("Section not found:", targetSection);
      }
    });
  });
}

// ========== Initialize Active Section from Local Storage ==========
function initializeActiveSection() {
  const savedSection = localStorage.getItem("activeSection");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  if (savedSection) {
    const activeLink = document.querySelector(
        `.sidebar-link[data-section="${savedSection}"]`
    );
    const activeSection = document.getElementById(savedSection);

    if (activeLink && activeSection) {
      sidebarLinks.forEach((link) => link.classList.remove("active"));
      activeLink.classList.add("active");

      document.querySelectorAll(".section").forEach((section) => {
        section.style.display = "none";
        section.classList.remove("active");
      });
      activeSection.style.display = "block";
      activeSection.classList.add("active");
    } else {
      console.error("Saved section does not exist:", savedSection);
    }
  } else {
    initializeDashboard();
  }
}

// ========== Logout Function ==========
function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  window.location.href = '../../../E-Learning/learning/login.html';
}

// ========== Main Initialization Function ==========
document.addEventListener("DOMContentLoaded", function () {
  initSidebarToggle();
  initializeTheme();
  initializeActiveSection();
  setupSectionNavigation();
});
