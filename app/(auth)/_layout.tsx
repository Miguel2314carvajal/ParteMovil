import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useSegments, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
} 