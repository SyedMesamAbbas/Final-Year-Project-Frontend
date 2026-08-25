// Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
// Student can request to re and pre-scheduled tutor's
//Modified by Gemini
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const PRIMARY_COLOR = colors?.primary || "#2563EB";
const DURATION_UNITS = ["Days", "Weeks", "Months"];

const StudentFindTutor = ({ navigation, route }) => {
  const { courseId, courseName, userLat, userLng } = route.params || {};

  const [tutorsData, setTutorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Request Modal State
  const [requestModal, setRequestModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedClassDate, setSelectedClassDate] = useState(null);

  // Learning Mode State
  const [learningMode, setLearningMode] = useState("FullTime");
  const [learningDuration, setLearningDuration] = useState("");
  const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
  const [requestLoading, setRequestLoading] = useState(false);

  // ==========================
  // FETCH TUTORS
  // ==========================
  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);

      if (!courseId || userLat == null || userLng == null) {
        Alert.alert("Error", "Missing required location or course parameters.");
        navigation.goBack();
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTutorsData(Array.isArray(data) ? data : []);
      } else {
        setTutorsData([]);
        Alert.alert("Info", data?.message || "No tutors found in your area.");
      }
    } catch (error) {
      console.log("FETCH TUTORS ERROR:", error);
      Alert.alert("Error", "Unable to load available tutors.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // MODAL HANDLERS
  // ==========================
  const openRequestModal = (item) => {
    setSelectedTutor(item.tutor_id);
    setSelectedDay(item.day);
    setSelectedTime(item.time);
    setSelectedClassDate(item.class_date || null);

    setLearningMode("FullTime");
    setLearningDuration("");
    setLearningDurationUnit("Weeks");

    setRequestModal(true);
  };

  const closeRequestModal = () => {
    if (requestLoading) return;

    setRequestModal(false);
    setSelectedTutor(null);
    setSelectedDay("");
    setSelectedTime("");
    setSelectedClassDate(null);

    setLearningMode("FullTime");
    setLearningDuration("");
    setLearningDurationUnit("Weeks");
  };

  // ==========================
  // SEND REQUEST
  // ==========================
  const sendRequest = async () => {
    try {
      if (!selectedTutor) {
        Alert.alert("Validation Error", "Tutor is not selected.");
        return;
      }
      if (!selectedDay) {
        Alert.alert("Validation Error", "Please select a day.");
        return;
      }
      if (!selectedTime) {
        Alert.alert("Validation Error", "Please select a time slot.");
        return;
      }
      if (!learningMode) {
        Alert.alert("Validation Error", "Learning mode is required.");
        return;
      }

      if (learningMode === "SpecificTime") {
        if (!learningDuration || Number(learningDuration) <= 0) {
          Alert.alert("Validation Error", "Please enter a valid duration greater than zero.");
          return;
        }
        if (!learningDurationUnit) {
          Alert.alert("Validation Error", "Please select a duration unit.");
          return;
        }
      }

      setRequestLoading(true);
      const token = await AsyncStorage.getItem("token");

      const requestBody = {
        tutor_id: selectedTutor,
        course_id: courseId,
        day: selectedDay,
        time: selectedTime,
        class_date: selectedClassDate,
        learning_mode: learningMode,
        learning_duration:
          learningMode === "SpecificTime" ? Number(learningDuration) : null,
        learning_duration_unit:
          learningMode === "SpecificTime" ? learningDurationUnit : null,
      };

      const response = await fetch(`${BASE_URL}/Student/create-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setRequestModal(false);
        setSelectedTutor(null);
        setSelectedDay("");
        setSelectedTime("");
        setSelectedClassDate(null);
        setLearningMode("FullTime");
        setLearningDuration("");
        setLearningDurationUnit("Weeks");

        if (data?.tutor_unavailable === true) {
          let warningMessage =
            data?.note || "This tutor is unavailable for the selected time.";
          if (data?.next_available_day) {
            warningMessage += `\n\nAvailable next: ${data.next_available_day}`;
          }
          Alert.alert(
            "Request Sent",
            `${data?.message || "Class request created successfully."}\n\n${warningMessage}`
          );
        } else {
          Alert.alert("Success", data?.message || "Request sent successfully.");
        }
      } else {
        Alert.alert("Error", data?.message || "Failed to send request.");
      }
    } catch (error) {
      console.log("CREATE REQUEST ERROR:", error);
      Alert.alert("Error", error?.message || "Unable to send request.");
    } finally {
      setRequestLoading(false);
    }
  };

  // ==========================
  // DATA FLATTENING & FILTERING
  // ==========================
  const filteredTutors = tutorsData
    .flatMap((tutor) =>
      (tutor.common_slots || []).map((slot, index) => ({
        id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,
        tutor_id: tutor.tutor_id,
        tutor_name: tutor.tutor_name,
        location: tutor.location,
        distance: tutor.distance,
        average_rating: tutor.average_rating,
        total_reviews: tutor.total_reviews,
        day: slot.day,
        time: slot.time,
        is_available: slot.is_available,
        availability_message: slot.availability_message,
        request_type: slot.request_type,
        class_date: slot.class_date,
      }))
    )
    .filter((item) =>
      item.tutor_name?.toLowerCase().includes(search.toLowerCase())
    );

  // ==========================
  // RENDER TUTOR CARD
  // ==========================
  const renderTutor = ({ item }) => {
    const unavailable = item.is_available === false;

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.tutor_name ? item.tutor_name.charAt(0).toUpperCase() : "T"}
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.tutorName} numberOfLines={1}>
              {item.tutor_name}
            </Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingVal}>
                {Number(item.average_rating || 0).toFixed(1)}
              </Text>
              <Text style={styles.reviewCount}>
                ({item.total_reviews || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Location & Distance Metadata */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Icon name="place" size={16} color="#64748B" />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.location || "Location unavailable"}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Icon name="near-me" size={16} color="#64748B" />
            <Text style={styles.metaText}>
              {Number(item.distance || 0).toFixed(2)} km away
            </Text>
          </View>
        </View>

        {/* Slot Info Card */}
        <View
          style={[
            styles.slotCard,
            unavailable ? styles.slotCardUnavailable : styles.slotCardAvailable,
          ]}
        >
          <View style={styles.slotHeaderRow}>
            <View
              style={[
                styles.statusBadge,
                unavailable ? styles.badgeUnavailable : styles.badgeAvailable,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  unavailable ? styles.dotUnavailable : styles.dotAvailable,
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  unavailable ? styles.textUnavailable : styles.textAvailable,
                ]}
              >
                {unavailable ? "Slot Unavailable" : "Available Slot"}
              </Text>
            </View>
          </View>

          <View style={styles.slotDetailGrid}>
            <View style={styles.slotDetailItem}>
              <Icon name="event" size={16} color="#475569" />
              <Text style={styles.slotDetailText}>{item.day}</Text>
            </View>
            <View style={styles.slotDetailItem}>
              <Icon name="schedule" size={16} color="#475569" />
              <Text style={styles.slotDetailText}>{item.time}</Text>
            </View>
          </View>

          {unavailable && (
            <View style={styles.unavailableNotice}>
              <Icon name="info-outline" size={16} color="#D97706" />
              <View style={styles.noticeTextContainer}>
                <Text style={styles.noticeMessage}>
                  {item.availability_message || "Tutor unavailable for this slot."}
                </Text>
                {item.request_type && (
                  <Text style={styles.noticeReason}>
                    Reason: {item.request_type}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.requestButton}
          activeOpacity={0.8}
          onPress={() => openRequestModal(item)}
        >
          <Text style={styles.requestButtonText}>Book Class Request</Text>
          <Icon name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Navigation Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerSubtitle}>Tutor Discovery</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {courseName || "Available Tutors"}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Field */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#94A3B8" />
          <TextInput
            placeholder="Search tutors by name..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            clearButtonMode="while-editing"
          />
          {search.length > 0 && Platform.OS !== "ios" && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Icon name="close" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tutor List / Loader / Empty State */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Finding tutors nearby...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTutors}
          keyExtractor={(item) => item.id}
          renderItem={renderTutor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="search-off" size={32} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Tutors Available</Text>
              <Text style={styles.emptySubtext}>
                We couldn't find matches for your selection. Try adjusting your search term.
              </Text>
            </View>
          }
        />
      )}

      {/* Booking Modal */}
      <Modal
        visible={requestModal}
        transparent
        animationType="fade"
        onRequestClose={closeRequestModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTitle}>Class Request</Text>
                <Text style={styles.modalHeaderSubtitle}>
                  Configure duration and submit request
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeRequestModal}
                disabled={requestLoading}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBody}
            >
              {/* Selected Slot Summary Box */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Selected Slot</Text>
                <View style={styles.summaryRow}>
                  <Icon name="event" size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.summaryText}>{selectedDay}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Icon name="schedule" size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.summaryText}>{selectedTime}</Text>
                </View>
                {selectedClassDate && (
                  <View style={styles.summaryRow}>
                    <Icon name="calendar-today" size={16} color={PRIMARY_COLOR} />
                    <Text style={styles.summaryText}>{selectedClassDate}</Text>
                  </View>
                )}
              </View>

              {/* Mode Selection Segmented Controller */}
              <Text style={styles.fieldLabel}>Learning Mode</Text>
              <View style={styles.segmentedControl}>
                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    learningMode === "FullTime" && styles.segmentButtonActive,
                  ]}
                  onPress={() => setLearningMode("FullTime")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      learningMode === "FullTime" && styles.segmentTextActive,
                    ]}
                  >
                    Full Time
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentButton,
                    learningMode === "SpecificTime" && styles.segmentButtonActive,
                  ]}
                  onPress={() => setLearningMode("SpecificTime")}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      learningMode === "SpecificTime" && styles.segmentTextActive,
                    ]}
                  >
                    Specific Time
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dynamic Duration Fields */}
              {learningMode === "SpecificTime" && (
                <View style={styles.durationSection}>
                  <Text style={styles.fieldLabel}>Duration Value</Text>
                  <View style={styles.textInputWrapper}>
                    <Icon name="timer" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
                    <TextInput
                      placeholder="e.g. 4"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={learningDuration}
                      onChangeText={setLearningDuration}
                      style={styles.modalTextInput}
                    />
                  </View>

                  <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Duration Unit</Text>
                  <View style={styles.unitChipContainer}>
                    {DURATION_UNITS.map((unit) => {
                      const isSelected = learningDurationUnit === unit;
                      return (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitChip,
                            isSelected && styles.unitChipSelected,
                          ]}
                          onPress={() => setLearningDurationUnit(unit)}
                        >
                          <Text
                            style={[
                              styles.unitChipText,
                              isSelected && styles.unitChipTextSelected,
                            ]}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Modal Action Controls */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  disabled={requestLoading}
                  style={[
                    styles.submitButton,
                    requestLoading && styles.disabledButton,
                  ]}
                  onPress={sendRequest}
                >
                  {requestLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={requestLoading}
                  style={styles.cancelButton}
                  onPress={closeRequestModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ======================================================
// STYLESHEET
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Top Bar Navigation
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  // Center Content / Loading
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },

  // List Layout
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Tutor Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
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
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  ratingVal: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 4,
  },

  // Metadata Layout
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  metaText: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 6,
  },

  // Slot Display Card
  slotCard: {
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  slotCardAvailable: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  slotCardUnavailable: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FEF3C7",
  },
  slotHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAvailable: {
    backgroundColor: "#DCFCE7",
  },
  badgeUnavailable: {
    backgroundColor: "#FEF3C7",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotAvailable: {
    backgroundColor: "#16A34A",
  },
  dotUnavailable: {
    backgroundColor: "#D97706",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  textAvailable: {
    color: "#15803D",
  },
  textUnavailable: {
    color: "#B45309",
  },

  slotDetailGrid: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  slotDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  slotDetailText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginLeft: 6,
  },

  unavailableNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A",
  },
  noticeTextContainer: {
    flex: 1,
    marginLeft: 6,
  },
  noticeMessage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B45309",
    lineHeight: 16,
  },
  noticeReason: {
    fontSize: 11,
    color: "#D97706",
    marginTop: 2,
  },

  // Request Button
  requestButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  requestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 6,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalHeaderSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },

  // Selected Slot Box
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 8,
  },

  // Form Components
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  segmentTextActive: {
    color: PRIMARY_COLOR,
  },

  // Duration Subfields
  durationSection: {
    marginBottom: 16,
  },
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },
  unitChipContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  unitChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    marginHorizontal: 3,
  },
  unitChipSelected: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: "#EFF6FF",
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  unitChipTextSelected: {
    color: PRIMARY_COLOR,
  },

  // Modal Action Buttons
  modalActions: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 10,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButton: {
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default StudentFindTutor;
