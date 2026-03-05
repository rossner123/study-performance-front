let tempoSalvoHoje = 0;
let questoesSalvasHoje = 0;
let taxaSalvaHoje = 0;
let acertosSalvosHoje = 0;
let dadosComparacao = null;
let subjectToDelete = null;
let cardToDelete = null;

const dia = document.getElementById("dia");

let diaAtual = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric"
});

dia.innerText = diaAtual;

document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${APP_CONFIG.API_URL}/daily/today`, {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();

        tempoSalvoHoje = Number(data.tempo_total) || 0;
        questoesSalvasHoje = Number(data.questoes_total) || 0;
        taxaSalvaHoje = Number(data.taxa_acerto) || 0;
        acertosSalvosHoje = Math.round(
          (taxaSalvaHoje / 100) * questoesSalvasHoje,
        );

        document.querySelector("#tempoTotal").innerText = tempoSalvoHoje;
        document.querySelector("#questoesTotal").innerText = questoesSalvasHoje;
        document.querySelector("#taxaAcerto").innerText = taxaSalvaHoje + "%";

        atualizarStatusDia(tempoSalvoHoje, taxaSalvaHoje);

        await carregarComparacoes();

        await carregarMaterias();

        await carregarTemposAnteriores()

    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }

});

async function carregarMaterias() {

    const token = localStorage.getItem("token");

    const response = await fetch(`${APP_CONFIG.API_URL}/subjects`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const subjects = await response.json();

    subjects.forEach((subject) => {
      criarMateriaCard(subject.name, subject.id);
    });
}

function atualizarResumoCompleto() {
  let totalMinutos = 0;
  let totalQuestoes = 0;
  let totalAcertos = 0;

  const materias = document.querySelectorAll(".materia-card");

  materias.forEach((materia) => {
    const minutos = Number(materia.querySelector(".minutos-input").value) || 0;
    const questoes =
      Number(materia.querySelector(".questoes-input").value) || 0;
    const acertos = Number(materia.querySelector(".acertos-input").value) || 0;

    totalMinutos += minutos;
    totalQuestoes += questoes;
    totalAcertos += acertos;

    const taxaMateria =
      questoes > 0 ? ((acertos / questoes) * 100).toFixed(1) : 0;

    const taxaEl = materia.querySelector(".taxa-valor");
    if (taxaEl) {
      taxaEl.innerText = taxaMateria + "%";
    }

    const meta = 180;
    const porcentagem = Math.min((minutos / meta) * 100, 100);

    const barra = materia.querySelector(".progress-fill");
    if (barra) {
      barra.style.width = porcentagem + "%";
    }

    const minBarra = materia.querySelector(".tempo-progresso");
    if (minBarra) {
        minBarra.innerText = minutos + " min"
    }
  }); 

  const tempoFinal = tempoSalvoHoje + totalMinutos;
  const questoesFinal = questoesSalvasHoje + totalQuestoes;
  const acertosFinal = acertosSalvosHoje + totalAcertos;

  const taxaFinal =
    questoesFinal > 0 ? ((acertosFinal / questoesFinal) * 100).toFixed(1) : 0;

  document.getElementById("tempoTotal").innerText = tempoFinal;
  document.getElementById("questoesTotal").innerText = questoesFinal;
  document.getElementById("taxaAcerto").innerText = taxaFinal + "%";

  atualizarStatusDia(tempoFinal, taxaFinal);

  if (typeof dadosComparacao !== "undefined" && dadosComparacao) {
    atualizarResumoVsOntem(
      {
        tempo: tempoFinal,
        questoes: questoesFinal,
        taxa: Number(taxaFinal),
      },
      dadosComparacao.yesterday,
    );
  }
}

function atualizarStatusDia(minutos, taxa) {

    const status = document.getElementById("statusDia");
    const dayStatus = document.querySelector(".day-status");
    const statusIcon = document.querySelector(".day-status i");

    if (minutos === 0) {
        status.innerText = "Dia neutro";
        dayStatus.style.backgroundColor = "#A1A1AA15";
        status.style.color = "#A1A1AA";
        dayStatus.style.borderColor = "#A1A1AA";
        statusIcon.style.color = "#A1A1AA";
    }
    else if (taxa >= 75) {
        status.innerText = "Dia excelente";
        dayStatus.style.backgroundColor = "#0A1819";
        status.style.color = "#10B981";
        dayStatus.style.borderColor = "#10B981";
        statusIcon.style.color = "#10B981";
    }
    else if (taxa >= 50) {
        status.innerText = "Dia bom";
        dayStatus.style.backgroundColor = "#19160a";
        status.style.color = "#e1dd55";
        dayStatus.style.borderColor = "#e1dd55";
        statusIcon.style.color = "#e1dd55";
    }
    else {
        status.innerText = "Dia difícil";
        dayStatus.style.backgroundColor = "#190d0a";
        status.style.color = "#e04237";
        dayStatus.style.borderColor = "#e04237";
        statusIcon.style.color = "#e04237";
    }
}

async function salvarSessao(materia) {

  const subjectId = materia.dataset.subjectId;
  const minutos = Number(materia.querySelector(".minutos-input").value) || 0;
  const questoes = Number(materia.querySelector(".questoes-input").value) || 0;
  const acertos = Number(materia.querySelector(".acertos-input").value) || 0;

  if (minutos === 0 && questoes === 0) {
    alert("Preencha pelo menos minutos ou questões.");
    return;
  }

  try {

    const token = localStorage.getItem("token");

    const response = await fetch(`${APP_CONFIG.API_URL}/study-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        subject_id: subjectId,
        tempo: minutos,
        questoes: questoes,
        acertos: acertos
      })
    });

    const data = await response.json();

    materia.querySelector(".minutos-input").value = "";
    materia.querySelector(".questoes-input").value = "";
    materia.querySelector(".acertos-input").value = "";

    const taxaEl = materia.querySelector(".taxa-valor");
    if (taxaEl) taxaEl.innerText = "0%";

    const barra = materia.querySelector(".progress-fill");
    if (barra) barra.style.width = "0%";

    //TA CERTO ISSO?????
    if (typeof carregarDashboard === "function") {
      await carregarDashboard();
    }

  } catch (err) {
    console.error("Erro ao salvar sessão:", err);
  }
}

