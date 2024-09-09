let items = [];
let nuevosItems = [];

async function cargarItems() {
    const response = await fetch('/items');
    items = await response.json();
    mostrarLista();
}

function mostrarLista() {
    const listaDiv = document.getElementById('lista');
    listaDiv.innerHTML = '';
    items.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `item-${index}`;
        checkbox.onclick = () => seleccionarArticulo(index);
        const label = document.createElement('label');
        label.htmlFor = `item-${index}`;
        label.textContent = item;
        label.contentEditable = true;
        label.onblur = () => modificarItem(index, label.textContent);
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.onclick = () => eliminarItem(index);
        itemDiv.appendChild(checkbox);
        itemDiv.appendChild(label);
        itemDiv.appendChild(deleteButton);
        listaDiv.appendChild(itemDiv);
    });

    // Marcar los elementos seleccionados previamente
    const listaGuardada = JSON.parse(localStorage.getItem('listaGuardada')) || [];
    listaGuardada.forEach((item) => {
        const index = items.indexOf(item);
        if (index !== -1) {
            document.getElementById(`item-${index}`).checked = true;
        }
    });
}

function mostrarCompra() {
    const listaGuardada = JSON.parse(localStorage.getItem('listaGuardada')) || [];
    const listaDiv = document.getElementById('lista');
    listaDiv.innerHTML = '';

    if (listaGuardada.length === 0) {
        listaDiv.innerHTML = '<p>Lista vacía</p>';
    } else {
        items.forEach((item, index) => {
            if (listaGuardada.includes(item)) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `compra-${index}`;
                checkbox.checked = true;
                checkbox.onclick = () => seleccionarArticulo(index);
                const label = document.createElement('label');
                label.htmlFor = `compra-${index}`;
                label.textContent = item;
                label.contentEditable = true;
                label.onblur = () => modificarItemGuardado(index, label.textContent);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Eliminar';
                deleteButton.onclick = () => eliminarItem(index);
                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(label);
                itemDiv.appendChild(deleteButton);
                listaDiv.appendChild(itemDiv);
            }
        });
    }
}

