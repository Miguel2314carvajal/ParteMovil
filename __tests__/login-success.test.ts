import { authService } from '../services/api';
describe('Login Exitoso', () => {
  it('login exitoso con credenciales correctas', async () => {
    const mockResponse = {
      token: 'fake-token',
      nombre: 'Miguel',
      apellido: 'Carvajal',
      _id: '123',
      rol: 'bodeguero',
      email: 'miguel@correo.com'
    };
    // No se necesita mock, el mock manual ya implementa la lógica
    const result = await authService.login('miguel@correo.com', '1234');
    expect(result).toEqual({
      token: 'fake-token',
      user: {
        nombre: 'Miguel',
        apellido: 'Carvajal',
        _id: '123',
        rol: 'bodeguero',
        email: 'miguel@correo.com'
      }
    });
  });
}); 