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



























// // Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
// // Student can request to re and pre-scheduled tutor's
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   ScrollView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentFindTutor = ({ navigation, route }) => {
//   const { courseId, courseName, userLat, userLng } = route.params || {};

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");

//   // Request Modal
//   const [requestModal, setRequestModal] = useState(false);

//   const [selectedTutor, setSelectedTutor] = useState(null);
//   const [selectedDay, setSelectedDay] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [selectedClassDate, setSelectedClassDate] = useState(null);

//   // Learning Mode
//   const [learningMode, setLearningMode] = useState("FullTime");
//   const [learningDuration, setLearningDuration] = useState("");
//   const [learningDurationUnit, setLearningDurationUnit] =
//     useState("Weeks");

//   // Request loading
//   const [requestLoading, setRequestLoading] = useState(false);

//   // ==========================
//   // FETCH TUTORS
//   // ==========================
//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       if (!courseId || userLat == null || userLng == null) {
//         Alert.alert("Error", "Missing required data");
//         navigation.goBack();
//         return;
//       }

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutorsData(Array.isArray(data) ? data : []);
//       } else {
//         setTutorsData([]);

//         Alert.alert(
//           "Info",
//           data?.message || "No tutors found."
//         );
//       }
//     } catch (error) {
//       console.log("FETCH TUTORS ERROR:", error);

//       Alert.alert(
//         "Error",
//         "Unable to load tutors."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================
//   // OPEN REQUEST MODAL
//   // ==========================
//   const openRequestModal = (item) => {
//     setSelectedTutor(item.tutor_id);
//     setSelectedDay(item.day);
//     setSelectedTime(item.time);
//     setSelectedClassDate(item.class_date || null);

//     // Reset learning fields
//     setLearningMode("FullTime");
//     setLearningDuration("");
//     setLearningDurationUnit("Weeks");

//     setRequestModal(true);
//   };

//   // ==========================
//   // CLOSE REQUEST MODAL
//   // ==========================
//   const closeRequestModal = () => {
//     if (requestLoading) {
//       return;
//     }

//     setRequestModal(false);

//     setSelectedTutor(null);
//     setSelectedDay("");
//     setSelectedTime("");
//     setSelectedClassDate(null);

//     setLearningMode("FullTime");
//     setLearningDuration("");
//     setLearningDurationUnit("Weeks");
//   };

//   // ==========================
//   // SEND REQUEST
//   // ==========================
//   const sendRequest = async () => {
//     try {
//       // --------------------------
//       // Validate Tutor
//       // --------------------------
//       if (!selectedTutor) {
//         Alert.alert(
//           "Validation",
//           "Tutor is not selected."
//         );
//         return;
//       }

//       // --------------------------
//       // Validate Day
//       // --------------------------
//       if (!selectedDay) {
//         Alert.alert(
//           "Validation",
//           "Please select a day."
//         );
//         return;
//       }

//       // --------------------------
//       // Validate Time
//       // --------------------------
//       if (!selectedTime) {
//         Alert.alert(
//           "Validation",
//           "Please select a time."
//         );
//         return;
//       }

//       // --------------------------
//       // Validate Learning Mode
//       // --------------------------
//       if (!learningMode) {
//         Alert.alert(
//           "Validation",
//           "Learning mode is required."
//         );
//         return;
//       }

//       // --------------------------
//       // Validate Specific Time
//       // --------------------------
//       if (learningMode === "SpecificTime") {
//         if (
//           learningDuration === "" ||
//           Number(learningDuration) <= 0
//         ) {
//           Alert.alert(
//             "Validation",
//             "Enter a valid learning duration."
//           );
//           return;
//         }

//         if (!learningDurationUnit) {
//           Alert.alert(
//             "Validation",
//             "Select learning duration unit."
//           );
//           return;
//         }
//       }

//       setRequestLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       // --------------------------
//       // Request Body
//       // --------------------------
//       const requestBody = {
//         tutor_id: selectedTutor,
//         course_id: courseId,
//         day: selectedDay,
//         time: selectedTime,

//         // Your current backend DTO does not use this,
//         // but keeping it is okay if DTO contains it.
//         class_date: selectedClassDate,

//         learning_mode: learningMode,

//         learning_duration:
//           learningMode === "SpecificTime"
//             ? Number(learningDuration)
//             : null,

//         learning_duration_unit:
//           learningMode === "SpecificTime"
//             ? learningDurationUnit
//             : null,
//       };

//       console.log(
//         "CREATE REQUEST BODY:",
//         requestBody
//       );

//       // --------------------------
//       // API CALL
//       // --------------------------
//       const response = await fetch(
//         `${BASE_URL}/Student/create-request`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },

//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();

//       console.log(
//         "CREATE REQUEST RESPONSE:",
//         data
//       );

//       // --------------------------
//       // SUCCESS
//       // --------------------------
//       if (response.ok) {
//         setRequestModal(false);

//         // Reset fields
//         setSelectedTutor(null);
//         setSelectedDay("");
//         setSelectedTime("");
//         setSelectedClassDate(null);

//         setLearningMode("FullTime");
//         setLearningDuration("");
//         setLearningDurationUnit("Weeks");

//         // -----------------------------------
//         // Tutor is unavailable
//         // -----------------------------------
//         if (data?.tutor_unavailable === true) {
//           let warningMessage =
//             data?.note ||
//             "This tutor is unavailable for the selected time.";

//           if (data?.next_available_day) {
//             warningMessage +=
//               `\n\nAvailable next: ${data.next_available_day}`;
//           }

//           Alert.alert(
//             "Request Sent",
//             `${data?.message || "Class request created successfully."}\n\n${warningMessage}`
//           );
//         } else {
//           // -----------------------------------
//           // Tutor is available
//           // -----------------------------------
//           Alert.alert(
//             "Success",
//             data?.message ||
//               "Request sent successfully."
//           );
//         }
//       } else {
//         Alert.alert(
//           "Error",
//           data?.message ||
//             "Request failed."
//         );
//       }
//     } catch (error) {
//       console.log(
//         "CREATE REQUEST ERROR:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error?.message ||
//           "Unable to send request."
//       );
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // ==========================
//   // ONE CARD FOR EACH SLOT
//   // ==========================
//   const filteredTutors = tutorsData
//     .flatMap((tutor) =>
//       (tutor.common_slots || []).map(
//         (slot, index) => ({
//           id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

//           tutor_id: tutor.tutor_id,
//           tutor_name: tutor.tutor_name,
//           location: tutor.location,
//           distance: tutor.distance,
//           average_rating: tutor.average_rating,
//           total_reviews: tutor.total_reviews,

//           day: slot.day,
//           time: slot.time,

//           // Availability information
//           is_available: slot.is_available,
//           availability_message:
//             slot.availability_message,

//           request_type:
//             slot.request_type,

//           class_date:
//             slot.class_date,
//         })
//       )
//     )
//     .filter((item) =>
//       item.tutor_name
//         ?.toLowerCase()
//         .includes(search.toLowerCase())
//     );

//   // ==========================
//   // RENDER TUTOR
//   // ==========================
//   const renderTutor = ({ item }) => {
//     const unavailable =
//       item.is_available === false;

//     return (
//       <View style={styles.card}>
//         {/* --------------------------
//             TUTOR HEADER
//         -------------------------- */}
//         <View style={styles.topRow}>
//           <Text style={styles.name}>
//             {item.tutor_name}
//           </Text>

//           <View style={styles.ratingBadge}>
//             <Text style={styles.ratingText}>
//               ⭐{" "}
//               {Number(
//                 item.average_rating || 0
//               ).toFixed(1)}
//             </Text>
//           </View>
//         </View>

//         {/* --------------------------
//             TUTOR INFORMATION
//         -------------------------- */}
//         <Text style={styles.info}>
//           📍{" "}
//           {item.location ||
//             "Unknown Location"}
//         </Text>

//         <Text style={styles.info}>
//           🚶{" "}
//           {Number(
//             item.distance || 0
//           ).toFixed(2)}{" "}
//           km away
//         </Text>

//         <Text style={styles.info}>
//           📝{" "}
//           {item.total_reviews || 0} Reviews
//         </Text>

//         {/* --------------------------
//             SLOT
//         -------------------------- */}
//         <View
//           style={[
//             styles.slotBox,

//             unavailable &&
//               styles.unavailableSlotBox,
//           ]}
//         >
//           <Text
//             style={[
//               styles.slotHeading,

//               unavailable &&
//                 styles.unavailableHeading,
//             ]}
//           >
//             {unavailable
//               ? "Unavailable Slot"
//               : "Available Slot"}
//           </Text>

//           <Text style={styles.slotText}>
//             📅 {item.day}
//           </Text>

//           <Text style={styles.slotText}>
//             🕒 {item.time}
//           </Text>

//           {/* --------------------------
//               UNAVAILABLE INFORMATION
//           -------------------------- */}
//           {unavailable && (
//             <>
//               <View
//                 style={{
//                   height: 8,
//                 }}
//               />

//               {item.availability_message ? (
//                 <Text
//                   style={
//                     styles.unavailableMessage
//                   }
//                 >
//                   {item.availability_message}
//                 </Text>
//               ) : (
//                 <Text
//                   style={
//                     styles.unavailableMessage
//                   }
//                 >
//                   This tutor is unavailable
//                   for this slot.
//                 </Text>
//               )}

//               {item.request_type && (
//                 <Text
//                   style={
//                     styles.requestType
//                   }
//                 >
//                   Reason:{" "}
//                   {item.request_type}
//                 </Text>
//               )}
//             </>
//           )}
//         </View>

//         {/* --------------------------
//             REQUEST BUTTON
//             IMPORTANT:
//             Even if unavailable, button
//             remains enabled because the
//             backend allows the request.
//         -------------------------- */}
//         <TouchableOpacity
//           style={styles.primaryBtn}
//           onPress={() =>
//             openRequestModal(item)
//           }
//         >
//           <Text style={styles.primaryText}>
//             Request
//           </Text>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // ==========================
//   // SCREEN
//   // ==========================
//   return (
//     <SafeAreaView
//       style={styles.container}
//     >
//       {/* ==========================
//           HEADER
//       ========================== */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() =>
//             navigation.goBack()
//           }
//         >
//           <Icon
//             name="arrow-back"
//             size={26}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         <Text style={styles.title}>
//           {courseName || "Find Tutor"}
//         </Text>

//         <View
//           style={{
//             width: 26,
//           }}
//         />
//       </View>

//       {/* ==========================
//           SEARCH
//       ========================== */}
//       <View style={styles.searchBar}>
//         <Icon
//           name="search"
//           size={20}
//           color="#666"
//         />

//         <TextInput
//           placeholder="Search Tutor..."
//           placeholderTextColor="#888"
//           value={search}
//           onChangeText={setSearch}
//           style={styles.input}
//         />
//       </View>

//       {/* ==========================
//           LIST
//       ========================== */}
//       {loading ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator
//             size="large"
//             color={colors.primary}
//           />

//           <Text style={styles.loadingText}>
//             Loading tutors...
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) =>
//             item.id
//           }
//           renderItem={renderTutor}
//           contentContainerStyle={{
//             paddingBottom: 100,
//           }}
//           showsVerticalScrollIndicator={
//             false
//           }
//           ListEmptyComponent={
//             <Text
//               style={styles.emptyText}
//             >
//               No Tutor Found
//             </Text>
//           }
//         />
//       )}

