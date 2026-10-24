import * as SecureStore from 'expo-secure-store';

export const saveTokens = async (accessToken: string, refreshToken: string, userId: string) => {
  await SecureStore.setItemAsync('accessToken', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  await SecureStore.setItemAsync('userId', userId);
};

export const getAccessToken = async () => {
  return await SecureStore.getItemAsync('accessToken');
};

export const getRefreshToken = async () => {
  return await SecureStore.getItemAsync('refreshToken');
};

export const getUserId = async () => {
  return await SecureStore.getItemAsync('userId');
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userId');
};

export const isLoggedIn = async () => {
  const token = await getAccessToken();
  return token !== null;
};