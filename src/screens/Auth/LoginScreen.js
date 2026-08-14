// import React, { useState } from "react";
// import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   Alert,
// } from "react-native";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import AppButton from "../../components/AppButton";
// import colors from "../utils/colors";

// const LoginScreen = ({ navigation }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [remember, setRemember] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleLogin = async () => {
//     if (!username || !password) {
//       Alert.alert("Error", "Please enter email and password");
//       return;
//     }

//     try {
//       console.log("Sending:", {
//         email: username.trim(),
//         password: password,
//       });

//       const response = await axios.post(`${BASE_URL}/Auth/login`, {
//         email: username.trim(),
//         password: password,
//       });

//       console.log("Response:", response.data);

//       const user = response.data;

//       await AsyncStorage.setItem("token", user.token);
//       await AsyncStorage.setItem("userId", user.userId.toString());
//       await AsyncStorage.setItem("role", user.role);
//       await AsyncStorage.setItem("fullName", user.fullName || "");
//       await AsyncStorage.setItem("email", user.email || "");

//       if (user.latitude !== null && user.longitude !== null) {
//         await AsyncStorage.setItem("latitude", user.latitude.toString());
//         await AsyncStorage.setItem("longitude", user.longitude.toString());
//       }

//       if (remember) {
//         await AsyncStorage.setItem("rememberEmail", username);
//       }

//       Alert.alert("Success", "Login successful");

//       if (user.role === "Admin") {
//         navigation.replace("AdminStack");
//       } else if (user.role === "Tutor") {
//         navigation.replace("TutorStack");
//       } else if (user.role === "Student") {
//         navigation.replace("StudentStack");
//       } else if (user.role === "Parent") {
//         navigation.replace("ParentStack");
//       } else {
//         Alert.alert("Error", "Unknown user role.");
//       }
//     } catch (error) {
//       console.log("FULL ERROR:", error);
//       console.log("Response Error:", error.response?.data);

//       Alert.alert(
//         "Login Failed",
//         error.response?.data?.message || "Check API or credentials"
//       );
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       style={styles.container}
//     >
//       <View style={styles.inner}>
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <Text style={styles.title}>LOGIN</Text>

//         {/* Email Input */}
//         <View style={styles.inputContainer}>
//           <TextInput
//             placeholder="Enter Email"
//             value={username}
//             onChangeText={setUsername}
//             style={styles.input}
//             placeholderTextColor={colors.textSecondary}
//             keyboardType="email-address"
//             autoCapitalize="none"
//           />
//         </View>

//         {/* Password Input with Eye Icon */}
//         <View style={styles.inputContainer}>
//           <TextInput
//             placeholder="Enter Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry={!showPassword}
//             style={styles.passwordInput}
//             placeholderTextColor={colors.textSecondary}
//           />

//           <TouchableOpacity
//             onPress={() => setShowPassword(!showPassword)}
//             style={styles.eyeIcon}
//           >
//             <Ionicons
//               name={showPassword ? "eye-off-outline" : "eye-outline"}
//               size={24}
//               color={colors.textSecondary}
//             />
//           </TouchableOpacity>
//         </View>

//         <AppButton title="Login" onPress={handleLogin} />

//         <View style={{ flex: 1 }} />

//         <AppButton
//           title="Create new account"
//           onPress={() => navigation.navigate("Role")}
//           style={styles.signupBtn}
//         />
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },

//   inner: {
//     flex: 1,
//     padding: 20,
//   },

//   logo: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginTop: 40,
//   },

//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     textAlign: "center",
//     color: colors.primary,
//     marginVertical: 20,
//     letterSpacing: 1,
//   },

//   inputContainer: {
//     backgroundColor: colors.card,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: colors.border,
//     marginVertical: 8,
//     paddingHorizontal: 12,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   input: {
//     flex: 1,
//     height: 45,
//     fontSize: 16,
//     color: colors.textPrimary,
//   },

//   passwordInput: {
//     flex: 1,
//     height: 45,
//     fontSize: 16,
//     color: colors.textPrimary,
//   },

//   eyeIcon: {
//     padding: 5,
//   },

//   rememberContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 10,
//   },

//   checkbox: {
//     width: 18,
//     height: 18,
//     borderWidth: 1,
//     borderColor: colors.textSecondary,
//     marginRight: 8,
//   },

//   checked: {
//     backgroundColor: colors.primary,
//   },

//   rememberText: {
//     fontSize: 14,
//     color: colors.textPrimary,
//   },

//   forgot: {
//     textAlign: "center",
//     color: colors.primary,
//     marginTop: 15,
//     fontSize: 16,
//   },

//   signupBtn: {
//     marginBottom: 20,
//   },
// });












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
import Ionicons from "react-native-vector-icons/Ionicons";
import AppButton from "../../components/AppButton";
import colors from "../utils/colors";

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Check API or credentials"
      );
    }
  };

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

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter Email"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password Input with Eye Icon */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
            placeholderTextColor="#888"
          />

          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
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

  inputContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#000",
  },

  passwordInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#000",
  },

  eyeIcon: {
    padding: 5,
  },

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