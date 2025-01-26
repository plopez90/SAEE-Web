const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');
app.set('views', './views');

const PORT = process.env.PORT;
const THINGSBOARD_HOST = process.env.THINGSBOARD_HOST;
const THINGSBOARD_DEVICE_ID = process.env.THINGSBOARD_DEVICE_ID;
const THINGSBOARD_URL_DEVICE = `${THINGSBOARD_HOST}/api/plugins/telemetry/DEVICE/${THINGSBOARD_DEVICE_ID}/values/timeseries`;
const THINGSBOARD_URL_LOGIN = `${THINGSBOARD_HOST}/api/auth/login`;
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

// Variable para almacenar el token y su tiempo de expiración
let accessToken = null;
let tokenExpiration = null;

// Iniciar el servidor
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app; // Exporta la app para poder ser utilizada en los tests

app.get('/estacionamiento', async (req, res) => {
    try {
        // Verifica si el token es válido o si necesita ser renovado
        if (!accessToken || isTokenExpired()) {
            console.log('Obteniendo un nuevo token...');
            accessToken = await getAccessToken();
        }

        if (!accessToken) {
            return res.status(500).send('No se pudo obtener el acces token');
        }

        // Solicitud a ThingsBoard
        const response = await axios.get(THINGSBOARD_URL_DEVICE, {
            headers: {
                "X-Authorization": `Bearer ${accessToken}`
            }
        });

        const parkingSpots = response.data; // Obtener los datos
        
        const data = {};
        // Iterar sobre cada clave en parkingSpots
        Object.keys(parkingSpots).forEach(spot => {
            const spotNumber = spot.match(/\d+$/); // Extrae el número al final de la clave
            const status = parkingSpots[spot][0].value === 'true' ? 'ocupado' : 'disponible'; // Asigna estado basado en el valor
            data[`Lugar n° ${spotNumber}`] = status; // Formato deseado
        });

        // Renderizar la vista con los datos
        res.render('status', { data });
    } catch (error) {
        console.error('Error al obtener datos:', error);
        res.status(500).send('Error al obtener datos');
    }
});

async function getAccessToken() {
    try {
        const response = await axios.post(THINGSBOARD_URL_LOGIN, {
            username: USER_NAME,
            password: PASSWORD
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        tokenExpiration = Date.now() + 9000000; // 9.000.000 ms = 2.5 horas
        return response.data.token;
    } catch (error) {
        console.error('Error al obtener el token:', error);
        return null; // Devuelve null en caso de error
    }
}

function isTokenExpired() {
    return !tokenExpiration || Date.now() >= tokenExpiration;
}
