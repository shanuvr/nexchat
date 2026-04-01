import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarWrapper}>
      <LinearGradient
        colors={['transparent', 'rgba(249, 249, 250, 0.95)']}
        style={styles.gradientBackground}
      />
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName: keyof typeof MaterialIcons.glyphMap = 'error';
          if (route.name === 'index') iconName = 'chat-bubble';
          else if (route.name === 'profile') iconName = 'person';

          return (
             <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[styles.tabItem, isFocused && styles.tabItemFocused]}
            >
              <MaterialIcons 
                name={iconName} 
                size={24} 
                color={isFocused ? '#ffffff' : '#46455380'} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs 
      tabBar={props => <CustomTabBar {...props} />} 
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 48,
    paddingHorizontal: 24,
    zIndex: 50,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 9999,
    shadowColor: '#4b4bc6',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 10,
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemFocused: {
    backgroundColor: '#4b4bc6',
    shadowColor: '#6466e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  }
});
