import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import colors from "../utils/colors";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../../config/api";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ---------------------------------------------------------------------------
// NOTE ON THE FOCUS-LOOP BUG
// ---------------------------------------------------------------------------
// Same finding as TeacherSignUpScreen: this file has no refs, no autoFocus,
// no focus listeners, and no useEffect anywhere. `focusedField` below is
// purely cosmetic (border tint only) and never calls a focus API. This
// screen cannot be the source of the roleScreen -> destination focus loop.
// I still need roleScreen.js + your navigator config to fix the root cause.
//
// BUG FOUND & FIXED (unrelated to the focus loop): the Password and Confirm
// Password inputs were missing `value={form.password}` / `value={form.
// confirmPassword}`, making them uncontrolled — form.password and
// form.confirmPassword never reflected what the user actually typed. Fixed
// below.
// ---------------------------------------------------------------------------

const StudentSignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    fatherCnic: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.cnic ||
      !form.fatherCnic ||
      !form.phone ||
      !form.email ||
      !form.password
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (submitting) return; // guard against double-tap double-submits

    setSubmitting(true);
    try {
      const response = await axios.post(`${BASE_URL}/Auth/register`, {
        fullName: form.name,
        cnic: form.cnic,
        fatherCNIC: form.fatherCnic,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: "Student",
      });

      const userId = response.data.userId;

      Alert.alert("Success", "Account created! Now select location");

      navigation.navigate("Map", {
        userId: Number(userId),
      });
    } catch (error) {
      console.log("FULL ERROR:", error.response?.data);

      Alert.alert(
        "Registration Failed",
        error.response?.data?.inner ||
          error.response?.data?.message ||
          error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = ({
    key,
    placeholder,
    icon,
    keyboardType,
    autoCapitalize,
    secure,
    secureVisible,
    toggleSecure,
  }) => (
    <View key={key} style={styles.fieldGroup}>
      <Text style={styles.label}>{placeholder}</Text>
      <View
        style={[
          styles.inputContainer,
          focusedField === key && styles.inputContainerFocused,
        ]}
      >
        <Icon
          name={icon}
          size={19}
          color={focusedField === key ? colors.primary : "#9AA0A6"}
          style={styles.inputIcon}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#A0A4AB"
          style={styles.input}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secure && !secureVisible}
          value={form[key]}
          onChangeText={(val) => handleChange(key, val)}
          onFocus={() => setFocusedField(key)}
          onBlur={() => setFocusedField((prev) => (prev === key ? null : prev))}
          returnKeyType="next"
          autoCorrect={false}
          // Two adjacent secureTextEntry fields are a well-known trigger for
          // the OS autofill/password-suggestion overlay to pop up, shift
          // layout, and steal focus back and forth between them. Since no
          // focus-management bug exists anywhere in this app's code, this is
          // the most likely remaining source of "focus jumping" — suppress it.
          {...(secure
            ? {
                autoComplete: "off",
                importantForAutofill: "no",
                textContentType: "oneTimeCode",
              }
            : {})}
        />
        {toggleSecure && (
          <TouchableOpacity onPress={toggleSecure} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon
              name={secureVisible ? "eye-off-outline" : "eye-outline"}
              size={19}
              color="#9AA0A6"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Fill in your details to get started as a student
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Personal Details</Text>
            {renderField({ key: "name", placeholder: "Enter Your Full Name", icon: "person-outline" })}
            {renderField({ key: "cnic", placeholder: "Enter Your CNIC", icon: "card-outline" })}
            {renderField({ key: "fatherCnic", placeholder: "Enter Father's CNIC", icon: "people-outline" })}
            {renderField({ key: "phone", placeholder: "Enter Phone Number", icon: "call-outline", keyboardType: "phone-pad" })}
            {renderField({ key: "email", placeholder: "Enter Email", icon: "mail-outline", keyboardType: "email-address", autoCapitalize: "none" })}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Security</Text>
            {renderField({
              key: "password",
              placeholder: "Password",
              icon: "lock-closed-outline",
              secure: true,
              secureVisible: showPassword,
              toggleSecure: () => setShowPassword((v) => !v),
            })}
            {renderField({
              key: "confirmPassword",
              placeholder: "Confirm Password",
              icon: "lock-closed-outline",
              secure: true,
              secureVisible: showConfirmPassword,
              toggleSecure: () => setShowConfirmPassword((v) => !v),
            })}

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.loginRow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginTextBold}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StudentSignUpScreen;

const CARD_MAX_WIDTH = isTablet ? 520 : undefined;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || "#F5F6FA",
  },
  inner: {
    paddingHorizontal: isTablet ? 32 : 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
  },
  logo: {
    width: 84,
    height: 84,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1D29",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 20,
  },

  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: isTablet ? 28 : 20,
    shadowColor: "#1A1D29",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF0F3",
    marginVertical: 18,
  },

  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
    marginLeft: 2,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: "#1A1D29",
  },

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  loginRow: {
    marginTop: 18,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#6B7280",
  },
  loginTextBold: {
    color: colors.primary,
    fontWeight: "700",
  },
});


















