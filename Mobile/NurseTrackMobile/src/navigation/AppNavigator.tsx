import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '../context/AuthContext';
import { SkeletonPage } from '../components/Skeleton';

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SkeletonPage />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};
