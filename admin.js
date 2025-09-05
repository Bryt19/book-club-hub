// Admin Panel JavaScript

// --- Default Admin Credentials (universal, not stored in localStorage) ---
const DEFAULT_ADMIN = {
  id: 1,
  name: "Admin",
  email: "admin@bookclub.com",
  password: "admin123",
  isAdmin: true,
  createdAt: "2024-01-01T00:00:00.000Z",
};

let currentAdmin = null;
let users = [];
let clubs = [];
let discussions = [];
let meetings = [];
let progress = [];
let adminActivity = [];

// Password toggle function (global)
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const button = input.parentElement.querySelector(".password-toggle");
  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.className = "fas fa-eye-slash";
    button.classList.add("show");
  } else {
    input.type = "password";
    icon.className = "fas fa-eye";
    button.classList.remove("show");
  }
}

// Notification system (global)
function showNotification(type, title, message, duration = 5000) {
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
    <div class="notification-icon">
      <i class="${icons[type] || icons.info}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="removeNotification(this)">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(notification);

  // Auto remove after duration
  setTimeout(() => {
    removeNotification(notification.querySelector(".notification-close"));
  }, duration);
}

function removeNotification(button) {
  const notification = button.closest(".notification");
  if (notification) {
    notification.classList.add("removing");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }
}

// Load data from localStorage and cross-browser storage
function loadData() {
  try {
    // Try to load from main application storage first
    let mainUsers = JSON.parse(localStorage.getItem("users")) || [];
    let mainClubs = JSON.parse(localStorage.getItem("clubs")) || [];
    let mainDiscussions = JSON.parse(localStorage.getItem("discussions")) || [];
    let mainMeetings = JSON.parse(localStorage.getItem("meetings")) || [];
    let mainProgress = JSON.parse(localStorage.getItem("progress")) || [];
    let mainAdminActivity =
      JSON.parse(localStorage.getItem("adminActivity")) || [];

    // Also try to load from cross-browser storage
    try {
      const crossUsers =
        JSON.parse(localStorage.getItem("bookclub_users_global")) || [];
      const crossClubs =
        JSON.parse(localStorage.getItem("bookclub_clubs_global")) || [];
      const crossDiscussions =
        JSON.parse(localStorage.getItem("bookclub_discussions_global")) || [];
      const crossMeetings =
        JSON.parse(localStorage.getItem("bookclub_meetings_global")) || [];
      const crossProgress =
        JSON.parse(localStorage.getItem("bookclub_progress_global")) || [];

      // Use cross-browser data if it's more recent or if main data is empty
      if (crossUsers.length > 0) mainUsers = crossUsers;
      if (crossClubs.length > 0) mainClubs = crossClubs;
      if (crossDiscussions.length > 0) mainDiscussions = crossDiscussions;
      if (crossMeetings.length > 0) mainMeetings = crossMeetings;
      if (crossProgress.length > 0) mainProgress = crossProgress;
    } catch (e) {
      console.log("Cross-browser storage load failed:", e);
    }

    // Set the data
    users = mainUsers;
    clubs = mainClubs;
    discussions = mainDiscussions;
    meetings = mainMeetings;
    progress = mainProgress;
    adminActivity = mainAdminActivity;

    // Generate sample data if none exists (for demo purposes)
    if (users.length === 0 && clubs.length === 0) {
      generateSampleData();
    }

    // Immediately update the approval badge count after loading data
    if (currentAdmin) {
      const badge = document.getElementById("approvalBadge");
      if (badge) {
        const pendingCount = clubs.filter((c) => c.status === "pending").length;
        badge.textContent = pendingCount;
        badge.style.display = pendingCount > 0 ? "inline" : "none";
      }
    }

    console.log("Admin panel data loaded:", {
      users: users.length,
      clubs: clubs.length,
      discussions: discussions.length,
      meetings: meetings.length,
      progress: progress.length,
    });
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
    // Reset to empty arrays if data is corrupted
    users = [];
    clubs = [];
    discussions = [];
    meetings = [];
    progress = [];
    adminActivity = [];
  }
}

// Generate sample data for demonstration
function generateSampleData() {
  // Generate sample users
  const sampleUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      password: "password",
      isAdmin: false,
      createdAt: "2024-01-15T00:00:00.000Z",
      joinedClubs: [],
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      password: "password",
      isAdmin: false,
      createdAt: "2024-02-01T00:00:00.000Z",
      joinedClubs: [],
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      password: "password",
      isAdmin: false,
      createdAt: "2024-02-15T00:00:00.000Z",
      joinedClubs: [],
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      password: "password",
      isAdmin: false,
      createdAt: "2024-03-01T00:00:00.000Z",
      joinedClubs: [],
    },
    {
      id: 5,
      name: "David Brown",
      email: "david@example.com",
      password: "password",
      isAdmin: false,
      createdAt: "2024-03-15T00:00:00.000Z",
      joinedClubs: [],
    },
  ];

  // Generate sample clubs
  const sampleClubs = [
    {
      id: 1,
      name: "Mystery Book Club",
      genre: "Mystery",
      description: "A club for mystery and thriller enthusiasts",
      creatorId: 1,
      status: "approved",
      createdAt: "2024-01-20T00:00:00.000Z",
      members: [1, 2, 3],
      maxMembers: 20,
    },
    {
      id: 2,
      name: "Science Fiction Readers",
      genre: "Science Fiction",
      description: "Exploring the future through sci-fi literature",
      creatorId: 2,
      status: "approved",
      createdAt: "2024-02-05T00:00:00.000Z",
      members: [2, 4, 5],
      maxMembers: 15,
    },
    {
      id: 3,
      name: "Classic Literature",
      genre: "Classics",
      description: "Timeless classics and literary masterpieces",
      creatorId: 3,
      status: "approved",
      createdAt: "2024-02-20T00:00:00.000Z",
      members: [1, 3, 5],
      maxMembers: 25,
    },
    {
      id: 4,
      name: "Fantasy Adventures",
      genre: "Fantasy",
      description: "Magical worlds and epic adventures",
      creatorId: 4,
      status: "approved",
      createdAt: "2024-03-10T00:00:00.000Z",
      members: [2, 3, 4],
      maxMembers: 18,
    },
  ];

  // Generate sample discussions
  const sampleDiscussions = [
    {
      id: 1,
      title: "Best Mystery Novels of 2024",
      content: "What are your favorite mystery novels this year?",
      clubId: 1,
      authorId: 1,
      authorName: "John Doe",
      createdAt: "2024-01-25T00:00:00.000Z",
    },
    {
      id: 2,
      title: "Sci-Fi Recommendations",
      content: "Looking for new science fiction books to read",
      clubId: 2,
      authorId: 2,
      authorName: "Jane Smith",
      createdAt: "2024-02-10T00:00:00.000Z",
    },
    {
      id: 3,
      title: "Classic Literature Discussion",
      content: "Let's discuss the themes in Pride and Prejudice",
      clubId: 3,
      authorId: 3,
      authorName: "Mike Johnson",
      createdAt: "2024-02-25T00:00:00.000Z",
    },
    {
      id: 4,
      title: "Fantasy World Building",
      content: "What makes a fantasy world compelling?",
      clubId: 4,
      authorId: 4,
      authorName: "Sarah Wilson",
      createdAt: "2024-03-15T00:00:00.000Z",
    },
    {
      id: 5,
      title: "Mystery Plot Twists",
      content: "Share your favorite unexpected plot twists",
      clubId: 1,
      authorId: 2,
      authorName: "Jane Smith",
      createdAt: "2024-03-20T00:00:00.000Z",
    },
  ];

  // Generate sample meetings
  const sampleMeetings = [
    {
      id: 1,
      title: "Monthly Mystery Discussion",
      description: "Discussing this month's mystery book selection",
      clubId: 1,
      date: "2024-03-25T18:00:00.000Z",
      platform: "Zoom",
      organizerId: 1,
    },
    {
      id: 2,
      title: "Sci-Fi Book Review",
      description: "Review and discuss the latest sci-fi read",
      clubId: 2,
      date: "2024-03-26T19:00:00.000Z",
      platform: "Teams",
      organizerId: 2,
    },
    {
      id: 3,
      title: "Classic Literature Analysis",
      description: "Deep dive into classic literature themes",
      clubId: 3,
      date: "2024-03-27T17:00:00.000Z",
      platform: "Google Meet",
      organizerId: 3,
    },
    {
      id: 4,
      title: "Fantasy Book Club Meetup",
      description: "Monthly fantasy book discussion",
      clubId: 4,
      date: "2024-03-28T20:00:00.000Z",
      platform: "Discord",
      organizerId: 4,
    },
  ];

  // Generate sample progress entries
  const sampleProgress = [
    {
      id: 1,
      bookTitle: "The Silent Patient",
      author: "Alex Michaelides",
      pagesRead: 150,
      totalPages: 300,
      notes: "Great psychological thriller so far",
      clubId: 1,
      userId: 1,
      userName: "John Doe",
      createdAt: "2024-03-01T00:00:00.000Z",
    },
    {
      id: 2,
      bookTitle: "Dune",
      author: "Frank Herbert",
      pagesRead: 200,
      totalPages: 400,
      notes: "Complex world-building, very engaging",
      clubId: 2,
      userId: 2,
      userName: "Jane Smith",
      createdAt: "2024-03-05T00:00:00.000Z",
    },
    {
      id: 3,
      bookTitle: "Pride and Prejudice",
      author: "Jane Austen",
      pagesRead: 100,
      totalPages: 250,
      notes: "Classic romance, beautiful prose",
      clubId: 3,
      userId: 3,
      userName: "Mike Johnson",
      createdAt: "2024-03-10T00:00:00.000Z",
    },
    {
      id: 4,
      bookTitle: "The Name of the Wind",
      author: "Patrick Rothfuss",
      pagesRead: 300,
      totalPages: 600,
      notes: "Epic fantasy with great character development",
      clubId: 4,
      userId: 4,
      userName: "Sarah Wilson",
      createdAt: "2024-03-15T00:00:00.000Z",
    },
  ];

  // Update users with joined clubs
  sampleUsers[0].joinedClubs = [1, 3];
  sampleUsers[1].joinedClubs = [1, 2, 4];
  sampleUsers[2].joinedClubs = [1, 3, 4];
  sampleUsers[3].joinedClubs = [2, 3, 4];
  sampleUsers[4].joinedClubs = [2, 3];

  // Set the sample data
  users = sampleUsers;
  clubs = sampleClubs;
  discussions = sampleDiscussions;
  meetings = sampleMeetings;
  progress = sampleProgress;

  // Save to localStorage
  saveData();
}