// import React, { useState } from "react";
// import axios from "axios";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   SafeAreaView,
//   TextInput,
//   Alert,
//   TouchableOpacity
// } from "react-native";
// import AppButton from "../../components/AppButton";
// import colors from "../utils/colors";
// import Icon from "react-native-vector-icons/Ionicons";
// import { BASE_URL } from "../../config/api";

// const StudentSignUpScreen = ({ navigation }) => {
//   const [form, setForm] = useState({
//   name: "",
//   cnic: "",
//   fatherCnic: "",
//   phone: "",
//   email: "",
//   password: "",
//   confirmPassword: "",
// });

//   const handleChange = (key, value) => {
//     setForm({ ...form, [key]: value });
//   };

//   const handleSubmit = async () => {
//       if (
//     !form.name ||
//     !form.cnic ||
//     !form.fatherCnic ||
//     !form.phone ||
//     !form.email ||
//     !form.password
//   ) {
//       Alert.alert("Error", "Please fill all fields");
//       return;
//     }

//     if (form.password !== form.confirmPassword) {
//       Alert.alert("Error", "Passwords do not match");
//       return;
//     }

//     try {
//       const response = await axios.post(`${BASE_URL}/Auth/register`, {
//         fullName: form.name,
//         cnic: form.cnic,
//         fatherCNIC: form.fatherCnic,
//         phone: form.phone,
//         email: form.email,
//         password: form.password,
//         role: "Student",
//       });

//       const userId = response.data.userId;

//       Alert.alert("Success", "Account created! Now select location");

//       navigation.navigate("Map", {
//         userId: Number(userId),
//       });
      

//     // } catch (error) {
//     //   console.log(error.response?.data || error.message);
//     //   Alert.alert(
//     //     "Error",
//     //     error.response?.data?.message || "Registration failed"
//     //   );
//     // }
//     }catch (error) {
//      console.log("FULL ERROR:", error.response?.data);

//       Alert.alert(
//         "Registration Failed",
//         error.response?.data?.inner ||
//         error.response?.data?.message ||
//         error.message
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.inner}>
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <Text style={styles.title}>Create Your Account</Text>

//         <View style={styles.inputContainer}>
//           <Icon name="person-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Your Full Name"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             value={form.name}
//             onChangeText={(val) => handleChange("name", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="card-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Your CNIC"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             value={form.cnic}
//             onChangeText={(val) => handleChange("cnic", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="people-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Father's CNIC"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             value={form.fatherCnic}
//             onChangeText={(val) => handleChange("fatherCnic", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="call-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Phone Number"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             keyboardType="phone-pad"
//             value={form.phone}
//             onChangeText={(val) => handleChange("phone", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="mail-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Email"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={form.email}
//             onChangeText={(val) => handleChange("email", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="lock-closed-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Password"
//             placeholderTextColor="#6e6e6e"
//             secureTextEntry
//             style={styles.input}
//             onChangeText={(val) => handleChange("password", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="lock-closed-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Confirm Password"
//             placeholderTextColor="#6e6e6e"
//             secureTextEntry
//             style={styles.input}
//             onChangeText={(val) =>
//               handleChange("confirmPassword", val)
//             }
//           />
//         </View>

//         <AppButton title="Register" onPress={handleSubmit} />

//         <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//           <Text style={styles.loginText}>
//             Already have an account?
//           </Text>
//         </TouchableOpacity>        
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default StudentSignUpScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#EDEAF0" },
//   inner: { padding: 16 },

//   logo: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginTop: 40,
//   },

