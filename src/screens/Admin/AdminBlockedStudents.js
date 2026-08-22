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

// Extended modern theme colors with fallback
const Theme = {
  primary: Colors?.primary || "#4F46E5",
  primaryLight: "#EEF2FF",
  surface: "#FFFFFF",
  background: "#F8FAFC",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  dangerBorder: "#FCA5A5",
  success: "#059669",
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
      "Restore Account",
      `Are you sure you want to restore access for ${student.fullName || "this student"}?`,
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
            activeOpacity={0.6}
            onPress={() => handleCopyText(item.email, "Email")}
            style={styles.infoRow}
          >
            <View style={styles.infoIconContainer}>
              <Icon name="alternate-email" size={16} color={Theme.primary} />
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
              <Icon name="phone" size={16} color={Theme.primary} />
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
              activeOpacity={0.6}
              onPress={() => handleCopyText(item.cnic, "CNIC")}
              style={[styles.infoRow, styles.flexHalf]}
            >
              <View style={styles.infoIconContainer}>
                <Icon name="badge" size={16} color={Theme.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Student CNIC</Text>
                <Text style={styles.infoValueCompact} numberOfLines={1}>
                  {item.cnic || "N/A"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => handleCopyText(item.fatherCnic, "Father CNIC")}
              style={[styles.infoRow, styles.flexHalf]}
            >
              <View style={styles.infoIconContainer}>
                <Icon name="people-outline" size={16} color={Theme.primary} />
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
              <Icon name="place" size={16} color={Theme.primary} />
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
              <Icon name="settings-backup-restore" size={18} color="#FFFFFF" />
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
          <Icon name="arrow-back-ios" size={18} color={Theme.textPrimary} style={{ marginLeft: 4 }} />
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
            <Icon name="security" size={15} color={Theme.danger} />
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
                size={44}
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
    padding: 24,
    borderRadius: 16,
    backgroundColor: Theme.surface,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
    paddingVertical: 12,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
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
    fontSize: 17,
    fontWeight: "700",
    color: Theme.textPrimary,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Theme.textMuted,
    marginTop: 1,
  },

  // Toolbar
  toolbarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.textPrimary,
    paddingVertical: 0,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 2,
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingHorizontal: 10,
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
    paddingBottom: 28,
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
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
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
  },
  idChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  studentIdText: {
    fontSize: 12,
    color: Theme.textMuted,
    marginLeft: 3,
    fontWeight: "500",
  },
  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
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
    backgroundColor: Theme.border,
    marginVertical: 14,
  },

  // Information Rows
  detailsGrid: {
    gap: 10,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },
  flexHalf: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.background,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
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
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 13,
    color: Theme.textPrimary,
    fontWeight: "600",
    marginTop: 1,
  },
  infoValueCompact: {
    fontSize: 12,
    color: Theme.textPrimary,
    fontWeight: "600",
    marginTop: 1,
  },

  // Restore Action Button
  restoreButton: {
    marginTop: 14,
    backgroundColor: Theme.success,
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
    paddingVertical: 48,
    paddingHorizontal: 20,
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
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Theme.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: Theme.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 280,
  },
  emptyActionButton: {
    marginTop: 20,
    backgroundColor: Theme.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});




























// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   StatusBar,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useNavigation } from "@react-navigation/native";

// import { BASE_URL } from "../../config/api";
// import Colors from "../utils/colors";

// const AdminBlockedStudents = () => {
//   const navigation = useNavigation();

//   //==================================================
//   // States
//   //==================================================

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [restoringId, setRestoringId] = useState(null);

//   //==================================================
//   // Get Error Message
//   //==================================================

//   const getErrorMessage = (error, defaultMessage) => {
//     if (typeof error?.response?.data === "string") {
//       return error.response.data;
//     }

//     if (error?.response?.data?.message) {
//       return error.response.data.message;
//     }

//     if (error?.message) {
//       return error.message;
//     }

//     return defaultMessage;
//   };

//   //==================================================
//   // Fetch Blocked Students
//   //==================================================

//   const loadBlockedStudents = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert(
//           "Authentication Error",
//           "Login token not found. Please login again."
//         );
//         return;
//       }

//       const response = await axios.get(
//         `${BASE_URL}/Admin/blocked-students`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Blocked Students Response:", response.data);

