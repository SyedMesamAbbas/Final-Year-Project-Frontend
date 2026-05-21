import React, { useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import AppButton from "../../components/AppButton";
import colors from "../utils/colors";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleLogin = async () => {
  if (!username || !password) {
    Alert.alert("Error", "Please enter email and password");
    return;
  }

  try {
    console.log("Sending:", {
      email: username.trim(),
      password: password,
    });

    const response = await axios.post(`${BASE_URL}/Auth/login`, {
      email: username.trim(),
      password: password,
    });
    console.log("Response:", response.data);

    const user = response.data;

    await AsyncStorage.setItem("token", user.token);
    await AsyncStorage.setItem("userId", user.userId.toString());
    await AsyncStorage.setItem("role", user.role);
    await AsyncStorage.setItem("fullName", user.fullName || "");
    await AsyncStorage.setItem("email", user.email || "");

    if (user.latitude !== null && user.longitude !== null) {
      await AsyncStorage.setItem("latitude", user.latitude.toString());
      await AsyncStorage.setItem("longitude", user.longitude.toString());
    }
    if (remember) {
      await AsyncStorage.setItem("rememberEmail", username);
    }

    Alert.alert("Success", "Login successful");

    if (user.role === "Admin") {
      navigation.replace("AdminStack");
    } else if (user.role === "Tutor") {
      navigation.replace("TutorStack");
    } else {
      navigation.replace("StudentStack");
    }

  } catch (error) {
    console.log("FULL ERROR:", error);
    console.log("Response Error:", error.response?.data);

    Alert.alert(
      "Login Failed",
      error.response?.data?.message || "Check API or credentials"
    );
  }
};
  // const handleLogin = async () => {
  //   if (!username || !password) {
  //     Alert.alert("Error", "Please enter email and password");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(`${BASE_URL}/Auth/login`, {
  //       email: username,
  //       password: password,
  //     });

  //     const user = response.data;

  //     await AsyncStorage.setItem("token", user.token);
  //     await AsyncStorage.setItem("userId", user.id.toString());
  //     await AsyncStorage.setItem("role", user.role);
  //     await AsyncStorage.setItem("fullName", user.fullName);
  //     await AsyncStorage.setItem("email", user.email);

  //     if (remember) {
  //       await AsyncStorage.setItem("rememberEmail", username);
  //     }

  //     Alert.alert("Success", "Login successful");

  //     if (user.role === "Admin") {
  //       navigation.replace("AdminStack");
  //     } else if (user.role === "Tutor") {
  //       navigation.replace("TutorStack");
  //     } else {
  //       navigation.replace("StudentStack");
  //     }
  //   } catch (error) {
  //     console.log("Login Error:", error.response?.data || error.message);

  //     Alert.alert(
  //       "Login Failed",
  //       error.response?.data?.message || "Invalid email or password"
  //     );
  //   }
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>LOGIN</Text>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter Email"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#888"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#888"
          />
        </View>

        <AppButton title="Login" onPress={handleLogin} />
        
        <View style={{ flex: 1 }} />

        <AppButton
          title="Create new account"
          onPress={() => navigation.navigate("Role")}
          style={styles.signupBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: colors.primary,
    marginVertical: 20,
    letterSpacing: 1,
  },

  /* Input Styling */
  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 8,
    paddingHorizontal: 12,
  },
  input: {
    height: 45,
    fontSize: 16,
    color: "#000",
  },

  /* Remember Me */
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#555",
    marginRight: 8,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  rememberText: {
    fontSize: 14,
    color: "#333",
  },

  /* Forgot */
  forgot: {
    textAlign: "center",
    color: colors.primary,
    marginTop: 15,
    fontSize: 16,
  },

  signupBtn: {
    marginBottom: 20,
  },
});
