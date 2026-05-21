import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { useAuth } from '../context/AuthContext';
import { AppLoadingScreen } from '../components/AppLoadingScreen';
import { Animated, StyleSheet } from 'react-native';

export const AppNavigator = () => {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [prevUser, setPrevUser] = useState(user);

  if (user !== prevUser) {
    setPrevUser(user);
    if (!prevUser && user) {
      setShowSplash(true);
      fadeAnim.setValue(1);
    }
  }

  useEffect(() => {
    if (!isLoading && showSplash) {
      // Wait 600ms after load is done:
      //   - AppLoadingScreen uses this time to animate the bar from ~80–92% → 100%
      //   - Then fade out the splash overlay over 600ms
      const delay = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      }, 600);

      return () => clearTimeout(delay);
    }
  }, [isLoading, showSplash, fadeAnim]);

  return (
    <>
      <NavigationContainer>
        {user ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      {showSplash && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: fadeAnim, zIndex: 9999, elevation: 9999 }]}
          pointerEvents={isLoading ? 'auto' : 'none'}
        >
          <AppLoadingScreen isLoaded={!isLoading} />
        </Animated.View>
      )}
    </>
  );
};
