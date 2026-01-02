import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import ChatScreen from './components/ChatScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
