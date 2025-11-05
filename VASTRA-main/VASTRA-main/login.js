document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    const errorText = document.getElementById("errorText");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        // Get form values
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Get user details from localStorage
        const userDetails = JSON.parse(localStorage.getItem("userDetails"));
        console.log(email, password, localStorage)
        // Check if the email and password match the stored data
        if (userDetails && userDetails.email === email && userDetails.password === password) {
            // Successful login
            errorText.textContent = "";
            alert("Login successful!");
            window.location.href = "index2.html";
            // Redirect to another page or perform further actions as needed
        } else {
            // Failed login
            errorText.textContent = "Invalid email or password.";
        }
    });
});