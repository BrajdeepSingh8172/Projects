document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signupForm");
    console.log("working")

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        // Get form values
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Create an object to store user details
        const userDetails = {
            name: name,
            email: email,   
            password: password
        };

        // Save user details in localStorage
        localStorage.setItem("userDetails", JSON.stringify(userDetails));

        // Clear form fields
        form.reset();
        alert("Signup successful!");
    });
});
