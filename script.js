const GEMINI_API_KEY = 'AIzaSyC7h06DcW0p4sPYpeuJ7IRVGAgrX35NG2I'; //gemini Ai api
// Show/Hide Modals
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function hideModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            input.nextElementSibling?.remove();
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-text';
            errorMsg.textContent = 'This field is required';
            input.parentNode.appendChild(errorMsg);
        } else {
            input.classList.remove('error');
            input.nextElementSibling?.remove();
        }
    });
    
    return isValid;
}

// Load saved data
function loadSavedData() {
    const sections = ['personal', 'education', 'experience', 'skills'];
    sections.forEach(section => {
        const savedData = sessionStorage.getItem(`${section}_data`);
        if (savedData) {
            const data = JSON.parse(savedData);
            const form = document.getElementById(`${section}Form`);
            if (section === 'personal') {
                Object.keys(data).forEach(key => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input && key !== 'profile_picture') input.value = data[key];
                });
                // Load profile picture
                if (data.profile_picture) {
                    const previewPicture = document.getElementById('preview-picture');
                    previewPicture.src = data.profile_picture;
                    previewPicture.style.display = 'block';
                }
            } else {
                const entriesContainer = form.querySelector(`.${section}-entry`);
                entriesContainer.innerHTML = ''; // Clear existing entries
                data.forEach((entry, index) => {
                    if (index > 0) addNewEntry(section); // Add additional entries
                    const currentEntry = form.querySelectorAll(`.${section}-entry`)[index] || entriesContainer;
                    Object.keys(entry).forEach(key => {
                        const input = currentEntry.querySelector(`[name="${key}[]"]`);
                        if (input) input.value = entry[key];
                    });
                });
            }
        }
    });
    updatePreview(); // Update preview after loading
}

// Add new entry for education, experience, or skills
function addNewEntry(section) {
    const form = document.getElementById(`${section}Form`);
    const entryTemplate = form.querySelector(`.${section}-entry`).cloneNode(true);
    entryTemplate.querySelectorAll('input, select').forEach(input => {
        input.value = '';
        input.classList.remove('error');
        input.nextElementSibling?.remove();
    });
    form.insertBefore(entryTemplate, form.querySelector('.btn-add-more'));
    // Reattach input event listeners to new inputs
    entryTemplate.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', updatePreview);
    });
}

// Update preview panel
function updatePreview() {
    // Personal Info
    const personalForm = document.getElementById('personalForm');
    document.getElementById('preview-name').textContent = 
        personalForm.querySelector('[name="full_name"]').value || 'Full Name';
    document.getElementById('preview-email').textContent = 
        personalForm.querySelector('[name="email"]').value || 'Email';
    document.getElementById('preview-phone').textContent = 
        personalForm.querySelector('[name="phone"]').value || 'Phone';

    // Education
    const educationForm = document.getElementById('educationForm');
    const educationList = document.getElementById('education-list');
    educationList.innerHTML = '';
    educationForm.querySelectorAll('.education-entry').forEach(entry => {
        const institution = entry.querySelector('[name="institution[]"]').value;
        const degree = entry.querySelector('[name="degree[]"]').value;
        const gpa = entry.querySelector('[name="gpa[]"]').value;
        if (institution || degree) {
            const li = document.createElement('li');
            li.textContent = `${degree || 'Degree'} at ${institution || 'Institution'}${gpa ? `, GPA: ${gpa}` : ''}`;
            educationList.appendChild(li);
        }
    });

    // Experience
    const experienceForm = document.getElementById('experienceForm');
    const experienceList = document.getElementById('experience-list');
    experienceList.innerHTML = '';
    experienceForm.querySelectorAll('.experience-entry').forEach(entry => {
        const company = entry.querySelector('[name="company[]"]').value;
        const position = entry.querySelector('[name="position[]"]').value;
        const duration = entry.querySelector('[name="duration[]"]').value;
        if (company || position) {
            const li = document.createElement('li');
            li.textContent = `${position || 'Position'} at ${company || 'Company'}${duration ? ` (${duration})` : ''}`;
            experienceList.appendChild(li);
        }
    });

    // Skills
    const skillsForm = document.getElementById('skillsForm');
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    skillsForm.querySelectorAll('.skills-entry').forEach(entry => {
        const skill = entry.querySelector('[name="skill[]"]').value;
        const proficiency = entry.querySelector('[name="proficiency[]"]').value;
        if (skill) {
            const li = document.createElement('li');
            li.textContent = `${skill} (${proficiency || 'Proficiency'})`;
            skillsList.appendChild(li);
        }
    });
}

