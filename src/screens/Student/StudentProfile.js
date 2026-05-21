import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentProfile = ({ navigation }) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const response = await fetch(`${BASE_URL}/Student/my-profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    console.log("RAW PROFILE RESPONSE:", text);

    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.log("JSON Parse Error:", e);
    }

    if (response.ok) {
      setStudentData(data);
    } else {
      Alert.alert("Error", data.message || "Failed to load profile");
    }

  } catch (error) {
    console.log("Profile Error:", error);
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 26 }} />
      </View>

      {/* Profile Section */}
      <View style={styles.profileContainer}>
        <View style={styles.avatar}>
          <Icon name="person" size={40} color="#fff" />
        </View>

        <Text style={styles.name}>{studentData?.full_name}</Text>
        <Text style={styles.subText}>Student Profile</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <ProfileItem label="Full Name" value={studentData?.full_name} />
        <ProfileItem label="E-Mail" value={studentData?.email} />
        <ProfileItem label="CNIC" value={studentData?.cnic} />
        <ProfileItem label="Contact Number" value={studentData?.phone} />
        <ProfileItem label="Location" value={studentData?.location} />
      </View>
    </SafeAreaView>
  );
};

export default StudentProfile;

/* ---------- Reusable Item ---------- */
const ProfileItem = ({ label, value }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <Text style={styles.inputText}>{value || "N/A"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE7F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 35,
  },
  logo: {
    width: 120,
    height: 45,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  subText: {
    fontSize: 13,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  inputBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
  },
  inputText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "500",
  },
});