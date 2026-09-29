/* Línea de tiempo del ciclo de vida del software.
   Al hacer clic en una etapa se abre su tarjeta informativa y se cierra la anterior. */

(function () {
  "use strict";
  // Busca todas las líneas de tiempo de la página (por si hay más de una).
  const timelines = document.querySelectorAll("[data-timeline]");
  timelines.forEach((timeline) => {
    const steps = timeline.querySelectorAll(".timeline-step");
    /* Abre o cierra una etapa y sincroniza los atributos de accesibilidad. */
    function setStepState(step, isOpen) {
      const button = step.querySelector(".timeline-button");
      const info = step.querySelector(".timeline-info");
      step.classList.toggle("is-active", isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
      info.setAttribute("aria-hidden", String(!isOpen));
    }
    /* Cierra todas las etapas, excepto la indicada (opcional). */
    function closeAll(exceptStep = null) {
      steps.forEach((step) => {
        if (step !== exceptStep) setStepState(step, false);
      });
    }
    steps.forEach((step) => {
      const button = step.querySelector(".timeline-button");
      button.addEventListener("click", () => {
        const isOpen = step.classList.contains("is-active");
        // Solo una tarjeta abierta a la vez.
        closeAll(step);
        setStepState(step, !isOpen);
      });
    });
    /* Cierra la tarjeta abierta al hacer clic fuera de la línea de tiempo. */
    document.addEventListener("click", (event) => {
      if (!timeline.contains(event.target)) closeAll();
    });
    /* Cierra la tarjeta abierta con la tecla Escape
       y devuelve el foco al botón de esa etapa. */
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      const openStep = timeline.querySelector(".timeline-step.is-active");
      if (openStep) {
        setStepState(openStep, false);
        openStep.querySelector(".timeline-button").focus();
      }
    });
  });
})();
