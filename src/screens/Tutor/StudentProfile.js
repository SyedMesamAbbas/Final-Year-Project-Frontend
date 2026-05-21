import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentProfile = ({ navigation, route }) => {

  const { studentId } = route.params;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {

      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/student-profile/${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();

      console.log("STUDENT PROFILE RESPONSE:", text);

      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        setStudent(data);
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to load student profile"
        );
      }

    } catch (error) {
      console.log(error);

      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Student Profile
        </Text>

        <View style={{ width: 26 }} />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >

        {/* Profile Section */}
        <View style={styles.profileSection}>

          {/* <Image
            source={
              student?.profile_image
                ? {
                    uri:
                      student.profile_image.startsWith("http")
                        ? student.profile_image
                        : `${BASE_URL}/${student.profile_image}`,
                  }
                : require("../../../assets/images/user.png")
            }
            style={styles.profileImage}
          /> */}

          <Text style={styles.studentName}>
            {student?.full_name || "No Name"}
          </Text>

          <Text style={styles.studentRole}>
            Student
          </Text>

        </View>

        {/* Information Card */}
        <View style={styles.card}>

          {/* Email */}
          <View style={styles.infoRow}>

            <Icon
              name="email"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Email
              </Text>

              <Text style={styles.value}>
                {student?.email || "N/A"}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* Phone */}
          <View style={styles.infoRow}>

            <Icon
              name="phone"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Phone
              </Text>

              <Text style={styles.value}>
                {student?.phone || "N/A"}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* CNIC */}
          <View style={styles.infoRow}>

            <Icon
              name="badge"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                CNIC
              </Text>

              <Text style={styles.value}>
                {student?.cnic || "N/A"}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* Gender */}
          {/* <View style={styles.infoRow}>

            <Icon
              name="person"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Gender
              </Text>

              <Text style={styles.value}>
                {student?.gender || "N/A"}
              </Text>
            </View>

          </View> */}

          <View style={styles.divider} />

          {/* Address */}
          {/* <View style={styles.infoRow}>

            <Icon
              name="location-on"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Address
              </Text>

              <Text style={styles.value}>
                {student?.address || "N/A"}
              </Text>
            </View>

          </View> */}

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.infoRow}>

            <Icon
              name="map"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Location
              </Text>

              <Text style={styles.value}>
                {student?.location || "N/A"}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* Latitude */}
          <View style={styles.infoRow}>

            <Icon
              name="my-location"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Latitude
              </Text>

              <Text style={styles.value}>
                {student?.latitude || "N/A"}
              </Text>
            </View>

          </View>

          <View style={styles.divider} />

          {/* Longitude */}
          <View style={styles.infoRow}>

            <Icon
              name="explore"
              size={22}
              color={colors.primary}
            />

            <View style={styles.infoText}>
              <Text style={styles.label}>
                Longitude
              </Text>

              <Text style={styles.value}>
                {student?.longitude || "N/A"}
              </Text>
            </View>

          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfile;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    elevation: 3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  profileSection: {
    alignItems: "center",
    marginTop: 25,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },

  studentName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    marginTop: 14,
  },

  studentRole: {
    fontSize: 15,
    color: "#777",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 25,
    marginBottom: 20,
    borderRadius: 18,
    padding: 18,
    elevation: 3,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },

  infoText: {
    marginLeft: 14,
    flex: 1,
  },

  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 3,
  },

  value: {
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
  },

});