// Collect form data for AI generation
function collectFormData() {
    const data = {
        personal: {},
        education: [],
        experience: [],
        skills: []
    };

    // Personal Info
    const personalForm = document.getElementById('personalForm');
    const personalInputs = personalForm.querySelectorAll('input');
    personalInputs.forEach(input => {
        if (input.name !== 'profile_picture') {
            data.personal[input.name] = input.value;
        }
    });

    // Education
    const educationForm = document.getElementById('educationForm');
    educationForm.querySelectorAll('.education-entry').forEach(entry => {
        const entryData = {};
        entry.querySelectorAll('input').forEach(input => {
            const name = input.name.replace(/\[\]$/, '');
            entryData[name] = input.value;
        });
        if (Object.values(entryData).some(val => val)) {
            data.education.push(entryData);
        }
    });

    // Experience
    const experienceForm = document.getElementById('experienceForm');
    experienceForm.querySelectorAll('.experience-entry').forEach(entry => {
        const entryData = {};
        entry.querySelectorAll('input').forEach(input => {
            const name = input.name.replace(/\[\]$/, '');
            entryData[name] = input.value;
        });
        if (Object.values(entryData).some(val => val)) {
            data.experience.push(entryData);
        }
    });

    // Skills
    const skillsForm = document.getElementById('skillsForm');
    skillsForm.querySelectorAll('.skills-entry').forEach(entry => {
        const entryData = {};
        entry.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace(/\[\]$/, '');
            entryData[name] = input.value;
        });
        if (Object.values(entryData).some(val => val)) {
            data.skills.push(entryData);
        }
    });

    return data;
}

// Generate resume using Gemini API
async function generateResumeWithAI(data) {
    // Show loader
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('personal-preview').style.display = 'none';
    document.getElementById('education-preview').style.display = 'none';
    document.getElementById('experience-preview').style.display = 'none';
    document.getElementById('skills-preview').style.display = 'none';
    document.getElementById('ai-resume-preview').style.display = 'none';

    // Construct detailed prompt
    let prompt = "Generate a professional, polished resume based on the following details. Ensure the resume is concise, well-organized, and formatted with clear section headers, bullet points for details, and proper spacing. Use professional language and highlight achievements where possible. and the most important thing is build this resume like you are writing for your self like you are that person with the given details just weite the complete one that is perfect for copy paste, no nothing just the resume or CV!\n\n";

    prompt += "## Personal Information\n";
    prompt += `- Full Name: ${data.personal.full_name || 'Not provided'}\n`;
    prompt += `- Email: ${data.personal.email || 'Not provided'}\n`;
    prompt += `- Phone: ${data.personal.phone || 'Not provided'}\n\n`;

    if (data.education.length > 0) {
        prompt += "## Education\n";
        data.education.forEach(edu => {
            prompt += `- **${edu.degree || 'Degree'}**, ${edu.institution || 'Institution'}${edu.gpa ? `, GPA: ${edu.gpa}` : ''}\n`;
        });
        prompt += "\n";
    }

    if (data.experience.length > 0) {
        prompt += "## Experience\n";
        data.experience.forEach(exp => {
            prompt += `- **${exp.position || 'Position'}**, ${exp.company || 'Company'}${exp.duration ? ` (${exp.duration})` : ''}\n`;
            prompt += `  - Demonstrated expertise in relevant tasks.\n`;
            prompt += `  - Collaborated with teams to achieve goals.\n`;
        });
        prompt += "\n";
    }

    if (data.skills.length > 0) {
        prompt += "## Skills\n";
        data.skills.forEach(skill => {
            prompt += `- ${skill.skill || 'Skill'} (${skill.proficiency || 'Proficiency'})\n`;
        });
        prompt += "\n";
    }

    prompt += "Format the resume as plain text with markdown-style headers and bullet points. Ensure each section is clearly separated with newlines. Optimize for readability and professionalism.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const result = await response.json();
        return result.candidates[0].content.parts[0].text;
    } catch (error) {
        throw error;
    } finally {
        // Hide loader
        document.getElementById('loader').style.display = 'none';
    }
}

