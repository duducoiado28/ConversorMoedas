import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import ConverterScreen from './src/views/ConverterScreen';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f6fb' }}>
      <StatusBar style="dark" />
      <ConverterScreen />
    </SafeAreaView>
  );
}