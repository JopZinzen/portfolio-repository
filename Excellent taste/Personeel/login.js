document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");

    if (!form || !usernameInput || !passwordInput || !errorMsg) {
        console.error("Eén of meer elementen niet gevonden.");
        return;
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        fetch("login.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            if (data === "success") {
                window.location.href = "reserveringen.html";
            } else {
                errorMsg.textContent = data;
            }
        })
        .catch(error => {
            errorMsg.textContent = "Er is een fout opgetreden.";
            console.error(error);
        });
    });
});
