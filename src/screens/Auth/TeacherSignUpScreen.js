import React, { useState } from "react";
import axios from "axios";

import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
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

// ============================================================
// FIELD CONFIG
// ============================================================

const FIELD_CONFIG = [
  {
    key: "name",
    placeholder: "Full Name",
    icon: "person-outline",
  },
  {
    key: "cnic",
    placeholder: "CNIC",
    icon: "card-outline",
  },
  {
    key: "phone",
    placeholder: "Phone",
    icon: "call-outline",
    keyboardType: "phone-pad",
  },
  {
    key: "email",
    placeholder: "Email",
    icon: "mail-outline",
    keyboardType: "email-address",
  },
  {
    key: "qualification",
    placeholder: "Qualification",
    icon: "school-outline",
  },
  {
    key: "radius",
    placeholder: "Radius (km)",
    icon: "location-outline",
    keyboardType: "numeric",
  },
  {
    key: "experience",
    placeholder: "Experience (years)",
    icon: "briefcase-outline",
    keyboardType: "numeric",
  },
];

// ============================================================
// SCREEN
// ============================================================

const TeacherSignUpScreen = ({ navigation }) => {
  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    name: "",
    cnic: "",
    phone: "",
    email: "",
    qualification: "",
    radius: "",
    experience: "",
    password: "",
    confirmPassword: "",
  });

  // ==========================================================
  // TEACHING MODE
  //
  // Possible values:
  // "Visiting"
  // "Non-Visiting"
  // ==========================================================

  const [teachingMode, setTeachingMode] = useState("");

  // ==========================================================
  // OTHER STATES
  // ==========================================================

  const [focusedField, setFocusedField] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // HANDLE INPUT
  // ============================================================

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ============================================================
  // HANDLE TEACHING MODE
  // ============================================================

  const handleTeachingModeChange = (mode) => {
    setTeachingMode(mode);

    // ==========================================================
    // NON-VISITING
    //
    // Radius is not required.
    // Clear radius when Non-Visiting is selected.
    // ==========================================================

    if (mode === "Non-Visiting") {
      setForm((prev) => ({
        ...prev,
        radius: "",
      }));
    }
  };

  // ============================================================
  // HANDLE REGISTER
  // ============================================================

  const handleSubmit = async () => {
    // ==========================================================
    // STEP 1: BASIC REQUIRED FIELDS
    // ==========================================================

    if (
      !form.name.trim() ||
      !form.cnic.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.qualification.trim()
    ) {
      Alert.alert(
        "Error",
        "Please fill all required fields."
      );
      return;
    }

    // ==========================================================
    // STEP 2: TEACHING MODE REQUIRED
    // ==========================================================

    if (
      teachingMode !== "Visiting" &&
      teachingMode !== "Non-Visiting"
    ) {
      Alert.alert(
        "Error",
        "Please select Type: Visiting or Non-Visiting."
      );
      return;
    }

    // ==========================================================
    // STEP 3: RADIUS VALIDATION
    //
    // Visiting:
    //     Radius is REQUIRED
    //
    // Non-Visiting:
    //     Radius is NOT REQUIRED
    // ==========================================================

    if (teachingMode === "Visiting") {
      if (!form.radius.trim()) {
        Alert.alert(
          "Error",
          "Radius is required for Visiting tutors."
        );
        return;
      }

      const radiusValue = Number(form.radius);

      if (isNaN(radiusValue) || radiusValue <= 0) {
        Alert.alert(
          "Error",
          "Please enter a valid radius greater than 0."
        );
        return;
      }
    }

    // ==========================================================
    // STEP 4: PASSWORD CHECK
    // ==========================================================

    if (form.password !== form.confirmPassword) {
      Alert.alert(
        "Error",
        "Passwords do not match."
      );
      return;
    }

    // ==========================================================
    // STEP 5: PREVENT DOUBLE SUBMIT
    // ==========================================================

    if (submitting) {
      return;
    }

    setSubmitting(true);

    // ==========================================================
    // STEP 6: PREPARE RADIUS
    //
    // Visiting:
    //     Send actual number
    //
    // Non-Visiting:
    //     Send null
    // ==========================================================

    let radiusValue = null;

    if (teachingMode === "Visiting") {
      radiusValue = Number(form.radius);
    }

    // ==========================================================
    // STEP 7: PREPARE EXPERIENCE
    // ==========================================================

    let experienceValue = 0;

    if (form.experience.trim()) {
      experienceValue = Number(form.experience);

      if (isNaN(experienceValue) || experienceValue < 0) {
        Alert.alert(
          "Error",
          "Please enter a valid experience."
        );

        setSubmitting(false);
        return;
      }
    }

    // ==========================================================
    // STEP 8: REQUEST BODY
    // ==========================================================

    const requestBody = {
      fullName: form.name.trim(),

      cnic: form.cnic.trim(),

      phone: form.phone.trim(),

      email: form.email.trim().toLowerCase(),

      qualification: form.qualification.trim(),

      // Visiting -> number
      // Non-Visiting -> null
      radius: radiusValue,

      experience: experienceValue,

      password: form.password,

      role: "Tutor",

      teachingMode: teachingMode,
    };

    // ==========================================================
    // DEBUG LOG
    // ==========================================================

    console.log("=================================");
    console.log("TUTOR REGISTER REQUEST:");
    console.log(
      JSON.stringify(
        requestBody,
        null,
        2
      )
    );

    console.log(
      "REGISTER URL:",
      `${BASE_URL}/Auth/register`
    );

    console.log(
      "TEACHING MODE:",
      teachingMode
    );

    console.log(
      "RADIUS:",
      radiusValue
    );

    console.log("=================================");

    // ==========================================================
    // STEP 9: API CALL
    // ==========================================================

    try {
      const response = await axios.post(
        `${BASE_URL}/Auth/register`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          timeout: 15000,
        }
      );

      // ========================================================
      // RESPONSE LOG
      // ========================================================

      console.log("=================================");
      console.log("TUTOR REGISTER RESPONSE:");

      console.log(
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      console.log("=================================");

      // ========================================================
      // STEP 10: GET USER ID
      // ========================================================

      const userId = response.data?.userId;

      if (!userId) {
        Alert.alert(
          "Error",
          "Registration succeeded but UserId was not received."
        );

        return;
      }

      // ========================================================
      // STEP 11: POST-REGISTRATION NAVIGATION
      //
      // Visiting:
      //     Map
      //
      // Non-Visiting:
      //     Login
      // ========================================================

      if (teachingMode === "Visiting") {
        // ======================================================
        // VISITING TUTOR
        //
        // Tutor must select location.
        // Send userId to Map screen.
        // ======================================================

        Alert.alert(
          "Success",
          "Account created successfully! Now select your location.",
          [
            {
              text: "OK",

              onPress: () => {
                navigation.navigate(
                  "Map",
                  {
                    userId: Number(userId),
                  }
                );
              },
            },
          ]
        );
      } else {
        // ======================================================
        // NON-VISITING TUTOR
        //
        // No location required.
        // Go directly to Login.
        // ======================================================

        Alert.alert(
          "Success",
          "Account created successfully! Please login to continue.",
          [
            {
              text: "OK",

              onPress: () => {
                navigation.navigate("Login");
              },
            },
          ]
        );
      }
    } catch (error) {
      // ========================================================
      // ERROR LOG
      // ========================================================

      console.log("=================================");
      console.log("TUTOR REGISTER ERROR:");

      console.log(
        "Status:",
        error.response?.status
      );

      console.log(
        "Data:",
        error.response?.data
      );

      console.log(
        "Message:",
        error.message
      );

      console.log("=================================");

      // ========================================================
      // ERROR MESSAGE
      // ========================================================

      let errorMessage =
        "Registration failed.";

      if (error.response?.data) {
        const data =
          error.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.title) {
          errorMessage = data.title;
        } else if (data.errors) {
          errorMessage =
            JSON.stringify(
              data.errors
            );
        }
      } else if (error.message) {
        errorMessage =
          error.message;
      }

      Alert.alert(
        "Registration Failed",
        errorMessage
      );
    } finally {
      // ========================================================
      // STOP LOADING
      // ========================================================

      setSubmitting(false);
    }
  };

  // ============================================================
  // RENDER TEXT FIELD
  // ============================================================

  const renderField = ({
    key,
    placeholder,
    icon,
    keyboardType,
    secure,
    toggleSecure,
    secureVisible,
  }) => (
    <View
      key={key}
      style={styles.fieldGroup}
    >
      <Text style={styles.label}>
        {placeholder}
      </Text>

      <View
        style={[
          styles.inputContainer,

          focusedField === key &&
            styles.inputContainerFocused,
        ]}
      >
        <Icon
          name={icon}
          size={19}
          color={
            focusedField === key
              ? colors.primary
              : "#9AA0A6"
          }
          style={styles.inputIcon}
        />

        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#A0A4AB"
          style={styles.input}
          keyboardType={
            keyboardType || "default"
          }
          secureTextEntry={
            secure &&
            !secureVisible
          }
          value={form[key]}
          onChangeText={(value) =>
            handleChange(
              key,
              value
            )
          }
          onFocus={() =>
            setFocusedField(key)
          }
          onBlur={() =>
            setFocusedField(
              (prev) =>
                prev === key
                  ? null
                  : prev
            )
          }
          returnKeyType="next"
          autoCorrect={false}
          autoCapitalize={
            key === "email"
              ? "none"
              : "sentences"
          }
          {...(secure
            ? {
                autoComplete: "off",
                importantForAutofill:
                  "no",
                textContentType:
                  "oneTimeCode",
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
  // TEACHING MODE / TYPE
  //
  // IMPORTANT:
  // Type is now ABOVE Teaching Details.
  // ============================================================

  const renderTeachingMode = () => (
    <View style={styles.modeSection}>
      <Text style={styles.modeTitle}>
        Type
      </Text>

      <Text style={styles.modeSubtitle}>
        Select how you want to teach
      </Text>

      <View style={styles.modeContainer}>

        {/* ====================================================
            VISITING
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.modeOption,

            teachingMode === "Visiting" &&
              styles.modeOptionSelected,
          ]}
          onPress={() =>
            handleTeachingModeChange(
              "Visiting"
            )
          }
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.checkbox,

              teachingMode === "Visiting" &&
                styles.checkboxSelected,
            ]}
          >
            {teachingMode ===
              "Visiting" && (
              <Icon
                name="checkmark"
                size={17}
                color="#FFFFFF"
              />
            )}
          </View>

          <View
            style={styles.modeTextContainer}
          >
            <Text
              style={[
                styles.modeText,

                teachingMode ===
                  "Visiting" &&
                  styles.modeTextSelected,
              ]}
            >
              Visiting
            </Text>

            <Text
              style={
                styles.modeDescription
              }
            >
              Tutor visits the student's
              location
            </Text>
          </View>
        </TouchableOpacity>

        {/* ====================================================
            NON-VISITING
        ==================================================== */}

        <TouchableOpacity
          style={[
            styles.modeOption,

            teachingMode ===
              "Non-Visiting" &&
              styles.modeOptionSelected,
          ]}
          onPress={() =>
            handleTeachingModeChange(
              "Non-Visiting"
            )
          }
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.checkbox,

              teachingMode ===
                "Non-Visiting" &&
                styles.checkboxSelected,
            ]}
          >
            {teachingMode ===
              "Non-Visiting" && (
              <Icon
                name="checkmark"
                size={17}
                color="#FFFFFF"
              />
            )}
          </View>

          <View
            style={styles.modeTextContainer}
          >
            <Text
              style={[
                styles.modeText,

                teachingMode ===
                  "Non-Visiting" &&
                  styles.modeTextSelected,
              ]}
            >
              Non-Visiting
            </Text>

            <Text
              style={
                styles.modeDescription
              }
            >
              Student attends the tutor's
              location
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.inner
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >

          {/* ==================================================
              HEADER
          ================================================== */}

          <View style={styles.header}>
            <Image
              source={require(
                "../../../assets/images/logo.png"
              )}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              Create Tutor Account
            </Text>

            <Text style={styles.subtitle}>
              Set up your profile to start
              teaching on the platform
            </Text>
          </View>

          {/* ==================================================
              FORM CARD
          ================================================== */}

          <View style={styles.card}>

            {/* =================================================
                PERSONAL DETAILS
            ================================================= */}

            <Text
              style={styles.sectionLabel}
            >
              Personal Details
            </Text>

            {renderField(
              FIELD_CONFIG[0]
            )}

            {renderField(
              FIELD_CONFIG[1]
            )}

            {renderField(
              FIELD_CONFIG[2]
            )}

            {renderField(
              FIELD_CONFIG[3]
            )}

            {/* =================================================
                TYPE
                IMPORTANT:
                Type is ABOVE Teaching Details
            ================================================= */}

            <View
              style={styles.divider}
            />

            {renderTeachingMode()}

            {/* =================================================
                TEACHING DETAILS
            ================================================= */}

            <View
              style={styles.divider}
            />

            <Text
              style={styles.sectionLabel}
            >
              Teaching Details
            </Text>

            {/* =================================================
                QUALIFICATION
            ================================================= */}

            {renderField(
              FIELD_CONFIG[4]
            )}

            {/* =================================================
                RADIUS + EXPERIENCE
            ================================================= */}

            <View style={styles.row}>

              {/* =================================================
                  RADIUS

                  Show ONLY for Visiting.
              ================================================= */}

              {teachingMode ===
                "Visiting" && (
                <View
                  style={styles.halfField}
                >
                  {renderField(
                    FIELD_CONFIG[5]
                  )}
                </View>
              )}

              {/* =================================================
                  EXPERIENCE

                  Visiting:
                      Half width

                  Non-Visiting:
                      Full width
              ================================================= */}

              <View
                style={
                  teachingMode ===
                  "Visiting"
                    ? styles.halfField
                    : styles.fullField
                }
              >
                {renderField(
                  FIELD_CONFIG[6]
                )}
              </View>
            </View>

            {/* =================================================
                SECURITY
            ================================================= */}

            <View
              style={styles.divider}
            />

            <Text
              style={styles.sectionLabel}
            >
              Security
            </Text>

            {/* =================================================
                PASSWORD
            ================================================= */}

            {renderField({
              key: "password",
              placeholder: "Password",
              icon: "lock-closed-outline",
              secure: true,
              secureVisible:
                showPassword,
              toggleSecure: () =>
                setShowPassword(
                  (value) =>
                    !value
                ),
            })}

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            {renderField({
              key: "confirmPassword",
              placeholder:
                "Confirm Password",
              icon: "lock-closed-outline",
              secure: true,
              secureVisible:
                showConfirmPassword,
              toggleSecure: () =>
                setShowConfirmPassword(
                  (value) =>
                    !value
                ),
            })}

            {/* =================================================
                REGISTER BUTTON
            ================================================= */}

            <TouchableOpacity
              style={[
                styles.submitButton,

                submitting &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.submitButtonText
                  }
                >
                  Register
                </Text>
              )}
            </TouchableOpacity>

            {/* =================================================
                LOGIN
            ================================================= */}

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  "Login"
                )
              }
              style={styles.loginRow}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              <Text
                style={styles.loginText}
              >
                Already have an account?{" "}
                <Text
                  style={
                    styles.loginTextBold
                  }
                >
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

