import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { PageView } from "./src";

export default function App() {
  const [currentPage, setCurrentPage] = useState(2);
  const { width, height } = useWindowDimensions();
  const [colors] = useState([
    "pink",
    "wheat",
    "powderblue",
    "cornsilk",
    "palegreen",
  ]);
  return (
    <View style={styles.container}>
      <PageView
        // scrollEnabled={false}
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        style={{
          width: "100%",
          maxHeight: "100%",
          borderWidth: 1,
        }}
      >
        {colors.map((color) => {
          return (
            <View
              key={color}
              style={{
                flex: 1,
                backgroundColor: color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: "#fff",
                  fontFamily: "sans-serif",
                  fontSize: 40,
                }}
              >
                {color}
              </Text>
            </View>
          );
        })}
      </PageView>
      <TouchableOpacity
        onPress={() => {
          setCurrentPage((prev) => prev - 1);
        }}
        style={{
          display: currentPage > 0 ? "flex" : "none",
          position: "absolute",
          left: 10,
          top: "50%",
          marginTop: -25,
          height: 50,
          width: 50,
        }}
      >
        <MaterialIcons
          name="chevron-left"
          size={40}
          color="#fff"
        ></MaterialIcons>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          setCurrentPage((prev) => prev + 1);
        }}
        style={{
          position: "absolute",
          display: currentPage < colors.length - 1 ? "flex" : "none",
          right: 10,
          top: "50%",
          marginTop: -25,
          height: 50,
          width: 50,
        }}
      >
        <MaterialIcons
          name="chevron-right"
          size={40}
          color="#fff"
        ></MaterialIcons>
      </TouchableOpacity>
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 0,
          width: "100%",
          height: 40,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontFamily: "sans-serif",
            color: "#fff",
            fontSize: 30,
          }}
        >
          {currentPage + 1}/{colors.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 20,
    right: 20,
    left: 20,
    bottom: 20,
  },
});
