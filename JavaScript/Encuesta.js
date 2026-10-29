// ENCUESTA POR FASES PARA RECOMENDAR UN MODELO DE DESARROLLO.

document.addEventListener("DOMContentLoaded", () => {
    const models = [
        "Scrum",
        "Kanban",
        "Cascada",
        "XP",
        "Modelo en V",
        "Incremental"
    ];

    const modelIds = {
        "Scrum": "scrum",
        "Kanban": "kanban",
        "Cascada": "cascada",
        "XP": "xp",
        "Modelo en V": "modelo-v",
        "Incremental": "incremental"
    };

    const phases = [...document.querySelectorAll(".preguntas-tema")];
    const questionCards = [...document.querySelectorAll(".pregunta-card")];
    const answerButtons = [...document.querySelectorAll(".answer-option")];

    const welcomeView = document.getElementById("welcome-view");
    const wizardView = document.getElementById("wizard-view");
    const resultView = document.getElementById("result-view");
    const stepCount = document.getElementById("step-count");
    const progressTrack = document.getElementById("progress-track");
    const progressFill = document.getElementById("progress-fill");
    const validationMessage = document.getElementById("validation-message");
    const previousButton = document.getElementById("previous-button");
    const nextButton = document.getElementById("next-button");

    const resultMethod = document.getElementById("result-method");
    const resultScore = document.getElementById("result-score");
    const resultExplanation = document.getElementById("result-explanation");
    const resultRunnerUp = document.getElementById("result-runner-up");
    const resultStrengths = document.getElementById("result-strengths");
    const resultRisks = document.getElementById("result-risks");
    const resultRecommendations = document.getElementById("result-recommendations");
    const answerSummary = document.getElementById("answer-summary-text");

    let currentPhase = 0;
    let answers = {};

    // Cada tema tiene dos preguntas.
    // Cada respuesta tiene una puntuación para cada modelo.
    // El orden de las puntuaciones es:
    // Scrum, Kanban, Cascada, XP, Modelo en V, Incremental.
    // La respuesta 1 favorece al primer modelo, la 2 al segundo, etc.
    // La puntuación principal es 6; las demás reciben entre 5 y 1 puntos.
        const scores = {
        // Tema 1
        requirements: {
            scrum:       [6, 3, 1, 5, 2, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 4],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 4],
            incremental: [4, 5, 3, 4, 3, 6]
        },
        planning: {
            scrum:       [6, 3, 2, 5, 1, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 2, 6]
        },
        // Tema 2
        team: {
            scrum:       [6, 3, 2, 5, 1, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 3, 6]
        },
        workflow: {
            scrum:       [6, 3, 1, 5, 2, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 3, 6]
        },
        // Tema 3
        delivery: {
            scrum:       [6, 3, 1, 5, 2, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 3, 6]
        },
        changes: {
            scrum:       [6, 3, 1, 5, 2, 4],
            kanban:      [4, 6, 2, 3, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 3, 6]
        },
        // Tema 4
        quality: {
            scrum:       [6, 3, 2, 5, 2, 4],
            kanban:      [3, 6, 2, 3, 1, 4],
            cascada:     [2, 2, 6, 1, 5, 3],
            xp:          [4, 3, 1, 6, 3, 5],
            vmodel:      [3, 1, 5, 2, 6, 4],
            incremental: [4, 5, 3, 4, 4, 6]
        },
        documentation: {
            scrum:       [6, 4, 2, 5, 1, 3],
            kanban:      [4, 6, 2, 3, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 3, 2, 6]
        },
        // Tema 5
        maintenance: {
            scrum:       [6, 3, 2, 5, 1, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [4, 3, 1, 6, 2, 5],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 3, 6]
        },
        goals: {
            scrum:       [6, 3, 1, 5, 2, 4],
            kanban:      [3, 6, 2, 4, 1, 5],
            cascada:     [1, 2, 6, 1, 5, 3],
            xp:          [5, 3, 1, 6, 2, 4],
            vmodel:      [2, 1, 5, 2, 6, 3],
            incremental: [4, 5, 3, 4, 3, 6]
        }
    };

    // Recomendaciones generales de cada modelo.
    const explanations = {
        Scrum: "Scrum puede ayudarte a organizar el trabajo en ciclos cortos, revisar avances y adaptar las prioridades con frecuencia.",
        Kanban: "Kanban resulta útil cuando necesitás visualizar las tareas, gestionar el flujo de trabajo y responder a cambios de prioridad.",
        Cascada: "Cascada puede encajar cuando los requisitos están claros desde el inicio y las etapas necesitan una planificación definida.",
        XP: "XP prioriza la calidad técnica mediante pruebas frecuentes, integración continua y colaboración entre quienes desarrollan.",
        "Modelo en V": "El Modelo en V favorece la planificación de pruebas y la trazabilidad entre requisitos, desarrollo y validación.",
        Incremental: "El modelo Incremental permite construir el producto por partes, validar cada entrega y ampliar sus funcionalidades progresivamente."
    };

    const advice = {
        Scrum: {
            strengths: "Facilita la organización por objetivos, la revisión periódica y la adaptación a partir de la opinión de los usuarios.",
            risks: "Requiere coordinación frecuente, objetivos claros para cada sprint y disponibilidad para revisar los avances.",
            next: "Prepará una lista priorizada de funcionalidades y definí objetivos para el primer sprint."
        },
        Kanban: {
            strengths: "Permite visualizar tareas, detectar bloqueos y adaptar las prioridades sin depender de ciclos fijos.",
            risks: "Sin límites de tareas simultáneas, el equipo puede acumular trabajo pendiente.",
            next: "Creá un tablero con estados claros y acordá límites de trabajo en curso."
        },
        Cascada: {
            strengths: "Facilita la planificación de etapas, la documentación y el control de entregables.",
            risks: "Los cambios tardíos pueden generar retrabajo y afectar el cronograma.",
            next: "Documentá los requisitos, las etapas, los responsables y los criterios de aceptación."
        },
        XP: {
            strengths: "Promueve pruebas frecuentes, revisión del código, integración continua y mejora técnica.",
            risks: "Necesita disciplina para mantener las pruebas y la integración actualizadas.",
            next: "Definí pruebas automatizadas, revisiones de código y criterios de aceptación."
        },
        "Modelo en V": {
            strengths: "Relaciona los requisitos con las actividades de verificación y validación.",
            risks: "Los cambios de requisitos pueden exigir actualizar documentación y pruebas asociadas.",
            next: "Relacioná cada requisito con sus pruebas y planificá las validaciones desde el comienzo."
        },
        Incremental: {
            strengths: "Permite entregar funcionalidades progresivamente y validar cada parte del producto.",
            risks: "La integración entre incrementos debe planificarse para evitar inconsistencias.",
            next: "Dividí el producto en entregas pequeñas con criterios de aceptación propios."
        }
    };

    function showView(view) {
        welcomeView.classList.remove("active");
        wizardView.classList.remove("active");
        resultView.classList.remove("active");
        view.classList.add("active");
    }

    function updatePhase() {
        phases.forEach((phase, index) => {
            phase.classList.toggle("active", index === currentPhase);
        });

        stepCount.textContent = `Tema ${currentPhase + 1} de ${phases.length}`;

        const progress = ((currentPhase + 1) / phases.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));

        previousButton.classList.toggle("d-none", currentPhase === 0);

        nextButton.innerHTML = currentPhase === phases.length - 1
            ? 'Ver resultados <i class="bi bi-check2-circle"></i>'
            : 'Siguiente tema <i class="bi bi-arrow-right"></i>';

        validationMessage.textContent = "";
    }

    function selectAnswer(button) {
        const question = button.dataset.question;
        const value = button.dataset.value;

        answers[question] = value;

        answerButtons.forEach((option) => {
            if (option.dataset.question === question) {
                const selected = option === button;
                option.classList.toggle("selected", selected);
                option.setAttribute("aria-checked", String(selected));
            }
        });

        validationMessage.textContent = "";
    }

    function phaseIsComplete() {
        const questionsInPhase = [
            ...phases[currentPhase].querySelectorAll(".pregunta-card")
        ];

        const missingAnswer = questionsInPhase.some((card) => {
            return !answers[card.dataset.question];
        });

        if (missingAnswer) {
            validationMessage.textContent =
                "Respondé las dos preguntas de este tema para continuar.";
            return false;
        }

        return true;
    }

    // Obtiene la puntuación asociada a cada opción elegida.
    function calculateScores() {
        const totals = models.map(() => 0);

        questionCards.forEach((card) => {
            const question = card.dataset.question;
            const answer = answers[question];

            if (!answer || !scores[question] || !scores[question][answer]) {
                return;
            }

            const points = scores[question][answer];

            points.forEach((value, index) => {
                totals[index] += value;
            });
        });

        const maxPoints = questionCards.length * 6;

        const results = models.map((model, index) => ({
            model,
            points: totals[index],
            percentage: Math.round((totals[index] / maxPoints) * 100)
        }));

        results.sort((a, b) => b.points - a.points);

        return { results, maxPoints };
    }

    function renderScores(results) {
        results.forEach((result, index) => {
            const id = modelIds[result.model];
            const row = document.getElementById(`score-row-${id}`);
            const track = document.getElementById(`score-track-${id}`);
            const bar = document.getElementById(`score-bar-${id}`);
            const value = document.getElementById(`score-value-${id}`);

            if (!row || !track || !bar || !value) {
                return;
            }

            bar.style.width = `${result.percentage}%`;
            value.textContent = `${result.percentage}%`;
            track.setAttribute("aria-valuenow", String(result.percentage));
            row.classList.toggle("is-leading", index === 0);
        });
    }

    function renderEvidence(winner) {
        const winnerIndex = models.indexOf(winner);
        const evidence = [];

        questionCards.forEach((card) => {
            const question = card.dataset.question;
            const answer = answers[question];
            const points = scores[question]?.[answer];
            const selected = card.querySelector(".answer-option.selected");

            if (!points || !selected) {
                return;
            }

            const otherPoints = points.filter((value, index) => index !== winnerIndex);
            const average = otherPoints.reduce((sum, value) => sum + value, 0)
                / otherPoints.length;

            evidence.push({
                title: card.querySelector("h4").textContent,
                answer: selected.textContent.trim(),
                advantage: points[winnerIndex] - average
            });
        });

        evidence.sort((a, b) => b.advantage - a.advantage);

        const importantEvidence = evidence
            .filter((item) => item.advantage > 0)
            .slice(0, 3);

        for (let i = 0; i < 3; i++) {
            const item = importantEvidence[i];
            const container = document.getElementById(`evidence-${i + 1}`);
            const title = document.getElementById(`evidence-title-${i + 1}`);
            const answer = document.getElementById(`evidence-answer-${i + 1}`);

            if (!container || !title || !answer) {
                continue;
            }

            container.hidden = !item;

            if (item) {
                title.textContent = item.title;
                answer.textContent = item.answer;
            }
        }

        if (importantEvidence.length === 0) {
            const container = document.getElementById("evidence-1");

            if (container) {
                container.hidden = false;
                document.getElementById("evidence-title-1").textContent =
                    "Evaluación conjunta del proyecto";
                document.getElementById("evidence-answer-1").textContent =
                    "La recomendación surge del conjunto de tus respuestas.";
            }
        }
    }

    function renderResults() {
        const { results, maxPoints } = calculateScores();
        const winner = results[0];
        const second = results[1];

        resultMethod.textContent = winner.model;
        resultScore.textContent =
            `${winner.points} de ${maxPoints} puntos · Afinidad estimada: ${winner.percentage}%`;

        resultExplanation.textContent = explanations[winner.model];

        if (winner.points === second.points) {
            resultRunnerUp.textContent =
                `Hay un empate entre los modelos mejor puntuados. También conviene evaluar ${second.model}.`;
        } else {
            resultRunnerUp.textContent =
                `La segunda opción es ${second.model}, con ${second.points} puntos.`;
        }

        resultStrengths.textContent = advice[winner.model].strengths;
        resultRisks.textContent = advice[winner.model].risks;
        resultRecommendations.textContent = advice[winner.model].next;

        renderScores(results);
        renderEvidence(winner.model);

        answerSummary.textContent = questionCards.map((card) => {
            const question = card.querySelector("h4").textContent;
            const selected = card.querySelector(".answer-option.selected");

            return `${question} ${selected ? selected.textContent.trim() : "Sin respuesta"}`;
        }).join(" ");
    }

    document.getElementById("start-button").addEventListener("click", () => {
        showView(wizardView);
        updatePhase();
    });

    answerButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectAnswer(button);
        });
    });

    previousButton.addEventListener("click", () => {
        if (currentPhase > 0) {
            currentPhase--;
            updatePhase();
        }
    });

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

    updatePhase();
});