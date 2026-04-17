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
                <button class="btn btn-sm btn-outline-primary btn-gestionar">Gestionar</button>
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

    // Mostrar el SLA correspondiente al seleccionar la severidad manualmente
    if (selectSeveridad) {
        selectSeveridad.addEventListener('change', (e) => {
            const severidad = e.target.value;
            let sla = "Pendiente";
            let colorClase = "text-muted";

            if (severidad === "Crítica") {
                sla = "< 1 hora";
                colorClase = "text-danger";
            } else if (severidad === "Alta") {
                sla = "< 4 horas";
                colorClase = "text-warning"; 
            } else if (severidad === "Media") {
                sla = "< 24 horas";
                colorClase = "text-primary";
            } else if (severidad === "Baja") {
                sla = "< 72 horas";
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

    // ==========================================
    // 5. LÓGICA DEL MODAL DE GESTIÓN (Evidencias y Estado)
    // ==========================================

    // Escuchar clics en los botones "Gestionar" de la tabla
    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-gestionar')) {
            const fila = e.target.closest('tr');
            
            // Extraer datos de la fila
            const idAlerta = fila.cells[0].innerText;
            const tipo = fila.cells[1].innerText;
            const activo = fila.cells[2].innerText;
            const severidad = fila.cells[3].innerText;
            const estadoActual = fila.cells[4].innerText; 

            // Pasar datos al Modal
            document.getElementById('gestionarIdAlerta').innerText = idAlerta;
            document.getElementById('gestionarTipo').innerText = tipo;
            document.getElementById('gestionarActivo').innerText = activo;
            
            const badgeSev = document.getElementById('gestionarSeveridad');
            badgeSev.innerText = severidad;
            badgeSev.className = fila.cells[3].querySelector('.badge').className;

            // Seleccionar el estado correcto en el dropdown
            const selectEstado = document.getElementById('gestionarEstado');
            for (let option of selectEstado.options) {
                if (option.value === estadoActual) {
                    option.selected = true;
                    break;
                }
            }

            // Mostrar Modal
            const modalGestionElement = document.getElementById('modalGestionarAlerta');
            const modalGestion = bootstrap.Modal.getInstance(modalGestionElement) || new bootstrap.Modal(modalGestionElement);
            modalGestion.show();
        }
    });

    // Simular el guardado de la gestión de alerta
    const btnActualizarAlerta = document.getElementById('btnActualizarAlerta');
    if (btnActualizarAlerta) {
        btnActualizarAlerta.addEventListener('click', () => {
            const idAlerta = document.getElementById('gestionarIdAlerta').innerText;
            const archivos = document.getElementById('gestionarEvidencias').files.length;
            const nuevoEstado = document.getElementById('gestionarEstado').value;
            
            let mensaje = `¡Alerta ${idAlerta} actualizada a estado: ${nuevoEstado}!`;
            if (archivos > 0) {
                mensaje += `\nSe han adjuntado ${archivos} archivo(s) de evidencia.`;
            }

            alert(mensaje);
            
            // Cerrar el modal
            const modalElement = document.getElementById('modalGestionarAlerta');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Limpiar formulario
            document.getElementById('formGestionarAlerta').reset();
        });
    }

});

// ==========================================
    // 6. LÓGICA DEL PANEL DE RECORDATORIOS (Campanita)
    // ==========================================

    const modalRecordatoriosElement = document.getElementById('modalRecordatorios');
    
    // Escuchar clics dentro del modal de recordatorios
    if (modalRecordatoriosElement) {
        modalRecordatoriosElement.addEventListener('click', (e) => {
            
            // Acción 1: Clic en "Atender ahora"
            if (e.target.classList.contains('btn-outline-danger') || e.target.classList.contains('btn-outline-warning')) {
                // Encontrar el elemento contenedor más cercano para sacar el ID
                const itemLista = e.target.closest('.list-group-item');
                // Sacar el ID de la etiqueta <h6> (ej. "CVE-2026-001")
                const idAlerta = itemLista.querySelector('h6').innerText.split(' ')[0]; 

                // 1. Ocultar el modal de recordatorios
                const modalRecordatorios = bootstrap.Modal.getInstance(modalRecordatoriosElement);
                modalRecordatorios.hide();

                // 2. Inyectar el ID en el modal de Gestión para simular que entramos a esa alerta
                document.getElementById('gestionarIdAlerta').innerText = idAlerta;
                // Nota: En un sistema real aquí harías una consulta para traer los detalles de esa alerta
                document.getElementById('gestionarTipo').innerText = "Recuperado del sistema";
                document.getElementById('gestionarSeveridad').innerText = "En revisión";
                document.getElementById('gestionarSeveridad').className = "badge bg-secondary";

                // 3. Abrir el modal de Gestión de Evidencias
                const modalGestion = new bootstrap.Modal(document.getElementById('modalGestionarAlerta'));
                modalGestion.show();
            }

            // Acción 2: Clic en "Configurar Correos"
            if (e.target.closest('.btn-outline-secondary') && e.target.innerText.includes('Configurar Correos')) {
                // Ocultar recordatorios
                const modalRecordatorios = bootstrap.Modal.getInstance(modalRecordatoriosElement);
                modalRecordatorios.hide();

                // Abrir modal de configuración
                const modalCorreos = new bootstrap.Modal(document.getElementById('modalConfigurarCorreos'));
                modalCorreos.show();
            }
        });
    }

    // Guardar la configuración de correos
    const btnGuardarCorreos = document.getElementById('btnGuardarCorreos');
    if (btnGuardarCorreos) {
        btnGuardarCorreos.addEventListener('click', () => {
            const correos = document.getElementById('correosSLA').value;
            if(!correos) {
                alert("Por favor ingrese al menos un correo válido.");
                return;
            }
            alert(`Configuración guardada.\nLas notificaciones automáticas se enviarán a:\n${correos}`);
            
            // Cerrar el modal actual y regresar a los recordatorios
            const modalCorreos = bootstrap.Modal.getInstance(document.getElementById('modalConfigurarCorreos'));
            modalCorreos.hide();
            
            const modalRecordatorios = new bootstrap.Modal(document.getElementById('modalRecordatorios'));
            modalRecordatorios.show();
        });
    }
