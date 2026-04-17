document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // SISTEMA DE ALERTAS ELEGANTES (TOAST)
    // ==========================================
    function mostrarNotificacion(mensaje, tipo = 'success') {
        const toastElement = document.getElementById('liveToast');
        const toastBody = document.getElementById('toastBody');

        // Limpiar colores previos
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-primary');

        // Asignar color según el tipo
        if (tipo === 'success') toastElement.classList.add('bg-success');
        else if (tipo === 'error') toastElement.classList.add('bg-danger');
        else if (tipo === 'warning') toastElement.classList.add('bg-warning', 'text-dark');
        else toastElement.classList.add('bg-primary');

        // Insertar el mensaje (reemplazando \n por <br> para los saltos de línea)
        toastBody.innerHTML = mensaje.replace(/\n/g, '<br>');

        // Mostrar
        const toast = new bootstrap.Toast(toastElement, { delay: 4500 });
        toast.show();
    }

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
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
    });

    const ctxAssets = document.getElementById('assetsChart').getContext('2d');
    new Chart(ctxAssets, {
        type: 'bar',
        data: {
            labels: ['Servidor', 'Endpoint', 'Aplicación', 'Red', 'Librerías', 'Módulos', 'Servicios'],
            datasets: [{
                label: 'Número de Alertas',
                data: [8, 15, 6, 4, 2, 3, 5],
                backgroundColor: '#7c1225'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
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
    // 4. LÓGICA DEL MODAL DE REGISTRO MANUAL
    // ==========================================
    const selectSeveridad = document.getElementById('alertaSeveridad');
    const textSLA = document.getElementById('resultadoSLA');
    const btnGuardarAlerta = document.getElementById('btnGuardarAlerta');

    if (selectSeveridad) {
        selectSeveridad.addEventListener('change', (e) => {
            const severidad = e.target.value;
            let sla = "Pendiente";
            let colorClase = "text-muted";

            if (severidad === "Crítica") { sla = "< 1 hora"; colorClase = "text-danger"; } 
            else if (severidad === "Alta") { sla = "< 4 horas"; colorClase = "text-warning"; } 
            else if (severidad === "Media") { sla = "< 24 horas"; colorClase = "text-primary"; } 
            else if (severidad === "Baja") { sla = "< 72 horas"; colorClase = "text-secondary"; }

            textSLA.innerText = sla;
            textSLA.className = `${colorClase} fw-bold`;
        });
    }

    if (btnGuardarAlerta) {
        btnGuardarAlerta.addEventListener('click', () => {
            const severidadFinal = selectSeveridad.value;
            if (!severidadFinal) {
                mostrarNotificacion("Por favor, seleccione el Nivel de Severidad de la alerta.", "warning");
                return;
            }
            
            mostrarNotificacion(`¡Alerta registrada con éxito!\nSeveridad: ${severidadFinal}\nSLA: ${textSLA.innerText}`, "success");
            
            const modalElement = document.getElementById('modalRegistroAlerta');
            const modalInstance = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
            modalInstance.hide();
            
            document.getElementById('formNuevaAlerta').reset();
            textSLA.innerText = "Pendiente";
            textSLA.className = "text-danger fw-bold";
        });
    }

    // ==========================================
    // 5. LÓGICA DEL MODAL DE GESTIÓN (Evidencias y Estado de SLA)
    // ==========================================
    tbody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-gestionar')) {
            const fila = e.target.closest('tr');
            
            const idAlerta = fila.cells[0].innerText;
            const tipo = fila.cells[1].innerText;
            const activo = fila.cells[2].innerText;
            const severidad = fila.cells[3].innerText;
            const estadoActual = fila.cells[4].innerText; 

            document.getElementById('gestionarIdAlerta').innerText = idAlerta;
            document.getElementById('gestionarTipo').innerText = tipo;
            document.getElementById('gestionarActivo').innerText = activo;
            
            const badgeSev = document.getElementById('gestionarSeveridad');
            badgeSev.innerText = severidad;
            badgeSev.className = fila.cells[3].querySelector('.badge').className;

            const selectEstado = document.getElementById('gestionarEstado');
            for (let option of selectEstado.options) {
                if (option.value === estadoActual) {
                    option.selected = true; break;
                }
            }

            const modalGestionElement = document.getElementById('modalGestionarAlerta');
            const modalGestion = bootstrap.Modal.getInstance(modalGestionElement) || new bootstrap.Modal(modalGestionElement);
            modalGestion.show();
        }
    });

    const btnActualizarAlerta = document.getElementById('btnActualizarAlerta');
    if (btnActualizarAlerta) {
        btnActualizarAlerta.addEventListener('click', () => {
            const idAlerta = document.getElementById('gestionarIdAlerta').innerText;
            const archivos = document.getElementById('gestionarEvidencias').files.length;
            const nuevoEstado = document.getElementById('gestionarEstado').value;
            
            let mensaje = `¡Alerta ${idAlerta} actualizada a: ${nuevoEstado}!`;
            if (archivos > 0) { mensaje += `\n📁 ${archivos} archivo(s) de evidencia adjuntos.`; }
            
            // Lógica de Congelamiento de Reloj (SLA)
            if (nuevoEstado === "Cierre") {
                mensaje += `\n✅ RELOJ DETENIDO: El incidente ha sido cerrado exitosamente.`;
                mostrarNotificacion(mensaje, "success");
                
                // --- NUEVA LÓGICA: BORRAR DE NOTIFICACIONES ---
                const listaNotificaciones = document.querySelector('#modalRecordatorios .list-group');
                const items = listaNotificaciones.querySelectorAll('.list-group-item');
                
                items.forEach(item => {
                    if (item.innerText.includes(idAlerta)) {
                        item.remove(); // Borra la alerta de la lista
                    }
                });

                // Actualizar el número en el globito rojo (Campanita)
                const badgeNotif = document.querySelector('.bi-bell-fill').nextElementSibling;
                const itemsRestantes = document.querySelectorAll('#modalRecordatorios .list-group-item').length;
                
                if (itemsRestantes > 0) {
                    // Actualiza el número de texto sin borrar la clase visually-hidden
                    badgeNotif.childNodes[0].nodeValue = itemsRestantes + " ";
                } else {
                    badgeNotif.style.display = 'none'; // Esconde el globito si llega a 0
                    listaNotificaciones.innerHTML = '<p class="text-center text-muted my-4">No hay recordatorios pendientes de SLA.</p>';
                }

            } else {
                mensaje += `\n⏱️ El reloj del SLA sigue corriendo.`;
                mostrarNotificacion(mensaje, "primary");
            }
            
            const modalElement = document.getElementById('modalGestionarAlerta');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Actualizar la fila en la tabla visualmente
            const filas = document.querySelectorAll('#alertsTableBody tr');
            filas.forEach(fila => {
                if (fila.cells[0].innerText === idAlerta) {
                    const badgeEstado = fila.cells[4].querySelector('.badge');
                    badgeEstado.innerText = nuevoEstado;
                    
                    if (nuevoEstado === "Cierre") {
                        badgeEstado.className = "badge rounded-pill bg-secondary text-white";
                        const btn = fila.cells[5].querySelector('button');
                        btn.innerText = "Finalizado";
                        btn.className = "btn btn-sm btn-outline-secondary disabled";
                        btn.disabled = true;
                    } else {
                        badgeEstado.className = "badge rounded-pill status-contencion";
                    }
                }
            });

            document.getElementById('formGestionarAlerta').reset();
        });
    }

    // ==========================================
    // 6. LÓGICA DEL PANEL DE RECORDATORIOS (Campanita)
    // ==========================================
    const modalRecordatoriosElement = document.getElementById('modalRecordatorios');
    
    if (modalRecordatoriosElement) {
        modalRecordatoriosElement.addEventListener('click', (e) => {
            
            // Clic en "Atender ahora"
            if (e.target.classList.contains('btn-atender-ahora')) {
                const itemLista = e.target.closest('.list-group-item');
                const idAlerta = itemLista.querySelector('h6').innerText.split(' ')[0]; 

                const modalRecordatorios = bootstrap.Modal.getInstance(modalRecordatoriosElement);
                modalRecordatorios.hide();

                // Precargar datos en el Modal de Gestión
                document.getElementById('gestionarIdAlerta').innerText = idAlerta;
                document.getElementById('gestionarTipo').innerText = "Recuperado de Notificación";
                document.getElementById('gestionarActivo').innerText = "Varios";
                document.getElementById('gestionarSeveridad').innerText = "En Revisión";
                document.getElementById('gestionarSeveridad').className = "badge bg-secondary";

                const modalGestion = new bootstrap.Modal(document.getElementById('modalGestionarAlerta'));
                modalGestion.show();
            }

            // Clic en "Configurar Correos"
            if (e.target.classList.contains('btn-config-correos') || e.target.closest('.btn-config-correos')) {
                const modalRecordatorios = bootstrap.Modal.getInstance(modalRecordatoriosElement);
                modalRecordatorios.hide();

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
                mostrarNotificacion("Por favor ingrese al menos un correo válido.", "warning");
                return;
            }
            
            mostrarNotificacion(`Configuración guardada.\nLas notificaciones se enviarán a:\n${correos}`, "success");
            
            const modalCorreos = bootstrap.Modal.getInstance(document.getElementById('modalConfigurarCorreos'));
            modalCorreos.hide();
            
            const modalRecordatorios = new bootstrap.Modal(document.getElementById('modalRecordatorios'));
            modalRecordatorios.show();
        });
    }

});
