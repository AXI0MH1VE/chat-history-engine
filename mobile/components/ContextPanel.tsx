import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ContextPanelProps {
  contextSummary: string;
}

export default function ContextPanel({ contextSummary }: ContextPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Context Frame</Text>
      <Text style={styles.content}>{contextSummary || 'No context loaded yet.'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    fontSize: 12,
    color: '#555',
  },
});
