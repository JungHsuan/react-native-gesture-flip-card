# react-native-gesture-flip-card

flip card animation using gesture for React Native

[![npm version](https://badge.fury.io/js/react-native-gesture-flip-card.svg)](https://badge.fury.io/js/react-native-gesture-flip-card)

## Installation

```
  npm install --save react-native-gesture-flip-card
```

## Simple Preview
![App preview](/screenshots/example_1.gif)
![App preview](/screenshots/example_2.gif)

## Minimal Usage
```javascript
import GestureFlipView from 'react-native-gesture-flip-card';
```

```javascript
<View style={styles.container}>
  <GestureFlipView width={300} height={500}>
    {renderBack()}
    {renderFront()}
    </GestureFlipView>
</View>

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
```

# Detail

## Props
| Props               | type          | description                     | required      | default       |
| --------------------| ------------- | --------------------------------| ------------- | ------------- |
| width               | number        | width of view                   |  true         |               |
| height              | number        | height of view                  |  true         |               |
| onFlipEnd           | function      | callback on end of flip         |               |               |
| perspective         | number        | perspective of the view         |               | -1000         |

## Method
| name                | description                     | args                   |
| --------------------| --------------------------------| ---------------------  |
| doFlip              | flip the card                   | number: 1 or -1        | 

```javascript
<GestureFlipView ref={(ref) => this.flipView = ref}
  width={300} height={500}>
    {renderBack()}
    {renderFront()}
</GestureFlipView>
```
```javascript
this.flipView.doFlip(1)  // counterclockwise
this.flipView.doFlip(-1) // clockwise
```
