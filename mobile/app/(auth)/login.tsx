import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/axios/api';
import { saveTokens } from '@/store/tokenStore';
import Toast from "react-native-toast-message";
import { useMutation } from '@tanstack/react-query';

export default function LoginScreen() {
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);


    const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

function handleLogin() {
  mutate({ email, password });
}

const { mutate, isPending } = useMutation({
  mutationFn: async ({ email, password }: { email: string; password: string }) => {
    const res = await api.post('/api/auth/login', { email, password });
    return res.data;
  },

  onSuccess: async (data) => {
    console.log('LOGIN SUCCESS:', data);

    await saveTokens(
      data.accessToken,
      data.refreshToken,
      data.userId
    );
      Toast.show({
    type: 'success',
    text1: 'Login Successful',
    text2: 'Welcome back 👋',
  });

    router.replace('/(tabs)');
  },

 onError: (error: any) => {
  console.log('LOGIN ERROR:', error);

  const message =
    error?.response?.data?.message || 'Something went wrong';

  Toast.show({
    type: 'error',
    text1: 'Login Failed',
    text2: message,
  });
}
});

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
            <LinearGradient
              colors={['#4b4bc6', '#6466e1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconContainer}
            >
              <MaterialIcons name="chat-bubble" size={32} color="#ffffff" />
            </LinearGradient>
            <Text style={styles.title}>Next Chat</Text>
            <Text style={styles.subtitle}>Connect with your world in a space designed for clarity.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            
            {/* Email Input */}
            <View style={[styles.inputGroup, emailFocus && styles.inputGroupFocused]}>
              <MaterialIcons 
                name="mail" 
                size={20} 
                color={emailFocus ? '#4b4bc6' : '#46455380'} 
                style={styles.inputIconLeft} 
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#46455399"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                onChangeText={setEmail}
              />
            </View>

            {/* Password Input */}
            <View style={[styles.inputGroup, passwordFocus && styles.inputGroupFocused]}>
              <MaterialIcons 
                name="lock" 
                size={20} 
                color={passwordFocus ? '#4b4bc6' : '#46455380'} 
                style={styles.inputIconLeft} 
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#46455399"
                secureTextEntry={!passwordVisible}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.inputIconRight}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <MaterialIcons 
                  name={passwordVisible ? "visibility" : "visibility-off"} 
                  size={20} 
                  color="#46455380" 
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            {/* Login Button */}
            <TouchableOpacity onPress={() => handleLogin()} style={{width: '100%'}}>
              <LinearGradient
                colors={['#4b4bc6', '#6466e1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>
  {isPending ? 'Logging in...' : 'Login'}
</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9RW1no3TXkapFoYHJYSsFoB__dWd1cnKy2cx2r-DKzVrc4mBrc6xcJjfQNT7rNVRz0FBF9De_KoEB9LGX7aqYf4-Na3ZrQTdN0pRHGPxq9JEOg8Kjk4Dzdigcmd7kSUC87ZYlVbFgLDauv1uYfgbW9CyR_51L-zX1RbYZSDllVG3e49drUUZaC4wb2hjlSi9kVb_1-VW6N6xXF0S-Q1KUyOsShaXHhfUSedS781xGhNe0RNly_IFllQjBfNCgP_2hyyRqW_-u9ik' }} 
                style={styles.socialIcon} 
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaL-jYbFPnrgGZvRZQJbIJ1DnGslD3s1lercqtcflUdIvEr8TMnI8XC6QK_zRo1qdiyt42_m1eUlMaA3yut-X-ZAi6_7ydx04ndNDcPHHMHNvTmvqF4NZmgaRbw_qvnaf8bZHaRb_L_dNtGLolq3F007BzA67rT4knZCC6LxD0Q9KQ6PoTfKcUcOjZbz4DnokXuWowisNYd-ouwA_93L6WiRdxyD_2mSsyDUTuRiiRMM_Y5E5UEvXO2uZcDrt6Midak5hSzoSz040' }} 
                style={[styles.socialIcon, {opacity: 0.8}]} 
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>New to Next Chat? </Text>
            <Link href="./register" asChild>
              <TouchableOpacity>
                <Text style={styles.createAccountText}>Create Account</Text>
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
    top: 48,
    left: -80,
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(75, 75, 198, 0.05)',
  },
  blobBottomRight: {
    position: 'absolute',
    bottom: -48,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(100, 102, 225, 0.05)',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1c1d',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#464553',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f4',
    borderRadius: 16,
    height: 56,
    marginBottom: 16,
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
  inputIconRight: {
    marginLeft: 12,
    padding: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1a1c1d',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingRight: 4,
  },
  forgotPasswordText: {
    color: '#4b4bc6',
    fontSize: 12,
    fontWeight: '600',
  },
  loginButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 6,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8e8e9',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(70, 69, 83, 0.4)',
    letterSpacing: 1.5,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  socialButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(199, 197, 214, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#464553',
  },
  createAccountText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b4bc6',
  }
});
