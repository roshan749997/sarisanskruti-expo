import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, darkMode } = useTheme();
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            setLoading(true);
            await api.forgotPassword(email);
            setSuccess(true);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.center}>
                        <Ionicons name="checkmark-circle-outline" size={80} color="green" />
                        <Text style={[styles.successTitle, { color: colors.text }]}>{t('check_email')}</Text>
                        <Text style={[styles.successText, { color: colors.subText }]}>{t('reset_link_sent_msg')} {email}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.button}>
                            <Text style={styles.buttonText}>{t('back_to_login')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>{t('forgot_password')}</Text>
                        <Text style={[styles.subtitle, { color: colors.subText }]}>{t('forgot_password_subtitle')}</Text>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.subText }]}>{t('email_label')}</Text>
                            <TextInput
                                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                                placeholder={t('email_placeholder')}
                                placeholderTextColor={colors.subText}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.disabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>{t('send_reset_link')}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    backBtn: {
        padding: 5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 30,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#000',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabled: {
        backgroundColor: '#666',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    successText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 30,
    },
});

export default ForgotPasswordScreen;
