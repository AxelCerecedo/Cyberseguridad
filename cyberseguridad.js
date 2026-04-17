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
            labels: ['Malware', 'Phishing', 'Intrusión', 'Fuga de información', 'Vulnerabilidad'],
            datasets: [{
                data: [12, 19, 3, 2, 5],
                backgroundColor: ['#dc3545', '#fd7e14', '#0d6efd', '#6f42c1', '#6c757d']
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
            labels: ['Servidor', 'Endpoint', 'Aplicación', 'Red', 'Librerías', 'Módulos', 'Servicios'],
            datasets: [{
                label: 'Número de Alertas',
                data: [8, 15, 6, 4, 2, 3, 5],
                backgroundColor: '#7c1225' // Color institucional
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
        { id: "CVE-2026-001", tipo: "Malware", activo: "Servidor", severidad: "Crítica", estado: "Contención" },
        { id: "ALERTA-042", tipo: "Phishing", activo: "Endpoint", severidad: "Media", estado: "Análisis" },
        { id: "CVE-2026-089", tipo: "Intrusión", activo: "Red", severidad: "Alta", estado: "Contención" }
    ];

    const tbody = document.getElementById("alertsTableBody");
    
    alertasMock.forEach(alerta => {
        // Asignar clases CSS según severidad y estado
        let sevClass = alerta.severidad === "Crítica" ? "badge-critica" : 
                       alerta.severidad === "Alta" ? "badge-alta" : 
                       alerta.severidad === "Media" ? "badge-media" : "badge-baja";
                       
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
    
    const selectSeveridad = document.getElementById('alertaSeveridad');
    const textSLA = document.getElementById('resultadoSLA');
    const btnGuardarAlerta = document.getElementById('btnGuardarAlerta');

    // Mostrar el SLA correspondiente al seleccionar la severidad manualmente [cite: 10]
    if (selectSeveridad) {
        selectSeveridad.addEventListener('change', (e) => {
            const severidad = e.target.value;
            let sla = "Pendiente";
            let colorClase = "text-muted";

            if (severidad === "Crítica") {
                sla = "< 1 hora [cite: 10]";
                colorClase = "text-danger";
            } else if (severidad === "Alta") {
                sla = "< 4 horas [cite: 10]";
                colorClase = "text-warning"; 
            } else if (severidad === "Media") {
                sla = "< 24 horas [cite: 10]";
                colorClase = "text-primary";
            } else if (severidad === "Baja") {
                sla = "< 72 horas [cite: 10]";
                colorClase = "text-secondary";
            }

            textSLA.innerText = sla;
            textSLA.className = `${colorClase} fw-bold`;
        });
    }

    // Simular el guardado de la nueva alerta
    if (btnGuardarAlerta) {
        btnGuardarAlerta.addEventListener('click', () => {
            const severidadFinal = selectSeveridad.value;
            
            if (!severidadFinal) {
                alert("Por favor, seleccione el Nivel de Severidad de la alerta.");
                return;
            }
            
            // Aquí en un futuro enviarías los datos por fetch/AJAX a tu backend Node.js
            alert(`¡Alerta registrada con éxito en el sistema!\n\nSeveridad seleccionada: ${severidadFinal}\nTiempo de respuesta SLA: ${textSLA.innerText}`);
            
            // Cerrar el modal y reiniciar el formulario
            const modalElement = document.getElementById('modalRegistroAlerta');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
            
            document.getElementById('formNuevaAlerta').reset();
            textSLA.innerText = "Pendiente";
            textSLA.className = "text-danger fw-bold";
        });
    }

});
