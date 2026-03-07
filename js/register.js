document.querySelector('#registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.querySelector('#nome').value
    const email = document.querySelector('#email-registro').value
    const password = document.querySelector('#senha-registro').value

    try {
      const response = await fetch(`${APP_CONFIG.API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao cadastrar");
        return;
      }

      document.querySelector("#loginTab").click();

    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
    }
})