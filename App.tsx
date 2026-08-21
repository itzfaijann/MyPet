import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { hydrate, applyOfflineDecay } from './src/store/petSlice';
import { loadState } from './src/store/storage';
import { HomeScreen } from './src/components/HomeScreen';
import { SplashScreen } from './src/components/SplashScreen';

function AppInner() {
  const dispatch = useDispatch();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    try {
      const saved = loadState();
      if (saved) {
        dispatch(hydrate(saved));
        const elapsedMinutes = (Date.now() - saved.lastSavedAt) / 1000 / 60;
        if (elapsedMinutes > 1) dispatch(applyOfflineDecay(elapsedMinutes));
      }
    } catch (e) {}
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a0533" />
      <HomeScreen />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppInner />
      </Provider>
    </SafeAreaProvider>
  );
}