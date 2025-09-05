// Book Club App - Modernized State Management and Event Handling
// --- State Management ---
const STORAGE_KEYS = {
  users: "users",
  clubs: "clubs",
  discussions: "discussions",
  meetings: "meetings",
  progress: "progress",
  adminActivity: "adminActivity",
  currentUserId: "currentUserId",
  lastSection: "lastSection",
  lastMeetingClubId: "lastMeetingClubId", // <-- Add a key for last selected meeting club
  lastDiscussionClubId: "lastDiscussionClubId", // <-- Add a key for last selected discussion club
  lastProgressClubId: "lastProgressClubId", // <-- Add a key for last selected progress club
};

let currentUser = null;
let users = [];
let clubs = [];
let discussions = [];
let meetings = [];
let progress = [];
let adminActivity = [];

// --- Utility: Save/Load ---
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Date Validation Utility ---
function setMinDateTime(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    // Get current date and time
    const now = new Date();
    // Format to YYYY-MM-DDTHH:MM (required format for datetime-local)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    input.min = minDateTime;

    // Don't automatically set the current value - let the user choose
    // This allows the form to clear properly after submission

    // Add input event listener to validate on change
    if (!input._dateValidationBound) {
      input.addEventListener("input", function () {
        const selectedDate = new Date(this.value);
        const currentDate = new Date();

        if (selectedDate <= currentDate) {
          this.setCustomValidity("Please select a future date and time");
        } else {
          this.setCustomValidity("");
        }
      });
      input._dateValidationBound = true;
    }
  }
}

// --- Prevent Past Date Selection ---
function preventPastDates() {
  // Set minimum date for new meeting form
  setMinDateTime("meetingDate");

  // Set minimum date for edit meeting form
  setMinDateTime("editMeetingDate");
}

// --- Clear Date Inputs ---
function clearDateInputs() {
  const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
  dateInputs.forEach((input) => {
    input.value = "";
  });
}

// --- Continuous Date Validation ---
function startContinuousDateValidation() {
  // Update minimum dates every minute to ensure they stay current
  setInterval(() => {
    preventPastDates();
  }, 60000); // 60000ms = 1 minute
}

// --- Form Date Validation ---
function validateFormDates(formId) {
  const form = document.getElementById(formId);
  if (!form) return true;

  const dateInputs = form.querySelectorAll('input[type="datetime-local"]');
  let isValid = true;

  dateInputs.forEach((input) => {
    if (input.value) {
      const selectedDate = new Date(input.value);
      const currentDate = new Date();

      if (selectedDate <= currentDate) {
        input.setCustomValidity("Please select a future date and time");
        isValid = false;

        // Show error notification
        showNotification(
          "error",
          "Invalid Date",
          "Please select a future date and time for the meeting."
        );
      } else {
        input.setCustomValidity("");
      }
    }
  });

  return isValid;
}

// --- Enhanced Date Input Experience ---
function enhanceDateInputs() {
  const dateInputs = document.querySelectorAll('input[type="datetime-local"]');

  dateInputs.forEach((input) => {
    // Add focus event to show helpful message
    if (!input._enhanced) {
      input.addEventListener("focus", function () {
        // Show a subtle hint about future dates
        const hint = document.createElement("div");
        hint.className = "date-hint";
        hint.textContent = "📅 Select a future date and time";
        hint.style.cssText = `
          position: absolute;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          z-index: 1000;
          pointer-events: none;
        `;

        // Remove any existing hints
        const existingHint = input.parentNode.querySelector(".date-hint");
        if (existingHint) existingHint.remove();

        // Add the hint
        input.parentNode.appendChild(hint);
      });

      input.addEventListener("blur", function () {
        // Remove hint when input loses focus
        const hint = input.parentNode.querySelector(".date-hint");
        if (hint) hint.remove();
      });

      input._enhanced = true;
    }
  });
}

function saveUsers() {
  saveToStorage(STORAGE_KEYS.users, users);
}
function saveClubs() {
  saveToStorage(STORAGE_KEYS.clubs, clubs);
}
function saveDiscussions() {
  saveToStorage(STORAGE_KEYS.discussions, discussions);
}
function saveMeetings() {
  saveToStorage(STORAGE_KEYS.meetings, meetings);
}
function saveProgress() {
  saveToStorage(STORAGE_KEYS.progress, progress);
}
function saveAdminActivity() {
  saveToStorage(STORAGE_KEYS.adminActivity, adminActivity);
}

// --- Scroll-Based Navbar Functions ---
function initScrollNavbar() {
  let lastScrollTop = 0;
  let scrollThreshold = 100; // Minimum scroll distance before hiding navbar
  let navbar = document.querySelector(".navbar");

  if (!navbar) return;

  // Add initial visible class
  navbar.classList.add("navbar-visible");

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Only hide/show navbar if scrolled more than threshold
    if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down - hide navbar
        navbar.classList.remove("navbar-visible");
        navbar.classList.add("navbar-hidden");
      } else {
        // Scrolling up - show navbar
        navbar.classList.remove("navbar-hidden");
        navbar.classList.add("navbar-visible");
      }
      lastScrollTop = scrollTop;
    }
  });

  // Show navbar when scrolling to top
  window.addEventListener("scroll", () => {
    if (window.pageYOffset === 0) {
      navbar.classList.remove("navbar-hidden");
      navbar.classList.add("navbar-visible");
    }
  });

  // Show navbar on mouse move near top of screen
  let mouseMoveTimeout;
  document.addEventListener("mousemove", (e) => {
    if (e.clientY < 100) {
      // Mouse near top of screen
      navbar.classList.remove("navbar-hidden");
      navbar.classList.add("navbar-visible");

      // Clear existing timeout
      if (mouseMoveTimeout) {
        clearTimeout(mouseMoveTimeout);
      }

      // Hide navbar again after 3 seconds of no mouse movement
      mouseMoveTimeout = setTimeout(() => {
        if (window.pageYOffset > 100) {
          navbar.classList.remove("navbar-visible");
          navbar.classList.add("navbar-hidden");
        }
      }, 3000);
    }
  });

  // Initialize scroll to top button
  initScrollToTopButton();

  // Add touch gesture support for mobile
  initTouchGestures();
}

// --- Scroll to Top Button Functions ---
function initScrollToTopButton() {
  const scrollToTopBtn = document.getElementById("scrollToTopBtn");
  if (!scrollToTopBtn) return;

  // Show button when scrolled down
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }
  });

  // Scroll to top when button is clicked
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    // Show navbar when scrolling to top
    const navbar = document.querySelector(".navbar");
    if (navbar) {
      navbar.classList.remove("navbar-hidden");
      navbar.classList.add("navbar-visible");
    }
  });
}

// --- Touch Gesture Support for Mobile ---
function initTouchGestures() {
  let touchStartY = 0;
  let touchEndY = 0;
  const navbar = document.querySelector(".navbar");

  if (!navbar) return;

  // Touch start
  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  // Touch end
  document.addEventListener(
    "touchend",
    (e) => {
      touchEndY = e.changedTouches[0].clientY;
      const touchDiff = touchStartY - touchEndY;

      // Swipe up (hide navbar)
      if (touchDiff > 50 && window.pageYOffset > 100) {
        navbar.classList.remove("navbar-visible");
        navbar.classList.add("navbar-hidden");
      }
      // Swipe down (show navbar)
      else if (touchDiff < -50) {
        navbar.classList.remove("navbar-hidden");
        navbar.classList.add("navbar-visible");
      }
    },
    { passive: true }
  );
}

function collectFormData(form) {
  const formData = {};
  const inputs = form.querySelectorAll("input, textarea, select");

  inputs.forEach((input) => {
    if (input.name || input.id) {
      const key = input.name || input.id;
      formData[key] = input.value;
    }
  });

  return formData;
}

// --- Cross-Browser Data Sync (for login across devices and browsers) ---
const REMOTE_USERS_KEY = "bookclub_users_global";
const CROSS_BROWSER_KEY = "bookclub_cross_browser_sync";

// Enhanced storage with fallbacks for cross-browser compatibility
class CrossBrowserStorage {
  constructor() {
    this.storageMethods = [
      // Try localStorage first
      () => {
        try {
          if (typeof localStorage !== "undefined" && localStorage) {
            return { type: "localStorage", storage: localStorage };
          }
        } catch (e) {
          console.log("localStorage not available");
        }
        return null;
      },
      // Fallback to sessionStorage
      () => {
        try {
          if (typeof sessionStorage !== "undefined" && sessionStorage) {
            return { type: "sessionStorage", storage: sessionStorage };
          }
        } catch (e) {
          console.log("sessionStorage not available");
        }
        return null;
      },
      // Fallback to cookies
      () => {
        try {
          if (typeof document !== "undefined" && document.cookie) {
            return { type: "cookies", storage: null };
          }
        } catch (e) {
          console.log("cookies not available");
        }
        return null;
      },
    ];

    this.activeStorage = this.getAvailableStorage();
  }

  getAvailableStorage() {
    for (const method of this.storageMethods) {
      const result = method();
      if (result) {
        console.log(`Using ${result.type} for storage`);
        return result;
      }
    }
    console.warn("No storage method available, using memory fallback");
    return { type: "memory", storage: new Map() };
  }

  async get(key) {
    try {
      if (
        this.activeStorage.type === "localStorage" ||
        this.activeStorage.type === "sessionStorage"
      ) {
        const value = this.activeStorage.storage.getItem(key);
        return value ? JSON.parse(value) : null;
      } else if (this.activeStorage.type === "cookies") {
        return this.getCookie(key);
      } else if (this.activeStorage.type === "memory") {
        return this.activeStorage.storage.get(key) || null;
      }
    } catch (e) {
      console.error("Error reading from storage:", e);
    }
    return null;
  }

  async set(key, value) {
    try {
      if (
        this.activeStorage.type === "localStorage" ||
        this.activeStorage.type === "sessionStorage"
      ) {
        this.activeStorage.storage.setItem(key, JSON.stringify(value));
        return true;
      } else if (this.activeStorage.type === "cookies") {
        return this.setCookie(key, value);
      } else if (this.activeStorage.type === "memory") {
        this.activeStorage.storage.set(key, value);
        return true;
      }
    } catch (e) {
      console.error("Error writing to storage:", e);
    }
    return false;
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      try {
        return JSON.parse(parts.pop().split(";").shift());
      } catch (e) {
        return parts.pop().split(";").shift();
      }
    }
    return null;
  }

  setCookie(name, value, days = 365) {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
      document.cookie = `${name}=${JSON.stringify(
        value
      )};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      return true;
    } catch (e) {
      console.error("Error setting cookie:", e);
      return false;
    }
  }

  // Try to sync with other storage methods for cross-browser compatibility
  async syncAcrossBrowsers(key, value) {
    try {
      // Try to write to multiple storage methods for better compatibility
      const results = await Promise.allSettled([
        this.set(key, value),
        this.setToLocalStorage(key, value),
        this.setToSessionStorage(key, value),
      ]);

      console.log("Cross-browser sync results:", results);
      return results.some(
        (result) => result.status === "fulfilled" && result.value === true
      );
    } catch (e) {
      console.error("Cross-browser sync failed:", e);
      return false;
    }
  }

  async setToLocalStorage(key, value) {
    try {
      if (typeof localStorage !== "undefined" && localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (e) {
      console.log("localStorage not available for cross-sync");
    }
    return false;
  }

  async setToSessionStorage(key, value) {
    try {
      if (typeof sessionStorage !== "undefined" && sessionStorage) {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (e) {
      console.log("sessionStorage not available for cross-sync");
    }
    return false;
  }
}

// Initialize cross-browser storage
const crossBrowserStorage = new CrossBrowserStorage();

// Enhanced user storage with cross-browser sync
async function fetchRemoteUsers() {
  try {
    // Try multiple storage methods
    let users = await crossBrowserStorage.get(REMOTE_USERS_KEY);

    if (!users) {
      // Fallback to localStorage
      try {
        const localUsers = localStorage.getItem(REMOTE_USERS_KEY);
        if (localUsers) {
          users = JSON.parse(localUsers);
          // Sync to current storage method
          await crossBrowserStorage.set(REMOTE_USERS_KEY, users);
        }
      } catch (e) {
        console.log("localStorage fallback failed");
      }
    }

    return Array.isArray(users) ? users : [];
  } catch (e) {
    console.error("Error fetching remote users:", e);
    return [];
  }
}

async function saveRemoteUsers(usersArr) {
  try {
    // Save to current storage method
    const result = await crossBrowserStorage.set(REMOTE_USERS_KEY, usersArr);

    // Also try to sync across browsers
    await crossBrowserStorage.syncAcrossBrowsers(REMOTE_USERS_KEY, usersArr);

    return result;
  } catch (e) {
    console.error("Error saving remote users:", e);
    return false;
  }
}

// --- Sample Data Initialization ---
(async function initializeSampleData() {
  users = await fetchRemoteUsers();
  if (!Array.isArray(users) || users.length === 0) {
    users = [
      {
        id: 1,
        name: "Admin User",
        email: "admin@bookclub.com",
        password: "admin123",
        isAdmin: true,
        joinedClubs: [],
        createdAt: new Date().toISOString(),
      },
    ];
    await saveRemoteUsers(users);
  }
  clubs = JSON.parse(localStorage.getItem(STORAGE_KEYS.clubs)) || [];
  discussions =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.discussions)) || [];
  meetings = JSON.parse(localStorage.getItem(STORAGE_KEYS.meetings)) || [];
  progress = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress)) || [];
  adminActivity =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.adminActivity)) || [];

  if (clubs.length === 0) {
    clubs = [
      {
        id: 1,
        name: "Mystery Lovers",
        description:
          "A club for mystery and thriller enthusiasts. We read and discuss the best mystery novels.",
        genre: "Mystery",
        creatorId: 1,
        members: [1],
        maxMembers: 20,
        status: "approved",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Classic Literature",
        description:
          "Exploring timeless classics and literary masterpieces from different eras.",
        genre: "Fiction",
        creatorId: 1,
        members: [1],
        maxMembers: 15,
        status: "approved",
        createdAt: new Date().toISOString(),
      },
    ];
    saveClubs();
  }

  // Add sample discussions if none exist
  if (discussions.length === 0) {
    discussions = [
      {
        id: 1,
        clubId: 1,
        title: "First Mystery Discussion",
        content:
          "Let's start our first discussion about mystery novels. What are your favorite mystery authors?",
        authorId: 1,
        authorName: "Admin User",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        clubId: 2,
        title: "Classic Literature Appreciation",
        content:
          "What makes a book a classic? Share your thoughts on timeless literature.",
        authorId: 1,
        authorName: "Admin User",
        createdAt: new Date().toISOString(),
      },
    ];
    saveDiscussions();
  }

  // Add sample meetings if none exist
  if (meetings.length === 0) {
    meetings = [
      {
        id: 1,
        clubId: 1,
        title: "Mystery Club Kickoff",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        platform: "Zoom",
        link: "https://zoom.us/j/123456789",
        description:
          "Our first meeting to discuss mystery novels and plan future readings.",
        createdBy: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        clubId: 2,
        title: "Classic Literature Discussion",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 16),
        platform: "Google Meet",
        link: "https://meet.google.com/abc-defg-hij",
        description: "Deep dive into classic literature themes and analysis.",
        createdBy: 1,
        createdAt: new Date().toISOString(),
      },
    ];
    saveMeetings();
  }

  // Add sample progress entries if none exist
  if (progress.length === 0) {
    progress = [
      {
        id: 1,
        clubId: 1,
        bookTitle: "The Hound of the Baskervilles",
        author: "Arthur Conan Doyle",
        totalPages: 256,
        pagesRead: 128,
        notes:
          "Great mystery novel with excellent atmosphere. Halfway through and loving it!",
        userId: 1,
        userName: "Admin User",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        clubId: 2,
        bookTitle: "Pride and Prejudice",
        author: "Jane Austen",
        totalPages: 432,
        pagesRead: 216,
        notes:
          "Beautiful prose and engaging characters. The social commentary is still relevant today.",
        userId: 1,
        userName: "Admin User",
        createdAt: new Date().toISOString(),
      },
    ];
    saveProgress();
  }
})();

// --- Password Toggle ---
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) {
    console.log("Input not found:", inputId);
    return;
  }

  const button = input.parentElement.querySelector(".password-toggle");
  if (!button) {
    console.log("Password toggle button not found for:", inputId);
    return;
  }

  const icon = button.querySelector("i");
  if (!icon) {
    console.log("Icon not found in password toggle button for:", inputId);
    return;
  }

  console.log(
    "Toggling password for:",
    inputId,
    "Current type:",
    input.type,
    "Current icon class:",
    icon.className
  );

  if (input.type === "password") {
    input.type = "text";
    icon.className = "fas fa-eye-slash";
    button.classList.add("show");
    console.log("Password now visible, icon updated to:", icon.className);
  } else {
    input.type = "password";
    icon.className = "fas fa-eye";
    button.classList.remove("show");
    console.log("Password now hidden, icon updated to:", icon.className);
  }
}

// --- Notification System ---
function showNotification(type, title, message, duration = 3000) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    warning: "fas fa-exclamation-triangle",
    info: "fas fa-info-circle",
  };
  notification.innerHTML = `
    <div class="notification-icon"><i class="${
      icons[type] || icons.info
    }"></i></div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="removeNotification(this)">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(notification);
  setTimeout(() => {
    removeNotification(notification.querySelector(".notification-close"));
  }, duration);
}
function removeNotification(button) {
  const notification = button.closest(".notification");
  if (notification) {
    notification.classList.add("removing");
    setTimeout(() => notification.remove(), 300);
  }
}

