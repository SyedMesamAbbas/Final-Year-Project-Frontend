import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const MarkCourseDoneScreen = () => {
  const navigation = useNavigation();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Fallback to primary color if colors module is missing a key
  const primaryColor = colors?.primary || "#4F46E5";

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Login Required", "Please login first");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/Tutor/my-courses-for-mark-as-done`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      console.log("Get Courses Status:", response.status);
      console.log("Get Courses Response:", responseText);

      let data = [];

      if (responseText && responseText.trim() !== "") {
        data = JSON.parse(responseText);
      }

      if (response.ok) {
        // Remove duplicates just in case
        const uniqueCourses = Array.from(
          new Map(
            (Array.isArray(data) ? data : []).map((item) => [
              `${item.student_id}-${item.course_id}`,
              item,
            ])
          ).values()
        );

        setCourses(uniqueCourses);
      } else {
        Alert.alert("Error", data?.message || "Failed to load courses");
      }
    } catch (error) {
      console.log("Load Courses Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses(true);
  }, []);

  const markCourseDone = async (studentId, courseId) => {
    Alert.alert(
      "Confirm Completion",
      "Are you sure you want to mark this course as completed?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Mark as Done",
          style: "default",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              setProcessing(true);

              if (!token) {
                Alert.alert("Login Required", "Please login first");
                return;
              }

              const response = await fetch(
                `${BASE_URL}/Tutor/mark-course-done`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    studentId,
                    courseId,
                  }),
                }
              );

              const responseText = await response.text();

              console.log("Mark Done Status:", response.status);
              console.log("Mark Done Response:", responseText);

              let data = {};

              if (responseText && responseText.trim() !== "") {
                data = JSON.parse(responseText);
              }

              if (response.ok) {
                Alert.alert(
                  "Success",
                  data?.message ||
                    "Course marked as completed successfully"
                );

                loadCourses();
              } else {
                Alert.alert(
                  "Error",
                  data?.message || "Failed to mark course completed"
                );
              }
            } catch (error) {
              console.log("Mark Course Done Error:", error);
              Alert.alert("Error", error.message);
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  // Helper for generating avatar initials
  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const renderItem = ({ item }) => {
    const isCompleted = !!item.is_completed;

    return (
      <View style={styles.card}>
        {/* Student & Course Header Block */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: primaryColor }]}>
              {getInitials(item.student_name)}
            </Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.student_name || "Student"}
            </Text>
            <View style={styles.courseRow}>
              <Icon name="menu-book" size={14} color="#6B7280" />
              <Text style={styles.courseName} numberOfLines={1}>
                {item.course_name}
              </Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              isCompleted ? styles.completedBadgeBg : styles.inProgressBadgeBg,
            ]}
          >
            <Icon
              name={isCompleted ? "check-circle" : "pending"}
              size={13}
              color={isCompleted ? "#059669" : "#D97706"}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.statusBadgeText,
                isCompleted ? styles.completedBadgeText : styles.inProgressBadgeText,
              ]}
            >
              {isCompleted ? "Completed" : "In Progress"}
            </Text>
          </View>
        </View>

        {/* Optional Info Section */}
        {(item.grade || item.completed_date) && (
          <View style={styles.metaContainer}>
            {item.grade ? (
              <View style={styles.metaChip}>
                <Icon name="grade" size={14} color="#F59E0B" />
                <Text style={styles.metaChipText}>
                  Grade: <Text style={styles.metaValue}>{item.grade}</Text>
                </Text>
              </View>
            ) : null}

            {item.completed_date ? (
              <View style={styles.metaChip}>
                <Icon name="event-available" size={14} color="#10B981" />
                <Text style={styles.metaChipText}>
                  Done:{" "}
                  <Text style={styles.metaValue}>
                    {new Date(item.completed_date).toLocaleDateString()}
                  </Text>
                </Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.cardDivider} />

        {/* Action Button Area */}
        {!isCompleted ? (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: primaryColor },
              processing && styles.disabledButton,
            ]}
            disabled={processing}
            onPress={() =>
              markCourseDone(item.student_id, item.course_id)
            }
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Mark course as completed"
          >
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon
                  name="check-circle-outline"
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.actionButtonText}>Mark As Completed</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.completedBanner}>
            <Icon name="task-alt" size={18} color="#059669" />
            <Text style={styles.completedBannerText}>
              Course Completed Successfully
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <Text style={styles.pageTitle}>Mark Course Status</Text>
      <Text style={styles.pageSubtitle}>
        Update and finalize course completion records for your active students.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navbar */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={[styles.logoText, { color: primaryColor }]}>
            House of Tutor
          </Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Body Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>Loading assigned courses...</Text>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="assignment-late" size={44} color="#9CA3AF" />
          </View>
          <Text style={styles.emptyTitle}>No Active Courses Found</Text>
          <Text style={styles.emptySubText}>
            You currently have no course completion records to update.
          </Text>
          <TouchableOpacity
            style={[styles.reloadButton, { backgroundColor: primaryColor }]}
            onPress={() => loadCourses()}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.reloadButtonText}>Refresh List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => `${item.student_id}-${item.course_id}`}
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primaryColor]}
              tintColor={primaryColor}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default MarkCourseDoneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // Navbar Styles
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    alignItems: "center",
    flexDirection: "row",
  },

  logoImage: {
    width: 30,
    height: 30,
    marginRight: 8,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  headerRightPlaceholder: {
    width: 38,
    height: 38,
  },

  // List Layout
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  listHeaderContainer: {
    marginTop: 18,
    marginBottom: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.4,
  },

  pageSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 20,
  },

  // Card Structure
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "700",
  },

  headerInfo: {
    flex: 1,
    marginRight: 8,
  },

  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },

  courseName: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 4,
    fontWeight: "500",
  },

  // Status Badges
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },

  inProgressBadgeBg: {
    backgroundColor: "#FEF3C7",
  },

  completedBadgeBg: {
    backgroundColor: "#D1FAE5",
  },

  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  inProgressBadgeText: {
    color: "#B45309",
  },

  completedBadgeText: {
    color: "#047857",
  },

  // Optional Meta Info Section
  metaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  metaChipText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },

  metaValue: {
    fontWeight: "600",
    color: "#374151",
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },

  // Action Buttons
  actionButton: {
    flexDirection: "row",
    height: 42,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  disabledButton: {
    opacity: 0.6,
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  completedBannerText: {
    color: "#047857",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  // Loader & Empty States
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },

  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },

  reloadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },

  reloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
});