// Save data to localStorage using the same keys as the main application
function saveData() {
  try {
    // Use the same storage keys as the main application
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("clubs", JSON.stringify(clubs));
    localStorage.setItem("discussions", JSON.stringify(discussions));
    localStorage.setItem("meetings", JSON.stringify(meetings));
    localStorage.setItem("progress", JSON.stringify(progress));
    localStorage.setItem("adminActivity", JSON.stringify(adminActivity));

    // Also save to cross-browser storage for better synchronization
    try {
      localStorage.setItem("bookclub_users_global", JSON.stringify(users));
      localStorage.setItem("bookclub_clubs_global", JSON.stringify(clubs));
      localStorage.setItem(
        "bookclub_discussions_global",
        JSON.stringify(discussions)
      );
      localStorage.setItem(
        "bookclub_meetings_global",
        JSON.stringify(meetings)
      );
      localStorage.setItem(
        "bookclub_progress_global",
        JSON.stringify(progress)
      );
    } catch (e) {
      console.log("Cross-browser storage update failed:", e);
    }

    // Trigger a storage event to notify other parts of the application
    const updateEvent = {
      type: "adminDataUpdated",
      timestamp: Date.now(),
      updatedData: {
        users: users.length,
        clubs: clubs.length,
        discussions: discussions.length,
        meetings: meetings.length,
        progress: progress.length,
      },
    };
    localStorage.setItem("adminUpdateEvent", JSON.stringify(updateEvent));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
    showNotification(
      "error",
      "Error",
      "Failed to save data. Please try again."
    );
  }
}

// Check if user is admin
function isAdmin(user) {
  return user && user.isAdmin === true;
}

// Admin authentication
function authenticateAdmin(email, password) {
  // Check against default admin credentials first
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    currentAdmin = { ...DEFAULT_ADMIN };
    return { success: true, message: "Login successful" };
  }

  // Otherwise, check in users array
  const user = users.find((u) => u.email === email && u.password === password);
  if (user && isAdmin(user)) {
    currentAdmin = user;
    return { success: true, message: "Login successful" };
  } else if (user && !isAdmin(user)) {
    return {
      success: false,
      message: "Access denied. Admin privileges required.",
    };
  } else {
    return { success: false, message: "Invalid credentials" };
  }
}

// Update admin info display
function updateAdminInfo() {
  const adminInfo = document.getElementById("adminInfo");
  if (adminInfo) {
    if (currentAdmin) {
      adminInfo.textContent = `Welcome, ${currentAdmin.name}`;
    } else {
      adminInfo.textContent = "Not logged in";
    }
  }
}

// Show/hide admin login modal
function showAdminLogin() {
  const modal = document.getElementById("adminLoginModal");
  if (modal) {
    modal.style.display = "block";
  }
}

function hideAdminLogin() {
  const modal = document.getElementById("adminLoginModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Tab navigation
function showTab(tabName) {
  // Persist the selected tab in localStorage
  localStorage.setItem("adminSelectedTab", tabName);

  // Hide all tab contents
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  // Remove active class from all nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  // Add active class to nav button
  const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add("active");
  }

  // Load tab-specific content
  loadTabContent(tabName);
}

// Load content for specific tabs
function loadTabContent(tabName) {
  // Reload data from localStorage to get latest changes
  loadData();

  switch (tabName) {
    case "dashboard":
      loadDashboard();
      break;
    case "approvals":
      loadApprovals();
      break;
    case "users":
      setupUserSearch();
      loadUsers();
      break;
    case "clubs":
      setupClubSearch();
      loadClubs();
      break;
    case "content":
      console.log("Loading content moderation...");
      setupContentModerationSearch();
      loadContentModeration();
      // Restore moderation tab state after a short delay to ensure DOM is ready
      setTimeout(() => {
        restoreModerationTabState();
      }, 100);
      break;
    case "reports":
      loadReports();
      break;
  }
}

// Dashboard functions
function loadDashboard() {
  updateDashboardStats();
  loadRecentActivity();
  updateApprovalBadge();
}

function updateDashboardStats() {
  const totalUsersEl = document.getElementById("totalUsers");
  const totalClubsEl = document.getElementById("totalClubs");
  const totalDiscussionsEl = document.getElementById("totalDiscussions");
  const totalMeetingsEl = document.getElementById("totalMeetings");
  const pendingApprovalsEl = document.getElementById("pendingApprovals");
  const recentActivityEl = document.getElementById("recentActivity");

  if (totalUsersEl) totalUsersEl.textContent = users.length;
  if (totalClubsEl)
    totalClubsEl.textContent = clubs.filter(
      (c) => c.status === "approved"
    ).length;
  if (totalDiscussionsEl) totalDiscussionsEl.textContent = discussions.length;
  if (totalMeetingsEl) totalMeetingsEl.textContent = meetings.length;
  if (pendingApprovalsEl)
    pendingApprovalsEl.textContent = clubs.filter(
      (c) => c.status === "pending"
    ).length;
  if (recentActivityEl) recentActivityEl.textContent = adminActivity.length;
}

function loadRecentActivity() {
  const activityList = document.getElementById("recentActivityList");
  if (!activityList) return;

  activityList.innerHTML = "";

  const recentActivities = adminActivity.slice(-10).reverse();

  if (recentActivities.length === 0) {
    activityList.innerHTML =
      '<p style="text-align: center; color: #7f8c8d;">No recent activity</p>';
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

function updateApprovalBadge() {
  const badge = document.getElementById("approvalBadge");
  if (badge) {
    const pendingCount = clubs.filter((c) => c.status === "pending").length;
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? "inline" : "none";
  }
}

// --- Custom Modal System for Confirmations ---

/**
 * Show a classy, minimal confirmation modal as a floating overlay.
 * @param {string} message - The confirmation message.
 * @param {function} onConfirm - Called if user confirms.
 * @param {function} [onCancel] - Called if user cancels.
 * @param {object} [options] - Optional: { confirmText, cancelText }
 */
function showConfirmModal(message, onConfirm, onCancel, options = {}) {
  // Always append to body for floating/fixed modal
  let container = document.body;

  // Remove any existing confirm modal
  let oldModal = document.getElementById("customConfirmModal");
  if (oldModal) oldModal.remove();

  // Modal wrapper (fixed, floating)
  const modal = document.createElement("div");
  modal.id = "customConfirmModal";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(30,32,38,0.18)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "10000";
  modal.style.transition = "opacity 0.2s";
  modal.style.opacity = "1";

  // Modal content (floating, minimal, modern)
  modal.innerHTML = `
    <div style="
      background: #fff;
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(60,60,90,0.10);
      padding: 2.5rem 2.5rem 2rem 2.5rem;
      min-width: 320px;
      max-width: 90vw;
      text-align: center;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: fadeInModal 0.18s;
    ">
      <div style="font-size: 2.2rem; color: #764ba2; margin-bottom: 0.5rem;">
        <i class="fas fa-question-circle"></i>
      </div>
      <div style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.5rem;">
        Confirm Action
      </div>
      <div style="color: #7f8c8d; font-size: 1rem; margin-bottom: 1.5rem;">
        ${message}
      </div>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="confirmModalYes" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.6rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        ">${options.confirmText || "Yes"}</button>
        <button id="confirmModalNo" style="
          background: #f5f7fa;
          color: #764ba2;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 0.6rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        ">${options.cancelText || "Cancel"}</button>
      </div>
      <button id="confirmModalClose" style="
        position: absolute;
        top: 0.7rem;
        right: 0.7rem;
        background: none;
        border: none;
        color: #b0b0b0;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0.2rem;
        border-radius: 50%;
        transition: background 0.15s;
      " title="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <style>
      @keyframes fadeInModal {
        from { opacity: 0; transform: scale(0.98);}
        to { opacity: 1; transform: scale(1);}
      }
      #customConfirmModal .btn:focus, #customConfirmModal button:focus {
        outline: none;
        box-shadow: 0 0 0 2px #764ba2;
      }
      #customConfirmModal button:hover {
        filter: brightness(0.97);
      }
      #customConfirmModal #confirmModalClose:hover {
        background: #f0f0f0;
      }
    </style>
  `;

  // Add modal to container (body)
  container.appendChild(modal);

  // Button references
  const yesBtn = modal.querySelector("#confirmModalYes");
  const noBtn = modal.querySelector("#confirmModalNo");
  const closeBtn = modal.querySelector("#confirmModalClose");

  yesBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 180);
    if (typeof onConfirm === "function") onConfirm();
  });

  function closeModal() {
    modal.style.opacity = "0";
    setTimeout(() => modal.remove(), 180);
    if (typeof onCancel === "function") onCancel();
  }

  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  // Allow clicking outside modal content to cancel
  modal.addEventListener("click", function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Trap focus inside modal for accessibility
  setTimeout(() => {
    yesBtn.focus();
    const focusable = modal.querySelectorAll("button");
    let idx = 0;
    modal.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        idx =
          (idx + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
        focusable[idx].focus();
      } else if (e.key === "Escape") {
        closeModal();
      }
    });
  }, 10);
}

// Approvals functions
function refreshApprovals() {
  // Force reload data from localStorage
  loadData();
  loadApprovals();
  updateApprovalBadge();

  // Debug: Show localStorage data
  const storedClubs = JSON.parse(localStorage.getItem("clubs")) || [];
  const pendingStored = storedClubs.filter((c) => c.status === "pending");
  console.log("Stored clubs in localStorage:", storedClubs);
  console.log("Pending clubs in localStorage:", pendingStored);

  showNotification(
    "info",
    "Approvals Refreshed",
    `Found ${pendingStored.length} pending clubs in localStorage.`
  );
}

