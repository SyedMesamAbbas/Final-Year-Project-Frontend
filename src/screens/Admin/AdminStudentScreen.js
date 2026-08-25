import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
// Assuming colors.primary is a shade of blue or indigo, like #4F46E5
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminStudentScreen = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ================= DESIGN CONSTANTS =================
  const primaryColor = colors?.primary || "#4F46E5";
  const grayText = "#64748B";
  const slateDark = "#0F172A";

  // ================= FETCH STUDENTS =================
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      if (!refreshing) setLoading(true);

      const response = await fetch(`${BASE_URL}/Admin/all-students`);
      const result = await response.json();

      console.log("Students API Response:", result);

      if (response.ok) {
        setStudents(result);
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to load students"
        );
      }
    } catch (error) {
      console.log("Fetch Students Error:", error);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  // ================= BLOCK STUDENT =================
  const blockStudent = async (id) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/Admin/block-student/${id}`
      );

      console.log("Block Student Response:", response.data);
      Alert.alert(
        "Success",
        response.data.message || "Student blocked successfully"
      );
      fetchStudents();
    } catch (error) {
      console.log(
        "Block Student Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to block student"
      );
    }
  };

  // ================= REJECT STUDENT =================
  const rejectStudent = async (id) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/Admin/reject-student/${id}`
      );

      console.log("Reject Student Response:", response.data);
      Alert.alert(
        "Success",
        response.data.message || "Student rejected successfully"
      );
      fetchStudents();
    } catch (error) {
      console.log(
        "Reject Student Error:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to reject student"
      );
    }
  };

  // ================= CONFIRMATION ALERTS =================
  const confirmBlock = (id, name) => {
    Alert.alert(
      "Block Student",
      `Are you sure you want to block ${name}? This will revoke all access immediately.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Block Student",
          style: "destructive",
          onPress: () => blockStudent(id),
        },
      ]
    );
  };

  const confirmReject = (id, name) => {
    Alert.alert(
      "Reject Student",
      `Are you sure you want to reject ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Reject",
          style: "destructive",
          onPress: () => rejectStudent(id),
        },
      ]
    );
  };

  // ================= UTILS =================
  // Consistent color badge logic for a professional look
  const getStatusIndicatorStyles = (status) => {
    const normalizedStatus = status?.toLowerCase() || "active";
    switch (normalizedStatus) {
      case "active":
        return {
          bg: "#DCFCE7", // Soft Green
          text: "#15803D",
        };
      case "blocked":
        return {
          bg: "#FEE2E2", // Soft Red
          text: "#DC2626",
        };
      case "pending":
      case "rejected":
        return {
          bg: "#FEF3C7", // Soft Orange
          text: "#B45309",
        };
      default:
        return { bg: "#F1F5F9", text: grayText };
    }
  };

  // ================= COMPONENT: Detail Grid Item =================
  const DetailItem = ({ icon, text }) => (
    <View style={styles.detailItem}>
      <Icon name={icon} size={15} color={grayText} />
      <Text style={styles.detailItemText} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );

  // ================= COMPONENT: STUDENT CARD (List Item) =================
  const renderItem = ({ item }) => {
    const statusStyles = getStatusIndicatorStyles(item.status);
    const fullName = item.fullName || "Unknown Student";

    return (
      <View style={styles.card}>
        {/* Top Header Row */}
        <View style={styles.cardHeaderRow}>
          <Image
            source={{
              uri:
                "https://cdn-icons-png.flaticon.com/512/3135/3135810.png",
            }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{fullName}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyles.bg },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusStyles.text },
                ]}
              />
              <Text
                style={[
                  styles.statusLabel,
                  { color: statusStyles.text },
                ]}
              >
                {item.status || "Active"}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Grid (Improved Responsiveness/Visual Flow) */}
        <View style={styles.detailsGrid}>
          <DetailItem icon="email" text={item.email || "Not Available"} />
          <DetailItem icon="phone" text={item.phone || "Not Available"} />
          <DetailItem
            icon="badge"
            text={`CNIC: ${item.cnic || "Not Available"}`}
          />
          <DetailItem
            icon="location-on"
            text={item.location || "Not Available"}
          />
        </View>

        {/* Buttons Row (Outline/Destructive Style Separation) */}
        <View style={styles.buttonActionRow}>
          <TouchableOpacity
            style={styles.ghostRejectBtn}
            activeOpacity={0.7}
            onPress={() => confirmReject(item.id, fullName)}
          >
            <Icon name="cancel" size={16} color="#B45309" />
            <Text style={styles.ghostRejectText}>Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlinedBlockBtn}
            activeOpacity={0.7}
            onPress={() => confirmBlock(item.id, fullName)}
          >
            <Icon name="block" size={16} color="#DC2626" />
            <Text style={styles.outlinedBlockText}>Block Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ================= RENDERING =================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F8FAFC"
        translucent={false}
      />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("AdminDrawer")}
          style={styles.headerIconBtn}
        >
          <Icon name="menu" size={24} color={primaryColor} />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.headerIconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="sync" size={22} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* ================= TITLE & REFRESH SECTION ================= */}
      <View style={styles.titleRow}>
        <Text style={styles.screenTitle}>All Students</Text>
        {students.length > 0 && !loading && (
          <Text style={styles.countText}>{students.length} Total</Text>
        )}
      </View>

      {/* ================= MAIN CONTENT ================= */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>Fetching database...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContentStyle}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="school" size={70} color="#CBD5E1" />
              <Text style={styles.emptyTitleText}>Empty Classroom</Text>
              <Text style={styles.emptySubText}>
                No student accounts have been found in the system. Pull down to
                check again.
              </Text>
            </View>
          }
        />
      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      <View style={styles.bottomNav}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminHome")}
        >
          <Icon name="home" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        {/* TEACHER */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminApprovedTutor")}
        >
          <Icon name="groups" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Tutors</Text>
        </TouchableOpacity>

        {/* STUDENT (Active State Marker Added) */}
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeNavItemBg}>
            <Icon name="school" size={24} color={primaryColor} />
            <Text style={styles.navTextActive}>Students</Text>
          </View>
        </TouchableOpacity>

        {/* SUBJECT */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminSubject")}
        >
          <Icon name="menu-book" size={24} color="#94A3B8" />
          <Text style={styles.navText}>Subjects</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminStudentScreen;

// =====================================================
// PRODUCTION STYLES (Professional SaaS Look)
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC", // Clean slate light background
  },

  // ================= HEADER =================
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    // Modern elevation (Android) & Shadow (iOS)
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  headerIconBtn: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 110,
    height: 40,
  },

  // ================= TITLE SECTION =================
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  countText: {
    fontSize: 14,
    color: "#64748B",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: "hidden",
    fontWeight: "600",
  },

  // ================= LIST STYLE =================
  listContentStyle: {
    paddingHorizontal: 16,
    paddingBottom: 110, // Account for Bottom Nav
  },

  // ================= CARD =================
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#475569", // softer shadow
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    borderWidth: 1, // Subtle border for definition
    borderColor: "#F1F5F9",
  },

  // CARD HEADER row
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    backgroundColor: "#F1F5F9",
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },
  // Modern Status Badge
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Details Grid Section
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: "4%", // flexible column gap
    marginBottom: 20,
  },
  detailItem: {
    width: "48%", // Two Columns
    flexDirection: "row",
    alignItems: "center",
  },
  detailItemText: {
    flex: 1,
    fontSize: 13,
    color: "#475569",
    marginLeft: 8,
    fontWeight: "500",
  },

  // ACTION BUTTONS SECTION (outlined/ghost modern design)
  buttonActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 16,
  },
  // Ghost Reject (Transparent)
  ghostRejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    gap: 6,
  },
  ghostRejectText: {
    color: "#B45309",
    fontSize: 14,
    fontWeight: "700",
  },
  // Outlined Block (Secondary Action)
  outlinedBlockBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA", // softer red border
    gap: 6,
    backgroundColor: "#FEF2F2", // soft red bg
  },
  outlinedBlockText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },

  // ================= LOADING / FEEDBACK =================
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: "#64748B",
    fontWeight: "600",
  },

  // EMPTY STATE illustrated style
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyTitleText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#475569",
    marginTop: 20,
    letterSpacing: -0.5,
  },
  emptySubText: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    color: "#94A3B8",
    lineHeight: 20,
    fontWeight: "500",
  },

  // ================= BOTTOM NAV =================
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 75,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activeNavItemBg: {
    alignItems: "center",
    justifyContent: "center",
    // Subtle indicator for active state
    backgroundColor: "#EEF2FF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  navText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "800",
    marginTop: 3,
  },
});
