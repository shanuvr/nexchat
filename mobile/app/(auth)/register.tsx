import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/axios/api';
import { saveTokens } from '@/store/tokenStore';
import Toast from 'react-native-toast-message';
import { useMutation } from '@tanstack/react-query';

export default function RegisterScreen() {
  const [nameFocus, setNameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const { mutate, isPending } = useMutation({
  mutationFn: async ({ name, email, password }: any) => {
    const res = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return res.data;
  },

  onSuccess: async (data) => {
    await saveTokens(
      data.accessToken,
      data.refreshToken,
      data.user._id
    );

    Toast.show({
      type: 'success',
      text1: 'Account Created',
    });

    setTimeout(() => {
      router.replace('/(tabs)');
    }, 1000);
  },

  onError: (error: any) => {
    Toast.show({
      type: 'error',
      text1: 'Register Failed',
      text2: error?.response?.data?.message || 'Something went wrong',
    });
  },
});
function handleRegister() {
  mutate({ name, email, password });
}
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Decorative Ethereal Background Blobs */}
      <View style={styles.blobTopLeft} />
      <View style={styles.blobBottomRight} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.innerContainer}>
          
          {/* Header section */}
          <View style={styles.header}>
            <Text style={styles.title}>Next Chat</Text>
            <Text style={styles.subtitle}>Create your account to start connecting.</Text>
          </View>

          {/* Form Card */}
          <View style={styles.cardContainer}>
            <View style={styles.formContainer}>
              
              {/* Full Name Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={[styles.inputGroup, nameFocus && styles.inputGroupFocused]}>
                  <MaterialIcons 
                    name="person" 
                    size={20} 
                    color={nameFocus ? '#4b4bc6' : '#46455380'} 
                    style={styles.inputIconLeft} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    placeholderTextColor="#46455366"
                    autoCapitalize="words"
                    onFocus={() => setNameFocus(true)}
                    onBlur={() => setNameFocus(false)}
                     onChangeText={setName}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={[styles.inputGroup, emailFocus && styles.inputGroupFocused]}>
                  <MaterialIcons 
                    name="mail" 
                    size={20} 
                    color={emailFocus ? '#4b4bc6' : '#46455380'} 
                    style={styles.inputIconLeft} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="hello@example.com"
                    placeholderTextColor="#46455366"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocus(true)}
                    onBlur={() => setEmailFocus(false)}
                     onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputGroup, passwordFocus && styles.inputGroupFocused]}>
                  <MaterialIcons 
                    name="lock" 
                    size={20} 
                    color={passwordFocus ? '#4b4bc6' : '#46455380'} 
                    style={styles.inputIconLeft} 
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#46455366"
                    secureTextEntry
                    onFocus={() => setPasswordFocus(true)}
                    onBlur={() => setPasswordFocus(false)}
                    onChangeText={setPassword}
                  />
                </View>
              </View>
              
              {/* Register Button */}
              <TouchableOpacity onPress={handleRegister} style={styles.registerButtonContainer}>
                <LinearGradient
                  colors={['#4b4bc6', '#6466e1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.registerButton}
                >
                  <Text style={styles.registerButtonText}>
  {isPending ? 'Creating account...' : 'Register'}
</Text>
                </LinearGradient>
              </TouchableOpacity>
              
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR JOIN WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlu7a0fRXDEqMWOWiBmc2S3Nvhig61nqFbltsFBC9J3vX2-iIJxgcQb65Y00u4aAmWkc3HEafjnq2KJ2D7gQ0tVb3cSh7Hx8GxZfFkY26BK-TMFVb4jUZwks9PTGHCP2sLPw6PNErKRcfmvGZYjJ3se7svnpLCrvOhUNjh5G2JZUGetC7WPa_58BaBBltABe0izGe9JV5yZM7AQYH4a2eD2EbirpuMbgjFaf-_bhrGOrbYLlPHE3jyJNqaG201flPD0wK_f3GR1wg' }} 
                  style={styles.socialIcon} 
                  resizeMode="contain"
                />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaL-jYbFPnrgGZvRZQJbIJ1DnGslD3s1lercqtcflUdIvEr8TMnI8XC6QK_zRo1qdiyt42_m1eUlMaA3yut-X-ZAi6_7ydx04ndNDcPHHMHNvTmvqF4NZmgaRbw_qvnaf8bZHaRb_L_dNtGLolq3F007BzA67rT4knZCC6LxD0Q9KQ6PoTfKcUcOjZbz4DnokXuWowisNYd-ouwA_93L6WiRdxyD_2mSsyDUTuRiiRMM_Y5E5UEvXO2uZcDrt6Midak5hSzoSz040' }} 
                  style={[styles.socialIcon, {opacity: 0.8}]} 
                  resizeMode="contain"
                />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="./login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLinkText}>Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  blobTopLeft: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(75, 75, 198, 0.05)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(100, 102, 225, 0.1)',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    zIndex: 10,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4b4bc6',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5e5d6a',
    opacity: 0.8,
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 24,
    shadowColor: '#0d0c22',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 4,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#464553',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f4',
    borderRadius: 9999,
    height: 56,
    paddingHorizontal: 20,
  },
  inputGroupFocused: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(75, 75, 198, 0.2)',
  },
  inputIconLeft: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1a1c1d',
  },
  registerButtonContainer: {
    width: '100%',
    marginTop: 16,
  },
  registerButton: {
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 6,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(226, 226, 227, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(70, 69, 83, 0.6)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#f3f3f4',
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5e5d6a',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 16,
    color: '#464553',
  },
  loginLinkText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4b4bc6',
  }
});
