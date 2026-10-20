
// Datos que se muestran en la tabla para cada metodología y característica.
const methodologyData = {
    Scrum: {
        "Enfoque": "Trabajo iterativo e incremental, organizado en sprints.",
        "Planificación": "Backlog priorizado y planificación adaptativa al inicio de cada sprint.",
        "Flexibilidad": "Alta; el equipo puede ajustar prioridades entre sprints.",
        "Roles": "Product Owner, Scrum Master y Developers.",
        "Métricas": "Velocidad, burndown, objetivos del sprint y valor entregado.",
        "Ventajas": "Entregas frecuentes, feedback continuo y buena visibilidad del avance.",
        "Limitaciones": "Requiere colaboración constante, disciplina y disponibilidad de las personas involucradas."
    },
    Kanban: {
        "Enfoque": "Flujo continuo de trabajo visualizado en un tablero.",
        "Planificación": "Priorización continua según la demanda y la capacidad del equipo.",
        "Flexibilidad": "Muy alta; permite ajustar el orden del trabajo de forma continua.",
        "Roles": "No prescribe roles específicos; se adapta a la organización existente.",
        "Métricas": "Lead time, cycle time, rendimiento y trabajo en curso.",
        "Ventajas": "Mejora la visibilidad, ayuda a detectar bloqueos y facilita la priorización.",
        "Limitaciones": "Sin políticas claras ni gestión del flujo, puede dificultar la previsión de entregas."
    },
    Cascada: {
        "Enfoque": "Proceso secuencial con fases definidas que suelen completarse en orden.",
        "Planificación": "Detallada desde el inicio, con requisitos, etapas e hitos planificados.",
        "Flexibilidad": "Baja; modificar fases avanzadas puede generar retrabajo.",
        "Roles": "Responsabilidades distribuidas según las fases y especialidades del proyecto.",
        "Métricas": "Cumplimiento de hitos, presupuesto, calendario, alcance y defectos.",
        "Ventajas": "Estructura clara, documentación detallada y seguimiento por etapas.",
        "Limitaciones": "El feedback del producto llega más tarde y los cambios pueden ser costosos."
    },
    XP: {
        "Enfoque": "Desarrollo ágil centrado en calidad técnica, colaboración y ciclos cortos.",
        "Planificación": "Historias de usuario, planificación frecuente y entregas pequeñas.",
        "Flexibilidad": "Alta; prioriza la adaptación y la retroalimentación frecuente.",
        "Roles": "Cliente o representante disponible, desarrolladores y equipo de apoyo.",
        "Métricas": "Velocidad, pruebas automatizadas, defectos y calidad del código.",
        "Ventajas": "Feedback temprano, integración frecuente y foco en la calidad técnica.",
        "Limitaciones": "Exige comunicación frecuente y compromiso con prácticas técnicas sostenidas."
    },
    "Modelo en V": {
        "Enfoque": "Modelo secuencial que vincula las etapas de desarrollo con niveles de prueba correspondientes.",
        "Planificación": "Las actividades de prueba se definen desde las primeras etapas y se relacionan con los requisitos y diseños.",
        "Flexibilidad": "Baja a media; los cambios pueden requerir revisar documentación y pruebas asociadas.",
        "Roles": "Analistas, diseñadores, desarrolladores y responsables de pruebas colaboran durante el ciclo.",
        "Métricas": "Trazabilidad de requisitos, cobertura de pruebas, defectos detectados y resultados de validación.",
        "Ventajas": "Relaciona desarrollo y pruebas, facilita la trazabilidad y anticipa la planificación de calidad.",
        "Limitaciones": "Puede ser poco flexible cuando los requisitos cambian con frecuencia y entrega el producto completo más tarde."
    },
    Incremental: {
        "Enfoque": "El producto se construye y entrega en incrementos que agregan funcionalidades.",
        "Planificación": "Se priorizan funcionalidades por entrega; cada incremento se desarrolla, verifica e integra.",
        "Flexibilidad": "Media a alta; las prioridades de incrementos posteriores pueden ajustarse según el feedback.",
        "Roles": "Equipo multidisciplinario y usuarios o interesados que revisan los incrementos.",
        "Métricas": "Funcionalidades aceptadas, avance por incremento, defectos e integración.",
        "Ventajas": "Permite entregar valor antes, recibir feedback y reducir el riesgo de esperar hasta el final.",
        "Limitaciones": "Necesita una arquitectura adecuada, integración controlada y buen manejo del alcance."
    }
};

// Orden en el que aparecen las características en las filas de la tabla.
const featureOrder = ["Enfoque", "Planificación", "Flexibilidad", "Roles", "Métricas", "Ventajas", "Limitaciones"];
// Obtiene los checkbox de las tarjetas y las referencias a los elementos de la interfaz.
const checks = [...document.querySelectorAll(".method-check")];
const section = document.getElementById("comparison-section");
const legend = document.getElementById("selected-legend");
const count = document.getElementById("selection-count");
const compareButton = document.getElementById("compare-button");
const clearButton = document.getElementById("clear-button");