// --- Top-Right In-Page Alert for Club Join/Leave ---
function showTopRightAlert(type, message, duration = 3000) {
  let container = document.getElementById("topRightAlertContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "topRightAlertContainer";
    container.style.position = "fixed";
    container.style.top = "24px";
    container.style.right = "24px";
    container.style.zIndex = 9999;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "12px";
    document.body.appendChild(container);
  }
  const alertDiv = document.createElement("div");
  alertDiv.className = `top-right-alert ${type}`;
  alertDiv.style.background = type === "success" ? "#48bb78" : "#f56565";
  alertDiv.style.color = "#fff";
  alertDiv.style.padding = "1rem 1.5rem";
  alertDiv.style.borderRadius = "8px";
  alertDiv.style.boxShadow = "0 2px 12px rgba(0,0,0,0.10)";
  alertDiv.style.fontWeight = "500";
  alertDiv.style.fontSize = "1.06rem";
  alertDiv.style.display = "flex";
  alertDiv.style.alignItems = "center";
  alertDiv.style.gap = "0.7rem";
  alertDiv.style.minWidth = "220px";
  alertDiv.style.maxWidth = "340px";
  alertDiv.style.cursor = "pointer";
  alertDiv.style.transition = "opacity 0.2s";
  alertDiv.innerHTML = `
    <span style="font-size:1.2em;">
      <i class="fas ${
        type === "success" ? "fa-check-circle" : "fa-info-circle"
      }"></i>
    </span>
    <span>${message}</span>
    <button style="background:none;border:none;color:#fff;font-size:1.1em;margin-left:auto;cursor:pointer;" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  container.appendChild(alertDiv);
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.style.opacity = "0";
      setTimeout(() => alertDiv.remove(), 200);
    }
  }, duration);
}

// --- Navigation ---
// Save last section to localStorage whenever section changes
function showSection(sectionId) {
  // Check if user needs to be logged in for certain sections
  if (sectionId !== "home" && !requireLogin("access this section")) {
    return;
  }

  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));
  const section = document.getElementById(sectionId);
  if (section) section.classList.add("active");
  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));
  const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeLink) activeLink.classList.add("active");
  loadSectionData(sectionId);

  // Ensure profile picture is displayed when switching sections
  if (currentUser && currentUser.profilePicture) {
    // Immediate update
    updateProfileButtonDisplay();
    updateProfileInfo();

    // Also update after a short delay to ensure it's visible
    setTimeout(() => {
      updateProfileButtonDisplay();
      updateProfileInfo();
    }, 50);
  }

  // Save last section to localStorage
  try {
    localStorage.setItem(STORAGE_KEYS.lastSection, sectionId);
  } catch (e) {}
}

// Admin panel redirect function
function redirectToAdminPanel() {
  // Check if user is admin
  if (!currentUser || !currentUser.isAdmin) {
    showNotification(
      "error",
      "Access Denied",
      "Admin privileges required to access the admin panel."
    );
    return;
  }

  // Redirect to admin.html
  window.location.href = "admin.html";
}

// Update admin status display
function updateAdminStatus() {
  const adminStatus = document.getElementById("adminStatus");
  if (adminStatus && currentUser?.isAdmin) {
    adminStatus.textContent = `Logged in as ${currentUser.name} (Admin)`;
    adminStatus.style.color = "#10b981"; // Green color for active admin
  } else if (adminStatus) {
    adminStatus.textContent = "Not logged in as admin";
    adminStatus.style.color = "#ef4444"; // Red color for non-admin
  }
}
function loadSectionData(sectionId) {
  switch (sectionId) {
    case "home":
      updateHomeStats();
      break;
    case "clubs":
      if (!requireLogin("view book clubs")) return;
      loadClubs();
      break;
    case "discussions":
      if (!requireLogin("view discussions")) return;
      loadDiscussionClubs();
      break;
    case "meetings":
      if (!requireLogin("view meetings")) return;
      loadMeetingClubs();
      break;
    case "progress":
      if (!requireLogin("view reading progress")) return;
      loadProgressClubs();
      break;
    case "admin":
      if (currentUser?.isAdmin) {
        // Admin section is now just a redirect page, no need to load data
        // The redirectToAdminPanel function will handle the actual navigation
        updateAdminStatus();
      } else {
        showSection("home");
        showNotification(
          "error",
          "Access Denied",
          "Admin privileges required."
        );
      }
      break;
  }
}

// --- Default Profile Picture Generation ---
function generateDefaultProfilePicture(userName) {
  // Create a canvas element to generate the profile picture
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = 200;
  canvas.height = 200;

  // Generate a consistent color based on the user's name
  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#00f2fe",
    "#43e97b",
    "#38f9d7",
    "#fa709a",
    "#fee140",
    "#a8edea",
    "#fed6e3",
    "#ffecd2",
    "#fcb69f",
    "#ff9a9e",
  ];

  // Use the user's name to consistently generate the same color
  let hash = 0;
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorIndex = Math.abs(hash) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Fill background with the generated color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, 200, 200);

  // Get initials from the user's name
  const initials = userName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);

  // Set text properties
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 80px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw the initials in the center
  ctx.fillText(initials, 100, 100);

  // Convert canvas to data URL
  return canvas.toDataURL("image/png");
}

// --- Authentication ---
async function registerUser(userData) {
  if (!userData.name || !userData.email || !userData.password)
    return { success: false, message: "All fields are required" };
  if (userData.password.length < 6)
    return {
      success: false,
      message: "Password must be at least 6 characters",
    };

  let remoteUsers = await fetchRemoteUsers();
  if (remoteUsers.some((u) => u.email === userData.email))
    return { success: false, message: "Email already registered" };

  // Generate default profile picture for new user
  const defaultProfilePicture = generateDefaultProfilePicture(userData.name);

  const newUser = {
    id: remoteUsers.length ? Math.max(...remoteUsers.map((u) => u.id)) + 1 : 1,
    ...userData,
    profilePicture: defaultProfilePicture,
    isAdmin: false,
    joinedClubs: [],
    createdAt: new Date().toISOString(),
  };
  remoteUsers.push(newUser);
  users = remoteUsers;
  await saveRemoteUsers(users);
  saveUsers();
  logAdminActivity("user", "New user registered", newUser.name);
  return { success: true, message: "Registration successful" };
}
async function loginUser(email, password, rememberMe = false) {
  if (!email || !password)
    return { success: false, message: "Email and password are required" };

  users = await fetchRemoteUsers();
  saveUsers();

  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    currentUser = user;

    // Enhanced storage for cross-browser compatibility
    if (rememberMe) {
      // Store user credentials securely for cross-browser access
      await crossBrowserStorage.set("bookclub_remembered_user", {
        email: user.email,
        userId: user.id,
        timestamp: Date.now(),
      });

      // Also store in multiple storage methods for better compatibility
      try {
        localStorage.setItem(
          "bookclub_remembered_user",
          JSON.stringify({
            email: user.email,
            userId: user.id,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.log("localStorage remember me failed, using fallback");
      }
    }

    localStorage.setItem(STORAGE_KEYS.currentUserId, user.id);

    // Ensure user has a profile picture (generate default if none exists)
    const profilePictureChanged = ensureUserHasProfilePicture(user);
    if (profilePictureChanged) {
      // Save the updated user data if profile picture was added
      const userIndex = users.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
        await saveRemoteUsers(users);
        saveUsers();
      }
    }

    // Ensure profile picture is properly restored from all sources
    await restoreProfilePictureOnLogin();

    updateUIForUser();
    return { success: true, message: "Login successful" };
  }
  return { success: false, message: "Invalid credentials" };
}

// --- Profile Picture Management ---
function ensureUserHasProfilePicture(user) {
  // Check if user has no profile picture or if it's null/undefined
  if (
    !user.profilePicture ||
    user.profilePicture === null ||
    user.profilePicture === undefined
  ) {
    user.profilePicture = generateDefaultProfilePicture(user.name);
    return true; // Indicates a change was made
  }
  return false; // No change needed
}

// Ensure all existing users have profile pictures
async function ensureAllUsersHaveProfilePictures() {
  const remoteUsers = await fetchRemoteUsers();
  let hasChanges = false;

  for (const user of remoteUsers) {
    if (!user.profilePicture) {
      user.profilePicture = generateDefaultProfilePicture(user.name);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    users = remoteUsers;
    await saveRemoteUsers(users);
    saveUsers();
    console.log("Default profile pictures generated for existing users");
  }
}

// --- Loading Spinner for Login ---
function showLoginLoadingSpinner() {
  let spinner = document.getElementById("loginLoadingSpinner");
  if (!spinner) {
    spinner = document.createElement("div");
    spinner.id = "loginLoadingSpinner";
    spinner.style.position = "fixed";
    spinner.style.top = "0";
    spinner.style.left = "0";
    spinner.style.width = "100vw";
    spinner.style.height = "100vh";
    spinner.style.background = "rgba(255,255,255,0.55)";
    spinner.style.display = "flex";
    spinner.style.alignItems = "center";
    spinner.style.justifyContent = "center";
    spinner.style.zIndex = "10001";
    spinner.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
        <div class="spinner" style="width:48px;height:48px;border:5px solid #e2e8f0;border-top:5px solid #667eea;border-radius:50%;animation:spin 1s linear infinite;"></div>
        <div style="color:#444;font-weight:500;font-size:1.08rem;">Logging in...</div>
      </div>
    `;
    document.body.appendChild(spinner);
    if (!document.getElementById("loginSpinnerStyle")) {
      const style = document.createElement("style");
      style.id = "loginSpinnerStyle";
      style.innerHTML = `
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `;
      document.head.appendChild(style);
    }
  } else {
    spinner.style.display = "flex";
  }
}
function hideLoginLoadingSpinner() {
  const spinner = document.getElementById("loginLoadingSpinner");
  if (spinner) spinner.style.display = "none";
}

// Show logout confirmation modal
function showLogoutModal() {
  let existing = document.getElementById("logoutModal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "logoutModal";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(30, 34, 45, 0.18)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 10000;

  const modal = document.createElement("div");
  modal.style.background = "#fff";
  modal.style.borderRadius = "14px";
  modal.style.boxShadow = "0 8px 32px rgba(60,60,80,0.12)";
  modal.style.padding = "2.2rem 2.5rem 1.5rem 2.5rem";
  modal.style.display = "flex";
  modal.style.flexDirection = "column";
  modal.style.alignItems = "center";
  modal.style.minWidth = "320px";
  modal.style.maxWidth = "90vw";
  modal.style.gap = "1.5rem";

  const icon = document.createElement("div");
  icon.innerHTML =
    '<i class="fas fa-sign-out-alt" style="font-size: 2rem; color: #667eea;"></i>';
  modal.appendChild(icon);

  const title = document.createElement("h3");
  title.textContent = "Logout Confirmation";
  title.style.margin = "0";
  title.style.fontSize = "1.3rem";
  title.style.color = "#222";
  title.style.fontWeight = "600";
  modal.appendChild(title);

  const msg = document.createElement("div");
  msg.textContent = "Are you sure you want to log out?";
  msg.style.fontSize = "1.08rem";
  msg.style.color = "#666";
  msg.style.textAlign = "center";
  msg.style.fontWeight = "400";
  modal.appendChild(msg);

  const btnRow = document.createElement("div");
  btnRow.style.display = "flex";
  btnRow.style.gap = "1rem";
  btnRow.style.marginTop = "0.5rem";

  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "Yes, Logout";
  confirmBtn.style.background = "#667eea";
  confirmBtn.style.color = "#fff";
  confirmBtn.style.border = "none";
  confirmBtn.style.borderRadius = "8px";
  confirmBtn.style.padding = "0.6rem 1.5rem";
  confirmBtn.style.fontWeight = "600";
  confirmBtn.style.fontSize = "1rem";
  confirmBtn.style.cursor = "pointer";
  confirmBtn.style.transition = "background 0.2s";
  confirmBtn.onmouseover = () => (confirmBtn.style.background = "#5a67d8");
  confirmBtn.onmouseout = () => (confirmBtn.style.background = "#667eea");
  confirmBtn.onclick = () => {
    overlay.remove();
    performLogout();
  };

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.background = "#f5f6fa";
  cancelBtn.style.color = "#444";
  cancelBtn.style.border = "none";
  cancelBtn.style.borderRadius = "8px";
  cancelBtn.style.padding = "0.6rem 1.5rem";
  cancelBtn.style.fontWeight = "500";
  cancelBtn.style.fontSize = "1rem";
  cancelBtn.style.cursor = "pointer";
  cancelBtn.onclick = () => {
    overlay.remove();
  };

  btnRow.appendChild(confirmBtn);
  btnRow.appendChild(cancelBtn);
  modal.appendChild(btnRow);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Close modal when clicking outside
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  // Close modal with Escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}

// Perform the actual logout
function performLogout() {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.currentUserId);

  // Clear remembered user data from all storage methods
  crossBrowserStorage.set("bookclub_remembered_user", null);
  try {
    localStorage.removeItem("bookclub_remembered_user");
    sessionStorage.removeItem("bookclub_remembered_user");
  } catch (e) {
    console.log("Error clearing remembered user data");
  }

  updateUIForUser();
  showSection("home");
  showNotification(
    "info",
    "Logged Out",
    "You have been successfully logged out."
  );
}

// Override logout to use modal
function logout() {
  showLogoutModal();
}

function updateUIForUser() {
  const profileContainer = document.getElementById("profileContainer");
  const authButtons = document.getElementById("authButtons");
  const adminLink = document.getElementById("adminLink");
  const userGreeting = document.getElementById("userGreeting");
  const usernameDisplay = document.getElementById("usernameDisplay");

  if (currentUser) {
    // Show user greeting and profile button
    if (userGreeting) userGreeting.style.display = "flex";
    if (usernameDisplay) usernameDisplay.textContent = currentUser.name;
    if (profileContainer) profileContainer.style.display = "block";
    if (authButtons) authButtons.style.display = "none";

    // Show admin link if user is admin
    if (adminLink) {
      adminLink.style.display = currentUser.isAdmin ? "block" : "none";
    }

    // Update profile information and button display
    migrateProfilePictureData();
    cleanupProfilePictureData().then(() => {
      syncProfilePictureData();
      updateProfileInfo();
      updateProfileButtonDisplay();

      // Force immediate display of profile picture
      if (currentUser && currentUser.profilePicture) {
        setTimeout(() => {
          updateProfileButtonDisplay();
        }, 10);
      }
    });

    // Load user-specific data
    loadSectionData("home");
  } else {
    // Hide user greeting and profile button
    if (userGreeting) userGreeting.style.display = "none";
    if (profileContainer) profileContainer.style.display = "none";
    if (authButtons) authButtons.style.display = "flex";
    if (adminLink) adminLink.style.display = "none";

    // Reset home stats
    updateHomeStats();
  }
}

// --- Modal ---
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "block";
}
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "none";
}

