import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../screens/utils/colors";

const AppButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  text: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
});