// Devuelve los valores de los checkbox que están marcados.
function selectedMethods() {
    return checks.filter((check) => check.checked).map((check) => check.value);
}

// Actualiza el contador y las etiquetas que resumen las metodologías seleccionadas.
function updateLegend() {
    const methods = selectedMethods();
    count.textContent = `${methods.length} ${methods.length === 1 ? "seleccionada" : "seleccionadas"}`;
    // Limpia las etiquetas anteriores antes de crear el resumen actualizado.
    legend.replaceChildren();

    if (methods.length === 0) {
        const empty = document.createElement("span");
        empty.className = "selection-empty";
        empty.textContent = "Todavía no seleccionaste opciones.";
        legend.appendChild(empty);
        return;
    }

    methods.forEach((method) => {
        const pill = document.createElement("span");
        pill.className = "selected-pill";
        pill.textContent = method === "XP" ? "XP (Extreme Programming)" : method;
        legend.appendChild(pill);
    });
}

// Construye los encabezados y las filas de la tabla según las opciones seleccionadas.
function renderComparison() {
    const methods = selectedMethods();
    const head = document.getElementById("comparison-head");
    const body = document.getElementById("comparison-body");
    head.replaceChildren();
    body.replaceChildren();

    // La comparación requiere al menos dos opciones; si no, se oculta la sección.
    if (methods.length < 2) {
        section.classList.add("d-none");
        return;
    }

    const headRow = document.createElement("tr");
    const corner = document.createElement("th");
    corner.scope = "col";
    corner.textContent = "Característica";
    headRow.appendChild(corner);

    methods.forEach((method) => {
        const heading = document.createElement("th");
        heading.scope = "col";
        heading.textContent = method === "XP" ? "XP (Extreme Programming)" : method === "Incremental" ? "Modelo incremental" : method;
        headRow.appendChild(heading);
    });
    head.appendChild(headRow);

    featureOrder.forEach((feature) => {
        const row = document.createElement("tr");
        const featureCell = document.createElement("td");
        featureCell.textContent = feature;
        row.appendChild(featureCell);

        methods.forEach((method) => {
            const cell = document.createElement("td");
            // Busca la descripción correspondiente a la metodología y característica actuales.
            cell.textContent = methodologyData[method][feature];
            cell.dataset.method = method === "XP" ? "XP (Extreme Programming)" : method === "Incremental" ? "Modelo incremental" : method;
            row.appendChild(cell);
        });
        body.appendChild(row);
    });

    section.classList.remove("d-none");
}

// Mantiene sincronizados el resumen de selección y la tabla comparativa.
function refreshInterface() {
    updateLegend();
    renderComparison();
}

// Valida la selección y guarda sus valores en el almacenamiento local del navegador.
function persistSelection() {
    const methods = selectedMethods();

    if (methods.length < 2) {
        setStatus("Seleccioná al menos dos opciones para comparar y guardar la selección.", "error");
        return;
    }

    try {
        // localStorage guarda texto, por eso el array se convierte a JSON.
        window.localStorage.setItem(storageKey, JSON.stringify(methods));
        setStatus("Comparación actualizada y selección guardada en este navegador.", "success");
    } catch {
        setStatus("La comparación está actualizada, pero el navegador no permitió guardar la selección.", "error");
    }
}

// Desmarca todas las opciones, actualiza la interfaz y elimina la selección guardada.
function clearSelection() {
    // Escucha los cambios de cada checkbox para actualizar la interfaz automáticamente.
checks.forEach((check) => { check.checked = false; });
    refreshInterface();

    try {
        // Elimina solo la selección asociada a la clave de este comparador.
        window.localStorage.removeItem(storageKey);
        setStatus("Se limpió la selección y se eliminó la comparación guardada.");
    } catch {
        setStatus("Se limpió la selección actual, pero no se pudo borrar el dato guardado.", "error");
    }
}

// Recupera la selección guardada, comprueba que sea válida y marca los checkbox correspondientes.
function loadSavedSelection() {
    try {
        // Lee el texto guardado y lo convierte nuevamente en un valor de JavaScript.
        const savedMethods = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
        const validMethods = Array.isArray(savedMethods) ? savedMethods.filter((method) => allowedMethods.includes(method)) : [];
        checks.forEach((check) => {
            check.checked = validMethods.includes(check.value);
        });
        refreshInterface();

        if (validMethods.length >= 2) {
            setStatus("Se recuperó la última selección guardada en este navegador.", "success");
        }
    } catch {
        refreshInterface();
        setStatus("No se pudo recuperar la selección guardada. Podés seguir usando el comparador.", "error");
    }
}

checks.forEach((check) => {
    check.addEventListener("change", () => {
        refreshInterface();
        const total = selectedMethods().length;
        if (total < 2) {
            setStatus(total === 1 ? "Seleccioná una opción más para ver la comparación." : "Seleccioná al menos dos opciones para comparar.");
        } else {
            setStatus("La tabla se actualizó con tu selección actual.", "success");
        }
    });
});

// Conecta los botones con las funciones de guardar y limpiar.
compareButton.addEventListener("click", persistSelection);
clearButton.addEventListener("click", clearSelection);