//       if (Array.isArray(response.data)) {
//         setStudents(response.data);
//       } else {
//         setStudents([]);
//       }
//     } catch (error) {
//       console.log(
//         "Get Blocked Students Error:",
//         error.response?.data || error.message
//       );

//       Alert.alert(
//         "Error",
//         getErrorMessage(
//           error,
//           "Unable to load blocked students."
//         )
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   //==================================================
//   // Initial Load
//   //==================================================

//   useEffect(() => {
//     loadBlockedStudents();
//   }, []);

//   //==================================================
//   // Pull To Refresh
//   //==================================================

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadBlockedStudents();
//   }, []);

//   //==================================================
//   // Restore Student Confirmation
//   //==================================================

//   const confirmRestore = (student) => {
//     Alert.alert(
//       "Restore Student",
//       `Are you sure you want to restore ${student.fullName}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Restore",
//           onPress: () => restoreStudent(student),
//         },
//       ]
//     );
//   };

//   //==================================================
//   // Restore Student
//   //==================================================

//   const restoreStudent = async (student) => {
//     try {
//       setRestoringId(student.studentId);

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert(
//           "Authentication Error",
//           "Login token not found. Please login again."
//         );
//         return;
//       }

//       const response = await axios.put(
//         `${BASE_URL}/Admin/restore-student/${student.studentId}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Restore Student Response:", response.data);

//       Alert.alert(
//         "Success",
//         response.data?.message ||
//           "Student restored successfully."
//       );

//       // Remove restored student from blocked list
//       setStudents((previousStudents) =>
//         previousStudents.filter(
//           (item) =>
//             item.studentId !== student.studentId
//         )
//       );
//     } catch (error) {
//       console.log(
//         "Restore Student Error:",
//         error.response?.data || error.message
//       );

//       Alert.alert(
//         "Error",
//         getErrorMessage(
//           error,
//           "Unable to restore student."
//         )
//       );
//     } finally {
//       setRestoringId(null);
//     }
//   };

//   //==================================================
//   // Render Student Card
//   //==================================================

//   const renderStudent = ({ item }) => {
//     const isRestoring =
//       restoringId === item.studentId;

//     return (
//       <View style={styles.studentCard}>
//         {/* ==========================================
//             Student Header
//         =========================================== */}

//         <View style={styles.studentHeader}>
//           <View style={styles.profileIcon}>
//             <Icon
//               name="person"
//               size={28}
//               color={Colors.primary}
//             />
//           </View>

//           <View style={styles.studentHeaderInfo}>
//             <Text
//               style={styles.studentName}
//               numberOfLines={1}
//             >
//               {item.fullName || "Unknown Student"}
//             </Text>

//             <Text style={styles.studentId}>
//               Student ID: {item.studentId}
//             </Text>
//           </View>

//           <View style={styles.blockedBadge}>
//             <Icon
//               name="block"
//               size={14}
//               color="#fff"
//               style={{ marginRight: 4 }}
//             />

//             <Text style={styles.blockedBadgeText}>
//               Blocked
//             </Text>
//           </View>
//         </View>

//         <View style={styles.divider} />

//         {/* ==========================================
//             Email
//         =========================================== */}

//         <View style={styles.infoRow}>
//           <View style={styles.infoIconContainer}>
//             <Icon
//               name="email"
//               size={19}
//               color={Colors.primary}
//             />
//           </View>

//           <View style={styles.infoContent}>
//             <Text style={styles.infoLabel}>
//               Email
//             </Text>

//             <Text
//               style={styles.infoValue}
//               numberOfLines={2}
//             >
//               {item.email || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Phone
//         =========================================== */}

//         <View style={styles.infoRow}>
//           <View style={styles.infoIconContainer}>
//             <Icon
//               name="phone"
//               size={19}
//               color={Colors.primary}
//             />
//           </View>

//           <View style={styles.infoContent}>
//             <Text style={styles.infoLabel}>
//               Phone
//             </Text>

//             <Text style={styles.infoValue}>
//               {item.phone || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             CNIC
//         =========================================== */}

//         <View style={styles.infoRow}>
//           <View style={styles.infoIconContainer}>
//             <Icon
//               name="badge"
//               size={19}
//               color={Colors.primary}
//             />
//           </View>

//           <View style={styles.infoContent}>
//             <Text style={styles.infoLabel}>
//               CNIC
//             </Text>

//             <Text style={styles.infoValue}>
//               {item.cnic || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Location
//         =========================================== */}

//         <View style={styles.infoRow}>
//           <View style={styles.infoIconContainer}>
//             <Icon
//               name="location-on"
//               size={19}
//               color={Colors.primary}
//             />
//           </View>

//           <View style={styles.infoContent}>
//             <Text style={styles.infoLabel}>
//               Location
//             </Text>

//             <Text
//               style={styles.infoValue}
//               numberOfLines={2}
//             >
//               {item.location || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Father CNIC
//         =========================================== */}

//         <View style={styles.infoRow}>
//           <View style={styles.infoIconContainer}>
//             <Icon
//               name="family-restroom"
//               size={19}
//               color={Colors.primary}
//             />
//           </View>

//           <View style={styles.infoContent}>
//             <Text style={styles.infoLabel}>
//               Father CNIC
//             </Text>

//             <Text style={styles.infoValue}>
//               {item.fatherCnic || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Restore Button
//         =========================================== */}

//         <TouchableOpacity
//           style={[
//             styles.restoreButton,
//             isRestoring && styles.restoreButtonDisabled,
//           ]}
//           activeOpacity={0.85}
//           disabled={isRestoring}
//           onPress={() => confirmRestore(item)}
//         >
//           {isRestoring ? (
//             <ActivityIndicator
//               size="small"
//               color="#fff"
//             />
//           ) : (
//             <>
//               <Icon
//                 name="restore"
//                 size={20}
//                 color="#fff"
//               />

//               <Text style={styles.restoreButtonText}>
//                 Restore Student
//               </Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   //==================================================
//   // Loading Screen
//   //==================================================

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loaderContainer}>
//         <StatusBar
//           barStyle="dark-content"
//           backgroundColor="#FFFFFF"
//         />

