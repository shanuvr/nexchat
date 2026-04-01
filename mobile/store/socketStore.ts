import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './tokenStore';

let socket: Socket | null = null;
const SOCKET_URL = 'http://192.168.1.6:3005'; // Machine IP to allow device connections

export const connectSocket = async () => {
  if (socket?.connected) return socket;

  const token = await getAccessToken();
  if (!token) return null;

  socket = io(SOCKET_URL, {
    auth: async (cb) => {
      const token = await getAccessToken();
      cb({ token });
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to Socket Service');
  });

  socket.on('connect_error', async (error) => {
    console.error('❌ Socket Connection Error:', error.message);
    
    // If token is invalid, we might need to force a refresh or logout
    if (error.message === 'Invalid token' || error.message === 'Unauthorized') {
      console.log('🔄 Token invalid for socket, the next API request should trigger a refresh...');
      // We don't manually refresh here to avoid circular dependencies, 
      // but the next time the user performs an action, the API interceptor will fix it.
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('⚠️ Disconnected from Socket Service:', reason);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
