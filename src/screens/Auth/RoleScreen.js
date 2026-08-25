import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

const PRIMARY_COLOR = colors?.primary || "#4F46E5";

const RoleScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState("student");

  // Guards against navigate() firing more than once per tap/press cycle.
  const isNavigatingRef = useRef(false);

  const navigateOnce = (routeName) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    navigation.navigate(routeName);
    // Release the guard shortly after, in case the user backs out and
    // returns to this screen without it being remounted.
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);
  };

  const handleStudentPress = () => {
    setSelectedRole("student");
    navigateOnce("StudentSignup");
  };

  const handleTeacherPress = () => {
    setSelectedRole("tutor");
    navigateOnce("TeacherSignup");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header & Logo */}
        <View style={styles.brandContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
          />
          <View style={styles.badgeChip}>
            <Text style={styles.badgeText}>STEP 1 OF 3</Text>
          </View>
          <Text style={styles.mainTitle}>Choose Your Account Type</Text>
          <Text style={styles.subtitle}>
            Select how you intend to use House of Tutor to personalize your experience.
          </Text>
        </View>

        {/* Card 1: Student Role */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedRole === "student" && styles.cardSelected,
          ]}
          onPress={handleStudentPress}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                selectedRole === "student" && styles.iconBoxSelected,
              ]}
            >
              <Icon
                name="school"
                size={26}
                color={selectedRole === "student" ? PRIMARY_COLOR : "#64748B"}
              />
            </View>

            <View style={styles.headerTextGroup}>
              <Text style={styles.roleTag}>LEARNER</Text>
              <Text style={styles.cardTitle}>I am a Student</Text>
            </View>

            <View
              style={[
                styles.radioOuter,
                selectedRole === "student" && styles.radioOuterSelected,
              ]}
            >
              {selectedRole === "student" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>

          <Text style={styles.description}>
            Connect with qualified home and online tutors, book personalized sessions, track learning milestones, and elevate your academic performance.
          </Text>

          {/* Quick Feature Chips */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.featureText}>Book Expert Tutors</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.featureText}>Track Progress</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Card 2: Teacher / Tutor Role */}
        <TouchableOpacity
          style={[
            styles.card,
            selectedRole === "tutor" && styles.cardSelected,
          ]}
          onPress={handleTeacherPress}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                selectedRole === "tutor" && styles.iconBoxSelected,
              ]}
            >
              <Icon
                name="psychology"
                size={26}
                color={selectedRole === "tutor" ? PRIMARY_COLOR : "#64748B"}
              />
            </View>

            <View style={styles.headerTextGroup}>
              <Text style={styles.roleTag}>EDUCATOR</Text>
              <Text style={styles.cardTitle}>I am a Teacher</Text>
            </View>

            <View
              style={[
                styles.radioOuter,
                selectedRole === "tutor" && styles.radioOuterSelected,
              ]}
            >
              {selectedRole === "tutor" && (
                <View style={styles.radioInner} />
              )}
            </View>
          </View>

          <Text style={styles.description}>
            Share your expertise, set flexible teaching schedules, reach motivated students nearby, and manage bookings through a unified dashboard.
          </Text>

          {/* Quick Feature Chips */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.featureText}>Manage Schedule</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check-circle" size={14} color={PRIMARY_COLOR} />
              <Text style={styles.featureText}>Grow Student Base</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {/* <TouchableOpacity
          style={styles.continueBtn}
          onPress={
            selectedRole === "student" ? handleStudentPress : handleTeacherPress
          }
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            Continue as {selectedRole === "student" ? "Student" : "Teacher"}
          </Text>
          <Icon name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigateOnce("Login")}
          activeOpacity={0.7}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginTextBold}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default RoleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // Brand Header
  brandContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },
  badgeChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: PRIMARY_COLOR,
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  // Role Selection Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#FAFBFD",
    shadowColor: PRIMARY_COLOR,
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconBoxSelected: {
    backgroundColor: "#EEF2FF",
  },
  headerTextGroup: {
    flex: 1,
  },
  roleTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  // Custom Radio Button
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: PRIMARY_COLOR,
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
  },

  // Card Content
  description: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 19,
    marginBottom: 14,
  },
  featureList: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },

  // Bottom Action Bar
  bottomBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 16 : 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  continueBtn: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  loginLink: {
    alignItems: "center",
    marginTop: 12,
  },
  loginText: {
    fontSize: 17,
    color: "#64748B",
    marginBottom:12
  },
  loginTextBold: {
    color: PRIMARY_COLOR,
    fontWeight: "700",
  },
});
