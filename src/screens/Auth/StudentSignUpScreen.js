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

const StudentSignUpScreen = ({ navigation }) => {
  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    name: "",
    cnic: "",
    fatherCnic: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Backend requires:
    // ByMe OR ByParent
    feeResponsibility: "",
  });

  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================
  // HANDLE FEE RESPONSIBILITY
  // ============================================================

  const selectFeeResponsibility = (value) => {
    setForm((prev) => ({
      ...prev,
      feeResponsibility: value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    // ----------------------------------------------------------
    // Required fields
    // ----------------------------------------------------------

    if (
      !form.name.trim() ||
      !form.cnic.trim() ||
      !form.fatherCnic.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // ----------------------------------------------------------
    // Password
    // ----------------------------------------------------------

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // ----------------------------------------------------------
    // Fee Responsibility
    // ----------------------------------------------------------

    if (!form.feeResponsibility) {
      Alert.alert(
        "Fee Discussion Required",
        "Please select whether the fee will be discussed by you or by your parent."
      );
      return;
    }

    // ----------------------------------------------------------
    // Prevent double submit
    // ----------------------------------------------------------

    if (submitting) return;

    setSubmitting(true);

    try {
      // ========================================================
      // API REQUEST
      // ========================================================

      const requestData = {
        fullName: form.name.trim(),
        cnic: form.cnic.trim(),
        fatherCNIC: form.fatherCnic.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "Student",

        // IMPORTANT:
        // Backend expects exactly:
        // "ByMe" OR "ByParent"
        feeResponsibility: form.feeResponsibility,
      };

      console.log("REGISTER REQUEST:", requestData);

      const response = await axios.post(
        `${BASE_URL}/Auth/register`,
        requestData
      );

      console.log("REGISTER RESPONSE:", response.data);

      const userId = response.data.userId;

      // ========================================================
      // SUCCESS
      // ========================================================

      Alert.alert(
        "Success",
        "Account created successfully! Now select your location.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Map", {
                userId: Number(userId),
              });
            },
          },
        ]
      );
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("ERROR RESPONSE:", error.response?.data);

      const errorMessage =
        error.response?.data?.inner ||
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        "Something went wrong during registration.";

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // INPUT FIELD
  // ============================================================

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
          autoCapitalize={autoCapitalize || "sentences"}
          secureTextEntry={secure && !secureVisible}
          value={form[key]}
          onChangeText={(val) => handleChange(key, val)}
          onFocus={() => setFocusedField(key)}
          onBlur={() =>
            setFocusedField((prev) => (prev === key ? null : prev))
          }
          returnKeyType="next"
          autoCorrect={false}
          {...(secure
            ? {
                autoComplete: "off",
                importantForAutofill: "no",
                textContentType: "oneTimeCode",
              }
            : {})}
        />

        {toggleSecure && (
          <TouchableOpacity
            onPress={toggleSecure}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Icon
              name={
                secureVisible
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={19}
              color="#9AA0A6"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ============================================================
  // UI
  // ============================================================

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
          {/* ==================================================
              HEADER
          ================================================== */}

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

          {/* ==================================================
              FORM CARD
          ================================================== */}

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>
              Personal Details
            </Text>

            {renderField({
              key: "name",
              placeholder: "Enter Your Full Name",
              icon: "person-outline",
            })}

            {renderField({
              key: "cnic",
              placeholder: "Enter Your CNIC",
              icon: "card-outline",
            })}

            {renderField({
              key: "fatherCnic",
              placeholder: "Enter Father's CNIC",
              icon: "people-outline",
            })}

            {renderField({
              key: "phone",
              placeholder: "Enter Phone Number",
              icon: "call-outline",
              keyboardType: "phone-pad",
            })}

            {renderField({
              key: "email",
              placeholder: "Enter Email",
              icon: "mail-outline",
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}

            {/* ==================================================
                FEE DISCUSSION
            ================================================== */}

            <View style={styles.feeSection}>
              <Text style={styles.feeLabel}>
                Fee Discussion:
              </Text>

              <View style={styles.feeOptionsRow}>
                {/* ==================================================
                    BY ME
                ================================================== */}

                <TouchableOpacity
                  style={[
                    styles.feeOption,
                    form.feeResponsibility === "ByMe" &&
                      styles.feeOptionSelected,
                  ]}
                  onPress={() =>
                    selectFeeResponsibility("ByMe")
                  }
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      form.feeResponsibility === "ByMe" &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {form.feeResponsibility === "ByMe" && (
                      <Icon
                        name="checkmark"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.feeOptionText,
                      form.feeResponsibility === "ByMe" &&
                        styles.feeOptionTextSelected,
                    ]}
                  >
                    By me
                  </Text>
                </TouchableOpacity>

                {/* ==================================================
                    BY PARENT
                ================================================== */}

                <TouchableOpacity
                  style={[
                    styles.feeOption,
                    form.feeResponsibility === "ByParent" &&
                      styles.feeOptionSelected,
                  ]}
                  onPress={() =>
                    selectFeeResponsibility("ByParent")
                  }
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      form.feeResponsibility === "ByParent" &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {form.feeResponsibility === "ByParent" && (
                      <Icon
                        name="checkmark"
                        size={16}
                        color="#FFFFFF"
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.feeOptionText,
                      form.feeResponsibility === "ByParent" &&
                        styles.feeOptionTextSelected,
                    ]}
                  >
                    By Parent
                  </Text>
                </TouchableOpacity>
              </View>

              {!form.feeResponsibility && (
                <Text style={styles.feeHint}>
                  Please select one option
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* ==================================================
                SECURITY
            ================================================== */}

            <Text style={styles.sectionLabel}>
              Security
            </Text>

            {renderField({
              key: "password",
              placeholder: "Password",
              icon: "lock-closed-outline",
              secure: true,
              secureVisible: showPassword,
              toggleSecure: () =>
                setShowPassword((v) => !v),
            })}

            {renderField({
              key: "confirmPassword",
              placeholder: "Confirm Password",
              icon: "lock-closed-outline",
              secure: true,
              secureVisible: showConfirmPassword,
              toggleSecure: () =>
                setShowConfirmPassword((v) => !v),
            })}

            {/* ==================================================
                REGISTER BUTTON
            ================================================== */}

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Register
                </Text>
              )}
            </TouchableOpacity>

            {/* ==================================================
                LOGIN
            ================================================== */}

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              style={styles.loginRow}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginTextBold}>
                  Log in
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StudentSignUpScreen;

// ============================================================
// CONSTANTS
// ============================================================

const CARD_MAX_WIDTH = isTablet ? 520 : undefined;

// ============================================================
// STYLES
// ============================================================

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

  // ==========================================================
  // HEADER
  // ==========================================================

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

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    width: "100%",
    maxWidth: CARD_MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: isTablet ? 28 : 20,

    shadowColor: "#1A1D29",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 16,

    elevation: 3,
  },

  // ==========================================================
  // SECTION
  // ==========================================================

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

  // ==========================================================
  // INPUT
  // ==========================================================

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

  // ==========================================================
  // FEE DISCUSSION
  // ==========================================================

  feeSection: {
    marginTop: 4,
    marginBottom: 8,
  },

  feeLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },

  feeOptionsRow: {
    flexDirection: "row",
    gap: 10,
  },

  feeOption: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },

  feeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F0FAF8",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#C7CDD4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  feeOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },

  feeOptionTextSelected: {
    color: colors.primary,
    fontWeight: "700",
  },

  feeHint: {
    fontSize: 11.5,
    color: "#9CA3AF",
    marginTop: 7,
    marginLeft: 2,
  },

  // ==========================================================
  // REGISTER
  // ==========================================================

  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,

    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
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

  // ==========================================================
  // LOGIN
  // ==========================================================

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
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Dimensions,
// } from "react-native";
// import colors from "../utils/colors";
// import Icon from "react-native-vector-icons/Ionicons";
// import { BASE_URL } from "../../config/api";

// const { width } = Dimensions.get("window");
// const isTablet = width >= 768;

// // ---------------------------------------------------------------------------
// // NOTE ON THE FOCUS-LOOP BUG
// // ---------------------------------------------------------------------------
// // Same finding as TeacherSignUpScreen: this file has no refs, no autoFocus,
// // no focus listeners, and no useEffect anywhere. `focusedField` below is
// // purely cosmetic (border tint only) and never calls a focus API. This
// // screen cannot be the source of the roleScreen -> destination focus loop.
// // I still need roleScreen.js + your navigator config to fix the root cause.
// //
// // BUG FOUND & FIXED (unrelated to the focus loop): the Password and Confirm
// // Password inputs were missing `value={form.password}` / `value={form.
// // confirmPassword}`, making them uncontrolled — form.password and
// // form.confirmPassword never reflected what the user actually typed. Fixed
// // below.
// // ---------------------------------------------------------------------------

// const StudentSignUpScreen = ({ navigation }) => {
//   const [form, setForm] = useState({
//     name: "",
//     cnic: "",
//     fatherCnic: "",
//     phone: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [focusedField, setFocusedField] = useState(null);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleSubmit = async () => {
//     if (
//       !form.name ||
//       !form.cnic ||
//       !form.fatherCnic ||
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

//     if (submitting) return; // guard against double-tap double-submits

//     setSubmitting(true);
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
//     } catch (error) {
//       console.log("FULL ERROR:", error.response?.data);

//       Alert.alert(
//         "Registration Failed",
//         error.response?.data?.inner ||
//           error.response?.data?.message ||
//           error.message
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const renderField = ({
//     key,
//     placeholder,
//     icon,
//     keyboardType,
//     autoCapitalize,
//     secure,
//     secureVisible,
//     toggleSecure,
//   }) => (
//     <View key={key} style={styles.fieldGroup}>
//       <Text style={styles.label}>{placeholder}</Text>
//       <View
//         style={[
//           styles.inputContainer,
//           focusedField === key && styles.inputContainerFocused,
//         ]}
//       >
//         <Icon
//           name={icon}
//           size={19}
//           color={focusedField === key ? colors.primary : "#9AA0A6"}
//           style={styles.inputIcon}
//         />
//         <TextInput
//           placeholder={placeholder}
//           placeholderTextColor="#A0A4AB"
//           style={styles.input}
//           keyboardType={keyboardType || "default"}
//           autoCapitalize={autoCapitalize}
//           secureTextEntry={secure && !secureVisible}
//           value={form[key]}
//           onChangeText={(val) => handleChange(key, val)}
//           onFocus={() => setFocusedField(key)}
//           onBlur={() => setFocusedField((prev) => (prev === key ? null : prev))}
//           returnKeyType="next"
//           autoCorrect={false}
//           // Two adjacent secureTextEntry fields are a well-known trigger for
//           // the OS autofill/password-suggestion overlay to pop up, shift
//           // layout, and steal focus back and forth between them. Since no
//           // focus-management bug exists anywhere in this app's code, this is
//           // the most likely remaining source of "focus jumping" — suppress it.
//           {...(secure
//             ? {
//                 autoComplete: "off",
//                 importantForAutofill: "no",
//                 textContentType: "oneTimeCode",
//               }
//             : {})}
//         />
//         {toggleSecure && (
//           <TouchableOpacity onPress={toggleSecure} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//             <Icon
//               name={secureVisible ? "eye-off-outline" : "eye-outline"}
//               size={19}
//               color="#9AA0A6"
//             />
//           </TouchableOpacity>
//         )}
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//       >
//         <ScrollView
//           contentContainerStyle={styles.inner}
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Header */}
//           <View style={styles.header}>
//             <Image
//               source={require("../../../assets/images/logo.png")}
//               style={styles.logo}
//               resizeMode="contain"
//             />
//             <Text style={styles.title}>Create Your Account</Text>
//             <Text style={styles.subtitle}>
//               Fill in your details to get started as a student
//             </Text>
//           </View>

//           {/* Form Card */}
//           <View style={styles.card}>
//             <Text style={styles.sectionLabel}>Personal Details</Text>
//             {renderField({ key: "name", placeholder: "Enter Your Full Name", icon: "person-outline" })}
//             {renderField({ key: "cnic", placeholder: "Enter Your CNIC", icon: "card-outline" })}
//             {renderField({ key: "fatherCnic", placeholder: "Enter Father's CNIC", icon: "people-outline" })}
//             {renderField({ key: "phone", placeholder: "Enter Phone Number", icon: "call-outline", keyboardType: "phone-pad" })}
//             {renderField({ key: "email", placeholder: "Enter Email", icon: "mail-outline", keyboardType: "email-address", autoCapitalize: "none" })}

//             <View style={styles.divider} />

//             <Text style={styles.sectionLabel}>Security</Text>
//             {renderField({
//               key: "password",
//               placeholder: "Password",
//               icon: "lock-closed-outline",
//               secure: true,
//               secureVisible: showPassword,
//               toggleSecure: () => setShowPassword((v) => !v),
//             })}
//             {renderField({
//               key: "confirmPassword",
//               placeholder: "Confirm Password",
//               icon: "lock-closed-outline",
//               secure: true,
//               secureVisible: showConfirmPassword,
//               toggleSecure: () => setShowConfirmPassword((v) => !v),
//             })}

//             <TouchableOpacity
//               style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
//               onPress={handleSubmit}
//               disabled={submitting}
//               activeOpacity={0.85}
//             >
//               {submitting ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Register</Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() => navigation.navigate("Login")}
//               style={styles.loginRow}
//               hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//             >
//               <Text style={styles.loginText}>
//                 Already have an account?{" "}
//                 <Text style={styles.loginTextBold}>Log in</Text>
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default StudentSignUpScreen;

// const CARD_MAX_WIDTH = isTablet ? 520 : undefined;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background || "#F5F6FA",
//   },
//   inner: {
//     paddingHorizontal: isTablet ? 32 : 20,
//     paddingTop: 24,
//     paddingBottom: 40,
//     alignItems: "center",
//   },

//   header: {
//     alignItems: "center",
//     marginBottom: 24,
//     width: "100%",
//     maxWidth: CARD_MAX_WIDTH,
//   },
//   logo: {
//     width: 84,
//     height: 84,
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1A1D29",
//     textAlign: "center",
//     letterSpacing: -0.3,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     textAlign: "center",
//     marginTop: 6,
//     paddingHorizontal: 16,
//     lineHeight: 20,
//   },

//   card: {
//     width: "100%",
//     maxWidth: CARD_MAX_WIDTH,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 18,
//     padding: isTablet ? 28 : 20,
//     shadowColor: "#1A1D29",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.06,
//     shadowRadius: 16,
//     elevation: 3,
//   },

//   sectionLabel: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: colors.primary,
//     textTransform: "uppercase",
//     letterSpacing: 0.6,
//     marginBottom: 12,
//     marginTop: 4,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#EEF0F3",
//     marginVertical: 18,
//   },

//   fieldGroup: {
//     marginBottom: 14,
//   },
//   label: {
//     fontSize: 12.5,
//     fontWeight: "600",
//     color: "#4B5563",
//     marginBottom: 6,
//     marginLeft: 2,
//   },

//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#F9FAFB",
//     borderRadius: 12,
//     borderWidth: 1.5,
//     borderColor: "#E5E7EB",
//     paddingHorizontal: 14,
//   },
//   inputContainerFocused: {
//     borderColor: colors.primary,
//     backgroundColor: "#FFFFFF",
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 46,
//     fontSize: 15,
//     color: "#1A1D29",
//   },

//   submitButton: {
//     backgroundColor: colors.primary,
//     borderRadius: 12,
//     height: 50,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//     shadowColor: colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     elevation: 2,
//   },
//   submitButtonDisabled: {
//     opacity: 0.7,
//   },
//   submitButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 0.2,
//   },

//   loginRow: {
//     marginTop: 18,
//     alignItems: "center",
//   },
//   loginText: {
//     fontSize: 14,
//     color: "#6B7280",
//   },
//   loginTextBold: {
//     color: colors.primary,
//     fontWeight: "700",
//   },
// });