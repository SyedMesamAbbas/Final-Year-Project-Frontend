import React, { useState, useEffect } from "react";
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
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AppButton from "../../components/AppButton";
import colors from "../utils/colors";

const PRIMARY_COLOR = colors?.primary || "#4F46E5";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Input Focus States for active dynamic border highlights
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Check saved remember email on mount if available
  useEffect(() => {
    const loadSavedEmail = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("rememberEmail");
        if (savedEmail) {
          setUsername(savedEmail);
          setRemember(true);
        }
      } catch (e) {
        console.log("Failed to load saved email:", e);
      }
    };
    loadSavedEmail();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      Alert.alert("Required Fields", "Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
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

      // Store Auth Session Information
      await AsyncStorage.setItem("token", user.token);
      await AsyncStorage.setItem("userId", user.userId.toString());
      await AsyncStorage.setItem("role", user.role);
      await AsyncStorage.setItem("fullName", user.fullName || "");
      await AsyncStorage.setItem("email", user.email || "");

      if (user.latitude !== null && user.longitude !== null && user.latitude !== undefined && user.longitude !== undefined) {
        await AsyncStorage.setItem("latitude", user.latitude.toString());
        await AsyncStorage.setItem("longitude", user.longitude.toString());
      }

      if (remember) {
        await AsyncStorage.setItem("rememberEmail", username.trim());
      } else {
        await AsyncStorage.removeItem("rememberEmail");
      }

      Alert.alert("Success", "Login successful");

      // Navigate based on Role
      if (user.role === "Admin") {
        navigation.replace("AdminStack");
      } else if (user.role === "Tutor") {
        navigation.replace("TutorStack");
      } else if (user.role === "Student") {
        navigation.replace("StudentStack");
      } else if (user.role === "Parent") {
        navigation.replace("ParentStack");
      } else {
        Alert.alert("Error", "Unknown user role.");
      }
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("Response Error:", error.response?.data);

      Alert.alert("FULL ERROR:", error);

      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid credentials or network issue. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Brand Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoBadgeContainer}>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to manage your tutoring sessions & schedule
            </Text>
          </View>

          {/* Form Card Surface */}
          <View style={styles.formCard}>
            {/* Email Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View
                style={[
                  styles.inputContainer,
                  emailFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={emailFocused ? PRIMARY_COLOR : "#94A3B8"}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  placeholder="name@example.com"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  passwordFocused && styles.inputContainerFocused,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={passwordFocused ? PRIMARY_COLOR : "#94A3B8"}
                  style={styles.inputLeftIcon}
                />
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconContainer}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Options Row: Remember Me & Forgot Password */}
            {/* <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberContainer}
                onPress={() => setRemember(!remember)}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <View
                  style={[
                    styles.checkbox,
                    remember && styles.checkedBox,
                  ]}
                >
                  {remember && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.rememberText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Reset Password",
                    "Please contact support or use the web portal to reset your password."
                  )
                }
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View> */}

            {/* Main Action Button */}
            <View style={styles.actionButtonWrapper}>
              {isLoading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loadingButtonText}>Signing in...</Text>
                </View>
              ) : (
                <AppButton title="Sign In" onPress={handleLogin} />
              )}
            </View>
          </View>

          {/* Footer Signup Prompt */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account yet?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Role")}
              style={styles.signupBtnWrapper}
              activeOpacity={0.85}
            >
              <Text style={styles.signupBtnText}>Create new account</Text>
              <Ionicons name="arrow-forward" size={16} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: "center",
  },

  // Header Styling
  headerContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBadgeContainer: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: colors.primary,//"#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  logo: {
    width: 65,
    height: 65,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 280,
  },

  // Card Surface
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  inputContainerFocused: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#FFFFFF",
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "500",
  },
  eyeIconContainer: {
    padding: 6,
    marginLeft: 4,
  },

  // Options Controls
  optionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 4,
    marginBottom: 22,
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkedBox: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  rememberText: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  forgotText: {
    fontSize: 13,
    color: PRIMARY_COLOR,
    fontWeight: "600",
  },

  // Action Button
  actionButtonWrapper: {
    marginTop: 4,
  },
  loadingButton: {
    height: 50,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    opacity: 0.85,
  },
  loadingButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Footer Controls
  footerContainer: {
    alignItems: "center",
    marginTop: 32,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#64748B",
  },
  signupBtnWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  signupBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },
});
