import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, ScrollView, ScrollViewProps, View } from "react-native";

type PageViewMethods = {
  next(): void;
};

export const PageView = forwardRef<
  PageViewMethods,
  ScrollViewProps & { children: JSX.Element | JSX.Element[] }
>(function PageView({ scrollEnabled, style, children }, ref) {
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const contentOffsetX = useRef(0);

  const animating = useRef(false);
  const onScrollTimer = useRef<any>();
  const scrollViewRef = useRef<ScrollView>(null);

  useImperativeHandle(
    ref,
    () => {
      return {
        next: () => {},
      };
    },
    []
  );

  const onLayout = useCallback((event) => {
    const { layout } = event.nativeEvent;
    // console.log("layout", layout);
    setWidth(layout.width);
    setHeight(layout.height);
    setReady(true);
  }, []);

  const isTouchable = useMemo(() => {
    if (Platform.OS === "web") {
      if (window.navigator.maxTouchPoints === 0) {
        return false;
      }
    }
    return true;
  }, []);

  const childCount = useMemo(() => {
    return Children.count(children);
  }, [children]);

  const calculatePosition = useCallback(() => {
    const x = contentOffsetX.current;
    console.log("calculatePosition calculate", x);

    const halfWidth = width / 2;
    let index = 0;
    let left = 0;
    while (true) {
      if (index === childCount) {
        break;
      }
      if (Math.abs(x - left) < halfWidth) {
        break;
      }
      index++;
      left += width;
    }

    animating.current = true;
    scrollViewRef.current?.scrollTo({ x: left, animated: true });
  }, [width, childCount]);

  const onScrollAnimationEnd = useCallback(() => {
    animating.current = false;
  }, []);

  const onScroll = useCallback(
    (event) => {
      contentOffsetX.current = event.nativeEvent.contentOffset.x;
      console.log("calculatePosition onScroll", contentOffsetX.current);
      // if (isTouchable) {
      //   return;
      // }

      if (onScrollTimer.current) {
        console.log("calculatePosition clear");
        clearTimeout(onScrollTimer.current);
      }
      onScrollTimer.current = setTimeout(
        () => {
          calculatePosition();
        },
        animating.current ? 100 : 20
      );
    },
    [isTouchable, calculatePosition]
  );

  const childs = useMemo(() => {
    if (!ready) {
      return <></>;
    }
    return (
      <>
        {Children.map(children, (child, index) => {
          return (
            <View
              key={index}
              style={{
                position: "absolute",
                top: 0,
                left: index * width,
                width,
                height,
              }}
            >
              {child}
            </View>
          );
        })}
      </>
    );
  }, [children, width, height, ready]);

  useEffect(() => {}, []);

  return (
    <ScrollView
      scrollEventThrottle={16}
      onScroll={onScroll}
      ref={scrollViewRef}
      scrollEnabled={scrollEnabled}
      horizontal
      style={style}
      onLayout={onLayout}
      onScrollAnimationEnd={onScrollAnimationEnd}
    >
      {ready ? childs : null}
    </ScrollView>
  );
});