//         <ActivityIndicator
//           size="large"
//           color={Colors.primary}
//         />

//         <Text style={styles.loadingText}>
//           Loading blocked students...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   //==================================================
//   // Main UI
//   //==================================================

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#FFFFFF"
//       />

//       {/* ============================================
//           Header
//       ============================================= */}

//       <View style={styles.topHeader}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           hitSlop={{
//             top: 10,
//             bottom: 10,
//             left: 10,
//             right: 10,
//           }}
//         >
//           <Icon
//             name="arrow-back"
//             size={24}
//             color="#1B1B1B"
//           />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Text style={styles.headerTitle}>
//             Blocked Students
//           </Text>

//           <Text style={styles.headerSubtitle}>
//             Manage blocked student accounts
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={styles.refreshButton}
//           onPress={loadBlockedStudents}
//         >
//           <Icon
//             name="refresh"
//             size={23}
//             color={Colors.primary}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* ============================================
//           Count Header
//       ============================================= */}

//       <View style={styles.countContainer}>
//         <View style={styles.countIcon}>
//           <Icon
//             name="block"
//             size={22}
//             color="#E74C3C"
//           />
//         </View>

//         <View style={styles.countInfo}>
//           <Text style={styles.countTitle}>
//             Blocked Students
//           </Text>

//           <Text style={styles.countSubtitle}>
//             {students.length === 1
//               ? "1 student is currently blocked"
//               : `${students.length} students are currently blocked`}
//           </Text>
//         </View>
//       </View>

//       {/* ============================================
//           Student List
//       ============================================= */}

//       <FlatList
//         data={students}
//         keyExtractor={(item) =>
//           item.studentId.toString()
//         }
//         renderItem={renderStudent}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={
//           students.length === 0
//             ? styles.emptyList
//             : styles.listContent
//         }
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[Colors.primary]}
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <View style={styles.emptyIconContainer}>
//               <Icon
//                 name="check-circle"
//                 size={65}
//                 color="#2E7D32"
//               />
//             </View>

//             <Text style={styles.emptyTitle}>
//               No Blocked Students
//             </Text>

//             <Text style={styles.emptyText}>
//               There are currently no blocked student
//               accounts.
//             </Text>

//             <TouchableOpacity
//               style={styles.emptyRefreshButton}
//               onPress={loadBlockedStudents}
//             >
//               <Icon
//                 name="refresh"
//                 size={19}
//                 color="#fff"
//               />

//               <Text
//                 style={styles.emptyRefreshText}
//               >
//                 Refresh
//               </Text>
//             </TouchableOpacity>
//           </View>
//         }
//       />
//     </SafeAreaView>
//   );
// };

// export default AdminBlockedStudents;