export default TeacherSignUpScreen;

// ============================================================
// STYLES
// ============================================================

const CARD_MAX_WIDTH =
  isTablet ? 520 : undefined;

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      colors.background ||
      "#F5F6FA",
  },

  inner: {
    paddingHorizontal:
      isTablet ? 32 : 20,

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

    maxWidth:
      CARD_MAX_WIDTH,
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

    maxWidth:
      CARD_MAX_WIDTH,

    backgroundColor:
      "#FFFFFF",

    borderRadius: 18,

    padding:
      isTablet ? 28 : 20,

    shadowColor:
      "#1A1D29",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.06,

    shadowRadius: 16,

    elevation: 3,
  },

  // ==========================================================
  // SECTIONS
  // ==========================================================

  sectionLabel: {
    fontSize: 12,

    fontWeight: "700",

    color:
      colors.primary,

    textTransform:
      "uppercase",

    letterSpacing: 0.6,

    marginBottom: 12,

    marginTop: 4,
  },

  divider: {
    height: 1,

    backgroundColor:
      "#EEF0F3",

    marginVertical: 18,
  },

  // ==========================================================
  // INPUTS
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
    flexDirection:
      "row",

    alignItems:
      "center",

    backgroundColor:
      "#F9FAFB",

    borderRadius: 12,

    borderWidth: 1.5,

    borderColor:
      "#E5E7EB",

    paddingHorizontal: 14,
  },

  inputContainerFocused: {
    borderColor:
      colors.primary,

    backgroundColor:
      "#FFFFFF",
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
  // ROW
  // ==========================================================

  row: {
    flexDirection:
      "row",

    gap: 12,
  },

  halfField: {
    flex: 1,
  },

  // ==========================================================
  // FULL FIELD
  // ==========================================================

  fullField: {
    flex: 1,

    width: "100%",
  },

  // ==========================================================
  // TEACHING MODE / TYPE
  // ==========================================================

  modeSection: {
    marginTop: 4,

    marginBottom: 4,
  },

  modeTitle: {
    fontSize: 13,

    fontWeight: "700",

    color: "#4B5563",

    marginBottom: 3,
  },

  modeSubtitle: {
    fontSize: 12,

    color: "#8A9099",

    marginBottom: 10,
  },

  modeContainer: {
    gap: 10,
  },

  modeOption: {
    flexDirection:
      "row",

    alignItems:
      "center",

    minHeight: 62,

    paddingHorizontal: 13,

    paddingVertical: 10,

    backgroundColor:
      "#F9FAFB",

    borderWidth: 1.5,

    borderColor:
      "#E5E7EB",

    borderRadius: 12,
  },

  modeOptionSelected: {
    borderColor:
      colors.primary,

    backgroundColor:
      "#F2FBF9",
  },

  checkbox: {
    width: 23,

    height: 23,

    borderRadius: 6,

    borderWidth: 1.5,

    borderColor:
      "#C7CBD1",

    alignItems:
      "center",

    justifyContent:
      "center",

    marginRight: 11,
  },

  checkboxSelected: {
    backgroundColor:
      colors.primary,

    borderColor:
      colors.primary,
  },

  modeTextContainer: {
    flex: 1,
  },

  modeText: {
    fontSize: 14.5,

    fontWeight: "700",

    color: "#374151",
  },

  modeTextSelected: {
    color:
      colors.primary,
  },

  modeDescription: {
    fontSize: 11.5,

    color: "#8A9099",

    marginTop: 2,
  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  submitButton: {
    backgroundColor:
      colors.primary,

    borderRadius: 12,

    height: 50,

    alignItems:
      "center",

    justifyContent:
      "center",

    marginTop: 10,

    shadowColor:
      colors.primary,

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

    alignItems:
      "center",
  },

  loginText: {
    fontSize: 14,

    color: "#6B7280",
  },

  loginTextBold: {
    color:
      colors.primary,

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
//   TouchableOpacity,
//   SafeAreaView,
//   TextInput,
//   Alert,
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
// // This screen intentionally contains ZERO imperative focus management:
// //   - no refs are created for any TextInput
// //   - no autoFocus prop is set on any field
// //   - no `.focus()` / `.blur()` / `requestFocus()` calls exist anywhere
// //   - no useEffect exists that could react to a focus/state change and
// //     re-trigger navigation or focus
// //   - `focusedField` below is PURELY cosmetic (it only toggles a border
// //     color via onFocus/onBlur) and never calls any focus API, so it
// //     cannot create a focus cycle
// //
// // Because none of those mechanisms exist here, this file cannot be the
// // source of the roleScreen -> destination screen focus loop. The cause
// // has to be upstream: either roleScreen calling navigation.navigate()
// // more than once (e.g. a submit handler firing twice, or a useEffect
// // with a bad dependency array triggering repeated navigation), or a
// // navigator config issue (e.g. this route being remounted repeatedly).
// // Send over roleScreen.js and your stack navigator config and I'll patch
// // the root cause directly.
// // ---------------------------------------------------------------------------

// const FIELCONFIG = [
//   { key: "name", placeholder: "Full Name", icon: "person-outline" },
//   { key: "cnic", placeholder: "CNIC", icon: "card-outline" },
//   { key: "phone", placeholder: "Phone", icon: "call-outline", keyboardType: "phone-pad" },
//   { key: "email", placeholder: "Email", icon: "mail-outline", keyboardType: "email-address" },
//   { key: "qualification", placeholder: "Qualification", icon: "school-outline" },
//   { key: "radius", placeholder: "Radius (km)", icon: "location-outline", keyboardType: "numeric" },
//   { key: "experience", placeholder: "Experience (years)", icon: "briefcase-outline", keyboardType: "numeric" },
// ];

// const TeacherSignUpScreen = ({ navigation }) => {
//   const [form, setForm] = useState({
//     name: "",
//     cnic: "",
//     phone: "",
//     email: "",
//     qualification: "",
//     radius: "",
//     experience: "",
//     password: "",
//     confirmPassword: "",
//   });

//   // Purely cosmetic — used only to tint the border of whichever field the
//   // user is currently in. Never calls any focus API, so it cannot loop.
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
//       !form.phone ||
//       !form.email ||
//       !form.password ||
//       !form.qualification
//     ) {
//       Alert.alert("Error", "Please fill all required fields");
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
//         phone: form.phone,
//         email: form.email,
//         qualification: form.qualification,
//         radius: parseInt(form.radius) || 0,
//         experience: parseInt(form.experience) || 0,
//         password: form.password,
//         role: "Tutor",
//       });

//       const userId = response.data.userId;

//       if (!userId) {
//         Alert.alert("Error", "UserId not received");
//         return;
//       }

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
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const renderField = ({ key, placeholder, icon, keyboardType, secure, toggleSecure, secureVisible }) => (
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
//             <Text style={styles.title}>Create Tutor Account</Text>
//             <Text style={styles.subtitle}>
//               Set up your profile to start teaching on the platform
//             </Text>
//           </View>

//           {/* Form Card */}
//           <View style={styles.card}>
//             <Text style={styles.sectionLabel}>Personal Details</Text>
//             {renderField(FIELCONFIG[0])}
//             {renderField(FIELCONFIG[1])}
//             {renderField(FIELCONFIG[2])}
//             {renderField(FIELCONFIG[3])}

//             <View style={styles.divider} />

//             <Text style={styles.sectionLabel}>Teaching Details</Text>
//             {renderField(FIELCONFIG[4])}
//             <View style={styles.row}>
//               <View style={styles.halfField}>{renderField(FIELCONFIG[5])}</View>
//               <View style={styles.halfField}>{renderField(FIELCONFIG[6])}</View>
//             </View>

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

// export default TeacherSignUpScreen;

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

//   row: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   halfField: {
//     flex: 1,
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
