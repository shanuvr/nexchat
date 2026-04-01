import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, ActivityIndicator, Modal, FlatList, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/axios/api';
import { getUserId } from '@/store/tokenStore';
import { connectSocket, getSocket } from '@/store/socketStore';


export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [searchFocus, setSearchFocus] = useState(false);
  const [activeTab, setActiveTab] = useState('All Chats');
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Safe area padding for the dynamic immersive top bar
  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 20;

  const [userId, setUserId] = useState<string | null>(null);
  const [liveOnlineStatus, setLiveOnlineStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getUserId().then(setUserId);

    const setupSockets = async () => {
      const socket = await connectSocket();
      if (socket) {
        socket.on('user_online', (data: { userId: string }) => {
          setLiveOnlineStatus(prev => ({ ...prev, [data.userId]: true }));
        });

        socket.on('user_offline', (data: { userId: string }) => {
          setLiveOnlineStatus(prev => ({ ...prev, [data.userId]: false }));
        });

        socket.on('new_chat', () => {
          queryClient.invalidateQueries({ queryKey: ['chats'] });
        });
      }
    };

    setupSockets();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('user_online');
        socket.off('user_offline');
      }
    };
  }, []);

  // Search logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        setIsSearching(true);
        try {
          const res = await api.get(`/api/users/search?q=${searchQuery}`);
          setSearchResults(res.data.users || []);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleStartChat = async (targetUserId: string) => {
    try {
      const res = await api.post(`/api/chats/${targetUserId}`);
      const chatId = res.data.chat._id;
      
      // Invalidate chats to show the new one in the list
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      
      setIsSearchModalVisible(false);
      setSearchQuery('');
      setSearchResults([]);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const getMyChats = async () => {
    const res = await api.get('/api/chats'); 
    return res.data;
  };

  const getBulkProfiles = async (userIds: string[]) => {
    if (!userIds.length) return { profiles: [] };
    const res = await api.post('/api/users/bulk', { userIds });
    return res.data;
  };

  const { data: chatData, isLoading: isChatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getMyChats,
  });

  // Extract unique participant IDs from all chats
  const allParticipantIds: string[] = Array.from(new Set(
    chatData?.chats?.flatMap((chat: { participants: string[] }) => chat.participants) || []
  )).filter((id): id is string => typeof id === 'string' && id !== userId);

  const { data: profileData, isLoading: isProfilesLoading } = useQuery({
    queryKey: ['profiles', allParticipantIds],
    queryFn: () => getBulkProfiles(allParticipantIds),
    enabled: !!allParticipantIds.length && !!userId,
  });

  // Create a map for easy profile lookup
  const profileMap = (profileData?.profiles || []).reduce((acc: any, profile: any) => {
    acc[profile.userId] = profile;
    return acc;
  }, {});

  if (isChatsLoading || (isProfilesLoading && !!allParticipantIds.length)) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4b4bc6" />
        <Text style={{ marginTop: 12, color: '#464553' }}>Loading your conversations...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Top App Bar (Overlays everything) */}
      <View style={[styles.topBar, { paddingTop: STATUSBAR_HEIGHT }]}>
        <View style={styles.topBarContent}>
          <View style={styles.topLeft}>
            <View style={styles.userAvatarContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9I6_fTXaZJ4jbKLD2pHk8vKrD8vqKpro-A-7G5kL2w-KCHomSyYyb6eM6nM8r-cJ5vjwVK_yeoeRCWqQMhHSD6jaA3xHPfidqjepPtlYnea7pMvzkGnIeV9wH0zfeTzZXpoj68xQj_uJrs-LLTt7sBQbId5Orn-WIX7xucscGvfwcoow-ryG27rpsBgTi5o1bWqN09Sbmf7qWRtPFSt3GrwN74AjxBxYZvvyWQf90TVg2ruhJg-zDXYV27CZmtOnEtRA-iCtC3cA' }} 
                style={styles.userAvatar} 
              />
            </View>
            <Text style={styles.topBarTitle}>Next Chat</Text>
          </View>
          <TouchableOpacity style={styles.searchIconButton}>
            <MaterialIcons name="search" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: STATUSBAR_HEIGHT + 84 }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, searchFocus && styles.searchBarFocused]}>
            <MaterialIcons name="search" size={20} color="#46455399" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              placeholderTextColor="#46455399"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </View>
        </View>

        {/* Switch-over Tabs */}
        {/* <View style={styles.tabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsContainer}>
              {['All Chats', 'Groups', 'Contacts'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                >
                  <Text style={[styles.tabButtonText, activeTab === tab && styles.tabButtonTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View> */}

        {/* Chat List */}
        <View style={styles.chatListContainer}>
          
          {chatData?.chats?.map((chat: any) => {
            // Find the other participant who isn't the current user
            const otherParticipantId = chat.participants.find((id: string) => id !== userId);
            const otherUser = profileMap[otherParticipantId];

            return (
              <TouchableOpacity
                key={chat._id}
                style={styles.chatItem}
                onPress={() => router.push(`/chat/${chat._id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.chatAvatarContainer}>
                  {otherUser?.avatar ? (
                    <Image
                      source={{ uri: otherUser.avatar }}
                      style={styles.chatAvatar}
                    />
                  ) : (
                    <View style={[styles.chatAvatar, { backgroundColor: '#f3f3f4', alignItems: 'center', justifyContent: 'center' }]}>
                      <MaterialIcons name="person" size={32} color="#46455340" />
                    </View>
                  )}
                  {(liveOnlineStatus[otherParticipantId] ?? otherUser?.isOnline) && (
                    <View style={styles.onlineIndicator} />
                  )}
                </View>

                <View style={styles.chatContent}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.chatName} numberOfLines={1}>
                      {otherUser?.userName || "Unknown User"}
                    </Text>

                    <Text style={styles.chatTime}>
                      {chat.lastMessageAt ? new Date(chat.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                  </View>

                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {chat.lastMessage || 'No messages yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Bottom spacer to pad underneath floating tab bar */}
        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => setIsSearchModalVisible(true)}
      >
        <LinearGradient
          colors={['#4b4bc6', '#6466e1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* New Chat Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSearchModalVisible}
        onRequestClose={() => setIsSearchModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Message</Text>
              <TouchableOpacity 
                onPress={() => {
                  setIsSearchModalVisible(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#464553" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchSection}>
              <View style={styles.modalSearchBar}>
                <MaterialIcons name="search" size={20} color="#46455399" />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search by username..."
                  placeholderTextColor="#46455399"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
                {isSearching && <ActivityIndicator size="small" color="#4b4bc6" />}
              </View>
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.userId}
              contentContainerStyle={styles.resultsList}
              ListEmptyComponent={() => (
                <View style={styles.emptyResults}>
                  {searchQuery.length > 1 ? (
                    <Text style={styles.emptyText}>No users found for "{searchQuery}"</Text>
                  ) : (
                    <Text style={styles.emptyText}>Type a username to start searching</Text>
                  )}
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => handleStartChat(item.userId)}
                >
                  <View style={styles.searchAvatarContainer}>
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.searchAvatar} />
                    ) : (
                      <View style={[styles.searchAvatar, { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }]}>
                        <MaterialIcons name="person" size={24} color="#64748b" />
                      </View>
                    )}
                    {(liveOnlineStatus[item.userId] ?? item.isOnline) && (
                      <View style={[styles.onlineIndicator, { width: 12, height: 12, right: 0, bottom: 0 }]} />
                    )}
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultUsername}>{item.userName || "Unnamed User"}</Text>
                    {item.bio && <Text style={styles.resultBio} numberOfLines={1}>{item.bio}</Text>}
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color="#46455340" />
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
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
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  userAvatar: {
    width: '100%',
    height: '100%',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: -0.5,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  searchSection: {
    marginBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f4',
    borderRadius: 9999,
    paddingHorizontal: 24,
    height: 56,
  },
  searchBarFocused: {
    backgroundColor: '#ffffff',
    shadowColor: '#0d0c22',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 30,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1c1d',
  },
  tabsWrapper: {
    marginBottom: 24,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e8e8e9',
    padding: 6,
    borderRadius: 9999,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 9999,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#464553',
  },
  tabButtonTextActive: {
    color: '#4b4bc6',
  },
  chatListContainer: {
    gap: 8,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginHorizontal: -8,
    borderRadius: 12,
  },
  chatAvatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  chatAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#f9f9fa',
    borderRadius: 8,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1c1d',
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#464553',
  },
  chatMessage: {
    fontSize: 14,
    color: '#464553',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 8,
    zIndex: 40,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 12, 34, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1c1d',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f3f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1c1d',
  },
  resultsList: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f4',
  },
  searchAvatarContainer: {
    marginRight: 16,
  },
  searchAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  resultInfo: {
    flex: 1,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4b4bc6',
    marginBottom: 2,
  },
  resultBio: {
    fontSize: 13,
    color: '#464553',
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#46455399',
    textAlign: 'center',
    fontWeight: '500',
  }
});
