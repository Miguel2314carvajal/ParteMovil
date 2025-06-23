import { authService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Logout', () => {
  it('logout elimina token y datos del usuario', async () => {
    await authService.logout();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
}); 