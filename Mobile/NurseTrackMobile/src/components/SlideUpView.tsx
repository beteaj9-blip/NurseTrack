import React, { useCallback, useRef } from 'react';
import { Animated, Easing, ViewStyle, StyleProp } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

interface SlideUpViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * SlideUpView - Replicates the web app's `fadeUp` keyframe animation.
 *
 * Web equivalent:
 *   @keyframes fadeUp {
 *     from { opacity: 0; transform: translateY(18px); }
 *     to   { opacity: 1; transform: translateY(0); }
 *   }
 *
 * Re-plays the animation each time the parent screen gains focus (i.e. every
 * time the user navigates to the screen, not just on the initial mount).
 *
 * Usage:
 *   <SlideUpView delay={0}>   <- hero / page
 *   <SlideUpView delay={100}> <- first card
 *   <SlideUpView delay={200}> <- second card
 */
export const SlideUpView = ({
  children,
  delay = 0,
  duration = 500,
  translateY = 18,
  style,
}: SlideUpViewProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(translateY)).current;

  // useFocusEffect fires each time the screen comes into focus, which covers
  // both the initial mount AND returning to the screen from another route.
  useFocusEffect(
    useCallback(() => {
      // Reset to invisible/offset state before each animation.
      opacity.setValue(0);
      translateYAnim.setValue(translateY);

      // CSS `ease` = cubic-bezier(0.25, 0.1, 0.25, 1.0)
      // Easing.out(Easing.quad) closely approximates the same feel —
      // starts fast, eases to a stop.
      const animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration,
          delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      animation.start();

      // Stop the animation if the screen loses focus mid-animation.
      return () => {
        animation.stop();
      };
    }, [opacity, translateYAnim, duration, delay, translateY])
  );

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
