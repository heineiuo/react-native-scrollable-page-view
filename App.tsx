import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { PageView } from "./src";

export default function App() {
  return (
    <View style={styles.container}>
      <PageView
        style={{
          width: 800,
          maxHeight: 600,
          borderWidth: 1,
        }}
      >
        {["pink", "wheat", "powderblue", "cornsilk", "palegreen"].map(
          (color) => {
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
                    fontSize: 40,
                  }}
                >
                  {color}
                </Text>
              </View>
            );
          }
        )}
      </PageView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
