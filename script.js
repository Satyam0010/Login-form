const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

// Toggle between login and registration forms
registerBtn.addEventListener('click',()=>{
    container.classList.add('active');
});

loginBtn.addEventListener('click',()=>{
    container.classList.remove('active');
});

// Handle Login Form Submission
const loginForm = document.querySelector('.form-box.login form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = loginForm.querySelector('input[type="text"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;
    
    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Store username in localStorage
            localStorage.setItem('username', data.username);
            // Redirect to welcome page
            window.location.href = 'welcome.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error connecting to server. Please try again.');
        console.error('Login error:', error);
    }
});

// Handle Registration Form Submission
const registerForm = document.querySelector('.form-box.register form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = registerForm.querySelector('input[type="text"]').value;
    const email = registerForm.querySelector('input[type="email"]').value;
    const password = registerForm.querySelector('input[type="password"]').value;
    
    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            // Switch back to login form
            container.classList.remove('active');
            // Clear registration form
            registerForm.reset();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error connecting to server. Please try again.');
        console.error('Registration error:', error);
    }
});