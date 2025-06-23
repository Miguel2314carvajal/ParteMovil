import { authService } from '../services/api';
describe('Perfil Exitoso', () => {
  it('getProfile retorna datos del usuario autenticado', async () => {
    const result = await authService.getProfile();
    expect(result).toEqual({
      nombre: 'Miguel',
      apellido: 'Carvajal',
      rol: 'bodeguero',
      email: 'miguel@correo.com'
    });
  });
}); 