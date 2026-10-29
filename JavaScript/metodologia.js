// Archivo: JavaScript/medotologias.js
// Funcionalidades de la página "Metodologías Ágiles":
// 1. Construye automáticamente la tabla de contenidos.
// 2. Permite navegar a apartados y abrir el acordeón correspondiente.
// 3. Resalta la metodología que está visible al desplazarse.
// 4. Permite abrir o cerrar todos los principios del Manifiesto Ágil.

(function () {
    // Evita que las variables y funciones de este archivo
    // queden disponibles globalmente y puedan generar conflictos.
    "use strict";

    // Comprueba si el usuario configuró su dispositivo para reducir
    // las animaciones y los movimientos de la interfaz.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Función auxiliar que desplaza la página hasta un elemento.
    function scrollToElement(el) {
        el.scrollIntoView({
            // Usa desplazamiento instantáneo si se reducen las animaciones.
            // De lo contrario, utiliza desplazamiento suave.
            behavior: reduceMotion ? "auto" : "smooth",

            // Alinea el elemento con la parte superior del área visible.
            block: "start",
        });
    }

    // Abre un elemento del acordeón de Bootstrap y ejecuta una función
    // cuando termina la apertura.
    function openAccordionItem(item, done) {
        // Busca el panel desplegable que pertenece directamente
        // al elemento del acordeón recibido.
        const collapse = item.querySelector(":scope > .accordion-collapse");

        // Si no existe el panel o ya está abierto, no hace falta abrirlo.
        // Se ejecuta directamente la función que continúa la navegación.
        if (!collapse || collapse.classList.contains("show")) {
            done();
            return;
        }

        // Evita que la función de finalización se ejecute más de una vez.
        let finished = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            done();
        };

        // Espera el evento de Bootstrap que indica que el panel terminó
        // de abrirse. El listener se elimina después de ejecutarse.
        collapse.addEventListener("shown.bs.collapse", finish, { once: true });

        // Obtiene la instancia del acordeón o crea una nueva
        // sin alternar automáticamente su estado.
        bootstrap.Collapse.getOrCreateInstance(collapse, { toggle: false }).show();

        // Alternativa por si el evento de Bootstrap no se dispara.
        // Después de 600 ms continúa con la navegación igualmente.
        setTimeout(finish, 600);
    }

    // Lleva al usuario hasta un elemento y, si corresponde,
    // abre primero el acordeón que lo contiene.
    function goTo(target, updateHash) {
        // Si el elemento de destino no existe, no hace nada.
        if (!target) return;

        // Define las acciones que se realizan al llegar al destino.
        const jump = () => {
            // Desplaza la página hasta el elemento.
            scrollToElement(target);

            // Si el destino tiene un botón de acordeón, utiliza ese botón
            // para colocar el foco. Si no, utiliza el propio destino.
            const focusable = target.querySelector(".accordion-button") || target;

            // Agrega tabindex="-1" si el destino necesita recibir el foco
            // y todavía no tiene ese atributo.
            if (focusable === target && !target.hasAttribute("tabindex")) {
                target.setAttribute("tabindex", "-1");
            }

            // Mueve el foco al elemento sin provocar otro desplazamiento.
            // Esto mejora la navegación con teclado y lectores de pantalla.
            focusable.focus({ preventScroll: true });

            // Actualiza el fragmento de la URL con el ID del destino,
            // salvo que se haya indicado que no debe actualizarse.
            if (updateHash !== false && target.id) {
                try {
                    history.replaceState(null, "", "#" + target.id);
                } catch (e) {
                    // Algunos navegadores bloquean replaceState
                    // cuando la página se abre mediante file://.
                }
            }
        };

        // Si el destino es un elemento del acordeón, lo abre antes
        // de desplazarse. Si no, ejecuta directamente la navegación.
        if (target.classList.contains("accordion-item")) {
            openAccordionItem(target, jump);
        } else {
            jump();
        }
    }

    // Tabla de contenidos dinámica:
    // genera sus enlaces a partir de los atributos del HTML.
    function buildToc() {
        // Busca el contenedor donde se mostrarán los enlaces.
        const nav = document.getElementById("toc-nav");

        // Si no existe el contenedor, no puede construirse el índice.
        if (!nav) return;

        // Crea un fragmento temporal para agrupar los elementos
        // antes de agregarlos al documento.
        const fragment = document.createDocumentFragment();

        // Busca las secciones que tengan el atributo data-toc-title.
        // Cada una se convierte en un grupo principal del índice.
        document.querySelectorAll("section[data-toc-title]").forEach((section) => {
            // Crea el contenedor del grupo.
            const group = document.createElement("div");
            group.className = "toc-group";

            // Guarda el ID de la sección para poder identificar
            // qué grupo corresponde a cada metodología.
            group.dataset.section = section.id;

            // Crea el enlace principal del grupo.
            const groupLink = document.createElement("a");
            groupLink.className = "toc-group-link";
            groupLink.href = "#" + section.id;

            // Obtiene el texto visible desde el atributo data-toc-title.
            groupLink.textContent = section.dataset.tocTitle;

            // Agrega el enlace al grupo.
            group.appendChild(groupLink);

            // Busca los apartados secundarios de la sección.
            // Cada uno debe tener el atributo data-toc-label.
            const items = section.querySelectorAll("[data-toc-label]");

            // Si hay apartados secundarios, crea una lista para ellos.
            if (items.length) {
                const list = document.createElement("ul");
                list.className = "toc-sublist";

                // Genera un enlace por cada apartado secundario.
                items.forEach((item) => {
                    const li = document.createElement("li");
                    const a = document.createElement("a");

                    // El enlace apunta al ID del elemento del HTML.
                    a.href = "#" + item.id;

                    // El texto del enlace se obtiene de data-toc-label.
                    a.textContent = item.dataset.tocLabel;

                    // Organiza el enlace dentro de la lista.
                    li.appendChild(a);
                    list.appendChild(li);
                });

                // Agrega la lista secundaria al grupo principal.
                group.appendChild(list);
            }

            // Agrega el grupo completo al fragmento temporal.
            fragment.appendChild(group);
        });

        // Incorpora todos los grupos al índice de una sola vez.
        nav.appendChild(fragment);

        // Utiliza un único evento click para gestionar los enlaces
        // principales y secundarios de la tabla de contenidos.
        nav.addEventListener("click", (event) => {
            // Busca el enlace más cercano al elemento que recibió el clic.
            const link = event.target.closest('a[href^="#"]');

            // Si el clic no ocurrió sobre un enlace interno, no continúa.
            if (!link) return;

            // Evita el salto automático del navegador para controlar
            // la navegación mediante las funciones de este archivo.
            event.preventDefault();

            // Obtiene el elemento de destino a partir del ID del enlace.
            const target = document.getElementById(link.getAttribute("href").slice(1));

            // Busca el panel lateral que contiene la tabla de contenidos.
            const panel = document.getElementById("toc-offcanvas");

            // Obtiene la instancia de Bootstrap si ya fue creada.
            const instance = bootstrap.Offcanvas.getInstance(panel);

            // Si el panel está abierto, primero lo cierra para permitir
            // que la página vuelva a desplazarse normalmente.
            if (instance && panel.classList.contains("show")) {
                // Espera a que termine de cerrarse antes de navegar.
                panel.addEventListener("hidden.bs.offcanvas", () => goTo(target), { once: true });

                // Cierra el panel lateral.
                instance.hide();
            } else {
                // Si el panel ya está cerrado, navega directamente.
                goTo(target);
            }
        });
    }

    // Resalta en la tabla de contenidos la metodología que está visible.
    function initScrollSpy() {
        // Relaciona el ID de cada sección con su grupo del índice.
        const groups = new Map();

        document.querySelectorAll(".toc-group").forEach((g) => groups.set(g.dataset.section, g));

        // Si no hay grupos o el navegador no admite IntersectionObserver,
        // no se activa el resaltado automático.
        if (!groups.size || !("IntersectionObserver" in window)) return;

        // Observa qué secciones están entrando en el área visible
        // definida para determinar cuál debe aparecer resaltada.
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Solo actúa cuando la sección observada está visible
                    // dentro del área definida por el observador.
                    if (!entry.isIntersecting) return;

                    // Quita el resaltado de todos los grupos anteriores.
                    groups.forEach((g) => g.classList.remove("active"));

                    // Busca el grupo que corresponde a la sección visible.
                    const active = groups.get(entry.target.id);

                    // Si existe, lo marca como activo.
                    if (active) active.classList.add("active");
                });
            },

            // Reduce el área de observación por arriba y por abajo
            // para decidir en qué zona se considera activa una sección.
            { rootMargin: "-35% 0px -55% 0px" }
        );

        // Registra todas las secciones principales para observarlas.
        document.querySelectorAll("section[data-toc-title]").forEach((s) => observer.observe(s));
    }

    // Inicializa el botón que abre o cierra todos los principios ágiles.
    function initToggleAll() {
        // Busca el botón y el acordeón que contiene los principios.
        const button = document.getElementById("toggle-principios");
        const accordion = document.getElementById("acordeon-principios");

        // Si alguno de los elementos no existe, no inicializa el botón.
        if (!button || !accordion) return;

        // Obtiene el texto y el icono que aparecen dentro del botón.
        const label = button.querySelector(".toggle-label");
        const icon = button.querySelector("i");

        // Ejecuta estas acciones cuando el usuario pulsa el botón.
        button.addEventListener("click", () => {
            // Busca todos los paneles desplegables del acordeón.
            const panels = accordion.querySelectorAll(".accordion-collapse");

            // Comprueba si existe al menos un panel cerrado.
            // Si hay alguno cerrado, la acción será abrirlos todos.
            // Si todos están abiertos, la acción será cerrarlos.
            const open = Array.from(panels).some((p) => !p.classList.contains("show"));

            // Recorre todos los paneles y obtiene su instancia de Bootstrap.
            panels.forEach((panel) => {
                const instance = bootstrap.Collapse.getOrCreateInstance(panel, { toggle: false });

                // Abre todos los paneles si open es true.
                // De lo contrario, los cierra.
                open ? instance.show() : instance.hide();
            });

            // Actualiza el texto del botón según la acción realizada.
            label.textContent = open ? "Cerrar todos" : "Abrir todos";

            // Cambia el icono para representar la acción disponible.
            icon.className = open ? "bi bi-arrows-collapse" : "bi bi-arrows-expand";
        });
    }

    // Espera a que el HTML esté cargado y listo para manipularse.
    document.addEventListener("DOMContentLoaded", () => {
        // Construye el índice, activa el resaltado y configura el botón.
        // Se ejecutan en este orden porque el resaltado necesita
        // que los grupos de la tabla de contenidos ya estén creados.
        buildToc();
        initScrollSpy();
        initToggleAll();
    });

    // Gestiona las URL que incluyen un fragmento, por ejemplo:
    // metodologias-agiles.html#scrum-artefactos
    window.addEventListener("load", () => {
        // Si la URL no tiene un fragmento, no hay un destino específico.
        if (!location.hash) return;

        try {
            // Busca el elemento indicado por el fragmento y navega hasta él.
            // El segundo argumento false evita modificar nuevamente la URL.
            goTo(document.querySelector(location.hash), false);
        } catch (e) {
            // Si el fragmento no es válido, se ignora el error.
        }
    });
})();