function loadApprovals() {
  const approvalsList = document.getElementById("approvalsList");
  if (!approvalsList) return;

  approvalsList.innerHTML = "";

  // Reload data to get latest pending clubs
  loadData();
  const pendingClubs = clubs.filter((club) => club.status === "pending");

  // Debug: Log the data to console
  console.log("All clubs:", clubs);
  console.log("Pending clubs:", pendingClubs);

  if (pendingClubs.length === 0) {
    approvalsList.innerHTML =
      '<p style="text-align: center; color: #7f8c8d;">No pending approvals</p>';
    return;
  }

  pendingClubs.forEach((club) => {
    const creator = users.find((u) => u.id === club.creatorId);
    const approvalItem = document.createElement("div");
    approvalItem.className = "approval-item";
    approvalItem.innerHTML = `
            <div class="approval-header">
                <div class="approval-title">${club.name}</div>
                <span class="approval-status pending">Pending</span>
            </div>
            <div class="approval-details">
                <div>
                    <strong>Genre:</strong> ${club.genre || "Not specified"}
                </div>
                <div>
                    <strong>Max Members:</strong> ${
                      club.maxMembers || "Unlimited"
                    }
                </div>
                <div>
                    <strong>Created by:</strong> ${creator?.name || "Unknown"}
                </div>
                <div>
                    <strong>Created:</strong> ${new Date(
                      club.createdAt
                    ).toLocaleString()}
                </div>
            </div>
            <div class="approval-details">
                <div>
                    <strong>Description:</strong><br>
                    ${club.description}
                </div>
            </div>
            <div class="approval-actions">
                <button class="btn btn-success" onclick="approveClub(${
                  club.id
                })">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn btn-danger" onclick="rejectClub(${club.id})">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        `;
    approvalsList.appendChild(approvalItem);
  });
}

function approveClub(clubId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const club = clubs.find((c) => c.id === clubId);
  if (!club) {
    showNotification("error", "Error", "Club not found");
    return;
  }

  club.status = "approved";
  saveData();
  logAdminActivity("club", "Club approved", club.name);
  loadApprovals();
  updateDashboardStats();
  updateApprovalBadge();

  // Update the user interface immediately
  if (typeof updateClubUI === "function") {
    updateClubUI(clubId, "approved");
  }

  // Immediately update the approval badge count
  const badge = document.getElementById("approvalBadge");
  if (badge) {
    const pendingCount = clubs.filter((c) => c.status === "pending").length;
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? "inline" : "none";
  }

  showNotification(
    "success",
    "Success",
    `Club "${club.name}" has been approved!`
  );
}

function rejectClub(clubId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const club = clubs.find((c) => c.id === clubId);
  if (!club) {
    showNotification("error", "Error", "Club not found");
    return;
  }

  showConfirmModal(
    `Are you sure you want to reject "<b>${club.name}</b>"? This action cannot be undone.`,
    function () {
      const clubName = club.name; // Store club name before removal
      clubs = clubs.filter((c) => c.id !== clubId);
      saveData();
      logAdminActivity("club", "Club rejected", clubName);
      loadApprovals();
      updateDashboardStats();
      updateApprovalBadge();

      // Update the user interface immediately
      if (typeof updateClubUI === "function") {
        updateClubUI(clubId, "rejected");
      }

      // Immediately update the approval badge count
      const badge = document.getElementById("approvalBadge");
      if (badge) {
        const pendingCount = clubs.filter((c) => c.status === "pending").length;
        badge.textContent = pendingCount;
        badge.style.display = pendingCount > 0 ? "inline" : "none";
      }

      showNotification(
        "success",
        "Success",
        `Club "${clubName}" has been rejected and removed.`
      );
    }
  );
}

// Users functions
function loadUsers() {
  const usersTableBody = document.getElementById("usersTableBody");
  if (!usersTableBody) return;

  // Get search and filter values
  const searchInput = document.getElementById("userSearch");
  const roleFilter = document.getElementById("userRoleFilter");
  const query = (searchInput?.value || "").trim().toLowerCase();
  const roleValue = (roleFilter?.value || "").trim();

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesRole =
      roleValue === ""
        ? true
        : roleValue === "admin"
        ? user.isAdmin === true
        : user.isAdmin !== true;

    const haystack = `${user.name || ""} ${user.email || ""}`.toLowerCase();
    const matchesQuery = query === "" ? true : haystack.includes(query);

    return matchesRole && matchesQuery;
  });

  usersTableBody.innerHTML = "";

  if (filteredUsers.length === 0) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #7f8c8d; padding: 2rem;">
          No users match your filters.
        </td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach((user) => {
    const userRow = document.createElement("tr");
    userRow.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="user-role ${user.isAdmin ? "admin" : "user"}">${
      user.isAdmin ? "Admin" : "User"
    }</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td><span class="user-role user">Active</span></td>
            <td>
                <div class="club-actions">
                    ${
                      !user.isAdmin
                        ? `<button class="btn btn-primary" onclick="toggleAdmin(${user.id})">Make Admin</button>`
                        : ""
                    }
                    ${
                      user.id !== currentAdmin?.id
                        ? `<button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>`
                        : ""
                    }
                </div>
            </td>
        `;
    usersTableBody.appendChild(userRow);
  });
}

// Setup live search and filtering for users
function setupUserSearch() {
  const searchInput = document.getElementById("userSearch");
  const roleFilter = document.getElementById("userRoleFilter");

  if (searchInput && !searchInput._searchBound) {
    searchInput.addEventListener("input", () => loadUsers());
    searchInput._searchBound = true;
  }

  if (roleFilter && !roleFilter._searchBound) {
    roleFilter.addEventListener("change", () => loadUsers());
    roleFilter._searchBound = true;
  }
}

function toggleAdmin(userId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const user = users.find((u) => u.id === userId);
  if (user) {
    user.isAdmin = !user.isAdmin;
    saveData();
    logAdminActivity(
      "user",
      `User ${user.isAdmin ? "promoted to admin" : "removed from admin"}`,
      user.name
    );
    loadUsers();
    showNotification(
      "success",
      "Success",
      `User ${user.name} ${
        user.isAdmin ? "promoted to admin" : "removed from admin"
      }`
    );
  }
}

function deleteUser(userId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  if (userId === currentAdmin.id) {
    showNotification("error", "Error", "You cannot delete your own account");
    return;
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    showNotification("error", "Error", "User not found");
    return;
  }

  showConfirmModal(
    "Are you sure you want to delete this user? This action cannot be undone.",
    function () {
      // Remove user from users array
      users = users.filter((u) => u.id !== userId);

      // Clean up all user-related data
      // Remove user from clubs they created
      clubs.forEach((club) => {
        if (club.creatorId === userId) {
          club.creatorId = null; // Set to null instead of removing the club
        }
        // Remove user from club members
        if (club.members && club.members.includes(userId)) {
          club.members = club.members.filter((id) => id !== userId);
        }
      });

      // Remove user's discussions
      discussions = discussions.filter((d) => d.authorId !== userId);

      // Remove user's meetings
      meetings = meetings.filter((m) => m.organizerId !== userId);

      // Remove user's progress entries
      progress = progress.filter((p) => p.userId !== userId);

      // Remove user from admin activity logs
      adminActivity = adminActivity.filter((a) => a.adminId !== userId);

      // Clear any stored user sessions
      try {
        // Remove user's current session if they're logged in
        const currentUserId = localStorage.getItem("currentUserId");
        if (currentUserId && parseInt(currentUserId) === userId) {
          localStorage.removeItem("currentUserId");
        }

        // Remove user's remembered session
        const rememberedUser = localStorage.getItem("bookclub_remembered_user");
        if (rememberedUser) {
          const parsed = JSON.parse(rememberedUser);
          if (parsed.userId === userId) {
            localStorage.removeItem("bookclub_remembered_user");
          }
        }

        // Remove user's profile picture data
        localStorage.removeItem(`bookclub_profile_picture_${userId}`);

        // Remove user's cross-browser data
        localStorage.removeItem(`bookclub_user_${userId}`);
      } catch (e) {
        console.log("Error clearing user sessions:", e);
      }

      // Save all changes
      saveData();

      // Log the admin activity
      logAdminActivity("user", "User deleted", user.name);

      // Notify the main application of user deletion
      notifyUserDeletion(userId, user.name);

      // Refresh the UI
      loadUsers();
      updateDashboardStats();

      showNotification(
        "success",
        "Success",
        `User "${user.name}" has been permanently deleted and all related data has been cleaned up.`
      );
    }
  );
}

// Clubs functions
function loadClubs() {
  const clubsGrid = document.getElementById("clubsGrid");
  if (!clubsGrid) return;

  // Get search and filter values
  const searchInput = document.getElementById("clubSearch");
  const statusFilter = document.getElementById("clubStatusFilter");
  const genreFilter = document.getElementById("clubGenreFilter");

  const query = (searchInput?.value || "").trim().toLowerCase();
  const statusValue = (statusFilter?.value || "").trim();
  const genreValue = (genreFilter?.value || "").trim();

  // Filter clubs based on search and filters
  const filteredClubs = clubs.filter((club) => {
    const matchesStatus =
      statusValue === "" ? true : club.status === statusValue;
    const matchesGenre = genreValue === "" ? true : club.genre === genreValue;

    const creator = users.find((u) => u.id === club.creatorId);
    const haystack = `${club.name || ""} ${club.description || ""} ${
      creator?.name || ""
    } ${club.genre || ""}`.toLowerCase();
    const matchesQuery = query === "" ? true : haystack.includes(query);

    return matchesStatus && matchesGenre && matchesQuery;
  });

  clubsGrid.innerHTML = "";

  if (filteredClubs.length === 0) {
    clubsGrid.innerHTML = `
      <div style="text-align: center; color: #7f8c8d; padding: 3rem;">
        <i class="fas fa-book" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <p>No clubs match your filters.</p>
      </div>
    `;
    return;
  }

  filteredClubs.forEach((club) => {
    const creator = users.find((u) => u.id === club.creatorId);
    const clubCard = document.createElement("div");
    clubCard.className = "club-card";
    clubCard.innerHTML = `
            <div class="club-header">
                <div class="club-title">${club.name}</div>
                <span class="club-status ${club.status}">${club.status}</span>
            </div>
            <div class="club-details">
                <p><strong>Genre:</strong> ${club.genre || "Not specified"}</p>
                <p><strong>Description:</strong> ${club.description}</p>
                <p><strong>Creator:</strong> ${creator?.name || "Unknown"}</p>
                <p><strong>Members:</strong> ${
                  club.members ? club.members.length : 0
                }${club.maxMembers ? `/${club.maxMembers}` : ""}</p>
                <p><strong>Created:</strong> ${new Date(
                  club.createdAt
                ).toLocaleDateString()}</p>
            </div>
            <div class="club-actions">
                ${
                  club.status === "pending"
                    ? `
                    <button class="btn btn-success" onclick="approveClub(${club.id})">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn btn-danger" onclick="rejectClub(${club.id})">
                        <i class="fas fa-times"></i> Reject
                    </button>
                `
                    : ""
                }
                <button class="btn btn-danger" onclick="deleteClub(${club.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
    clubsGrid.appendChild(clubCard);
  });
}

