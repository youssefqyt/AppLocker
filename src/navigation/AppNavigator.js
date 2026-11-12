import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import { COLORS, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';

import SetupPinScreen from '../screens/SetupPinScreen';
import HomeScreen from '../screens/HomeScreen';
import AccessLogScreen from '../screens/AccessLogScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LockScreen from '../screens/LockScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.bg,
    card: COLORS.surface,
    border: COLORS.border,
    text: COLORS.text,
    primary: COLORS.accent,
  },
};

function TabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Home', icon: 'grid-outline', activeIcon: 'grid', label: 'Apps' },
    { name: 'Log', icon: 'list-outline', activeIcon: 'list', label: 'Log' },
    { name: 'Settings', icon: 'settings-outline', activeIcon: 'settings', label: 'Settings' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: COLORS.surface,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      paddingBottom: 16,
      paddingTop: 8,
    }}>
      {tabs.map((tab, index) => {
        const isFocused = state.index === index;
        return (
          <View key={tab.name} style={{ flex: 1, alignItems: 'center' }}>
            <Ionicons
              name={isFocused ? tab.activeIcon : tab.icon}
              size={22}
              color={isFocused ? COLORS.accent : COLORS.textDim}
              onPress={() => navigation.navigate(tab.name)}
            />
            <Text style={{
              fontSize: 10, fontWeight: '600', marginTop: 3,
              color: isFocused ? COLORS.accent : COLORS.textDim,
            }}>{tab.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Log" component={AccessLogScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { state } = useApp();

  if (state.isLoading) return null;

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: COLORS.bg },
          presentation: 'modal',
        }}
      >
        {!state.pin ? (
          <Stack.Screen name="SetupPin" component={SetupPinScreen} />
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen name="SetupPin" component={SetupPinScreen} />
            <Stack.Screen name="Lock" component={LockScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