//       {/* ==========================
//           REQUEST MODAL
//       ========================== */}
//       <Modal
//         visible={requestModal}
//         transparent
//         animationType="slide"
//         onRequestClose={
//           closeRequestModal
//         }
//       >
//         <View
//           style={styles.modalContainer}
//         >
//           <View style={styles.modalBox}>
//             <ScrollView
//               showsVerticalScrollIndicator={
//                 false
//               }
//             >
//               {/* --------------------------
//                   MODAL TITLE
//               -------------------------- */}
//               <Text
//                 style={styles.modalTitle}
//               >
//                 Send Request
//               </Text>

//               {/* --------------------------
//                   SELECTED SLOT
//               -------------------------- */}
//               <View
//                 style={styles.selectedSlotBox}
//               >
//                 <Text
//                   style={
//                     styles.selectedSlotTitle
//                   }
//                 >
//                   Selected Class
//                 </Text>

//                 <Text
//                   style={
//                     styles.selectedSlotText
//                   }
//                 >
//                   📅 {selectedDay}
//                 </Text>

//                 <Text
//                   style={
//                     styles.selectedSlotText
//                   }
//                 >
//                   🕒 {selectedTime}
//                 </Text>

//                 {selectedClassDate && (
//                   <Text
//                     style={
//                       styles.selectedSlotText
//                     }
//                   >
//                     📆 {selectedClassDate}
//                   </Text>
//                 )}
//               </View>

//               {/* --------------------------
//                   LEARNING MODE
//               -------------------------- */}
//               <Text
//                 style={styles.label}
//               >
//                 Learning Mode
//               </Text>

//               {/* Full Time */}
//               <TouchableOpacity
//                 style={[
//                   styles.modeButton,

//                   learningMode ===
//                     "FullTime" &&
//                     styles.selectedMode,
//                 ]}
//                 onPress={() =>
//                   setLearningMode(
//                     "FullTime"
//                   )
//                 }
//               >
//                 <Text
//                   style={[
//                     styles.modeButtonText,

//                     learningMode ===
//                       "FullTime" &&
//                       styles.selectedModeText,
//                   ]}
//                 >
//                   Full Time
//                 </Text>
//               </TouchableOpacity>

//               {/* Specific Time */}
//               <TouchableOpacity
//                 style={[
//                   styles.modeButton,

//                   learningMode ===
//                     "SpecificTime" &&
//                     styles.selectedMode,
//                 ]}
//                 onPress={() =>
//                   setLearningMode(
//                     "SpecificTime"
//                   )
//                 }
//               >
//                 <Text
//                   style={[
//                     styles.modeButtonText,

//                     learningMode ===
//                       "SpecificTime" &&
//                       styles.selectedModeText,
//                   ]}
//                 >
//                   Specific Time
//                 </Text>
//               </TouchableOpacity>

//               {/* --------------------------
//                   SPECIFIC TIME
//               -------------------------- */}
//               {learningMode ===
//                 "SpecificTime" && (
//                 <>
//                   <TextInput
//                     placeholder="Enter Duration"
//                     placeholderTextColor="#888"
//                     keyboardType="numeric"
//                     value={
//                       learningDuration
//                     }
//                     onChangeText={
//                       setLearningDuration
//                     }
//                     style={
//                       styles.inputBox
//                     }
//                   />

//                   <View
//                     style={
//                       styles.pickerContainer
//                     }
//                   >
//                     <Picker
//                       selectedValue={
//                         learningDurationUnit
//                       }
//                       onValueChange={(value) =>
//                         setLearningDurationUnit(
//                           value
//                         )
//                       }
//                     >
//                       <Picker.Item
//                         label="Days"
//                         value="Days"
//                       />

//                       <Picker.Item
//                         label="Weeks"
//                         value="Weeks"
//                       />

//                       <Picker.Item
//                         label="Months"
//                         value="Months"
//                       />
//                     </Picker>
//                   </View>
//                 </>
//               )}

//               {/* --------------------------
//                   SEND REQUEST
//               -------------------------- */}
//               <TouchableOpacity
//                 disabled={requestLoading}
//                 style={[
//                   styles.primaryBtn,

//                   requestLoading &&
//                     styles.loadingButton,
//                 ]}
//                 onPress={sendRequest}
//               >
//                 {requestLoading ? (
//                   <ActivityIndicator
//                     size="small"
//                     color="#fff"
//                   />
//                 ) : (
//                   <Text
//                     style={
//                       styles.primaryText
//                     }
//                   >
//                     Send Request
//                   </Text>
//                 )}
//               </TouchableOpacity>

//               {/* --------------------------
//                   CANCEL
//               -------------------------- */}
//               <TouchableOpacity
//                 disabled={requestLoading}
//                 style={styles.cancelBtn}
//                 onPress={
//                   closeRequestModal
//                 }
//               >
//                 <Text
//                   style={
//                     styles.cancelText
//                   }
//                 >
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // ======================================================
// // STYLES
// // ======================================================

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//     padding: 16,
//   },

//   // ==========================
//   // HEADER
//   // ==========================
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },

//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: colors.primary,
//   },

//   // ==========================
//   // SEARCH
//   // ==========================
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },

//   input: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#000",
//   },