async function modificarItem(index, nuevoTexto) {
    items[index] = nuevoTexto;
    await fetch(`/items/${index}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nuevoTexto }),
    });
}

async function eliminarItem(index) {
    await fetch(`/items/${index}`, {
        method: 'DELETE',
    });
    items.splice(index, 1);
    mostrarLista();
}

function buscarArticulo() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const listaDiv = document.getElementById('lista');
    listaDiv.innerHTML = '';
    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
        if (item.toLowerCase().includes(searchInput)) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `item-${index}`;
            checkbox.onclick = () => seleccionarArticulo(index);
            const label = document.createElement('label');
            label.htmlFor = `item-${index}`;
            label.textContent = item;
            label.contentEditable = true;
            label.onblur = () => modificarItem(index, label.textContent);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = () => eliminarItem(index);
            itemDiv.appendChild(checkbox);
            itemDiv.appendChild(label);
            itemDiv.appendChild(deleteButton);
            fragment.appendChild(itemDiv);
        }
    });
    listaDiv.appendChild(fragment);

    // Marcar los elementos seleccionados previamente
    const listaGuardada = JSON.parse(localStorage.getItem('listaGuardada')) || [];
    listaGuardada.forEach((item) => {
        const index = items.indexOf(item);
        if (index !== -1) {
            document.getElementById(`item-${index}`).checked = true;
        }
    });

    // Marcar los elementos seleccionados en la búsqueda
    items.forEach((item, index) => {
        const checkbox = document.getElementById(`item-${index}`);
        if (checkbox && checkbox.checked) {
            seleccionarArticulo(index);
        }
    });
}

function seleccionarArticulo(index) {
    const checkbox = document.getElementById(`item-${index}`) || document.getElementById(`compra-${index}`);
    if (checkbox.checked) {
        const seleccionados = JSON.parse(localStorage.getItem('listaGuardada')) || [];
        if (!seleccionados.includes(items[index])) {
            seleccionados.push(items[index]);
            localStorage.setItem('listaGuardada', JSON.stringify(seleccionados));
        }
    } else {
        let seleccionados = JSON.parse(localStorage.getItem('listaGuardada')) || [];
        seleccionados = seleccionados.filter(item => item !== items[index]);
        localStorage.setItem('listaGuardada', JSON.stringify(seleccionados));
    }
}

function modificarItemGuardado(index, nuevoTexto) {
    const listaGuardada = JSON.parse(localStorage.getItem('listaGuardada')) || [];
    listaGuardada[index] = nuevoTexto;
    localStorage.setItem('listaGuardada', JSON.stringify(listaGuardada));
}

function añadirArticulo() {
    const nuevoArticulo = prompt('Introduce el nuevo artículo:');
    if (nuevoArticulo) {
        nuevosItems.push(nuevoArticulo);
        mostrarLista();
    }
}

async function guardarTodos() {
    try {
        // Combinar los artículos existentes con los nuevos
        const todosLosItems = [...items, ...nuevosItems];

        // Ordenar los artículos alfabéticamente
        todosLosItems.sort((a, b) => a.localeCompare(b));

        // Guardar los artículos en el servidor
        await fetch('/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(todosLosItems),
        });

        // Limpiar la lista de nuevos artículos
        nuevosItems = [];
        alert('Todos los artículos se han guardado correctamente.');
    } catch (error) {
        console.error('Error al guardar todos los artículos:', error);
    }
}

function enviarLista() {
    const listaDiv = document.getElementById('lista');
    const labels = listaDiv.getElementsByTagName('label');
    let listaGuardada = [];

    // Recopilar todos los elementos visibles de la lista
    for (let label of labels) {
        if (label.textContent && label.textContent.trim() !== '') {
            listaGuardada.push(label.textContent.trim());
        }
    }

    if (listaGuardada.length === 0) {
        alert('La lista está vacía.');
        return;
    }

    const listaTexto = listaGuardada.join('\n');
    const mensaje = encodeURIComponent(`Lista de la compra:\n\n${listaTexto}`);

    const opciones = `
        <div>
            <button onclick="window.location.href='mailto:?subject=Lista de la compra&body=${mensaje}'">Enviar por Email</button>
            <button onclick="window.location.href='https://wa.me/?text=${mensaje}'">Enviar por WhatsApp</button>
        </div>
    `;

    const dialogo = document.createElement('div');
    dialogo.innerHTML = opciones;
    document.body.appendChild(dialogo);
}

function guardarCompra() {
    const listaGuardada = JSON.parse(localStorage.getItem('listaGuardada')) || [];
    if (listaGuardada.length === 0) {
        alert('La lista está vacía.');
        return;
    }

    const fecha = new Date();
    const dia = fecha.getDate();
    const mes = fecha.getMonth() + 1; // Los meses son indexados desde 0
    const anio = fecha.getFullYear();
    const nombreArchivo = `compra_${dia}-${mes}-${anio}.json`;

    const blob = new Blob([JSON.stringify(listaGuardada, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function limpiarLista() {
    const confirmacion = confirm('¿Estás seguro de que deseas borrar la lista? Esta acción no se puede deshacer.');

    if (confirmacion) {
        localStorage.removeItem('listaGuardada');
        mostrarCompra();
        alert('Lista borrada correctamente.');
    } else {
        alert('Acción cancelada. La lista no ha sido borrada.');
    }
}

function cargarLista1() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const text = await file.text();
            const listaGuardada = JSON.parse(text);
            localStorage.setItem('listaGuardada', JSON.stringify(listaGuardada));
            mostrarCompra();
            alert('Lista cargada correctamente.');
        }
    };
    input.click();
}

function mostrarMas() {
    document.getElementById('botonesExtra').classList.remove('hidden');
    document.getElementById('btnMas').classList.add('hidden');
}

function mostrarMenos() {
    document.getElementById('botonesExtra').classList.add('hidden');
    document.getElementById('btnMas').classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    cargarItems().then(() => {
        mostrarCompra();
    });
});