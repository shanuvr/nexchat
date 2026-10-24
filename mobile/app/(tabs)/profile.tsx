import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Platform, StatusBar as RNStatusBar, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios/api';
import { clearTokens } from '@/store/tokenStore';
import { disconnectSocket } from '@/store/socketStore';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const res = await api.get('/api/users/profile');
      return res.data.profile;
    }
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;

      // @ts-ignore
      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type,
      });

      const res = await api.put('/api/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      Alert.alert('Success', 'Profile picture updated successfully!');
    },
    onError: (error: any) => {
      console.error('Upload Error:', error);
      Alert.alert('Error', 'Failed to update profile picture.');
    }
  });

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need gallery permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      updateAvatarMutation.mutate(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      await clearTokens();
      disconnectSocket();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 20;

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4b4bc6" />
      </View>
    );
  }

  const profile = profileData;

  return (
    <View style={styles.container}>
      {/* Top Bar Spacer */}
      <View style={[styles.topBar, { paddingTop: STATUSBAR_HEIGHT }]}>
        <View style={styles.topBarContent}>
          <Text style={styles.topBarTitle}>Next Chat</Text>
          <TouchableOpacity style={styles.searchIconButton}>
            <MaterialIcons name="search" size={24} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: STATUSBAR_HEIGHT + 64 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {updateAvatarMutation.isPending ? (
                <View style={[styles.avatarImage, { backgroundColor: '#f3f3f4', alignItems: 'center', justifyContent: 'center' }]}>
                  <ActivityIndicator size="large" color="#4b4bc6" />
                </View>
              ) : profile?.avatar ? (
                <Image 
                  source={{ uri: profile.avatar }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: '#f3f3f4', alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialIcons name="person" size={64} color="#46455340" />
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={handlePickImage}
              disabled={updateAvatarMutation.isPending}
            >
              {updateAvatarMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialIcons name="edit" size={20} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.userName || 'User Name'}</Text>
          <Text style={styles.userTitle}>{profile?.bio || 'No bio provided'}</Text>
        </View>

        {/* Bento Contact Grid */}
        <View style={styles.bentoContainer}>
          <View style={styles.bentoCard}>
            <View style={styles.bentoIconBg}>
              <MaterialIcons name="call" size={24} color="#4b4bc6" />
            </View>
            <View>
              <Text style={styles.bentoLabel}>Phone</Text>
              <Text style={styles.bentoValue}>{profile?.phone || 'Not linked'}</Text>
            </View>
          </View>
          <View style={styles.bentoCard}>
            <View style={styles.bentoIconBg}>
              <MaterialIcons name="mail" size={24} color="#4b4bc6" />
            </View>
            <View>
              <Text style={styles.bentoLabel}>Email</Text>
              <Text style={styles.bentoValue}>{profile?.email || 'Not available'}</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Preferences</Text>
        </View>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIconBg}>
                <MaterialIcons name="notifications" size={20} color="#5e5d6a" />
              </View>
              <Text style={styles.listItemText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e2e2e3', true: '#4b4bc6' }}
              thumbColor="#ffffff"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIconBg}>
                <MaterialIcons name="shield" size={20} color="#5e5d6a" />
              </View>
              <Text style={styles.listItemText}>Privacy & Security</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#c7c5d6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIconBg}>
                <MaterialIcons name="palette" size={20} color="#5e5d6a" />
              </View>
              <Text style={styles.listItemText}>App Theme</Text>
            </View>
            <View style={styles.themeSelector}>
              <Text style={styles.themeLabel}>Light</Text>
              <MaterialIcons name="expand-more" size={16} color="#4b4bc6" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Support</Text>
        </View>
        <View style={styles.listContainer}>
          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIconBg}>
                <MaterialIcons name="help" size={20} color="#5e5d6a" />
              </View>
              <Text style={styles.listItemText}>Help Center</Text>
            </View>
            <MaterialIcons name="open-in-new" size={20} color="#c7c5d6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.listItem}>
            <View style={styles.listItemLeft}>
              <View style={styles.listItemIconBg}>
                <MaterialIcons name="info" size={20} color="#5e5d6a" />
              </View>
              <Text style={styles.listItemText}>About Next Chat</Text>
            </View>
            <Text style={styles.versionText}>v2.4.0</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={24} color="#ba1a1a" />
          <Text style={styles.logoutText}>Logout Account</Text>
        </TouchableOpacity>

        {/* Bottom spacer for custom tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fa',
  },
  topBar: {
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    height: 64,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4b4bc6',
    letterSpacing: -1,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 40,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarContainer: {
    width: 128,
    height: 128,
    borderRadius: 24,
    backgroundColor: '#f3f3f4',
    padding: 4,
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  editButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4b4bc6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1c1d',
    marginTop: 24,
    letterSpacing: -1,
  },
  userTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5e5d6a',
    marginTop: 4,
  },
  bentoContainer: {
    gap: 16,
    marginBottom: 32,
  },
  bentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f4',
    padding: 24,
    borderRadius: 16,
    gap: 16,
  },
  bentoIconBg: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bentoLabel: {
    fontSize: 10,
    color: '#464553',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bentoValue: {
    fontSize: 16,
    color: '#1a1c1d',
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1c1d',
  },
  listContainer: {
    backgroundColor: '#f3f3f4',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listItemIconBg: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1c1d',
  },
  themeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b4bc6',
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#464553',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffdad6',
    padding: 20,
    borderRadius: 16,
    gap: 12,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ba1a1a',
  }
});
