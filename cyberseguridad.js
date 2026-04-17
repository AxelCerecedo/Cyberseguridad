document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Cargar KPIs (Simulados)
    document.getElementById("kpi-criticas").innerText = "3";
    document.getElementById("kpi-altas").innerText = "8";
    document.getElementById("kpi-proceso").innerText = "5";
    document.getElementById("kpi-mttr").innerText = "45m";

    // 2. Gráfico: Tipos de Amenaza (Dona)
    const ctxThreat = document.getElementById('threatTypeChart').getContext('2d');
    new Chart(ctxThreat, {
        type: 'doughnut',
        data: {
            labels: ['Malware', 'Phishing', 'Intrusión', 'Vulnerabilidad'],
            datasets: [{
                data: [12, 19, 3, 5],
                backgroundColor: ['#dc3545', '#ffc107', '#0d6efd', '#6c757d']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // 3. Gráfico: Activos Afectados (Barras)
    const ctxAssets = document.getElementById('assetsChart').getContext('2d');
    new Chart(ctxAssets, {
        type: 'bar',
        data: {
            labels: ['Servidor Web', 'Endpoint Usuario', 'Firewall', 'BD Main'],
            datasets: [{
                label: 'Número de Alertas',
                data: [8, 15, 4, 2],
                backgroundColor: '#9f2241'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });

    // 4. Poblar Tabla de Alertas
    const alertasMock = [
        { id: "CVE-2026-001", tipo: "Malware", activo: "Servidor Web", severidad: "Crítica", estado: "Contención" },
        { id: "ALERTA-042", tipo: "Phishing", activo: "Endpoint (User12)", severidad: "Media", estado: "Análisis" },
        { id: "CVE-2026-089", tipo: "Intrusión", activo: "Firewall", severidad: "Alta", estado: "Contención" }
    ];

    const tbody = document.getElementById("alertsTableBody");
    
    alertasMock.forEach(alerta => {
        // Asignar clases CSS según severidad y estado
        let sevClass = alerta.severidad === "Crítica" ? "badge-critica" : 
                       alerta.severidad === "Alta" ? "badge-alta" : "badge-media";
                       
        let statClass = alerta.estado === "Contención" ? "status-contencion" : "status-analisis";

        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="fw-bold">${alerta.id}</td>
            <td>${alerta.tipo}</td>
            <td>${alerta.activo}</td>
            <td><span class="badge ${sevClass}">${alerta.severidad}</span></td>
            <td><span class="badge rounded-pill ${statClass}">${alerta.estado}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary">Gestionar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
});
