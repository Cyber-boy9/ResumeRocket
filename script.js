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

// Function to clear existing entries for a section (used before loading new data)
function clearSectionEntries(section) {
    const form = document.getElementById(`${section}Form`);
    const entriesContainer = form.querySelectorAll(`.${section}-entry`);
    // Keep the first entry as a template, remove others
    for (let i = entriesContainer.length - 1; i > 0; i--) {
        entriesContainer[i].remove();
    }
    // Clear fields in the first/template entry
    if (entriesContainer.length > 0) {
        entriesContainer[0].querySelectorAll('input, select').forEach(input => {
            input.value = '';
            input.classList.remove('error');
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-text')) {
                errorMsg.remove();
            }
        });
    }
}


// Add new entry for education, experience, or skills
function addNewEntry(section, entryData = null) {
    const form = document.getElementById(`${section}Form`);
    const entries = form.querySelectorAll(`.${section}-entry`);
    let targetEntry;

    if (entryData && entries.length === 1 && Object.values(entryData).every(val => !form.querySelector(`.${section}-entry`).querySelector(`[name="${Object.keys(entryData)[0]}[]"]`).value)) {
        // If there's only one (template) entry and it's empty, use it directly for the first piece of data
        targetEntry = entries[0];
    } else {
        // Otherwise, clone the first entry as a template
        const entryTemplate = form.querySelector(`.${section}-entry`).cloneNode(true);
        entryTemplate.querySelectorAll('input, select').forEach(input => {
            input.value = ''; // Clear values for the new entry
            input.classList.remove('error');
            const errorMsg = input.nextElementSibling;
            if (errorMsg && errorMsg.classList.contains('error-text')) {
                 errorMsg.remove();
            }
        });
        form.insertBefore(entryTemplate, form.querySelector('.btn-add-more'));
        targetEntry = entryTemplate;
    }
    
    if (entryData) {
        Object.keys(entryData).forEach(key => {
            const input = targetEntry.querySelector(`[name="${key}[]"]`);
            if (input) {
                input.value = entryData[key];
            }
        });
    }

    // Reattach input event listeners to new inputs if they were cloned
    if (targetEntry !== entries[0] || !entryData) { // only if a new node was added or it's a manual add
        targetEntry.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', updatePreview);
        });
    }
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
        const response = await fetch('api_handler.php', { // Call the PHP backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: prompt }), // Send prompt in the expected format
        });

        if (!response.ok) {
            // Try to get more specific error from backend if possible, or use generic HTTP error
            let errorMessage = `Error from server: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMessage = `Error from server: ${errorData.error}`;
                }
            } catch (e) {
                // Could not parse JSON, stick with HTTP error
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        if (data.success && data.text) {
            return data.text; // Return the generated text
        } else {
            console.error('Backend reported an error or did not return text:', data.error);
            throw new Error(data.error || 'Failed to get valid response from backend.');
        }

    } catch (error) {
        // Re-throw the error to be caught by the calling function (.btn-generate event listener)
        throw error;
    } finally {
        // Hide loader
        document.getElementById('loader').style.display = 'none';
    }
}

// Generate PDF
function generatePDF(resumeText) {
    const selectedTemplate = document.getElementById('resume-template-select').value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const profilePicture = document.getElementById('preview-picture').src;
    let yPosition = 20; // Initial Y position, might be adjusted by templates.

    // Default settings (can be overridden)
    let fontName = 'helvetica';
    let normalFontSize = 12;
    let headingFontSize = 14;
    let nameFontSize = 20;
    let textColor = '#000000';
    let accentColor = '#000000'; // Default to black, modern can change it
    const margin = 15;
    const maxLineWidth = doc.internal.pageSize.width - 2 * margin;

    if (selectedTemplate === 'classic') {
        fontName = 'times'; // jsPDF uses 'times' for Times New Roman
        textColor = '#000000';
        accentColor = '#000000';
        // yPosition and image handling might be standard for classic
        if (profilePicture && profilePicture !== window.location.href && !profilePicture.startsWith('http://localhost/') && !profilePicture.startsWith('file://')) { // Check if it's a real image
            try {
                doc.addImage(profilePicture, 'JPEG', margin, yPosition, 30, 30);
                yPosition += 40; // Space after image
            } catch (e) { console.error("Error adding image for classic: ", e); }
        }

    } else if (selectedTemplate === 'modern') {
        fontName = 'helvetica';
        textColor = '#333333'; // Dark gray
        accentColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#2563eb'; // Use app's primary color
        
        // Modern might place image differently or style it
        if (profilePicture && profilePicture !== window.location.href && !profilePicture.startsWith('http://localhost/') && !profilePicture.startsWith('file://')) {
            try {
                doc.addImage(profilePicture, 'JPEG', margin, yPosition, 35, 35); 
                yPosition += 45;
            } catch (e) { console.error("Error adding image for modern: ", e); }
        }
        // Add a header line for modern template
        doc.setDrawColor(accentColor);
        doc.setLineWidth(0.5);
        // Adjust line position based on whether profile picture is present and valid
        const lineYPosition = (profilePicture && profilePicture !== window.location.href && !profilePicture.startsWith('http://localhost/') && !profilePicture.startsWith('file://')) ? yPosition - 10 : 15;
        doc.line(margin, lineYPosition , doc.internal.pageSize.width - margin, lineYPosition); 
        if (!profilePicture || profilePicture.startsWith('http://localhost/') || profilePicture.startsWith('file://')) yPosition = lineYPosition + 10; // Adjust if no picture or invalid picture
    }

    doc.setFont(fontName, 'normal');
    doc.setFontSize(normalFontSize);
    doc.setTextColor(textColor);

    const lines = resumeText.split('\n');
    const pageHeight = doc.internal.pageSize.height;

    // Loop through lines from resumeText
    lines.forEach(line => {
        if (yPosition + 7 > pageHeight - 20) { // Check for page break
            doc.addPage();
            yPosition = 20; // Reset yPosition for new page

            if (selectedTemplate === 'modern') { // Re-draw header line on new page for modern
                doc.setDrawColor(accentColor);
                doc.setLineWidth(0.5);
                doc.line(margin, yPosition - 5, doc.internal.pageSize.width - margin, yPosition - 5);
                yPosition += 5;
            }
        }

        let effectiveMaxLineWidth = maxLineWidth;
        let currentX = margin;

        if (line.startsWith('## ')) { // Heading
            doc.setFont(fontName, 'bold');
            doc.setFontSize(headingFontSize);
            if (selectedTemplate === 'modern') {
                doc.setTextColor(accentColor);
            }
            doc.text(line.replace('## ', ''), currentX, yPosition);
            yPosition += headingFontSize * 0.7; // Adjust spacing based on font size
            doc.setFont(fontName, 'normal');
            doc.setFontSize(normalFontSize);
            doc.setTextColor(textColor); // Reset to normal text color
        } else if (line.startsWith('### ')) { // Sub-Heading / Name
             doc.setFont(fontName, 'bold');
             doc.setFontSize(nameFontSize);
             doc.text(line.replace('### ', ''), currentX, yPosition);
             yPosition += nameFontSize * 0.7;
             doc.setFont(fontName, 'normal');
             doc.setFontSize(normalFontSize);
        } else if (line.startsWith('- ')) { // Bullet point
            const itemText = line.replace('- ', '• ');
            const wrappedText = doc.splitTextToSize(itemText, effectiveMaxLineWidth - 5); // Indent bullet
            wrappedText.forEach(wrappedLine => {
                if (yPosition + 7 > pageHeight - 20) { doc.addPage(); yPosition = 20; }
                doc.text(wrappedLine, currentX + 5, yPosition);
                yPosition += 7;
            });
        } else if (line.trim() !== '') { // Normal text
            const wrappedText = doc.splitTextToSize(line, effectiveMaxLineWidth);
            wrappedText.forEach(wrappedLine => {
                if (yPosition + 7 > pageHeight - 20) { doc.addPage(); yPosition = 20; }
                doc.text(wrappedLine, currentX, yPosition);
                yPosition += 7;
            });
        } else { // Empty line
            yPosition += 5; // Space for empty lines
        }
    });

    doc.save('resume.pdf');
}

// Tab Switching and Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Handle splash screen display
    const splashScreen = document.getElementById('splashScreen');
    // Using localStorage for splash screen persistence across sessions.
    const hasSeenSplash = localStorage.getItem('hasSeenSplash');

    if (!hasSeenSplash && splashScreen) {
        splashScreen.style.display = 'flex';
        setTimeout(() => {
            splashScreen.style.display = 'none';
            localStorage.setItem('hasSeenSplash', 'true');
        }, 3500);
    } else {
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
    }

    // Load resume data from server if user is logged in
    if (typeof USER_IS_LOGGED_IN !== 'undefined' && USER_IS_LOGGED_IN) {
        loadResumeDataFromServer();
    } else {
        // If not logged in, ensure forms are in a clean state (especially multi-entry ones)
        ['education', 'experience', 'skills'].forEach(section => {
            clearSectionEntries(section);
            addNewEntry(section); // Ensure one blank entry exists
        });
        updatePreview(); // Initial preview update for a clean state
    }

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
                previewPicture.src = e.target.result; // This is a base64 string
                previewPicture.style.display = 'block';
                updatePreview(); // Update preview when image changes
            };
            reader.readAsDataURL(file);
        }
    });

    // Add more entries
    document.querySelectorAll('.btn-add-more').forEach(btn => {
        btn.addEventListener('click', function() {
            addNewEntry(this.dataset.section); // Pass null for entryData to add a blank one
            updatePreview();
        });
    });

    // Save Progress
    document.querySelector('.btn-save')?.addEventListener('click', async function() {
        if (typeof USER_IS_LOGGED_IN !== 'undefined' && USER_IS_LOGGED_IN) {
            await saveResumeData();
        } else {
            alert("Please log in to save your progress.");
            showModal('loginModal');
        }
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

// New function to save resume data to the server
async function saveResumeData() {
    if (!USER_IS_LOGGED_IN || !USER_ID) {
        alert("You must be logged in to save data.");
        return;
    }

    const personalForm = document.getElementById('personalForm');
    const personalInfo = {};
    new FormData(personalForm).forEach((value, key) => {
        if (key !== 'profile_picture') { // Exclude file input itself
            personalInfo[key] = value;
        }
    });

    const profilePicturePreview = document.getElementById('preview-picture');
    let profilePictureBase64 = null;
    if (profilePicturePreview.src && profilePicturePreview.src !== window.location.href && profilePicturePreview.style.display !== 'none') {
        // Check if src is a base64 string
        if (profilePicturePreview.src.startsWith('data:image')) {
            profilePictureBase64 = profilePicturePreview.src;
        }
    }
    
    const educationData = [];
    document.getElementById('educationForm').querySelectorAll('.education-entry').forEach(entry => {
        const entryData = {};
        entry.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace(/\[\]$/, '');
            if (input.value) entryData[name] = input.value;
        });
        if (Object.keys(entryData).length > 0) educationData.push(entryData);
    });

    const experienceData = [];
    document.getElementById('experienceForm').querySelectorAll('.experience-entry').forEach(entry => {
        const entryData = {};
        entry.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace(/\[\]$/, '');
            if (input.value) entryData[name] = input.value;
        });
        if (Object.keys(entryData).length > 0) experienceData.push(entryData);
    });

    const skillsData = [];
    document.getElementById('skillsForm').querySelectorAll('.skills-entry').forEach(entry => {
        const entryData = {};
        entry.querySelectorAll('input, select').forEach(input => {
            const name = input.name.replace(/\[\]$/, '');
            if (input.value) entryData[name] = input.value;
        });
        if (Object.keys(entryData).length > 0) skillsData.push(entryData);
    });

    const aiGeneratedContent = document.getElementById('ai-resume-content').textContent;

    const resumeFullData = {
        personalInfo: personalInfo,
        profilePictureBase64: profilePictureBase64,
        education: educationData,
        experience: experienceData,
        skills: skillsData,
        aiGeneratedContent: aiGeneratedContent
    };

    try {
        const response = await fetch('save_resume.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resumeFullData)
        });
        const result = await response.json();
        if (result.success) {
            showModal('saveProgressModal');
        } else {
            alert('Error saving resume: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to save resume data:', error);
        alert('Failed to save resume data. Check console for details.');
    }
}


// New function to load resume data from the server
async function loadResumeDataFromServer() {
    if (!USER_IS_LOGGED_IN || !USER_ID) return;

    try {
        const response = await fetch('load_resume.php');
        const result = await response.json();

        if (result.success && result.data) {
            const serverData = result.data;

            // Populate Personal Info
            if (serverData.personalInfo) {
                const personalForm = document.getElementById('personalForm');
                Object.keys(serverData.personalInfo).forEach(key => {
                    const input = personalForm.querySelector(`[name="${key}"]`);
                    if (input) input.value = serverData.personalInfo[key];
                });
            }
            if (serverData.profilePictureBase64) {
                const previewPicture = document.getElementById('preview-picture');
                previewPicture.src = serverData.profilePictureBase64;
                previewPicture.style.display = 'block';
            } else {
                document.getElementById('preview-picture').src = '';
                document.getElementById('preview-picture').style.display = 'none';
            }


            // Populate Education, Experience, Skills
            ['education', 'experience', 'skills'].forEach(section => {
                clearSectionEntries(section); // Clear existing template/empty entries
                const sectionData = serverData[section] || [];
                if (sectionData.length > 0) {
                    sectionData.forEach((entry, index) => {
                        addNewEntry(section, entry);
                    });
                } else {
                     addNewEntry(section); // Add one blank entry if no data for this section
                }
            });
            
            // Populate AI Generated Content
            if (serverData.aiGeneratedContent) {
                document.getElementById('ai-resume-content').textContent = serverData.aiGeneratedContent;
                document.getElementById('ai-resume-preview').style.display = 'block';
            } else {
                 document.getElementById('ai-resume-content').textContent = '';
                 document.getElementById('ai-resume-preview').style.display = 'none';
            }

            updatePreview();
        } else if (result.success && result.data === null) {
            console.log(result.message || 'No resume data found on server.');
            // Ensure forms are clean if no data, especially multi-entry
            ['education', 'experience', 'skills'].forEach(section => {
                clearSectionEntries(section);
                addNewEntry(section); // Add one blank entry
            });
            updatePreview();
        } else {
            alert('Error loading resume data: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Failed to load resume data from server:', error);
        // alert('Failed to load resume data. Check console for details.');
    }
}
