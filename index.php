<?php
session_start();

// Initialize session variables
$_SESSION['logged_in'] = isset($_SESSION['logged_in']) ? $_SESSION['logged_in'] : false;
$_SESSION['username'] = isset($_SESSION['username']) ? $_SESSION['username'] : '';
$_SESSION['user_id'] = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

// Simulated user storage (in session for simulation)
if (!isset($_SESSION['users'])) {
    $_SESSION['users'] = []; // Stores username => ['password' => $hash, 'user_id' => $id]
}
if (!isset($_SESSION['users_meta'])) {
    $_SESSION['users_meta'] = []; // Stores username => ['user_id' => $id] (legacy or could be combined)
}

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $password = $_POST['password'];
    
    // Check if user exists and password is correct
    if (isset($_SESSION['users'][$username]) && password_verify($password, $_SESSION['users'][$username]['password'])) {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['user_id'] = $_SESSION['users'][$username]['user_id']; // Store user_id in session
        header("Location: index.php");
        exit;
    } else {
        $error = "Invalid username or password";
    }
}

// Handle registration
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['register'])) {
    $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $password = $_POST['password']; // Raw password
    
    if (isset($_SESSION['users'][$username])) {
        $error = "Username already taken";
    } else {
        // Generate a new user_id
        $new_user_id = count($_SESSION['users_meta']) + 1; 
        // Store user metadata (though user_id is also in 'users' array, this demonstrates the concept)
        $_SESSION['users_meta'][$username] = ['user_id' => $new_user_id, 'email' => $email];
        
        // Hash the password for storage
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        // Store user details including the hashed password and user_id
        $_SESSION['users'][$username] = ['password' => $hashed_password, 'user_id' => $new_user_id];
        
        // Log the new user in
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        $_SESSION['user_id'] = $new_user_id; // Store new user_id in session
        header("Location: index.php");
        exit;
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: index.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ResumeRocket</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script>
        const USER_IS_LOGGED_IN = <?php echo json_encode(isset($_SESSION['logged_in']) && $_SESSION['logged_in']); ?>;
        const USER_ID = <?php echo json_encode($_SESSION['user_id'] ?? null); ?>;
    </script>
</head>
<body>
    <!-- Splash Screen -->
    <div id="splashScreen" class="splash-screen">
        <div class="splash-content">
            <div class="splash-logo">
                <i class="fas fa-rocket"></i>
                <span>ResumeRocket</span>
            </div>
            <div class="splash-loader">
                <div class="spinner"></div>
            </div>
            <div class="splash-footer">
                <p>Version 1.0</p>
                <p>Developed by Firafis Bekele</p>
            </div>
        </div>
    </div>

    <div class="app-container">
       <nav>
    <div class="logo">
        <i class="fas fa-rocket"></i>
        <span>ResumeRocket</span>
    </div>
    <div class="nav-links">
        <a href="index.php" class="nav-link active">Home</a>
        <a href="about.php" class="nav-link">About</a>
        <?php if (!$_SESSION['logged_in']): ?>
            <button class="btn-login" onclick="showModal('loginModal')">Login</button>
            <button class="btn-register" onclick="showModal('registerModal')">Register</button>
        <?php else: ?>
            <span class="user-welcome">Welcome, <?php echo htmlspecialchars($_SESSION['username'] ?: 'User'); ?></span>
            <a href="?logout=true" class="btn-logout">Logout</a>
        <?php endif; ?>
    </div>
</nav>

        <main>
            <?php if (isset($error)): ?>
                <div class="error-message"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>

            <?php if (!$_SESSION['logged_in']): ?>
                <div class="landing-page">
                    <h1>Create Your Professional Resume</h1>
                    <p>Powered by AI • Professional Templates • Instant PDF Download</p>
                    <button class="btn-get-started" onclick="showModal('registerModal')">Get Started</button>
                    <p class="developer-credit">Developed by Firafis Bekele for IT class project</p>
                </div>
            <?php else: ?>
                <div class="resume-builder">
                    <div class="sections-panel">
                        <h2>Build Your Resume</h2>
                        <div class="section-tabs">
                            <button class="section-tab active" data-section="personal">
                                <i class="fas fa-user"></i> Personal Info
                            </button>
                            <button class="section-tab" data-section="education">
                                <i class="fas fa-graduation-cap"></i> Education
                            </button>
                            <button class="section-tab" data-section="experience">
                                <i class="fas fa-briefcase"></i> Experience
                            </button>
                            <button class="section-tab" data-section="skills">
                                <i class="fas fa-star"></i> Skills
                            </button>
                        </div>

                        <div class="form-container">
                            <form id="personalForm" class="section-form active" method="POST" enctype="multipart/form-data">
                                <div class="form-group">
                                    <label>Profile Picture</label>
                                    <input type="file" name="profile_picture" accept="image/*" id="profile-picture-input">
                                    <p class="form-hint">Recommended size: 100x100px (JPG, PNG)</p>
                                </div>
                                <div class="form-group">
                                    <label>Full Name <span class="required">*</span></label>
                                    <input type="text" name="full_name" required placeholder="Enter your full name">
                                </div>
                                <div class="form-group">
                                    <label>Email <span class="required">*</span></label>
                                    <input type="email" name="email" required placeholder="Enter your email">
                                </div>
                                <div class="form-group">
                                    <label>Phone</label>
                                    <input type="tel" name="phone" placeholder="Enter your phone number">
                                </div>
                            </form>

                            <form id="educationForm" class="section-form" method="POST">
                                <div class="education-entry">
                                    <div class="form-group">
                                        <label>Institution <span class="required">*</span></label>
                                        <input type="text" name="institution[]" required placeholder="Enter institution name">
                                    </div>
                                    <div class="form-group">
                                        <label>Degree <span class="required">*</span></label>
                                        <input type="text" name="degree[]" required placeholder="Enter degree/certification">
                                    </div>
                                    <div class="form-group">
                                        <label>GPA</label>
                                        <input type="number" name="gpa[]" step="0.01" placeholder="Enter GPA">
                                    </div>
                                </div>
                                <button type="button" class="btn-add-more" data-section="education">
                                    <i class="fas fa-plus"></i> Add More Education
                                </button>
                            </form>

                            <form id="experienceForm" class="section-form" method="POST">
                                <div class="experience-entry">
                                    <div class="form-group">
                                        <label>Company <span class="required">*</span></label>
                                        <input type="text" name="company[]" required placeholder="Enter company name">
                                    </div>
                                    <div class="form-group">
                                        <label>Position <span class="required">*</span></label>
                                        <input type="text" name="position[]" required placeholder="Enter position title">
                                    </div>
                                    <div class="form-group">
                                        <label>Duration</label>
                                        <input type="text" name="duration[]" placeholder="e.g., Jan 2020 - Dec 2022">
                                    </div>
                                </div>
                                <button type="button" class="btn-add-more" data-section="experience">
                                    <i class="fas fa-plus"></i> Add More Experience
                                </button>
                            </form>

                            <form id="skillsForm" class="section-form" method="POST">
                                <div class="skills-entry">
                                    <div class="form-group">
                                        <label>Skill <span class="required">*</span></label>
                                        <input type="text" name="skill[]" required placeholder="Enter a skill">
                                    </div>
                                    <div class="form-group">
                                        <label>Proficiency</label>
                                        <select name="proficiency[]">
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="button" class="btn-add-more" data-section="skills">
                                    <i class="fas fa-plus"></i> Add More Skill
                                </button>
                            </form>
                        </div>

                        <div class="form-group" style="margin-top: 1rem; margin-bottom: 1rem;">
                            <label for="resume-template-select" style="font-weight: 500;">Resume Template:</label>
                            <select id="resume-template-select" name="resume_template" class="form-control" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem;">
                                <option value="classic">Classic</option>
                                <option value="modern">Modern</option>
                            </select>
                        </div>

                        <div class="action-buttons">
                            <button class="btn-save">Save Progress</button>
                            <button class="btn-generate">
                                <i class="fas fa-magic"></i> Generate with AI
                            </button>
                            <button class="btn-download">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                        </div>
                    </div>

                    <div class="preview-panel">
                        <h3>Live Preview</h3>
                        <div class="preview-container">
                            <div class="preview-content">
                                <div id="loader" class="loader" style="display: none;">
                                    <div class="spinner"></div>
                                    <p>Generating your resume...</p>
                                </div>
                                <div id="personal-preview" class="preview-section">
                                    <h4>Personal Information</h4>
                                    <img id="preview-picture" class="profile-picture" src="" style="display: none;" alt="Profile Picture">
                                    <p id="preview-name"></p>
                                    <p id="preview-email"></p>
                                    <p id="preview-phone"></p>
                                </div>
                                <div id="education-preview" class="preview-section">
                                    <h4>Education</h4>
                                    <div id="education-list"></div>
                                </div>
                                <div id="experience-preview" class="preview-section">
                                    <h4>Experience</h4>
                                    <div id="experience-list"></div>
                                </div>
                                <div id="skills-preview" class="preview-section">
                                    <h4>Skills</h4>
                                    <div id="skills-list"></div>
                                </div>
                                <div id="ai-resume-preview" class="preview-section">
                                    <h4>AI-Generated Resume</h4>
                                    <div id="ai-resume-content"></div>
                                    <div class="ai-resume-actions">
                                        <button class="btn-regenerate"><i class="fas fa-sync-alt"></i> Regenerate</button>
                                        <button class="btn-copy"><i class="fas fa-copy"></i> Copy</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </main>
    </div>

    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal('loginModal')">×</span>
            <h2>Login</h2>
            <form class="login-form" method="POST">
                <input type="hidden" name="login" value="1">
                <div class="form-group">
                    <label>Username <span class="required">*</span></label>
                    <input type="text" name="username" required placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label>Password <span class="required">*</span></label>
                    <input type="password" name="password" required placeholder="Enter password">
                </div>
                <button type="submit" class="btn-submit">Login</button>
            </form>
        </div>
    </div>

    <div id="registerModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal('registerModal')">×</span>
            <h2>Register</h2>
            <form class="register-form" method="POST">
                <input type="hidden" name="register" value="1">
                <div class="form-group">
                    <label>Username <span class="required">*</span></label>
                    <input type="text" name="username" required placeholder="Choose username">
                </div>
                <div class="form-group">
                    <label>Email <span class="required">*</span></label>
                    <input type="email" name="email" required placeholder="Enter email">
                </div>
                <div class="form-group">
                    <label>Password <span class="required">*</span></label>
                    <input type="password" name="password" required placeholder="Choose password">
                </div>
                <button type="submit" class="btn-submit">Register</button>
            </form>
        </div>
    </div>

    <div id="saveProgressModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal('saveProgressModal')">×</span>
            <h2><i class="fas fa-check-circle"></i> Progress Saved!</h2>
            <p>Your resume data has been successfully saved. You can continue editing or generate your AI-enhanced resume anytime!</p>
            <button class="btn-submit" onclick="hideModal('saveProgressModal')">OK</button>
        </div>
    </div>

    <div id="downloadPdfModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal('downloadPdfModal')">×</span>
            <h2><i class="fas fa-file-pdf"></i> PDF Generated!</h2>
            <p>Your resume has been generated as a PDF and should download automatically.</p>
            <button class="btn-submit" onclick="hideModal('downloadPdfModal')">OK</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