//   // ==========================
//   // LOADING
//   // ==========================
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   loadingText: {
//     marginTop: 10,
//     color: "#666",
//     fontSize: 14,
//   },

//   // ==========================
//   // CARD
//   // ==========================
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     elevation: 3,
//   },

//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   name: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#222",
//     marginRight: 10,
//   },

//   ratingBadge: {
//     backgroundColor: "#FFF4CC",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },

//   ratingText: {
//     color: "#B8860B",
//     fontWeight: "bold",
//     fontSize: 14,
//   },

//   info: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 4,
//   },

//   // ==========================
//   // SLOT
//   // ==========================
//   slotBox: {
//     backgroundColor: "#EAF7FF",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//   },

//   slotHeading: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: 8,
//   },

//   slotText: {
//     fontSize: 15,
//     color: "#333",
//     marginBottom: 4,
//   },

//   // ==========================
//   // UNAVAILABLE
//   // ==========================
//   unavailableSlotBox: {
//     backgroundColor: "#FFF8E1",
//     borderLeftColor: "#FF9800",
//   },

//   unavailableHeading: {
//     color: "#E65100",
//   },

//   unavailableMessage: {
//     color: "#D84315",
//     fontWeight: "700",
//     marginTop: 4,
//     fontSize: 14,
//     lineHeight: 20,
//   },

//   requestType: {
//     marginTop: 6,
//     color: "#FB8C00",
//     fontWeight: "bold",
//     fontSize: 13,
//   },

//   // ==========================
//   // BUTTON
//   // ==========================
//   primaryBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 15,
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },

//   loadingButton: {
//     opacity: 0.7,
//   },

//   // ==========================
//   // EMPTY
//   // ==========================
//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#777",
//   },

//   // ==========================
//   // MODAL
//   // ==========================
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor:
//       "rgba(0,0,0,0.4)",
//   },

//   modalBox: {
//     margin: 20,
//     maxHeight: "85%",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//     color: "#222",
//   },

//   // ==========================
//   // SELECTED SLOT
//   // ==========================
//   selectedSlotBox: {
//     backgroundColor: "#F1F5F9",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 18,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//   },

//   selectedSlotTitle: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: colors.primary,
//     marginBottom: 8,
//   },

//   selectedSlotText: {
//     fontSize: 14,
//     color: "#444",
//     marginBottom: 4,
//   },

//   // ==========================
//   // LABEL
//   // ==========================
//   label: {
//     fontWeight: "bold",
//     marginBottom: 10,
//     fontSize: 15,
//     color: "#222",
//   },

//   // ==========================
//   // LEARNING MODE
//   // ==========================
//   modeButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//   },

//   selectedMode: {
//     borderColor: colors.primary,
//     backgroundColor: "#E3F2FD",
//   },

//   modeButtonText: {
//     color: "#333",
//     fontSize: 15,
//   },

//   selectedModeText: {
//     color: colors.primary,
//     fontWeight: "bold",
//   },

//   // ==========================
//   // INPUT
//   // ==========================
//   inputBox: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 10,
//     color: "#000",
//   },

//   pickerContainer: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     overflow: "hidden",
//     marginBottom: 5,
//   },

//   // ==========================
//   // CANCEL
//   // ==========================
//   cancelBtn: {
//     alignItems: "center",
//     marginTop: 12,
//     paddingVertical: 10,
//   },

//   cancelText: {
//     color: "#555",
//     fontSize: 15,
//     fontWeight: "600",
//   },
// });

// export default StudentFindTutor;



























// // Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
// //Student cannot request to re and pre-scheduled tutor's
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentFindTutor = ({ navigation, route }) => {
//   const { courseId, courseName, userLat, userLng } = route.params || {};

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [requestModal, setRequestModal] = useState(false);
//   const [selectedTutor, setSelectedTutor] = useState(null);
//   const [selectedDay, setSelectedDay] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [learningMode, setLearningMode] = useState("FullTime");
//   const [learningDuration, setLearningDuration] = useState("");
//   const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
//   const [selectedClassDate, setSelectedClassDate] = useState(null);

//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   // ==========================
//   // FETCH TUTORS
//   // ==========================
//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       if (!courseId || userLat == null || userLng == null) {
//         Alert.alert("Error", "Missing required data");
//         navigation.goBack();
//         return;
//       }

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutorsData(Array.isArray(data) ? data : []);
//       } else {
//         setTutorsData([]);
//         Alert.alert("Info", data.message || "No tutors found.");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Unable to load tutors.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================
//   // SEND REQUEST
//   // ==========================
//   const sendRequest = async () => {
//   try {
//     if (
//       learningMode === "SpecificTime" &&
//       (learningDuration === "" ||
//         Number(learningDuration) <= 0)
//     ) {
//       Alert.alert(
//         "Validation",
//         "Enter learning duration."
//       );
//       return;
//     }

//     const token = await AsyncStorage.getItem("token");

//     const response = await fetch(
//       `${BASE_URL}/Student/create-request`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           tutor_id: selectedTutor,
//           course_id: courseId,
//           day: selectedDay,
//           time: selectedTime,
//           class_date: selectedClassDate,

//           learning_mode: learningMode,

//           learning_duration:
//             learningMode === "SpecificTime"
//               ? Number(learningDuration)
//               : null,

//           learning_duration_unit:
//             learningMode === "SpecificTime"
//               ? learningDurationUnit
//               : null,
//         }),
//       }
//     );

//     const data = await response.json();

//     if (response.ok) {
//       Alert.alert(
//         "Success",
//         "Request sent successfully."
//       );

//       setRequestModal(false);

//       setLearningMode("FullTime");

//       setLearningDuration("");

//       setLearningDurationUnit("Weeks");
//     } else {
//       Alert.alert(
//         "Error",
//         data.message || "Request failed."
//       );
//     }
//   } catch (error) {
//     Alert.alert("Error", error.message);
//   }
// };

//   // ==========================
//   // ONE CARD FOR EACH SLOT
//   // ==========================
//   const filteredTutors = tutorsData
//     .flatMap((tutor) =>
//       (tutor.common_slots || []).map((slot, index) => ({
//         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

//         tutor_id: tutor.tutor_id,
//         tutor_name: tutor.tutor_name,
//         location: tutor.location,
//         distance: tutor.distance,
//         average_rating: tutor.average_rating,
//         total_reviews: tutor.total_reviews,

//         day: slot.day,
//         time: slot.time,

//         // NEW
//         is_available: slot.is_available,
//         availability_message: slot.availability_message,
//         request_type: slot.request_type,
//         class_date: slot.class_date,
//       }))
//     )
//     .filter((item) =>
//       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
//     );

//   // ==========================
//   // RENDER TUTOR
//   // ==========================
//   const renderTutor = ({ item }) => {
//   const unavailable = item.is_available === false;

//   return (
//     <View style={styles.card}>
//       <View style={styles.topRow}>
//         <Text style={styles.name}>{item.tutor_name}</Text>

//         <View style={styles.ratingBadge}>
//           <Text style={styles.ratingText}>
//             ⭐ {Number(item.average_rating || 0).toFixed(1)}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.info}>
//         📍 {item.location || "Unknown Location"}
//       </Text>

//       <Text style={styles.info}>
//         🚶 {Number(item.distance || 0).toFixed(2)} km away
//       </Text>

//       <Text style={styles.info}>
//         📝 {item.total_reviews} Reviews
//       </Text>

//       {/* SLOT */}

//       <View
//         style={[
//           styles.slotBox,
//           unavailable && styles.unavailableSlotBox,
//         ]}
//       >
//         <Text
//           style={[
//             styles.slotHeading,
//             unavailable && styles.unavailableHeading,
//           ]}
//         >
//           {unavailable ? "Unavailable Slot" : "Available Slot"}
//         </Text>

//         <Text style={styles.slotText}>
//           📅 {item.day}
//         </Text>

//         <Text style={styles.slotText}>
//           🕒 {item.time}
//         </Text>

//         {unavailable && (
//           <>
//             <View style={{ height: 8 }} />

//             <Text style={styles.unavailableMessage}>
//               {item.availability_message}
//             </Text>

//             <Text style={styles.requestType}>
//               {item.request_type}
//             </Text>
//           </>
//         )}
//       </View>

//       <TouchableOpacity
//         disabled={unavailable}
//         style={[
//           styles.primaryBtn,
//           unavailable && styles.disabledButton,
//         ]}
//         onPress={() => {
//           setSelectedTutor(item.tutor_id);
//           setSelectedDay(item.day);
//           setSelectedTime(item.time);
//           setRequestModal(true);
//         }}
//       >
//         <Text style={styles.primaryText}>
//           {unavailable ? "Unavailable" : "Request"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>
//         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
//         <View style={{ width: 26 }} />
//       </View>

//       {/* SEARCH */}
//       <View style={styles.searchBar}>
//         <Icon name="search" size={20} color="#666" />
//         <TextInput
//           placeholder="Search Tutor..."
//           value={search}
//           onChangeText={setSearch}
//           style={styles.input}
//         />
//       </View>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} />
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) => item.id}
//           renderItem={renderTutor}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No Tutor Found</Text>
//           }
//         />
//       )}

//       <Modal
//         visible={requestModal}
//         transparent
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalBox}>

//             <Text style={styles.modalTitle}>
//               Send Request
//             </Text>

//             <Text style={styles.label}>
//               Learning Mode
//             </Text>

