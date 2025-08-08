import React from 'react';
import { SafeAreaView, StatusBar, Text, View } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: '600' }}>Gymflow Mobile</Text>
      </View>
    </SafeAreaView>
  );
}
