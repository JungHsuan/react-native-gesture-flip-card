/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View, Text, StatusBar} from 'react-native';

import GestureFlipView from './gestureFlipView';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <GestureFlipView width={300} height={500}>
          {renderBack()}
          {renderFront()}
        </GestureFlipView>
      </View>
    </>
  );
};

const renderFront = () => {
  return (
    <View style={styles.frontStyle}>
      <Text style={{fontSize: 25, color: '#fff'}}>{'Front'}</Text>
    </View>
  );
};

const renderBack = () => {
  return (
    <View style={styles.backStyle}>
      <Text style={{fontSize: 25, color: '#fff'}}>{'Back'}</Text>
    </View>
  );
};

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
