import api from '../services/api';
import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('authService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Prueba 1: Login exitoso
  it('login exitoso con credenciales correctas', async () => {
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

  // Prueba 2: Manejo de errores
  it('login fallido con credenciales incorrectas', async () => {
    await expect(authService.login('mal@correo.com', 'mal')).rejects.toThrow();
  });

  // Prueba 3: Almacenamiento de token y datos
  it('almacena token y datos del usuario en AsyncStorage', async () => {
    const user = {
      nombre: 'Miguel',
      apellido: 'Carvajal',
      _id: '123',
      rol: 'bodeguero',
      email: 'miguel@correo.com'
    };
    await authService.login('miguel@correo.com', '1234');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
  });

  // Prueba 4: Cierre de sesión
  it('logout elimina token y datos del usuario', async () => {
    await authService.logout();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });

  // Prueba 5: Obtención de perfil
  it('getProfile retorna datos del usuario autenticado', async () => {
    const result = await authService.getProfile();
    expect(result).toEqual({
      nombre: 'Miguel',
      apellido: 'Carvajal',
      rol: 'bodeguero',
      email: 'miguel@correo.com'
    });
  });

  // Prueba 6: Validación de token para perfil
  it('getProfile falla si no hay token', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    await expect(authService.getProfile()).rejects.toThrow('No hay token');
  });
});
