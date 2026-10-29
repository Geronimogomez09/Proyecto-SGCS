// Interacciones de la página Sobre Nosotros.
document.addEventListener("DOMContentLoaded", () => {

    // Tarjetas de los integrantes del equipo.
    const profileCards = [...document.querySelectorAll(".perfil-card")];

    profileCards.forEach((card) => {

        // Agrega un efecto visual al pasar el cursor.
        card.addEventListener("pointerenter", () => {
            card.classList.add("is-hovered");
        });

        card.addEventListener("pointerleave", () => {
            card.classList.remove("is-hovered");
        });

        // Aplica el efecto cuando la tarjeta recibe el foco.
        card.addEventListener("focus", () => {
            card.classList.add("is-hovered");
        });

        card.addEventListener("blur", () => {
            card.classList.remove("is-hovered");
        });

        // Abre el perfil ampliado del integrante seleccionado.
        card.addEventListener("click", () => {
            const dialogId = card.getAttribute("aria-controls");
            const dialog = document.getElementById(dialogId);

            if (dialog && typeof dialog.showModal === "function") {
                dialog.showModal();
            }
        });
    });

    // Botones para cerrar las tarjetas ampliadas.
    document.querySelectorAll(".perfil-dialog").forEach((dialog) => {
        const closeButton = dialog.querySelector("[data-close-profile]");

        closeButton.addEventListener("click", () => {
            dialog.close();
        });

        // Cierra el perfil al hacer clic fuera de su contenido.
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    });

    // Elementos del formulario de contacto.
    const form = document.getElementById("contact-form");
    const feedback = document.getElementById("contact-feedback");
    const message = document.getElementById("contact-message");
    const counter = document.getElementById("message-counter");

    // Campos que se deben validar.
    const fields = {
        name: document.getElementById("contact-name"),
        email: document.getElementById("contact-email"),
        subject: document.getElementById("contact-subject"),
        type: document.getElementById("contact-type"),
        message: message
    };

    // Elementos donde aparecen los mensajes de error.
    const errors = {
        name: document.getElementById("name-error"),
        email: document.getElementById("email-error"),
        subject: document.getElementById("subject-error"),
        type: document.getElementById("type-error"),
        message: document.getElementById("message-error")
    };

    // Actualiza el contador de caracteres del mensaje.
    function updateMessageCounter() {
        counter.textContent = `${message.value.length} / ${message.maxLength}`;
    }

    // Valida un campo y muestra el error correspondiente.
    function validateField(name) {
        const field = fields[name];
        const error = errors[name];
        const value = field.value.trim();

        let messageText = "";

        // Comprueba que los campos obligatorios no estén vacíos.
        if (field.required && !value) {
            messageText = "Este campo es obligatorio.";
        }

        // Comprueba la longitud mínima del nombre.
        else if (name === "name" && value.length < 3) {
            messageText = "Ingresá al menos 3 caracteres.";
        }

        // Comprueba que el correo tenga un formato válido.
        else if (name === "email" && !field.validity.valid) {
            messageText = "Ingresá un correo electrónico válido.";
        }

        // Comprueba la longitud mínima del asunto.
        else if (name === "subject" && value.length < 3) {
            messageText = "El asunto debe tener al menos 3 caracteres.";
        }

        // Comprueba que el mensaje tenga suficiente contenido.
        else if (name === "message" && value.length < 10) {
            messageText = "El mensaje debe tener al menos 10 caracteres.";
        }

        // Muestra el mensaje y actualiza el estilo del campo.
        error.textContent = messageText;

        field.classList.toggle("is-invalid", Boolean(messageText));
        field.classList.toggle("is-valid", !messageText && Boolean(value));

        field.setAttribute("aria-invalid", String(Boolean(messageText)));

        return !messageText;
    }

    // Valida los campos al salir de ellos o al modificarlos.
    Object.keys(fields).forEach((name) => {
        const field = fields[name];

        field.addEventListener("blur", () => {
            validateField(name);
        });

        field.addEventListener("input", () => {

            // Si el campo ya tenía un error, vuelve a comprobarlo.
            if (field.classList.contains("is-invalid")) {
                validateField(name);
            }

            // Actualiza el contador cuando se escribe el mensaje.
            if (name === "message") {
                updateMessageCounter();
            }

            // Oculta el mensaje general al modificar el formulario.
            feedback.hidden = true;
        });

        field.addEventListener("change", () => {

            // Comprueba los campos que ya presentaban errores.
            if (field.classList.contains("is-invalid")) {
                validateField(name);
            }

            feedback.hidden = true;
        });
    });

    // Comprueba el formulario cuando se presiona el botón de envío.
    form.addEventListener("submit", (event) => {

        // Evita que la página se recargue o envíe información.
        event.preventDefault();

        feedback.hidden = true;

        // Valida todos los campos y comprueba si son correctos.
        const valid = Object.keys(fields)
            .map(validateField)
            .every(Boolean);

        // Si hay errores, muestra un aviso y enfoca el primer campo inválido.
        if (!valid) {
            feedback.textContent =
                "Revisá los campos marcados antes de continuar.";

            feedback.classList.add("error");
            feedback.hidden = false;

            const firstInvalid = form.querySelector(".is-invalid");

            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        // Si todo está correcto, muestra una confirmación de demostración.
        feedback.classList.remove("error");

        feedback.textContent =
            "Formulario Enviado. Muchas Gracias por contactarnos";

        feedback.hidden = false;
    });

    // Inicializa el contador de caracteres.
    updateMessageCounter();

});