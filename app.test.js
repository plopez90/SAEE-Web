const request = require('supertest'); // Para hacer solicitudes HTTP a tu app
const axios = require('axios'); // Importamos axios
jest.mock('axios'); // Mockeamos axios
const app = require('./app'); // Importa tu aplicación Express

describe('GET /estacionamiento', () => {

  it('debería devolver los datos del estacionamiento cuando el token es válido', async () => {
    const mockToken = 'mocked_token';
    const mockParkingData = {
      "spot1": [{ "value": "true" }],
      "spot2": [{ "value": "false" }]
    };

    // Simula la respuesta de axios.get
    axios.get.mockResolvedValueOnce({ data: mockParkingData });
    axios.post.mockResolvedValueOnce({ data: { token: mockToken } });

    // Realiza la solicitud GET
    const response = await request(app).get('/estacionamiento');

    // Verifica que la respuesta sea 200 (OK)
    expect(response.status).toBe(200);
    // Verifica que los datos sean los esperados
    expect(response.text).toContain('Lugar n° 1');
    expect(response.text).toContain('Lugar n° 2');
  });

  it('debería devolver un error 500 si no se puede obtener el token', async () => {
    // Simula el error al obtener el token
    axios.post.mockResolvedValueOnce({ data: null });

    const response = await request(app).get('/estacionamiento');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error al obtener datos');
  });

  it('debería devolver un error 500 si no se puede obtener los datos de estacionamiento', async () => {
    const mockToken = 'mocked_token';

    // Simula el token y un error al obtener los datos de estacionamiento
    axios.post.mockResolvedValueOnce({ data: { token: mockToken } });
    axios.get.mockRejectedValueOnce(new Error('Error al obtener los datos'));

    const response = await request(app).get('/estacionamiento');

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error al obtener datos');
  });

});