// Setup live search and filtering for clubs
function setupClubSearch() {
  const searchInput = document.getElementById("clubSearch");
  const statusFilter = document.getElementById("clubStatusFilter");
  const genreFilter = document.getElementById("clubGenreFilter");

  if (searchInput && !searchInput._searchBound) {
    searchInput.addEventListener("input", () => loadClubs());
    searchInput._searchBound = true;
  }

  if (statusFilter && !statusFilter._searchBound) {
    statusFilter.addEventListener("change", () => loadClubs());
    statusFilter._searchBound = true;
  }

  if (genreFilter && !genreFilter._searchBound) {
    genreFilter.addEventListener("change", () => loadClubs());
    genreFilter._searchBound = true;
  }
}

function deleteClub(clubId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const club = clubs.find((c) => c.id === clubId);
  if (!club) {
    showNotification("error", "Error", "Club not found");
    return;
  }

  showConfirmModal(
    "Are you sure you want to delete this club? This action cannot be undone.",
    function () {
      clubs = clubs.filter((c) => c.id !== clubId);
      discussions = discussions.filter((d) => d.clubId !== clubId);
      meetings = meetings.filter((m) => m.clubId !== clubId);
      progress = progress.filter((p) => p.clubId !== clubId);

      users.forEach((user) => {
        if (user.joinedClubs) {
          user.joinedClubs = user.joinedClubs.filter((id) => id !== clubId);
        }
      });

      saveData();
      logAdminActivity("club", "Club deleted", club.name);
      loadClubs();
      updateDashboardStats();
      showNotification("success", "Success", "Club deleted successfully");
    }
  );
}

// Content moderation functions
function loadContentModeration() {
  populateModerationFilters();
  loadModerationDiscussions();
  loadModerationMeetings();
  loadModerationProgress();
}

// Populate filter dropdowns for content moderation
function populateModerationFilters() {
  console.log("Populating moderation filters with clubs:", clubs.length);

  // Populate club filters
  const clubOptions = clubs
    .map((club) => `<option value="${club.name}">${club.name}</option>`)
    .join("");

  // Add club options to all club filters
  const discussionClubFilter = document.getElementById(
    "modDiscussionClubFilter"
  );
  const meetingClubFilter = document.getElementById("modMeetingClubFilter");
  const progressClubFilter = document.getElementById("modProgressClubFilter");

  if (discussionClubFilter) {
    discussionClubFilter.innerHTML =
      '<option value="">All Clubs</option>' + clubOptions;
  }

  if (meetingClubFilter) {
    meetingClubFilter.innerHTML =
      '<option value="">All Clubs</option>' + clubOptions;
  }

  if (progressClubFilter) {
    progressClubFilter.innerHTML =
      '<option value="">All Clubs</option>' + clubOptions;
  }

  // Populate platform filter for meetings
  const meetingPlatformFilter = document.getElementById(
    "modMeetingPlatformFilter"
  );
  if (meetingPlatformFilter) {
    const platforms = [
      ...new Set(meetings.map((m) => m.platform).filter(Boolean)),
    ];
    const platformOptions = platforms
      .map((platform) => `<option value="${platform}">${platform}</option>`)
      .join("");
    meetingPlatformFilter.innerHTML =
      '<option value="">All Platforms</option>' + platformOptions;
  }

  // Populate author filter for progress
  const progressAuthorFilter = document.getElementById(
    "modProgressAuthorFilter"
  );
  if (progressAuthorFilter) {
    const authors = [
      ...new Set(progress.map((p) => p.author || p.bookAuthor).filter(Boolean)),
    ];
    const authorOptions = authors
      .map((author) => `<option value="${author}">${author}</option>`)
      .join("");
    progressAuthorFilter.innerHTML =
      '<option value="">All Authors</option>' + authorOptions;
  }
}

// Setup live search and filtering for content moderation
function setupContentModerationSearch() {
  console.log("Setting up content moderation search...");

  // Setup discussions search
  const discussionSearch = document.getElementById("modDiscussionSearch");
  const discussionClubFilter = document.getElementById(
    "modDiscussionClubFilter"
  );

  console.log(
    "Found discussion search:",
    !!discussionSearch,
    "club filter:",
    !!discussionClubFilter
  );

  if (discussionSearch && !discussionSearch._searchBound) {
    discussionSearch.addEventListener("input", () => {
      console.log("Discussion search triggered:", discussionSearch.value);
      loadModerationDiscussions();
    });
    discussionSearch._searchBound = true;
  }

  if (discussionClubFilter && !discussionClubFilter._searchBound) {
    discussionClubFilter.addEventListener("change", () =>
      loadModerationDiscussions()
    );
    discussionClubFilter._searchBound = true;
  }

  // Setup meetings search
  const meetingSearch = document.getElementById("modMeetingSearch");
  const meetingClubFilter = document.getElementById("modMeetingClubFilter");
  const meetingPlatformFilter = document.getElementById(
    "modMeetingPlatformFilter"
  );

  if (meetingSearch && !meetingSearch._searchBound) {
    meetingSearch.addEventListener("input", () => {
      console.log("Meeting search triggered:", meetingSearch.value);
      loadModerationMeetings();
    });
    meetingSearch._searchBound = true;
  }

  if (meetingClubFilter && !meetingClubFilter._searchBound) {
    meetingClubFilter.addEventListener("change", () =>
      loadModerationMeetings()
    );
    meetingClubFilter._searchBound = true;
  }

  if (meetingPlatformFilter && !meetingPlatformFilter._searchBound) {
    meetingPlatformFilter.addEventListener("change", () =>
      loadModerationMeetings()
    );
    meetingPlatformFilter._searchBound = true;
  }

  // Setup progress search
  const progressSearch = document.getElementById("modProgressSearch");
  const progressClubFilter = document.getElementById("modProgressClubFilter");
  const progressAuthorFilter = document.getElementById(
    "modProgressAuthorFilter"
  );

  if (progressSearch && !progressSearch._searchBound) {
    progressSearch.addEventListener("input", () => {
      console.log("Progress search triggered:", progressSearch.value);
      loadModerationProgress();
    });
    progressSearch._searchBound = true;
  }

  if (progressClubFilter && !progressClubFilter._searchBound) {
    progressClubFilter.addEventListener("change", () =>
      loadModerationProgress()
    );
    progressClubFilter._searchBound = true;
  }

  if (progressAuthorFilter && !progressAuthorFilter._searchBound) {
    progressAuthorFilter.addEventListener("change", () =>
      loadModerationProgress()
    );
    progressAuthorFilter._searchBound = true;
  }
}

function loadModerationDiscussions() {
  const discussionsList = document.getElementById("modDiscussionsList");
  if (!discussionsList) return;

  // Get search and filter values
  const searchInput = document.getElementById("modDiscussionSearch");
  const clubFilter = document.getElementById("modDiscussionClubFilter");

  const query = (searchInput?.value || "").trim().toLowerCase();
  const clubValue = (clubFilter?.value || "").trim();

  console.log(
    "Loading moderation discussions with query:",
    query,
    "club filter:",
    clubValue
  );

  // Filter discussions based on search and filters
  const filteredDiscussions = discussions.filter((discussion) => {
    const club = clubs.find((c) => c.id === discussion.clubId);
    const matchesClub = clubValue === "" ? true : club?.name === clubValue;

    const haystack = `${discussion.title || ""} ${discussion.content || ""} ${
      discussion.authorName || ""
    } ${club?.name || ""}`.toLowerCase();
    const matchesQuery = query === "" ? true : haystack.includes(query);

    return matchesClub && matchesQuery;
  });

  discussionsList.innerHTML = "";

  if (filteredDiscussions.length === 0) {
    discussionsList.innerHTML =
      '<div style="text-align: center; padding: 3rem; color: #7f8c8d;"><i class="fas fa-comments" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>No discussions match your filters</p></div>';
    return;
  }

  filteredDiscussions.forEach((discussion) => {
    const club = clubs.find((c) => c.id === discussion.clubId);
    const discussionItem = document.createElement("div");
    discussionItem.className = "content-item";
    discussionItem.innerHTML = `
            <div class="content-header">
                <div class="content-title">
                    <i class="fas fa-comments" style="color: #667eea; margin-right: 0.5rem;"></i>
                    ${discussion.title}
                </div>
                <span class="content-status approved">Active</span>
            </div>
            <div class="content-meta">
                <div class="content-author">
                    <i class="fas fa-user"></i>
                    <strong>${discussion.authorName}</strong>
                </div>
                <div class="content-author">
                    <i class="fas fa-book"></i>
                    <span>Club: ${club?.name || "Unknown"}</span>
                </div>
                <div class="content-date">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(
                      discussion.createdAt
                    ).toLocaleString()}</span>
                </div>
            </div>
            <div class="content-text">${discussion.content}</div>
            <div class="moderation-actions">
                <button class="btn btn-danger" onclick="deleteDiscussion(${
                  discussion.id
                })">
                    <i class="fas fa-trash"></i> Delete Discussion
                </button>
            </div>
        `;
    discussionsList.appendChild(discussionItem);
  });
}

