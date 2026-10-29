// Este archivo controla las funciones interactivas de la página Recursos.
// Permite cambiar entre pestañas, buscar términos en el glosario,
// abrir preguntas frecuentes y filtrar recursos por categoría.

// DOMContentLoaded espera a que el HTML esté cargado antes de buscar sus elementos.
// De esta manera, el JavaScript puede encontrar los botones, textos, secciones y tarjetas
// que necesita para agregarles interactividad.
document.addEventListener("DOMContentLoaded", () => {

    // Si una foto de avatar no carga, se quita para que se vea el ícono de respaldo.
    document.querySelectorAll(".perfil-avatar-img").forEach((img) => {
        const quitar = () => img.remove();

        // Cubre el caso en que la imagen ya falló antes de agregar el evento.
        if (img.complete && img.naturalWidth === 0) {
            quitar();
        } else {
            img.addEventListener("error", quitar, { once: true });
        }
    });
    // 1. PESTAÑAS DE LA PÁGINA


    // Busca todos los botones que permiten cambiar de sección.
    // Por ejemplo, los botones para entrar al glosario, las preguntas frecuentes
    // o los recursos externos.
    const tabs = [...document.querySelectorAll(".recurso-tab")];
    // Busca los paneles que contienen el contenido de cada pestaña.
    // Cada panel se relaciona con un botón mediante el atributo data-tab / data-panel.
    const tabPanels = [...document.querySelectorAll(".recursos-panel")];

    // Muestra la pestaña elegida y oculta las demás.
    // El parámetro "name" indica qué pestaña se quiere mostrar.
    function showTab(name) {
        // Recorre los botones de las pestañas para actualizar cuál está seleccionado.
        tabs.forEach((tab) => {
            // Comprueba si el botón actual corresponde a la pestaña solicitada.
            const active = tab.dataset.tab === name;
            // Agrega la clase "active" al botón seleccionado y se la quita a los demás.
            // Esta clase permite que el CSS destaque visualmente la pestaña activa.
            tab.classList.toggle("active", active);
            // Actualiza el estado de accesibilidad para indicar si la pestaña está seleccionada.
            tab.setAttribute("aria-selected", String(active));
            // Permite navegar con el teclado entre las pestañas.
            // La pestaña activa recibe tabIndex 0; las demás reciben -1.
            tab.tabIndex = active ? 0 : -1;
        });
        // Recorre los paneles que contienen el contenido de cada pestaña.
        tabPanels.forEach((panel) => {
            // Comprueba si este panel pertenece a la pestaña que se quiere mostrar.
            const active = panel.dataset.panel === name;
            // Oculta los paneles que no corresponden a la pestaña seleccionada.
            // El panel activo queda visible porque su propiedad hidden es false.
            panel.hidden = !active;
            // También actualiza la clase "active" para que el CSS pueda aplicar estilos.
            panel.classList.toggle("active", active);
        });
    }

    // Agrega los eventos necesarios a cada botón de pestaña.
    tabs.forEach((tab, index) => {
        // Cuando el usuario hace clic, muestra el panel relacionado con ese botón.
        tab.addEventListener("click", () => showTab(tab.dataset.tab));
        // Permite cambiar de pestaña utilizando el teclado, sin necesidad de hacer clic.
        tab.addEventListener("keydown", (event) => {
            // Guarda el índice de la pestaña que se va a seleccionar.
            // Inicialmente conserva el índice de la pestaña actual.
            let nextIndex = index;
            // Flecha derecha: selecciona la pestaña siguiente.
            // Si está en la última pestaña, vuelve a la primera.
            if (event.key === "ArrowRight") {
                nextIndex = (index + 1) % tabs.length;
            // Flecha izquierda: selecciona la pestaña anterior.
            // Si está en la primera, pasa a la última.
            } else if (event.key === "ArrowLeft") {
                nextIndex = (index - 1 + tabs.length) % tabs.length;
            // Home: vuelve directamente a la primera pestaña.
            } else if (event.key === "Home") {
                nextIndex = 0;
            // End: va directamente a la última pestaña.
            } else if (event.key === "End") {
                nextIndex = tabs.length - 1;
            // Si se presiona otra tecla, no realiza ninguna acción.
            } else {
                return;
            }
            // Evita que el navegador ejecute el comportamiento predeterminado de esa tecla.
            event.preventDefault();
            // Coloca el foco del teclado en la pestaña seleccionada.
            tabs[nextIndex].focus();
            // Actualiza la pestaña visible para que coincida con la selección.
            showTab(tabs[nextIndex].dataset.tab);
        });
    });



    // 2. NORMALIZACIÓN DEL TEXTO


    // Convierte un texto a un formato uniforme para facilitar las búsquedas.
    // Así, por ejemplo, se puede encontrar "programacion" aunque el término original
    // esté escrito como "Programación".
    function normalizar(texto) {
        // Convierte el valor recibido en una cadena de texto.
        // Si el valor es null o undefined, utiliza una cadena vacía.
        return String(texto ?? "")
            // Separa las letras de sus tildes y otros signos diacríticos.
            // Esto permite tratar las vocales acentuadas como sus letras originales.
            .normalize("NFD")
            // Elimina las marcas que representan las tildes.
            .replace(/[\u0300-\u036f]/g, "")
            // Convierte las letras a minúsculas según las reglas del español.
            .toLocaleLowerCase("es")
            // Reemplaza los signos de puntuación por espacios.
            // Conserva letras, números y espacios.
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            // Reemplaza varios espacios consecutivos por uno solo.
            .replace(/\s+/g, " ")
            // Elimina los espacios sobrantes del principio y del final.
            .trim();
    }



    // 3. BÚSQUEDA Y FILTROS DEL GLOSARIO


    // Campo donde el usuario escribe la palabra que quiere buscar.
    const searchInput = document.getElementById("buscar-glosario");
    // Botón que sirve para limpiar la búsqueda escrita.
    const clearSearchButton = document.getElementById("limpiar-glosario");
    // Botón que restablece completamente el glosario.
    const resetGlossaryButton = document.getElementById("restablecer-glosario");
    // Botones que permiten filtrar el glosario por letra.
    const letterButtons = [...document.querySelectorAll(".letra")];
    // Grupos de términos organizados alfabéticamente.
    // Cada grupo contiene los términos que comienzan con una determinada letra.
    const letterGroups = [...document.querySelectorAll(".grupo-letra")];
    // Elemento donde se informa cuántos términos se encontraron.
    const glossaryCount = document.getElementById("contador-glosario");
    // Contenedor principal que reúne los términos del glosario.
    const glossaryList = document.getElementById("glosario-listado");
    // Mensaje que se muestra cuando la búsqueda no encuentra coincidencias.
    const noGlossaryResults = document.getElementById("sin-resultados-glosario");
    // Guarda la letra que se encuentra seleccionada.
    // Una cadena vacía significa que no se está filtrando por ninguna letra.
    let activeLetter = "";
    // Actualiza los términos visibles según la búsqueda y la letra seleccionada.
    // Se ejecuta cuando el usuario escribe, selecciona una letra o limpia el glosario.
    function updateGlossary() {
        // Obtiene el texto escrito en el buscador y elimina los espacios de los extremos.
        const rawQuery = searchInput.value.trim();
        // Normaliza la búsqueda para que no importe el uso de mayúsculas o tildes.
        const query = normalizar(rawQuery);
        // Lleva la cuenta de cuántos términos quedan visibles.
        let visibleCount = 0;
        // Recorre cada grupo de letras del glosario.
        letterGroups.forEach((group) => {
            // Obtiene la letra que identifica al grupo actual.
            const groupLetter = group.dataset.letterGroup;
            // Busca todos los términos que están dentro de ese grupo.
            const terms = [...group.querySelectorAll(".termino")];
            // Cuenta cuántos términos del grupo coinciden con los filtros.
            let visibleInGroup = 0;
            // Comprueba cada término para decidir si debe mostrarse.
            terms.forEach((term) => {
                // Obtiene el título del término, que se encuentra en un elemento h4.
                const title = term.querySelector("h4").textContent;
                // Obtiene la definición del término, que se encuentra en un párrafo.
                const definition = term.querySelector("p").textContent;
                // Une el título y la definición para buscar coincidencias en ambos.
                // También normaliza el texto para compararlo con la búsqueda.
                const normalizedText = normalizar(`${title} ${definition}`);
                // Comprueba si el término coincide con el texto buscado.
                // Si el buscador está vacío, todos los términos pasan este filtro.
                // Si hay texto, debe existir una coincidencia.
                const matchesText = !rawQuery || (
                    query !== "" && normalizedText.includes(query)
                );

                // Comprueba si el término pertenece a la letra seleccionada.
                // Si no hay ninguna letra activa, todos los grupos pueden mostrarse.
                const matchesLetter = !activeLetter ||
                    groupLetter === activeLetter;

                // El término solo se muestra cuando cumple ambos filtros.
                const visible = matchesText && matchesLetter;
                // La propiedad hidden oculta el término cuando no cumple los filtros.
                term.hidden = !visible;

                // Si el término es visible, actualiza los contadores.
                if (visible) {
                    visibleCount++;
                    visibleInGroup++;
                }
            });

            // Oculta el grupo completo si no contiene ningún término visible.
            // Así se evitan encabezados de letras sin resultados debajo.
            group.hidden = visibleInGroup === 0;
        });

        // Actualiza los botones del índice alfabético.
        letterButtons.forEach((button) => {
            // Obtiene la letra asociada al botón.
            const letter = button.dataset.letter;
            // Comprueba si esa letra es la que está seleccionada actualmente.
            const active = letter === activeLetter;
            // Destaca visualmente la letra seleccionada.
            button.classList.toggle("active", active);
            // Informa a las tecnologías de asistencia si el botón está seleccionado.
            button.setAttribute("aria-pressed", String(active));
            // Desactiva una letra si no tiene términos disponibles en el glosario.
            // El botón que representa "todas las letras", cuyo valor es "",
            // no se desactiva mediante esta condición.
            button.disabled = letter !== "" && !letterGroups.some(
                (group) =>
                    group.dataset.letterGroup === letter &&
                    group.querySelector(".termino")
            );
        });

        // Actualiza el texto del contador según la cantidad de resultados.
        // Se utiliza una frase singular cuando solamente se encuentra un término.
        glossaryCount.textContent = visibleCount === 1
            ? "Se encontró 1 término."
            : `Se encontraron ${visibleCount} términos.`;
        // Si no hay coincidencias, muestra el mensaje de resultados vacíos.
        noGlossaryResults.hidden = visibleCount !== 0;
        // Oculta el listado cuando no hay resultados para mostrar.
        glossaryList.hidden = visibleCount === 0;
    }

    // Agrega la interacción a los botones del índice alfabético.
    letterButtons.forEach((button) => {
        button.addEventListener("click", () => {

            // Obtiene la letra que el usuario acaba de seleccionar.
            const selectedLetter = button.dataset.letter;

            // Si vuelve a hacer clic en la misma letra, quita el filtro.
            // Si selecciona otra letra, activa esa nueva selección.
            activeLetter = activeLetter === selectedLetter
                ? ""
                : selectedLetter;

            // Borra el texto de búsqueda para que no se combinen filtros anteriores
            // con la letra recién seleccionada.
            searchInput.value = "";

            // Vuelve a calcular qué términos deben mostrarse.
            updateGlossary();
        });
    });

    // Actualiza el glosario cada vez que cambia el contenido del buscador.
    searchInput.addEventListener("input", () => {
        // Al comenzar una búsqueda por texto, quita el filtro por letra.
        activeLetter = "";
        // Muestra los términos que coinciden con el texto escrito.
        updateGlossary();
    });

    // Restaura el glosario a su estado inicial:
    // sin texto de búsqueda y sin una letra seleccionada.
    function resetGlossary() {
        searchInput.value = "";
        activeLetter = "";
        // Vuelve a mostrar todos los términos disponibles.
        updateGlossary();
    }

    // El botón de limpiar búsqueda elimina el filtro actual.
    clearSearchButton.addEventListener("click", resetGlossary);
    // El botón de restablecer glosario realiza la misma operación.
    resetGlossaryButton.addEventListener("click", resetGlossary);

    // 4. PREGUNTAS FRECUENTES (FAQ)
    // Busca los contenedores de los distintos temas de preguntas frecuentes.
    // Cada tema agrupa una serie de preguntas y sus respuestas.
    const faqTopics = [...document.querySelectorAll(".faq-topic")];
    // Busca los botones que abren y cierran los temas completos.
    const topicButtons = [...document.querySelectorAll(".faq-topic-toggle")];
    // Busca los botones de las preguntas individuales.
    // Cada botón controla la respuesta asociada a una pregunta.
    const faqButtons = [...document.querySelectorAll(".faq-question")];

    // Cierra una respuesta individual mediante una transición de altura.
    function closeAnswer(button) {
        // Obtiene el ID de la respuesta controlada por el botón.
        // Este dato está guardado en el atributo aria-controls del HTML.
        const answerId = button.getAttribute("aria-controls");
        // Busca el elemento que contiene la respuesta.
        const answer = document.getElementById(answerId);
        // Si la respuesta no existe o ya está cerrada, no hace nada.
        if (!answer || button.getAttribute("aria-expanded") !== "true") {
            return;
        }
        // Fija temporalmente la altura actual para poder animar el cierre.
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        // Mantiene la clase de apertura mientras se prepara la transición.
        answer.classList.add("open");
        // Fuerza al navegador a registrar la altura actual antes de cambiarla.
        // Esto permite que la transición CSS se ejecute correctamente.
        void answer.offsetHeight;
        // Reduce la altura a cero para ocultar la respuesta de forma animada.
        answer.style.maxHeight = "0px";
        // Quita la clase que indica que la respuesta está abierta.
        answer.classList.remove("open");
        // Informa a las tecnologías de asistencia que la respuesta está oculta.
        answer.setAttribute("aria-hidden", "true");
        // Actualiza el botón para indicar que la pregunta está cerrada.
        button.setAttribute("aria-expanded", "false");
    }

        // Cuando termina la transición de altura de un elemento abierto,
    // le quita el límite de altura para que el contenido nunca quede cortado.
    function liberarAlturaAlAbrir(element, estaAbierto) {
        const handler = (event) => {
            // Ignora eventos de hijos y de otras propiedades (por ejemplo, visibility).
            if (event.target !== element || event.propertyName !== "max-height") {
                return;
            }
            element.removeEventListener("transitionend", handler);
            if (estaAbierto()) {
                element.style.maxHeight = "none";
            }
        };
        element.addEventListener("transitionend", handler);
    }

    // Abre una respuesta individual y adapta su altura al contenido.
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

        liberarAlturaAlAbrir(
            answer,
            () => button.getAttribute("aria-expanded") === "true"
        );

        // El panel del tema no debe limitar la altura mientras haya una respuesta abierta.
        const topicPanel = button.closest(".faq-topic")
            .querySelector(".faq-topic-panel");
        topicPanel.style.maxHeight = "none";
    }

    // Abre un tema completo de preguntas frecuentes.
    function openTopic(topic) {
        const toggle = topic.querySelector(".faq-topic-toggle");
        const panel = topic.querySelector(".faq-topic-panel");

        toggle.setAttribute("aria-expanded", "true");
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        panel.style.maxHeight = `${panel.scrollHeight}px`;

        liberarAlturaAlAbrir(
            panel,
            () => toggle.getAttribute("aria-expanded") === "true"
        );
    }

    // Cierra un tema completo y las respuestas que contiene.
    function closeTopic(topic) {
        // Busca el botón que controla la apertura del tema.
        const toggle = topic.querySelector(".faq-topic-toggle");
        // Busca el panel que contiene todas las preguntas de ese tema.
        const panel = topic.querySelector(".faq-topic-panel");
        // Cierra las respuestas individuales que estén abiertas dentro del tema.
        topic.querySelectorAll(".faq-question").forEach(closeAnswer);
        // Si el tema ya está cerrado, no necesita realizar otra transición.
        if (toggle.getAttribute("aria-expanded") !== "true") {
            return;
        }
        // Guarda la altura actual del panel para poder animar el cierre.
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        // Mantiene temporalmente la clase de apertura antes de iniciar la animación.
        panel.classList.add("open");
        // Fuerza al navegador a registrar la altura antes de reducirla.
        void panel.offsetHeight;
        // Lleva la altura a cero para cerrar el tema.
        panel.style.maxHeight = "0px";
        // Quita la clase que indica que el tema está abierto.
        panel.classList.remove("open");
        // Actualiza el estado de accesibilidad del panel y de su botón.
        panel.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
    }



    // Cierra todos los temas de FAQ, excepto el que se pasa como parámetro.
    // Esto permite mantener un único tema abierto a la vez.
    function closeOtherTopics(currentTopic) {
        faqTopics.forEach((topic) => {
            // No cierra el tema que el usuario acaba de seleccionar.
            if (topic !== currentTopic) {
                closeTopic(topic);
            }
        });
    }

    // Conecta cada botón de tema con su comportamiento de apertura y cierre.
    topicButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Obtiene el contenedor completo del tema al que pertenece el botón.
            const topic = button.closest(".faq-topic");
            // Comprueba si el tema ya está abierto.
            const isOpen = button.getAttribute("aria-expanded") === "true";
            if (isOpen) {
                // Si está abierto, lo cierra junto con sus respuestas.
                closeTopic(topic);
            } else {
                // Si está cerrado, cierra los demás temas y abre el seleccionado.
                closeOtherTopics(topic);
                openTopic(topic);
            }
        });
    });

    // Conecta cada pregunta con su respuesta individual.
    faqButtons.forEach((button) => {
        button.addEventListener("click", () => {
            // Busca el tema al que pertenece la pregunta seleccionada.
            const topic = button.closest(".faq-topic");
            // Busca el botón que controla la apertura del tema completo.
            const topicToggle = topic.querySelector(".faq-topic-toggle");
            // Comprueba si la respuesta de esta pregunta ya está abierta.
            const isOpen = button.getAttribute("aria-expanded") === "true";
            // Si la pregunta pertenece a un tema cerrado, primero abre ese tema.
            if (topicToggle.getAttribute("aria-expanded") !== "true") {
                // Cierra los otros temas para mantener uno solo abierto.
                closeOtherTopics(topic);
                // Abre el tema que contiene la pregunta seleccionada.
                openTopic(topic);
            }
            // Cierra las demás respuestas para que solo una quede abierta a la vez.
            faqButtons.forEach((otherButton) => {
                if (otherButton !== button) {
                    closeAnswer(otherButton);
                }
            });
            // Alterna el estado de la respuesta seleccionada.
            if (isOpen) {
                // Si estaba abierta, la cierra.
                closeAnswer(button);
            } else {
                // Si estaba cerrada, la abre.
                openAnswer(button);
            }
        });
    });


    // 5. FILTROS DE RECURSOS EXTERNOS

    // Busca los botones que permiten elegir una categoría de recursos.
    // Por ejemplo, un botón para mostrar todas las categorías y otros
    // para mostrar solamente los recursos de un tipo determinado.
    const categoryButtons = [...document.querySelectorAll(".categoria-btn")];
    // Busca todas las tarjetas individuales de recursos externos.
    const resourceItems = [...document.querySelectorAll(".recurso-item")];
    // Elemento donde se muestra la cantidad de recursos visibles.
    const resourceCount = document.getElementById("contador-recursos");
    // Mensaje que aparece cuando la categoría seleccionada no tiene recursos.
    const noResources = document.getElementById("sin-recursos");

    // Muestra únicamente los recursos que pertenecen a la categoría elegida.
    // El parámetro "category" contiene la categoría que se quiere mostrar.
    function filterResources(category) {
        // Contador de tarjetas que cumplen el filtro seleccionado.
        let visibleCount = 0;
        // Actualiza el estado visual de los botones de categoría.
        categoryButtons.forEach((button) => {
            // Comprueba si el botón corresponde a la categoría elegida.
            const active = button.dataset.categoryFilter === category;
            // Destaca el botón seleccionado mediante la clase "active".
            button.classList.toggle("active", active);
            // Informa a las tecnologías de asistencia qué categoría está seleccionada.
            button.setAttribute("aria-pressed", String(active));
        });

        // Recorre las tarjetas para mostrar u ocultar cada recurso.
        resourceItems.forEach((item) => {
            // Si la categoría es "todas", muestra todos los recursos.
            // De lo contrario, compara la categoría del botón con la tarjeta.
            const visible = category === "todas" ||
                item.dataset.category === category;
            // Oculta la tarjeta cuando no pertenece a la categoría elegida.
            item.hidden = !visible;
            // Cuenta las tarjetas que permanecen visibles.
            if (visible) {
                visibleCount++;
            }
        });

        // Actualiza el contador según la cantidad de recursos visibles.
        // Utiliza el singular cuando solo hay un recurso.
        resourceCount.textContent = visibleCount === 1
            ? "Se muestra 1 recurso."
            : `Se muestran ${visibleCount} recursos.`;

        // Si no hay recursos en la categoría elegida, muestra el mensaje correspondiente.
        noResources.hidden = visibleCount !== 0;
    }

    // Agrega un evento a cada botón de categoría.
    categoryButtons.forEach((button) => {
        button.addEventListener("click", () => {

            // Obtiene la categoría guardada en data-category-filter
            // y llama a la función que actualiza las tarjetas visibles.
            filterResources(button.dataset.categoryFilter);
        });
    });

    // 6. EJERCICIOS Y CASOS PRÁCTICOS (MOSTRAR / OCULTAR SOLUCIÓN)

    // Botones que controlan la solución de cada ejercicio.
    const solutionButtons = [...document.querySelectorAll(".solucion-toggle")];

    // Abre o cierra una solución y sincroniza texto, icono y atributos de accesibilidad.
    function setSolution(button, open) {
        const panel = document.getElementById(button.getAttribute("aria-controls"));
        const card = button.closest(".ejercicio-card");
        const icon = button.querySelector("i");
        if (!panel || !card) {
            return;
        }
        card.classList.toggle("solucion-abierta", open);
        button.setAttribute("aria-expanded", String(open));
        button.querySelector(".solucion-label").textContent =
            open ? "Ocultar solución" : "Mostrar solución";
        icon.classList.toggle("bi-eye", !open);
        icon.classList.toggle("bi-eye-slash", open);
        panel.setAttribute("aria-hidden", String(!open));
        // inert evita que el contenido oculto reciba foco o sea leído.
        panel.inert = !open;
    }

    // Deja todas las soluciones ocultas.
    function resetSolutions() {
        solutionButtons.forEach((button) => setSolution(button, false));
    }

    // Alterna la solución del ejercicio al hacer clic.
    solutionButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const isOpen = button.getAttribute("aria-expanded") === "true";
            setSolution(button, !isOpen);
        });
    });
    // 7. ESTADO INICIAL DE LA PÁGINA
    // Cuando termina de cargarse el HTML, deja preparada la página para usarla.
    // Muestra inicialmente la pestaña del glosario.
    showTab("glosario");
    // Actualiza el glosario para que aparezcan todos los términos disponibles.
    updateGlossary();
    // Muestra todas las tarjetas de recursos, sin aplicar un filtro específico.
    filterResources("todas");
    updateGlossary();
    resetSolutions();
});