// --- Enhanced Home Stats and Content ---
function updateHomeStats() {
  const totalUsers = document.getElementById("totalUsers");
  const totalClubs = document.getElementById("totalClubs");
  const totalPosts = document.getElementById("totalPosts");
  const totalMeetings = document.getElementById("totalMeetings");

  if (totalUsers) totalUsers.textContent = users.length;
  if (totalClubs)
    totalClubs.textContent = clubs.filter(
      (c) => c.status === "approved"
    ).length;
  if (totalPosts) totalPosts.textContent = discussions.length;
  if (totalMeetings) totalMeetings.textContent = meetings.length;

  // Load featured content
  loadPopularClubs();
  loadTrendingDiscussions();
  loadUpcomingMeetings();
  loadTopReaders();

  // Show progress section if user is logged in
  if (currentUser) {
    loadHomeProgress();
  }
}

// Load popular clubs for homepage
function loadPopularClubs() {
  const popularClubsContainer = document.getElementById("popularClubs");
  if (!popularClubsContainer) return;

  const approvedClubs = clubs.filter((c) => c.status === "approved");
  const popularClubs = approvedClubs
    .sort((a, b) => b.members.length - a.members.length)
    .slice(0, 3);

  if (popularClubs.length === 0) {
    popularClubsContainer.innerHTML = "<p>No clubs available yet.</p>";
    return;
  }

  let html = "";
  popularClubs.forEach((club) => {
    html += `
      <div class="featured-item">
        <h4>${club.name}</h4>
        <p class="featured-meta">${club.genre} • ${
      club.members.length
    } members</p>
        <p class="featured-desc">${club.description.substring(0, 80)}${
      club.description.length > 80 ? "..." : ""
    }</p>
      </div>
    `;
  });

  popularClubsContainer.innerHTML = html;
}

// Load trending discussions for homepage
function loadTrendingDiscussions() {
  const trendingContainer = document.getElementById("trendingDiscussions");
  if (!trendingContainer) return;

  const recentDiscussions = discussions
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (recentDiscussions.length === 0) {
    trendingContainer.innerHTML =
      "<p>No discussions yet. Start the first one!</p>";
    return;
  }

  let html = "";
  recentDiscussions.forEach((discussion) => {
    const club = clubs.find((c) => c.id === discussion.clubId);
    html += `
      <div class="featured-item">
        <h4>${discussion.title}</h4>
        <p class="featured-meta">by ${discussion.authorName} • ${
      club ? club.name : "Unknown Club"
    }</p>
        <p class="featured-desc">${discussion.content.substring(0, 80)}${
      discussion.content.length > 80 ? "..." : ""
    }</p>
      </div>
    `;
  });

  trendingContainer.innerHTML = html;
}