function loadModerationMeetings() {
  const meetingsList = document.getElementById("modMeetingsList");
  if (!meetingsList) return;

  // Get search and filter values
  const searchInput = document.getElementById("modMeetingSearch");
  const clubFilter = document.getElementById("modMeetingClubFilter");
  const platformFilter = document.getElementById("modMeetingPlatformFilter");

  const query = (searchInput?.value || "").trim().toLowerCase();
  const clubValue = (clubFilter?.value || "").trim();
  const platformValue = (platformFilter?.value || "").trim();

  // Filter meetings based on search and filters
  const filteredMeetings = meetings.filter((meeting) => {
    const club = clubs.find((c) => c.id === meeting.clubId);
    const matchesClub = clubValue === "" ? true : club?.name === clubValue;
    const matchesPlatform =
      platformValue === "" ? true : meeting.platform === platformValue;

    const haystack = `${meeting.title || ""} ${meeting.description || ""} ${
      club?.name || ""
    } ${meeting.platform || ""}`.toLowerCase();
    const matchesQuery = query === "" ? true : haystack.includes(query);

    return matchesClub && matchesPlatform && matchesQuery;
  });

  meetingsList.innerHTML = "";

  if (filteredMeetings.length === 0) {
    meetingsList.innerHTML =
      '<div style="text-align: center; padding: 3rem; color: #7f8c8d;"><i class="fas fa-calendar" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>No meetings match your filters</p></div>';
    return;
  }

  filteredMeetings.forEach((meeting) => {
    const club = clubs.find((c) => c.id === meeting.clubId);
    const meetingItem = document.createElement("div");
    meetingItem.className = "content-item";
    meetingItem.innerHTML = `
            <div class="content-header">
                <div class="content-title">
                    <i class="fas fa-calendar" style="color: #667eea; margin-right: 0.5rem;"></i>
                    ${meeting.title}
                </div>
                <span class="content-status approved">Scheduled</span>
            </div>
            <div class="content-meta">
                <div class="content-author">
                    <i class="fas fa-book"></i>
                    <span>Club: ${club?.name || "Unknown"}</span>
                </div>
                <div class="content-author">
                    <i class="fas fa-clock"></i>
                    <span>${new Date(meeting.date).toLocaleString()}</span>
                </div>
                <div class="content-author">
                    <i class="fas fa-video"></i>
                    <span>Platform: ${meeting.platform}</span>
                </div>
            </div>
            <div class="content-text">${
              meeting.description || "No description provided"
            }</div>
            <div class="moderation-actions">
                <button class="btn btn-danger" onclick="deleteMeeting(${
                  meeting.id
                })">
                    <i class="fas fa-trash"></i> Delete Meeting
                </button>
            </div>
        `;
    meetingsList.appendChild(meetingItem);
  });
}

function loadModerationProgress() {
  const progressList = document.getElementById("modProgressList");
  if (!progressList) return;

  // Get search and filter values
  const searchInput = document.getElementById("modProgressSearch");
  const clubFilter = document.getElementById("modProgressClubFilter");
  const authorFilter = document.getElementById("modProgressAuthorFilter");

  const query = (searchInput?.value || "").trim().toLowerCase();
  const clubValue = (clubFilter?.value || "").trim();
  const authorValue = (authorFilter?.value || "").trim();

  // Filter progress entries based on search and filters
  const filteredProgress = progress.filter((entry) => {
    const club = clubs.find((c) => c.id === entry.clubId);
    const matchesClub = clubValue === "" ? true : club?.name === clubValue;
    const matchesAuthor =
      authorValue === ""
        ? true
        : (entry.author || entry.bookAuthor || "")
            .toLowerCase()
            .includes(authorValue.toLowerCase());

    const haystack = `${entry.bookTitle || ""} ${entry.notes || ""} ${
      entry.userName || ""
    } ${club?.name || ""} ${
      entry.author || entry.bookAuthor || ""
    }`.toLowerCase();
    const matchesQuery = query === "" ? true : haystack.includes(query);

    return matchesClub && matchesAuthor && matchesQuery;
  });

  progressList.innerHTML = "";

  if (filteredProgress.length === 0) {
    progressList.innerHTML =
      '<div style="text-align: center; padding: 3rem; color: #7f8c8d;"><i class="fas fa-bookmark" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i><p>No progress entries match your filters</p></div>';
    return;
  }

  filteredProgress.forEach((entry) => {
    const club = clubs.find((c) => c.id === entry.clubId);
    const progressPercentage = entry.totalPages
      ? Math.round((entry.pagesRead / entry.totalPages) * 100)
      : 0;
    const progressItem = document.createElement("div");
    progressItem.className = "content-item";
    progressItem.innerHTML = `
            <div class="content-header">
                <div class="content-title">
                    <i class="fas fa-bookmark" style="color: #667eea; margin-right: 0.5rem;"></i>
                    ${entry.bookTitle}
                </div>
                <span class="content-status approved">${progressPercentage}% Complete</span>
            </div>
            <div class="content-meta">
                <div class="content-author">
                    <i class="fas fa-user"></i>
                    <strong>${entry.userName}</strong>
                </div>
                <div class="content-author">
                    <i class="fas fa-book"></i>
                    <span>Club: ${club?.name || "Unknown"}</span>
                </div>
                <div class="content-author">
                    <i class="fas fa-user-edit"></i>
                    <span>Author: ${
                      entry.author || entry.bookAuthor || "Not specified"
                    }</span>
                </div>
                <div class="content-date">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(entry.createdAt).toLocaleString()}</span>
                </div>
            </div>
            <div class="content-text">
                <div style="margin-bottom: 1rem;">
                    <strong>Reading Progress:</strong> ${entry.pagesRead}/${
      entry.totalPages
    } pages (${progressPercentage}%)
                </div>
                ${
                  entry.notes
                    ? `<div><strong>Notes:</strong> ${entry.notes}</div>`
                    : ""
                }
            </div>
            <div class="moderation-actions">
                <button class="btn btn-danger" onclick="deleteProgress(${
                  entry.id
                })">
                    <i class="fas fa-trash"></i> Delete Progress
                </button>
            </div>
        `;
    progressList.appendChild(progressItem);
  });
}

function deleteDiscussion(discussionId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const discussion = discussions.find((d) => d.id === discussionId);
  if (!discussion) {
    showNotification("error", "Error", "Discussion not found");
    return;
  }

  showConfirmModal(
    "Are you sure you want to delete this discussion?",
    function () {
      discussions = discussions.filter((d) => d.id !== discussionId);
      saveData();
      logAdminActivity("discussion", "Discussion deleted", discussion.title);
      loadModerationDiscussions();
      updateDashboardStats();
      showNotification("success", "Success", "Discussion deleted successfully");
    }
  );
}

function deleteMeeting(meetingId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const meeting = meetings.find((m) => m.id === meetingId);
  if (!meeting) {
    showNotification("error", "Error", "Meeting not found");
    return;
  }

  showConfirmModal(
    "Are you sure you want to delete this meeting?",
    function () {
      meetings = meetings.filter((m) => m.id !== meetingId);
      saveData();
      logAdminActivity("meeting", "Meeting deleted", meeting.title);
      loadModerationMeetings();
      updateDashboardStats();
      showNotification("success", "Success", "Meeting deleted successfully");
    }
  );
}

function deleteProgress(progressId) {
  if (!currentAdmin) {
    showNotification("error", "Error", "Please login as admin");
    return;
  }

  const progressEntry = progress.find((p) => p.id === progressId);
  if (!progressEntry) {
    showNotification("error", "Error", "Progress entry not found");
    return;
  }

  showConfirmModal(
    "Are you sure you want to delete this progress entry?",
    function () {
      progress = progress.filter((p) => p.id !== progressId);
      saveData();
      logAdminActivity(
        "progress",
        "Progress entry deleted",
        progressEntry.bookTitle
      );
      loadModerationProgress();
      updateDashboardStats();
      showNotification(
        "success",
        "Success",
        "Progress entry deleted successfully"
      );
    }
  );
}

// Reports functions
function loadReports() {
  updateReportStats();
  loadReportCharts();
  loadDetailedAnalytics();
  setupReportControls();
}

function updateReportStats() {
  // Update quick stats overview
  const totalUsersReport = document.getElementById("totalUsersReport");
  const totalClubsReport = document.getElementById("totalClubsReport");
  const totalDiscussionsReport = document.getElementById(
    "totalDiscussionsReport"
  );
  const totalMeetingsReport = document.getElementById("totalMeetingsReport");

  if (totalUsersReport) totalUsersReport.textContent = users.length;
  if (totalClubsReport)
    totalClubsReport.textContent = clubs.filter(
      (c) => c.status === "approved"
    ).length;
  if (totalDiscussionsReport)
    totalDiscussionsReport.textContent = discussions.length;
  if (totalMeetingsReport) totalMeetingsReport.textContent = meetings.length;
}

// --- BEGIN: Chart.js Graphs for Reports Section ---

// Dynamically load Chart.js if not present
function ensureChartJs(callback) {
  if (window.Chart) {
    callback();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/chart.js";
  script.onload = callback;
  document.head.appendChild(script);
}

// --- DYNAMIC, CLEAN CHARTS ---

function loadReportCharts() {
  ensureChartJs(() => {
    renderUserGrowthChart();
    renderClubActivityChart();
    renderContentTrendsChart();
    renderGenreDistributionChart();
    renderUserActivityHeatmap();
    updatePerformanceMetrics();
  });
}

let userGrowthChartInstance = null;
let clubActivityChartInstance = null;

function getMonthYearLabels(start, end) {
  // Returns array of YYYY-MM labels from start to end (inclusive)
  const labels = [];
  let date = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (date <= last) {
    labels.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
    date.setMonth(date.getMonth() + 1);
  }
  return labels;
}

function renderUserGrowthChart() {
  const chartContainer = document.getElementById("userGrowthChart");
  if (!chartContainer) return;

  // Remove previous canvas if exists
  chartContainer.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "userGrowthChartCanvas";
  chartContainer.appendChild(canvas);

  // Prepare data: group users by month/year of creation
  const userDates = users
    .filter((u) => u.createdAt)
    .map((u) => new Date(u.createdAt))
    .sort((a, b) => a - b);

  if (userDates.length === 0) {
    chartContainer.innerHTML =
      "<p style='text-align:center;color:#888;'>No user growth data available.</p>";
    return;
  }

  const minDate = userDates[0];
  const maxDate = userDates[userDates.length - 1];
  const labels = getMonthYearLabels(minDate, maxDate);

  // Count users per month
  const userCountsByMonth = {};
  users.forEach((user) => {
    if (!user.createdAt) return;
    const date = new Date(user.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    userCountsByMonth[key] = (userCountsByMonth[key] || 0) + 1;
  });

  // Cumulative sum for growth
  let cumulative = 0;
  const data = labels.map((key) => {
    cumulative += userCountsByMonth[key] || 0;
    return cumulative;
  });

  // Destroy previous chart instance if exists
  if (userGrowthChartInstance) {
    userGrowthChartInstance.destroy();
  }

  userGrowthChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Users",
          data,
          fill: true,
          backgroundColor: "rgba(102,126,234,0.10)",
          borderColor: "#667eea",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 7,
          pointBackgroundColor: "#764ba2",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#fff",
          titleColor: "#764ba2",
          bodyColor: "#333",
          borderColor: "#764ba2",
          borderWidth: 1,
          padding: 12,
          caretSize: 7,
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Month",
            color: "#764ba2",
            font: { weight: "bold" },
          },
          grid: { display: false },
          ticks: {
            color: "#888",
            maxTicksLimit: 8,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          title: {
            display: true,
            text: "Total Users",
            color: "#764ba2",
            font: { weight: "bold" },
          },
          beginAtZero: true,
          grid: { color: "rgba(102,126,234,0.08)" },
          ticks: { color: "#888" },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: "easeOutQuart",
      },
    },
  });
}

