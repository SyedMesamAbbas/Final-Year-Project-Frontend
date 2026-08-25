import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/api";

const ENDPOINTS = {
  CANCELLED_CLASSES: `${BASE_URL}/Tutor/cancel-classes`,
  RESCHEDULE: `${BASE_URL}/Tutor/reschedule`,
};

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const TutorCancelledClasses = () => {
  const navigation = useNavigation();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reschedulingId, setReschedulingId] = useState(null);

  const fetchCancelledClasses = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(ENDPOINTS.CANCELLED_CLASSES, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setClasses(result.data ?? []);
      } else {
        setClasses([]);
        Alert.alert("Error", result.message || GENERIC_ERROR_MESSAGE);
      }
    } catch (error) {
      console.log("fetchCancelledClasses error:", error);
      Alert.alert("Error", "Unable to fetch cancelled classes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCancelledClasses();
  }, [fetchCancelledClasses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCancelledClasses();
  }, [fetchCancelledClasses]);

  const handleReschedule = useCallback(
    async (requestId) => {
      setReschedulingId(requestId);

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(ENDPOINTS.RESCHEDULE, {
          method: "POST",
          headers,
          body: JSON.stringify({ requestId }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          Alert.alert("Error", result.message || GENERIC_ERROR_MESSAGE);
          return;
        }

        if (result.autoScheduled) {
          Alert.alert(
            "Success",
            `Class automatically rescheduled.\n\nDay: ${result.data.day}\nTime: ${result.data.time}\nDate: ${formatDate(
              result.data.classDate
            )}`
          );
          fetchCancelledClasses();
          return;
        }

        if (result.manualRequired) {
          Alert.alert("Manual Reschedule", result.message, [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("TutorManualReschedule", {
                  requestId: result.data.requestId,
                  studentId: result.data.studentId,
                  courseId: result.data.courseId,
                });
              },
            },
          ]);
          return;
        }

        Alert.alert("Success", result.message || "Class rescheduled.");
      } catch (error) {
        console.log("handleReschedule error:", error);
        Alert.alert("Error", "Unable to reschedule class.");
      } finally {
        setReschedulingId(null);
      }
    },
    [fetchCancelledClasses, navigation]
  );

  const confirmReschedule = useCallback(
    (requestId) => {
      Alert.alert(
        "Reschedule Class",
        "Are you sure you want to reschedule this session?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: () => handleReschedule(requestId) },
        ]
      );
    },
    [handleReschedule]
  );

  const renderItem = ({ item }) => {
    const isRescheduling = reschedulingId === item.request_id;
    const isCancelledStatus =
      item.status?.toLowerCase().includes("cancel") ?? true;

    return (
      <View style={styles.card}>
        {/* Card Header: Student Avatar & Basic Info */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.student_name ? item.student_name.charAt(0).toUpperCase() : "S"}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.studentName}>{item.student_name ?? "Unknown Student"}</Text>
            <Text style={styles.courseName}>{item.course_name ?? "General Course"}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              isCancelledStatus ? styles.statusBadgeCancelled : styles.statusBadgeDefault,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCancelledStatus ? styles.statusTextCancelled : styles.statusTextDefault,
              ]}
            >
              {item.status || "Cancelled"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Schedule & Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>{formatDate(item.class_date)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="time-outline" size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {item.day ? `${item.day}, ` : ""}{item.time ?? "-"}
            </Text>
          </View>

          {item.request_type ? (
            <View style={styles.detailItem}>
              <Icon name="bookmark-outline" size={16} color="#64748B" />
              <Text style={styles.detailText}>{item.request_type}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.rescheduleButton, isRescheduling && styles.rescheduleButtonDisabled]}
          onPress={() => confirmReschedule(item.request_id)}
          disabled={isRescheduling}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Reschedule class with ${item.student_name}`}
        >
          {isRescheduling ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="refresh-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Reschedule Class</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Fetching cancelled classes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.screenTitle}>Cancelled Classes</Text>
        <Text style={styles.screenSubtitle}>Manage and reschedule missed sessions</Text>
      </View>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.request_id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={[
          styles.listContent,
          classes.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="calendar-clear-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Cancelled Classes</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any pending cancelled classes to reschedule right now.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default TutorCancelledClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  /* Header */
  header: {
    height: 56,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 36,
  },
  headerRightPlaceholder: {
    width: 40,
  },

  /* Subheader Title Area */
  subHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },

  /* List & Cards */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },
  headerInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  courseName: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  /* Status Badges */
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeCancelled: {
    backgroundColor: "#FEF2F2",
  },
  statusBadgeDefault: {
    backgroundColor: "#F1F5F9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusTextCancelled: {
    color: "#EF4444",
  },
  statusTextDefault: {
    color: "#475569",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  /* Details Grid */
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    marginLeft: 6,
  },

  /* Reschedule Button */
  rescheduleButton: {
    backgroundColor: "#4F46E5",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  rescheduleButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
