import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (email: string, password: string) => {
    const user = {
      nombre: 'Miguel',
      apellido: 'Carvajal',
      _id: '123',
      rol: 'bodeguero',
      email: 'miguel@correo.com'
    };
    await AsyncStorage.setItem('token', 'fake-token');
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return {
      token: 'fake-token',
      user
    };
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
  getProfile: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No hay token');
    }
    return {
      nombre: 'Miguel',
      apellido: 'Carvajal',
      rol: 'bodeguero',
      email: 'miguel@correo.com'
    };
  }
};

const mockPost = jest.fn();
const mockGet = jest.fn();
const mockPut = jest.fn();

const api = {
  post: mockPost,
  get: mockGet,
  put: mockPut,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};

export default api; 