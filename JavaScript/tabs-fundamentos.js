/* Controla la pestaña "Todos" y las pestañas individuales */
const todosTab = document.querySelector("#todos-tab");
const tabButtons = document.querySelectorAll("#herramientasTabs .nav-link:not(#todos-tab)");
const tabPanes = document.querySelectorAll("#herramientasTabsContent .tab-pane");

todosTab.addEventListener("click", () => {
    tabButtons.forEach(button => {
        button.classList.remove("active");
        button.setAttribute("aria-selected", "false");
    });
    todosTab.classList.add("active");
    todosTab.setAttribute("aria-selected", "true");
    tabPanes.forEach(pane => {
        pane.classList.add("show", "active");
    });
});

tabButtons.forEach(button => {
    button.addEventListener("shown.bs.tab", event => {
        todosTab.classList.remove("active");
        todosTab.setAttribute("aria-selected", "false");
        tabPanes.forEach(pane => {
            pane.classList.remove("show", "active");
        });
        const target = document.querySelector(event.target.dataset.bsTarget);
        if (target) {
            target.classList.add("show", "active");
        }
    });
});