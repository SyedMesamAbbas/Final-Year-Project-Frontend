import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  TextInput,
  Clipboard,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { BASE_URL } from "../../config/api";
import Colors from "../utils/colors";

//==================================================
// Design System Theme Tokens
//==================================================
const Theme = {
  primary: Colors?.primary || "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#4338CA",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  borderSubtle: "#F1F5F9",
  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  dangerBorder: "#FCA5A5",
  success: "#10B981",
  successLight: "#ECFDF5",
  accent: "#6366F1",
};

const AdminBlockedStudents = () => {
  const navigation = useNavigation();

  //==================================================
  // States
  //==================================================
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  //==================================================
  // Get Error Message
  //==================================================
  const getErrorMessage = (error, defaultMessage) => {
    if (typeof error?.response?.data === "string") {
      return error.response.data;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    return defaultMessage;
  };

  //==================================================
  // Fetch Blocked Students
  //==================================================
  const loadBlockedStudents = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Login token not found. Please login again."
        );
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/Admin/blocked-students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Blocked Students Response:", response.data);

      if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.log(
        "Get Blocked Students Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        getErrorMessage(
          error,
          "Unable to load blocked students."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //==================================================
  // Initial Load
  //==================================================
  useEffect(() => {
    loadBlockedStudents();
  }, []);

  //==================================================
  // Pull To Refresh
  //==================================================
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBlockedStudents();
  }, []);

  //==================================================
  // Filtered Students List
  //==================================================
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase().trim();
    return students.filter((item) => {
      const name = item.fullName ? item.fullName.toLowerCase() : "";
      const email = item.email ? item.email.toLowerCase() : "";
      const studentId = item.studentId ? item.studentId.toString().toLowerCase() : "";
      const phone = item.phone ? item.phone.toLowerCase() : "";
      const cnic = item.cnic ? item.cnic.toLowerCase() : "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        studentId.includes(query) ||
        phone.includes(query) ||
        cnic.includes(query)
      );
    });
  }, [students, searchQuery]);

  //==================================================
  // Helper: Copy to Clipboard
  //==================================================
  const handleCopyText = (text, label) => {
    if (!text || text === "Not Available") return;
    Clipboard.setString(text);
    if (Platform.OS === "android") {
      Alert.alert("Copied", `${label} copied to clipboard.`);
    }
  };

  //==================================================
  // Restore Student Confirmation
  //==================================================
  const confirmRestore = (student) => {
    Alert.alert(
      "Restore Access",
      `Are you sure you want to reinstate access privileges for ${student.fullName || "this student"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore Student",
          style: "default",
          onPress: () => restoreStudent(student),
        },
      ]
    );
  };

  //==================================================
  // Restore Student
  //==================================================
  const restoreStudent = async (student) => {
    try {
      setRestoringId(student.studentId);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Login token not found. Please login again."
        );
        return;
      }

      const response = await axios.put(
        `${BASE_URL}/Admin/restore-student/${student.studentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Restore Student Response:", response.data);

      Alert.alert(
        "Student Restored",
        response.data?.message ||
          "Student account has been restored successfully."
      );

      // Remove restored student from blocked list
      setStudents((previousStudents) =>
        previousStudents.filter(
          (item) => item.studentId !== student.studentId
        )
      );
    } catch (error) {
      console.log(
        "Restore Student Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        getErrorMessage(
          error,
          "Unable to restore student."
        )
      );
    } finally {
      setRestoringId(null);
    }
  };

  //==================================================
  // Helper: Get Initials
  //==================================================
  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  //==================================================
  // Render Student Card
  //==================================================
  const renderStudent = ({ item }) => {
    const isRestoring = restoringId === item.studentId;
    const initials = getInitials(item.fullName);

    return (
      <View style={styles.studentCard}>
        {/* Card Header */}
        <View style={styles.studentHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.studentHeaderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.studentName} numberOfLines={1}>
                {item.fullName || "Unknown Student"}
              </Text>
            </View>
            <View style={styles.idChip}>
              <Icon name="fingerprint" size={12} color={Theme.textMuted} />
              <Text style={styles.studentIdText}>ID: {item.studentId}</Text>
            </View>
          </View>

          <View style={styles.blockedBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.blockedBadgeText}>Blocked</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          {/* Email Row */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleCopyText(item.email, "Email")}
            style={styles.infoRow}
          >
            <View style={styles.infoIconContainer}>
              <Icon name="alternate-email" size={15} color={Theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email Address</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {item.email || "Not Available"}
              </Text>
            </View>
            {item.email && (
              <Icon name="content-copy" size={14} color={Theme.textMuted} />
            )}
          </TouchableOpacity>

          {/* Phone Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="phone" size={15} color={Theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>
                {item.phone || "Not Available"}
              </Text>
            </View>
          </View>

          {/* CNIC & Father CNIC Two-Column Section */}
          <View style={styles.twoColumnRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopyText(item.cnic, "CNIC")}
              style={[styles.infoRow, styles.flexHalf]}
            >
              <View style={styles.infoIconContainer}>
                <Icon name="badge" size={15} color={Theme.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Student CNIC</Text>
                <Text style={styles.infoValueCompact} numberOfLines={1}>
                  {item.cnic || "N/A"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCopyText(item.fatherCnic, "Father CNIC")}
              style={[styles.infoRow, styles.flexHalf]}
            >
              <View style={styles.infoIconContainer}>
                <Icon name="people-outline" size={15} color={Theme.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Father CNIC</Text>
                <Text style={styles.infoValueCompact} numberOfLines={1}>
                  {item.fatherCnic || "N/A"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Location Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Icon name="place" size={15} color={Theme.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location / Address</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {item.location || "Not Provided"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Section */}
        <TouchableOpacity
          style={[
            styles.restoreButton,
            isRestoring && styles.restoreButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={isRestoring}
          onPress={() => confirmRestore(item)}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="restore" size={18} color="#FFFFFF" />
              <Text style={styles.restoreButtonText}>Restore Student</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  //==================================================
  // Loading Screen
  //==================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Theme.primary} />
          <Text style={styles.loadingText}>Fetching blocked accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  //==================================================
  // Main Render
  //==================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go Back"
        >
          <Icon name="arrow-back-ios" size={16} color={Theme.textPrimary} style={{ marginLeft: 5 }} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Blocked Students</Text>
          <Text style={styles.headerSubtitle}>Account Access Management</Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={loadBlockedStudents}
          accessibilityLabel="Refresh list"
        >
          <Icon name="refresh" size={20} color={Theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search & Overview Toolbar */}
      <View style={styles.toolbarContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={Theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, CNIC or email..."
            placeholderTextColor={Theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && Platform.OS !== "ios" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close" size={18} color={Theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.summaryBar}>
          <View style={styles.summaryBadge}>
            <Icon name="shield" size={14} color={Theme.danger} />
            <Text style={styles.summaryBadgeText}>
              {students.length} Total Blocked
            </Text>
          </View>
          {searchQuery.trim().length > 0 && (
            <Text style={styles.searchResultsCount}>
              Showing {filteredStudents.length} matches
            </Text>
          )}
        </View>
      </View>

      {/* Student List */}
      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.studentId.toString()}
        renderItem={renderStudent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredStudents.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.primary]}
            tintColor={Theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon
                name={searchQuery ? "search-off" : "verified-user"}
                size={40}
                color={searchQuery ? Theme.textMuted : Theme.success}
              />
            </View>

            <Text style={styles.emptyTitle}>
              {searchQuery ? "No Matching Results" : "No Blocked Students"}
            </Text>

            <Text style={styles.emptyText}>
              {searchQuery
                ? `No blocked accounts matched "${searchQuery}". Try searching with a different term.`
                : "All student accounts are currently active with full platform access."}
            </Text>

            {searchQuery ? (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={() => setSearchQuery("")}
              >
                <Text style={styles.emptyActionText}>Clear Search Query</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.emptyActionButton}
                onPress={loadBlockedStudents}
              >
                <Icon name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyActionText}>Refresh Data</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminBlockedStudents;

//====================================================
// STYLESHEET
//====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: Theme.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    backgroundColor: Theme.surface,
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: Theme.border,
  },
  loadingText: {
    marginTop: 14,
    color: Theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  // Header
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Theme.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },

  // Toolbar
  toolbarContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.textPrimary,
    paddingVertical: 0,
    fontWeight: "400",
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.dangerBorder,
  },
  summaryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.danger,
    marginLeft: 6,
  },
  searchResultsCount: {
    fontSize: 12,
    color: Theme.textMuted,
    fontWeight: "500",
  },

  // List Layout
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },

  // Card Components
  studentCard: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Theme.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: Theme.primary,
  },
  studentHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.textPrimary,
    letterSpacing: -0.2,
  },
  idChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  studentIdText: {
    fontSize: 12,
    color: Theme.textMuted,
    marginLeft: 4,
    fontWeight: "500",
  },
  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.dangerBorder,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.danger,
    marginRight: 5,
  },
  blockedBadgeText: {
    color: Theme.danger,
    fontSize: 11,
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: Theme.borderSubtle,
    marginVertical: 14,
  },

  // Information Rows
  detailsGrid: {
    gap: 8,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 8,
  },
  flexHalf: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.background,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: Theme.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 13,
    color: Theme.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
  infoValueCompact: {
    fontSize: 12,
    color: Theme.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },

  // Restore Action Button
  restoreButton: {
    marginTop: 14,
    backgroundColor: Theme.success,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: Theme.success,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  restoreButtonDisabled: {
    opacity: 0.6,
  },
  restoreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: Theme.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 290,
  },
  emptyActionButton: {
    marginTop: 20,
    backgroundColor: Theme.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Theme.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});


















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   Alert,
//   StatusBar,
//   ActivityIndicator,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const AdminBlockListScreen = ({ navigation }) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchBlockedUsers();
//   }, []);

//   const fetchBlockedUsers = async () => {
//   try {
//     setLoading(true);

//     const token = await AsyncStorage.getItem("token");

//     const response = await axios.get(
//       `${BASE_URL}/Admin/blocked-users`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     setData(response.data);
//   } catch (error) {
//     console.log(error.response?.data || error);

//     Alert.alert(
//       "Error",
//       error.response?.data?.message ||
//         "Failed to load blocked users"
//     );
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleRestore = async (id) => {
//   try {

//     const token = await AsyncStorage.getItem("token");

//     const response = await axios.put(
//       `${BASE_URL}/Admin/restore-user/${id}`,
//       {},
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     Alert.alert("Success", response.data.message);

//     fetchBlockedUsers();

//   } catch (error) {

//     console.log(error.response?.data || error);

//     Alert.alert(
//       "Error",
//       error.response?.data?.message ||
//       "Failed to restore user"
//     );
//   }
// };

//   const renderItem = ({ item, index }) => (
//     <View style={styles.card}>
//       <View style={styles.row}>
//         <Image
//           source={
//             index % 4 === 0
//               ? require("../../../assets/images/user1.png")
//               : index % 4 === 1
//               ? require("../../../assets/images/user2.png")
//               : index % 4 === 2
//               ? require("../../../assets/images/user3.png")
//               : require("../../../assets/images/user4.png")
//           }
//           style={styles.avatar}
//         />

//         <View style={styles.info}>
//           <Text style={styles.name}>{item.fullName}</Text>

//           <Text style={styles.subject}>
//             {item.subjects || item.role || "No Subject"}
//           </Text>

//           <View style={styles.buttonRow}>
//             <ActionButton
//               title="Restore"
//               icon="restore"
//               onPress={() => handleRestore(item.id)}
//             />
//             <TouchableOpacity
//               style={styles.viewBtn}
//               onPress={() =>
//                 navigation.navigate("AdminTutorDetailScreen", {
//                   tutorId: item.id,
//                 })
//               }
//             >
//               <Text style={styles.buttonText}>View</Text>
//             </TouchableOpacity>            
//           </View>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       <Text style={styles.screenTitle}>Blocked Users</Text>

//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       ) : (
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 40 }}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No blocked users found</Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default AdminBlockListScreen;

// const ActionButton = ({ title, icon, onPress, danger }) => (
//   <TouchableOpacity
//     style={[
//       styles.button,
//       { backgroundColor: danger ? "#FDECEA" : "#E3F2FD" },
//     ]}
//     onPress={onPress}
//   >
//     <Icon
//       name={icon}
//       size={16}
//       color={danger ? "#D32F2F" : "#1976D2"}
//       style={{ marginRight: 5 }}
//     />
//     <Text
//       style={[
//         styles.buttonText,
//         { color: danger ? "#D32F2F" : "#1976D2" },
//       ]}
//     >
//       {title}
//     </Text>
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   screenTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginVertical: 15,
//     color: "#333",
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#777",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 4,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//   },

//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#000",
//   },

//   subject: {
//     fontSize: 13,
//     color: "#666",
//     marginVertical: 4,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 8,
//   },

//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 10,
//   },

//   buttonText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   viewBtn: {
//   flex: 1,
//   backgroundColor: "#2196F3",
//   paddingVertical: 10,
//   borderRadius: 8,
//   alignItems: "center",
//   marginHorizontal: 3,
//   elevation: 2,
// },
//  buttonText: {
//     color: "#fff",
//     fontSize: 12,
//   },
// });
















































// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   Alert,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const initialData = [
//   {
//     id: "1",
//     name: "Faizan Shahid",
//     subject: "Mathematics",
//     image: require("../../../assets/images/user1.png"),
//   },
//   {
//     id: "2",
//     name: "Mesam Abbas",
//     subject: "OOP",
//     image: require("../../../assets/images/user2.png"),
//   },
//   {
//     id: "3",
//     name: "Maryam Bibi",
//     subject: "Software Engineering",
//     image: require("../../../assets/images/user3.png"),
//   },
//   {
//     id: "4",
//     name: "Mannan Rana Jee",
//     subject: "PF",
//     image: require("../../../assets/images/user4.png"),
//   },
// ];

// const AdminBlockListScreen = ({ navigation }) => {
//   const [data, setData] = useState(initialData);

//   const handleRestore = (id) => {
//     Alert.alert("Restore", "User restored successfully");
//     setData(data.filter((item) => item.id !== id));
//   };

//   const handleDelete = (id) => {
//     Alert.alert("Delete", "User deleted permanently");
//     setData(data.filter((item) => item.id !== id));
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.row}>
//         <Image source={item.image} style={styles.avatar} />

//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.subject}>{item.subject}</Text>

//           <View style={styles.buttonRow}>
//             <ActionButton
//               title="Restore"
//               icon="restore"
//               onPress={() => handleRestore(item.id)}
//             />

//             <ActionButton
//               title="Delete"
//               icon="delete"
//               danger
//               onPress={() => handleDelete(item.id)}
//             />
//           </View>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       {/* Title */}
//       <Text style={styles.screenTitle}>Blocked Users</Text>

//       {/* List */}
//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       />
//     </SafeAreaView>
//   );
// };

// export default AdminBlockListScreen;

// /* ---------- Button ---------- */
// const ActionButton = ({ title, icon, onPress, danger }) => (
//   <TouchableOpacity
//     style={[
//       styles.button,
//       { backgroundColor: danger ? "#FDECEA" : "#E3F2FD" },
//     ]}
//     onPress={onPress}
//   >
//     <Icon
//       name={icon}
//       size={16}
//       color={danger ? "#D32F2F" : "#1976D2"}
//       style={{ marginRight: 5 }}
//     />
//     <Text
//       style={[
//         styles.buttonText,
//         { color: danger ? "#D32F2F" : "#1976D2" },
//       ]}
//     >
//       {title}
//     </Text>
//   </TouchableOpacity>
// );

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   screenTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginVertical: 15,
//     color: "#333",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 4,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//   },

//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#000",
//   },

//   subject: {
//     fontSize: 13,
//     color: "#666",
//     marginVertical: 4,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 8,
//   },

//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 10,
//   },

//   buttonText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
// });