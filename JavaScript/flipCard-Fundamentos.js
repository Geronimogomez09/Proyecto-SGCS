/* Activa el cambio entre el frente y el contenido de la tarjeta */
document.querySelectorAll(".test-card").forEach(card => {
    card.addEventListener("click", () => {
        card.classList.toggle("is-active");
    });
});