function renderClubActivityChart() {
  const chartContainer = document.getElementById("clubActivityChart");
  if (!chartContainer) return;

  // Remove previous canvas if exists
  chartContainer.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "clubActivityChartCanvas";
  chartContainer.appendChild(canvas);

  // Gather all relevant dates
  const clubDates = clubs
    .filter((c) => c.createdAt)
    .map((c) => new Date(c.createdAt));
  const meetingDates = meetings
    .filter((m) => m.date)
    .map((m) => new Date(m.date));
  const discussionDates = discussions
    .filter((d) => d.createdAt)
    .map((d) => new Date(d.createdAt));
  const allDates = [...clubDates, ...meetingDates, ...discussionDates].sort(
    (a, b) => a - b
  );

  if (allDates.length === 0) {
    chartContainer.innerHTML =
      "<p style='text-align:center;color:#888;'>No club activity data available.</p>";
    return;
  }

  const minDate = allDates[0];
  const maxDate = allDates[allDates.length - 1];
  const labels = getMonthYearLabels(minDate, maxDate);

  // Prepare data: group club activities (created, meetings, discussions) by month
  const clubCreatedByMonth = {};
  const meetingsByMonth = {};
  const discussionsByMonth = {};

  clubs.forEach((club) => {
    if (!club.createdAt) return;
    const date = new Date(club.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    clubCreatedByMonth[key] = (clubCreatedByMonth[key] || 0) + 1;
  });

  meetings.forEach((meeting) => {
    if (!meeting.date) return;
    const date = new Date(meeting.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    meetingsByMonth[key] = (meetingsByMonth[key] || 0) + 1;
  });

  discussions.forEach((discussion) => {
    if (!discussion.createdAt) return;
    const date = new Date(discussion.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    discussionsByMonth[key] = (discussionsByMonth[key] || 0) + 1;
  });

  // Prepare data arrays
  const clubCreatedData = labels.map((key) => clubCreatedByMonth[key] || 0);
  const meetingsData = labels.map((key) => meetingsByMonth[key] || 0);
  const discussionsData = labels.map((key) => discussionsByMonth[key] || 0);

  // Destroy previous chart instance if exists
  if (clubActivityChartInstance) {
    clubActivityChartInstance.destroy();
  }

  clubActivityChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Clubs Created",
          data: clubCreatedData,
          backgroundColor: "rgba(118,75,162,0.75)",
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Meetings Held",
          data: meetingsData,
          backgroundColor: "rgba(102,126,234,0.75)",
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
        {
          label: "Discussions Started",
          data: discussionsData,
          backgroundColor: "rgba(255,206,86,0.75)",
          borderRadius: 6,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            color: "#764ba2",
            font: { weight: "bold" },
          },
        },
        title: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "#fff",
          titleColor: "#764ba2",
          bodyColor: "#333",
          borderColor: "#764ba2",
          borderWidth: 1,
          padding: 12,
          caretSize: 7,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 900,
        easing: "easeOutQuart",
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: "Month",
            color: "#764ba2",
            font: { weight: "bold" },
          },
          grid: { display: false },
          ticks: {
            color: "#888",
            maxTicksLimit: 8,
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: "Count",
            color: "#764ba2",
            font: { weight: "bold" },
          },
          beginAtZero: true,
          grid: { color: "rgba(102,126,234,0.08)" },
          ticks: { color: "#888" },
        },
      },
    },
  });
}

// --- END: Chart.js Graphs for Reports Section ---

// --- NEW: Enhanced Charts and Analytics ---

function renderContentTrendsChart() {
  const chartContainer = document.getElementById("contentTrendsChart");
  if (!chartContainer) return;

  // Remove previous canvas if exists
  chartContainer.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "contentTrendsChartCanvas";
  chartContainer.appendChild(canvas);

  // Prepare data: group content by month
  const contentDates = [
    ...discussions.map((d) => new Date(d.createdAt)),
    ...meetings.map((m) => new Date(m.date)),
    ...progress.map((p) => new Date(p.createdAt)),
  ]
    .filter(Boolean)
    .sort((a, b) => a - b);

  if (contentDates.length === 0) {
    chartContainer.innerHTML =
      "<p style='text-align:center;color:#888;'>No content data available.</p>";
    return;
  }

  const minDate = contentDates[0];
  const maxDate = contentDates[contentDates.length - 1];
  const labels = getMonthYearLabels(minDate, maxDate);

  // Count content by type per month
  const discussionsByMonth = {};
  const meetingsByMonth = {};
  const progressByMonth = {};

  discussions.forEach((discussion) => {
    if (!discussion.createdAt) return;
    const date = new Date(discussion.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    discussionsByMonth[key] = (discussionsByMonth[key] || 0) + 1;
  });

  meetings.forEach((meeting) => {
    if (!meeting.date) return;
    const date = new Date(meeting.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    meetingsByMonth[key] = (meetingsByMonth[key] || 0) + 1;
  });

  progress.forEach((entry) => {
    if (!entry.createdAt) return;
    const date = new Date(entry.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    progressByMonth[key] = (progressByMonth[key] || 0) + 1;
  });

  const discussionsData = labels.map((key) => discussionsByMonth[key] || 0);
  const meetingsData = labels.map((key) => meetingsByMonth[key] || 0);
  const progressData = labels.map((key) => progressByMonth[key] || 0);

  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Discussions",
          data: discussionsData,
          borderColor: "#4facfe",
          backgroundColor: "rgba(79, 172, 254, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Meetings",
          data: meetingsData,
          borderColor: "#43e97b",
          backgroundColor: "rgba(67, 233, 123, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Progress Entries",
          data: progressData,
          borderColor: "#f093fb",
          backgroundColor: "rgba(240, 147, 251, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#764ba2", font: { weight: "bold" } },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(102,126,234,0.08)" },
          ticks: { color: "#888" },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#888", maxTicksLimit: 8 },
        },
      },
    },
  });
}

function renderGenreDistributionChart() {
  const chartContainer = document.getElementById("genreDistributionChart");
  if (!chartContainer) return;

  chartContainer.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "genreDistributionChartCanvas";
  chartContainer.appendChild(canvas);

  // Count clubs by genre
  const genreCounts = {};
  clubs.forEach((club) => {
    const genre = club.genre || "Unspecified";
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
  });

  const labels = Object.keys(genreCounts);
  const data = Object.values(genreCounts);

  if (data.length === 0) {
    chartContainer.innerHTML =
      "<p style='text-align:center;color:#888;'>No genre data available.</p>";
    return;
  }

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
  ];

  new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { color: "#764ba2", font: { weight: "bold" } },
        },
      },
    },
  });
}

function renderUserActivityHeatmap() {
  const chartContainer = document.getElementById("userActivityHeatmap");
  if (!chartContainer) return;

  chartContainer.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "userActivityHeatmapCanvas";
  chartContainer.appendChild(canvas);

  // Create activity data for the last 30 days
  const days = 30;
  const activityData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Count activities for this date
    let count = 0;
    count += discussions.filter((d) => d.createdAt?.startsWith(dateStr)).length;
    count += meetings.filter((m) => m.date?.startsWith(dateStr)).length;
    count += progress.filter((p) => p.createdAt?.startsWith(dateStr)).length;

    activityData.push({
      x: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      y: count,
    });
  }

  if (activityData.length === 0) {
    chartContainer.innerHTML =
      "<p style='text-align:center;color:#888;'>No activity data available.</p>";
    return;
  }

  new Chart(canvas, {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Daily Activity",
          data: activityData,
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(102,126,234,0.08)" },
          ticks: { color: "#888" },
        },
        x: {
          grid: { display: false },
          ticks: { color: "#888", maxTicksLimit: 15 },
        },
      },
    },
  });
}

function updatePerformanceMetrics() {
  // Calculate average club size
  const avgClubSize = document.getElementById("avgClubSize");
  if (avgClubSize) {
    const totalMembers = clubs.reduce(
      (sum, club) => sum + (club.members?.length || 0),
      0
    );
    const avgSize =
      clubs.length > 0 ? Math.round(totalMembers / clubs.length) : 0;
    avgClubSize.textContent = avgSize;
  }

  // Calculate average discussions per club
  const avgDiscussionsPerClub = document.getElementById(
    "avgDiscussionsPerClub"
  );
  if (avgDiscussionsPerClub) {
    const avgDiscussions =
      clubs.length > 0 ? Math.round(discussions.length / clubs.length) : 0;
    avgDiscussionsPerClub.textContent = avgDiscussions;
  }

  // Calculate average meetings per club
  const avgMeetingsPerClub = document.getElementById("avgMeetingsPerClub");
  if (avgMeetingsPerClub) {
    const avgMeetings =
      clubs.length > 0 ? Math.round(meetings.length / clubs.length) : 0;
    avgMeetingsPerClub.textContent = avgMeetings;
  }

  // Calculate user retention rate (users who joined clubs)
  const userRetentionRate = document.getElementById("userRetentionRate");
  if (userRetentionRate) {
    const usersWithClubs = users.filter(
      (user) => user.joinedClubs && user.joinedClubs.length > 0
    ).length;
    const retentionRate =
      users.length > 0 ? Math.round((usersWithClubs / users.length) * 100) : 0;
    userRetentionRate.textContent = `${retentionRate}%`;
  }
}

