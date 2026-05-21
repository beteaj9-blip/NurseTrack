import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, Dimensions } from 'react-native';
import { CitLogo } from './CitLogo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AppLoadingScreenProps {
  isLoaded?: boolean;
}

export const AppLoadingScreen = ({ isLoaded = false }: AppLoadingScreenProps) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(24)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(14)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(0.4)).current;
  // Track whether the fill-to-100 animation has already been started
  const completedRef = useRef(false);

  useEffect(() => {
    // Staggered entrance
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoTranslateY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Text entrance after logo
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(textTranslateY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    // Progress bar: fills quickly to 80% while data loads, then crawls slowly.
    // When isLoaded becomes true (see second useEffect), it jumps to 100%.
    completedRef.current = false;
    Animated.sequence([
      Animated.timing(progressWidth, { toValue: 0.80, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(progressWidth, { toValue: 0.92, duration: 4000, easing: Easing.out(Easing.quad), useNativeDriver: false }),
    ]).start();

    // Shimmer effect on logo
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Dot pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(dotPulse, { toValue: 0.4, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    return () => {
      // Cleanup handled by component unmount
    };
  }, [logoOpacity, logoTranslateY, textOpacity, textTranslateY, progressWidth, shimmer, dotPulse]);

  // When data finishes loading, sprint the bar to 100%.
  useEffect(() => {
    if (isLoaded && !completedRef.current) {
      completedRef.current = true;
      // Stop the indeterminate crawl and race to 100%.
      progressWidth.stopAnimation(() => {
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isLoaded, progressWidth]);

  const progressBarWidth = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.container}>
      {/* Background subtle pattern */}
      <View style={styles.bgPattern}>
        <View style={[styles.bgCircle, styles.bgCircle1]} />
        <View style={[styles.bgCircle, styles.bgCircle2]} />
      </View>

      {/* Logo section */}
      <Animated.View style={[styles.logoSection, { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }] }]}>
        <View style={styles.logoRing}>
          <View style={styles.logoInner}>
            <CitLogo size={56} />
          </View>
          {/* Shimmer overlay */}
          <Animated.View
            style={[styles.logoShimmer, { transform: [{ translateX: shimmerTranslate }] }]}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      {/* Brand text */}
      <Animated.View style={[styles.brandSection, { opacity: textOpacity, transform: [{ translateY: textTranslateY }] }]}>
        <Text style={styles.brandKicker}>CIT-U NURSING PORTAL</Text>
        <Text style={styles.brandName}>NurseTrack</Text>
        <Text style={styles.brandTagline}>Clinical Duty Management System</Text>
      </Animated.View>

      {/* Progress bar */}
      <Animated.View style={[styles.progressContainer, { opacity: textOpacity }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressBarWidth }]} />
        </View>
      </Animated.View>

      {/* Loading dots */}
      <Animated.View style={[styles.loadingRow, { opacity: textOpacity }]}>
        <Text style={styles.loadingLabel}>Loading</Text>
        <Animated.View style={[styles.loadingDot, { opacity: dotPulse }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dotPulse, marginLeft: 4 }]} />
        <Animated.View style={[styles.loadingDot, { opacity: dotPulse, marginLeft: 4 }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7A1F25',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  bgCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  bgCircle1: {
    width: 320,
    height: 320,
    backgroundColor: 'rgba(138, 37, 44, 0.5)',
    top: -80,
    right: -100,
  },
  bgCircle2: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(104, 25, 32, 0.4)',
    bottom: -60,
    left: -80,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoShimmer: {
    position: 'absolute',
    width: 60,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ skewX: '-20deg' }],
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandKicker: {
    color: '#FFCF01',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  brandTagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  progressContainer: {
    width: 200,
    marginBottom: 24,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: '#FFCF01',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginRight: 8,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFCF01',
  },
});
