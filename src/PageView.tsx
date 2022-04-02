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
    delay?: number;
    currentPage?: number;
    onChangePage?: (page: number) => void;
    children: JSX.Element | JSX.Element[];
  }
>(function PageView(
  { delay = 100, onChangePage, currentPage, scrollEnabled, style, children },
  ref
) {
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const contentOffsetX = useRef(0);

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

  const animate = useCallback(() => {
    if (paning.current) {
      onScrollTimer.current = setTimeout(animate, 16);
      return;
    }

    const x = contentOffsetX.current;
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

    scrollViewRef.current?.scrollTo({ x: left, animated: true });

    if (onChangePage) {
      onChangePage(index);
    }
  }, [width, childCount, onChangePage]);

  const onScroll = useCallback(
    (event) => {
      contentOffsetX.current = event.nativeEvent.contentOffset.x;
      if (onScrollTimer.current) {
        clearTimeout(onScrollTimer.current);
      }
      onScrollTimer.current = setTimeout(() => {
        animate();
      }, delay);
    },
    [isTouchable, animate]
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
    if (
      ready &&
      typeof currentPage === "number" &&
      currentPage > -1 &&
      currentPage < childCount
    ) {
      contentOffsetX.current = width * currentPage;
      animate();
    }
  }, [ready, currentPage, childCount, width]);

  useEffect(() => {
    const onMouseDown = () => {
      paning.current = true;
    };
    const onMouseUp = () => {
      paning.current = false;
    };
    if (!isTouchable) {
      const addEventListener = (scrollViewRef.current as unknown as any)
        ?.addEventListener;
      const removeEventListener = (scrollViewRef.current as unknown as any)
        ?.removeEventListener;
      if (addEventListener && removeEventListener) {
        addEventListener("mouseup", onMouseUp);
        addEventListener("mousedown", onMouseDown);
        return () => {
          removeEventListener("mouseup", onMouseUp);
          removeEventListener("mousedown", onMouseDown);
        };
      }
    }
  }, []);

  return (
    <ScrollView
      scrollEventThrottle={16}
      onResponderGrant={() => {
        paning.current = true;
      }}
      onResponderMove={() => {
        paning.current = true;
      }}
      onResponderRelease={() => {
        paning.current = false;
      }}
      onScroll={onScroll}
      ref={scrollViewRef}
      scrollEnabled={scrollEnabled}
      horizontal
      style={style}
      onLayout={onLayout}
    >
      {ready ? childs : null}
    </ScrollView>
  );
});
