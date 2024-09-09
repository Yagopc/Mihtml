const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const itemsPath = path.join(__dirname, 'items.json');

// Obtener la lista de artículos
app.get('/items', (req, res) => {
    fs.readFile(itemsPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer los artículos');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Guardar todos los artículos
app.post('/items', (req, res) => {
    const items = req.body;
    fs.writeFile(itemsPath, JSON.stringify(items, null, 2), (err) => {
        if (err) {
            res.status(500).send('Error al guardar los artículos');
            return;
        }
        res.send('Artículos guardados correctamente');
    });
});

// Eliminar un artículo
app.delete('/items/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    fs.readFile(itemsPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer los artículos');
            return;
        }

        const items = JSON.parse(data);
        if (index >= 0 && index < items.length) {
            items.splice(index, 1);
            fs.writeFile(itemsPath, JSON.stringify(items, null, 2), (err) => {
                if (err) {
                    res.status(500).send('Error al guardar los artículos');
                    return;
                }
                res.send('Artículo eliminado correctamente');
            });
        } else {
            res.status(400).send('Índice de artículo inválido');
        }
    });
});

// Modificar un artículo
app.put('/items/:index', (req, res) => {
    const index = parseInt(req.params.index, 10);
    const nuevoTexto = req.body.nuevoTexto;

    fs.readFile(itemsPath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error al leer los artículos');
            return;
        }

        const items = JSON.parse(data);
        if (index >= 0 && index < items.length) {
            items[index] = nuevoTexto;
            fs.writeFile(itemsPath, JSON.stringify(items, null, 2), (err) => {
                if (err) {
                    res.status(500).send('Error al guardar los artículos');
                    return;
                }
                res.send('Artículo modificado correctamente');
            });
        } else {
            res.status(400).send('Índice de artículo inválido');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});