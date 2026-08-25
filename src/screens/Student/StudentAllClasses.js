import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  StatusBar,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentAllClasses = ({ navigation }) => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===========================
  // Re-Schedule / Pre-Schedule
  // ===========================
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionType, setActionType] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  // =========================================
  // FETCH ALL CLASSES (UNTOUCHED LOGIC)
  // =========================================
  const fetchClasses = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Student/all-classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      console.log("Student Classes:", json);

      if (json.success) {
        setClassesData(json.data || []);
      } else {
        setClassesData([]);
        Alert.alert("Error", json.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.log("Fetch Classes Error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GET AVAILABLE TUTOR SLOTS
  // =========================================
  const getAvailableSlots = async (requestId, type) => {
    try {
      setSelectedRequestId(requestId);
      setActionType(type);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/available-slots/${requestId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      console.log("AVAILABLE SLOTS:", text);

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setAvailableSlots(Array.isArray(data) ? data : []);
        setSlotModalVisible(true);
      } else {
        Alert.alert("Error", "Failed to fetch available slots");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  // =========================================
  // CREATE RE-SCHEDULE / PRE-SCHEDULE
  // =========================================
  const selectSlot = async (slot, pickedDate) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const endpoint =
        actionType === "Reschedule"
          ? "create-reschedule"
          : "create-preschedule";

      const body = {
        parentRequestId: selectedRequestId,
        newClassDate: pickedDate,
        day: slot.day,
        time: slot.time,
      };

      console.log("REQUEST BODY:", JSON.stringify(body));

      const response = await fetch(`${BASE_URL}/Student/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const text = await response.text();

      console.log("REQUEST RESPONSE:", text);

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok) {
        Alert.alert(
          "Success",
          actionType === "Reschedule"
            ? "Re-Schedule request sent successfully"
            : "Pre-Schedule request sent successfully"
        );

        setSlotModalVisible(false);
        fetchClasses();
      } else {
        Alert.alert("Error", data.message || "Operation failed");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  // Helper for status colors
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
      case "pending":
        return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
      case "rejected":
      case "cancelled":
        return { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
    }
  };

  // =========================================
  // SLOT ITEM
  // =========================================
  const renderSlot = ({ item }) => (
    <TouchableOpacity
      style={styles.slotCard}
      activeOpacity={0.7}
      onPress={() => {
        setSelectedSlot(item);
        setShowDatePicker(true);
      }}
    >
      <View style={styles.slotIconBox}>
        <Icon name="event-available" size={20} color={colors.primary || "#4F46E5"} />
      </View>

      <View style={styles.slotDetails}>
        <Text style={styles.slotDay}>{item.day}</Text>
        <Text style={styles.slotTime}>{item.time}</Text>
      </View>

      <View style={styles.slotSelectBtn}>
        <Text style={styles.slotSelectText}>Select</Text>
        <Icon name="chevron-right" size={16} color={colors.primary || "#4F46E5"} />
      </View>
    </TouchableOpacity>
  );

  // =========================================
  // CLASS CARD
  // =========================================
  const renderItem = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectContainer}>
            <View style={styles.subjectIconBox}>
              <Icon name="school" size={20} color={colors.primary || "#4F46E5"} />
            </View>
            <View style={styles.headerTitleArea}>
              <Text style={styles.subject} numberOfLines={1}>
                {item.course_name || "Course"}
              </Text>
              <Text style={styles.requestTypeBadge}>
                {item.request_type || "Normal"} Class
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Icon name="person" size={16} color="#64748B" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Tutor:</Text>
            <Text style={styles.infoValue}>{item.tutor_name || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              name="calendar-today"
              size={15}
              color="#64748B"
              style={styles.infoIcon}
            />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>
              {item.class_date || "N/A"} ({item.day || "N/A"})
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="access-time" size={16} color="#64748B" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={[styles.infoValue, styles.timeHighlight]}>
              {item.time || "Time not set"}
            </Text>
          </View>

          {/* ONLY ACCEPTED CLASSES */}
          {item.status === "Accepted" && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={() =>
                  getAvailableSlots(item.request_id, "Reschedule")
                }
              >
                <Icon name="edit-calendar" size={16} color={colors.primary || "#4F46E5"} />
                <Text style={styles.actionButtonText}>Re-Schedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                activeOpacity={0.8}
                onPress={() =>
                  getAvailableSlots(item.request_id, "Preschedule")
                }
              >
                <Icon name="update" size={16} color="#0EA5E9" />
                <Text style={[styles.actionButtonText, styles.actionTextSecondary]}>
                  Pre-Schedule
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentDrawer")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImg}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT AREA */}
      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Your Classes</Text>
          <Text style={styles.subtitle}>
            Manage and view your upcoming tutoring sessions
          </Text>
        </View>

        {/* LOADER */}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
            <Text style={styles.loadingText}>Fetching your schedule...</Text>
          </View>
        ) : (
          <FlatList
            data={classesData}
            keyExtractor={(item) => item.request_id.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="event-busy" size={36} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No Classes Found</Text>
                <Text style={styles.emptySubtitle}>
                  You don't have any scheduled sessions at the moment.
                </Text>
              </View>
            }
          />
        )}
      </View>

      {/* SLOT MODAL */}
      <Modal
        visible={slotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSlotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {actionType === "Reschedule"
                    ? "Re-Schedule Class"
                    : "Pre-Schedule Class"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  Choose an available time slot from your tutor
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseIcon}
                onPress={() => setSlotModalVisible(false)}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableSlots}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSlot}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 12 }}
              ListEmptyComponent={
                <View style={styles.modalEmptyState}>
                  <Icon name="schedule" size={32} color="#94A3B8" />
                  <Text style={styles.modalEmptyText}>
                    No open slots currently available for this tutor.
                  </Text>
                </View>
              }
            />

            {/* DATE PICKER */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="calendar"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);

                  if (date && selectedSlot) {
                    setSelectedDate(date);
                    selectSlot(selectedSlot, date);
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              activeOpacity={0.8}
              onPress={() => setSlotModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentHome")}
        >
          <Icon name="calendar-today" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentAddCourses")}
        >
          <Icon name="library-add" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Add Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentCourses")}
        >
          <Icon name="menu-book" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.activeNavIndicator}>
            <Icon
              name="school"
              size={22}
              color={colors.primary || "#4F46E5"}
            />
            <Text style={styles.navTextActive}>Classes</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentAllClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =========================================
  // HEADER STYLES
  // =========================================

  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImg: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginRight: 8,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.3,
  },

  // =========================================
  // CONTENT AREA
  // =========================================

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  pageHeader: {
    marginTop: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  listContainer: {
    paddingBottom: 100,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // =========================================
  // CLASS CARDS
  // =========================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingBottom: 12,
  },

  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  subjectIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTitleArea: {
    flex: 1,
  },

  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  requestTypeBadge: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 1,
  },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
  },

  cardBody: {
    padding: 16,
    paddingTop: 12,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  infoIcon: {
    marginRight: 8,
    width: 18,
  },

  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginRight: 6,
  },

  infoValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
  },

  timeHighlight: {
    color: "#0284C7",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },

  actionButtonSecondary: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },

  actionButtonText: {
    color: colors.primary || "#4F46E5",
    fontSize: 12,
    fontWeight: "700",
  },

  actionTextSecondary: {
    color: "#0284C7",
  },

  // =========================================
  // EMPTY STATE
  // =========================================

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  // =========================================
  // MODAL STYLES
  // =========================================

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "75%",
  },

  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 16,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  modalCloseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  slotIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  slotDetails: {
    flex: 1,
  },

  slotDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  slotTime: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  slotSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  slotSelectText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    marginRight: 2,
  },

  modalEmptyState: {
    alignItems: "center",
    paddingVertical: 30,
  },

  modalEmptyText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },

  closeBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 8,
  },

  closeBtnText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 14,
  },

  // =========================================
  // BOTTOM NAVIGATION
  // =========================================

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavIndicator: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 3,
  },

  navTextActive: {
    fontSize: 11,
    color: colors.primary || "#4F46E5",
    fontWeight: "700",
    marginTop: 3,
  },
});