// Load upcoming meetings for homepage
function loadUpcomingMeetings() {
  const upcomingContainer = document.getElementById("upcomingMeetings");
  if (!upcomingContainer) return;

  const upcomingMeetings = meetings
    .filter((m) => new Date(m.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  if (upcomingMeetings.length === 0) {
    upcomingContainer.innerHTML = "<p>No upcoming meetings scheduled.</p>";
    return;
  }

  let html = "";
  upcomingMeetings.forEach((meeting) => {
    const club = clubs.find((c) => c.id === meeting.clubId);
    const meetingDate = new Date(meeting.date);
    html += `
      <div class="featured-item">
        <h4>${meeting.title}</h4>
        <p class="featured-meta">${
          club ? club.name : "Unknown Club"
        } • ${meetingDate.toLocaleDateString()}</p>
        <p class="featured-desc">${meeting.platform} • ${
      meeting.description
        ? meeting.description.substring(0, 60) + "..."
        : "No description"
    }</p>
      </div>
    `;
  });

  upcomingContainer.innerHTML = html;
}

// Load top readers for homepage
function loadTopReaders() {
  const topReadersContainer = document.getElementById("topReaders");
  if (!topReadersContainer) return;

  // Calculate reading progress for each user
  const userProgress = users.map((user) => {
    const userProgressEntries = progress.filter((p) => p.userId === user.id);
    const totalPages = userProgressEntries.reduce(
      (sum, p) => sum + p.pagesRead,
      0
    );
    return { user, totalPages, progressCount: userProgressEntries.length };
  });

  const topReaders = userProgress
    .filter((u) => u.totalPages > 0)
    .sort((a, b) => b.totalPages - a.totalPages)
    .slice(0, 3);

  if (topReaders.length === 0) {
    topReadersContainer.innerHTML = "<p>No reading data available yet.</p>";
    return;
  }

  let html = "";
  topReaders.forEach((reader, index) => {
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";
    html += `
      <div class="reader-item">
        <span class="reader-medal">${medal}</span>
        <span class="reader-name">${reader.user.name}</span>
        <span class="reader-pages">${reader.totalPages} pages</span>
      </div>
    `;
  });

  topReadersContainer.innerHTML = html;
}

// Load user's reading progress for homepage
function loadHomeProgress() {
  const progressSection = document.getElementById("homeProgressSection");
  const progressOverview = document.getElementById("homeProgressOverview");

  if (!progressSection || !progressOverview) return;

  if (!currentUser) {
    progressSection.style.display = "none";
    return;
  }

  const userProgress = progress.filter((p) => p.userId === currentUser.id);

  if (userProgress.length === 0) {
    progressSection.style.display = "none";
    return;
  }

  progressSection.style.display = "block";

  let html = "";
  userProgress.slice(0, 3).forEach((entry) => {
    const percentage = Math.round((entry.pagesRead / entry.totalPages) * 100);
    html += `
      <div class="progress-card">
        <h4>${entry.bookTitle}</h4>
        <p class="progress-author">by ${entry.author}</p>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-percentage">${entry.pagesRead}/${entry.totalPages} pages (${percentage}%)</p>
      </div>
    `;
  });

  progressOverview.innerHTML = html;
}

// Newsletter subscription function
function subscribeNewsletter() {
  if (!requireLogin("subscribe to the newsletter")) return;

  const emailInput = document.getElementById("newsletterEmail");
  if (!emailInput) return;

  const email = emailInput.value.trim();
  if (!email) {
    showNotification(
      "error",
      "Invalid Email",
      "Please enter a valid email address."
    );
    return;
  }

  if (!email.includes("@")) {
    showNotification(
      "error",
      "Invalid Email",
      "Please enter a valid email address."
    );
    return;
  }

  // Simulate newsletter subscription
  showNotification(
    "success",
    "Subscribed!",
    "You've been successfully subscribed to our newsletter!"
  );
  emailInput.value = "";

  // Store subscription (you can extend this with actual backend integration)
  try {
    const subscriptions = JSON.parse(
      localStorage.getItem("newsletter_subscriptions") || "[]"
    );
    subscriptions.push({
      email,
      date: new Date().toISOString(),
      userId: currentUser.id,
    });
    localStorage.setItem(
      "newsletter_subscriptions",
      JSON.stringify(subscriptions)
    );
  } catch (e) {
    console.log("Failed to save newsletter subscription");
  }
}

// --- Genre Filtering ---
function filterByGenre(genre) {
  // Navigate to clubs section and filter by genre
  showSection("clubs");

  // Add a small delay to ensure the clubs section is loaded
  setTimeout(() => {
    const clubsGrid = document.getElementById("clubsGrid");
    if (!clubsGrid) return;

    const approvedClubs = clubs.filter((club) => club.status === "approved");
    const filteredClubs =
      genre === "All"
        ? approvedClubs
        : approvedClubs.filter((club) => club.genre === genre);

    clubsGrid.innerHTML = "";

    if (filteredClubs.length === 0) {
      clubsGrid.innerHTML = `<p class="text-center">No ${genre} book clubs available yet.</p>`;
      return;
    }

    filteredClubs.forEach((club) => {
      const isMember = currentUser
        ? club.members.includes(currentUser.id)
        : false;
      const isCreator = currentUser ? club.creatorId === currentUser.id : false;
      const clubCard = document.createElement("div");
      clubCard.className = "club-card";
      clubCard.innerHTML = `
        <h3>${club.name}</h3>
        <span class="genre">${club.genre || "No genre"}</span>
        <p>${club.description}</p>
        <p class="members">${club.members.length}${
        club.maxMembers ? `/${club.maxMembers}` : ""
      } members</p>
        <div class="actions">
          ${
            !currentUser
              ? `<button class="btn btn-primary" onclick="requireLogin('join a club')">Login to Join</button>`
              : ""
          }
          ${
            currentUser && !isMember
              ? `<button class="btn btn-primary" onclick="joinClub(${club.id})">Join Club</button>`
              : ""
          }
          ${
            currentUser && isMember && !isCreator
              ? `<button class="btn btn-secondary" onclick="leaveClub(${club.id})">Leave Club</button>`
              : ""
          }
          ${
            currentUser && isCreator
              ? `<button class="btn btn-danger" onclick="deleteClub(${club.id})">Delete Club</button>`
              : ""
          }
        </div>
      `;
      clubsGrid.appendChild(clubCard);
    });

    // Show a filter indicator
    if (genre !== "All") {
      const filterIndicator = document.createElement("div");
      filterIndicator.className = "filter-indicator";
      filterIndicator.innerHTML = `
        <div style="background: #667eea; color: white; padding: 0.5rem 1rem; border-radius: 20px; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-filter"></i>
          Showing ${genre} clubs (${filteredClubs.length} found)
          <button onclick="filterByGenre('All')" style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      clubsGrid.insertBefore(filterIndicator, clubsGrid.firstChild);
    }
  }, 100);
}

// --- Clubs ---
function loadClubs() {
  const clubsGrid = document.getElementById("clubsGrid");
  if (!clubsGrid) return;
  clubsGrid.innerHTML = "";
  const approvedClubs = clubs.filter((club) => club.status === "approved");
  if (approvedClubs.length === 0) {
    clubsGrid.innerHTML =
      '<p class="text-center">No book clubs available yet.</p>';
    return;
  }
  approvedClubs.forEach((club) => {
    const isMember = currentUser
      ? club.members.includes(currentUser.id)
      : false;
    const isCreator = currentUser ? club.creatorId === currentUser.id : false;
    const clubCard = document.createElement("div");
    clubCard.className = "club-card";
    clubCard.innerHTML = `
      <h3>${club.name}</h3>
      <span class="genre">${club.genre || "No genre"}</span>
      <p>${club.description}</p>
      <p class="members">${club.members.length}${
      club.maxMembers ? `/${club.maxMembers}` : ""
    } members</p>
      <div class="actions">
        ${
          !currentUser
            ? `<button class="btn btn-primary" onclick="requireLogin('join a club')">Login to Join</button>`
            : ""
        }
        ${
          currentUser && !isMember
            ? `<button class="btn btn-primary" onclick="joinClub(${club.id})">Join Club</button>`
            : ""
        }
        ${
          currentUser && isMember && !isCreator
            ? `<button class="btn btn-secondary" onclick="leaveClub(${club.id})">Leave Club</button>`
            : ""
        }
        ${
          currentUser && isCreator
            ? `<button class="btn btn-danger" onclick="deleteClub(${club.id})">Delete Club</button>`
            : ""
        }
      </div>
    `;
    clubsGrid.appendChild(clubCard);
  });
}
function joinClub(clubId) {
  if (!requireLogin("join a club")) return;
  const club = clubs.find((c) => c.id === clubId);
  if (!club) return alert("Club not found");
  if (club.status !== "approved") return alert("This club is not yet approved");
  if (club.maxMembers && club.members.length >= club.maxMembers)
    return alert("This club is full");
  if (!club.members.includes(currentUser.id)) {
    club.members.push(currentUser.id);
    currentUser.joinedClubs.push(clubId);
    saveClubs();
    saveUsers();
    loadClubs();
    showTopRightAlert("success", `Successfully joined ${club.name}!`);
  } else {
    showTopRightAlert("info", "You are already a member of this club");
  }
}
function leaveClub(clubId) {
  if (!requireLogin("leave a club")) return;
  const club = clubs.find((c) => c.id === clubId);
  if (!club) return alert("Club not found");
  club.members = club.members.filter((id) => id !== currentUser.id);
  currentUser.joinedClubs = currentUser.joinedClubs.filter(
    (id) => id !== clubId
  );
  if (club.members.length === 0) clubs = clubs.filter((c) => c.id !== clubId);
  saveClubs();
  saveUsers();
  loadClubs();
  showTopRightAlert("success", `Left ${club.name}`);
}
function deleteClub(clubId) {
  if (!requireLogin("delete a club")) return;
  const club = clubs.find((c) => c.id === clubId);
  if (!club) return alert("Club not found");
  if (club.creatorId !== currentUser.id && !currentUser.isAdmin)
    return alert("Only the club creator or admin can delete this club");
  if (
    confirm(
      "Are you sure you want to delete this club? This action cannot be undone."
    )
  ) {
    clubs = clubs.filter((c) => c.id !== clubId);
    discussions = discussions.filter((d) => d.clubId !== clubId);
    meetings = meetings.filter((m) => m.clubId !== clubId);
    progress = progress.filter((p) => p.clubId !== clubId);
    users.forEach((user) => {
      user.joinedClubs = user.joinedClubs.filter((id) => id !== clubId);
    });
    saveClubs();
    saveDiscussions();
    saveMeetings();
    saveProgress();
    saveUsers();
    loadClubs();
    logAdminActivity("club", "Club deleted", club.name);
    alert("Club deleted successfully");
  }
}

// --- Discussions ---
function loadDiscussionClubs() {
  const select = document.getElementById("discussionClubSelect");
  if (!select) return;
  select.innerHTML = '<option value="">Select a Book Club</option>';
  if (!currentUser) {
    select.innerHTML =
      '<option value="">Please login to view discussions</option>';
    return;
  }
  const userClubs = clubs.filter(
    (club) =>
      club.members.includes(currentUser.id) && club.status === "approved"
  );
  userClubs.forEach((club) => {
    const option = document.createElement("option");
    option.value = club.id;
    option.textContent = club.name;
    select.appendChild(option);
  });

  // Restore last selected club for discussions
  const lastDiscussionClubId = localStorage.getItem(
    STORAGE_KEYS.lastDiscussionClubId
  );
  if (
    lastDiscussionClubId &&
    userClubs.some((club) => String(club.id) === String(lastDiscussionClubId))
  ) {
    select.value = lastDiscussionClubId;
  }

  select.removeEventListener("change", loadDiscussions);
  select.addEventListener("change", function (e) {
    // Save last selected club for discussions
    localStorage.setItem(STORAGE_KEYS.lastDiscussionClubId, select.value);
    loadDiscussions();
  });

  // If a club is selected (from restore), load its discussions
  if (select.value) {
    loadDiscussions();
  }
}
function loadDiscussions() {
  const clubId = document.getElementById("discussionClubSelect").value;
  const discussionsList = document.getElementById("discussionsList");
  const newDiscussionForm = document.getElementById("newDiscussionForm");
  if (!discussionsList) return;
  if (!clubId) {
    discussionsList.innerHTML =
      "<p>Please select a book club to view discussions.</p>";
    if (newDiscussionForm) newDiscussionForm.style.display = "none";
    return;
  }
  // Save last selected club for discussions
  localStorage.setItem(STORAGE_KEYS.lastDiscussionClubId, clubId);

  const clubDiscussions = discussions.filter(
    (d) => d.clubId === parseInt(clubId)
  );
  discussionsList.innerHTML = "";
  if (clubDiscussions.length === 0) {
    discussionsList.innerHTML =
      "<p>No discussions yet. Start the first one!</p>";
  } else {
    clubDiscussions.forEach((discussion) => {
      const discussionItem = document.createElement("div");
      discussionItem.className = "discussion-item";
      const canEdit = currentUser && discussion.authorId === currentUser.id;
      const canDelete =
        currentUser &&
        (discussion.authorId === currentUser.id || currentUser.isAdmin);

      discussionItem.innerHTML = `
        <div class="discussion-header">
          <span class="discussion-title">${discussion.title}</span>
          <span class="discussion-meta">by ${
            discussion.authorName
          } • ${new Date(discussion.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="discussion-content">${discussion.content}</div>
        ${
          canEdit || canDelete
            ? `
          <div class="discussion-actions">
            ${
              canEdit
                ? `<button class="btn btn-secondary btn-sm" onclick="editDiscussion(${discussion.id})">
              <i class="fas fa-edit"></i> Edit
            </button>`
                : ""
            }
            ${
              canDelete
                ? `<button class="btn btn-danger btn-sm" onclick="deleteDiscussion(${discussion.id})">
              <i class="fas fa-trash"></i> Delete
            </button>`
                : ""
            }
          </div>
        `
            : ""
        }
      `;
      discussionsList.appendChild(discussionItem);
    });
  }
  if (newDiscussionForm) newDiscussionForm.style.display = "block";
}

// Edit discussion function
function editDiscussion(discussionId) {
  const discussion = discussions.find((d) => d.id === discussionId);
  if (!discussion) return;

  // Check if user can edit this discussion
  if (!currentUser || discussion.authorId !== currentUser.id) {
    showNotification(
      "error",
      "Access Denied",
      "You can only edit your own discussions."
    );
    return;
  }

  // Populate the edit form
  document.getElementById("editDiscussionId").value = discussion.id;
  document.getElementById("editDiscussionTitle").value = discussion.title;
  document.getElementById("editDiscussionContent").value = discussion.content;

  // Show the edit modal
  showModal("editDiscussionModal");
}

// Delete discussion function
function deleteDiscussion(discussionId) {
  const discussion = discussions.find((d) => d.id === discussionId);
  if (!discussion) return;

  // Check if user can delete this discussion
  if (
    !currentUser ||
    (discussion.authorId !== currentUser.id && !currentUser.isAdmin)
  ) {
    showNotification(
      "error",
      "Access Denied",
      "You can only delete your own discussions."
    );
    return;
  }

  if (
    confirm(
      "Are you sure you want to delete this discussion? This action cannot be undone."
    )
  ) {
    discussions = discussions.filter((d) => d.id !== discussionId);
    saveDiscussions();
    loadDiscussions();
    showNotification(
      "success",
      "Discussion Deleted",
      "Discussion has been deleted successfully."
    );
  }
}

// --- Meetings ---
function loadMeetingClubs() {
  const select = document.getElementById("meetingClubSelect");
  if (!select) return;
  select.innerHTML = '<option value="">Select a Book Club</option>';
  if (!currentUser) {
    select.innerHTML =
      '<option value="">Please login to view meetings</option>';
    return;
  }
  const userClubs = clubs.filter(
    (club) =>
      club.members.includes(currentUser.id) && club.status === "approved"
  );
  userClubs.forEach((club) => {
    const option = document.createElement("option");
    option.value = club.id;
    option.textContent = club.name;
    select.appendChild(option);
  });

  // Restore last selected club for meetings
  const lastMeetingClubId = localStorage.getItem(
    STORAGE_KEYS.lastMeetingClubId
  );
  if (
    lastMeetingClubId &&
    userClubs.some((club) => String(club.id) === String(lastMeetingClubId))
  ) {
    select.value = lastMeetingClubId;
  }

  select.removeEventListener("change", loadMeetings);
  select.addEventListener("change", function (e) {
    // Save last selected club for meetings
    localStorage.setItem(STORAGE_KEYS.lastMeetingClubId, select.value);
    loadMeetings();
  });

  // If a club is selected (from restore), load its meetings
  if (select.value) {
    loadMeetings();
  }

  // Ensure date inputs are properly configured to prevent past dates
  preventPastDates();

  // Enhance date input user experience
  enhanceDateInputs();
}
function loadMeetings() {
  const clubId = document.getElementById("meetingClubSelect").value;
  const meetingsList = document.getElementById("meetingsList");
  const newMeetingForm = document.getElementById("newMeetingForm");
  if (!meetingsList) return;
  if (!clubId) {
    meetingsList.innerHTML =
      "<p>Please select a book club to view meetings.</p>";
    if (newMeetingForm) newMeetingForm.style.display = "none";
    return;
  }
  // Save last selected club for meetings
  localStorage.setItem(STORAGE_KEYS.lastMeetingClubId, clubId);

  const clubMeetings = meetings.filter((m) => m.clubId === parseInt(clubId));
  meetingsList.innerHTML = "";
  if (clubMeetings.length === 0) {
    meetingsList.innerHTML = "<p>No meetings scheduled yet.</p>";
  } else {
    clubMeetings.forEach((meeting) => {
      const meetingItem = document.createElement("div");
      meetingItem.className = "meeting-item";
      const canEdit = currentUser && meeting.createdBy === currentUser.id;
      const canDelete =
        currentUser &&
        (meeting.createdBy === currentUser.id || currentUser.isAdmin);

      meetingItem.innerHTML = `
        <div class="meeting-title">${meeting.title}</div>
        <div class="meeting-date">${new Date(
          meeting.date
        ).toLocaleString()}</div>
        <span class="meeting-platform">${meeting.platform}</span>
        ${meeting.description ? `<p>${meeting.description}</p>` : ""}
        ${
          meeting.link
            ? `<a href="${meeting.link}" target="_blank" class="meeting-link">Join Meeting</a>`
            : ""
        }
        ${
          canEdit || canDelete
            ? `
          <div class="meeting-actions">
            ${
              canEdit
                ? `<button class="btn btn-secondary btn-sm" onclick="editMeeting(${meeting.id})">
              <i class="fas fa-edit"></i> Edit
            </button>`
                : ""
            }
            ${
              canDelete
                ? `<button class="btn btn-danger btn-sm" onclick="deleteMeeting(${meeting.id})">
              <i class="fas fa-trash"></i> Delete
            </button>`
                : ""
            }
          </div>
        `
            : ""
        }
      `;
      meetingsList.appendChild(meetingItem);
    });
  }
  if (newMeetingForm) {
    newMeetingForm.style.display = "block";
    // Prevent past dates from being selected
    preventPastDates();

    // Enhance date input user experience
    enhanceDateInputs();
  }
}

// Edit meeting function
function editMeeting(meetingId) {
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return;

  // Check if user can edit this meeting
  if (!currentUser || meeting.createdBy !== currentUser.id) {
    showNotification(
      "error",
      "Access Denied",
      "You can only edit your own meetings."
    );
    return;
  }

  // Populate the edit form
  document.getElementById("editMeetingId").value = meeting.id;
  document.getElementById("editMeetingTitle").value = meeting.title;
  document.getElementById("editMeetingDate").value = meeting.date;
  document.getElementById("editMeetingPlatform").value = meeting.platform;
  document.getElementById("editMeetingLink").value = meeting.link || "";
  document.getElementById("editMeetingDescription").value =
    meeting.description || "";

  // Show the edit modal
  showModal("editMeetingModal");

  // Prevent past dates from being selected
  preventPastDates();

  // Enhance date input user experience
  enhanceDateInputs();
}

// Delete meeting function
function deleteMeeting(meetingId) {
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return;

  // Check if user can delete this meeting
  if (
    !currentUser ||
    (meeting.createdBy !== currentUser.id && !currentUser.isAdmin)
  ) {
    showNotification(
      "error",
      "Access Denied",
      "You can only delete your own meetings."
    );
    return;
  }

  if (
    confirm(
      "Are you sure you want to delete this meeting? This action cannot be undone."
    )
  ) {
    meetings = meetings.filter((m) => m.id !== meetingId);
    saveMeetings();
    loadMeetings();
    showNotification(
      "success",
      "Meeting Deleted",
      "Meeting has been deleted successfully."
    );
  }
}

// --- Progress ---
function loadProgressClubs() {
  const select = document.getElementById("progressClubSelect");
  if (!select) return;
  select.innerHTML = '<option value="">Select a Book Club</option>';
  if (!currentUser) {
    select.innerHTML =
      '<option value="">Please login to view progress</option>';
    return;
  }
  const userClubs = clubs.filter(
    (club) =>
      club.members.includes(currentUser.id) && club.status === "approved"
  );
  userClubs.forEach((club) => {
    const option = document.createElement("option");
    option.value = club.id;
    option.textContent = club.name;
    select.appendChild(option);
  });

  // Restore last selected club for progress
  const lastProgressClubId = localStorage.getItem(
    STORAGE_KEYS.lastProgressClubId
  );
  if (
    lastProgressClubId &&
    userClubs.some((club) => String(club.id) === String(lastProgressClubId))
  ) {
    select.value = lastProgressClubId;
  }

  select.removeEventListener("change", loadProgress);
  select.addEventListener("change", function (e) {
    // Save last selected club for progress
    localStorage.setItem(STORAGE_KEYS.lastProgressClubId, select.value);
    loadProgress();
  });

  // If a club is selected (from restore), load its progress
  if (select.value) {
    loadProgress();
  }
}
function loadProgress() {
  const clubId = document.getElementById("progressClubSelect").value;
  const progressList = document.getElementById("progressList");
  const newProgressForm = document.getElementById("newProgressForm");
  if (!progressList) return;
  if (!clubId) {
    progressList.innerHTML =
      "<p>Please select a book club to view reading progress.</p>";
    if (newProgressForm) newProgressForm.style.display = "none";
    return;
  }
  // Save last selected club for progress
  localStorage.setItem(STORAGE_KEYS.lastProgressClubId, clubId);

  const clubProgress = progress.filter((p) => p.clubId === parseInt(clubId));
  progressList.innerHTML = "";
  if (clubProgress.length === 0) {
    progressList.innerHTML = "<p>No reading progress logged yet.</p>";
  } else {
    clubProgress.forEach((entry) => {
      const percentage = Math.round((entry.pagesRead / entry.totalPages) * 100);
      const progressItem = document.createElement("div");
      progressItem.className = "progress-item";
      const canEdit = currentUser && entry.userId === currentUser.id;
      const canDelete =
        currentUser && (entry.userId === currentUser.id || currentUser.isAdmin);

      progressItem.innerHTML = `
        <div class="progress-book">${entry.bookTitle}</div>
        <div class="progress-author">by ${entry.author}</div>
        <div class="progress-percentage">${entry.pagesRead}/${
        entry.totalPages
      } pages (${percentage}%)</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${percentage}%"></div></div>
        ${entry.notes ? `<p><small>${entry.notes}</small></p>` : ""}
        <small>Updated by ${entry.userName} on ${new Date(
        entry.createdAt
      ).toLocaleDateString()}</small>
        ${
          canEdit || canDelete
            ? `
          <div class="progress-actions">
            ${
              canEdit
                ? `<button class="btn btn-secondary btn-sm" onclick="editProgress(${entry.id})">
              <i class="fas fa-edit"></i> Edit
            </button>`
                : ""
            }
            ${
              canDelete
                ? `<button class="btn btn-danger btn-sm" onclick="deleteProgress(${entry.id})">
              <i class="fas fa-trash"></i> Delete
            </button>`
                : ""
            }
          </div>
        `
            : ""
        }
      `;
      progressList.appendChild(progressItem);
    });
  }
  if (newProgressForm) newProgressForm.style.display = "block";
}

// Edit progress function
function editProgress(progressId) {
  const progressEntry = progress.find((p) => p.id === progressId);
  if (!progressEntry) return;

  // Check if user can edit this progress entry
  if (!currentUser || progressEntry.userId !== currentUser.id) {
    showNotification(
      "error",
      "Access Denied",
      "You can only edit your own progress entries."
    );
    return;
  }

  // Populate the edit form
  document.getElementById("editProgressId").value = progressEntry.id;
  document.getElementById("editBookTitle").value = progressEntry.bookTitle;
  document.getElementById("editBookAuthor").value = progressEntry.author;
  document.getElementById("editTotalPages").value = progressEntry.totalPages;
  document.getElementById("editPagesRead").value = progressEntry.pagesRead;
  document.getElementById("editReadingNotes").value = progressEntry.notes || "";

  // Show the edit modal
  showModal("editProgressModal");
}

// Delete progress function
function deleteProgress(progressId) {
  const progressEntry = progress.find((p) => p.id === progressId);
  if (!progressEntry) return;

  // Check if user can delete this progress entry
  if (
    !currentUser ||
    (progressEntry.userId !== currentUser.id && !currentUser.isAdmin)
  ) {
    showNotification(
      "error",
      "Access Denied",
      "You can only delete your own progress entries."
    );
    return;
  }

  if (
    confirm(
      "Are you sure you want to delete this progress entry? This action cannot be undone."
    )
  ) {
    progress = progress.filter((p) => p.id !== progressId);
    saveProgress();
    loadProgress();
    showNotification(
      "success",
      "Progress Deleted",
      "Progress entry has been deleted successfully."
    );
  }
}

// --- Admin Panel ---
// (Unchanged)
function loadAdminPanel() {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  updateAdminStats();
  loadRecentActivity();
  loadPendingApprovals();
  setupAdminTabs();
}
function updateAdminStats() {
  const adminUsers = document.getElementById("adminUsers");
  const adminClubs = document.getElementById("adminClubs");
  const adminDiscussions = document.getElementById("adminDiscussions");
  const adminMeetings = document.getElementById("adminMeetings");
  const pendingClubs = document.getElementById("pendingClubs");
  if (adminUsers) adminUsers.textContent = users.length;
  if (adminClubs)
    adminClubs.textContent = clubs.filter(
      (c) => c.status === "approved"
    ).length;
  if (adminDiscussions) adminDiscussions.textContent = discussions.length;
  if (adminMeetings) adminMeetings.textContent = meetings.length;
  if (pendingClubs)
    pendingClubs.textContent = clubs.filter(
      (c) => c.status === "pending"
    ).length;
}
function setupAdminTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".admin-tab-content");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      const content = document.getElementById(tabName);
      if (content) content.classList.add("active");
      switch (tabName) {
        case "users":
          setupUserFilters();
          loadAdminUsers();
          break;
        case "clubs":
          loadAdminClubs();
          break;
        case "content":
          loadContentModeration();
          break;
      }
    });
  });
}

// Wire up live search and role filter for the Users tab
function setupUserFilters() {
  const searchInput = document.getElementById("userSearch");
  const roleSelect = document.getElementById("userRoleFilter");
  if (searchInput && !searchInput._adminFilterBound) {
    searchInput.addEventListener("input", () => loadAdminUsers());
    // mark as bound to avoid duplicate listeners on tab switches
    searchInput._adminFilterBound = true;
  }
  if (roleSelect && !roleSelect._adminFilterBound) {
    roleSelect.addEventListener("change", () => loadAdminUsers());
    roleSelect._adminFilterBound = true;
  }
}
function loadRecentActivity() {
  const activityList = document.getElementById("recentActivity");
  if (!activityList) return;
  activityList.innerHTML = "";
  const recentActivities = adminActivity.slice(-10).reverse();
  if (recentActivities.length === 0) {
    activityList.innerHTML = "<p>No recent activity</p>";
    return;
  }
  recentActivities.forEach((activity) => {
    const activityItem = document.createElement("div");
    activityItem.className = "activity-item";
    const iconClass =
      activity.type === "user"
        ? "user"
        : activity.type === "club"
        ? "club"
        : activity.type === "discussion"
        ? "discussion"
        : "meeting";
    activityItem.innerHTML = `
      <div class="activity-icon ${iconClass}">
        <i class="fas fa-${
          activity.type === "user"
            ? "user"
            : activity.type === "club"
            ? "book"
            : activity.type === "discussion"
            ? "comments"
            : "calendar"
        }"></i>
      </div>
      <div class="activity-content">
        <h4>${activity.action}</h4>
        <p>${activity.details} • ${new Date(
      activity.timestamp
    ).toLocaleString()}</p>
      </div>
    `;
    activityList.appendChild(activityItem);
  });
}
function loadPendingApprovals() {
  const pendingList = document.getElementById("pendingClubsList");
  if (!pendingList) return;
  pendingList.innerHTML = "";
  const pendingClubs = clubs.filter((club) => club.status === "pending");
  if (pendingClubs.length === 0) {
    pendingList.innerHTML = "<p>No pending club approvals</p>";
    return;
  }
  pendingClubs.forEach((club) => {
    const creator = users.find((u) => u.id === club.creatorId);
    const pendingItem = document.createElement("div");
    pendingItem.className = "pending-club-item";
    pendingItem.innerHTML = `
      <h4>${club.name}</h4>
      <div class="club-details">
        <p><strong>Genre:</strong> ${club.genre || "Not specified"}</p>
        <p><strong>Description:</strong> ${club.description}</p>
        <p><strong>Max Members:</strong> ${club.maxMembers || "Unlimited"}</p>
      </div>
      <div class="creator-info">
        <p><strong>Created by:</strong> ${creator?.name || "Unknown"} (${
      creator?.email || "Unknown"
    })</p>
        <p><strong>Created:</strong> ${new Date(
          club.createdAt
        ).toLocaleString()}</p>
      </div>
      <div class="approval-actions">
        <button class="btn btn-primary" onclick="approveClub(${
          club.id
        })"><i class="fas fa-check"></i> Approve</button>
        <button class="btn btn-danger" onclick="rejectClub(${
          club.id
        })"><i class="fas fa-times"></i> Reject</button>
      </div>
    `;
    pendingList.appendChild(pendingItem);
  });
}
function approveClub(clubId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  const club = clubs.find((c) => c.id === clubId);
  if (!club) return alert("Club not found");
  club.status = "approved";
  saveClubs();
  logAdminActivity("club", "Club approved", club.name);
  loadPendingApprovals();
  updateAdminStats();
  alert(`Club "${club.name}" has been approved!`);
}
function rejectClub(clubId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  const club = clubs.find((c) => c.id === clubId);
  if (!club) return alert("Club not found");
  if (
    confirm(
      `Are you sure you want to reject "${club.name}"? This action cannot be undone.`
    )
  ) {
    clubs = clubs.filter((c) => c.id !== clubId);
    saveClubs();
    logAdminActivity("club", "Club rejected", club.name);
    loadPendingApprovals();
    updateAdminStats();
    alert(`Club "${club.name}" has been rejected and removed.`);
  }
}
function loadAdminUsers() {
  const usersList = document.getElementById("adminUsersList");
  if (!usersList) return;

  const searchInput = document.getElementById("userSearch");
  const roleSelect = document.getElementById("userRoleFilter");
  const query = (searchInput?.value || "").trim().toLowerCase();
  const roleFilter = (roleSelect?.value || "").trim(); // "", "admin", "user"

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleFilter === ""
        ? true
        : roleFilter === "admin"
        ? user.isAdmin === true
        : user.isAdmin !== true;
    const haystack = `${user.name || ""} ${user.email || ""}`.toLowerCase();
    const matchesQuery = query === "" ? true : haystack.includes(query);
    return matchesRole && matchesQuery;
  });

  usersList.innerHTML = "";
  if (filteredUsers.length === 0) {
    usersList.innerHTML = "<p>No users match your filters.</p>";
    return;
  }

  filteredUsers.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "admin-item";
    userItem.innerHTML = `
      <div class="admin-item-info">
        <h4>${user.name}</h4>
        <p>${user.email} - ${user.isAdmin ? "Admin" : "User"}</p>
        <p>Joined: ${new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="admin-item-actions">
        ${
          !user.isAdmin
            ? `<button class=\"btn btn-primary\" onclick=\"toggleAdmin(${user.id})\">Make Admin</button>`
            : ""
        }
        ${
          user.id !== currentUser.id
            ? `<button class=\"btn btn-danger\" onclick=\"deleteUser(${user.id})\">Delete</button>`
            : ""
        }
      </div>
    `;
    usersList.appendChild(userItem);
  });
}
function loadAdminClubs() {
  const clubsList = document.getElementById("adminClubsList");
  if (!clubsList) return;
  clubsList.innerHTML = "";
  clubs.forEach((club) => {
    const creator = users.find((u) => u.id === club.creatorId);
    const clubItem = document.createElement("div");
    clubItem.className = "admin-item";
    clubItem.innerHTML = `
      <div class="admin-item-info">
        <h4>${club.name}</h4>
        <p>${club.description}</p>
        <p>Creator: ${creator?.name || "Unknown"} - Members: ${
      club.members.length
    }</p>
        <span class="status-badge ${club.status}">${club.status}</span>
      </div>
      <div class="admin-item-actions">
        ${
          club.status === "pending"
            ? `
          <button class="btn btn-primary" onclick="approveClub(${club.id})">Approve</button>
          <button class="btn btn-danger" onclick="rejectClub(${club.id})">Reject</button>
        `
            : ""
        }
        <button class="btn btn-danger" onclick="deleteClub(${
          club.id
        })">Delete</button>
      </div>
    `;
    clubsList.appendChild(clubItem);
  });
}
function loadContentModeration() {
  loadModerationDiscussions();
  loadModerationMeetings();
  loadModerationProgress();
}
function loadModerationDiscussions() {
  const discussionsList = document.getElementById("modDiscussionsList");
  if (!discussionsList) return;
  discussionsList.innerHTML = "";
  if (discussions.length === 0) {
    discussionsList.innerHTML = "<p>No discussions to moderate</p>";
    return;
  }
  discussions.forEach((discussion) => {
    const club = clubs.find((c) => c.id === discussion.clubId);
    const discussionItem = document.createElement("div");
    discussionItem.className = "content-item";
    discussionItem.innerHTML = `
      <h4>${discussion.title}</h4>
      <div class="content-meta">
        <p>By: ${discussion.authorName} • Club: ${
      club?.name || "Unknown"
    } • ${new Date(discussion.createdAt).toLocaleString()}</p>
      </div>
      <div class="content-text">${discussion.content}</div>
      <div class="moderation-actions">
        <button class="btn btn-danger" onclick="deleteDiscussion(${
          discussion.id
        })">Delete</button>
      </div>
    `;
    discussionsList.appendChild(discussionItem);
  });
}
function loadModerationMeetings() {
  const meetingsList = document.getElementById("modMeetingsList");
  if (!meetingsList) return;
  meetingsList.innerHTML = "";
  if (meetings.length === 0) {
    meetingsList.innerHTML = "<p>No meetings to moderate</p>";
    return;
  }
  meetings.forEach((meeting) => {
    const club = clubs.find((c) => c.id === meeting.clubId);
    const meetingItem = document.createElement("div");
    meetingItem.className = "content-item";
    meetingItem.innerHTML = `
      <h4>${meeting.title}</h4>
      <div class="content-meta">
        <p>Club: ${club?.name || "Unknown"} • ${new Date(
      meeting.date
    ).toLocaleString()}</p>
      </div>
      <div class="content-text">${meeting.description || "No description"}</div>
      <div class="moderation-actions">
        <button class="btn btn-danger" onclick="deleteMeeting(${
          meeting.id
        })">Delete</button>
      </div>
    `;
    meetingsList.appendChild(meetingItem);
  });
}
function loadModerationProgress() {
  const progressList = document.getElementById("modProgressList");
  if (!progressList) return;
  progressList.innerHTML = "";
  if (progress.length === 0) {
    progressList.innerHTML = "<p>No progress entries to moderate</p>";
    return;
  }
  progress.forEach((entry) => {
    const club = clubs.find((c) => c.id === entry.clubId);
    const progressItem = document.createElement("div");
    progressItem.className = "content-item";
    progressItem.innerHTML = `
      <h4>${entry.bookTitle}</h4>
      <div class="content-meta">
        <p>By: ${entry.userName} • Club: ${
      club?.name || "Unknown"
    } • ${new Date(entry.createdAt).toLocaleString()}</p>
      </div>
      <div class="content-text">${entry.notes || "No notes"}</div>
      <div class="moderation-actions">
        <button class="btn btn-danger" onclick="deleteProgress(${
          entry.id
        })">Delete</button>
      </div>
    `;
    progressList.appendChild(progressItem);
  });
}
function deleteDiscussion(discussionId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  const discussion = discussions.find((d) => d.id === discussionId);
  if (!discussion) return alert("Discussion not found");
  if (confirm("Are you sure you want to delete this discussion?")) {
    discussions = discussions.filter((d) => d.id !== discussionId);
    saveDiscussions();
    logAdminActivity("discussion", "Discussion deleted", discussion.title);
    loadModerationDiscussions();
    alert("Discussion deleted successfully");
  }
}
function deleteMeeting(meetingId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) return alert("Meeting not found");
  if (confirm("Are you sure you want to delete this meeting?")) {
    meetings = meetings.filter((m) => m.id !== meetingId);
    saveMeetings();
    logAdminActivity("meeting", "Meeting deleted", meeting.title);
    loadModerationMeetings();
    alert("Meeting deleted successfully");
  }
}
function deleteProgress(progressId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  const progressEntry = progress.find((p) => p.id === progressId);
  if (!progressEntry) return alert("Progress entry not found");
  if (confirm("Are you sure you want to delete this progress entry?")) {
    progress = progress.filter((p) => p.id !== progressId);
    saveProgress();
    logAdminActivity(
      "progress",
      "Progress entry deleted",
      progressEntry.bookTitle
    );
    loadModerationProgress();
    alert("Progress entry deleted successfully");
  }
}
function toggleAdmin(userId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.isAdmin = !user.isAdmin;
    saveUsers();
    logAdminActivity(
      "user",
      `User ${user.isAdmin ? "promoted to admin" : "removed from admin"}`,
      user.name
    );
    loadAdminUsers();
    alert(
      `User ${user.name} ${
        user.isAdmin ? "promoted to admin" : "removed from admin"
      }`
    );
  }
}
function deleteUser(userId) {
  if (!currentUser?.isAdmin)
    return alert("Access denied. Admin privileges required.");
  if (userId === currentUser.id)
    return alert("You cannot delete your own account");
  const user = users.find((u) => u.id === userId);
  if (!user) return alert("User not found");
  if (
    confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
  ) {
    users = users.filter((u) => u.id !== userId);
    saveUsers();
    logAdminActivity("user", "User deleted", user.name);
    loadAdminUsers();
    alert("User deleted successfully");
  }
}
function logAdminActivity(type, action, details) {
  const activity = {
    type,
    action,
    details,
    timestamp: new Date().toISOString(),
    adminId: currentUser?.id,
  };
  adminActivity.push(activity);
  saveAdminActivity();
}

// --- Event Listeners & App Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize scroll-based navbar behavior
  initScrollNavbar();

  // Navigation
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = e.target.getAttribute("data-section");
      if (section) {
        showSection(section);
        // Close mobile menu after navigation
        closeMobileMenu();
      }
    });
  });

  // Mobile hamburger menu functionality
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerMenu && navMenu) {
    hamburgerMenu.addEventListener("click", function () {
      toggleMobileMenu();
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Handle touch events for mobile
    hamburgerMenu.addEventListener("touchstart", function (e) {
      e.preventDefault();
      this.style.transform = "scale(0.95)";
    });

    hamburgerMenu.addEventListener("touchend", function (e) {
      e.preventDefault();
      this.style.transform = "";
      toggleMobileMenu();
    });

    // Close menu on escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMobileMenu();
      }
    });
  }

  // Auth buttons
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (loginBtn)
    loginBtn.addEventListener("click", () => showModal("loginModal"));
  if (registerBtn)
    registerBtn.addEventListener("click", () => showModal("registerModal"));
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Modal close buttons
  document.querySelectorAll(".close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", () => {
      const modal = closeBtn.closest(".modal");
      if (modal) modal.style.display = "none";
    });
  });
  // Modal background click
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) e.target.style.display = "none";
  });

  // Auth form switches
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");
  if (showRegister)
    showRegister.addEventListener("click", (e) => {
      e.preventDefault();
      hideModal("loginModal");
      showModal("registerModal");
    });
  if (showLogin)
    showLogin.addEventListener("click", (e) => {
      e.preventDefault();
      hideModal("registerModal");
      showModal("loginModal");
    });

  // Ensure all existing users have default profile pictures
  ensureAllUsersHaveProfilePictures();

  // Persist user session and last section across page refresh
  const storedUserId = localStorage.getItem(STORAGE_KEYS.currentUserId);
  const lastSection = localStorage.getItem(STORAGE_KEYS.lastSection);

  if (storedUserId && !currentUser) {
    fetchRemoteUsers().then((remoteUsers) => {
      users = remoteUsers;
      saveUsers();
      const user = users.find((u) => String(u.id) === String(storedUserId));
      if (user) {
        currentUser = user;

        // Ensure existing user has a profile picture (generate default if none exists)
        const profilePictureChanged = ensureUserHasProfilePicture(currentUser);
        if (profilePictureChanged) {
          // Save the updated user data if profile picture was added
          const userIndex = users.findIndex((u) => u.id === currentUser.id);
          if (userIndex !== -1) {
            users[userIndex] = currentUser;
            saveUsers();
          }
        }

        // Restore profile picture from all sources
        restoreProfilePictureOnLogin().then(() => {
          updateUIForUser();

          // Ensure profile picture is displayed immediately
          if (currentUser && currentUser.profilePicture) {
            setTimeout(() => {
              updateProfileButtonDisplay();
              updateProfileInfo();
            }, 10);
          }
        });
        // If lastSection is set and valid, show it, else show home
        if (
          lastSection &&
          [
            "home",
            "clubs",
            "discussions",
            "meetings",
            "progress",
            "admin",
          ].includes(lastSection)
        ) {
          showSection(lastSection);
        } else {
          showSection("home");
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.currentUserId);
        showSection("home");
      }
    });
  } else {
    // If lastSection is set and valid, show it, else show home
    if (
      lastSection &&
      [
        "home",
        "clubs",
        "discussions",
        "meetings",
        "progress",
        "admin",
      ].includes(lastSection)
    ) {
      showSection(lastSection);
    } else {
      showSection("home");
    }
  }

  // Setup profile dropdown functionality
  setupProfileDropdown();

  // Restore profile picture if user is already logged in
  if (currentUser && currentUser.profilePicture) {
    // Immediate update
    updateProfileButtonDisplay();
    updateProfileInfo();

    // Also update after a short delay to ensure DOM is fully ready
    setTimeout(() => {
      updateProfileButtonDisplay();
      updateProfileInfo();
    }, 50);

    // Additional update to ensure display
    setTimeout(() => {
      if (currentUser && currentUser.profilePicture) {
        updateProfileButtonDisplay();
        updateProfileInfo();
      }
    }, 100);
  }

  // Handle window resize for mobile menu
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      // Close mobile menu on larger screens
      closeMobileMenu();
    }
  });

  // Form submissions
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const createClubForm = document.getElementById("createClubForm");
  const discussionForm = document.getElementById("discussionForm");
  const meetingForm = document.getElementById("meetingForm");
  const progressForm = document.getElementById("progressForm");
  const editDiscussionForm = document.getElementById("editDiscussionForm");
  const editMeetingForm = document.getElementById("editMeetingForm");
  const editProgressForm = document.getElementById("editProgressForm");

  // Setup auto-save for forms

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      showLoginLoadingSpinner();

      setTimeout(async () => {
        const result = await loginUser(email, password);
        hideLoginLoadingSpinner();
        showNotification(
          result.success ? "success" : "error",
          "Login",
          result.message
        );
        if (result.success) {
          setTimeout(() => {
            hideModal("loginModal");

            // Immediately update profile display
            if (currentUser && currentUser.profilePicture) {
              updateProfileButtonDisplay();
              updateProfileInfo();
              console.log("Profile picture updated immediately after login");
            }

            // After login, go to lastSection if set, else home
            const lastSectionAfterLogin = localStorage.getItem(
              STORAGE_KEYS.lastSection
            );
            if (
              lastSectionAfterLogin &&
              [
                "home",
                "clubs",
                "discussions",
                "meetings",
                "progress",
                "admin",
              ].includes(lastSectionAfterLogin)
            ) {
              showSection(lastSectionAfterLogin);
            } else {
              showSection("home");
            }

            e.target.reset();
          }, 1500);
        }
      }, 1000);
    });
  }
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const password = document.getElementById("registerPassword").value;
      const confirmPassword = document.getElementById(
        "registerConfirmPassword"
      ).value;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        // Show error below password field instead of notification
        showPasswordFieldError("registerPassword", passwordValidation.message);
        return;
      }

      if (password !== confirmPassword) {
        // Show error below confirm password field instead of notification
        showPasswordFieldError(
          "registerConfirmPassword",
          "Passwords do not match. Please try again."
        );
        return;
      }

      const userData = {
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        password,
      };
      const result = await registerUser(userData);
      showNotification(
        result.success ? "success" : "error",
        "Registration",
        result.message
      );
      if (result.success) {
        hideModal("registerModal");
        showModal("loginModal");
        e.target.reset();
      }
    });
  }
  if (createClubForm) {
    createClubForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("create a book club")) return;
      const newClub = {
        id: clubs.length ? Math.max(...clubs.map((c) => c.id)) + 1 : 1,
        name: document.getElementById("clubName").value,
        description: document.getElementById("clubDescription").value,
        genre: document.getElementById("clubGenre").value,
        maxMembers:
          parseInt(document.getElementById("clubMaxMembers").value) || null,
        creatorId: currentUser.id,
        members: [currentUser.id],
        status: currentUser.isAdmin ? "approved" : "pending",
        createdAt: new Date().toISOString(),
      };
      clubs.push(newClub);
      currentUser.joinedClubs.push(newClub.id);
      saveClubs();
      saveUsers();
      if (newClub.status === "pending") {
        logAdminActivity("club", "New club pending approval", newClub.name);
        showNotification(
          "success",
          "Club Created",
          "Book club created successfully! It is now pending admin approval."
        );
      } else {
        showNotification(
          "success",
          "Club Created",
          "Book club created successfully!"
        );
      }
      hideModal("createClubModal");
      loadClubs();
      e.target.reset();
    });
  }
  if (discussionForm) {
    discussionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("post a discussion")) return;
      const clubId = document.getElementById("discussionClubSelect").value;
      if (!clubId) return alert("Please select a book club");
      const newDiscussion = {
        id: discussions.length
          ? Math.max(...discussions.map((d) => d.id)) + 1
          : 1,
        clubId: parseInt(clubId),
        title: document.getElementById("discussionTitle").value,
        content: document.getElementById("discussionContent").value,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      discussions.push(newDiscussion);
      saveDiscussions();
      e.target.reset();
      loadDiscussions();
      showNotification(
        "success",
        "Discussion Posted",
        "Discussion posted successfully!"
      );
    });
  }
  if (meetingForm) {
    meetingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("schedule a meeting")) return;

      // Validate all dates in the form
      if (!validateFormDates("meetingForm")) return;

      const clubId = document.getElementById("meetingClubSelect").value;
      if (!clubId) return alert("Please select a book club");
      const selectedDate = document.getElementById("meetingDate").value;

      // Validate that the selected date is not in the past
      const selectedDateTime = new Date(selectedDate);
      const currentDateTime = new Date();

      if (selectedDateTime <= currentDateTime) {
        showNotification(
          "error",
          "Invalid Date",
          "Please select a future date and time for the meeting."
        );
        return;
      }

      const newMeeting = {
        id: meetings.length ? Math.max(...meetings.map((m) => m.id)) + 1 : 1,
        clubId: parseInt(clubId),
        title: document.getElementById("meetingTitle").value,
        date: selectedDate,
        platform: document.getElementById("meetingPlatform").value,
        link: document.getElementById("meetingLink").value,
        description: document.getElementById("meetingDescription").value,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
      };
      meetings.push(newMeeting);
      saveMeetings();
      e.target.reset();
      clearDateInputs(); // Clear date inputs after form reset
      loadMeetings();
      showNotification(
        "success",
        "Meeting Scheduled",
        "Meeting scheduled successfully!"
      );
    });
  }
  if (progressForm) {
    progressForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("log reading progress")) return;

      const clubId = document.getElementById("progressClubSelect").value;
      if (!clubId) return alert("Please select a book club");

      const totalPages = parseInt(document.getElementById("totalPages").value);
      const pagesRead = parseInt(document.getElementById("pagesRead").value);

      // Validate that pages read doesn't exceed total pages
      if (pagesRead > totalPages) {
        showNotification(
          "error",
          "Invalid Input",
          "Pages read cannot exceed total pages for the book."
        );
        return;
      }

      // Validate that pages read is not negative
      if (pagesRead < 0) {
        showNotification(
          "error",
          "Invalid Input",
          "Pages read cannot be negative."
        );
        return;
      }

      // Validate that total pages is positive
      if (totalPages <= 0) {
        showNotification(
          "error",
          "Invalid Input",
          "Total pages must be greater than 0."
        );
        return;
      }

      const newProgress = {
        id: progress.length ? Math.max(...progress.map((p) => p.id)) + 1 : 1,
        clubId: parseInt(clubId),
        bookTitle: document.getElementById("bookTitle").value,
        author: document.getElementById("bookAuthor").value,
        totalPages: totalPages,
        pagesRead: pagesRead,
        notes: document.getElementById("readingNotes").value,
        userId: currentUser.id,
        userName: currentUser.name,
        createdAt: new Date().toISOString(),
      };

      progress.push(newProgress);
      saveProgress();
      e.target.reset();
      clearDateInputs(); // Clear date inputs after form reset
      loadProgress();
      showNotification(
        "success",
        "Progress Logged",
        "Reading progress logged successfully!"
      );
    });
  }

  // Edit form submissions
  if (editDiscussionForm) {
    editDiscussionForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("edit a discussion")) return;

      const discussionId = parseInt(
        document.getElementById("editDiscussionId").value
      );
      const discussion = discussions.find((d) => d.id === discussionId);

      if (!discussion) {
        showNotification("error", "Error", "Discussion not found.");
        return;
      }

      if (discussion.authorId !== currentUser.id) {
        showNotification(
          "error",
          "Access Denied",
          "You can only edit your own discussions."
        );
        return;
      }

      // Update the discussion
      discussion.title = document.getElementById("editDiscussionTitle").value;
      discussion.content = document.getElementById(
        "editDiscussionContent"
      ).value;

      saveDiscussions();
      hideModal("editDiscussionModal");
      loadDiscussions();
      showNotification(
        "success",
        "Discussion Updated",
        "Discussion has been updated successfully!"
      );
      e.target.reset();
    });
  }

  if (editMeetingForm) {
    editMeetingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("edit a meeting")) return;

      // Validate all dates in the form
      if (!validateFormDates("editMeetingForm")) return;

      const meetingId = parseInt(
        document.getElementById("editMeetingId").value
      );
      const meeting = meetings.find((m) => m.id === meetingId);

      if (!meeting) {
        showNotification("error", "Error", "Meeting not found.");
        return;
      }

      if (meeting.createdBy !== currentUser.id) {
        showNotification(
          "error",
          "Access Denied",
          "You can only edit your own meetings."
        );
        return;
      }

      const selectedDate = document.getElementById("editMeetingDate").value;

      // Validate that the selected date is not in the past
      const selectedDateTime = new Date(selectedDate);
      const currentDateTime = new Date();

      if (selectedDateTime <= currentDateTime) {
        showNotification(
          "error",
          "Invalid Date",
          "Please select a future date and time for the meeting."
        );
        return;
      }

      // Update the meeting
      meeting.title = document.getElementById("editMeetingTitle").value;
      meeting.date = selectedDate;
      meeting.platform = document.getElementById("editMeetingPlatform").value;
      meeting.link = document.getElementById("editMeetingLink").value;
      meeting.description = document.getElementById(
        "editMeetingDescription"
      ).value;

      saveMeetings();
      hideModal("editMeetingModal");
      loadMeetings();
      showNotification(
        "success",
        "Meeting Updated",
        "Meeting has been updated successfully!"
      );
      e.target.reset();
      clearDateInputs(); // Clear date inputs after form reset
    });
  }

  if (editProgressForm) {
    editProgressForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!requireLogin("edit reading progress")) return;

      const progressId = parseInt(
        document.getElementById("editProgressId").value
      );
      const progressEntry = progress.find((p) => p.id === progressId);

      if (!progressEntry) {
        showNotification("error", "Error", "Progress entry not found.");
        return;
      }

      if (progressEntry.userId !== currentUser.id) {
        showNotification(
          "error",
          "Access Denied",
          "You can only edit your own progress entries."
        );
        return;
      }

      const totalPages = parseInt(
        document.getElementById("editTotalPages").value
      );
      const pagesRead = parseInt(
        document.getElementById("editPagesRead").value
      );

      // Validate that pages read doesn't exceed total pages
      if (pagesRead > totalPages) {
        showNotification(
          "error",
          "Invalid Input",
          "Pages read cannot exceed total pages for the book."
        );
        return;
      }

      // Validate that pages read is not negative
      if (pagesRead < 0) {
        showNotification(
          "error",
          "Invalid Input",
          "Pages read cannot be negative."
        );
        return;
      }

      // Validate that total pages is positive
      if (totalPages <= 0) {
        showNotification(
          "error",
          "Invalid Input",
          "Total pages must be greater than 0."
        );
        return;
      }

      // Update the progress entry
      progressEntry.bookTitle = document.getElementById("editBookTitle").value;
      progressEntry.author = document.getElementById("editBookAuthor").value;
      progressEntry.totalPages = totalPages;
      progressEntry.pagesRead = pagesRead;
      progressEntry.notes = document.getElementById("editReadingNotes").value;

      saveProgress();
      hideModal("editProgressModal");
      loadProgress();
      showNotification(
        "success",
        "Progress Updated",
        "Reading progress has been updated successfully!"
      );
      e.target.reset();
    });
  }

  // Club creation button
  const createClubBtn = document.getElementById("createClubBtn");
  if (createClubBtn) {
    createClubBtn.addEventListener("click", () => {
      if (!requireLogin("create a book club")) return;
      showModal("createClubModal");
    });
  }

  // Add real-time validation for progress forms
  setupProgressValidation();

  // Add real-time password validation
  setupPasswordValidation();

  // Initialize date validation to prevent past dates
  preventPastDates();

  // Start continuous date validation to keep minimum dates current
  startContinuousDateValidation();

  // Enhance date input user experience
  enhanceDateInputs();

  // Initialize UI
  updateUIForUser();
  // Section is now shown above based on lastSection or home

  // Check for remembered users on page load
  checkForRememberedUser();
});

// Enhanced cross-browser user checking
async function checkForRememberedUser() {
  try {
    // Check multiple storage methods for remembered user
    let rememberedUser = await crossBrowserStorage.get(
      "bookclub_remembered_user"
    );

    if (!rememberedUser) {
      // Fallback to localStorage
      try {
        const localRemembered = localStorage.getItem(
          "bookclub_remembered_user"
        );
        if (localRemembered) {
          rememberedUser = JSON.parse(localRemembered);
        }
      } catch (e) {
        console.log("localStorage remember me check failed");
      }
    }

    if (rememberedUser && rememberedUser.email && rememberedUser.userId) {
      // Check if the remembered user is still valid
      const users = await fetchRemoteUsers();
      const user = users.find(
        (u) =>
          u.id === rememberedUser.userId && u.email === rememberedUser.email
      );

      if (user) {
        // Auto-login the remembered user
        currentUser = user;
        localStorage.setItem(STORAGE_KEYS.currentUserId, user.id);

        // Show user greeting immediately
        const userGreeting = document.getElementById("userGreeting");
        const usernameDisplay = document.getElementById("usernameDisplay");
        if (userGreeting) userGreeting.style.display = "flex";
        if (usernameDisplay) usernameDisplay.textContent = user.name;

        updateUIForUser();
        showNotification(
          "success",
          "Welcome Back!",
          `Welcome back, ${user.name}! Cross-browser sync active.`
        );

        // Show the last section they were on
        const lastSection = localStorage.getItem(STORAGE_KEYS.lastSection);
        if (
          lastSection &&
          [
            "home",
            "clubs",
            "discussions",
            "meetings",
            "progress",
            "admin",
          ].includes(lastSection)
        ) {
          showSection(lastSection);
        } else {
          showSection("home");
        }
      }
    }
  } catch (e) {
    console.error("Error checking for remembered user:", e);
  }
}

// Show cross-browser sync status
function showCrossBrowserSyncStatus() {
  const storageType = crossBrowserStorage.activeStorage.type;
  showNotification(
    "info",
    "Storage Status",
    `Using ${storageType} for cross-browser compatibility.`
  );
}

// --- Profile Management Functions ---
function updateProfileInfo() {
  if (!currentUser) return;

  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileIcon = document.getElementById("profileIcon");
  const profileImage = document.getElementById("profileImage");
  const profileIconLarge = document.getElementById("profileIconLarge");
  const profileImageLarge = document.getElementById("profileImageLarge");

  if (profileName) profileName.textContent = currentUser.name;
  if (profileEmail) profileEmail.textContent = currentUser.email;

  // Check if user has a profile picture
  if (currentUser.profilePicture) {
    // Pre-load and display profile images
    const preloadImage = (imgElement, iconElement) => {
      if (!imgElement || !iconElement) return;

      const img = new Image();
      img.onload = function () {
        imgElement.src = currentUser.profilePicture;
        imgElement.style.display = "block";
        iconElement.style.display = "none";
      };
      img.onerror = function () {
        console.error("Profile picture failed to load");
        imgElement.style.display = "none";
        iconElement.style.display = "block";
      };
      img.src = currentUser.profilePicture;
    };

    // Update main profile button
    preloadImage(profileImage, profileIcon);

    // Update dropdown profile picture
    preloadImage(profileImageLarge, profileIconLarge);
  } else {
    if (profileImage) profileImage.style.display = "none";
    if (profileIcon) profileIcon.style.display = "block";
    if (profileImageLarge) profileImageLarge.style.display = "none";
    if (profileIconLarge) profileIconLarge.style.display = "block";
  }
}

// Function to update the main profile button display
function updateProfileButtonDisplay() {
  if (!currentUser) return;

  const profileIcon = document.getElementById("profileIcon");
  const profileImage = document.getElementById("profileImage");

  if (!profileIcon || !profileImage) {
    // Elements not ready, retry with shorter delay
    setTimeout(() => updateProfileButtonDisplay(), 50);
    return;
  }

  if (currentUser.profilePicture) {
    // Pre-load the image to ensure it's ready
    const img = new Image();
    img.onload = function () {
      // Image loaded successfully, now display it
      profileIcon.style.display = "none";
      profileImage.src = currentUser.profilePicture;
      profileImage.style.display = "block";

      // Force a reflow to ensure the image is displayed
      profileImage.offsetHeight;
      console.log("Profile picture displayed immediately");
    };

    img.onerror = function () {
      console.error(
        "Profile picture failed to load, generating default picture"
      );
      // Generate default profile picture when image fails to load
      const defaultProfilePicture = generateDefaultProfilePicture(
        currentUser.name
      );
      currentUser.profilePicture = defaultProfilePicture;

      // Update user in users array
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].profilePicture = defaultProfilePicture;
        saveUsers();
      }

      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      try {
        sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      } catch (e) {}

      // Display the default picture
      profileIcon.style.display = "none";
      profileImage.src = defaultProfilePicture;
      profileImage.style.display = "block";
    };

    // Start loading the image
    img.src = currentUser.profilePicture;
  } else {
    // User has no profile picture, generate default one
    const defaultProfilePicture = generateDefaultProfilePicture(
      currentUser.name
    );
    currentUser.profilePicture = defaultProfilePicture;

    // Update user in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].profilePicture = defaultProfilePicture;
      saveUsers();
    }

    // Update current user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Display the default picture
    profileIcon.style.display = "none";
    profileImage.src = defaultProfilePicture;
    profileImage.style.display = "block";
  }
}

// Function to force refresh profile picture display
function forceRefreshProfilePicture() {
  if (!currentUser || !currentUser.profilePicture) return;

  const profileIcon = document.getElementById("profileIcon");
  const profileImage = document.getElementById("profileImage");

  if (profileIcon && profileImage) {
    // Temporarily hide both
    profileIcon.style.display = "none";
    profileImage.style.display = "none";

    // Force a reflow
    profileIcon.offsetHeight;

    // Show the image
    profileImage.src = currentUser.profilePicture + "?t=" + Date.now();
    profileImage.style.display = "block";

    console.log("Profile picture display force refreshed");
  }
}

// Mobile menu functions
function toggleMobileMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerMenu && navMenu) {
    hamburgerMenu.classList.toggle("active");
    navMenu.classList.toggle("active");

    // Prevent body scroll when menu is open
    if (navMenu.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
}

function closeMobileMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerMenu && navMenu) {
    hamburgerMenu.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function openMobileMenu() {
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerMenu && navMenu) {
    hamburgerMenu.classList.add("active");
    navMenu.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

// Function to sync profile picture data between currentUser and users array
function syncProfilePictureData() {
  if (!currentUser) return;

  // Check if currentUser has profile picture but it's not in users array
  const userInArray = users.find((u) => u.id === currentUser.id);
  if (
    userInArray &&
    userInArray.profilePicture !== currentUser.profilePicture
  ) {
    // Sync from users array to currentUser
    currentUser.profilePicture = userInArray.profilePicture;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }
}

// Function to validate profile picture data
function validateProfilePicture(profilePicture) {
  if (!profilePicture) return false;

  // Check if it's a valid data URL
  if (
    typeof profilePicture === "string" &&
    profilePicture.startsWith("data:image/")
  ) {
    return true;
  }

  return false;
}

// Function to test if a profile picture can be loaded
function testProfilePictureLoad(profilePicture) {
  return new Promise((resolve) => {
    if (!profilePicture) {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = function () {
      resolve(true);
    };
    img.onerror = function () {
      resolve(false);
    };
    img.src = profilePicture;

    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}

// Function to clean up corrupted profile picture data
async function cleanupProfilePictureData() {
  if (!currentUser) return;

  // Check if currentUser has corrupted profile picture data
  if (
    currentUser.profilePicture &&
    !validateProfilePicture(currentUser.profilePicture)
  ) {
    console.warn("Corrupted profile picture data detected, cleaning up...");
    // Generate default profile picture instead of setting to null
    const defaultProfilePicture = generateDefaultProfilePicture(
      currentUser.name
    );
    currentUser.profilePicture = defaultProfilePicture;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Also update in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].profilePicture = defaultProfilePicture;
      saveUsers();
    }
    return;
  }

  // Test if the profile picture can actually be loaded
  if (currentUser.profilePicture) {
    const canLoad = await testProfilePictureLoad(currentUser.profilePicture);
    if (!canLoad) {
      console.warn("Profile picture cannot be loaded, cleaning up...");
      // Generate default profile picture instead of setting to null
      const defaultProfilePicture = generateDefaultProfilePicture(
        currentUser.name
      );
      currentUser.profilePicture = defaultProfilePicture;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Also update in users array
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].profilePicture = defaultProfilePicture;
        saveUsers();
      }
    }
  }
}

// Function to compress image for better localStorage compatibility
function compressImage(file, maxWidth = 200, maxHeight = 200, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = function () {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Function to migrate old profile picture data format
function migrateProfilePictureData() {
  if (!currentUser) return;

  // Check if profile picture exists but needs migration
  if (
    currentUser.profilePicture &&
    typeof currentUser.profilePicture === "string"
  ) {
    // If it's already a data URL, no migration needed
    if (currentUser.profilePicture.startsWith("data:image/")) {
      return;
    }

    // If it's a file path or other format, remove it and generate default
    console.warn("Old profile picture format detected, generating default...");
    const defaultProfilePicture = generateDefaultProfilePicture(
      currentUser.name
    );
    currentUser.profilePicture = defaultProfilePicture;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // Also update in users array
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].profilePicture = defaultProfilePicture;
      saveUsers();
    }
  }
}

// Function to sync profile picture across browsers
async function syncProfilePictureAcrossBrowsers() {
  if (!currentUser) return;

  try {
    // Try to get profile picture from cross-browser storage
    const crossBrowserData = await crossBrowserStorage.get(
      "bookclub_profile_picture_" + currentUser.id
    );
    if (crossBrowserData && crossBrowserData.profilePicture) {
      // Update current user with cross-browser profile picture
      currentUser.profilePicture = crossBrowserData.profilePicture;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Also update in users array
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].profilePicture = crossBrowserData.profilePicture;
        saveUsers();
      }

      console.log("Profile picture synced from cross-browser storage");
    }
  } catch (error) {
    console.log("Cross-browser profile picture sync failed:", error);
  }
}

// Function to restore profile picture when logging in
async function restoreProfilePictureOnLogin() {
  if (!currentUser) return;

  try {
    console.log("Restoring profile picture for user:", currentUser.id);

    // First, try to get profile picture from cross-browser storage
    await syncProfilePictureAcrossBrowsers();

    // Then, check if we need to sync from users array
    const userInArray = users.find((u) => u.id === currentUser.id);
    if (
      userInArray &&
      userInArray.profilePicture &&
      !currentUser.profilePicture
    ) {
      // Restore profile picture from users array
      currentUser.profilePicture = userInArray.profilePicture;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      console.log("Profile picture restored from users array");
    }

    // Check if profile picture exists in localStorage but not in currentUser
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.profilePicture && !currentUser.profilePicture) {
          currentUser.profilePicture = parsedUser.profilePicture;
          console.log("Profile picture restored from localStorage");
        }
      } catch (e) {
        console.log("Failed to parse stored user data");
      }
    }

    // Check if profile picture exists in sessionStorage
    const sessionUser = sessionStorage.getItem("currentUser");
    if (sessionUser) {
      try {
        const parsedSessionUser = JSON.parse(sessionUser);
        if (parsedSessionUser.profilePicture && !currentUser.profilePicture) {
          currentUser.profilePicture = parsedSessionUser.profilePicture;
          console.log("Profile picture restored from sessionStorage");
        }
      } catch (e) {
        console.log("Failed to parse session user data");
      }
    }

    // Finally, ensure the profile picture is valid
    if (currentUser.profilePicture) {
      await cleanupProfilePictureData();
      if (!currentUser.profilePicture) {
        console.log("Profile picture was invalid and has been cleaned up");
      } else {
        console.log(
          "Profile picture successfully restored:",
          currentUser.profilePicture.substring(0, 50) + "..."
        );

        // Immediately update the UI to show the profile picture
        updateProfileButtonDisplay();
        updateProfileInfo();
      }
    } else {
      console.log("No profile picture found for user");
    }
  } catch (error) {
    console.log("Profile picture restoration failed:", error);
  }
}

function setupProfileDropdown() {
  const profileBtn = document.getElementById("profileBtn");
  const profileDropdown = document.getElementById("profileDropdown");
  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const deletePhotoBtn = document.getElementById("deletePhotoBtn");
  const profileLogoutBtn = document.getElementById("profileLogoutBtn");

  if (profileBtn) {
    profileBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      profileDropdown.classList.toggle("active");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !profileBtn?.contains(e.target) &&
      !profileDropdown?.contains(e.target)
    ) {
      profileDropdown?.classList.remove("active");
    }
  });

  // Change photo functionality
  if (changePhotoBtn) {
    changePhotoBtn.addEventListener("click", function () {
      const fileInput = document.getElementById("profilePictureInput");
      if (fileInput) {
        fileInput.click();
      }
    });
  }

  // Handle file input change
  const fileInput = document.getElementById("profilePictureInput");
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        // Validate file size (max 2MB for better localStorage compatibility)
        if (file.size > 2 * 1024 * 1024) {
          showNotification(
            "error",
            "File Too Large",
            "Please select an image smaller than 2MB for better compatibility."
          );
          return;
        }

        // Show loading state
        const profilePicture = document.getElementById("profilePicture");
        const profilePictureLarge = document.getElementById(
          "profilePictureLarge"
        );
        if (profilePicture) profilePicture.classList.add("loading");
        if (profilePictureLarge) profilePictureLarge.classList.add("loading");

        // Compress and process the image
        compressImage(file)
          .then((compressedImageData) => {
            // Validate the compressed image data
            if (!validateProfilePicture(compressedImageData)) {
              showNotification(
                "error",
                "Invalid Image",
                "The selected file is not a valid image. Please try again."
              );
              return;
            }

            currentUser.profilePicture = compressedImageData;

            // Update user in users array
            const userIndex = users.findIndex((u) => u.id === currentUser.id);
            if (userIndex !== -1) {
              users[userIndex].profilePicture = compressedImageData;
              saveUsers();
            }

            // Update current user in localStorage
            localStorage.setItem("currentUser", JSON.stringify(currentUser));

            // Also save to sessionStorage for better persistence
            try {
              sessionStorage.setItem(
                "currentUser",
                JSON.stringify(currentUser)
              );
            } catch (error) {
              console.log("sessionStorage save failed:", error);
            }

            // Also save to cross-browser storage
            try {
              crossBrowserStorage.set(
                "bookclub_profile_picture_" + currentUser.id,
                {
                  profilePicture: compressedImageData,
                  timestamp: Date.now(),
                }
              );
            } catch (error) {
              console.log("Cross-browser storage failed:", error);
            }

            // Remove loading state
            if (profilePicture) profilePicture.classList.remove("loading");
            if (profilePictureLarge)
              profilePictureLarge.classList.remove("loading");

            updateProfileInfo();
            updateProfileButtonDisplay();
            showNotification(
              "success",
              "Profile Updated",
              "Profile picture has been updated successfully!"
            );
          })
          .catch((error) => {
            console.error("Image compression failed:", error);
            showNotification(
              "error",
              "Upload Failed",
              "Failed to process the image. Please try again."
            );

            // Remove loading state on error
            if (profilePicture) profilePicture.classList.remove("loading");
            if (profilePictureLarge)
              profilePictureLarge.classList.remove("loading");
          });
      }

      // Reset file input
      fileInput.value = "";
    });
  }

  // Delete photo functionality
  if (deletePhotoBtn) {
    deletePhotoBtn.addEventListener("click", function () {
      if (currentUser.profilePicture) {
        // Generate default profile picture when removing custom photo
        const defaultProfilePicture = generateDefaultProfilePicture(
          currentUser.name
        );
        currentUser.profilePicture = defaultProfilePicture;

        // Update user in users array
        const userIndex = users.findIndex((u) => u.id === currentUser.id);
        if (userIndex !== -1) {
          users[userIndex].profilePicture = defaultProfilePicture;
          saveUsers();
        }

        // Update current user in localStorage
        localStorage.setItem("currentUser", JSON.stringify(currentUser));

        // Also update sessionStorage
        try {
          sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
        } catch (error) {
          console.log("sessionStorage update failed:", error);
        }

        // Also update cross-browser storage with default picture
        try {
          crossBrowserStorage.set(
            "bookclub_profile_picture_" + currentUser.id,
            {
              profilePicture: defaultProfilePicture,
              timestamp: Date.now(),
            }
          );
        } catch (error) {
          console.log("Cross-browser storage update failed:", error);
        }

        updateProfileInfo();
        updateProfileButtonDisplay();
        showNotification(
          "success",
          "Profile Updated",
          "Profile picture has been removed and replaced with default initials!"
        );
      } else {
        showNotification(
          "info",
          "No Picture",
          "You don't have a profile picture to remove."
        );
      }
    });
  }

  // Profile logout functionality
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener("click", function () {
      logout();
      profileDropdown.classList.remove("active");
    });
  }
}

// --- Login Protection System ---
function requireLogin(action = "access this feature") {
  if (!currentUser) {
    showNotification("warning", "Login Required", `Please login to ${action}.`);
    showModal("loginModal");
    return false;
  }
  return true;
}

// Function to update UI when a club is approved/rejected (called from admin panel)
function updateClubUI(clubId, action) {
  // Refresh all relevant displays
  refreshClubsDisplay();

  // Trigger a localStorage event to notify other parts of the app
  const updateEvent = {
    type: "clubStatusChanged",
    clubId: clubId,
    action: action,
    timestamp: Date.now(),
  };

  // Store the event in localStorage to trigger the storage event
  localStorage.setItem("clubUpdateEvent", JSON.stringify(updateEvent));

  // Show notification about the action
  const club = clubs.find((c) => c.id === clubId);
  if (club) {
    if (action === "approved") {
      showNotification(
        "success",
        "Club Approved",
        `"${club.name}" is now available to join!`
      );
    } else if (action === "rejected") {
      showNotification(
        "info",
        "Club Rejected",
        `"${club.name}" has been removed.`
      );
    }
  }
}

// Function to update UI when a club status change event is received
function updateClubUIFromEvent(clubId, action) {
  // Refresh all relevant displays
  refreshClubsDisplay();

  // Show notification about the action
  const club = clubs.find((c) => c.id === clubId);
  if (club) {
    if (action === "approved") {
      showNotification(
        "success",
        "Club Approved",
        `"${club.name}" is now available to join!`
      );
    } else if (action === "rejected") {
      showNotification(
        "info",
        "Club Rejected",
        `"${club.name}" has been removed.`
      );
    }
  }
}

// Listen for club status changes from admin panel
window.addEventListener("storage", function (e) {
  if (e.key === "clubUpdateEvent") {
    try {
      const updateEvent = JSON.parse(e.newValue);
      if (updateEvent && updateEvent.type === "clubStatusChanged") {
        // Update the UI based on the club status change
        updateClubUIFromEvent(updateEvent.clubId, updateEvent.action);
      }
    } catch (error) {
      console.error("Error parsing club update event:", error);
    }
  }
});

// Function to refresh clubs display when club status changes
function refreshClubsDisplay() {
  // Refresh clubs list if we're on the clubs section
  if (document.getElementById("clubsGrid")) {
    loadClubs();
  }

  // Refresh featured content if we're on the home section
  if (document.getElementById("popularClubs")) {
    loadPopularClubs();
  }

  // Refresh admin stats if we're on the admin section
  if (document.getElementById("adminStats")) {
    updateAdminStats();
  }

  // Refresh pending approvals if we're on the admin section
  if (document.getElementById("pendingApprovalsList")) {
    loadPendingApprovals();
  }
}

// Periodic check to ensure UI stays in sync with club status changes
setInterval(() => {
  // Check if there are any pending clubs that should be visible
  const pendingClubs = clubs.filter((club) => club.status === "pending");
  const approvedClubs = clubs.filter((club) => club.status === "approved");

  // If we're on the clubs section and there are approved clubs, refresh the display
  if (document.getElementById("clubsGrid") && approvedClubs.length > 0) {
    const currentDisplayedClubs = document.querySelectorAll(".club-card");
    if (currentDisplayedClubs.length !== approvedClubs.length) {
      loadClubs();
    }
  }
}, 5000); // Check every 5 seconds

// Function to immediately update clubs display (for same-window admin actions)
function immediateClubUpdate(clubId, action) {
  // Immediately refresh the clubs display
  refreshClubsDisplay();

  // Show immediate notification
  const club = clubs.find((c) => c.id === clubId);
  if (club) {
    if (action === "approved") {
      showNotification(
        "success",
        "Club Approved",
        `"${club.name}" is now available to join!`
      );
    } else if (action === "rejected") {
      showNotification(
        "info",
        "Club Rejected",
        `"${club.name}" has been removed.`
      );
    }
  }
}

// Setup real-time validation for progress forms
function setupProgressValidation() {
  // New progress form validation
  const totalPagesInput = document.getElementById("totalPages");
  const pagesReadInput = document.getElementById("pagesRead");

  if (totalPagesInput && pagesReadInput) {
    // Validate pages read when total pages changes
    totalPagesInput.addEventListener("input", () => {
      validateProgressInputs(totalPagesInput, pagesReadInput);
    });

    // Validate pages read when it changes
    pagesReadInput.addEventListener("input", () => {
      validateProgressInputs(totalPagesInput, pagesReadInput);
    });
  }

  // Edit progress form validation
  const editTotalPagesInput = document.getElementById("editTotalPages");
  const editPagesReadInput = document.getElementById("editPagesRead");

  if (editTotalPagesInput && editPagesReadInput) {
    // Validate pages read when total pages changes
    editTotalPagesInput.addEventListener("input", () => {
      validateProgressInputs(editTotalPagesInput, editPagesReadInput);
    });

    // Validate pages read when it changes
    editPagesReadInput.addEventListener("input", () => {
      validateProgressInputs(editTotalPagesInput, editPagesReadInput);
    });
  }
}

// Validate progress input fields in real-time
function validateProgressInputs(totalPagesInput, pagesReadInput) {
  const totalPages = parseInt(totalPagesInput.value) || 0;
  const pagesRead = parseInt(pagesReadInput.value) || 0;

  // Reset previous validation states
  totalPagesInput.style.borderColor = "";
  pagesReadInput.style.borderColor = "";

  // Remove previous error messages
  removeProgressErrorMessages();

  let hasError = false;

  // Validate total pages
  if (totalPages <= 0) {
    totalPagesInput.style.borderColor = "#ef4444";
    showProgressErrorMessage(
      totalPagesInput,
      "Total pages must be greater than 0"
    );
    hasError = true;
  }

  // Validate pages read
  if (pagesRead < 0) {
    pagesReadInput.style.borderColor = "#ef4444";
    showProgressErrorMessage(pagesReadInput, "Pages read cannot be negative");
    hasError = true;
  }

  // Validate that pages read doesn't exceed total pages
  if (totalPages > 0 && pagesRead > totalPages) {
    pagesReadInput.style.borderColor = "#ef4444";
    showProgressErrorMessage(
      pagesReadInput,
      `Pages read cannot exceed ${totalPages} (total pages)`
    );
    hasError = true;
  }

  // If no errors, show success state
  if (
    !hasError &&
    totalPages > 0 &&
    pagesRead >= 0 &&
    pagesRead <= totalPages
  ) {
    totalPagesInput.style.borderColor = "#10b981";
    pagesReadInput.style.borderColor = "#10b981";
  }
}

// Show error message below input field
function showProgressErrorMessage(inputElement, message) {
  // Remove any existing error message
  removeProgressErrorMessages();

  const errorDiv = document.createElement("div");
  errorDiv.className = "progress-error-message";
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    font-weight: 500;
  `;
  errorDiv.textContent = message;

  // Insert error message after the input field
  inputElement.parentNode.appendChild(errorDiv);
}

