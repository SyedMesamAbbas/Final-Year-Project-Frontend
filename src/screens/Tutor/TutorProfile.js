import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TutorProfile = ({ navigation }) => {

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/my-profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("PROFILE RESPONSE:", text);

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok) {
        setProfile(data);
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

  const ProfileField = ({ label, value }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputBox}>
        <Text style={styles.value}>{value || "N/A"}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Information</Text>

          <ProfileField label="Full Name" value={profile?.full_name} />
          <ProfileField label="E-Mail" value={profile?.email} />
          <ProfileField label="CNIC" value={profile?.cnic} />
          <ProfileField label="Experience" value={profile?.experience} />
          <ProfileField label="Contact Number" value={profile?.phone} />
          <ProfileField label="Qualification" value={profile?.qualification} />
          <ProfileField label="Radius (KM)" value={profile?.radius} />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TutorProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerCenter: {
    alignItems: "center",
  },

  logoImage: {
    width: 28,
    height: 28,
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  /* CONTENT */
  content: {
    padding: 16,
    paddingBottom: 80,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.primary,
  },

  fieldContainer: {
    marginBottom: 14,
  },

  label: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },

  inputBox: {
    backgroundColor: "#F1F3F6",
    padding: 12,
    borderRadius: 8,
  },

  value: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },

  /* NAV */
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  navItem: {
    alignItems: "center",
  },

  activeTab: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },

  inactiveTab: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
});