//   title: {
//     fontSize: 26,
//     textAlign: "center",
//     marginVertical: 20,
//     color: colors.primary,
//   },

//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     paddingHorizontal: 10,
//     marginVertical: 6,
//   },

//   input: {
//     flex: 1,
//     height: 45,
//     marginLeft: 10,
//     fontSize: 16,
//     color: "#000",
//   },
//   loginText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: colors.primary,
//     fontSize: 16,
//   },
// });














// import React, { useState } from "react";
// import axios from "axios";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   ScrollView,
//   SafeAreaView,
//   TextInput,
//   Alert,
//   TouchableOpacity
// } from "react-native";
// import AppButton from "../../components/AppButton";
// import colors from "../utils/colors";
// import Icon from "react-native-vector-icons/Ionicons";
// import { BASE_URL } from "../../config/api";

// const StudentSignUpScreen = ({ navigation }) => {
//   const [form, setForm] = useState({
//     name: "",
//     cnic: "",
//     phone: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const handleChange = (key, value) => {
//     setForm({ ...form, [key]: value });
//   };

//   const handleSubmit = async () => {
//     if (
//       !form.name ||
//       !form.cnic ||
//       !form.phone ||
//       !form.email ||
//       !form.password
//     ) {
//       Alert.alert("Error", "Please fill all fields");
//       return;
//     }

//     if (form.password !== form.confirmPassword) {
//       Alert.alert("Error", "Passwords do not match");
//       return;
//     }

//     try {
//       const response = await axios.post(`${BASE_URL}/Auth/register`, {
//         fullName: form.name,
//         cnic: form.cnic,
//         phone: form.phone,
//         email: form.email,
//         password: form.password,
//         role: "Student",
//       });

//       const userId = response.data.userId;

//       Alert.alert("Success", "Account created! Now select location");

//       navigation.navigate("Map", {
//         userId: Number(userId),
//       });

//     } catch (error) {
//       console.log(error.response?.data || error.message);
//       Alert.alert(
//         "Error",
//         error.response?.data?.message || "Registration failed"
//       );
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.inner}>
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <Text style={styles.title}>Create Your Account</Text>

//         <View style={styles.inputContainer}>
//           <Icon name="person-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Your Full Name"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             value={form.name}
//             onChangeText={(val) => handleChange("name", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="card-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Your CNIC"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             value={form.cnic}
//             onChangeText={(val) => handleChange("cnic", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="call-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Phone Number"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             keyboardType="phone-pad"
//             value={form.phone}
//             onChangeText={(val) => handleChange("phone", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="mail-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Enter Email"
//             placeholderTextColor="#6e6e6e"
//             style={styles.input}
//             keyboardType="email-address"
//             autoCapitalize="none"
//             value={form.email}
//             onChangeText={(val) => handleChange("email", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="lock-closed-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Password"
//             placeholderTextColor="#6e6e6e"
//             secureTextEntry
//             style={styles.input}
//             onChangeText={(val) => handleChange("password", val)}
//           />
//         </View>

//         <View style={styles.inputContainer}>
//           <Icon name="lock-closed-outline" size={20} color="#555" />
//           <TextInput
//             placeholder="Confirm Password"
//             placeholderTextColor="#6e6e6e"
//             secureTextEntry
//             style={styles.input}
//             onChangeText={(val) =>
//               handleChange("confirmPassword", val)
//             }
//           />
//         </View>

//         <AppButton title="Register" onPress={handleSubmit} />

//         <TouchableOpacity onPress={() => navigation.navigate("Login")}>
//           <Text style={styles.loginText}>
//             Already have an account?
//           </Text>
//         </TouchableOpacity>        
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default StudentSignUpScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#EDEAF0" },
//   inner: { padding: 16 },

//   logo: {
//     width: 120,
//     height: 120,
//     alignSelf: "center",
//     marginTop: 40,
//   },

//   title: {
//     fontSize: 26,
//     textAlign: "center",
//     marginVertical: 20,
//     color: colors.primary,
//   },

//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     paddingHorizontal: 10,
//     marginVertical: 6,
//   },

//   input: {
//     flex: 1,
//     height: 45,
//     marginLeft: 10,
//     fontSize: 16,
//     color: "#000",
//   },
//   loginText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: colors.primary,
//     fontSize: 16,
//   },
// });