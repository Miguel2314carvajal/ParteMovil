import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Forzar el uso del mock manual
jest.mock('../services/api', () => require('../__mocks__/services/api'));

describe('Almacenamiento en AsyncStorage', () => {
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
}); 