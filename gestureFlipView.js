import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import {
  View,
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
} from "react-native";
import PropTypes from "prop-types";

const GestureFlipView = React.forwardRef((props, ref) => {
  const width = Math.floor(props.width);
  const height = Math.floor(props.height);
  const [cardFace, setCardFace] = useState(true);

  const isAnimating = useRef(false);
  const isCardFaceSet = useRef(false);
  const lastScrollX = useRef(0);
  const flippedValue = useRef(null);
  const cardFaceRef = useRef(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  const enablePan = useRef(props.gestureEnabled);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetResponderCapture: (evt) => true,
      onMoveShouldSetResponderCapture: (evt) => true,
      onMoveShouldSetPanResponder: handleMoveShouldSetPanResponder,
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderEnd: handlePanResponderEnd,
    })
  );

  useEffect(() => {
    cardFaceRef.current = cardFace;
  }, [cardFace]);

  useEffect(() => {
    enablePan.current = props.gestureEnabled;
  }, [props.gestureEnabled]);

  useEffect(() => {
    scrollX.addListener(({ value }) => {
      const start = lastScrollX.current;
      const endRight = start + width;
      const endLeft = start - width;
      const rightMidBound = (endRight + start) / 2;
      const leftMidBound = (endLeft + start) / 2;

      if (!isCardFaceSet.current) {
        if (value >= rightMidBound || value <= leftMidBound) {
          isCardFaceSet.current = true;
          flippedValue.current = value;
          setCardFace((prev) => !prev);
        }
      } else {
        if (value < rightMidBound && value > leftMidBound) {
          isCardFaceSet.current = false;
          flippedValue.current = null;
          setCardFace((prev) => !prev);
        }
      }
    });

    return () => {
      scrollX.removeAllListeners();
    };
  }, []);

  // if pan can response, decide move event can effect.
  function handleMoveShouldSetPanResponder(evt, gestureState) {
    const dx = Math.abs(gestureState.dx);
    const dy = Math.abs(gestureState.dy);
    if (isAnimating.current || !enablePan.current) {
      return false;
    }
    if (cardFace) {
      return dx > 5;
    } else {
      return dx > dy;
    }
  }

  // call once, when move start effect.
  function handlePanResponderGrant(evt, gestureState) {
    isCardFaceSet.current = false;
    if (cardFaceRef.current) {
      lastScrollX.current = 0;
    } else {
      lastScrollX.current = scrollX._value;
    }
  }

  // when moving on responder.
  function handlePanResponderMove(evt, gestureState) {
    if (cardFaceRef.current && flippedValue.current == null) {
      // PanResponder run on JS thread, so we can't use native driver here.
      return Animated.event([{ dx: scrollX }], {
        useNativeDriver: false,
      })(gestureState);
    } else {
      let _newState = {};
      _newState.dx = lastScrollX.current + gestureState.dx;
      return Animated.event([{ dx: scrollX }], {
        useNativeDriver: false,
      })(_newState);
    }
  }

  function handlePanResponderEnd(evt, gestureState) {
    const absVx = Math.abs(gestureState.vx);
    const dx = gestureState.dx;
    const absDx = Math.abs(dx);
    const direction = dx >= 0 ? 1 : -1;
    const goBack = absDx < width / 5 && absVx < 1.0;
    flipWhileRelease(direction, goBack);
  }

  function flipWhileRelease(direction, goBack) {
    let toValue = cardFaceRef.current
      ? goBack
        ? 0
        : direction * width
      : goBack
      ? lastScrollX.current
      : direction * width + lastScrollX.current;
    if (flippedValue.current != null && cardFaceRef.current) {
      toValue = direction * width + lastScrollX.current;
    }
    isAnimating.current = true;
    Animated.timing(scrollX, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      isAnimating.current = false;
      flippedValue.current = null;
      props.onFlipEnd && props.onFlipEnd();
    });
  }

  function Flip(direction) {
    if (isAnimating.current) {
      return;
    }
    isCardFaceSet.current = false;
    if (cardFaceRef.current) {
      lastScrollX.current = 0;
      scrollX.setValue(0);
    } else {
      lastScrollX.current = scrollX._value;
    }
    let toValue = cardFaceRef.current
      ? direction * width
      : direction * width + lastScrollX.current;
    if (flippedValue.current != null && cardFaceRef.current) {
      toValue = direction * width + lastScrollX.current;
    }
    isAnimating.current = true;
    Animated.timing(scrollX, {
      toValue: toValue,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      isAnimating.current = false;
      flippedValue.current = null;
      props.onFlipEnd && props.onFlipEnd();
    });
  }

  useImperativeHandle(ref, () => ({
    flipLeft: () => Flip(-1),
    flipRight: () => Flip(1),
  }));

  const renderFront = () => {
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
              { perspective: props.perspective },
              {
                rotateY: scrollX.interpolate({
                  inputRange: [-width, 0, width],
                  outputRange: Platform.select({
                    ios: ["180deg", "0deg", "-180deg"],
                    android: ["-180deg", "0deg", "180deg"],
                  }),
                }),
              },
            ],
          },
        ]}
      >
        <View pointerEvents={cardFace ? "auto" : "none"}>
          {props.children[0]}
        </View>
      </Animated.View>
    );
  };

  const renderBack = () => {
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
              { perspective: props.perspective },
              {
                rotateY: scrollX.interpolate({
                  inputRange: [-width, 0, width],
                  outputRange: Platform.select({
                    ios: ["0deg", "-180deg", "-360deg"],
                    android: ["0deg", "180deg", "360deg"],
                  }),
                }),
              },
            ],
          },
        ]}
      >
        <View pointerEvents={cardFace ? "none" : "auto"}>
          {props.children[1]}
        </View>
      </Animated.View>
    );
  };

  return (
    <View
      {...panResponder.current?.panHandlers}
      style={{
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        height: height,
        width: width,
      }}
    >
      {renderBack()}
      {renderFront()}
    </View>
  );
});

GestureFlipView.propTypes = {
  onFlipEnd: PropTypes.func,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  perspective: PropTypes.number,
  gestureEnabled: PropTypes.bool,
};

GestureFlipView.defaultProps = {
  perspective: -1000,
  gestureEnabled: true,
};

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default GestureFlipView;
