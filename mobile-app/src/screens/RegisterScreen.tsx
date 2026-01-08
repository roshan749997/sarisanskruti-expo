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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { signIn } = useAuth();
  const { colors, darkMode } = useTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
    agreeToTerms: false,
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
    // Validate form fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError(t('fill_all_fields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwords_no_match'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('password_short'));
      return;
    }

    if (!formData.agreeToTerms) {
      setError(t('agree_terms_err'));
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const passwordHash = formData.password;

      await api.sendOTP({
        phone: formData.phone,
        purpose: 'signup',
        userData: {
          name,
          email: formData.email,
          passwordHash,
        },
      });

      setSuccess(t('otp_sent'));
      setOtpSent(true);
      setOtpTimer(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!otpSent) {
      await handleSendOTP();
      return;
    }

    if (!formData.otp) {
      setError(t('otp_placeholder'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwords_no_match'));
      return;
    }

    setLoading(true);
    try {
      const resp = await api.verifyOTPSignup({
        phone: formData.phone,
        otp: formData.otp,
      });

      setSuccess('Account created successfully');

      // Auto-login after successful registration
      if (resp?.token) {
        await signIn(resp.token);
        navigation.navigate('MainTab', { screen: 'Home' });
      } else {
        navigation.navigate('Login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
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
            <Text style={[styles.title, { color: colors.text }]}>{t('register_title')}</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Join us to discover stylish kurtas and kurtis with exclusive offers</Text>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>{success}</Text> : null}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('first_name')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t('first_name')}
                  placeholderTextColor={colors.subText}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('last_name')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t('last_name')}
                  placeholderTextColor={colors.subText}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.subText }]}>{t('email_label')}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                placeholder={t('email_placeholder')}
                placeholderTextColor={colors.subText}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.subText }]}>{t('phone_label')}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                placeholder={t('phone_placeholder')}
                placeholderTextColor={colors.subText}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!otpSent}
              />
              {otpSent && (
                <Text style={styles.otpSentText}>✓ {t('otp_sent')}</Text>
              )}
            </View>

            {otpSent && (
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('otp_placeholder')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t('otp_placeholder')}
                  placeholderTextColor={colors.subText}
                  value={formData.otp}
                  onChangeText={(text) => setFormData({ ...formData, otp: text })}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                {otpTimer > 0 && (
                  <Text style={styles.timerText}>Resend OTP in {otpTimer} seconds</Text>
                )}
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('password_label')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t('password_placeholder')}
                  placeholderTextColor={colors.subText}
                  value={formData.password}
                  onChangeText={(text) => setFormData({ ...formData, password: text })}
                  secureTextEntry
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: colors.subText }]}>{t('confirm_password')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                  placeholder={t('confirm_password')}
                  placeholderTextColor={colors.subText}
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setFormData({ ...formData, agreeToTerms: !formData.agreeToTerms })}
            >
              <View style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]}>
                {formData.agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                {t('agree_terms')}
              </Text>
            </TouchableOpacity>

            {!otpSent ? (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>{t('send_otp')}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>{t('register_title')}</Text>
                  )}
                </TouchableOpacity>
                {otpTimer === 0 && (
                  <TouchableOpacity
                    style={[styles.secondaryButton, { marginTop: 8 }]}
                    onPress={handleSendOTP}
                    disabled={loading}
                  >
                    <Text style={styles.secondaryButtonText}>{t('resend_otp')}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.subText }]}>{t('already_have_account')} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>{t('login_title')}</Text>
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
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  header: {
    marginBottom: 20,
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
    paddingHorizontal: 20,
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
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
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
  otpSentText: {
    fontSize: 11,
    color: '#16a34a',
    marginTop: 4,
  },
  timerText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 8,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#f43f5e',
    borderColor: '#f43f5e',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  linkInline: {
    color: '#f43f5e',
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
    borderColor: '#f43f5e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#f43f5e',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 13,
  },
  linkText: {
    color: '#f43f5e',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default RegisterScreen;


