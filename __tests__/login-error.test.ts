import { authService } from '../services/api';
describe('Login Fallido', () => {
  it('login fallido con credenciales incorrectas', async () => {
    await expect(authService.login('mal@correo.com', 'mal')).rejects.toThrow();
  });
}); 