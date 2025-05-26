<?php
session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About ResumeRocket</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="app-container">
        <nav>
            <div class="logo">
                <i class="fas fa-rocket"></i>
                <span>ResumeRocket</span>
            </div>
            <div class="nav-links">
                <a href="index.php" class="nav-link">Home</a>
                <a href="about.php" class="nav-link active">About</a>
                <?php if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']): ?>
                    <button class="btn-login" onclick="showModal('loginModal')">Login</button>
                    <button class="btn-register" onclick="showModal('registerModal')">Register</button>
                <?php else: ?>
                    <span class="user-welcome">Welcome, <?php echo htmlspecialchars($_SESSION['username'] ?: 'User'); ?></span>
                    <a href="index.php?logout=true" class="btn-logout">Logout</a>
                <?php endif; ?>
            </div>
        </nav>

        <main class="about-page">
            <section class="about-header">
                <h1>About ResumeRocket</h1>
                <p>Empowering you to launch your career with a stellar resume! 🚀</p>
            </section>

            <section class="about-project">
                <h2>The Project</h2>
                <p>ResumeRocket is a web-based resume builder designed to help users create professional, AI-enhanced resumes with ease. This project was born as part of a class assignment where our awesome teacher randomly handed out unique projects to each student. I, Firafis Bekele, was lucky enough to land this one! While my classmates are grinding on their own cool projects, I poured my heart into making ResumeRocket a sleek, user-friendly tool to help anyone craft a resume that stands out.</p>
                <p>With features like live previews, AI-generated content, and PDF downloads, ResumeRocket is all about making resume-building fast, fun, and professional. This project is a testament to creativity, coding, and a passion for helping others succeed!</p>
            </section>

            <section class="about-team">
                <h2>Meet the Team</h2>
                <div class="team-container">
                    <!-- Student Profile -->
                    <div class="team-member">
                        <img src="images/firafis.jpg" alt="Firafis Bekele" class="team-photo">
                        <h3>Firafis Bekele</h3>
                        <p class="team-role">Student & Developer</p>
                        <p class="team-bio">I'm Firafis, a passionate student who loves coding and building dope web apps. ResumeRocket is my baby, created as a class project to flex my skills and help people land their dream jobs!</p>
                        <p class="team-contact"><i class="fab fa-telegram"></i> Telegram: <a href="https://t.me/FirafisBekele" target="_blank">FirafisBekele</a></p>
                    </div>
                    <!-- Teacher Profile -->
                    <div class="team-member">
                        <img src="images/tolesa.jpg" alt="Tolesa" class="team-photo">
                        <h3>Tolesa Sori</h3>
                        <p class="team-role">Teacher & Mentor</p>
                        <p class="team-bio">Our amazing teacher who inspires us daily and assigned this project to spark our creativity. With their guidance, ResumeRocket came to life!</p>
                        <p class="team-contact"><i class="fab fa-telegram"></i> Telegram: <a href="https://t.me/Tolesa1" target="_blank">Tolesa Sori</a></p>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal('loginModal')">×</span>
            <h2>Login</h2>
            <form class="login-form" method="POST" action="index.php">
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

    <!-- Register Modal -->
    <div id="registerModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="hideModal('registerModal')">×</span>
            <h2>Register</h2>
            <form class="register-form" method="POST" action="index.php">
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

    <script src="script.js"></script>
</body>
</html>