// Example of how to replace console.log statements with API calls

function login(username, password) {
    fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Save the token to localStorage
        localStorage.setItem('authToken', data.token);
        console.log('Login successful! Token stored.');
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

function register(username, password) {
    fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Save the token to localStorage
        localStorage.setItem('authToken', data.token);
        console.log('Registration successful! Token stored.');
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

// Replace any occurrence of console.log statements as needed