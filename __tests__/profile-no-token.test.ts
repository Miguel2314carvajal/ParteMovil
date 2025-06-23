import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Forzar el uso del mock manual
jest.mock('../services/api', () => require('../__mocks__/services/api'));

describe('Perfil sin token', () => {
  it('getProfile falla si no hay token', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    await expect(authService.getProfile()).rejects.toThrow('No hay token');
  });
}); 