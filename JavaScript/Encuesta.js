// ENCUESTA POR FASES PARA RECOMENDAR UN MODELO DE DESARROLLO.
// Este archivo controla la navegación, guarda las respuestas durante la sesión, calcula
// las puntuaciones y escribe los resultados dentro de los elementos que ya existen en el HTML.
document.addEventListener("DOMContentLoaded", () => {

    // Lista central de modelos. El orden importa: cada array de scores debe usar exactamente
    // este mismo orden para que cada puntuación se asigne al modelo correcto.
    // Si agregás un modelo, también tendrás que agregar sus datos, explicación, consejos e IDs del HTML.
    const models = ["Scrum", "Kanban", "Cascada", "XP", "Modelo en V", "Incremental"];

    // Relaciona el nombre visible del modelo con el sufijo usado en los IDs del HTML.
    // Por ejemplo, "Modelo en V" usa "modelo-v" para formar score-row-modelo-v, score-bar-modelo-v, etc.
    const modelIds = {
        "Scrum": "scrum",
        "Kanban": "kanban",
        "Cascada": "cascada",
        "XP": "xp",
        "Modelo en V": "modelo-v",
        "Incremental": "incremental"
    };

    // Estas listas se construyen buscando elementos que ya están escritos en el HTML.
    // Así el JavaScript puede recorrer fases, preguntas y botones sin crear esas estructuras desde cero.
    const phases = [...document.querySelectorAll(".preguntas-tema")];
    const questionCards = [...document.querySelectorAll(".pregunta-card")];
    const answerButtons = [...document.querySelectorAll(".answer-option")];

    // Referencias a los elementos que cambian cuando la persona avanza por la encuesta:
    // pantallas, contador, barra de progreso, aviso de validación y botones anterior/siguiente.
    const welcomeView = document.getElementById("welcome-view");
    const wizardView = document.getElementById("wizard-view");
    const resultView = document.getElementById("result-view");
    const stepCount = document.getElementById("step-count");
    const progressTrack = document.getElementById("progress-track");
    const progressFill = document.getElementById("progress-fill");
    const validationMessage = document.getElementById("validation-message");
    const previousButton = document.getElementById("previous-button");
    const nextButton = document.getElementById("next-button");

    // Referencias a los espacios del HTML donde se mostrarán la recomendación, su explicación,
    // los consejos específicos y el resumen. textContent se usa después para insertar texto sin interpretarlo como HTML.
    const resultMethod = document.getElementById("result-method");
    const resultScore = document.getElementById("result-score");
    const resultExplanation = document.getElementById("result-explanation");
    const resultRunnerUp = document.getElementById("result-runner-up");
    const resultStrengths = document.getElementById("result-strengths");
    const resultRisks = document.getElementById("result-risks");
    const resultRecommendations = document.getElementById("result-recommendations");
    const answerSummary = document.getElementById("answer-summary-text");

    // Estado que cambia mientras se responde: currentPhase empieza en la primera fase (índice 0)
    // y answers guarda cada elección usando el nombre de la pregunta como clave.
    let currentPhase = 0;
    let answers = {};

    // Peso relativo de cada pregunta. Estos números multiplican los puntos obtenidos; por eso una
    // pregunta con peso 1.3 influye más que otra con peso 1.0. Deben coincidir con los IDs data-question del HTML.
    const weights = {
        clarity: 1.2,
        stability: 1.3,
        productGoal: 1.0,
        constraints: 1.1,
        stakeholders: 1.1,
        team: 1.0,
        workPattern: 1.1,
        delivery: 1.2,
        uncertainty: 1.2,
        architecture: 1.1,
        integration: 1.2,
        criticality: 1.3,
        testing: 1.3,
        governance: 1.2,
        maintenance: 1.0,
        success: 1.1,
        stage: 1.0
    };

    // MATRIZ DE PUNTUACIONES: asigna puntos a cada modelo según la opción elegida.
    // Cada array está ordenado así: Scrum, Kanban, Cascada, XP, Modelo en V, Incremental.
    // Los valores van de 0 a 4 y expresan afinidad estimada, no una probabilidad científica.
    // Al agregar una pregunta, definí una clave para ella aquí y una puntuación para CADA alternativa.
    const scores = {
        clarity: {
            low: [3, 2, 0, 3, 1, 4],
            medium: [3, 3, 2, 3, 2, 4],
            high: [1, 1, 4, 1, 4, 3],
            unclear: [3, 3, 1, 3, 2, 3]
        },

        stability: {
            changing: [3, 4, 0, 4, 0, 4],
            mixed: [4, 3, 2, 4, 2, 4],
            stable: [1, 1, 4, 1, 4, 2],
            volatile: [3, 4, 0, 4, 0, 4]
        },

        productGoal: {
            discovery: [4, 2, 0, 4, 1, 3],
            flow: [2, 4, 1, 3, 1, 2],
            fixed: [1, 1, 4, 1, 4, 2],
            modules: [2, 2, 1, 2, 2, 4]
        },

        constraints: {
            fixedDeadline: [4, 3, 2, 3, 2, 4],
            fixedScope: [2, 2, 4, 2, 4, 3],
            variablePriority: [2, 4, 2, 3, 1, 2],
            strictBaseline: [1, 1, 4, 1, 4, 2]
        },

        stakeholders: {
            daily: [4, 2, 1, 4, 1, 3],
            periodic: [4, 2, 2, 3, 3, 4],
            limited: [2, 3, 3, 2, 4, 3],
            rare: [1, 3, 4, 1, 4, 2]
        },

        team: {
            small: [4, 2, 1, 4, 1, 3],
            medium: [3, 3, 2, 3, 3, 4],
            large: [2, 3, 4, 1, 4, 3],
            distributed: [2, 4, 3, 1, 4, 2]
        },

        workPattern: {
            backlog: [4, 2, 1, 3, 1, 4],
            continuous: [2, 4, 2, 3, 1, 2],
            sequential: [1, 1, 4, 1, 4, 2],
            independent: [3, 2, 1, 3, 2, 4]
        },

        delivery: {
            frequent: [3, 4, 0, 4, 1, 4],
            sprints: [4, 2, 2, 3, 3, 4],
            final: [0, 1, 4, 0, 4, 1],
            milestones: [3, 2, 4, 2, 4, 3]
        },

        uncertainty: {
            high: [4, 3, 0, 4, 1, 3],
            medium: [3, 3, 2, 3, 3, 4],
            low: [1, 2, 4, 2, 4, 3],
            unknown: [3, 3, 1, 3, 2, 3]
        },

        architecture: {
            modular: [2, 2, 1, 2, 2, 4],
            fixed: [1, 1, 4, 1, 4, 2],
            evolving: [3, 2, 1, 4, 2, 3],
            legacy: [2, 4, 2, 3, 2, 3]
        },

        integration: {
            continuous: [3, 4, 0, 4, 1, 4],
            milestones: [3, 2, 3, 2, 4, 3],
            formal: [1, 1, 4, 1, 4, 2],
            modules: [2, 3, 1, 3, 2, 4]
        },

        criticality: {
            regulated: [1, 1, 4, 2, 4, 2],
            highImpact: [2, 2, 3, 2, 4, 3],
            ordinary: [3, 3, 2, 3, 2, 4],
            adaptive: [3, 3, 2, 4, 3, 4]
        },

        testing: {
            automated: [2, 2, 1, 4, 3, 3],
            traceable: [1, 1, 3, 2, 4, 2],
            iterative: [4, 3, 2, 3, 3, 4],
            final: [1, 1, 4, 1, 4, 2]
        },

        governance: {
            high: [1, 1, 4, 1, 4, 2],
            balanced: [3, 3, 3, 3, 3, 4],
            light: [3, 4, 0, 4, 1, 3],
            lean: [3, 3, 1, 3, 2, 3]
        },

        maintenance: {
            incoming: [2, 4, 2, 3, 1, 2],
            roadmap: [4, 2, 2, 2, 3, 4],
            controlled: [1, 1, 4, 2, 4, 2],
            refactoring: [2, 3, 1, 4, 2, 3]
        },

        success: {
            userValue: [4, 2, 1, 3, 2, 4],
            flow: [2, 4, 2, 3, 1, 3],
            compliance: [1, 1, 4, 2, 4, 2],
            quality: [2, 2, 2, 4, 3, 3]
        },

        stage: {
            discovery: [3, 2, 0, 4, 1, 3],
            newDefined: [2, 2, 4, 2, 4, 3],
            existing: [3, 4, 2, 4, 2, 3],
            migration: [1, 1, 4, 2, 4, 2]
        }
    };

    // Texto que explica por qué podría encajar el modelo ganador. Las claves deben coincidir
    // exactamente con los nombres incluidos en models para que se encuentre el texto correcto.
    const explanations = {
        Scrum: "El proyecto puede beneficiarse de objetivos por ciclos, revisiones periódicas y ajustes de prioridades a partir del feedback.",

        Kanban: "El proyecto parece necesitar visibilidad del trabajo, gestión del flujo y capacidad para responder a cambios de prioridad.",

        Cascada: "El proyecto parece beneficiarse de etapas definidas, planificación previa, entregables y criterios formales de aceptación.",

        XP: "El proyecto puede beneficiarse de ciclos cortos, pruebas frecuentes, integración continua y especial atención a la calidad técnica.",

        "Modelo en V": "El proyecto da importancia a la trazabilidad entre requisitos, diseño y pruebas, además de la verificación y validación planificadas.",

        Incremental: "El proyecto puede dividirse en entregas funcionales que se integran y validan progresivamente."
    };

    // Recomendaciones que se muestran según el modelo ganador. Cada objeto debe contener
    // strengths, risks y next porque renderResults() utiliza las tres propiedades.
    const advice = {
        Scrum: {
            strengths: "Organiza el trabajo en objetivos y ciclos definidos, permite revisar resultados y reajustar prioridades entre iteraciones.",
            risks: "Las interrupciones frecuentes durante un sprint dificultan el foco. El equipo también necesita priorización y revisión periódicas.",
            next: "Prepará un backlog inicial, definí objetivos de sprint y acordá reuniones de revisión y retrospectiva."
        },

        Kanban: {
            strengths: "Hace visible el trabajo, permite reorganizar prioridades y ayuda a descubrir bloqueos y excesos de tareas abiertas.",
            risks: "Sin límites de trabajo en curso y políticas claras, el tablero puede convertirse en una lista de tareas sin foco.",
            next: "Creá un tablero con estados claros, limitá las tareas simultáneas y revisá el tiempo de entrega."
        },

        Cascada: {
            strengths: "Facilita planificar etapas, definir entregables y documentar las decisiones y aprobaciones necesarias.",
            risks: "Los cambios importantes después de aprobar los requisitos pueden generar retrabajo y retrasos.",
            next: "Documentá requisitos, entregables, responsables y criterios de aprobación antes de avanzar por las fases."
        },

        XP: {
            strengths: "Prioriza la calidad técnica, las pruebas frecuentes, la integración continua y la retroalimentación temprana.",
            risks: "Necesita disciplina técnica y colaboración sostenida. Sus beneficios disminuyen si se omiten las pruebas o la integración frecuente.",
            next: "Definí criterios de aceptación, incorporá pruebas automatizadas y establecé revisiones de código e integración frecuente."
        },

        "Modelo en V": {
            strengths: "Relaciona las actividades de desarrollo con la verificación y validación, y facilita la trazabilidad entre requisitos y pruebas.",
            risks: "Los cambios en requisitos o diseño pueden obligar a revisar documentación, trazabilidad y pruebas asociadas.",
            next: "Relacioná cada requisito con sus pruebas, definí responsables y planificá la verificación desde el comienzo."
        },

        Incremental: {
            strengths: "Permite entregar funcionalidades por partes, validar cada incremento y ajustar las entregas siguientes.",
            risks: "Necesita una arquitectura que permita integrar las partes y evitar inconsistencias entre incrementos.",
            next: "Dividí el producto en incrementos útiles, definí criterios de aceptación y verificá las integraciones en cada entrega."
        }
    };

    // Cambia de pantalla quitando la clase active de bienvenida, asistente y resultados,
    // y agregándosela únicamente a la pantalla recibida como argumento.
    function showView(view) {
        welcomeView.classList.remove("active");
        wizardView.classList.remove("active");
        resultView.classList.remove("active");
        view.classList.add("active");
    }

    // Sincroniza la fase visible con la variable currentPhase. También actualiza el texto
    // "Fase X de Y", el porcentaje de progreso y qué texto muestra el botón para continuar.
    function updatePhase() {
        phases.forEach((phase, index) => {
            phase.classList.toggle("active", index === currentPhase);
        });

        stepCount.textContent = `Fase ${currentPhase + 1} de ${phases.length}`;

        const progress = ((currentPhase + 1) / phases.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));

        previousButton.classList.toggle("d-none", currentPhase === 0);

        nextButton.innerHTML = currentPhase === phases.length - 1
            ? 'Ver resultados <i class="bi bi-check2-circle"></i>'
            : 'Siguiente fase <i class="bi bi-arrow-right"></i>';

        validationMessage.textContent = "";
    }

    // Guarda el valor seleccionado, por ejemplo answers["clarity"] = "high", y actualiza
    // el estilo y aria-checked para que visualmente y para tecnologías de asistencia quede marcada la opción.
    function selectAnswer(button) {
        const question = button.dataset.question;
        const value = button.dataset.value;

        answers[question] = value;

        // Cada pregunta permite una sola alternativa. Solo se cambian los botones que comparten
        // el mismo data-question; las elecciones de otras preguntas quedan intactas.
        answerButtons.forEach((option) => {
            if (option.dataset.question === question) {
                const selected = option === button;

                option.classList.toggle("selected", selected);
                option.setAttribute("aria-checked", String(selected));
            }
        });

        validationMessage.textContent = "";
    }

    // Revisa solo las tarjetas que pertenecen a la fase actual. Si falta alguna respuesta,
    // muestra un aviso y bloquea el avance; no borra las respuestas que ya se dieron.
    function phaseIsComplete() {
        const questionsInPhase = [
            ...phases[currentPhase].querySelectorAll(".pregunta-card")
        ];

        const missingAnswer = questionsInPhase.some((card) => {
            return !answers[card.dataset.question];
        });

        if (missingAnswer) {
            validationMessage.textContent =
                "Respondé todas las preguntas de esta fase para continuar.";
            return false;
        }

        return true;
    }

    // Calcula un total separado para cada modelo. Los puntos de la opción seleccionada se
    // multiplican por el peso de su pregunta y se suman a lo largo de todas las preguntas contestadas.
    function calculateScores() {
        const totals = models.map(() => 0);
        let maxPoints = 0;

        questionCards.forEach((card) => {
            const question = card.dataset.question;
            const answer = answers[question];
            const points = scores[question]?.[answer];
            const weight = weights[question];

            if (!points || !weight) {
                return;
            }

            // El índice del array señala el modelo correspondiente en models. Se suma puntuación × peso
            // para que cada respuesta contribuya según la importancia que se le asignó.
            points.forEach((value, index) => {
                totals[index] += value * weight;
            });

            // Como la nota más alta de la matriz es 4, el máximo posible aumenta en 4 × peso
            // por cada pregunta válida. Se usa como base para mostrar un porcentaje comparable.
            maxPoints += 4 * weight;
        });

        // Convierte cada total a un porcentaje del máximo teórico y conserva también los puntos brutos.
        // Son índices de afinidad del cuestionario; no tienen que sumar 100 % entre sí.
        const results = models.map((model, index) => ({
            model,
            points: totals[index],
            percentage: Math.round((totals[index] / maxPoints) * 100)
        }));

        // Ordena de mayor a menor puntuación. Si hay empate, mantiene como criterio de desempate
        // el orden original de models para que el resultado sea consistente entre ejecuciones.
        results.sort((a, b) => {
            if (Math.abs(b.points - a.points) < 0.0001) {
                return models.indexOf(a.model) - models.indexOf(b.model);
            }

            return b.points - a.points;
        });

        return { results, maxPoints };
    }

    // Rellena las barras estáticas del HTML con los porcentajes calculados. Para añadir otro modelo,
    // también hay que crear sus elementos score-row, score-track, score-bar y score-value en el HTML.
    function renderScores(results) {
        results.forEach((result, index) => {
            const id = modelIds[result.model];
            const row = document.getElementById(`score-row-${id}`);
            const track = document.getElementById(`score-track-${id}`);
            const bar = document.getElementById(`score-bar-${id}`);
            const value = document.getElementById(`score-value-${id}`);

            bar.style.width = `${result.percentage}%`;
            value.textContent = `${result.percentage}%`;
            track.setAttribute("aria-valuenow", String(result.percentage));

            // La primera fila de results corresponde al modelo más puntuado, así que se resalta esa fila.
            row.classList.toggle("is-leading", index === 0);
        });
    }

    // Compara cada respuesta con el promedio de puntuación de los otros cinco modelos.
    // Las diferencias positivas más grandes se mostrarán como evidencia de la recomendación.
    function renderEvidence(winner) {
        const winnerIndex = models.indexOf(winner);
        const evidence = [];

        questionCards.forEach((card) => {
            const question = card.dataset.question;
            const answer = answers[question];
            const points = scores[question]?.[answer];

            if (!points) {
                return;
            }

            // Se excluye al ganador para obtener una referencia basada únicamente en los otros modelos.
            const otherPoints = points.filter((value, index) => index !== winnerIndex);
            const average = otherPoints.reduce((sum, value) => sum + value, 0)
                / otherPoints.length;

            evidence.push({
                title: card.querySelector("h4").textContent,
                answer: card.querySelector(".answer-option.selected").textContent,
                advantage: (points[winnerIndex] - average) * weights[question]
            });
        });

        // Ordena las evidencias por ventaja ponderada y conserva como máximo las tres más relevantes.
        evidence.sort((a, b) => b.advantage - a.advantage);

        const importantEvidence = evidence
            .filter((item) => item.advantage > 0)
            .slice(0, 3);

        for (let i = 0; i < 3; i++) {
            const item = importantEvidence[i];
            const container = document.getElementById(`evidence-${i + 1}`);
            const title = document.getElementById(`evidence-title-${i + 1}`);
            const answer = document.getElementById(`evidence-answer-${i + 1}`);

            container.hidden = !item;

            if (item) {
                title.textContent = item.title;
                answer.textContent = item.answer;
            }
        }

        // Puede que ninguna respuesta favorezca al ganador por sí sola. En ese caso, se muestra
        // un mensaje alternativo para dejar claro que la recomendación surge del conjunto.
        if (importantEvidence.length === 0) {
            const container = document.getElementById("evidence-1");
            container.hidden = false;
            document.getElementById("evidence-title-1").textContent =
                "Evaluación conjunta del proyecto";
            document.getElementById("evidence-answer-1").textContent =
                "La recomendación surge del balance conjunto de las respuestas, no de un único factor.";
        }
    }

    // Añade alertas específicas al modelo recomendado cuando algunas respuestas plantean tensiones.
    // Estas advertencias complementan los riesgos generales definidos en advice; no cambian la puntuación.
    function contextualRisks(winner) {
        const warnings = [];

        if (
            ["Cascada", "Modelo en V"].includes(winner) &&
            ["changing", "volatile"].includes(answers.stability)
        ) {
            warnings.push(
                "Los requisitos podrían cambiar con frecuencia. Definí cómo se aprobarán y controlarán esos cambios."
            );
        }

        if (
            ["Scrum", "XP"].includes(winner) &&
            ["limited", "rare"].includes(answers.stakeholders)
        ) {
            warnings.push(
                "La baja disponibilidad de usuarios puede retrasar decisiones y validaciones. Acordá quién resolverá las consultas."
            );
        }

        if (
            ["Scrum", "Kanban", "XP"].includes(winner) &&
            answers.governance === "high"
        ) {
            warnings.push(
                "Aunque el enfoque sea adaptable, la documentación, la trazabilidad y las aprobaciones deben definirse explícitamente."
            );
        }

        if (
            ["Cascada", "Modelo en V"].includes(winner) &&
            answers.uncertainty === "high"
        ) {
            warnings.push(
                "Antes de fijar todas las decisiones, reducí la incertidumbre técnica mediante pruebas de viabilidad o prototipos."
            );
        }

        if (winner === "Incremental" && answers.architecture === "fixed") {
            warnings.push(
                "Definí cómo se integrarán las partes del producto para evitar inconsistencias entre incrementos."
            );
        }

        return warnings;
    }

    // Función central del resultado: calcula la clasificación y escribe en el HTML el ganador,
    // la segunda opción, las puntuaciones, evidencias, fortalezas, riesgos y próximos pasos.
    function renderResults() {
        const { results, maxPoints } = calculateScores();
        const winner = results[0];
        const second = results[1];
        const adviceForWinner = advice[winner.model];
        const warnings = contextualRisks(winner.model);

        // Se muestran tanto los puntos ponderados como el porcentaje estimado para que el resultado
        // tenga contexto. El porcentaje se calcula respecto del máximo posible, no respecto a los otros modelos.
        resultMethod.textContent = winner.model;
        resultScore.textContent =
            `${winner.points.toFixed(1)} de ${maxPoints.toFixed(1)} puntos ponderados · Afinidad estimada: ${winner.percentage}%`;

        resultExplanation.textContent = explanations[winner.model];

        // Evita presentar una recomendación como absoluta cuando existe empate o poca distancia
        // entre las primeras opciones. El umbral de 5 puntos porcentuales define qué se considera cercano.
        const tiedModels = results.filter((item) => {
            return Math.abs(item.points - winner.points) < 0.0001;
        });

        if (tiedModels.length > 1) {
            resultRunnerUp.textContent =
                `Existe un empate entre los modelos mejor puntuados: ${tiedModels.map((item) => item.model).join(", ")}. ${winner.model} figura primero por el orden definido, pero conviene revisar los modelos empatados.`;
        } else if (winner.percentage - second.percentage <= 5) {
            resultRunnerUp.textContent =
                `La segunda opción es ${second.model} (${second.percentage}%), con una puntuación muy cercana. Podés comparar ambos modelos antes de decidir.`;
        } else {
            resultRunnerUp.textContent =
                `La segunda opción es ${second.model} (${second.percentage}%). La primera obtuvo una ventaja de ${winner.percentage - second.percentage} puntos porcentuales.`;
        }

        // Inserta los textos elegidos para el modelo ganador. Las advertencias contextuales se agregan
        // al final del apartado de riesgos si alguna condición de contextualRisks() se cumple.
        resultStrengths.textContent = adviceForWinner.strengths;
        resultRisks.textContent = adviceForWinner.risks
            + (warnings.length ? ` ${warnings.join(" ")}` : "");
        resultRecommendations.textContent = adviceForWinner.next;

        renderScores(results);
        renderEvidence(winner.model);

        // Recorre las preguntas en el orden del HTML y reúne el enunciado y la opción elegida
        // en un único texto de resumen.
        answerSummary.textContent = questionCards.map((card) => {
            const question = card.querySelector("h4").textContent;
            const selected = card.querySelector(".answer-option.selected").textContent;

            return `${question} ${selected}`;
        }).join(" ");
    }

    // Al comenzar, muestra el asistente y prepara la fase actual con su contador y progreso.
    document.getElementById("start-button").addEventListener("click", () => {
        showView(wizardView);
        updatePhase();
    });

    // Registra el clic en cada alternativa. La función selectAnswer se encarga de guardar
    // la elección y actualizar el estado visual/ARIA de los botones de esa pregunta.
    answerButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectAnswer(button);
        });
    });

    // Retrocede una fase solo si no se está en la primera. answers no se reinicia, por lo que
    // al volver se conservan las opciones que la persona había marcado.
    previousButton.addEventListener("click", () => {
        if (currentPhase > 0) {
            currentPhase--;
            updatePhase();
        }
    });

    // Primero exige completar la fase actual. Después avanza una fase o, si era la última,
    // calcula y muestra el panel de resultados.
    nextButton.addEventListener("click", () => {
        if (!phaseIsComplete()) {
            return;
        }

        if (currentPhase < phases.length - 1) {
            currentPhase++;
            updatePhase();
        } else {
            renderResults();
            showView(resultView);
        }
    });

    // Borra el estado de las respuestas y vuelve a la bienvenida. También quita la selección
    // visual de todos los botones para que la siguiente evaluación empiece desde cero.
    document.getElementById("restart-button").addEventListener("click", () => {
        answers = {};
        currentPhase = 0;

        answerButtons.forEach((button) => {
            button.classList.remove("selected");
            button.setAttribute("aria-checked", "false");
        });

        updatePhase();
        showView(welcomeView);
    });

    // Inicializa el contador, la barra de progreso y el botón de fase anterior al cargar la página.
    updatePhase();
});