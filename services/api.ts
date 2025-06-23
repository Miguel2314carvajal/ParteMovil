import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Usar la URL del backend desplegado en Render
const API_URL = 'https://backendinventario-8ryx.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout de 10 segundos
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error en el interceptor de request:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Error en el interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la respuesta:', error);
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ msg: 'Tiempo de espera agotado. Por favor, verifica tu conexión.' });
    }
    if (!error.response) {
      return Promise.reject({ 
        msg: 'No se pudo conectar con el servidor. Verifica tu conexión o que el servidor esté funcionando.' 
      });
    }
    return Promise.reject(error.response.data);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/gt/login', { email, password });
      const { token, nombre, apellido, _id, rol, email: userEmail } = response.data;
      
      if (!token) {
        throw new Error('Token no encontrado en la respuesta');
      }

      // Crear el objeto user con la estructura correcta
      const user = {
        id: _id,
        nombre: `${nombre} ${apellido}`,
        email: userEmail,
        rol: rol
      };

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      console.error('Error detallado:', error);
      if (error.msg) {
        throw error;
      }
      throw { 
        msg: error.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.' 
      };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getProfile: async () => {
    try {
      const response = await api.get('/gt/perfil');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { mensaje: 'Error al obtener el perfil' };
    }
  }
};

// Primero definimos la interfaz para la categoría
interface Categoria {
  _id: string;
  nombreCategoria: string;
  descripcionCategoria: string;
}

