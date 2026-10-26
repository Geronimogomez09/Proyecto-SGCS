// Interacciones de la página Recursos: pestañas, glosario, FAQ y filtros.
document.addEventListener("DOMContentLoaded", () => {

    // Pestañas superiores: solo una sección queda visible.
    const tabs = [...document.querySelectorAll(".recurso-tab")];
    const tabPanels = [...document.querySelectorAll(".recursos-panel")];

    function showTab(name) {
        tabs.forEach((tab) => {
            const active = tab.dataset.tab === name;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
            tab.tabIndex = active ? 0 : -1;
        });

        tabPanels.forEach((panel) => {
            const active = panel.dataset.panel === name;
            panel.hidden = !active;
            panel.classList.toggle("active", active);
        });
    }

    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => showTab(tab.dataset.tab));

        // Permite cambiar de pestaña con las flechas del teclado.
        tab.addEventListener("keydown", (event) => {
            let nextIndex = index;

            if (event.key === "ArrowRight") {
                nextIndex = (index + 1) % tabs.length;
            } else if (event.key === "ArrowLeft") {
                nextIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = tabs.length - 1;
            } else {
                return;
            }

            event.preventDefault();
            tabs[nextIndex].focus();
            showTab(tabs[nextIndex].dataset.tab);
        });
    });

    // Normaliza el texto para ignorar tildes, mayúsculas y signos de puntuación.
    function normalizar(texto) {
        return String(texto ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("es")
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    // Glosario: los términos ya están escritos en el HTML.
    const searchInput = document.getElementById("buscar-glosario");
    const clearSearchButton = document.getElementById("limpiar-glosario");
    const resetGlossaryButton = document.getElementById("restablecer-glosario");
    const letterButtons = [...document.querySelectorAll(".letra")];
    const letterGroups = [...document.querySelectorAll(".grupo-letra")];
    const glossaryCount = document.getElementById("contador-glosario");
    const glossaryList = document.getElementById("glosario-listado");
    const noGlossaryResults = document.getElementById("sin-resultados-glosario");

    let activeLetter = "";

    // Filtra términos según el texto escrito y la letra seleccionada.
    function updateGlossary() {
        const rawQuery = searchInput.value.trim();
        const query = normalizar(rawQuery);
        let visibleCount = 0;

        letterGroups.forEach((group) => {
            const groupLetter = group.dataset.letterGroup;
            const terms = [...group.querySelectorAll(".termino")];
            let visibleInGroup = 0;

            terms.forEach((term) => {
                const title = term.querySelector("h4").textContent;
                const definition = term.querySelector("p").textContent;
                const normalizedText = normalizar(`${title} ${definition}`);

                const matchesText = !rawQuery || (
                    query !== "" && normalizedText.includes(query)
                );

                const matchesLetter = !activeLetter ||
                    groupLetter === activeLetter;

                const visible = matchesText && matchesLetter;

                term.hidden = !visible;

                if (visible) {
                    visibleCount++;
                    visibleInGroup++;
                }
            });

            group.hidden = visibleInGroup === 0;
        });

        // Actualiza el estado de los botones del índice alfabético.
        letterButtons.forEach((button) => {
            const letter = button.dataset.letter;
            const active = letter === activeLetter;

            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));

            button.disabled = letter !== "" && !letterGroups.some(
                (group) =>
                    group.dataset.letterGroup === letter &&
                    group.querySelector(".termino")
            );
        });

        // Actualiza el contador y muestra el mensaje si no hay coincidencias.
        glossaryCount.textContent = visibleCount === 1
            ? "Se encontró 1 término."
            : `Se encontraron ${visibleCount} términos.`;

        noGlossaryResults.hidden = visibleCount !== 0;
        glossaryList.hidden = visibleCount === 0;
    }

    // Filtra el glosario cuando se selecciona una letra.
    letterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedLetter = button.dataset.letter;

            activeLetter = activeLetter === selectedLetter
                ? ""
                : selectedLetter;

            searchInput.value = "";
            updateGlossary();
        });
    });

    // Actualiza los resultados mientras se escribe.
    searchInput.addEventListener("input", () => {
        activeLetter = "";
        updateGlossary();
    });

    // Restablece la búsqueda y el índice alfabético.
    function resetGlossary() {
        searchInput.value = "";
        activeLetter = "";
        updateGlossary();
    }

    clearSearchButton.addEventListener("click", resetGlossary);
    resetGlossaryButton.addEventListener("click", resetGlossary);

    // FAQ: permite abrir un solo tema y una sola respuesta a la vez.
    const faqTopics = [...document.querySelectorAll(".faq-topic")];
    const topicButtons = [...document.querySelectorAll(".faq-topic-toggle")];
    const faqButtons = [...document.querySelectorAll(".faq-question")];

    // Cierra una respuesta con una transición de altura.
    function closeAnswer(button) {
        const answerId = button.getAttribute("aria-controls");
        const answer = document.getElementById(answerId);

        if (!answer || button.getAttribute("aria-expanded") !== "true") {
            return;
        }

        answer.style.maxHeight = `${answer.scrollHeight}px`;
        answer.classList.add("open");

        // Fuerza al navegador a registrar la altura antes de cerrarla.
        void answer.offsetHeight;

        answer.style.maxHeight = "0px";
        answer.classList.remove("open");
        answer.setAttribute("aria-hidden", "true");
        button.setAttribute("aria-expanded", "false");
    }

    // Abre una respuesta y adapta la altura del tema que la contiene.
    function openAnswer(button) {
        const answerId = button.getAttribute("aria-controls");
        const answer = document.getElementById(answerId);

        if (!answer) {
            return;
        }

        answer.classList.add("open");
        answer.setAttribute("aria-hidden", "false");
        button.setAttribute("aria-expanded", "true");
        answer.style.maxHeight = `${answer.scrollHeight}px`;

        // Al terminar la animación, deja que el contenido use su altura natural.
        answer.addEventListener("transitionend", (event) => {
            if (
                event.target === answer &&
                event.propertyName === "max-height" &&
                button.getAttribute("aria-expanded") === "true"
            ) {
                answer.style.maxHeight = "none";
            }
        }, { once: true });

        const topicPanel = button.closest(".faq-topic")
            .querySelector(".faq-topic-panel");

        if (topicPanel.style.maxHeight !== "none") {
            requestAnimationFrame(() => {
                if (topicPanel.classList.contains("open")) {
                    topicPanel.style.maxHeight =
                        `${topicPanel.scrollHeight}px`;
                }
            });
        }
    }

    // Cierra un tema y todas sus respuestas abiertas.
    function closeTopic(topic) {
        const toggle = topic.querySelector(".faq-topic-toggle");
        const panel = topic.querySelector(".faq-topic-panel");

        topic.querySelectorAll(".faq-question").forEach(closeAnswer);

        if (toggle.getAttribute("aria-expanded") !== "true") {
            return;
        }

        panel.style.maxHeight = `${panel.scrollHeight}px`;
        panel.classList.add("open");

        // Fuerza el registro de la altura antes de iniciar el cierre.
        void panel.offsetHeight;

        panel.style.maxHeight = "0px";
        panel.classList.remove("open");
        panel.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
    }

    // Abre un tema de preguntas frecuentes.
    function openTopic(topic) {
        const toggle = topic.querySelector(".faq-topic-toggle");
        const panel = topic.querySelector(".faq-topic-panel");

        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        panel.style.maxHeight = `${panel.scrollHeight}px`;

        // Al finalizar la animación, permite una altura natural.
        panel.addEventListener("transitionend", (event) => {
            if (
                event.target === panel &&
                event.propertyName === "max-height" &&
                toggle.getAttribute("aria-expanded") === "true"
            ) {
                panel.style.maxHeight = "none";
            }
        }, { once: true });
    }

    // Cierra todos los temas excepto el que se acaba de seleccionar.
    function closeOtherTopics(currentTopic) {
        faqTopics.forEach((topic) => {
            if (topic !== currentTopic) {
                closeTopic(topic);
            }
        });
    }

    // Controla la apertura y el cierre de cada tema.
    topicButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const topic = button.closest(".faq-topic");
            const isOpen = button.getAttribute("aria-expanded") === "true";

            if (isOpen) {
                closeTopic(topic);
            } else {
                closeOtherTopics(topic);
                openTopic(topic);
            }
        });
    });

    // Controla las respuestas individuales del acordeón.
    faqButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const topic = button.closest(".faq-topic");
            const topicToggle = topic.querySelector(".faq-topic-toggle");
            const isOpen = button.getAttribute("aria-expanded") === "true";

            // Si la pregunta pertenece a otro tema, abre ese tema.
            if (topicToggle.getAttribute("aria-expanded") !== "true") {
                closeOtherTopics(topic);
                openTopic(topic);
            }

            // Cierra cualquier otra respuesta abierta.
            faqButtons.forEach((otherButton) => {
                if (otherButton !== button) {
                    closeAnswer(otherButton);
                }
            });

            // Alterna la respuesta seleccionada.
            if (isOpen) {
                closeAnswer(button);
            } else {
                openAnswer(button);
            }
        });
    });

    // Recursos externos: filtra las tarjetas por categoría.
    const categoryButtons = [...document.querySelectorAll(".categoria-btn")];
    const resourceItems = [...document.querySelectorAll(".recurso-item")];
    const resourceCount = document.getElementById("contador-recursos");
    const noResources = document.getElementById("sin-recursos");

    function filterResources(category) {
        let visibleCount = 0;

        // Marca el botón de la categoría activa.
        categoryButtons.forEach((button) => {
            const active = button.dataset.categoryFilter === category;

            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        // Muestra todas las tarjetas o solo las de la categoría seleccionada.
        resourceItems.forEach((item) => {
            const visible = category === "todas" ||
                item.dataset.category === category;

            item.hidden = !visible;

            if (visible) {
                visibleCount++;
            }
        });

        // Actualiza el contador y el mensaje de resultados vacíos.
        resourceCount.textContent = visibleCount === 1
            ? "Se muestra 1 recurso."
            : `Se muestran ${visibleCount} recursos.`;

        noResources.hidden = visibleCount !== 0;
    }

    // Conecta los botones de categoría con el filtro de recursos.
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterResources(button.dataset.categoryFilter);
        });
    });

    // Estado inicial: pestaña del glosario activa y todos los recursos visibles.
    showTab("glosario");
    updateGlossary();
    filterResources("todas");
});