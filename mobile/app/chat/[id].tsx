import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/axios/api';
import { getUserId } from '@/store/tokenStore';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useEffect, useRef } from 'react';
import { connectSocket, getSocket } from '@/store/socketStore';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [liveOnlineStatus, setLiveOnlineStatus] = useState<Record<string, boolean>>({});

  const chatId = Array.isArray(id) ? id[0] : id || '';

  const getChatDetails = async () => {
    const res = await api.get(`/api/chats/${chatId}`);
    return res.data;
  };

  const getUserProfile = async (uid: string) => {
    const res = await api.post('/api/users/bulk', { userIds: [uid] });
    return res.data?.profiles?.[0];
  };

  const { data: chatData, isLoading: isChatLoading } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: getChatDetails,
    enabled: !!chatId,
  });

  const otherParticipantId = (chatData?.chat?.participants && userId) 
    ? chatData.chat.participants.find((uid: string) => uid !== userId)
    : null;

  const { data: otherUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', otherParticipantId],
    queryFn: () => getUserProfile(otherParticipantId!),
    enabled: !!otherParticipantId && !!userId,
  });

  useEffect(() => {
    getUserId().then(setUserId);

    const setupSockets = async () => {
      const socket = await connectSocket();
      if (socket) {
        // Join chat room and sync status immediately and on every reconnection
        const syncState = () => {
          console.log('📢 Syncing socket state for:', chatId, 'with participant:', otherParticipantId);
          socket.emit('join_chat', chatId);
          if (otherParticipantId) {
            socket.emit('get_online_status', { userIds: [otherParticipantId] });
          }
        };

        if (socket.connected) {
          syncState();
        }

        socket.on('connect', syncState);

        // Message listener
        socket.on('new_message', (payload: any) => {
          console.log('Real-time message received:', payload);
          // Only invalidate if message belongs to this specific chat
          const incomingChatId = payload.chatId || payload.data?.chatId;
          if (incomingChatId === chatId) {
            queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
          }
        });

        // Online status listeners
        socket.on('user_online', (data: { userId: string }) => {
          setLiveOnlineStatus(prev => ({ ...prev, [data.userId]: true }));
        });

        socket.on('user_offline', (data: { userId: string }) => {
          setLiveOnlineStatus(prev => ({ ...prev, [data.userId]: false }));
        });

        // Online status sync response
        socket.on('online_status', (statusMap: Record<string, boolean>) => {
          setLiveOnlineStatus(prev => ({ ...prev, ...statusMap }));
        });
      }
    };

    setupSockets();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('connect'); // Remove the rejoin listener
        socket.emit('leave_chat', chatId);
        socket.off('new_message');
        socket.off('user_online');
        socket.off('user_offline');
        socket.off('online_status');
      }
    };
  }, [chatId, queryClient, userId, otherParticipantId]);

  // Initial online status sync when participant is found
  useEffect(() => {
    if (otherParticipantId) {
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('get_online_status', { userIds: [otherParticipantId] });
      } else {
        // If socket connects later, this will run when socket status changes or participant changes
        connectSocket().then(s => {
          if (s) s.emit('get_online_status', { userIds: [otherParticipantId] });
        });
      }
    }
  }, [otherParticipantId]);

  const getMessages = async () => {
    const res = await api.get(`/api/messages/${chatId}`);
    return res.data;
  };

  const { data: messageData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: getMessages,
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      console.log('Sending message to:', otherParticipantId);
      const res = await api.post('/api/messages', { 
        chatId: chatId, 
        text,
        receiverId: otherParticipantId 
      });
      return res.data;
    },
    onMutate: async (newText) => {
      // Cancel any outgoing refetches for messages
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

      // Snapshot the previous messages
      const previousMessages = queryClient.getQueryData(['messages', chatId]);

      // Optimistically update the cache
      queryClient.setQueryData(['messages', chatId], (old: any) => {
        const tempMsg = {
          _id: Math.random().toString(), // Temp ID
          chatId: chatId,
          senderId: userId,
          text: newText,
          createdAt: new Date().toISOString(),
          status: 'sending'
        };
        
        if (!old) return { messages: [tempMsg], totalCount: 1, hasmore: false };
        return {
          ...old,
          messages: [tempMsg, ...old.messages],
          totalCount: (old.totalCount || 0) + 1
        };
      });

      return { previousMessages };
    },
    onError: (err, newText, context: any) => {
      // Rollback if error
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', chatId], context.previousMessages);
      }
    },
    onSuccess: (responseData) => {
      setMessage('');
      // Invalidate the cache to sync with server IDs and timestamps
      // refetchType: 'none' ensures no full re-fetch UI jitter
      queryClient.invalidateQueries({ queryKey: ['messages', chatId], refetchType: 'none' });
    },
    onSettled: () => {
      // Fully sync with server once mutation finishes
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    },
  });

  const handleSend = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message.trim());
    }
  };
  
  // Safe area padding for the dynamic immersive top bar
  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 20;

  if (isChatLoading || (isUserLoading && !!otherParticipantId)) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4b4bc6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Sticky Header */}
      <View style={[styles.header, { paddingTop: STATUSBAR_HEIGHT }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#4f46e5" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            {otherUser?.avatar ? (
              <Image 
                source={{ uri: otherUser.avatar }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#f3f3f4', alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialIcons name="person" size={24} color="#46455340" />
              </View>
            )}
            <View>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {otherUser?.userName || "Loading..."}
              </Text>
              <Text style={styles.onlineStatus}>
                {(liveOnlineStatus[otherParticipantId!] ?? otherUser?.isOnline) ? 'Online now' : 'Offline'}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionIcon}>
              <MaterialIcons name="call" size={24} color="#4f46e5" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIcon}>
              <MaterialIcons name="search" size={24} color="#4f46e5" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <ScrollView 
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={[styles.messagesList, { paddingTop: STATUSBAR_HEIGHT + 84 }]} 
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.dateIndicator}>
            <Text style={styles.dateLabel}>Conversation started</Text>
          </View>

          {messageData?.messages?.slice().reverse().map((msg: any) => {
            const isOutgoing = msg.senderId === userId;

            if (isOutgoing) {
              return (
                <View key={msg._id} style={styles.outgoingWrapper}>
                  <LinearGradient
                    colors={['#4b4bc6', '#6466e1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.outgoingBubble}
                  >
                    <Text style={styles.outgoingText}>{msg.text}</Text>
                  </LinearGradient>
                  <View style={styles.outgoingStatus}>
                    <Text style={styles.timestampRight}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <MaterialIcons name="done-all" size={14} color="#4b4bc6" />
                  </View>
                </View>
              );
            } else {
              return (
                <View key={msg._id} style={styles.incomingWrapper}>
                  <View style={styles.incomingMessage}>
                    {otherUser?.avatar ? (
                      <Image source={{ uri: otherUser.avatar }} style={styles.messageAvatar} />
                    ) : (
                      <View style={[styles.messageAvatar, { backgroundColor: '#f3f3f4', alignItems: 'center', justifyContent: 'center' }]}>
                        <MaterialIcons name="person" size={20} color="#46455340" />
                      </View>
                    )}
                    <View style={styles.incomingBubble}>
                      <Text style={styles.incomingText}>{msg.text}</Text>
                    </View>
                  </View>
                  <Text style={styles.timestampLeft}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }
          })}
          
          {/* Padding for footer bar - reduced since it's no longer absolute */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Interaction Bar */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <TouchableOpacity style={styles.attachmentBtn}>
              <MaterialIcons name="add" size={24} color="#464553" />
            </TouchableOpacity>
            <View style={styles.inputArea}>
              <TouchableOpacity style={styles.emojiBtn}>
                <MaterialIcons name="mood" size={24} color="#46455399" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#464553"
                value={message}
                onChangeText={setMessage}
                multiline={false}
              />
              <TouchableOpacity style={styles.attachFileBtn}>
                <MaterialIcons name="attach-file" size={24} color="#46455399" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.sendBtn, !message.trim() && { opacity: 0.6 }]} 
              onPress={handleSend}
              disabled={sendMessageMutation.isPending || !message.trim()}
            >
              {sendMessageMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <MaterialIcons name="send" size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fa',
  },
  header: {
    backgroundColor: 'rgba(241, 245, 249, 0.85)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 64,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4f46e5',
    letterSpacing: -0.5,
  },
  onlineStatus: {
    fontSize: 10,
    color: '#818cf8',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 20,
    gap: 24,
  },
  dateIndicator: {
    alignSelf: 'center',
    backgroundColor: '#f3f3f4',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dateLabel: {
    fontSize: 12,
    color: '#62616e',
    fontWeight: '500',
  },
  incomingWrapper: {
    maxWidth: '85%',
    alignSelf: 'flex-start',
    gap: 8,
  },
  incomingMessage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  incomingBubble: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 20,
    elevation: 2,
  },
  incomingText: {
    fontSize: 15,
    color: '#1a1c1d',
    lineHeight: 22,
  },
  timestampLeft: {
    marginLeft: 44,
    fontSize: 10,
    color: '#464553',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  outgoingWrapper: {
    maxWidth: '85%',
    alignSelf: 'flex-end',
    gap: 8,
  },
  outgoingBubble: {
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  outgoingText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  outgoingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingRight: 4,
  },
  timestampRight: {
    fontSize: 10,
    color: '#464553',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  attachmentImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  voiceMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 16,
    backgroundColor: '#f9f9fa',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attachmentBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d0c22',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 4,
  },
  inputArea: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f4',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  emojiBtn: {
    paddingRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1c1d',
  },
  attachFileBtn: {
    paddingLeft: 8,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  }
});
