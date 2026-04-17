document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. CARGA DE KPIs (Datos Simulados)
    // ==========================================
    document.getElementById("kpi-criticas").innerText = "3";
    document.getElementById("kpi-altas").innerText = "8";
    document.getElementById("kpi-proceso").innerText = "5";
    document.getElementById("kpi-mttr").innerText = "45m";

    // ==========================================
    // 2. GRÁFICOS (Chart.js)
    // ==========================================
    
    // Gráfico: Tipos de Amenaza (Dona)
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

    // Gráfico: Activos Afectados (Barras)
    const ctxAssets = document.getElementById('assetsChart').getContext('2d');
    new Chart(ctxAssets, {
        type: 'bar',
        data: {
            labels: ['Servidor Web', 'Endpoint Usuario', 'Firewall', 'BD Main'],
            datasets: [{
                label: 'Número de Alertas',
                data: [8, 15, 4, 2],
                backgroundColor: '#9f2241' // Tu color institucional
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });

    // ==========================================
    // 3. POBLAR TABLA DE ALERTAS (Mock Data)
    // ==========================================
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

    // ==========================================
    // 4. LÓGICA DEL MODAL DE REGISTRO MANUAL (PGAC)
    // ==========================================
    
    const selectImpacto = document.getElementById('alertaImpacto');
    const selectProbabilidad = document.getElementById('alertaProbabilidad');
    const badgeSeveridad = document.getElementById('resultadoSeveridad');
    const textSLA = document.getElementById('resultadoSLA');
    const btnGuardarAlerta = document.getElementById('btnGuardarAlerta');

    // Función para calcular la matriz de severidad [cite: 27, 28]
    function calcularSeveridad() {
        const impacto = selectImpacto.value;
        const probabilidad = selectProbabilidad.value;

        if (!impacto || !probabilidad) return;

        let severidad = "Pendiente";
        let claseSLA = "bg-secondary";
        let tiempoSLA = "";

        // Matriz basada en el PGAC [cite: 28]
        if (impacto === "Alto" && probabilidad === "Alta") {
            severidad = "Crítica";
            claseSLA = "bg-danger";
            tiempoSLA = "SLA: < 1 hora (Impacto grave, interrupción total) [cite: 10]";
        } else if (impacto === "Alto" && probabilidad === "Media") {
            severidad = "Alta";
            claseSLA = "bg-warning text-dark"; 
            tiempoSLA = "SLA: < 4 horas (Afectación significativa) [cite: 10]";
        } else if (impacto === "Medio" && probabilidad === "Media") {
            severidad = "Media";
            claseSLA = "bg-warning text-dark"; 
            tiempoSLA = "SLA: < 24 horas (Impacto moderado) [cite: 10]";
        } else if (impacto === "Bajo" && probabilidad === "Baja") {
            severidad = "Baja";
            claseSLA = "bg-secondary";
            tiempoSLA = "SLA: < 72 horas (Impacto menor) [cite: 10]";
        } else {
            // Fallback genérico para combinaciones no especificadas en el resumen [cite: 28]
            severidad = "Media"; 
            claseSLA = "bg-warning text-dark";
            tiempoSLA = "SLA: < 24 horas (Revisión manual requerida) [cite: 10]";
        }

        // Actualizar la interfaz del Modal
        badgeSeveridad.className = `badge fs-6 ${claseSLA}`;
        badgeSeveridad.innerText = severidad;
        textSLA.innerText = tiempoSLA;
    }

    // Escuchar cambios en los selectores de Impacto y Probabilidad
    if (selectImpacto && selectProbabilidad) {
        selectImpacto.addEventListener('change', calcularSeveridad);
        selectProbabilidad.addEventListener('change', calcularSeveridad);
    }

    // Simular el guardado de la nueva alerta
    if (btnGuardarAlerta) {
        btnGuardarAlerta.addEventListener('click', () => {
            const severidadFinal = badgeSeveridad.innerText;
            
            if (severidadFinal === "Pendiente") {
                alert("Por favor, seleccione el Impacto y la Probabilidad para calcular la Severidad.");
                return;
            }
            
            // Aquí en un futuro enviarías los datos por fetch/AJAX a tu backend Node.js
            alert(`¡Alerta registrada con éxito en el sistema!\n\nSeveridad calculada: ${severidadFinal}\nTiempo de respuesta esperado: ${textSLA.innerText}`);
            
            // Cerrar el modal y reiniciar el formulario
            const modalElement = document.getElementById('modalRegistroAlerta');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
            
            document.getElementById('formNuevaAlerta').reset();
            badgeSeveridad.className = "badge bg-secondary fs-6";
            badgeSeveridad.innerText = "Pendiente";
            textSLA.innerText = "Seleccione Impacto y Probabilidad para calcular el SLA.";
        });
    }

});