//             <TouchableOpacity
//               style={[
//                 styles.modeButton,
//                 learningMode === "FullTime" &&
//                   styles.selectedMode,
//               ]}
//               onPress={() =>
//                 setLearningMode("FullTime")
//               }
//             >
//               <Text>Full Time</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.modeButton,
//                 learningMode === "SpecificTime" &&
//                   styles.selectedMode,
//               ]}
//               onPress={() =>
//                 setLearningMode("SpecificTime")
//               }
//             >
//               <Text>Specific Time</Text>
//             </TouchableOpacity>

//             {learningMode === "SpecificTime" && (
//               <>
//                 <TextInput
//                   placeholder="Duration"
//                   keyboardType="numeric"
//                   value={learningDuration}
//                   onChangeText={setLearningDuration}
//                   style={styles.inputBox}
//                 />

//                 <Picker
//                   selectedValue={
//                     learningDurationUnit
//                   }
//                   onValueChange={(v) =>
//                     setLearningDurationUnit(v)
//                   }
//                 >
//                   <Picker.Item
//                     label="Days"
//                     value="Days"
//                   />
//                   <Picker.Item
//                     label="Weeks"
//                     value="Weeks"
//                   />
//                   <Picker.Item
//                     label="Months"
//                     value="Months"
//                   />
//                 </Picker>
//               </>
//             )}

//             <TouchableOpacity
//               style={styles.primaryBtn}
//               onPress={sendRequest}
//             >
//               <Text style={styles.primaryText}>
//                 Send Request
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.cancelBtn}
//               onPress={() =>
//                 setRequestModal(false)
//               }
//             >
//               <Text>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // Styles moved outside the component function block
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//     padding: 16,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: colors.primary,
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   input: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#000",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   name: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#222",
//     marginRight: 10,
//   },
//   ratingBadge: {
//     backgroundColor: "#FFF4CC",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   ratingText: {
//     color: "#B8860B",
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   info: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 4,
//   },
//   slotBox: {
//     backgroundColor: "#EAF7FF",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//   },
//   slotHeading: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: 8,
//   },
//   slotText: {
//     fontSize: 15,
//     color: "#333",
//     marginBottom: 4,
//   },
//   primaryBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   primaryText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#777",
//   },
//   unavailableSlotBox: {
//     backgroundColor: "#FFF8E1",
//     borderLeftColor: "#FF9800",
//   },

//   unavailableHeading: {
//     color: "#E65100",
//   },

//   unavailableMessage: {
//     color: "#D84315",
//     fontWeight: "700",
//     marginTop: 4,
//     fontSize: 14,
//   },

//   requestType: {
//     marginTop: 6,
//     color: "#FB8C00",
//     fontWeight: "bold",
//     fontSize: 13,
//   },

//   disabledButton: {
//     backgroundColor: "#BDBDBD",
//   },
//     modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },

//   modalBox: {
//     margin: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },

//   label: {
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   modeButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//   },

//   selectedMode: {
//     borderColor: colors.primary,
//     backgroundColor: "#E3F2FD",
//   },

//   inputBox: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 10,
//   },

//   cancelBtn: {
//     alignItems: "center",
//     marginTop: 12,
//   },
// });

// export default StudentFindTutor;





























// // // Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TextInput,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   Modal,
// // } from "react-native";
// // import { Picker } from "@react-native-picker/picker";
// // //import DateTimePicker from "@react-native-community/datetimepicker";
// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import colors from "../utils/colors";
// // import { BASE_URL } from "../../config/api";

// // const StudentFindTutor = ({ navigation, route }) => {
// //   const { courseId, courseName, userLat, userLng } = route.params || {};

// //   const [tutorsData, setTutorsData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [search, setSearch] = useState("");
// //   const [requestModal, setRequestModal] = useState(false);
// //   const [selectedTutor, setSelectedTutor] = useState(null);
// //   const [selectedDay, setSelectedDay] = useState("");
// //   const [selectedTime, setSelectedTime] = useState("");
// //   const [learningMode, setLearningMode] = useState("FullTime");
// //   const [learningDuration, setLearningDuration] = useState("");
// //   const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
// //   const [showDatePicker, setShowDatePicker] = useState(false);
// //   const [selectedClassDate, setSelectedClassDate] = useState(new Date());

// //   useEffect(() => {
// //     fetchTutors();
// //   }, []);

// //   // ==========================
// //   // FETCH TUTORS
// //   // ==========================
// //   const fetchTutors = async () => {
// //     try {
// //       setLoading(true);

// //       if (!courseId || userLat == null || userLng == null) {
// //         Alert.alert("Error", "Missing required data");
// //         navigation.goBack();
// //         return;
// //       }

// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(
// //         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok) {
// //         setTutorsData(Array.isArray(data) ? data : []);
// //       } else {
// //         setTutorsData([]);
// //         Alert.alert("Info", data.message || "No tutors found.");
// //       }
// //     } catch (error) {
// //       console.log(error);
// //       Alert.alert("Error", "Unable to load tutors.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ==========================
// //   // SEND REQUEST
// //   // ==========================
// //   const sendRequest = async () => {
// //   try {
// //     if (
// //       learningMode === "SpecificTime" &&
// //       (learningDuration === "" ||
// //         Number(learningDuration) <= 0)
// //     ) {
// //       Alert.alert(
// //         "Validation",
// //         "Enter learning duration."
// //       );
// //       return;
// //     }

// //     const token = await AsyncStorage.getItem("token");

// //     const response = await fetch(
// //       `${BASE_URL}/Student/create-request`,
// //       {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({
// //           tutor_id: selectedTutor,
// //           course_id: courseId,
// //           day: selectedDay,
// //           time: selectedTime,
// //           class_date: selectedClassDate,

// //           learning_mode: learningMode,

// //           learning_duration:
// //             learningMode === "SpecificTime"
// //               ? Number(learningDuration)
// //               : null,

// //           learning_duration_unit:
// //             learningMode === "SpecificTime"
// //               ? learningDurationUnit
// //               : null,
// //         }),
// //       }
// //     );

// //     const data = await response.json();

// //     if (response.ok) {
// //       Alert.alert(
// //         "Success",
// //         "Request sent successfully."
// //       );

// //       setRequestModal(false);

// //       setLearningMode("FullTime");

// //       setLearningDuration("");

// //       setLearningDurationUnit("Weeks");
// //     } else {
// //       Alert.alert(
// //         "Error",
// //         data.message || "Request failed."
// //       );
// //     }
// //   } catch (error) {
// //     Alert.alert("Error", error.message);
// //   }
// // };

// //   // ==========================
// //   // ONE CARD FOR EACH SLOT
// //   // ==========================
// //   const filteredTutors = tutorsData
// //     .flatMap((tutor) =>
// //       (tutor.common_slots || []).map((slot, index) => ({
// //         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

// //         tutor_id: tutor.tutor_id,
// //         tutor_name: tutor.tutor_name,
// //         location: tutor.location,
// //         distance: tutor.distance,
// //         average_rating: tutor.average_rating,
// //         total_reviews: tutor.total_reviews,

// //         day: slot.day,
// //         time: slot.time,

// //         // NEW
// //         is_available: slot.is_available,
// //         availability_message: slot.availability_message,
// //         request_type: slot.request_type,
// //         class_date: slot.class_date,
// //       }))
// //     )
// //     .filter((item) =>
// //       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
// //     );

// //   // ==========================
// //   // RENDER TUTOR
// //   // ==========================
// //   const renderTutor = ({ item }) => {
// //   const unavailable = item.is_available === false;

// //   return (
// //     <View style={styles.card}>
// //       <View style={styles.topRow}>
// //         <Text style={styles.name}>{item.tutor_name}</Text>

// //         <View style={styles.ratingBadge}>
// //           <Text style={styles.ratingText}>
// //             ⭐ {Number(item.average_rating || 0).toFixed(1)}
// //           </Text>
// //         </View>
// //       </View>

// //       <Text style={styles.info}>
// //         📍 {item.location || "Unknown Location"}
// //       </Text>

// //       <Text style={styles.info}>
// //         🚶 {Number(item.distance || 0).toFixed(2)} km away
// //       </Text>

// //       <Text style={styles.info}>
// //         📝 {item.total_reviews} Reviews
// //       </Text>

// //       {/* SLOT */}

// //       <View
// //         style={[
// //           styles.slotBox,
// //           unavailable && styles.unavailableSlotBox,
// //         ]}
// //       >
// //         <Text
// //           style={[
// //             styles.slotHeading,
// //             unavailable && styles.unavailableHeading,
// //           ]}
// //         >
// //           {unavailable ? "Unavailable Slot" : "Available Slot"}
// //         </Text>

// //         <Text style={styles.slotText}>
// //           📅 {item.day}
// //         </Text>

