const loginTab = document.getElementById("loginTab")
const registerTab = document.getElementById("registerTab")

const loginForm = document.getElementById("loginForm")
const registerForm = document.getElementById("registerForm")

const dashboardBtn = document.getElementById("dashboard-btn")
const statisticsBtn = document.getElementById("statistics-btn")

if (loginTab && registerTab && loginForm && registerForm) {
  registerTab.addEventListener("click", () => {
    loginForm.style.display = "none";
    registerForm.style.display = "flex";

    loginTab.classList.remove("active");
    registerTab.classList.add("active");
  });

  loginTab.addEventListener("click", () => {
    registerForm.style.display = "none";
    loginForm.style.display = "flex";

    registerTab.classList.remove("active");
    loginTab.classList.add("active");
  });
}

if (dashboardBtn && statisticsBtn) {
    dashboardBtn.addEventListener("click", () => {
        dashboardBtn.classList.add("active")
        statisticsBtn.classList.remove("active")
    })

    statisticsBtn.addEventListener("click", () => {
        statisticsBtn.classList.add("active")
        dashboardBtn.classList.remove("active")
    })
}

if (document.querySelector("#statistics-btn")) {
  document.querySelector("#statistics-btn").addEventListener("click", () => {
    document.querySelector(".dashboard").style.display = "none";
    document.querySelector(".estatisticas").style.display = "flex";

    document.querySelector(".header-text h2").textContent = "Estatísticas";
    document.querySelector(".header-text p").textContent =
      "Análise de performance dos últimos 30 dias";
  });
}

if (document.querySelector("#dashboard-btn")) {
  document.querySelector("#dashboard-btn").addEventListener("click", () => {
    document.querySelector(".dashboard").style.display = "flex";
    document.querySelector(".estatisticas").style.display = "none";

    document.querySelector(".header-text h2").textContent = "ENEM Performance";
    document.querySelector(".header-text p").textContent =
      "Controle de estudos e evolução pessoal";
  });
}

if (document.getElementById("logout-btn")) {
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/index.html";
  });
}