// Generate PDF
function generatePDF(resumeText) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Set font and styling
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Add profile picture if available
    const profilePicture = document.getElementById('preview-picture').src;
    let yPosition = 20;

    if (profilePicture && profilePicture !== window.location.href) {
        try {
            doc.addImage(profilePicture, 'JPEG', 15, 10, 30, 30); // 30x30mm image
            yPosition = 45; // Adjust starting position to account for image
        } catch (error) {
            console.error('Error adding image to PDF:', error);
        }
    }

    // Split text into lines for better control
    const lines = resumeText.split('\n');
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const maxLineWidth = 180;

    lines.forEach(line => {
        if (yPosition + 7 > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
        }

        if (line.startsWith('## ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text(line.replace('## ', ''), margin, yPosition);
            yPosition += 10;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
        } else if (line.startsWith('- ')) {
            const text = line.replace('- ', '• ');
            const wrappedText = doc.splitTextToSize(text, maxLineWidth);
            wrappedText.forEach(wrappedLine => {
                if (yPosition + 7 > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(wrappedLine, margin + 5, yPosition);
                yPosition += 7;
            });
        } else if (line.trim() !== '') {
            const wrappedText = doc.splitTextToSize(line, maxLineWidth);
            wrappedText.forEach(wrappedLine => {
                if (yPosition + 7 > pageHeight - 20) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(wrappedLine, margin, yPosition);
                yPosition += 7;
            });
        } else {
            yPosition += 5;
        }
    });

    // Save the PDF
    doc.save('resume.pdf');
}

// Tab Switching and Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Handle splash screen display
    const splashScreen = document.getElementById('splashScreen');
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');

    if (!hasSeenSplash && splashScreen) {
        // Show splash screen and set flag
        splashScreen.style.display = 'flex';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            sessionStorage.setItem('hasSeenSplash', 'true');
        }, 3500);
    } else {
        // Hide splash screen immediately if already seen
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
    }

    // Load saved data
    loadSavedData();

    const tabs = document.querySelectorAll('.section-tab');
    const forms = document.querySelectorAll('.section-form');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            const formId = tab.dataset.section + 'Form';
            const form = document.getElementById(formId);
            if (form) {
                form.classList.add('active');
            }
            updatePreview();
        });
    });

    // Handle form submissions
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(loginForm)) {
            loginForm.submit();
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (validateForm(registerForm)) {
            registerForm.submit();
        }
    });

    // Live preview updating
    const inputs = document.querySelectorAll('.section-form input:not([type="file"]), .section-form select');
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
    });

    // Profile picture upload
    const profilePictureInput = document.getElementById('profile-picture-input');
    profilePictureInput?.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewPicture = document.getElementById('preview-picture');
                previewPicture.src = e.target.result;
                previewPicture.style.display = 'block';
                // Save to sessionStorage
                const personalData = JSON.parse(sessionStorage.getItem('personal_data') || '{}');
                personalData.profile_picture = e.target.result;
                sessionStorage.setItem('personal_data', JSON.stringify(personalData));
            };
            reader.readAsDataURL(file);
        }
    });

    // Add more entries
    document.querySelectorAll('.btn-add-more').forEach(btn => {
        btn.addEventListener('click', function() {
            addNewEntry(this.dataset.section);
            updatePreview();
        });
    });

    // Save Progress
    document.querySelector('.btn-save')?.addEventListener('click', function() {
        const sections = ['personal', 'education', 'experience', 'skills'];
        sections.forEach(section => {
            const form = document.getElementById(`${section}Form`);
            if (section === 'personal') {
                const formData = new FormData(form);
                const data = {};
                formData.forEach((value, key) => {
                    if (key !== 'profile_picture') {
                        data[key] = value;
                    }
                });
                // Include profile picture from preview
                const previewPicture = document.getElementById('preview-picture');
                if (previewPicture.src && previewPicture.style.display !== 'none') {
                    data.profile_picture = previewPicture.src;
                }
                sessionStorage.setItem(`${section}_data`, JSON.stringify(data));
            } else {
                const entries = form.querySelectorAll(`.${section}-entry`);
                const data = [];
                entries.forEach(entry => {
                    const entryData = {};
                    entry.querySelectorAll('input, select').forEach(input => {
                        const name = input.name.replace(/\[\]$/, '');
                        entryData[name] = input.value;
                    });
                    if (Object.values(entryData).some(val => val)) {
                        data.push(entryData);
                    }
                });
                sessionStorage.setItem(`${section}_data`, JSON.stringify(data));
            }
        });
        showModal('saveProgressModal');
    });

    // Generate with AI
    document.querySelector('.btn-generate')?.addEventListener('click', async function() {
        const data = collectFormData();
        try {
            const resumeText = await generateResumeWithAI(data);
            // Show AI-generated resume
            const aiResumePreview = document.getElementById('ai-resume-preview');
            aiResumePreview.style.display = 'block';
            document.getElementById('ai-resume-content').textContent = resumeText;
        } catch (error) {
            alert('Error generating resume: ' + error.message);
        }
    });

    // Regenerate AI Resume
    document.querySelector('.btn-regenerate')?.addEventListener('click', function() {
        document.querySelector('.btn-generate').click();
    });

    // Copy AI Resume
    document.querySelector('.btn-copy')?.addEventListener('click', function() {
        const aiResumeText = document.getElementById('ai-resume-content').textContent;
        if (aiResumeText) {
            navigator.clipboard.writeText(aiResumeText).then(() => {
                alert('Resume copied to clipboard!');
            }).catch(err => {
                alert('Failed to copy resume: ' + err);
            });
        } else {
            alert('No resume content to copy!');
        }
    });

    // Download PDF
    document.querySelector('.btn-download')?.addEventListener('click', function() {
        const resumeText = document.getElementById('ai-resume-content').textContent;
        if (resumeText) {
            generatePDF(resumeText);
            showModal('downloadPdfModal');
        } else {
            alert('Please generate a resume first!');
        }
    });
});