export const productoService = {
  crearProducto: async (productoData: {
    codigoModelo: string;
    codigoSerial: string;
    nombreEquipo: string;
    color: string;
    capacidad: string;
    precio: number;
    tipo: string;
    categoria: string;
  }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Adaptamos los datos al formato que espera el backend
      const dataToSend = {
        codigoModelo: productoData.codigoModelo,
        codigoSerial: productoData.codigoSerial,
        nombreEquipo: productoData.nombreEquipo,
        color: productoData.color,
        capacidad: productoData.capacidad,
        precio: productoData.precio,
        tipo: productoData.tipo,
        categoriaNombre: productoData.categoria,
        estado: "Disponible"
      };

      console.log('Enviando datos al servidor:', dataToSend);
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await api.post('/gt/agregarProducto', dataToSend, config);
      console.log('Respuesta completa del servidor:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      if (error.message === 'No hay token de autenticación') {
        throw { msg: 'Sesión expirada. Por favor, inicie sesión nuevamente.' };
      }
      throw error.response?.data || { mensaje: 'Error al crear el producto' };
    }
  },

  obtenerProductos: async () => {
    try {
      const response = await api.get('/gt/listarProductos');
      console.log('Respuesta de productos:', response.data); // Para debug
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener productos:', error); // Para debug
      throw error.response?.data || { mensaje: 'Error al obtener los productos' };
    }
  },

  obtenerProductoPorCodigo: async (codigo: string) => {
    const response = await api.get(`/gt/listarProducto/${codigo}`);
      return response.data;
  },

  actualizarProducto: async (codigoBarras: string, productoData: any) => {
    try {
      const response = await api.put(`/gt/actualizarProducto/${codigoBarras}`, productoData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { mensaje: 'Error al actualizar el producto' };
    }
  },


  buscarPorCodigoBarras: async (codigoBarras: string) => {
    try {
      const response = await api.get(`/gt/listarProducto/${codigoBarras}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { msg: 'Error al buscar el producto' };
    }
  },
};

export const categoriaService = {
  obtenerCategorias: async () => {
    try {
      const response = await api.get('/gt/listarCategorias');
      console.log('Respuesta de categorías:', response.data); // Para debug
      return response.data; // El backend ya devuelve el array directamente
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      throw error.response?.data || { mensaje: 'Error al obtener las categorías' };
    }
  },

  obtenerCategoriaPorId: async (id: string) => {
    try {
      const response = await api.get(`/gt/listarCategoria/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { mensaje: 'Error al obtener la categoría' };
    }
  }
};

export const accesorioService = {
  crearAccesorio: async (accesorioData: {
    codigoModeloAccs: string;
    nombreAccs: string;
    precioAccs: string;
  }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await api.post('/gt/agregarAccesorio', accesorioData, config);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear accesorio:', error);
      if (error.message === 'No hay token de autenticación') {
        throw { msg: 'Sesión expirada. Por favor, inicie sesión nuevamente.' };
      }
      throw error.response?.data || { mensaje: 'Error al crear el accesorio' };
    }
  },

  obtenerAccesorios: async () => {
    try {
      const response = await api.get('/gt/listarAccesorios');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { mensaje: 'Error al obtener los accesorios' };
    }
  },

  obtenerAccesorioPorCodigo: async (codigo: string) => {
    const response = await api.get(`/gt/listarAccesorio/${codigo}`);
      return response.data;
  },

  actualizarAccesorio: async (codigoBarras: string, accesorioData: any) => {
    try {
      const response = await api.put(`/gt/actualizarAccesorio/${codigoBarras}`, accesorioData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { mensaje: 'Error al actualizar el accesorio' };
    }
  },

  buscarPorCodigoBarras: async (codigoBarras: string) => {
    try {
      const response = await api.get(`/gt/listarAccesorio/${codigoBarras}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { msg: 'Error al buscar el accesorio' };
    }
  },
};

export const stockService = {
  obtenerStockDisponible: async (filtros?: {
    nombre?: string;
    capacidad?: string;
    categoria?: string;
  }) => {
    const response = await api.get('gt/stockDisponible', { params: filtros });
    return response.data;
  },

  buscarProductoPorCodigo: async (codigo: string) => {
    const response = await api.get(`/gt/listarProducto/${codigo}`);
    return response.data.producto;
  },

  buscarAccesorioPorCodigo: async (codigo: string) => {
    const response = await api.get(`/gt/listarAccesorio/${codigo}`);
    return response.data.accesorio;
  }
};

export const visualizacionService = {
  listarMovimientosPorFecha: async (desde: string, hasta: string) => {
    const response = await api.get(`/gt/movimientosBodeguero?desde=${desde}&hasta=${hasta}`);
    return response.data;
  },
  listarProductosPorFecha: async (fechaDesde: string, fechaHasta: string) => {
    const response = await api.get(`/gt/productosBodeguero?desde=${fechaDesde}&hasta=${fechaHasta}`);
    return response.data;
  },
  listarAccesoriosPorFecha: async (fechaDesde: string, fechaHasta: string) => {
    const response = await api.get(`/gt/accesoriosBodeguero?desde=${fechaDesde}&hasta=${fechaHasta}`);
    return response.data;
  },
  listarStockDisponible: async (filtros: { nombre?: string; capacidad?: string; categoria?: string }) => {
    const response = await api.get('/gt/stock', { params: filtros });
    return response.data;
    }
};

export const movimientoService = {
  obtenerAreasUnicas: async () => {
    try {
      const response = await api.get('/gt/areasunicas');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { msg: 'Error al obtener las áreas' };
    }
  },
  
  registrarMovimiento: async (movimientoData: any) => {
    try {
      const response = await api.post('/gt/registrarMovimiento', movimientoData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { msg: 'Error al registrar el movimiento' };
    }
  },

  obtenerMovimientoPorId: async (id: string) => {
    const response = await api.get(`/gt/listarMovimiento/${id}`);
    return response.data;
  },

  buscarPorId: async (id: string) => {
    try {
      const response = await api.get(`/gt/listarMovimiento/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { msg: 'Error al buscar el movimiento' };
    }
  },
};

export const actualizarMovimiento = (id: string, nuevaObservacion: string) =>
  api.put(`/gt/actualizarMovimiento/${id}`, { observacion: nuevaObservacion });

export const ventaService = {
  obtenerVentasPorFechas: async (desde?: string, hasta?: string) => {
    const params = new URLSearchParams();
    if (desde) params.append('desde', desde);
    if (hasta) params.append('hasta', hasta);
    const response = await api.get('/gt/ventas', { params });
    return response.data;
  }
};

export default api; 