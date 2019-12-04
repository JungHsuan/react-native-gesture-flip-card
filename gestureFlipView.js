import React from 'react';
import {View, Animated, PanResponder, Platform, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';

class GestureFlipView extends React.Component {
  static defaultProps = {
    perspective: -1000,
  };

  constructor(props) {
    super(props);
    this.state = {
      scrollX: new Animated.Value(0),
      cardFace: true,
      doReset: false,
      width: Math.floor(props.width),
      height: Math.floor(props.height),
      canBackViewResponse: false,
    };

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: this._handleMoveShouldSetPanResponder,
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderRelease: this._handlePanResponderEnd,
    });
    this.isAnimating = false;
    this.isCardFaceSet = false;
    this.lastScrollX = 0;
    this.reachLimit = false;
    this.flippedValue = null;
    this.isGestureMoving = false;
    this.prevdx = 0;
  }

  componentDidMount = () => {
    this.state.scrollX.addListener(({value}) => {
      const start = this.lastScrollX;
      const endRight = start + this.state.width;
      const endLeft = start - this.state.width;
      const rightMidBound = (endRight + start) / 2;
      const leftMidBound = (endLeft + start) / 2;
      if (!this.isCardFaceSet) {
        if (value >= rightMidBound || value <= leftMidBound) {
          this.isCardFaceSet = true;
          this.setState({cardFace: !this.state.cardFace}, () => {
            // flip view
            this.flippedValue = value;
          });
        }
      }
    });
  };

  _onStartShouldSetPanResponderCapture = (evt, gestureState) => {
    return false;
  };

  // if pan can response, decide move event can effect.
  _handleMoveShouldSetPanResponder = (evt, gestureState) => {
    const threshold = this.state.cardFace
      ? this.state.width * 0.05
      : this.state.width * 0.1;
    const shouldPanRespons =
      Math.abs(gestureState.dx) >= threshold &&
      !this.isAnimating &&
      !this.reachLimit;
    return shouldPanRespons;
  };

  // call once, when move start effect.
  _handlePanResponderGrant = (evt, gestureState) => {
    this.isGestureMoving = true;
    this.isCardFaceSet = false;
    this.reachLimit = false;
    if (this.state.cardFace) {
      this.lastScrollX = 0;
    } else {
      this.lastScrollX = this.state.scrollX._value;
    }
  };

  // when moving on responder.
  _handlePanResponderMove = (evt, gestureState) => {
    if (this.flippedValue != null && this.isCardFaceSet) {
      if (Math.abs(gestureState.dx) < Math.abs(this.prevdx)) {
        this.reachLimit = true;
        return;
      }
    }
    this.prevdx = gestureState.dx;
    if (this.state.cardFace && this.flippedValue == null) {
      return Animated.event([null, {dx: this.state.scrollX}])(
        evt,
        gestureState,
      );
    } else {
      this.state.scrollX.setValue(this.lastScrollX + gestureState.dx);
    }
  };

  _handlePanResponderEnd = (evt, gestureState) => {
    const {width} = this.state;
    const absVx = Math.abs(gestureState.vx);
    const dx = this.reachLimit ? this.prevdx : gestureState.dx;
    const absDx = Math.abs(dx);
    const direction = dx >= 0 ? 1 : -1;
    const goBack = absDx < width / 4 && absVx < 1.5;
    this.doFlip(direction, goBack);
    this.isGestureMoving = false;
  };

  doFlip = (direction, goBack) => {
    const {width, scrollX, cardFace} = this.state;
    let toValue = cardFace
      ? goBack
        ? 0
        : direction * width
      : goBack
      ? this.lastScrollX
      : direction * width + this.lastScrollX;
    if (this.flippedValue != null && cardFace) {
      toValue = direction * width + this.lastScrollX;
    }
    this.isAnimating = true;
    Animated.timing(scrollX, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // this.isCardFaceSet = true;
      this.isAnimating = false;
      this.reachLimit = false;
      this.flippedValue = null;
      this.props.onFlipEnd && this.props.onFlipEnd();
    });
  };

  renderFront = () => {
    const {cardFace, height, width, scrollX} = this.state;
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: cardFace ? 1 : 0,
            zIndex: cardFace ? 5 : 1,
            height: height,
            width: width,
            transform: [
              {perspective: this.props.perspective},
              {
                rotateY: scrollX.interpolate({
                  inputRange: [-width, 0, width],
                  outputRange: Platform.select({
                    ios: ['180deg', '0deg', '-180deg'],
                    android: ['-180deg', '0deg', '180deg'],
                  }),
                }),
              },
            ],
          },
        ]}>
        <View pointerEvents={cardFace ? 'auto' : 'none'}>
          {this.props.children[0]}
        </View>
      </Animated.View>
    );
  };

  renderBack = () => {
    const {cardFace, height, width, scrollX} = this.state;
    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: cardFace ? 0 : 1,
            zIndex: cardFace ? 1 : 5,
            height: height,
            width: width,
            transform: [
              {perspective: this.props.perspective},
              {
                rotateY: scrollX.interpolate({
                  inputRange: [-width, 0, width],
                  outputRange: Platform.select({
                    ios: ['0deg', '-180deg', '-360deg'],
                    android: ['0deg', '180deg', '360deg'],
                  }),
                }),
              },
            ],
          },
        ]}>
        <View pointerEvents={cardFace ? 'none' : 'auto'}>
          {this.props.children[1]}
        </View>
      </Animated.View>
    );
  };

  render = () => {
    const {height, width} = this.state;
    return (
      <View
        {...this._panResponder.panHandlers}
        style={[styles.container, {height: height, width: width}]}>
        {this.renderBack()}
        {this.renderFront()}
      </View>
    );
  };
}

GestureFlipView.propTypes = {
  onFlipEnd: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  perspective: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default GestureFlipView;
