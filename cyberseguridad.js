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
    
    const selectImpacto = document.getElementById('alertaImpacto');
    const selectProbabilidad = document.getElementById('alertaProbabilidad');
    const badgeSeveridad = document.getElementById('resultadoSeveridad');
    const textSLA = document.getElementById('resultadoSLA');
    const btnGuardarAlerta = document.getElementById('btnGuardarAlerta');

    // Función para calcular la matriz de severidad
    function calcularSeveridad() {
        const impacto = selectImpacto.value;
        const probabilidad = selectProbabilidad.value;

        if (!impacto || !probabilidad) {
            badgeSeveridad.className = "badge bg-secondary fs-6";
            badgeSeveridad.innerText = "Pendiente";
            textSLA.innerText = "Seleccione Impacto y Probabilidad para calcular.";
            return;
        }

        let severidad = "No Definida en Matriz";
        let claseSLA = "bg-secondary";
        let tiempoSLA = "Revisar criterios de clasificación.";

        // Matriz basada estrictamente en el PGAC
        if (impacto === "Alto" && probabilidad === "Alta") {
            severidad = "Crítica";
            claseSLA = "bg-danger";
            tiempoSLA = "SLA: < 1 hora (Impacto grave, interrupción total)";
        } 
        else if (impacto === "Alto" && probabilidad === "Media") {
            severidad = "Alta";
            claseSLA = "badge-alta"; // Clase personalizada en tu CSS
            tiempoSLA = "SLA: < 4 horas (Afectación significativa)";
        } 
        else if (impacto === "Medio" && probabilidad === "Media") {
            severidad = "Media";
            claseSLA = "bg-warning text-dark"; 
            tiempoSLA = "SLA: < 24 horas (Impacto moderado)";
        } 
        else if (impacto === "Bajo" && probabilidad === "Baja") {
            severidad = "Baja";
            claseSLA = "badge-baja";
            tiempoSLA = "SLA: < 72 horas (Impacto menor)";
        }
        else {
            // Para combinaciones que no están en la tabla
            severidad = "Requiere Análisis";
            claseSLA = "bg-dark text-white";
            tiempoSLA = "Combinación fuera de matriz estándar. Consulte al CISO.";
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
            
            if (severidadFinal === "Pendiente" || severidadFinal === "Requiere Análisis" || severidadFinal === "No Definida en Matriz") {
                alert("Por favor, seleccione una combinación de Impacto y Probabilidad válida según la matriz del PGAC.");
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