function loadDetailedAnalytics() {
  loadTopPerformingClubs();
  loadMostActiveUsers();
  loadContentQualityMetrics();
  loadGrowthInsights();
}

function loadTopPerformingClubs() {
  const topClubsList = document.getElementById("topClubsList");
  if (!topClubsList) return;

  // Calculate club performance scores
  const clubScores = clubs.map((club) => {
    const discussionCount = discussions.filter(
      (d) => d.clubId === club.id
    ).length;
    const meetingCount = meetings.filter((m) => m.clubId === club.id).length;
    const memberCount = club.members?.length || 0;
    const score = discussionCount * 2 + meetingCount * 3 + memberCount;

    return { ...club, score, discussionCount, meetingCount, memberCount };
  });

  // Sort by score and take top 10
  const topClubs = clubScores.sort((a, b) => b.score - a.score).slice(0, 10);

  topClubsList.innerHTML = "";

  if (topClubs.length === 0) {
    topClubsList.innerHTML =
      "<p style='text-align:center;color:#888;'>No clubs available.</p>";
    return;
  }

  topClubs.forEach((club, index) => {
    const clubItem = document.createElement("div");
    clubItem.className = "top-item";
    clubItem.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="name">${club.name}</span>
      <span class="value">${club.score} pts</span>
    `;
    topClubsList.appendChild(clubItem);
  });
}

function loadMostActiveUsers() {
  const topUsersList = document.getElementById("topUsersList");
  if (!topUsersList) return;

  // Calculate user activity scores
  const userScores = users.map((user) => {
    const discussionCount = discussions.filter(
      (d) => d.authorId === user.id
    ).length;
    const meetingCount = meetings.filter(
      (m) => m.organizerId === user.id
    ).length;
    const progressCount = progress.filter((p) => p.userId === user.id).length;
    const clubCount = user.joinedClubs?.length || 0;
    const score =
      discussionCount * 3 +
      meetingCount * 5 +
      progressCount * 2 +
      clubCount * 2;

    return {
      ...user,
      score,
      discussionCount,
      meetingCount,
      progressCount,
      clubCount,
    };
  });

  // Sort by score and take top 10
  const topUsers = userScores.sort((a, b) => b.score - a.score).slice(0, 10);

  topUsersList.innerHTML = "";

  if (topUsers.length === 0) {
    topUsersList.innerHTML =
      "<p style='text-align:center;color:#888;'>No users available.</p>";
    return;
  }

  topUsers.forEach((user, index) => {
    const userItem = document.createElement("div");
    userItem.className = "top-item";
    userItem.innerHTML = `
      <span class="rank">#${index + 1}</span>
      <span class="name">${user.name}</span>
      <span class="value">${user.score} pts</span>
    `;
    topUsersList.appendChild(userItem);
  });
}

function loadContentQualityMetrics() {
  const qualityMetrics = document.getElementById("qualityMetrics");
  if (!qualityMetrics) return;

  // Calculate various quality metrics
  const totalContent = discussions.length + meetings.length + progress.length;
  const avgContentPerUser =
    users.length > 0 ? (totalContent / users.length).toFixed(1) : 0;
  const avgContentPerClub =
    clubs.length > 0 ? (totalContent / clubs.length).toFixed(1) : 0;
  const activeClubs = clubs.filter(
    (c) => c.members && c.members.length > 0
  ).length;
  const activeClubsPercentage =
    clubs.length > 0 ? Math.round((activeClubs / clubs.length) * 100) : 0;

  qualityMetrics.innerHTML = `
    <div class="quality-metric">
      <span class="label">Average Content per User</span>
      <span class="value">${avgContentPerUser}</span>
    </div>
    <div class="quality-metric">
      <span class="label">Average Content per Club</span>
      <span class="value">${avgContentPerClub}</span>
    </div>
    <div class="quality-metric">
      <span class="label">Active Clubs</span>
      <span class="value">${activeClubsPercentage}%</span>
    </div>
    <div class="quality-metric">
      <span class="label">Total Content Items</span>
      <span class="value">${totalContent}</span>
    </div>
  `;
}

function loadGrowthInsights() {
  const growthInsights = document.getElementById("growthInsights");
  if (!growthInsights) return;

  // Calculate growth insights
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthUsers = users.filter(
    (u) => new Date(u.createdAt) >= lastMonth
  ).length;
  const lastMonthClubs = clubs.filter(
    (c) => new Date(c.createdAt) >= lastMonth
  ).length;

  const userGrowthRate =
    users.length > 0 ? Math.round((lastMonthUsers / users.length) * 100) : 0;
  const clubGrowthRate =
    clubs.length > 0 ? Math.round((lastMonthClubs / clubs.length) * 100) : 0;

  growthInsights.innerHTML = `
    <div class="insight-item">
      <div class="title">User Growth Trend</div>
      <div class="description">${lastMonthUsers} new users joined in the last month, representing a ${userGrowthRate}% growth rate.</div>
    </div>
    <div class="insight-item">
      <div class="title">Club Formation Rate</div>
      <div class="description">${lastMonthClubs} new clubs were created in the last month, showing a ${clubGrowthRate}% increase.</div>
    </div>
    <div class="insight-item">
      <div class="title">Platform Engagement</div>
      <div class="description">Users are actively participating with an average of ${Math.round(
        discussions.length / Math.max(users.length, 1)
      )} discussions and ${Math.round(
    meetings.length / Math.max(clubs.length, 1)
  )} meetings per club.</div>
    </div>
  `;
}

function setupReportControls() {
  // Setup period selectors
  const userGrowthPeriod = document.getElementById("userGrowthPeriod");
  const clubActivityPeriod = document.getElementById("clubActivityPeriod");
  const contentTrendsPeriod = document.getElementById("contentTrendsPeriod");

  if (userGrowthPeriod) {
    userGrowthPeriod.addEventListener("change", () => {
      renderUserGrowthChart();
    });
  }

  if (clubActivityPeriod) {
    clubActivityPeriod.addEventListener("change", () => {
      renderClubActivityChart();
    });
  }

  if (contentTrendsPeriod) {
    contentTrendsPeriod.addEventListener("change", () => {
      renderContentTrendsChart();
    });
  }

  // Setup date range picker
  const startDate = document.getElementById("analyticsStartDate");
  const endDate = document.getElementById("analyticsEndDate");

  if (startDate && endDate) {
    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    startDate.value = start.toISOString().split("T")[0];
    endDate.value = end.toISOString().split("T")[0];
  }
}

function updateAnalytics() {
  const startDate = document.getElementById("analyticsStartDate");
  const endDate = document.getElementById("analyticsEndDate");

  if (startDate && endDate) {
    // Filter data based on date range and reload analytics
    loadDetailedAnalytics();
    showNotification(
      "success",
      "Analytics Updated",
      "Analytics data has been refreshed with the new date range."
    );
  }
}

// Moderation tab switching
function setupModerationTabs() {
  const modTabButtons = document.querySelectorAll(".mod-tab-btn");
  const modTabContents = document.querySelectorAll(".mod-tab-content");

  modTabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-mod-tab");

      // Remove active class from all tabs
      modTabButtons.forEach((btn) => btn.classList.remove("active"));
      modTabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      button.classList.add("active");
      const content = document.getElementById(
        `mod${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`
      );
      if (content) {
        content.classList.add("active");
      }

      // Save the selected moderation sub-tab
      localStorage.setItem("adminModerationTab", tabName);
    });
  });
}

// Log admin activity
function logAdminActivity(type, action, details) {
  const activity = {
    type: type,
    action: action,
    details: details,
    timestamp: new Date().toISOString(),
    adminId: currentAdmin?.id,
  };

  adminActivity.push(activity);
  saveData();
}

// Restore moderation tab state
function restoreModerationTabState() {
  const savedTab = localStorage.getItem("adminModerationTab");
  console.log("=== RESTORING MODERATION TAB STATE ===");
  console.log("Saved tab:", savedTab);

  if (savedTab) {
    console.log("Restoring moderation tab to:", savedTab);

    // Remove active class from all tabs
    const modTabButtons = document.querySelectorAll(".mod-tab-btn");
    const modTabContents = document.querySelectorAll(".mod-tab-content");

    console.log("Found mod tab buttons:", modTabButtons.length);
    console.log("Found mod tab contents:", modTabContents.length);

    modTabButtons.forEach((btn) => btn.classList.remove("active"));
    modTabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to saved tab
    const selectedButton = document.querySelector(
      `[data-mod-tab="${savedTab}"]`
    );
    const selectedContent = document.getElementById(
      `mod${savedTab.charAt(0).toUpperCase() + savedTab.slice(1)}`
    );

    console.log("Selected button:", selectedButton);
    console.log("Selected content:", selectedContent);

    if (selectedButton) {
      selectedButton.classList.add("active");
      console.log("Activated button for tab:", savedTab);
    }

    if (selectedContent) {
      selectedContent.classList.add("active");
      console.log("Activated content for tab:", savedTab);
    }

    // Load the appropriate content for the restored tab
    switch (savedTab) {
      case "discussions":
        console.log("Loading discussions content");
        loadModerationDiscussions();
        break;
      case "meetings":
        console.log("Loading meetings content");
        loadModerationMeetings();
        break;
      case "progress":
        console.log("Loading progress content");
        loadModerationProgress();
        break;
    }
  } else {
    // Default to first tab if no saved state
    console.log("No saved moderation tab, defaulting to first tab");
    const firstButton = document.querySelector(".mod-tab-btn");
    const firstContent = document.querySelector(".mod-tab-content");

    if (firstButton && firstContent) {
      firstButton.classList.add("active");
      firstContent.classList.add("active");
      console.log("Defaulted to first moderation tab");
    }
  }
}

// Logout function with confirmation and delay
function logout() {
  // Use the custom modal system, and place it in the main content area
  showConfirmModal(
    "Are you sure you want to log out? You will be redirected to the login screen.",
    function () {
      // No timer/countdown, just a short delay for UX polish
      setTimeout(() => {
        currentAdmin = null;
        localStorage.removeItem("currentAdminId");
        updateAdminInfo();
        showAdminLogin();
        showNotification(
          "info",
          "Logged Out",
          "You have been logged out successfully."
        );
      }, 800);
    },
    null,
    { confirmText: "Yes, Log Out", cancelText: "Cancel" }
  );
}

// Initialize admin panel
function initAdminPanel() {
  loadData();

  // Debug: Log initial data
  console.log("Initial data loaded:", {
    users: users.length,
    clubs: clubs.length,
    pendingClubs: clubs.filter((c) => c.status === "pending").length,
  });

  // Set up storage event listener to sync with main application
  window.addEventListener("storage", function (e) {
    if (
      e.key === "adminUpdateEvent" ||
      e.key === "clubUpdateEvent" ||
      e.key === "userUpdateEvent"
    ) {
      console.log("Admin panel detected storage update:", e.key);
      // Reload data to stay in sync
      loadData();
      // Refresh current tab
      const currentTab = document.querySelector(".tab-content.active");
      if (currentTab) {
        const tabName = currentTab.id;
        loadTabContent(tabName);
      }
    }
  });

  // Add a global function to check data
  window.checkData = function () {
    const storedClubs = JSON.parse(localStorage.getItem("clubs")) || [];
    const pendingStored = storedClubs.filter((c) => c.status === "pending");
    console.log("=== DATA CHECK ===");
    console.log("All stored clubs:", storedClubs);
    console.log("Pending clubs:", pendingStored);
    console.log("Current clubs in memory:", clubs);
    console.log(
      "Current pending in memory:",
      clubs.filter((c) => c.status === "pending")
    );
    showNotification(
      "info",
      "Data Check",
      `Found ${pendingStored.length} pending clubs in localStorage`
    );
  };

  // Add a global function to force data refresh
  window.forceDataRefresh = function () {
    console.log("Forcing data refresh...");

    // Clear any cached data
    users = [];
    clubs = [];
    discussions = [];
    meetings = [];
    progress = [];
    adminActivity = [];

    // Reload from all storage sources
    loadData();

    // Refresh current tab
    const currentTab = document.querySelector(".tab-content.active");
    if (currentTab) {
      const tabName = currentTab.id;
      loadTabContent(tabName);
    }

    // Update all stats
    updateDashboardStats();
    updateApprovalBadge();

    showNotification(
      "info",
      "Data Refreshed",
      "All data has been refreshed and synchronized."
    );
  };

  // Add a global function to verify user deletion
  window.verifyUserDeletion = function (userId) {
    return verifyUserDeletion(userId);
  };

  // Add a global function to check moderation tab state
  window.checkModerationTab = function () {
    const savedTab = localStorage.getItem("adminModerationTab");
    const currentTab = localStorage.getItem("adminSelectedTab");
    console.log("=== MODERATION TAB CHECK ===");
    console.log("Current main tab:", currentTab);
    console.log("Saved moderation tab:", savedTab);
    console.log("Current admin:", currentAdmin?.name);

    // Check if we're on the content tab
    const contentTab = document.getElementById("content");
    const isContentActive =
      contentTab && contentTab.classList.contains("active");
    console.log("Content tab active:", isContentActive);

    // Check moderation tab buttons
    const modButtons = document.querySelectorAll(".mod-tab-btn");
    const activeModButton = document.querySelector(".mod-tab-btn.active");
    console.log("Moderation tab buttons found:", modButtons.length);
    console.log(
      "Active moderation button:",
      activeModButton?.getAttribute("data-mod-tab")
    );

    showNotification(
      "info",
      "Moderation Tab Check",
      `Main tab: ${currentTab}, Mod tab: ${savedTab || "none"}`
    );
  };

  // Check if admin is logged in
  const adminId = localStorage.getItem("currentAdminId");
  if (adminId) {
    // If adminId is 1, it's the default admin
    if (parseInt(adminId) === DEFAULT_ADMIN.id) {
      currentAdmin = { ...DEFAULT_ADMIN };
      updateAdminInfo();
      const lastTab = localStorage.getItem("adminSelectedTab") || "dashboard";
      showTab(lastTab);
    } else {
      const admin = users.find((u) => u.id === parseInt(adminId) && u.isAdmin);
      if (admin) {
        currentAdmin = admin;
        updateAdminInfo();
        const lastTab = localStorage.getItem("adminSelectedTab") || "dashboard";
        showTab(lastTab);
      } else {
        showAdminLogin();
      }
    }
  } else {
    showAdminLogin();
  }

  // Set up event listeners
  setupEventListeners();
  setupModerationTabs();

  // Set up all search functionality
  setupUserSearch();
  setupClubSearch();
  setupContentModerationSearch();

  // Set up real-time badge updates
  setupRealTimeBadgeUpdates();
}

// Set up event listeners
function setupEventListeners() {
  // Navigation buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      showTab(tabName);
    });
  });

  // Admin login form
  const adminLoginForm = document.getElementById("adminLoginForm");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("adminEmail").value;
      const password = document.getElementById("adminPassword").value;

      const result = authenticateAdmin(email, password);
      showNotification(
        result.success ? "success" : "error",
        "Admin Login",
        result.message
      );

      if (result.success) {
        hideAdminLogin();
        updateAdminInfo();
        // Store currentAdminId as 1 if default admin, else use user id
        localStorage.setItem("currentAdminId", currentAdmin.id);

        // Restore last selected tab, default to dashboard if not set
        const lastTab = localStorage.getItem("adminSelectedTab") || "dashboard";
        showTab(lastTab);

        e.target.reset();
      }
    });
  }

  // Modal close functionality
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("adminLoginModal");
    if (e.target === modal) {
      hideAdminLogin();
    }
  });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initAdminPanel);
// Persist admin session and selected tab across page refresh
document.addEventListener("DOMContentLoaded", () => {
  const storedAdminId = localStorage.getItem("currentAdminId");
  if (storedAdminId && !currentAdmin) {
    if (parseInt(storedAdminId) === DEFAULT_ADMIN.id) {
      currentAdmin = { ...DEFAULT_ADMIN };
      hideAdminLogin();
      updateAdminInfo();
      const lastTab = localStorage.getItem("adminSelectedTab") || "dashboard";
      showTab(lastTab);
    } else if (typeof getAdminById === "function") {
      const admin = getAdminById(storedAdminId);
      if (admin) {
        currentAdmin = admin;
        hideAdminLogin();
        updateAdminInfo();
        const lastTab = localStorage.getItem("adminSelectedTab") || "dashboard";
        showTab(lastTab);
      } else {
        localStorage.removeItem("currentAdminId");
      }
    } else {
      currentAdmin = { id: storedAdminId };
      hideAdminLogin();
      updateAdminInfo();
      const lastTab = localStorage.getItem("adminSelectedTab") || "dashboard";
      showTab(lastTab);
    }
  }
});

// Function to update UI when a club is approved/rejected (called from admin panel)
function updateClubUI(clubId, action) {
  // Update admin stats if we're on the admin section
  if (document.getElementById("adminStats")) {
    updateDashboardStats();
  }

  // Update pending approvals if we're on the admin section
  if (document.getElementById("pendingApprovalsList")) {
    loadApprovals();
  }

  // Immediately update the approval badge count
  const badge = document.getElementById("approvalBadge");
  if (badge) {
    const pendingCount = clubs.filter((c) => c.status === "pending").length;
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? "inline" : "none";
  }

  // Try to call immediate update function if it exists (for same-window updates)
  if (typeof immediateClubUpdate === "function") {
    immediateClubUpdate(clubId, action);
  }

  // Trigger a localStorage event to notify the main page
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

// Function to notify main application of user deletion
function notifyUserDeletion(userId, userName) {
  // Trigger a localStorage event to notify the main page
  const updateEvent = {
    type: "userDeleted",
    userId: userId,
    userName: userName,
    timestamp: Date.now(),
  };

  // Store the event in localStorage to trigger the storage event
  localStorage.setItem("userUpdateEvent", JSON.stringify(updateEvent));

  // Also trigger the admin update event
  const adminEvent = {
    type: "adminDataUpdated",
    timestamp: Date.now(),
    updatedData: {
      users: users.length,
      clubs: clubs.length,
      discussions: discussions.length,
      meetings: meetings.length,
      progress: progress.length,
    },
  };
  localStorage.setItem("adminUpdateEvent", JSON.stringify(adminEvent));

  console.log(`User deletion event triggered for user ${userId} (${userName})`);
}

// Function to verify user deletion is permanent
function verifyUserDeletion(userId) {
  // Check if user still exists in memory
  const userInMemory = users.find((u) => u.id === userId);

  // Check if user still exists in localStorage
  const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const userInStorage = storedUsers.find((u) => u.id === userId);

  // Check if user still exists in cross-browser storage
  const crossUsers =
    JSON.parse(localStorage.getItem("bookclub_users_global")) || [];
  const userInCross = crossUsers.find((u) => u.id === userId);

  const verification = {
    userId: userId,
    inMemory: !!userInMemory,
    inLocalStorage: !!userInStorage,
    inCrossBrowser: !!userInCross,
    completelyDeleted: !userInMemory && !userInStorage && !userInCross,
  };

  console.log("User deletion verification:", verification);

  if (verification.completelyDeleted) {
    showNotification(
      "success",
      "Verification Complete",
      `User ${userId} has been completely removed from all storage locations.`
    );
  } else {
    showNotification(
      "warning",
      "Verification Warning",
      `User ${userId} may still exist in some storage locations. Consider using forceDataRefresh().`
    );
  }

  return verification;
}

// Set up real-time badge updates
function setupRealTimeBadgeUpdates() {
  // Update badge every 2 seconds to ensure it stays in sync
  setInterval(() => {
    if (currentAdmin) {
      const badge = document.getElementById("approvalBadge");
      if (badge) {
        const pendingCount = clubs.filter((c) => c.status === "pending").length;
        const currentBadgeCount = parseInt(badge.textContent) || 0;

        // Only update if there's a discrepancy
        if (currentBadgeCount !== pendingCount) {
          badge.textContent = pendingCount;
          badge.style.display = pendingCount > 0 ? "inline" : "none";
          console.log(`Badge updated: ${currentBadgeCount} → ${pendingCount}`);
        }
      }
    }
  }, 2000);
}
