//Archivo JavaScript principal para la carga de componentes
// Función para cargar componentes de forma dinámica
function cargarComponente(idContenedor, archivoHtml) {
    //hacemos una solicitud fetch para obtener el contenido del archivo HTML
    fetch(archivoHtml)
        //si la solicitud es exitosa, parseamos el contenido como texto
        .then(response => {
            //con .ok verificamos que la respuesta fue exitosa o no (true o fakse).
            if (!response.ok) {
                throw new Error(`No se pudo cargar el archivo ${archivoHtml}`);
            }
            //con .text() obtenemos el contenido del archivo como texto
            return response.text();
        })
        //se recibe el texto plano del archivo HTML y se inserta en el contenedor especificado por su ID
        .then(data => {
            document.getElementById(idContenedor).innerHTML = data;
        })
        // si la solicitud falla, se ejecuta este código para mostrar el error en la consola
        .catch(error => console.error('Error:', error));
}

// Llamamos a la función para cada componente que necesitemos
cargarComponente('header-container', 'componentes/header.html');