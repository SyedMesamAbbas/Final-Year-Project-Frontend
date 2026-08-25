import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { BASE_URL } from "../../config/api";

const TutorClassHistory = () => {
  const navigation = useNavigation();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClassHistory();
  }, []);

  const fetchClassHistory = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/tutor-class-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await response.json();

      if (json.success) {
        setHistory(json.data || []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.log("History Error:", error);
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClassHistory(true);
  }, []);

  // Helper to extract initials for avatar placeholder
  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper for dynamic status styling
  const getStatusStyle = (status) => {
    const formatted = status ? status.toLowerCase() : "";
    switch (formatted) {
      case "completed":
      case "complete":
        return {
          bg: "#E6F4EA",
          text: "#137333",
          icon: "check-circle",
        };
      case "pending":
        return {
          bg: "#FEF7E0",
          text: "#B06000",
          icon: "schedule",
        };
      case "cancelled":
      case "canceled":
        return {
          bg: "#FCE8E6",
          text: "#C5221F",
          icon: "cancel",
        };
      default:
        return {
          bg: "#E8F0FE",
          text: "#1A73E8",
          icon: "event-available",
        };
    }
  };

  const renderItem = ({ item }) => {
    const statusTheme = getStatusStyle(item.status);

    return (
      <View style={styles.card}>
        {/* Top Header Section */}
        <View style={styles.cardHeader}>
          <View style={styles.studentInfoGroup}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(item.student_name)}
              </Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.studentName} numberOfLines={1}>
                {item.student_name || "Student"}
              </Text>
              <View style={styles.courseTag}>
                <Icon name="book" size={13} color="#4F46E5" />
                <Text style={styles.courseName} numberOfLines={1}>
                  {item.course_name}
                </Text>
              </View>
            </View>
          </View>

          {/* Dynamic Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusTheme.bg },
            ]}
          >
            <Icon
              name={statusTheme.icon}
              size={14}
              color={statusTheme.text}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.statusText,
                { color: statusTheme.text },
              ]}
            >
              {item.status || "Completed"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Rows Grid */}
        <View style={styles.detailsGrid}>
          {/* Date & Day */}
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Icon name="calendar-today" size={16} color="#6B7280" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {item.class_date} {item.day ? `(${item.day})` : ""}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View style={styles.detailRow}>
            <View style={styles.iconWrapper}>
              <Icon name="access-time" size={16} color="#6B7280" />
            </View>
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{item.time}</Text>
            </View>
          </View>

          {/* Request Type */}
          {item.request_type ? (
            <View style={styles.detailRow}>
              <View style={styles.iconWrapper}>
                <Icon name="swap-horiz" size={16} color="#6B7280" />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{item.request_type}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.pageTitle}>Class History</Text>
      <Text style={styles.pageSubtitle}>
        Review all your past and completed tutoring sessions
      </Text>
      {history.length > 0 && (
        <View style={styles.statsBanner}>
          <Icon name="verified-user" size={20} color="#4F46E5" />
          <Text style={styles.statsText}>
            Total Recorded Sessions:{" "}
            <Text style={styles.statsHighlight}>{history.length}</Text>
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Modern Fixed Navbar */}
      <View style={styles.appHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.rightPlaceholder} />
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Fetching session history...</Text>
        </View>
      ) : history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="history-toggle-off" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Class History</Text>
          <Text style={styles.emptySubText}>
            You haven't completed any sessions yet. Completed classes will show
            up here automatically.
          </Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchClassHistory()}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) =>
            item.request_id ? item.request_id.toString() : index.toString()
          }
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4F46E5"]}
              tintColor="#4F46E5"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default TutorClassHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Navbar
  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 130,
    height: 36,
  },

  rightPlaceholder: {
    width: 40,
    height: 40,
  },

  // List & Section Header
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  listHeader: {
    marginTop: 16,
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  statsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  statsText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#3730A3",
    fontWeight: "500",
  },

  statsHighlight: {
    fontWeight: "700",
    color: "#4F46E5",
  },

  // Card Design
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  studentInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
  },

  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },

  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  courseName: {
    fontSize: 13,
    color: "#4F46E5",
    fontWeight: "500",
    marginLeft: 4,
  },

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

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  // Info Grid
  detailsGrid: {
    gap: 10,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  detailTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },

  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "400",
  },

  detailValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },

  // Loaders
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },

  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4F46E5",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
});

