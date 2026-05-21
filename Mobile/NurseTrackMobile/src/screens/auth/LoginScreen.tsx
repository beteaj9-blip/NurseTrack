import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Easing, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Switch, ScrollView, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { CitLogo } from '../../components/CitLogo';
import { AppLoadingScreen } from '../../components/AppLoadingScreen';
import { SlideUpView } from '../../components/SlideUpView';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen = ({ navigation }: Props) => {
  const screenHeight = Dimensions.get('window').height;
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessTransition, setShowSuccessTransition] = useState(false);
  const [formMessage, setFormMessage] = useState("Enter your account details to continue.");
  const [isError, setIsError] = useState(false);
  const transitionY = useRef(new Animated.Value(screenHeight)).current;
  
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!userId || !password) {
      setIsError(true);
      setFormMessage("Please enter your School ID / email and password.");
      return;
    }

    const playSuccessTransition = async () => {
      transitionY.setValue(screenHeight);
      setShowSuccessTransition(true);
      await new Promise<void>((resolve) => {
        Animated.timing(transitionY, {
          toValue: 0,
          duration: 560,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => resolve());
      });
      await new Promise((resolve) => setTimeout(resolve, 900));
    };

    try {
      setIsLoading(true);
      setIsError(false);
      setFormMessage("Signing you in...");
      await login({ userId, password }, playSuccessTransition);
    } catch (error: any) {
      setShowSuccessTransition(false);
      transitionY.setValue(screenHeight);
      setIsError(true);
      if (error.response?.status === 401) {
        setFormMessage("Invalid credentials. Please check your ID/email and password.");
      } else {
        setFormMessage("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8A252C" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
          
          {/* Top Maroon Section */}
          <SlideUpView delay={0} duration={520}>
            <View style={styles.topSection}>
              <View style={styles.logoContainer}>
                <CitLogo size={42} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.logoSuperText}>CIT-U NURSING PORTAL</Text>
                  <Text style={styles.logoText}>NurseTrack</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>Clinical tracking made organized and secure.</Text>
              <Text style={styles.heroSubtitle}>Manage duty hours, case records, schedules, approvals, and student progress from one reliable portal.</Text>
              
              <View style={styles.pillsContainer}>
                {['Duty hours', 'Case logs', 'Schedules', 'Approvals'].map((item) => (
                  <View key={item} style={styles.pill}>
                    <Text style={styles.pillText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          </SlideUpView>

          {/* Bottom White Sheet */}
          <SlideUpView delay={240} duration={680}>
            <View style={styles.bottomSheet}>
              <View style={styles.headerContainer}>
                <Text style={styles.superTitle}>WELCOME BACK</Text>
                <Text style={styles.title}>Login to your account</Text>
              </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>School email or ID number</Text>
              <TextInput
                style={styles.input}
                placeholder="student@cit.edu or 12-3456-789"
                placeholderTextColor="#9CA3AF"
                value={userId}
                onChangeText={setUserId}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View style={styles.optionsContainer}>
                <View style={styles.rememberContainer}>
                  <Switch
                    trackColor={{ false: '#e4e7ec', true: '#8A252C' }}
                    thumbColor="#fff"
                    ios_backgroundColor="#e4e7ec"
                    onValueChange={setRemember}
                    value={remember}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <Text style={styles.rememberText}>Keep me signed in</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.statusBox, isError ? styles.statusBoxError : styles.statusBoxInfo]}>
                <Text style={[styles.statusText, isError ? styles.statusTextError : styles.statusTextInfo]}>
                  {formMessage}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign in</Text>
                )}
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLink}>Create account</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </SlideUpView>
        </ScrollView>
      </KeyboardAvoidingView>
      {showSuccessTransition && (
        <Animated.View style={[styles.successTransition, { transform: [{ translateY: transitionY }] }]}>
          <AppLoadingScreen />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A252C',
  },
  successTransition: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8A252C',
    zIndex: 20,
    elevation: 20,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: '#8A252C',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 12,
  },
  logoSuperText: {
    color: '#FFD700', // Gold color typical for CIT
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 16,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 8,
    marginRight: 8,
  },
  pillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  superTitle: {
    color: '#8A252C',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  title: {
    color: '#202124',
    fontSize: 24,
    fontWeight: '800',
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#101828',
    backgroundColor: '#ffffff',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#667085',
    fontSize: 14,
    marginLeft: 4,
  },
  forgotPasswordLink: {
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '800',
  },
  statusBox: {
    minHeight: 42,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 18,
  },
  statusBoxInfo: {
    borderColor: '#e4e7ec',
    backgroundColor: '#f9fafb',
  },
  statusBoxError: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusTextInfo: {
    color: '#667085',
  },
  statusTextError: {
    color: '#991b1b',
  },
  loginButton: {
    backgroundColor: '#8A252C',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#667085',
    fontSize: 14,
  },
  registerLink: {
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LoginScreen;