// Remove all progress error messages
function removeProgressErrorMessages() {
  const errorMessages = document.querySelectorAll(".progress-error-message");
  errorMessages.forEach((msg) => msg.remove());
}

// Setup real-time password validation
function setupPasswordValidation() {
  const passwordInput = document.getElementById("registerPassword");
  const confirmPasswordInput = document.getElementById(
    "registerConfirmPassword"
  );

  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      validatePasswordInput(passwordInput);
    });

    passwordInput.addEventListener("blur", () => {
      validatePasswordInput(passwordInput);
    });
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", () => {
      validateConfirmPassword(passwordInput, confirmPasswordInput);
    });

    confirmPasswordInput.addEventListener("blur", () => {
      validateConfirmPassword(passwordInput, confirmPasswordInput);
    });
  }
}

// Validate password strength in real-time
function validatePasswordInput(passwordInput) {
  const password = passwordInput.value;

  // Remove previous validation states and messages
  removePasswordValidationMessages();
  passwordInput.style.borderColor = "";

  if (password.length === 0) {
    return; // Don't show validation for empty field
  }

  const validation = validatePasswordStrength(password);

  if (validation.isValid) {
    passwordInput.style.borderColor = "#10b981"; // Green for valid
    showPasswordStrengthIndicator(passwordInput, "strong", "Strong password!");
  } else {
    passwordInput.style.borderColor = "#ef4444"; // Red for invalid
    showPasswordStrengthIndicator(passwordInput, "weak", validation.message);
  }
}