// //         <Text style={styles.slotText}>
// //           🕒 {item.time}
// //         </Text>

// //         {unavailable && (
// //           <>
// //             <View style={{ height: 8 }} />

// //             <Text style={styles.unavailableMessage}>
// //               {item.availability_message}
// //             </Text>

// //             <Text style={styles.requestType}>
// //               {item.request_type}
// //             </Text>
// //           </>
// //         )}
// //       </View>

// //       <TouchableOpacity
// //         disabled={unavailable}
// //         style={[
// //           styles.primaryBtn,
// //           unavailable && styles.disabledButton,
// //         ]}
// //         onPress={() => {
// //           setSelectedTutor(item.tutor_id);
// //           setSelectedDay(item.day);
// //           setSelectedTime(item.time);
// //           setRequestModal(true);
// //         }}
// //       >
// //         <Text style={styles.primaryText}>
// //           {unavailable ? "Unavailable" : "Request"}
// //         </Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-back" size={26} color={colors.primary} />
// //         </TouchableOpacity>
// //         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
// //         <View style={{ width: 26 }} />
// //       </View>

// //       {/* SEARCH */}
// //       <View style={styles.searchBar}>
// //         <Icon name="search" size={20} color="#666" />
// //         <TextInput
// //           placeholder="Search Tutor..."
// //           value={search}
// //           onChangeText={setSearch}
// //           style={styles.input}
// //         />
// //       </View>

// //       {/* LIST */}
// //       {loading ? (
// //         <ActivityIndicator size="large" color={colors.primary} />
// //       ) : (
// //         <FlatList
// //           data={filteredTutors}
// //           keyExtractor={(item) => item.id}
// //           renderItem={renderTutor}
// //           contentContainerStyle={{ paddingBottom: 100 }}
// //           showsVerticalScrollIndicator={false}
// //           ListEmptyComponent={
// //             <Text style={styles.emptyText}>No Tutor Found</Text>
// //           }
// //         />
// //       )}

// //       <Modal
// //         visible={requestModal}
// //         transparent
// //         animationType="slide"
// //       >
// //         <View style={styles.modalContainer}>
// //           <View style={styles.modalBox}>

// //             <Text style={styles.modalTitle}>
// //               Send Request
// //             </Text>

// //             <Text style={styles.label}>
// //               Learning Mode
// //             </Text>

// //             <TouchableOpacity
// //               style={[
// //                 styles.modeButton,
// //                 learningMode === "FullTime" &&
// //                   styles.selectedMode,
// //               ]}
// //               onPress={() =>
// //                 setLearningMode("FullTime")
// //               }
// //             >
// //               <Text>Full Time</Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               style={[
// //                 styles.modeButton,
// //                 learningMode === "SpecificTime" &&
// //                   styles.selectedMode,
// //               ]}
// //               onPress={() =>
// //                 setLearningMode("SpecificTime")
// //               }
// //             >
// //               <Text>Specific Time</Text>
// //             </TouchableOpacity>

// //             {learningMode === "SpecificTime" && (
// //               <>
// //                 <TextInput
// //                   placeholder="Duration"
// //                   keyboardType="numeric"
// //                   value={learningDuration}
// //                   onChangeText={setLearningDuration}
// //                   style={styles.inputBox}
// //                 />

// //                 <Picker
// //                   selectedValue={
// //                     learningDurationUnit
// //                   }
// //                   onValueChange={(v) =>
// //                     setLearningDurationUnit(v)
// //                   }
// //                 >
// //                   <Picker.Item
// //                     label="Days"
// //                     value="Days"
// //                   />
// //                   <Picker.Item
// //                     label="Weeks"
// //                     value="Weeks"
// //                   />
// //                   <Picker.Item
// //                     label="Months"
// //                     value="Months"
// //                   />
// //                 </Picker>
// //               </>
// //             )}

// //             {/* For Date  */}
// //             {/* <Text style={styles.label}>
// //                 Select Class Date
// //             </Text>

// //             <TouchableOpacity
// //                 style={styles.dateButton}
// //                 onPress={() => setShowDatePicker(true)}
// //             >
// //                 <Text>
// //                     {selectedClassDate.toDateString()}
// //                 </Text>
// //             </TouchableOpacity>

// //             {showDatePicker && (
// //                 <DateTimePicker
// //                     value={selectedClassDate}
// //                     mode="date"
// //                     display="default"
// //                     minimumDate={new Date()}
// //                     onChange={(event, date) => {
// //                         setShowDatePicker(false);

// //                         if (date) {
// //                             setSelectedClassDate(date);
// //                         }
// //                     }}
// //                 />
// //             )} */}

// //             <TouchableOpacity
// //               style={styles.primaryBtn}
// //               onPress={sendRequest}
// //             >
// //               <Text style={styles.primaryText}>
// //                 Send Request
// //               </Text>
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               style={styles.cancelBtn}
// //               onPress={() =>
// //                 setRequestModal(false)
// //               }
// //             >
// //               <Text>Cancel</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>
// //     </SafeAreaView>
// //   );
// // };

// // // Styles moved outside the component function block
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F4F6F9",
// //     padding: 16,
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginBottom: 15,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: "bold",
// //     color: colors.primary,
// //   },
// //   searchBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     paddingHorizontal: 12,
// //     marginBottom: 15,
// //     elevation: 2,
// //   },
// //   input: {
// //     flex: 1,
// //     marginLeft: 10,
// //     fontSize: 15,
// //     color: "#000",
// //   },
// //   card: {
// //     backgroundColor: "#fff",
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 15,
// //     elevation: 3,
// //   },
// //   topRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 10,
// //   },
// //   name: {
// //     flex: 1,
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: "#222",
// //     marginRight: 10,
// //   },
// //   ratingBadge: {
// //     backgroundColor: "#FFF4CC",
// //     borderRadius: 20,
// //     paddingHorizontal: 10,
// //     paddingVertical: 5,
// //   },
// //   ratingText: {
// //     color: "#B8860B",
// //     fontWeight: "bold",
// //     fontSize: 14,
// //   },
// //   info: {
// //     fontSize: 14,
// //     color: "#555",
// //     marginTop: 4,
// //   },
// //   slotBox: {
// //     backgroundColor: "#EAF7FF",
// //     borderRadius: 10,
// //     padding: 12,
// //     marginTop: 12,
// //     borderLeftWidth: 4,
// //     borderLeftColor: colors.primary,
// //   },
// //   slotHeading: {
// //     fontSize: 15,
// //     fontWeight: "700",
// //     color: colors.primary,
// //     marginBottom: 8,
// //   },
// //   slotText: {
// //     fontSize: 15,
// //     color: "#333",
// //     marginBottom: 4,
// //   },
// //   primaryBtn: {
// //     backgroundColor: colors.primary,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginTop: 15,
// //   },
// //   primaryText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// //   emptyText: {
// //     textAlign: "center",
// //     marginTop: 40,
// //     fontSize: 16,
// //     color: "#777",
// //   },
// //   unavailableSlotBox: {
// //     backgroundColor: "#FFF8E1",
// //     borderLeftColor: "#FF9800",
// //   },

// //   unavailableHeading: {
// //     color: "#E65100",
// //   },

// //   unavailableMessage: {
// //     color: "#D84315",
// //     fontWeight: "700",
// //     marginTop: 4,
// //     fontSize: 14,
// //   },

// //   requestType: {
// //     marginTop: 6,
// //     color: "#FB8C00",
// //     fontWeight: "bold",
// //     fontSize: 13,
// //   },

// //   disabledButton: {
// //     backgroundColor: "#BDBDBD",
// //   },
// //     modalContainer: {
// //     flex: 1,
// //     justifyContent: "center",
// //     backgroundColor: "rgba(0,0,0,0.4)",
// //   },

// //   modalBox: {
// //     margin: 20,
// //     backgroundColor: "#fff",
// //     borderRadius: 12,
// //     padding: 20,
// //   },

// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: "bold",
// //     marginBottom: 15,
// //   },

// //   label: {
// //     fontWeight: "bold",
// //     marginBottom: 10,
// //   },

// //   modeButton: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 12,
// //     marginBottom: 10,
// //   },

// //   selectedMode: {
// //     borderColor: colors.primary,
// //     backgroundColor: "#E3F2FD",
// //   },

// //   inputBox: {
// //     borderWidth: 1,
// //     borderColor: "#ccc",
// //     borderRadius: 8,
// //     padding: 10,
// //     marginVertical: 10,
// //   },

// //   cancelBtn: {
// //     alignItems: "center",
// //     marginTop: 12,
// //   },
// // });

// // export default StudentFindTutor;




























// // // Hide all Normal accepted classes
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TextInput,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// // } from "react-native";

// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import colors from "../utils/colors";
// // import { BASE_URL } from "../../config/api";

// // const StudentFindTutor = ({ navigation, route }) => {
// //   const { courseId, courseName, userLat, userLng } = route.params || {};

// //   const [tutorsData, setTutorsData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [search, setSearch] = useState("");

// //   useEffect(() => {
// //     fetchTutors();
// //   }, []);

// //   // ==========================
// //   // FETCH TUTORS
// //   // ==========================
// //   const fetchTutors = async () => {
// //     try {
// //       setLoading(true);

// //       if (!courseId || userLat == null || userLng == null) {
// //         Alert.alert("Error", "Missing required data");
// //         navigation.goBack();
// //         return;
// //       }

// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(
// //         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok) {
// //         setTutorsData(Array.isArray(data) ? data : []);
// //       } else {
// //         setTutorsData([]);
// //         Alert.alert("Info", data.message || "No tutors found.");
// //       }
// //     } catch (error) {
// //       console.log(error);
// //       Alert.alert("Error", "Unable to load tutors.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ==========================
// //   // SEND REQUEST
// //   // ==========================
// //   const sendRequest = async (tutorId, day, time) => {
// //     try {
// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(`${BASE_URL}/Student/create-request`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({
// //           tutor_id: tutorId,
// //           course_id: courseId,
// //           day: day,
// //           time: time,
// //         }),
// //       });

// //       const data = await response.json();

// //       if (response.ok) {
// //         Alert.alert("Success", "Request sent successfully.");
// //       } else {
// //         Alert.alert("Error", data.message || "Request failed.");
// //       }
// //     } catch (error) {
// //       Alert.alert("Error", error.message);
// //     }
// //   };

// //   // ==========================
// //   // ONE CARD FOR EACH SLOT
// //   // ==========================
// //   const filteredTutors = tutorsData
// //     .flatMap((tutor) =>
// //       (tutor.common_slots || []).map((slot, index) => ({
// //         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

// //         tutor_id: tutor.tutor_id,
// //         tutor_name: tutor.tutor_name,
// //         location: tutor.location,
// //         distance: tutor.distance,
// //         average_rating: tutor.average_rating,
// //         total_reviews: tutor.total_reviews,

// //         day: slot.day,
// //         time: slot.time,

// //         // NEW
// //         is_available: slot.is_available,
// //         availability_message: slot.availability_message,
// //         request_type: slot.request_type,
// //         class_date: slot.class_date,
// //       }))
// //     )
// //     .filter((item) =>
// //       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
// //     );

// //   // ==========================
// //   // RENDER TUTOR
// //   // ==========================
// //   const renderTutor = ({ item }) => {
// //   const unavailable = item.is_available === false;

// //   return (
// //     <View style={styles.card}>
// //       <View style={styles.topRow}>
// //         <Text style={styles.name}>{item.tutor_name}</Text>

// //         <View style={styles.ratingBadge}>
// //           <Text style={styles.ratingText}>
// //             ⭐ {Number(item.average_rating || 0).toFixed(1)}
// //           </Text>
// //         </View>
// //       </View>

// //       <Text style={styles.info}>
// //         📍 {item.location || "Unknown Location"}
// //       </Text>

// //       <Text style={styles.info}>
// //         🚶 {Number(item.distance || 0).toFixed(2)} km away
// //       </Text>

// //       <Text style={styles.info}>
// //         📝 {item.total_reviews} Reviews
// //       </Text>

// //       {/* SLOT */}

// //       <View
// //         style={[
// //           styles.slotBox,
// //           unavailable && styles.unavailableSlotBox,
// //         ]}
// //       >
// //         <Text
// //           style={[
// //             styles.slotHeading,
// //             unavailable && styles.unavailableHeading,
// //           ]}
// //         >
// //           {unavailable ? "Unavailable Slot" : "Available Slot"}
// //         </Text>

// //         <Text style={styles.slotText}>
// //           📅 {item.day}
// //         </Text>

// //         <Text style={styles.slotText}>
// //           🕒 {item.time}
// //         </Text>

// //         {unavailable && (
// //           <>
// //             <View style={{ height: 8 }} />

// //             <Text style={styles.unavailableMessage}>
// //               {item.availability_message}
// //             </Text>

// //             <Text style={styles.requestType}>
// //               {item.request_type}
// //             </Text>
// //           </>
// //         )}
// //       </View>

// //       <TouchableOpacity
// //         disabled={unavailable}
// //         style={[
// //           styles.primaryBtn,
// //           unavailable && styles.disabledButton,
// //         ]}
// //         onPress={() =>
// //           sendRequest(item.tutor_id, item.day, item.time)
// //         }
// //       >
// //         <Text style={styles.primaryText}>
// //           {unavailable ? "Unavailable" : "Request"}
// //         </Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-back" size={26} color={colors.primary} />
// //         </TouchableOpacity>
// //         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
// //         <View style={{ width: 26 }} />
// //       </View>

// //       {/* SEARCH */}
// //       <View style={styles.searchBar}>
// //         <Icon name="search" size={20} color="#666" />
// //         <TextInput
// //           placeholder="Search Tutor..."
// //           value={search}
// //           onChangeText={setSearch}
// //           style={styles.input}
// //         />
// //       </View>

// //       {/* LIST */}
// //       {loading ? (
// //         <ActivityIndicator size="large" color={colors.primary} />
// //       ) : (
// //         <FlatList
// //           data={filteredTutors}
// //           keyExtractor={(item) => item.id}
// //           renderItem={renderTutor}
// //           contentContainerStyle={{ paddingBottom: 100 }}
// //           showsVerticalScrollIndicator={false}
// //           ListEmptyComponent={
// //             <Text style={styles.emptyText}>No Tutor Found</Text>
// //           }
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // };

// // // Styles moved outside the component function block
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F4F6F9",
// //     padding: 16,
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginBottom: 15,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: "bold",
// //     color: colors.primary,
// //   },
// //   searchBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     paddingHorizontal: 12,
// //     marginBottom: 15,
// //     elevation: 2,
// //   },
// //   input: {
// //     flex: 1,
// //     marginLeft: 10,
// //     fontSize: 15,
// //     color: "#000",
// //   },
// //   card: {
// //     backgroundColor: "#fff",
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 15,
// //     elevation: 3,
// //   },
// //   topRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 10,
// //   },
// //   name: {
// //     flex: 1,
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: "#222",
// //     marginRight: 10,
// //   },
// //   ratingBadge: {
// //     backgroundColor: "#FFF4CC",
// //     borderRadius: 20,
// //     paddingHorizontal: 10,
// //     paddingVertical: 5,
// //   },
// //   ratingText: {
// //     color: "#B8860B",
// //     fontWeight: "bold",
// //     fontSize: 14,
// //   },
// //   info: {
// //     fontSize: 14,
// //     color: "#555",
// //     marginTop: 4,
// //   },
// //   slotBox: {
// //     backgroundColor: "#EAF7FF",
// //     borderRadius: 10,
// //     padding: 12,
// //     marginTop: 12,
// //     borderLeftWidth: 4,
// //     borderLeftColor: colors.primary,
// //   },
// //   slotHeading: {
// //     fontSize: 15,
// //     fontWeight: "700",
// //     color: colors.primary,
// //     marginBottom: 8,
// //   },
// //   slotText: {
// //     fontSize: 15,
// //     color: "#333",
// //     marginBottom: 4,
// //   },
// //   primaryBtn: {
// //     backgroundColor: colors.primary,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginTop: 15,
// //   },
// //   primaryText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// //   emptyText: {
// //     textAlign: "center",
// //     marginTop: 40,
// //     fontSize: 16,
// //     color: "#777",
// //   },
// //   unavailableSlotBox: {
// //     backgroundColor: "#FFF8E1",
// //     borderLeftColor: "#FF9800",
// //   },

// //   unavailableHeading: {
// //     color: "#E65100",
// //   },

// //   unavailableMessage: {
// //     color: "#D84315",
// //     fontWeight: "700",
// //     marginTop: 4,
// //     fontSize: 14,
// //   },

// //   requestType: {
// //     marginTop: 6,
// //     color: "#FB8C00",
// //     fontWeight: "bold",
// //     fontSize: 13,
// //   },

// //   disabledButton: {
// //     backgroundColor: "#BDBDBD",
// //   },
// // });

// // export default StudentFindTutor;





























// // // Hide all accepted classes
// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TextInput,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// // } from "react-native";

// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import colors from "../utils/colors";
// // import { BASE_URL } from "../../config/api";

// // const StudentFindTutor = ({ navigation, route }) => {
// //   const { courseId, courseName, userLat, userLng } = route.params || {};