// //====================================================
// // STYLES
// //====================================================

// const styles = StyleSheet.create({
//   //==================================================
//   // Main Container
//   //==================================================

//   container: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//   },

//   //==================================================
//   // Header
//   //==================================================

//   topHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: "#FFFFFF",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F1F3F6",
//   },

//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//     marginHorizontal: 10,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#1B1B1B",
//   },

//   headerSubtitle: {
//     fontSize: 11,
//     color: "#8A94A6",
//     marginTop: 3,
//   },

//   refreshButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#EEF3FF",
//   },

//   //==================================================
//   // Count Container
//   //==================================================

//   countContainer: {
//     marginHorizontal: 15,
//     marginTop: 15,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 14,
//     padding: 14,
//     flexDirection: "row",
//     alignItems: "center",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 5,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   countIcon: {
//     width: 45,
//     height: 45,
//     borderRadius: 23,
//     backgroundColor: "#FDECEC",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 12,
//   },

//   countInfo: {
//     flex: 1,
//   },

//   countTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#1B1B1B",
//   },

//   countSubtitle: {
//     fontSize: 12,
//     color: "#8A94A6",
//     marginTop: 3,
//   },

//   //==================================================
//   // List
//   //==================================================

//   listContent: {
//     paddingHorizontal: 15,
//     paddingTop: 2,
//     paddingBottom: 30,
//   },

//   emptyList: {
//     flexGrow: 1,
//     paddingHorizontal: 15,
//   },

//   //==================================================
//   // Student Card
//   //==================================================

//   studentCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 17,
//     marginTop: 14,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//   },

//   //==================================================
//   // Student Header
//   //==================================================

//   studentHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   profileIcon: {
//     width: 52,
//     height: 52,
//     borderRadius: 26,
//     backgroundColor: "#EEF3FF",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   studentHeaderInfo: {
//     flex: 1,
//     marginLeft: 11,
//     marginRight: 8,
//   },

//   studentName: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: "#1B1B1B",
//   },

//   studentId: {
//     fontSize: 12,
//     color: "#8A94A6",
//     marginTop: 4,
//   },

//   //==================================================
//   // Blocked Badge
//   //==================================================

//   blockedBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#E74C3C",
//     paddingHorizontal: 9,
//     paddingVertical: 6,
//     borderRadius: 18,
//   },

//   blockedBadgeText: {
//     color: "#FFFFFF",
//     fontSize: 11,
//     fontWeight: "700",
//   },

//   //==================================================
//   // Divider
//   //==================================================

//   divider: {
//     height: 1,
//     backgroundColor: "#EEF1F5",
//     marginVertical: 15,
//   },

//   //==================================================
//   // Information Rows
//   //==================================================

//   infoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 11,
//   },

//   infoIconContainer: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#F1F4FF",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   infoContent: {
//     flex: 1,
//   },

//   infoLabel: {
//     fontSize: 11,
//     color: "#8A94A6",
//     marginBottom: 2,
//   },

//   infoValue: {
//     fontSize: 14,
//     color: "#333333",
//     fontWeight: "600",
//   },

//   //==================================================
//   // Restore Button
//   //==================================================

//   restoreButton: {
//     marginTop: 7,
//     backgroundColor: "#2E7D32",
//     minHeight: 48,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//   },

//   restoreButtonDisabled: {
//     backgroundColor: "#81A985",
//   },

//   restoreButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "800",
//     marginLeft: 8,
//   },

//   //==================================================
//   // Loading
//   //==================================================

//   loaderContainer: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   loadingText: {
//     marginTop: 12,
//     color: "#777777",
//     fontSize: 14,
//     fontWeight: "600",
//   },

//   //==================================================
//   // Empty State
//   //==================================================

//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 70,
//     paddingHorizontal: 25,
//   },

//   emptyIconContainer: {
//     width: 110,
//     height: 110,
//     borderRadius: 55,
//     backgroundColor: "#EAF6EC",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 18,
//   },

//   emptyTitle: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#333333",
//   },

//   emptyText: {
//     fontSize: 14,
//     color: "#888888",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 21,
//   },

//   emptyRefreshButton: {
//     marginTop: 18,
//     backgroundColor: Colors.primary,
//     borderRadius: 10,
//     paddingHorizontal: 20,
//     paddingVertical: 11,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   emptyRefreshText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "700",
//     marginLeft: 7,
//   },
// });