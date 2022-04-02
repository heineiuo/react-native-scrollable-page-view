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
  ScrollViewProps & {
    currentPage?: number;
    onChangePage?: (page: number) => void;
    children: JSX.Element | JSX.Element[];
  }
>(function PageView({ scrollEnabled, style, children }, ref) {
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const contentOffsetX = useRef(0);

  const animating = useRef(false);
  const paning = useRef(false);
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
    if (paning.current) {
      onScrollTimer.current = setTimeout(calculatePosition, 20);
      return;
    }

    const x = contentOffsetX.current;
    // console.log("calculatePosition calculate", x);

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
      if (isTouchable) {
        if (onScrollTimer.current) {
          // console.log("calculatePosition clear");
          clearTimeout(onScrollTimer.current);
        }
        onScrollTimer.current = setTimeout(
          () => {
            calculatePosition();
          },
          animating.current ? 100 : 20
        );
      }
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

  useEffect(() => {
    if (!isTouchable) {
      const addEventListener = (scrollViewRef.current as unknown as any)
        ?.addEventListener;
      const removeEventListener = (scrollViewRef.current as unknown as any)
        ?.removeEventListener;
      if (addEventListener && removeEventListener) {
        function onMouseUp() {
          console.log("onMouseUp", "onMouseUp");
          calculatePosition();
        }

        addEventListener("mouseup", onMouseUp);
        return () => {
          removeEventListener("mouseup", onMouseUp);
        };
      }
    }
  }, [calculatePosition]);

  return (
    <ScrollView
      scrollEventThrottle={16}
      onResponderGrant={() => {
        console.log("onResponderGrant");
        paning.current = true;
      }}
      onResponderMove={() => {
        console.log("onResponderMove");
        paning.current = true;
      }}
      onResponderRelease={() => {
        console.log("onResponderRelease");
        paning.current = false;
      }}
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
