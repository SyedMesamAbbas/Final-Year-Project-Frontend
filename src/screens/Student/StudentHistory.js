import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { BASE_URL } from "../../config/api";

const PRIMARY_COLOR = "#5D3FD3";

const StudentClassHistory = () => {
  const navigation = useNavigation();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassHistory();
  }, []);

  const fetchClassHistory = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/student-class-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await response.json();

      console.log("Student History:", json);

      if (json.success) {
        setHistory(json.data || []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.log("History Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Status Badge Styling Helper
  const getStatusStyles = (status) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "completed":
        return {
          container: styles.badgeCompleted,
          text: styles.badgeCompletedText,
          icon: "check-circle",
        };
      case "pending":
      case "requested":
        return {
          container: styles.badgePending,
          text: styles.badgePendingText,
          icon: "schedule",
        };
      case "cancelled":
      case "rejected":
        return {
          container: styles.badgeCancelled,
          text: styles.badgeCancelledText,
          icon: "cancel",
        };
      default:
        return {
          container: styles.badgeDefault,
          text: styles.badgeDefaultText,
          icon: "info",
        };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyles(item.status);
    const tutorInitial = item.tutor_name
      ? item.tutor_name.charAt(0).toUpperCase()
      : "T";

    return (
      <View style={styles.card}>
        {/* Card Header: Tutor Avatar & Name + Status Badge */}
        <View style={styles.headerRow}>
          <View style={styles.tutorContainer}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{tutorInitial}</Text>
            </View>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorLabel}>Tutor</Text>
              <Text style={styles.tutorName} numberOfLines={1}>
                {item.tutor_name || "Unknown Tutor"}
              </Text>
            </View>
          </View>

          <View style={[styles.statusBadge, statusStyle.container]}>
            <Icon
              name={statusStyle.icon}
              size={14}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.statusText, statusStyle.text]}>
              {item.status || "Unknown"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Course Banner */}
        <View style={styles.courseRow}>
          <View style={styles.iconCircle}>
            <Icon name="menu-book" size={18} color={PRIMARY_COLOR} />
          </View>
          <View style={styles.courseInfo}>
            <Text style={styles.metaLabel}>Subject / Course</Text>
            <Text style={styles.courseText} numberOfLines={1}>
              {item.course_name || "N/A"}
            </Text>
          </View>
        </View>

        {/* Details Grid (Date, Time, Type) */}
        <View style={styles.detailsGrid}>
          {/* Date & Day */}
          <View style={styles.gridItem}>
            <Icon name="calendar-month" size={16} color="#64748B" />
            <Text style={styles.gridText} numberOfLines={1}>
              {item.class_date ? `${item.class_date} (${item.day || ""})` : "N/A"}
            </Text>
          </View>

          {/* Time Slot */}
          <View style={styles.gridItem}>
            <Icon name="access-time" size={16} color="#64748B" />
            <Text style={styles.gridText} numberOfLines={1}>
              {item.time || "N/A"}
            </Text>
          </View>

          {/* Schedule/Request Type */}
          <View style={styles.gridItemFull}>
            <Icon name="repeat" size={16} color="#64748B" />
            <Text style={styles.gridText}>
              Mode: <Text style={styles.gridTextBold}>{item.request_type || "N/A"}</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* App Header */}
      <View style={styles.appHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={18} color="#0F172A" style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.rightPlaceholder} />
      </View>

      {/* Main Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Class History</Text>
        <Text style={styles.sectionSubtitle}>
          Review your past sessions and request logs
        </Text>
      </View>

      {/* Main Content / Loading / Empty */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Fetching class history...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="history" size={36} color="#94A3B8" />
          </View>
          <Text style={styles.emptyTitle}>No History Found</Text>
          <Text style={styles.emptySubtext}>
            You haven't completed or requested any classes yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) =>
            item.request_id ? item.request_id.toString() : Math.random().toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

export default StudentClassHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // ================= HEADER =================
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 140,
    height: 38,
  },

  rightPlaceholder: {
    width: 38,
    height: 38,
  },

  // ================= SECTION HEADER =================
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  // ================= LIST & CARD =================
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tutorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  tutorInfo: {
    marginLeft: 10,
    flex: 1,
  },

  tutorLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  tutorName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 1,
  },

  // ================= BADGES =================
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Completed
  badgeCompleted: {
    backgroundColor: "#DCFCE7",
  },
  badgeCompletedText: {
    color: "#15803D",
  },

  // Pending
  badgePending: {
    backgroundColor: "#FEF3C7",
  },
  badgePendingText: {
    color: "#B45309",
  },

  // Cancelled
  badgeCancelled: {
    backgroundColor: "#FEE2E2",
  },
  badgeCancelledText: {
    color: "#B91C1C",
  },

  // Default
  badgeDefault: {
    backgroundColor: "#F1F5F9",
  },
  badgeDefaultText: {
    color: "#475569",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },

  // ================= COURSE ROW =================
  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F0FF",
    alignItems: "center",
    justifyContent: "center",
  },

  courseInfo: {
    marginLeft: 10,
    flex: 1,
  },

  metaLabel: {
    fontSize: 11,
    color: "#64748B",
  },

  courseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 1,
  },

  // ================= DETAILS GRID =================
  detailsGrid: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  gridItemFull: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  gridText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 8,
    flex: 1,
  },

  gridTextBold: {
    fontWeight: "700",
    color: "#0F172A",
  },

  // ================= LOADER =================
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // ================= EMPTY STATE =================
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptySubtext: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});

