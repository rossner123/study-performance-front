document.querySelector('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.querySelector('#email').value
    const password = document.querySelector('#senha').value

    try {
      const response = await fetch(`${APP_CONFIG.API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        alert(data.error || "Erro ao fazer login");
        return;
      }

      localStorage.setItem("token", data.token);

      window.location.href = "dashboard.html";

    } catch (error) {
      console.error("Erro ao fazer login:", error);
    }
})