import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const InputField = ({
  placeholder,
  icon,
  secure = false,
  value,
  onChangeText,
  keyboardType = "default",
}) => {
  const [hide, setHide] = useState(secure);

  return (
    <View style={styles.container}>
      <Icon name={icon} size={20} color="#666" style={styles.icon} />

      <TextInput
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={hide}
        value={value}
        onChangeText={onChangeText}
      />

      {secure && (
        <TouchableOpacity onPress={() => setHide(!hide)}>
          <Icon
            name={hide ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      )}
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        secureTextEntry={hide}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export default InputField;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});