// Validate confirm password
function validateConfirmPassword(passwordInput, confirmPasswordInput) {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Remove previous validation messages
  removePasswordValidationMessages();
  confirmPasswordInput.style.borderColor = "";

  if (confirmPassword.length === 0) {
    return; // Don't show validation for empty field
  }

  if (password === confirmPassword) {
    confirmPasswordInput.style.borderColor = "#10b981"; // Green for match
    showPasswordStrengthIndicator(
      confirmPasswordInput,
      "match",
      "Passwords match!"
    );
  } else {
    confirmPasswordInput.style.borderColor = "#ef4444"; // Red for mismatch
    showPasswordStrengthIndicator(
      confirmPasswordInput,
      "mismatch",
      "Passwords do not match"
    );
  }
}

// Show password strength indicator
function showPasswordStrengthIndicator(inputElement, type, message) {
  // Remove any existing indicator
  removePasswordValidationMessages();

  const indicatorDiv = document.createElement("div");
  indicatorDiv.className = "password-strength-indicator";

  let color, icon;
  switch (type) {
    case "strong":
      color = "#10b981";
      icon = "✅";
      break;
    case "weak":
      color = "#ef4444";
      icon = "❌";
      break;
    case "match":
      color = "#10b981";
      icon = "✅";
      break;
    case "mismatch":
      color = "#ef4444";
      icon = "❌";
      break;
  }

  indicatorDiv.style.cssText = `
    color: ${color};
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
    font-weight: 500;
    display: block;
    text-align: left;
    padding: 0.2rem 0;
  `;
  indicatorDiv.innerHTML = `${icon} ${message}`;

  // Find the form-group container and insert indicator below it
  const formGroup = inputElement.closest(".form-group");
  if (formGroup) {
    // Insert after the form-group, not inside it
    formGroup.parentNode.insertBefore(indicatorDiv, formGroup.nextSibling);
  } else {
    // Fallback: insert after the input field
    inputElement.parentNode.appendChild(indicatorDiv);
  }
}

