 const USERNAME = "admin";
        const PASSWORD = "password123";

        document.getElementById("loginForm").addEventListener("submit", function(e) {
            e.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const errorMsg = document.getElementById("errorMsg");

            if (username === USERNAME && password === PASSWORD) {
                errorMsg.textContent = "";
                alert("Login successful!");
                // Redirect or load another page here
                // window.location.href = "dashboard.html";
            } else {
                errorMsg.textContent = "Invalid username or password.";
            }
        });