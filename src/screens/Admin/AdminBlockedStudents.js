import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { BASE_URL } from "../../config/api";
import Colors from "../utils/colors";

const AdminBlockedStudents = () => {
  const navigation = useNavigation();

  //==================================================
  // States
  //==================================================

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

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
  // Restore Student Confirmation
  //==================================================

  const confirmRestore = (student) => {
    Alert.alert(
      "Restore Student",
      `Are you sure you want to restore ${student.fullName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore",
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
        "Success",
        response.data?.message ||
          "Student restored successfully."
      );

      // Remove restored student from blocked list
      setStudents((previousStudents) =>
        previousStudents.filter(
          (item) =>
            item.studentId !== student.studentId
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
  // Render Student Card
  //==================================================

  const renderStudent = ({ item }) => {
    const isRestoring =
      restoringId === item.studentId;

    return (
      <View style={styles.studentCard}>
        {/* ==========================================
            Student Header
        =========================================== */}

        <View style={styles.studentHeader}>
          <View style={styles.profileIcon}>
            <Icon
              name="person"
              size={28}
              color={Colors.primary}
            />
          </View>

          <View style={styles.studentHeaderInfo}>
            <Text
              style={styles.studentName}
              numberOfLines={1}
            >
              {item.fullName || "Unknown Student"}
            </Text>

            <Text style={styles.studentId}>
              Student ID: {item.studentId}
            </Text>
          </View>

          <View style={styles.blockedBadge}>
            <Icon
              name="block"
              size={14}
              color="#fff"
              style={{ marginRight: 4 }}
            />

            <Text style={styles.blockedBadgeText}>
              Blocked
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ==========================================
            Email
        =========================================== */}

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon
              name="email"
              size={19}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Email
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={2}
            >
              {item.email || "Not Available"}
            </Text>
          </View>
        </View>

        {/* ==========================================
            Phone
        =========================================== */}

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon
              name="phone"
              size={19}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Phone
            </Text>

            <Text style={styles.infoValue}>
              {item.phone || "Not Available"}
            </Text>
          </View>
        </View>

        {/* ==========================================
            CNIC
        =========================================== */}

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon
              name="badge"
              size={19}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              CNIC
            </Text>

            <Text style={styles.infoValue}>
              {item.cnic || "Not Available"}
            </Text>
          </View>
        </View>

        {/* ==========================================
            Location
        =========================================== */}

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon
              name="location-on"
              size={19}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Location
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={2}
            >
              {item.location || "Not Available"}
            </Text>
          </View>
        </View>

        {/* ==========================================
            Father CNIC
        =========================================== */}

        <View style={styles.infoRow}>
          <View style={styles.infoIconContainer}>
            <Icon
              name="family-restroom"
              size={19}
              color={Colors.primary}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              Father CNIC
            </Text>

            <Text style={styles.infoValue}>
              {item.fatherCnic || "Not Available"}
            </Text>
          </View>
        </View>

        {/* ==========================================
            Restore Button
        =========================================== */}

        <TouchableOpacity
          style={[
            styles.restoreButton,
            isRestoring && styles.restoreButtonDisabled,
          ]}
          activeOpacity={0.85}
          disabled={isRestoring}
          onPress={() => confirmRestore(item)}
        >
          {isRestoring ? (
            <ActivityIndicator
              size="small"
              color="#fff"
            />
          ) : (
            <>
              <Icon
                name="restore"
                size={20}
                color="#fff"
              />

              <Text style={styles.restoreButtonText}>
                Restore Student
              </Text>
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
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading blocked students...
        </Text>
      </SafeAreaView>
    );
  }

  //==================================================
  // Main UI
  //==================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* ============================================
          Header
      ============================================= */}

      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Icon
            name="arrow-back"
            size={24}
            color="#1B1B1B"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Blocked Students
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage blocked student accounts
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadBlockedStudents}
        >
          <Icon
            name="refresh"
            size={23}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ============================================
          Count Header
      ============================================= */}

      <View style={styles.countContainer}>
        <View style={styles.countIcon}>
          <Icon
            name="block"
            size={22}
            color="#E74C3C"
          />
        </View>

        <View style={styles.countInfo}>
          <Text style={styles.countTitle}>
            Blocked Students
          </Text>

          <Text style={styles.countSubtitle}>
            {students.length === 1
              ? "1 student is currently blocked"
              : `${students.length} students are currently blocked`}
          </Text>
        </View>
      </View>

      {/* ============================================
          Student List
      ============================================= */}

      <FlatList
        data={students}
        keyExtractor={(item) =>
          item.studentId.toString()
        }
        renderItem={renderStudent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          students.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon
                name="check-circle"
                size={65}
                color="#2E7D32"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Blocked Students
            </Text>

            <Text style={styles.emptyText}>
              There are currently no blocked student
              accounts.
            </Text>

            <TouchableOpacity
              style={styles.emptyRefreshButton}
              onPress={loadBlockedStudents}
            >
              <Icon
                name="refresh"
                size={19}
                color="#fff"
              />

              <Text
                style={styles.emptyRefreshText}
              >
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminBlockedStudents;

//====================================================
// STYLES
//====================================================

const styles = StyleSheet.create({
  //==================================================
  // Main Container
  //==================================================

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  //==================================================
  // Header
  //==================================================

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F3F6",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  headerSubtitle: {
    fontSize: 11,
    color: "#8A94A6",
    marginTop: 3,
  },

  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },

  //==================================================
  // Count Container
  //==================================================

  countContainer: {
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  countIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  countInfo: {
    flex: 1,
  },

  countTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  countSubtitle: {
    fontSize: 12,
    color: "#8A94A6",
    marginTop: 3,
  },

  //==================================================
  // List
  //==================================================

  listContent: {
    paddingHorizontal: 15,
    paddingTop: 2,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },

  //==================================================
  // Student Card
  //==================================================

  studentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginTop: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  //==================================================
  // Student Header
  //==================================================

  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  studentHeaderInfo: {
    flex: 1,
    marginLeft: 11,
    marginRight: 8,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  studentId: {
    fontSize: 12,
    color: "#8A94A6",
    marginTop: 4,
  },

  //==================================================
  // Blocked Badge
  //==================================================

  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E74C3C",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 18,
  },

  blockedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  //==================================================
  // Divider
  //==================================================

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 15,
  },

  //==================================================
  // Information Rows
  //==================================================

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },

  infoIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: "#8A94A6",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },

  //==================================================
  // Restore Button
  //==================================================

  restoreButton: {
    marginTop: 7,
    backgroundColor: "#2E7D32",
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  restoreButtonDisabled: {
    backgroundColor: "#81A985",
  },

  restoreButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  //==================================================
  // Loading
  //==================================================

  loaderContainer: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#777777",
    fontSize: 14,
    fontWeight: "600",
  },

  //==================================================
  // Empty State
  //==================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 25,
  },

  emptyIconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#EAF6EC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#333333",
  },

  emptyText: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },

  emptyRefreshButton: {
    marginTop: 18,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  emptyRefreshText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },
});