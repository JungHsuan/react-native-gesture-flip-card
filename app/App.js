/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import GestureFlipView from './src/GestureFlipView';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#222' : '#fafafa',
  };

  const renderFront = () => {
    return (
      <View style={styles.frontStyle}>
        <Text style={{ fontSize: 25, color: '#fff' }}>{'Front'}</Text>
      </View>
    );
  };

  const renderBack = () => {
    return (
      <View style={styles.backStyle}>
        <Text style={{ fontSize: 25, color: '#fff' }}>{'Back'}</Text>
      </View>
    );
  };

  return (
    <View style={{ ...styles.container, ...backgroundStyle }}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <GestureFlipView
        width={300}
        height={500}
        renderBack={renderBack}
        renderFront={renderFront}
        onFaceChanged={(face) => {
          // trigger when card face changed
          console.log('face changed:', face);
        }}
        onFlipEnd={(face) => {
          // trigger when flip animation ended
          console.log('on flip end:', face);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frontStyle: {
    width: 300,
    height: 500,
    backgroundColor: '#f00',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  backStyle: {
    width: 300,
    height: 500,
    backgroundColor: '#f0f',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default App;
