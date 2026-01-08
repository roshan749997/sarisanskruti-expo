import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();
  const { colors, darkMode } = useTheme();
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // OTP Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0 && interval) {
      clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [otpTimer]);

  const handleSendOTP = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.sendOTP({ phone: formData.phone, purpose: 'signin' });
      setSuccess('OTP sent to your phone number');
      setOtpSent(true);
      setOtpTimer(60);
    } catch (err: any) {
      const friendlyError = err.response?.status === 404
        ? 'Phone number not registered. Please sign up first.'
        : err.response?.status === 400
          ? 'Please enter a valid 10-digit phone number'
          : 'Failed to send OTP. Please try again.';
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const getUserFriendlyError = (error: any): string => {
    // Check if it's an axios error with response
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || '';

      // Handle specific status codes
      switch (status) {
        case 400:
          if (message.toLowerCase().includes('email')) {
            return 'Please enter a valid email address';
          }
          if (message.toLowerCase().includes('password')) {
            return 'Password is required';
          }
          return 'Please check your input and try again';

        case 401:
          if (authMode === 'password') {
            return 'Invalid email or password. Please check and try again.';
          }
          return 'Invalid OTP. Please check and try again.';

        case 404:
          if (authMode === 'password') {
            return 'No account found with this email address. Please sign up first.';
          }
          return 'Phone number not registered. Please sign up first.';

        case 500:
          return 'Server error. Please try again later.';

        default:
          return message || 'Something went wrong. Please try again.';
      }
    }

    // Handle network errors
    if (error.request) {
      return 'Network error. Please check your internet connection.';
    }

    // Handle other errors
    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let resp;

      if (authMode === 'otp') {
        if (!otpSent) {
          await handleSendOTP();
          setLoading(false);
          return;
        }
        resp = await api.verifyOTPSignin({ phone: formData.phone, otp: formData.otp });
      } else {
        resp = await api.signin({ email: formData.email, password: formData.password });
      }

      // Sign in using AuthContext
      if (resp?.token) {
        await signIn(resp.token);
        navigation.navigate('MainTab', { screen: 'Home' });
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>sarisanskruti</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Sign in to your account to continue shopping</Text>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            {/* Auth Mode Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authMode === 'password' && styles.toggleButtonActive
                ]}
                onPress={() => {
                  setAuthMode('password');
                  setOtpSent(false);
                  setError('');
                  setSuccess('');
                }}
              >
                <Text style={[
                  styles.toggleText,
                  authMode === 'password' && styles.toggleTextActive
                ]}>Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  authMode === 'otp' && styles.toggleButtonActive
                ]}
                onPress={() => {
                  setAuthMode('otp');
                  setOtpSent(false);
                  setError('');
                  setSuccess('');
                }}
              >
                <Text style={[
                  styles.toggleText,
                  authMode === 'otp' && styles.toggleTextActive
                ]}>OTP Login</Text>
              </TouchableOpacity>
            </View>

            {authMode === 'password' ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subText }]}>Email Address</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.subText}
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subText }]}>Password</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.subText}
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.subText }]}>Phone Number</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                    placeholder="Enter your 10-digit phone number"
                    placeholderTextColor={colors.subText}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                    maxLength={10}
                    editable={!otpSent}
                  />
                </View>

                {otpSent && (
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: colors.subText }]}>Enter OTP</Text>
                    <TextInput
                      style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={colors.subText}
                      value={formData.otp}
                      onChangeText={(text) => setFormData({ ...formData, otp: text })}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    {otpTimer > 0 && (
                      <Text style={[styles.timerText, { color: colors.subText }]}>Resend OTP in {otpTimer} seconds</Text>
                    )}
                  </View>
                )}
              </>
            )}

            {authMode === 'otp' && !otpSent && (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading || !formData.phone}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            )}

            {(authMode === 'password' || (authMode === 'otp' && otpSent)) && (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>
            )}

            {authMode === 'otp' && otpSent && otpTimer === 0 && (
              <TouchableOpacity
                style={[styles.secondaryButton, { marginTop: 8 }]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.secondaryButtonText}>Resend OTP</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 8 }]}
              onPress={() => navigation.navigate('MainTab', { screen: 'Home' })}
            >
              <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Sign up here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginBottom: 12,
  },
  successText: {
    color: '#16a34a',
    fontSize: 12,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#f43f5e',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
  },
  forgotPassword: {
    fontSize: 13,
    color: '#f43f5e',
    textAlign: 'right',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  linkText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;