// //   const [tutorsData, setTutorsData] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [search, setSearch] = useState("");

// //   useEffect(() => {
// //     fetchTutors();
// //   }, []);

// //   // ==========================
// //   // FETCH TUTORS
// //   // ==========================
// //   const fetchTutors = async () => {
// //     try {
// //       setLoading(true);

// //       if (!courseId || userLat == null || userLng == null) {
// //         Alert.alert("Error", "Missing required data");
// //         navigation.goBack();
// //         return;
// //       }

// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(
// //         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
// //         {
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok) {
// //         setTutorsData(Array.isArray(data) ? data : []);
// //       } else {
// //         setTutorsData([]);
// //         Alert.alert("Info", data.message || "No tutors found.");
// //       }
// //     } catch (error) {
// //       console.log(error);
// //       Alert.alert("Error", "Unable to load tutors.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // ==========================
// //   // SEND REQUEST
// //   // ==========================
// //   const sendRequest = async (tutorId, day, time) => {
// //     try {
// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(`${BASE_URL}/Student/create-request`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify({
// //           tutor_id: tutorId,
// //           course_id: courseId,
// //           day: day,
// //           time: time,
// //         }),
// //       });

// //       const data = await response.json();

// //       if (response.ok) {
// //         Alert.alert("Success", "Request sent successfully.");
// //       } else {
// //         Alert.alert("Error", data.message || "Request failed.");
// //       }
// //     } catch (error) {
// //       Alert.alert("Error", error.message);
// //     }
// //   };

// //   // ==========================
// //   // ONE CARD FOR EACH SLOT
// //   // ==========================
// //   const filteredTutors = tutorsData
// //     .flatMap((tutor) =>
// //       (tutor.common_slots || []).map((slot, index) => ({
// //         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,
// //         tutor_id: tutor.tutor_id,
// //         tutor_name: tutor.tutor_name,
// //         location: tutor.location,
// //         distance: tutor.distance,
// //         average_rating: tutor.average_rating,
// //         total_reviews: tutor.total_reviews,
// //         day: slot.day,
// //         time: slot.time,
// //       }))
// //     )
// //     .filter((item) =>
// //       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
// //     );

// //   // ==========================
// //   // RENDER TUTOR
// //   // ==========================
// //   const renderTutor = ({ item }) => (
// //     <View style={styles.card}>
// //       <View style={styles.topRow}>
// //         <Text style={styles.name}>{item.tutor_name}</Text>
// //         <View style={styles.ratingBadge}>
// //           <Text style={styles.ratingText}>
// //             ⭐ {Number(item.average_rating || 0).toFixed(1)}
// //           </Text>
// //         </View>
// //       </View>

// //       <Text style={styles.info}>📍 {item.location || "Unknown Location"}</Text>
// //       <Text style={styles.info}>
// //         🚶 {Number(item.distance || 0).toFixed(2)} km away
// //       </Text>
// //       <Text style={styles.info}>📝 {item.total_reviews} Reviews</Text>

// //       {/* SLOT */}
// //       <View style={styles.slotBox}>
// //         <Text style={styles.slotHeading}>Available Slot</Text>
// //         <Text style={styles.slotText}>📅 {item.day}</Text>
// //         <Text style={styles.slotText}>🕒 {item.time}</Text>
// //       </View>

// //       <TouchableOpacity
// //         style={styles.primaryBtn}
// //         onPress={() => sendRequest(item.tutor_id, item.day, item.time)}
// //       >
// //         <Text style={styles.primaryText}>Request</Text>
// //       </TouchableOpacity>
// //     </View>
// //   );

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       {/* HEADER */}
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.goBack()}>
// //           <Icon name="arrow-back" size={26} color={colors.primary} />
// //         </TouchableOpacity>
// //         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
// //         <View style={{ width: 26 }} />
// //       </View>

// //       {/* SEARCH */}
// //       <View style={styles.searchBar}>
// //         <Icon name="search" size={20} color="#666" />
// //         <TextInput
// //           placeholder="Search Tutor..."
// //           value={search}
// //           onChangeText={setSearch}
// //           style={styles.input}
// //         />
// //       </View>

// //       {/* LIST */}
// //       {loading ? (
// //         <ActivityIndicator size="large" color={colors.primary} />
// //       ) : (
// //         <FlatList
// //           data={filteredTutors}
// //           keyExtractor={(item) => item.id}
// //           renderItem={renderTutor}
// //           contentContainerStyle={{ paddingBottom: 100 }}
// //           showsVerticalScrollIndicator={false}
// //           ListEmptyComponent={
// //             <Text style={styles.emptyText}>No Tutor Found</Text>
// //           }
// //         />
// //       )}
// //     </SafeAreaView>
// //   );
// // };

// // // Styles moved outside the component function block
// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F4F6F9",
// //     padding: 16,
// //   },
// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     marginBottom: 15,
// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: "bold",
// //     color: colors.primary,
// //   },
// //   searchBar: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     paddingHorizontal: 12,
// //     marginBottom: 15,
// //     elevation: 2,
// //   },
// //   input: {
// //     flex: 1,
// //     marginLeft: 10,
// //     fontSize: 15,
// //     color: "#000",
// //   },
// //   card: {
// //     backgroundColor: "#fff",
// //     borderRadius: 12,
// //     padding: 16,
// //     marginBottom: 15,
// //     elevation: 3,
// //   },
// //   topRow: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     marginBottom: 10,
// //   },
// //   name: {
// //     flex: 1,
// //     fontSize: 18,
// //     fontWeight: "700",
// //     color: "#222",
// //     marginRight: 10,
// //   },
// //   ratingBadge: {
// //     backgroundColor: "#FFF4CC",
// //     borderRadius: 20,
// //     paddingHorizontal: 10,
// //     paddingVertical: 5,
// //   },
// //   ratingText: {
// //     color: "#B8860B",
// //     fontWeight: "bold",
// //     fontSize: 14,
// //   },
// //   info: {
// //     fontSize: 14,
// //     color: "#555",
// //     marginTop: 4,
// //   },
// //   slotBox: {
// //     backgroundColor: "#EAF7FF",
// //     borderRadius: 10,
// //     padding: 12,
// //     marginTop: 12,
// //     borderLeftWidth: 4,
// //     borderLeftColor: colors.primary,
// //   },
// //   slotHeading: {
// //     fontSize: 15,
// //     fontWeight: "700",
// //     color: colors.primary,
// //     marginBottom: 8,
// //   },
// //   slotText: {
// //     fontSize: 15,
// //     color: "#333",
// //     marginBottom: 4,
// //   },
// //   primaryBtn: {
// //     backgroundColor: colors.primary,
// //     paddingVertical: 12,
// //     borderRadius: 8,
// //     alignItems: "center",
// //     marginTop: 15,
// //   },
// //   primaryText: {
// //     color: "#fff",
// //     fontWeight: "bold",
// //     fontSize: 16,
// //   },
// //   emptyText: {
// //     textAlign: "center",
// //     marginTop: 40,
// //     fontSize: 16,
// //     color: "#777",
// //   },
// // });

// // export default StudentFindTutor;






































// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TextInput,
// //   FlatList,
// //   TouchableOpacity,
// //   ActivityIndicator,
// //   Alert,
// //   Platform,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import colors from "../utils/colors";
// // import { BASE_URL } from "../../config/api";

// // const StudentFindTutor = ({ navigation, route }) => {

// //   const {courseId,courseName, userLat,userLng,} = route.params || {};

// //   const [tutorsData, setTutorsData] =
// //     useState([]);

// //   const [loading, setLoading] =
// //     useState(true);

// //   const [search, setSearch] =
// //     useState("");



// // useEffect(() => {
// //     fetchTutors();
// // }, []);

// //   // FETCH TUTORS
// //   const fetchTutors = async () => {

// //     try {

// //       setLoading(true);

// //       if (
// //           !courseId ||
// //           userLat == null ||
// //           userLng == null
// //       ) {
// //           Alert.alert("Error", "Missing required data");
// //           navigation.goBack();
// //           return;
// //       }
// //       // const url =
// //       //   // `${BASE_URL}/Student/search-by-time-location?day=${formattedDay}&time=${formattedTime}&userLat=${userLat}&userLng=${userLng}&courseId=${course_id}`;
// //       //   `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`
// //         const token = await AsyncStorage.getItem("token");

// //         const response = await fetch(
// //         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
// //         {
// //             headers:{
// //                 Authorization:`Bearer ${token}`
// //             }
// //         });

// //       const data =
// //         await response.json();

// //       if (response.ok) {

// //         setTutorsData(
// //           Array.isArray(data)
// //             ? data
// //             : []
// //         );

// //       } else {

// //         setTutorsData([]);

