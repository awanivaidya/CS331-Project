// Importing the necessary functions to handle API calls

async function authenticateUser(credentials) {
    try {
        const response = await fetch('http://localhost:5001/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error authenticating user:', error);
    }
}

// Usage example
const credentials = { username: 'user', password: 'pass' }; // Replace with actual user input

// Instead of console.log, call the authenticateUser function
authenticateUser(credentials).then((data) => {
    console.log('Authentication response:', data);
});
