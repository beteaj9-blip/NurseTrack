import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

export const AppLoadingScreen = () => {
  const pulse = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    const sweepAnimation = Animated.loop(
      Animated.timing(sweep, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
    );

    pulseAnimation.start();
    sweepAnimation.start();
    return () => {
      pulseAnimation.stop();
      sweepAnimation.stop();
    };
  }, [pulse, sweep]);

  const logoScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1.04] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.24, 0.62] });
  const sweepTranslate = sweep.interpolate({ inputRange: [0, 1], outputRange: [-120, 120] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: logoScale }] }]} />
      <Animated.View style={[styles.brandWrap, { transform: [{ scale: logoScale }] }]}>
        <Text style={styles.brandText}>NurseTrack</Text>
        <View style={styles.underlineTrack}>
          <Animated.View style={[styles.underlineSweep, { transform: [{ translateX: sweepTranslate }] }]} />
        </View>
      </Animated.View>
      <Text style={styles.loadingText}>Preparing your workspace</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A252C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#FFCF01',
  },
  brandWrap: {
    alignItems: 'center',
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    letterSpacing: -1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.18)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 16,
  },
  underlineTrack: {
    width: 164,
    height: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    overflow: 'hidden',
    marginTop: 12,
  },
  underlineSweep: {
    width: 92,
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#FFCF01',
  },
  loadingText: {
    marginTop: 28,
    color: 'rgba(255, 255, 255, 0.84)',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
