document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault(); // voorkom standaard gedrag

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

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