import { isLoggedIn } from '@/store/tokenStore';
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const result = await isLoggedIn();
    setLoggedIn(result);
  };

  if (loggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4b4bc6" />
      </View>
    );
  }

  return loggedIn ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}