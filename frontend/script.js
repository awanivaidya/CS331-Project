// Toggle between login and registration forms
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    const toggleLinks = document.querySelectorAll('.toggle-form');

    // Toggle form visibility
    toggleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.toggle('active');
            registrationForm.classList.toggle('active');
        });
    });

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Validate inputs
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        console.log('Login attempt:', { email, password });
        showNotification('Login successful!', 'success');
        // Here you would typically send the data to your backend
        // Example: fetch('/api/login', { method: 'POST', body: JSON.stringify({email, password}) })
    });

    // Handle registration form submission
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const firstName = document.getElementById('regFirstName').value;
        const lastName = document.getElementById('regLastName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Validate inputs
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        console.log('Registration attempt:', { firstName, lastName, email, password });
        showNotification('Account created successfully!', 'success');
        // Here you would typically send the data to your backend
        // Example: fetch('/api/register', { method: 'POST', body: JSON.stringify({firstName, lastName, email, password}) })
    });

    // Password strength indicator
    const passwordInput = document.getElementById('regPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
});

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\.[^\\s@]+$/;
    return emailRegex.test(email);
}

// Update password strength indicator
function updatePasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    let strength = 0;
    let strengthLevel = 'Weak';
    let strengthColor = '#ff4757';

    // Check password length
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (password.length >= 16) strength++;

    // Check for character types
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Determine strength level
    if (strength < 2) {
        strengthLevel = 'Weak';
        strengthColor = '#ff4757';
    } else if (strength < 4) {
        strengthLevel = 'Fair';
        strengthColor = '#ffa502';
    } else if (strength < 6) {
        strengthLevel = 'Good';
        strengthColor = '#ffd93d';
    } else {
        strengthLevel = 'Strong';
        strengthColor = '#6bcf7f';
    }

    // Update UI
    strengthBar.style.background = `linear-gradient(90deg, ${strengthColor} ${(strength / 7) * 100}%, #3a3a4e ${(strength / 7) * 100}%)`;
    strengthText.innerHTML = `Password strength: <strong>${strengthLevel}</strong>`;
    strengthText.style.color = strengthColor;
}

// Show notification message
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease-in;
        ${type === 'success' ? 'background: #6bcf7f; color: white;' : 'background: #ff4757; color: white;'}
    `;
    document.body.appendChild(notification);

    // Auto-remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);