// //         Alert.alert(
// //           "Info",
// //           data.message ||
// //             "No tutors found"
// //         );
// //       }

// //     } catch (error) {

// //       console.log(
// //         "Fetch Error:",
// //         error
// //       );

// //       Alert.alert(
// //         "Error",
// //         error.message
// //       );

// //     } finally {

// //       setLoading(false);
// //     }
// //   };

// //   // SEND REQUEST
// // const sendRequest = async (
// //   tutorId,
// //   day,
// //   time
// // ) => {

// //     try {

// //       const token =
// //         await AsyncStorage.getItem(
// //           "token"
// //         );

// //       if (!token) {

// //         Alert.alert(
// //           "Error",
// //           "User not logged in"
// //         );

// //         return;
// //       }

// //       const response = await fetch(
// //         `${BASE_URL}/Student/create-request`,
// //         {
// //           method: "POST",

// //           headers: {
// //             "Content-Type":
// //               "application/json",

// //             Authorization:
// //               `Bearer ${token}`,
// //           },

// //           body: JSON.stringify({

// //             tutor_id: tutorId,

// //             course_id: course_id,

// //             day: day,

// //             time: time,

// //             class_date:
// //               formatDate(
// //                 selectedDate
// //               ),
// //           }),
// //         }
// //       );

// //       const data =
// //         await response.json();

// //       if (response.ok) {

// //         Alert.alert(
// //           "Success",
// //           "Request sent successfully"
// //         );

// //       } else {

// //         Alert.alert(
// //           "Error",
// //           data.message ||
// //             "Request failed"
// //         );
// //       }

// //     } catch (error) {

// //       console.log(
// //         "Request Error:",
// //         error
// //       );

// //       Alert.alert(
// //         "Error",
// //         error.message
// //       );
// //     }
// //   };

// //   // FILTER SEARCH
// //  const filteredTutors = tutorsData
// //   .flatMap((tutor) =>
// //     (tutor.common_slots || []).map((slot) => ({
// //       tutor_id: tutor.tutor_id,
// //       tutor_name: tutor.tutor_name,
// //       location: tutor.location,
// //       distance: tutor.distance,
// //       average_rating: tutor.average_rating,
// //       total_reviews: tutor.total_reviews,
// //       day: slot.day,
// //       time: slot.time,
// //     }))
// //   )
// //   .filter((item) =>
// //     item.tutor_name
// //       ?.toLowerCase()
// //       .includes(search.toLowerCase())
// //   );

// // const renderTutor = ({ item }) => (
// //   <View style={styles.card}>

// //     <View style={styles.topRow}>
// //       <Text style={styles.name}>
// //         {item.tutor_name}
// //       </Text>

// //       <View style={styles.ratingBadge}>
// //         <Text style={styles.ratingText}>
// //           ⭐ {Number(item.average_rating || 0).toFixed(1)}
// //         </Text>
// //       </View>
// //     </View>

// //     {/* <Text style={styles.info}>
// //       📍 {item.location || "Unknown location"}
// //     </Text> */}

// //     <Text style={styles.info}>
// //       🚶 {Number(item.distance || 0).toFixed(2)} km away
// //     </Text>

// //     <Text style={styles.info}>
// //       📝 {item.total_reviews} Reviews
// //     </Text>

// //     <View style={styles.slotBox}>
// //       <Text style={styles.slotTitle}>
// //         Available Slot
// //       </Text>

// //       <Text style={styles.slotText}>
// //         📅 {item.day}
// //       </Text>

// //       <Text style={styles.slotText}>
// //         🕒 {item.time}
// //       </Text>
// //     </View>

// //     <TouchableOpacity
// //       style={styles.primaryBtn}
// //       onPress={() =>
// //         sendRequest(
// //           item.tutor_id,
// //           item.day,
// //           item.time
// //         )
// //       }
// //     >
// //       <Text style={styles.primaryText}>
// //         Request
// //       </Text>
// //     </TouchableOpacity>

// //   </View>
// // );

// //   return (

// //     <SafeAreaView
// //       style={styles.container}
// //     >

// //       {/* HEADER */}
// //       <View style={styles.header}>

// //         <TouchableOpacity
// //           onPress={() =>
// //             navigation.goBack()
// //           }
// //         >

// //           <Icon
// //             name="arrow-back"
// //             size={26}
// //             color={colors.primary}
// //           />

// //         </TouchableOpacity>

// //         <Text style={styles.title}>
// //           Find Tutor
// //         </Text>

// //         <View
// //           style={{ width: 26 }}
// //         />

// //       </View>

// //       {/* SEARCH */}
// //       <View
// //         style={styles.searchBar}
// //       >

// //         <Icon
// //           name="search"
// //           size={20}
// //           color="#666"
// //         />

// //         <TextInput
// //           placeholder="Search tutor..."
// //           style={styles.input}
// //           value={search}
// //           onChangeText={
// //             setSearch
// //           }
// //         />

// //       </View>

// //       {/* LIST */}
// //       {loading ? (

// //         <ActivityIndicator
// //           size="large"
// //           color={colors.primary}
// //         />

// //       ) : (

// //         <FlatList
// //           data={filteredTutors}
// //           keyExtractor={(item) =>
// //             item.tutor_id.toString()
// //           }
// //           renderItem={renderTutor}
// //           contentContainerStyle={{
// //             paddingBottom: 100,
// //           }}
// //           ListEmptyComponent={

// //             <Text
// //               style={
// //                 styles.emptyText
// //               }
// //             >
// //               No tutor found in
// //               your area
// //             </Text>
// //           }
// //         />
// //       )}

// //     </SafeAreaView>
// //   );
// // };

// // export default StudentFindTutor;

// // const styles = StyleSheet.create({

// //   container: {
// //     flex: 1,
// //     padding: 16,
// //     backgroundColor:
// //       "#F4F6F9",
// //   },

// //   header: {
// //     flexDirection: "row",
// //     justifyContent:
// //       "space-between",
// //     alignItems: "center",
// //   },

// //   title: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     color: colors.primary,
// //   },

// //   selectedBox: {
// //     backgroundColor:
// //       "#caf8dd",
// //     padding: 10,
// //     borderRadius: 8,
// //     marginVertical: 10,
// //   },

// //   selectedText: {
// //     color: colors.primary,
// //     fontWeight: "600",
// //   },

// //   // DATE BOX
// //   dateBox: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     backgroundColor: "#fff",
// //     padding: 12,
// //     borderRadius: 8,
// //     marginBottom: 12,
// //     elevation: 2,
// //   },

// //   dateText: {
// //     marginLeft: 10,
// //     fontSize: 15,
// //     fontWeight: "600",
// //     color: "#000",
// //   },

// //   searchBar: {
// //     flexDirection: "row",
// //     backgroundColor: "#fff",
// //     padding: 10,
// //     borderRadius: 8,
// //     marginBottom: 10,
// //     alignItems: "center",
// //   },

// //   input: {
// //     marginLeft: 10,
// //     flex: 1,
// //   },

// //   card: {
// //     backgroundColor: "#fff",
// //     padding: 15,
// //     marginBottom: 10,
// //     borderRadius: 10,
// //     elevation: 2,
// //   },

// //   name: {
// //     fontWeight: "bold",
// //     marginBottom: 5,
// //     fontSize: 16,
// //     color: "#000",
// //   },

// //   info: {
// //     color: "#666",
// //     marginTop: 2,
// //   },

// //   primaryBtn: {
// //     backgroundColor:
// //       colors.primary,
// //     padding: 10,
// //     borderRadius: 6,
// //     marginTop: 10,
// //     alignItems: "center",
// //   },

// //   primaryText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //   },

// //   emptyText: {
// //     textAlign: "center",
// //     marginTop: 20,
// //     color: "#999",
// //   },
// //   topRow: {
// //   flexDirection: "row",
// //   justifyContent: "space-between",
// //   alignItems: "center",
// //   marginBottom: 8,
// // },

// // ratingBadge: {
// //   backgroundColor: "#FFF4CC",
// //   paddingHorizontal: 10,
// //   paddingVertical: 4,
// //   borderRadius: 20,
// // },

// // ratingText: {
// //   color: "#B8860B",
// //   fontWeight: "bold",
// //   fontSize: 14,
// // },
// // slotBox: {
// //   backgroundColor: "#EEF8FF",
// //   padding: 10,
// //   borderRadius: 8,
// //   marginTop: 10,
// // },

// // slotTitle: {
// //   fontWeight: "bold",
// //   color: colors.primary,
// //   marginBottom: 5,
// //   fontSize: 15,
// // },

// // slotText: {
// //   fontSize: 14,
// //   color: "#333",
// //   marginTop: 3,
// // },
// // });
