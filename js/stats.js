let chartTempo;
let chartTaxa;

async function carregarDashboard() {
  const response = await fetch(`${APP_CONFIG.API_URL}/dashboard`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  });

  const data = await response.json();

  processarDados(data.stats30dias);
  atualizarStreak(data.streak);
}

function processarDados(rows) {

  const dias = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dias.push(d.toISOString().split("T")[0]);
  }

  const materias = {};
  const mapaTaxa = {};
  let totalTempo = 0;
  let totalQuestoes = 0;
  let totalAcertos = 0;

  rows.forEach(row => {

    const dia = row.dia.split("T")[0];

    if (!materias[row.subject_id]) {
      materias[row.subject_id] = {
        nome: row.subject_name,
        dados: {}
      };
    }

    materias[row.subject_id].dados[dia] = row.tempo_total;

    totalTempo += Number(row.tempo_total);
    totalQuestoes += Number(row.total_questoes);
    totalAcertos += Number(row.total_acertos);

    const taxa = row.total_questoes > 0
      ? (row.total_acertos / row.total_questoes) * 100
      : 0;

    mapaTaxa[dia] = taxa;
  });

  atualizarResumo(totalTempo, totalQuestoes, totalAcertos);

  criarGraficoTempo(dias, materias);
  criarGraficoTaxa(dias, mapaTaxa);
}

function atualizarResumo(tempo, questoes, acertos) {
  document.querySelector("#tempoAtual").textContent = tempo;
  document.querySelector("#questoesAtual").textContent = questoes;

  const taxa = questoes > 0
    ? ((acertos / questoes) * 100).toFixed(1)
    : 0;

  document.querySelector("#taxaMediaAtual").textContent = taxa + "%";
}

function atualizarStreak(valor) {
  document.querySelector("#streakAtual").textContent = valor;
}

function criarGraficoTempo(dias, materias) {

  const datasets = Object.values(materias).map(materia => ({
    label: materia.nome,
    data: dias.map(d => materia.dados[d] || 0),
    tension: 0.3
  }));

  const labels = dias.map(d =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    })
  );

  const ctx = document.getElementById("grafico").getContext("2d");

  if (chartTempo) chartTempo.destroy();

  chartTempo = new Chart(ctx, {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function criarGraficoTaxa(dias, mapaTaxa) {

  const labels = dias.map(d =>
    new Date(d).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    })
  );

  const data = dias.map(d => mapaTaxa[d] || 0);

  const ctx = document.getElementById("graficoTaxa").getContext("2d");

  if (chartTaxa) chartTaxa.destroy();

  chartTaxa = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Taxa de Acerto (%)",
          data,
          tension: 0.3,
        },
      ],
    },
    options: {
      borderColor: "#8B5CF6",
      responsive: true,
      scales: { y: { min: 0, max: 100 } },
      fill: true,
      backgroundColor: "#8b5cf670"
    },
  });
}

async function rankingMaterias() {
  const response = await fetch(`${APP_CONFIG.API_URL}/subjects/ranking`, {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  });

  if (!response.ok) {
    console.error("Erro ao buscar ranking");
    return;
  }

  const rows = await response.json();
  console.log(rows);

  if (!rows || rows.length === 0) {
    document.querySelector("#areaMenosEstudada").textContent = "Sem dados";
    return;
  }

  const menosEstudada = rows[rows.length - 1];

  document.querySelector("#areaMenosEstudada").textContent =
    menosEstudada.name || menosEstudada.subject_name || "Sem dados";
}

carregarDashboard();
rankingMaterias()