async function atualizarResumoDoServidor() {

    const token = localStorage.getItem("token");

    const response = await fetch(`${APP_CONFIG.API_URL}/daily/today`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await response.json();

    tempoSalvoHoje = Number(data.tempo_total) || 0;
    questoesSalvasHoje = Number(data.questoes_total) || 0;
    taxaSalvaHoje = Number(data.taxa_acerto) || 0;

    acertosSalvosHoje = Math.round(
        (taxaSalvaHoje / 100) * questoesSalvasHoje
    );

    document.querySelector("#tempoTotal").innerText = tempoSalvoHoje;
    document.querySelector("#questoesTotal").innerText = questoesSalvasHoje;
    document.querySelector("#taxaAcerto").innerText = taxaSalvaHoje + "%";

    atualizarStatusDia(tempoSalvoHoje, taxaSalvaHoje);

    await carregarComparacoes();
}

document.addEventListener("click", (event) => {

    if (event.target.classList.contains("btn-registrar")) {      
        const materia = event.target.closest(".materia-card");
        salvarSessao(materia);
    }
});

document.addEventListener("input", (event) => {

    const materia = event.target.closest(".materia-card");

    if (!materia) return;

    if (
        event.target.classList.contains("minutos-input") ||
        event.target.classList.contains("questoes-input") ||
        event.target.classList.contains("acertos-input")
    ) {
        atualizarResumoCompleto();
    }
});

async function carregarComparacoes() {

    const token = localStorage.getItem("token");

    const response = await fetch(`${APP_CONFIG.API_URL}/daily/comparison`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    const data = await response.json();

    dadosComparacao = data;

    atualizarResumoVsOntem(data.today, data.yesterday);
}

async function carregarTemposAnteriores() {
    const response = await fetch(`${APP_CONFIG.API_URL}/stats/tempo-anterior`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    });

    const dados = await response.json();
    atualizarCardsMaterias(dados);
}

function atualizarCardsMaterias(dados) {

    dados.forEach(materia => {  
        const card = document.querySelector(
            `.materia-card[data-subject-id="${materia.subject_id}"]`
        );

        if (!card) return;

        const minis = card.querySelectorAll(".progresso-anterior .mini");

        if (minis[0]) minis[0].innerText = materia.ontem + "m";
        if (minis[1]) minis[1].innerText = materia.sete_dias + "m";
        if (minis[2]) minis[2].innerText = materia.trinta_dias + "m";
    });
    
}

function atualizarResumoVsOntem(today, yesterday) {

    const diffTempo = today.tempo - yesterday.tempo;
    const diffQuestoes = today.questoes - yesterday.questoes;
    const diffTaxa = today.taxa - yesterday.taxa;

    const elTempo = document.querySelector("#vsOntemTempo");
    const elQuestoes = document.querySelector("#vsOntemQuestoes");
    const elTaxa = document.querySelector("#vsOntemTaxa")

    if (diffTempo > 0) {
        elTempo.innerText = `+${diffTempo} vs ontem`;
        elTempo.style.color = "#10B981";
    }
    else if (diffTempo < 0) {
        elTempo.innerText = `${diffTempo} vs ontem`;
        elTempo.style.color = "#e04237";
    }
    else {
        elTempo.innerText = `0 vs ontem`;
        elTempo.style.color = "#A1A1AA";
    }

    if (diffQuestoes > 0) {
        elQuestoes.innerText = `+${diffQuestoes} vs ontem`;
        elQuestoes.style.color = "#10B981";
    }
    else if (diffQuestoes < 0) {
        elQuestoes.innerText = `${diffQuestoes} vs ontem`;
        elQuestoes.style.color = "#e04237";
    }
    else {
        elQuestoes.innerText = `0 vs ontem`;
        elQuestoes.style.color = "#A1A1AA";
    }

    if (diffTaxa > 0) {
        elTaxa.innerText = `+${diffTaxa.toFixed(1)}% vs ontem`;
        elTaxa.style.color = "#10B981";
    }
    else if (diffTaxa < 0) {
        elTaxa.innerText = `${diffTaxa.toFixed(1)}% vs ontem`;
        elTaxa.style.color = "#e04237";
    }
    else {
        elTaxa.innerText = `0% vs ontem`;
        elTaxa.style.color = "#A1A1AA";
    }
}

function criarMateriaCard(nomeMateria, id) {
    const container = document.querySelector(".materias")

    const card = document.createElement("div")
    card.classList.add("materia-card")
    card.setAttribute("data-subject-id", id)

    card.innerHTML = `
        <div class="card-header">
    <div class="materia-title">
        <div class="linha"></div>
        <h4>${nomeMateria}</h4>
    </div>

    <div class="card-actions">
        <button class="delete-btn" data-id="${id}">
            <i class="fa-solid fa-trash"></i>
        </button>
    </div>
</div>

        <div class="card-info">
            <div class="info">
                <p>Minutos</p>
                <input type="number" class="minutos-input" placeholder="0">
            </div>
            <div class="info">
                <p>Questões</p>
                <input type="number" class="questoes-input" placeholder="0">
            </div>
            <div class="info">
                <p>Acertos</p>
                <input type="number" class="acertos-input" placeholder="0">
            </div>
        </div>

        <div class="progresso-dia">
            <div class="progresso-info">
                <p>Progresso do dia</p>
                <p class="tempo-progresso">0 min</p>
            </div>
            <div class="progresso-bar">
                <div class="progress-bg"></div>
                <div class="progress-fill"></div>
            </div>
        </div>

        <div class="taxa-acerto">
            <p>Taxa de acerto</p>
            <span class="taxa-valor">0.0%</span>
        </div>

        <div class="progresso-anterior">
            <div class="anterior-info">
                <p>Ontem</p>
                <div class="tempo-anterior">
                    <i class="fa-solid fa-minus"></i>
                    <p class="mini">0m</p>
                </div>
            </div>

            <div class="anterior-info">
                <p>7 dias</p>
                <div class="tempo-anterior">
                    <i class="fa-solid fa-minus"></i>
                    <p class="mini">0m</p>
                </div>
            </div>

            <div class="anterior-info">
                <p>30 dias</p>
                <div class="tempo-anterior">
                    <i class="fa-solid fa-minus"></i>
                    <p class="mini">0m</p>
                </div>
            </div>
        </div>

        <div class="registrar-sessao">
            <button class="btn-registrar">Registrar sessão</button>
        </div>
    `

    const addCard = document.querySelector(".add-card");
    container.insertBefore(card, addCard);
}

const modal = document.getElementById("modal-overlay")
const input = document.getElementById("nova-materia-input")

document.getElementById("add-materia").addEventListener("click", () => {
    modal.classList.add("active")
    input.value = ""
    input.focus()
})

document.getElementById("cancelar-materia").addEventListener("click", () => {
    modal.classList.remove("active")
})

document.getElementById("criar-materia").addEventListener("click", async () => {

    const nome = input.value.trim();

    if (!nome) {
        alert("Digite um nome válido.");
        return;
    }

    const materiasExistentes = document.querySelectorAll(".materia-card h4");

    for (let materia of materiasExistentes) {
        if (materia.textContent.toLowerCase() === nome.toLowerCase()) {
            alert("Essa matéria já existe.");
            return;
        }
    }

    const token = localStorage.getItem("token");

    const response = await fetch(`${APP_CONFIG.API_URL}/subjects`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ nome })
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
        alert(data.error || "Erro ao criar matéria");
        return;
    }

    // 🔥 ATUALIZA DO SERVIDOR
    document.querySelectorAll(".materia-card").forEach(card => card.remove());

    await carregarMaterias();
    await carregarDashboard();

    modal.classList.remove("active");
});

const deleteModal = document.getElementById("deleteModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

document.addEventListener("click", (e) => {

    const deleteBtn = e.target.closest(".delete-btn");
    if (!deleteBtn) return;

    subjectToDelete = deleteBtn.dataset.id;
    cardToDelete = deleteBtn.closest(".materia-card");

    deleteModal.classList.add("active");
});

confirmBtn.addEventListener("click", async () => {
  if (!subjectToDelete) return;

  try {
    const response = await fetch(
      `${APP_CONFIG.API_URL}/subjects/${subjectToDelete}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || "Erro ao deletar");
    }

    document.querySelectorAll(".materia-card").forEach(card => card.remove());

    await carregarMaterias();
    await carregarDashboard();

    deleteModal.classList.remove("active");
    subjectToDelete = null;
    cardToDelete = null;

  } catch (err) {
    console.error(err);
    alert("Erro ao excluir matéria.");
  }
});

cancelBtn.addEventListener("click", () => {
    deleteModal.classList.remove("active");
    subjectToDelete = null;
    cardToDelete = null;
});