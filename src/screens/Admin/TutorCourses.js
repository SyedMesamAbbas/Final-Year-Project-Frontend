import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/api";

const TutorCourses = () => {
  const navigation = useNavigation();

  // State Management (Preserved)
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [expandedTutor, setExpandedTutor] = useState(null);

  const toggleTutor = (id) => {
    setExpandedTutor((prev) => (prev === id ? null : id));
  };

  const fetchTutorCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/Admin/all-tutors-courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTutors(data);
      } else {
        alert(data.message || "Unable to load tutors.");
      }
    } catch (error) {
      console.log(error);
      alert("Network request failed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const saveRate = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Admin/set-rate-by-tutor-course`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tutorId: selectedTutorId,
            courseId: selectedCourseId,
            minHourlyRate: Number(minRate),
            maxHourlyRate: Number(maxRate),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Rate Updated Successfully");
        setModalVisible(false);
        fetchTutorCourses();
      } else {
        alert(data.message || data.title || "Failed to update rate.");
      }
    } catch (error) {
      alert("Network Error: " + error.message);
    }
  };

  useEffect(() => {
    fetchTutorCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTutorCourses();
  }, []);

  // Helper function for status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return { bg: "#DEF7EC", text: "#03543F" };
      case "Pending":
        return { bg: "#FEF3C7", text: "#92400E" };
      default:
        return { bg: "#FDE8E8", text: "#9B1C1C" };
    }
  };

  // Render Item: Course Card
  const renderCourse = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseHeaderRow}>
        <View style={styles.courseTitleContainer}>
          <Text style={styles.courseTitle}>{item.course_name}</Text>
          <Text style={styles.gradeBadge}>Grade {item.grade}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            item.is_completed ? styles.statusCompleted : styles.statusActive,
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              item.is_completed
                ? styles.statusCompletedText
                : styles.statusActiveText,
            ]}
          >
            {item.is_completed ? "Completed" : "Active"}
          </Text>
        </View>
      </View>

      <View style={styles.rateGrid}>
        <View style={styles.rateBox}>
          <Text style={styles.rateLabel}>Hourly Fee</Text>
          <Text style={styles.rateValue}>Rs. {item.hourly_rate}</Text>
        </View>

        <View style={styles.rateBox}>
          <Text style={styles.rateLabel}>Admin Min</Text>
          <Text style={styles.rateValue}>
            {item.admin_set_min_hourly_rate == null
              ? "-"
              : `Rs. ${item.admin_set_min_hourly_rate}`}
          </Text>
        </View>

        <View style={styles.rateBox}>
          <Text style={styles.rateLabel}>Admin Max</Text>
          <Text style={styles.rateValue}>
            {item.admin_set_max_hourly_rate == null
              ? "-"
              : `Rs. ${item.admin_set_max_hourly_rate}`}
          </Text>
        </View>
      </View>

      {item.completed_date && (
        <Text style={styles.completedDateText}>
          Completed on: {item.completed_date}
        </Text>
      )}

      <TouchableOpacity
        style={styles.setRateButton}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedTutorId(item.tutor_id);
          setSelectedCourseId(item.course_id);
          setMinRate(item.admin_set_min_hourly_rate?.toString() || "");
          setMaxRate(item.admin_set_max_hourly_rate?.toString() || "");
          setModalVisible(true);
        }}
      >
        <Text style={styles.setRateButtonText}>Set Hourly Limits</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Item: Tutor Card
  const renderTutor = ({ item }) => {
    const isExpanded = expandedTutor === item.tutor_id;
    const statusStyle = getStatusBadge(item.status);

    return (
      <View style={styles.tutorCard}>
        {/* Main Card Header */}
        <TouchableOpacity
          style={styles.tutorCardHeader}
          activeOpacity={0.7}
          onPress={() => toggleTutor(item.tutor_id)}
        >
          <View style={styles.tutorAvatar}>
            <Text style={styles.tutorAvatarText}>
              {item.tutor_name?.charAt(0).toUpperCase() || "T"}
            </Text>
          </View>

          <View style={styles.tutorMainInfo}>
            <View style={styles.tutorNameRow}>
              <Text style={styles.tutorName} numberOfLines={1}>
                {item.tutor_name}
              </Text>
              <View
                style={[
                  styles.tutorStatusBadge,
                  { backgroundColor: statusStyle.bg },
                ]}
              >
                <Text
                  style={[
                    styles.tutorStatusText,
                    { color: statusStyle.text },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.tutorSubtext}>{item.qualification}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>💼 {item.experience}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText} numberOfLines={1}>
                📍 {item.location}
              </Text>
            </View>
          </View>

          <View style={styles.expandIconContainer}>
            <Text style={styles.expandIcon}>{isExpanded ? "▲" : "▼"}</Text>
          </View>
        </TouchableOpacity>

        {/* Footer Summary Bar */}
        <View style={styles.tutorCardFooter}>
          <Text style={styles.coursesCountText}>
            📚 <Text style={styles.bold}>{item.total_courses || 0}</Text> Total
            Assigned Courses
          </Text>
          <TouchableOpacity onPress={() => toggleTutor(item.tutor_id)}>
            <Text style={styles.toggleText}>
              {isExpanded ? "Hide Courses" : "View Courses"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Accordion Content */}
        {isExpanded && (
          <View style={styles.coursesListContainer}>
            <FlatList
              data={item.courses}
              keyExtractor={(course) => course.course_id.toString()}
              scrollEnabled={false}
              renderItem={({ item: course }) =>
                renderCourse({
                  item: {
                    ...course,
                    tutor_id: item.tutor_id,
                  },
                })
              }
              ListEmptyComponent={
                <Text style={styles.emptyCoursesText}>
                  No courses found for this tutor.
                </Text>
              }
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading Tutors & Courses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerRightSpacer} />
      </View>

      {/* Screen Title Bar */}
      <View style={styles.titleSection}>
        <Text style={styles.heading}>Tutors & Courses</Text>
        <Text style={styles.subheading}>
          Manage tutor qualifications and set rate caps
        </Text>
      </View>

      {/* Main List */}
      <FlatList
        data={tutors}
        keyExtractor={(item) => item.tutor_id.toString()}
        renderItem={renderTutor}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4F46E5"]}
            tintColor="#4F46E5"
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Tutors Found</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh or check back later.
            </Text>
          </View>
        }
      />

      {/* Set Rate Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContentWrapper}
            >
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Set Rate Limits</Text>
                  <Text style={styles.modalSubtitle}>
                    Configure min and max hourly rate parameters for this course.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Min Hourly Rate (PKR)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1500"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={minRate}
                    onChangeText={setMinRate}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Max Hourly Rate (PKR)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={maxRate}
                    onChangeText={setMaxRate}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    activeOpacity={0.8}
                    onPress={saveRate}
                  >
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default TutorCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // Navigation Header
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  backIcon: {
    fontSize: 20,
    color: "#0F172A",
    fontWeight: "bold",
  },
  logo: {
    width: 120,
    height: 38,
  },
  headerRightSpacer: {
    width: 40,
  },

  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  // Tutor Card
  tutorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  tutorCardHeader: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  tutorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  tutorAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },
  tutorMainInfo: {
    flex: 1,
  },
  tutorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingRight: 4,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  tutorStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tutorStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  tutorSubtext: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  metaText: {
    fontSize: 12,
    color: "#64748B",
  },
  metaDot: {
    marginHorizontal: 6,
    color: "#94A3B8",
  },
  expandIconContainer: {
    paddingLeft: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: "#64748B",
  },
  tutorCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  coursesCountText: {
    fontSize: 12,
    color: "#475569",
  },
  bold: {
    fontWeight: "700",
    color: "#0F172A",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },

  // Courses Accordion Container
  coursesListContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  emptyCoursesText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 12,
    fontStyle: "italic",
  },

  // Individual Course Card
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  courseHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  courseTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  gradeBadge: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: "#EFF6FF",
  },
  statusActiveText: {
    color: "#1D4ED8",
  },
  statusCompleted: {
    backgroundColor: "#F0FDF4",
  },
  statusCompletedText: {
    color: "#15803D",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "600",
  },

  rateGrid: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 10,
    justifyContent: "space-between",
    marginVertical: 8,
  },
  rateBox: {
    alignItems: "flex-start",
  },
  rateLabel: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
    marginBottom: 2,
  },
  rateValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },
  completedDateText: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
  },
  setRateButton: {
    marginTop: 4,
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  setRateButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContentWrapper: {
    width: "100%",
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  cancelButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  saveButton: {
    flex: 1.5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#4F46E5",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Empty List State
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
  },
});