// Remove all password validation messages
function removePasswordValidationMessages() {
  const indicators = document.querySelectorAll(".password-strength-indicator");
  indicators.forEach((indicator) => indicator.remove());

  const fieldErrors = document.querySelectorAll(".password-field-error");
  fieldErrors.forEach((error) => error.remove());
}

// Show password field error below the input
function showPasswordFieldError(inputId, message) {
  // Remove any existing error messages
  removePasswordValidationMessages();

  const inputElement = document.getElementById(inputId);
  if (!inputElement) return;

  const errorDiv = document.createElement("div");
  errorDiv.className = "password-field-error";
  errorDiv.style.cssText = `
    color: #ef4444;
    font-size: 0.85rem;
    margin-bottom: 0.7rem;
    font-weight: 500;
    padding: 0.2rem 0;
    text-align: left;
  `;
  errorDiv.innerHTML = `❌ ${message}`;

  // Find the form-group container and insert error below it
  const formGroup = inputElement.closest(".form-group");
  if (formGroup) {
    // Insert after the form-group, not inside it
    formGroup.parentNode.insertBefore(errorDiv, formGroup.nextSibling);
  } else {
    // Fallback: insert after the input field
    inputElement.parentNode.appendChild(errorDiv);
  }
}

// Comprehensive password strength validation
function validatePasswordStrength(password) {
  const requirements = {
    minLength: 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    hasNoSpaces: !/\s/.test(password),
  };

  const errors = [];

  if (password.length < requirements.minLength) {
    errors.push(`At least ${requirements.minLength} characters`);
  }

  if (!requirements.hasUppercase) {
    errors.push("At least one uppercase letter (A-Z)");
  }

  if (!requirements.hasLowercase) {
    errors.push("At least one lowercase letter (a-z)");
  }

  if (!requirements.hasNumber) {
    errors.push("At least one number (0-9)");
  }

  if (!requirements.hasSymbol) {
    errors.push("At least one symbol (!@#$%^&*...)");
  }

  if (!requirements.hasNoSpaces) {
    errors.push("No spaces allowed");
  }

  if (errors.length === 0) {
    return {
      isValid: true,
      message: "Password meets all requirements",
    };
  } else {
    return {
      isValid: false,
      message: `Password must contain: ${errors.join(", ")}`,
    };
  }
}
