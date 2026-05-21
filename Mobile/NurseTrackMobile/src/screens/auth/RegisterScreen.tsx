import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { CitLogo } from '../../components/CitLogo';
import { SlideUpView } from '../../components/SlideUpView';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const RegisterScreen = ({ navigation }: Props) => {
  const [formData, setFormData] = useState({
    fullName: '',
    schoolId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState("Enter your details to create an account.");
  const [isError, setIsError] = useState(false);
  
  const { register } = useAuth();

  const handleRegister = async () => {
    if (Object.values(formData).some((value) => typeof value === 'string' && value.trim() === '')) {
      setIsError(true);
      setFormMessage("Please fill in all fields to continue.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setIsError(true);
      setFormMessage("Passwords do not match. Please try again.");
      return;
    }

    if (!termsAccepted) {
      setIsError(true);
      setFormMessage("Please confirm that the account details are correct before creating an account.");
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setFormMessage("Creating your account...");
      await register({
        fullName: formData.fullName,
        schoolId: formData.schoolId,
        email: formData.email,
        password: formData.password,
        role: "STUDENT",
      });
    } catch (error: any) {
      setIsError(true);
      setFormMessage(error.response?.data?.message || 'Could not create account. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
            </View>
          </SlideUpView>

          {/* Bottom White Sheet */}
          <SlideUpView delay={200} duration={680}>
            <View style={styles.bottomSheet}>
              <View style={styles.headerContainer}>
                <Text style={styles.superTitle}>GET STARTED</Text>
                <Text style={styles.title}>Create your account</Text>
              </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Dela Cruz"
                placeholderTextColor="#9CA3AF"
                value={formData.fullName}
                onChangeText={(text) => updateForm('fullName', text)}
              />

              <Text style={styles.label}>School ID number</Text>
              <TextInput
                style={styles.input}
                placeholder="12-3456-789"
                placeholderTextColor="#9CA3AF"
                value={formData.schoolId}
                onChangeText={(text) => updateForm('schoolId', text.replace(/[^0-9-]/g, ''))}
                autoCapitalize="none"
                keyboardType="numeric"
              />

              <Text style={styles.label}>School email</Text>
              <TextInput
                style={styles.input}
                placeholder="student@cit.edu"
                placeholderTextColor="#9CA3AF"
                value={formData.email}
                onChangeText={(text) => updateForm('email', text)}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create password"
                placeholderTextColor="#9CA3AF"
                value={formData.password}
                onChangeText={(text) => updateForm('password', text)}
                secureTextEntry
              />

              <Text style={styles.label}>Confirm password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter password"
                placeholderTextColor="#9CA3AF"
                value={formData.confirmPassword}
                onChangeText={(text) => updateForm('confirmPassword', text)}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.termsContainer} 
                onPress={() => setTermsAccepted(!termsAccepted)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>I confirm that the account details are correct.</Text>
              </TouchableOpacity>

              <View style={[styles.statusBox, isError ? styles.statusBoxError : styles.statusBoxInfo, { marginTop: 18 }]}>
                <Text style={[styles.statusText, isError ? styles.statusTextError : styles.statusTextInfo]}>
                  {formMessage}
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.registerButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign in</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </SlideUpView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8A252C',
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
    paddingBottom: 24,
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSuperText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#8A252C',
    borderColor: '#8A252C',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  termsText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
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
  registerButton: {
    backgroundColor: '#8A252C',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#667085',
    fontSize: 14,
  },
  loginLink: {
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default RegisterScreen;
