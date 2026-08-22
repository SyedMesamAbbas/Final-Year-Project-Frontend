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

const TutorAllClasses = ({ navigation }) => {
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionType, setActionType] = useState(""); // "Reschedule" or "Preschedule"

  // DATE PICKER STATES
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchAllClasses();
  }, []);

  // =========================================
  // FETCH ALL CLASSES
  // =========================================
  const fetchAllClasses = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Authentication Error", "User session not found. Please log in again.");
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/all-classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setClassData(result.data || []);
      } else {
        Alert.alert("Error", result.message || "Failed to load scheduled classes.");
        setClassData([]);
      }
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Network Error", error.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // HELD — marks class as Complete
  // =========================================
  const heldClass = async (requestId) => {
    try {
      setProcessingId(requestId);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/complete-class/${requestId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok && data.success) {
        Alert.alert("Success", data.message || "Class marked as completed.");
        fetchAllClasses();
      } else {
        Alert.alert("Error", data.message || "Failed to mark class as completed.");
      }
    } catch (error) {
      console.log("Held Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================
  // CANCEL — marks class as Cancelled
  // =========================================
  const cancelClass = async (requestId) => {
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this class session?",
      [
        { text: "Keep Session", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(requestId);
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert("Error", "User not logged in");
                return;
              }

              const response = await fetch(`${BASE_URL}/Tutor/cancel-class/${requestId}`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const text = await response.text();
              let data = {};
              try {
                data = text ? JSON.parse(text) : {};
              } catch {}

              if (response.ok && data.success) {
                Alert.alert("Cancelled", data.message || "Class has been cancelled.");
                fetchAllClasses();
              } else {
                Alert.alert("Error", data.message || "Failed to cancel class.");
              }
            } catch (error) {
              console.log("Cancel Error:", error);
              Alert.alert("Error", error.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // =========================================
  // INITIAL PROCESS FOR RE/PRE-SCHEDULE
  // =========================================
  const handleScheduleProcess = async (requestId, type) => {
    try {
      setProcessingId(requestId);
      const token = await AsyncStorage.getItem("token");
      
      const endpoint = type === "Reschedule" ? "reschedule" : "preschedule";

      const response = await fetch(`${BASE_URL}/Tutor/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: requestId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.autoScheduled) {
          Alert.alert("Success", result.message || "Class automatically updated!");
          fetchAllClasses();
        } else if (result.manualRequired) {
          Alert.alert("Notice", result.message);
          setSelectedRequestId(requestId);
          setActionType(type);
          await loadManualSlots(requestId, token);
        }
      } else {
        Alert.alert("Error", result.message || "Operation failed");
      }
    } catch (error) {
      console.log("Schedule Process Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================
  // GET MANUAL SLOTS (Fallback Mode)
  // =========================================
  const loadManualSlots = async (requestId, token) => {
    try {
      const response = await fetch(`${BASE_URL}/Tutor/available-reschedule-slots/${requestId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setAvailableSlots(Array.isArray(data) ? data : []);
        setSlotModalVisible(true);
      } else {
        Alert.alert("Error", "Failed to fetch alternative available slots");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  // =========================================
  // SUBMIT MANUAL SCHEDULE SELECTION
  // =========================================
  const selectSlot = async (slot, pickedDate) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const formattedDate = pickedDate.toISOString();

      const body = {
        requestId: selectedRequestId,
        day: slot.day,
        time: slot.time,
        classDate: formattedDate,
        requestType: actionType,
      };

      const response = await fetch(`${BASE_URL}/Tutor/manual-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert("Success", result.message || "Schedule request sent to student successfully.");
        setSlotModalVisible(false);
        fetchAllClasses();
      } else {
        Alert.alert("Error", result.message || "Failed to book manual selection slot.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  // =========================================
  // RENDER HELPER: BADGE COLOR
  // =========================================
  const getBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "reschedule":
        return { bg: "#FFF7ED", border: "#FFEDD5", text: "#C2410C" };
      case "preschedule":
        return { bg: "#F0FDF4", border: "#DCFCE7", text: "#15803D" };
      default:
        return { bg: "#EFF6FF", border: "#DBEAFE", text: "#1D4ED8" };
    }
  };

  // =========================================
  // RENDER SLOT ITEM
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
      <View style={styles.slotHeaderRow}>
        <View style={styles.slotBadge}>
          <Icon name="event" size={14} color={colors.primary || "#2563EB"} />
          <Text style={styles.slotDayText}>{item.day}</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#94A3B8" />
      </View>
      <View style={styles.slotTimeRow}>
        <Icon name="schedule" size={16} color="#64748B" style={{ marginRight: 6 }} />
        <Text style={styles.slotTimeText}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  // =========================================
  // RENDER CLASS CARD
  // =========================================
  const renderItem = ({ item }) => {
    const badge = getBadgeStyle(item.request_type);
    const isItemProcessing = processingId === item.request_id;

    return (
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.courseContainer}>
            <Text style={styles.courseTitle} numberOfLines={1}>
              {item.course_name || "General Subject"}
            </Text>
            <View style={styles.studentRow}>
              <Icon name="person-outline" size={15} color="#64748B" />
              <Text style={styles.studentName}>{item.student_name || "Student"}</Text>
            </View>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
            <Text style={[styles.typeBadgeText, { color: badge.text }]}>
              {item.request_type || "Normal"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details Grid */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Icon name="event" size={16} color="#64748B" />
            <Text style={styles.metaText}>{item.class_date || "N/A"}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="calendar-today" size={16} color="#64748B" />
            <Text style={styles.metaText}>{item.day || "N/A"}</Text>
          </View>
          <View style={styles.metaItemFull}>
            <Icon name="access-time" size={16} color={colors.primary || "#2563EB"} />
            <Text style={styles.timeHighlightText}>{item.time || "N/A"}</Text>
          </View>
        </View>

        {/* Action Button Row */}
        <View style={styles.actionContainer}>
          {isItemProcessing ? (
            <View style={styles.processingBox}>
              <ActivityIndicator size="small" color={colors.primary || "#2563EB"} />
              <Text style={styles.processingText}>Updating class...</Text>
            </View>
          ) : (
            <>
              <View style={styles.primaryActionRow}>
                <TouchableOpacity
                  style={styles.heldBtn}
                  activeOpacity={0.8}
                  onPress={() => heldClass(item.request_id)}
                >
                  <Icon name="check-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.heldText}>Mark Complete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.8}
                  onPress={() => cancelClass(item.request_id)}
                >
                  <Icon name="close" size={16} color="#EF4444" style={{ marginRight: 2 }} />
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.secondaryActionRow}>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.7}
                  onPress={() => handleScheduleProcess(item.request_id, "Reschedule")}
                >
                  <Icon name="update" size={15} color={colors.primary || "#2563EB"} style={{ marginRight: 4 }} />
                  <Text style={styles.secondaryText}>Reschedule</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.7}
                  onPress={() => handleScheduleProcess(item.request_id, "Preschedule")}
                >
                  <Icon name="fast-forward" size={15} color={colors.primary || "#2563EB"} style={{ marginRight: 4 }} />
                  <Text style={styles.secondaryText}>Preschedule</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={20} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={require("../../../assets/images/logo.png")} style={styles.logoImage} />
          <Text style={styles.headerTitle}>House of Tutor</Text>
        </View>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={fetchAllClasses}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="refresh" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* CONTENT LIST */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#2563EB"} />
          <Text style={styles.loadingText}>Fetching your schedule...</Text>
        </View>
      ) : (
        <FlatList
          data={classData}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Icon name="event-busy" size={36} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
              <Text style={styles.emptyText}>
                You currently have no active or requested classes on your schedule.
              </Text>
            </View>
          }
        />
      )}

      {/* SLOT SELECTION MODAL */}
      <Modal visible={slotModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Available Slot</Text>
            <Text style={styles.modalSubtitle}>
              {actionType === "Reschedule"
                ? "Choose a manual fallback slot to request a reschedule."
                : "Choose a manual fallback slot to request a preschedule."}
            </Text>

            <FlatList
              data={availableSlots}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSlot}
              contentContainerStyle={{ paddingVertical: 12 }}
              ListEmptyComponent={
                <View style={styles.emptyContainerModal}>
                  <Text style={styles.emptyText}>No alternative slots available.</Text>
                </View>
              }
            />

            {/* DATE PICKER */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
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
              <Text style={styles.closeBtnText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TutorAllClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#2563EB",
    letterSpacing: -0.3,
  },
  listPadding: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  // CARD DESIGN
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  courseContainer: {
    flex: 1,
    marginRight: 8,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentName: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginLeft: 4,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },

  // METADATA GRID
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
    columnGap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  metaItemFull: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  metaText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 6,
    fontWeight: "500",
  },
  timeHighlightText: {
    fontSize: 12,
    color: colors.primary || "#2563EB",
    marginLeft: 6,
    fontWeight: "700",
  },

  // ACTION BUTTONS
  actionContainer: {
    marginTop: 4,
  },
  primaryActionRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  secondaryActionRow: {
    flexDirection: "row",
    gap: 8,
  },
  heldBtn: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: colors.primary || "#2563EB",
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  heldText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 10,
    borderRadius: 10,
    justifycontent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.primary || "#2563EB",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: {
    color: colors.primary || "#2563EB",
    fontSize: 12,
    fontWeight: "600",
  },
  processingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  processingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },

  // EMPTY STATES
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  emptyContainerModal: {
    paddingVertical: 24,
    alignItems: "center",
  },

  // MODAL BOTTOM SHEET
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#CBD5E1",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },
  slotCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  slotHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  slotBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  slotDayText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary || "#2563EB",
    marginLeft: 6,
  },
  slotTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  slotTimeText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
  },
  closeBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 8,
  },
  closeBtnText: {
    color: "#334155",
    fontWeight: "600",
    fontSize: 14,
  },
});




























// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   Modal,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import DateTimePicker from "@react-native-community/datetimepicker";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const TutorAllClasses = ({ navigation }) => {
//   const [classData, setClassData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [slotModalVisible, setSlotModalVisible] = useState(false);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedRequestId, setSelectedRequestId] = useState(null);
//   const [actionType, setActionType] = useState(""); // "Reschedule" or "Preschedule"

//   // =========================================
//   // DATE PICKER STATES
//   // =========================================
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);

//   useEffect(() => {
//     fetchAllClasses();
//   }, []);

//   // =========================================
//   // FETCH ALL CLASSES
//   // =========================================
//   const fetchAllClasses = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const response = await fetch(`${BASE_URL}/Tutor/all-classes`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         setClassData(result.data || []);
//       } else {
//         Alert.alert("Error", result.message || "Failed to load classes");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.log("Fetch Error:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================================
//   // HELD — marks class as Complete
//   // =========================================
//   const heldClass = async (requestId) => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const response = await fetch(`${BASE_URL}/Tutor/complete-class/${requestId}`, {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await response.text();
//       let data = {};
//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {}

//       if (response.ok && data.success) {
//         Alert.alert("Success", data.message || "Class marked as held");
//         fetchAllClasses();
//       } else {
//         Alert.alert("Error", data.message || "Failed to mark class as held");
//       }
//     } catch (error) {
//       console.log("Held Error:", error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // CANCEL — marks class as Cancelled
//   // =========================================
//   const cancelClass = async (requestId) => {
//     Alert.alert("Confirm Cancel", "Are you sure you want to cancel this class?", [
//       { text: "No", style: "cancel" },
//       {
//         text: "Yes, Cancel",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             const token = await AsyncStorage.getItem("token");
//             if (!token) {
//               Alert.alert("Error", "User not logged in");
//               return;
//             }

//             const response = await fetch(`${BASE_URL}/Tutor/cancel-class/${requestId}`, {
//               method: "PUT",
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             });

//             const text = await response.text();
//             let data = {};
//             try {
//               data = text ? JSON.parse(text) : {};
//             } catch {}

//             if (response.ok && data.success) {
//               Alert.alert("Success", data.message || "Class cancelled");
//               fetchAllClasses();
//             } else {
//               Alert.alert("Error", data.message || "Failed to cancel class");
//             }
//           } catch (error) {
//             console.log("Cancel Error:", error);
//             Alert.alert("Error", error.message);
//           }
//         },
//       },
//     ]);
//   };

//   // =========================================
//   // INITIAL PROCESS FOR RE/PRE-SCHEDULE
//   // =========================================
//   const handleScheduleProcess = async (requestId, type) => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("token");
      
//       // Determine endpoint matching back-end routes: "reschedule" or "preschedule"
//       const endpoint = type === "Reschedule" ? "reschedule" : "preschedule";

//       const response = await fetch(`${BASE_URL}/Tutor/${endpoint}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ requestId: requestId }),
//       });

//       const result = await response.json();
//       console.log("AUTO SCHEDULE RESPONSE:", result);

//       if (response.ok && result.success) {
//         if (result.autoScheduled) {
//           // Case 1: Common slot found and updated on the spot
//           Alert.alert("Success", result.message || "Class automatically updated!");
//           setLoading(false);
//           fetchAllClasses();
//         } else if (result.manualRequired) {
//           // Case 2: No free common slot found, load fallback manual modal options
//           Alert.alert("Notice", result.message);
//           setSelectedRequestId(requestId);
//           setActionType(type);
//           await loadManualSlots(requestId, token);
//         }
//       } else {
//         setLoading(false);
//         Alert.alert("Error", result.message || "Operation failed");
//       }
//     } catch (error) {
//       setLoading(false);
//       console.log("Schedule Process Error:", error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // GET MANUAL SLOTS (Fallback Mode)
//   // =========================================
//   const loadManualSlots = async (requestId, token) => {
//     try {
//       const response = await fetch(`${BASE_URL}/Tutor/available-reschedule-slots/${requestId}`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await response.text();
//       let data = [];
//       try {
//         data = text ? JSON.parse(text) : [];
//       } catch {}

//       if (response.ok) {
//         setAvailableSlots(Array.isArray(data) ? data : []);
//         setSlotModalVisible(true);
//       } else {
//         Alert.alert("Error", "Failed to fetch alternative available slots");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================================
//   // SUBMIT MANUAL SCHEDULE SELECTION
//   // =========================================
//   const selectSlot = async (slot, pickedDate) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       // Format ISO Date safely for .NET backend API processing
//       const formattedDate = pickedDate.toISOString();

//       const body = {
//         requestId: selectedRequestId,
//         day: slot.day,
//         time: slot.time,
//         classDate: formattedDate,
//         requestType: actionType, // Matches "Reschedule" or "Preschedule"
//       };

//       console.log("MANUAL SCHEDULE BODY:", JSON.stringify(body));

//       const response = await fetch(`${BASE_URL}/Tutor/manual-schedule`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       const result = await response.json();
//       console.log("MANUAL REQUEST RESPONSE:", result);

//       if (response.ok && result.success) {
//         Alert.alert("Success", result.message || "Schedule request sent to student successfully.");
//         setSlotModalVisible(false);
//         fetchAllClasses();
//       } else {
//         Alert.alert("Error", result.message || "Failed to book manual selection slot.");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // RENDER SLOT ITEM
//   // =========================================
//   const renderSlot = ({ item }) => (
//     <TouchableOpacity
//       style={styles.slotCard}
//       onPress={() => {
//         setSelectedSlot(item);
//         setShowDatePicker(true);
//       }}
//     >
//       <Text style={styles.slotDay}>{item.day}</Text>
//       <Text style={styles.slotText}>{item.time}</Text>
//     </TouchableOpacity>
//   );

//   // =========================================
//   // RENDER CLASS CARD
//   // =========================================
//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.time}>⏰ {item.time || "N/A"}</Text>
//       <Text style={styles.text}>👤 Student: {item.student_name}</Text>
//       <Text style={styles.text}>📘 Course: {item.course_name}</Text>
//       <Text style={styles.text}>📅 Date: {item.class_date || "N/A"}</Text>
//       <Text style={styles.text}>🗓️ Day: {item.day || "N/A"}</Text>
//       <Text style={styles.text}>📌 Type: {item.request_type || "Normal"}</Text>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.heldBtn} onPress={() => heldClass(item.request_id)}>
//           <Text style={styles.heldText}>Held</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           onPress={() => handleScheduleProcess(item.request_id, "Reschedule")}
//         >
//           <Text style={styles.secondaryText}>Re-Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           onPress={() => handleScheduleProcess(item.request_id, "Preschedule")}
//         >
//           <Text style={styles.secondaryText}>Pre-Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelClass(item.request_id)}>
//           <Text style={styles.cancelText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image source={require("../../../assets/images/logo.png")} style={styles.logoImage} />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={{ width: 26 }} />
//       </View>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
//       ) : (
//         <FlatList
//           data={classData}
//           keyExtractor={(item) => item.request_id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 80 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={<Text style={styles.emptyText}>No classes found</Text>}
//         />
//       )}

//       {/* SLOT MODAL */}
//       <Modal visible={slotModalVisible} transparent animationType="slide">
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalTitle}>
//               {actionType === "Reschedule"
//                 ? "Re-Schedule — Pick Manual Slot"
//                 : "Pre-Schedule — Pick Manual Slot"}
//             </Text>

//             <FlatList
//               data={availableSlots}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={renderSlot}
//               ListEmptyComponent={<Text style={styles.emptyText}>No available slots found</Text>}
//             />

//             {/* DATE PICKER */}
//             {showDatePicker && (
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="date"
//                 display="calendar"
//                 minimumDate={new Date()}
//                 onChange={(event, date) => {
//                   setShowDatePicker(false);
//                   if (date && selectedSlot) {
//                     setSelectedDate(date);
//                     selectSlot(selectedSlot, date);
//                   }
//                 }}
//               />
//             )}

//             {/* CLOSE */}
//             <TouchableOpacity style={styles.closeBtn} onPress={() => setSlotModalVisible(false)}>
//               <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default TutorAllClasses;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F4F6F9" },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },
//   headerCenter: { alignItems: "center" },
//   logoImage: { width: 28, height: 28, resizeMode: "contain" },
//   logoText: { fontSize: 14, fontWeight: "600", color: colors.primary },
//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 14,
//     elevation: 3,
//   },
//   time: { fontSize: 13, fontWeight: "600", color: colors.primary, marginBottom: 6 },
//   text: { fontSize: 13, color: "#444", marginBottom: 2 },
//   emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
//   buttonRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
//   heldBtn: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginTop: 6 },
//   heldText: { color: "#fff", fontSize: 12, fontWeight: "600" },
//   secondaryBtn: { borderWidth: 1, borderColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginTop: 6 },
//   secondaryText: { color: colors.primary, fontSize: 12 },
//   cancelBtn: { borderWidth: 1, borderColor: "#e74c3c", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginTop: 6 },
//   cancelText: { color: "#e74c3c", fontSize: 12 },
//   modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
//   modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" },
//   modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: colors.primary },
//   slotCard: { borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 14, marginBottom: 10 },
//   slotDay: { fontSize: 14, fontWeight: "700", color: colors.primary },
//   slotText: { fontSize: 13, color: "#444", marginTop: 2 },
//   closeBtn: { backgroundColor: colors.primary, paddingVertical: 12, alignItems: "center", borderRadius: 12, marginTop: 12 },
// });






















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   Modal,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import DateTimePicker from "@react-native-community/datetimepicker";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const TutorAllClasses = ({ navigation }) => {

//   const [classData, setClassData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [slotModalVisible, setSlotModalVisible] = useState(false);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedRequestId, setSelectedRequestId] = useState(null);
//   const [actionType, setActionType] = useState("");

//   // =========================================
//   // DATE PICKER STATES
//   // =========================================
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);

//   useEffect(() => {
//     fetchAllClasses();
//   }, []);

//   // =========================================
//   // FETCH ALL CLASSES
//   // =========================================
//   // const fetchAllClasses = async () => {
//   //   try {

//   //     const token = await AsyncStorage.getItem("token");

//   //     if (!token) {
//   //       Alert.alert("Error", "User not logged in");
//   //       return;
//   //     }

//   //     const response = await fetch(
//   //       `${BASE_URL}/Tutor/all-classes`,
//   //       {
//   //         method: "GET",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     const text = await response.text();

//   //     console.log("ALL CLASSES RESPONSE:", text);

//   //     let data = [];

//   //     try {
//   //       data = text ? JSON.parse(text) : [];
//   //     } catch {}

//   //     if (response.ok) {
//   //       setClassData(Array.isArray(data) ? data : []);
//   //     } else {
//   //       Alert.alert("Error", "Failed to load classes");
//   //     }

//   //   } catch (error) {

//   //     console.log("Fetch Error:", error);
//   //     Alert.alert("Error", error.message);

//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const fetchAllClasses = async () => {
//   try {
//     setLoading(true);

//     const token = await AsyncStorage.getItem("token");

//     if (!token) {
//       Alert.alert("Error", "User not logged in");
//       return;
//     }

//     const response = await fetch(
//       `${BASE_URL}/Tutor/all-classes`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const result = await response.json();

//     console.log("ALL CLASSES RESPONSE:", result);

//     if (response.ok && result.success) {
//       setClassData(result.data || []);
//     } else {
//       Alert.alert(
//         "Error",
//         result.message || "Failed to load classes"
//       );
//       setClassData([]);
//     }
//   } catch (error) {
//     console.log("Fetch Error:", error);
//     Alert.alert("Error", error.message);
//   } finally {
//     setLoading(false);
//   }
// };


//   // =========================================
//   // HELD — marks class as Complete
//   // =========================================
//   const heldClass = async (requestId) => {
//     try {

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const response = await fetch(
//         `${BASE_URL}/Tutor/complete-class/${requestId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text = await response.text();

//       let data = {};

//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {}

//       if (response.ok && data.success) {
//         Alert.alert("Success", data.message || "Class marked as held");
//         fetchAllClasses();
//       } else {
//         Alert.alert("Error", data.message || "Failed to mark class as held");
//       }

//     } catch (error) {

//       console.log("Held Error:", error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // CANCEL — marks class as Cancelled
//   // =========================================
//   const cancelClass = async (requestId) => {

//     Alert.alert(
//       "Confirm Cancel",
//       "Are you sure you want to cancel this class?",
//       [
//         { text: "No", style: "cancel" },
//         {
//           text: "Yes, Cancel",
//           style: "destructive",
//           onPress: async () => {
//             try {

//               const token = await AsyncStorage.getItem("token");

//               if (!token) {
//                 Alert.alert("Error", "User not logged in");
//                 return;
//               }

//               const response = await fetch(
//                 `${BASE_URL}/Tutor/cancel-class/${requestId}`,
//                 {
//                   method: "PUT",
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                   },
//                 }
//               );

//               const text = await response.text();

//               let data = {};

//               try {
//                 data = text ? JSON.parse(text) : {};
//               } catch {}

//               if (response.ok && data.success) {
//                 Alert.alert("Success", data.message || "Class cancelled");
//                 fetchAllClasses();
//               } else {
//                 Alert.alert("Error", data.message || "Failed to cancel class");
//               }

//             } catch (error) {

//               console.log("Cancel Error:", error);
//               Alert.alert("Error", error.message);
//             }
//           },
//         },
//       ]
//     );
//   };

//   // =========================================
//   // GET AVAILABLE SLOTS (for Re/Pre-Schedule)
//   // =========================================
//   const getAvailableSlots = async (requestId, type) => {
//     try {

//       setSelectedRequestId(requestId);
//       setActionType(type);

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/available-reschedule-slots/${requestId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text = await response.text();

//       console.log("AVAILABLE SLOTS:", text);

//       let data = [];

//       try {
//         data = text ? JSON.parse(text) : [];
//       } catch {}

//       if (response.ok) {
//         setAvailableSlots(Array.isArray(data) ? data : []);
//         setSlotModalVisible(true);
//       } else {
//         Alert.alert("Error", "Failed to fetch slots");
//       }

//     } catch (error) {

//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // SELECT SLOT → create Re/Pre-Schedule
//   // =========================================
//   const selectSlot = async (slot, pickedDate) => {
//     try {

//       const token = await AsyncStorage.getItem("token");

//       const endpoint =
//         actionType === "Reschedule"
//           ? "create-reschedule"
//           : "create-preschedule";

//       const body = {
//         parentRequestId: selectedRequestId,
//         newClassDate: pickedDate,
//         day: slot.day,
//         time: slot.time,
//       };

//       console.log("BODY:", JSON.stringify(body));

//       const response = await fetch(
//         `${BASE_URL}/Tutor/${endpoint}`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(body),
//         }
//       );

//       const text = await response.text();

//       console.log("REQUEST RESPONSE:", text);

//       let data = {};

//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {}

//       if (response.ok) {

//         Alert.alert(
//           "Success",
//           actionType === "Reschedule"
//             ? "Re-Schedule request sent successfully"
//             : "Pre-Schedule request sent successfully"
//         );

//         setSlotModalVisible(false);
//         fetchAllClasses();

//       } else {
//         Alert.alert("Error", data.message || "Operation failed");
//       }

//     } catch (error) {

//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // RENDER SLOT ITEM
//   // =========================================
//   const renderSlot = ({ item }) => (
//     <TouchableOpacity
//       style={styles.slotCard}
//       onPress={() => {
//         setSelectedSlot(item);
//         setShowDatePicker(true);
//       }}
//     >
//       <Text style={styles.slotDay}>{item.day}</Text>
//       <Text style={styles.slotText}>{item.time}</Text>
//     </TouchableOpacity>
//   );

//   // =========================================
//   // RENDER CLASS CARD
//   // =========================================
//   // const renderItem = ({ item }) => (
//   //   <View style={styles.card}>

//   //     <Text style={styles.time}>
//   //       {item.time || "N/A"}
//   //     </Text>

//   //     <Text style={styles.text}>
//   //       👤 {item.student_name}
//   //     </Text>

//   //     <Text style={styles.text}>
//   //       📘 {item.course_name}
//   //     </Text>

//   //     <View style={styles.buttonRow}>

//   //       {/* ---- HELD ---- */}
//   //       <TouchableOpacity
//   //         style={styles.heldBtn}
//   //         onPress={() => heldClass(item.request_id)}
//   //       >
//   //         <Text style={styles.heldText}>Held</Text>
//   //       </TouchableOpacity>

//   //       {/* ---- RE-SCHEDULE ---- */}
//   //       <TouchableOpacity
//   //         style={styles.secondaryBtn}
//   //         onPress={() =>
//   //           getAvailableSlots(item.request_id, "Reschedule")
//   //         }
//   //       >
//   //         <Text style={styles.secondaryText}>Re-Schedule</Text>
//   //       </TouchableOpacity>

//   //       {/* ---- PRE-SCHEDULE ---- */}
//   //       <TouchableOpacity
//   //         style={styles.secondaryBtn}
//   //         onPress={() =>
//   //           getAvailableSlots(item.request_id, "Preschedule")
//   //         }
//   //       >
//   //         <Text style={styles.secondaryText}>Pre-Schedule</Text>
//   //       </TouchableOpacity>

//   //       {/* ---- CANCEL ---- */}
//   //       <TouchableOpacity
//   //         style={styles.cancelBtn}
//   //         onPress={() => cancelClass(item.request_id)}
//   //       >
//   //         <Text style={styles.cancelText}>Cancel</Text>
//   //       </TouchableOpacity>

//   //     </View>
//   //   </View>
//   // );

//   const renderItem = ({ item }) => (
//   <View style={styles.card}>
//     <Text style={styles.time}>
//       ⏰ {item.time || "N/A"}
//     </Text>

//     <Text style={styles.text}>
//       👤 Student: {item.student_name}
//     </Text>

//     <Text style={styles.text}>
//       📘 Course: {item.course_name}
//     </Text>

//     <Text style={styles.text}>
//       📅 Date: {item.class_date || "N/A"}
//     </Text>

//     <Text style={styles.text}>
//       🗓️ Day: {item.day || "N/A"}
//     </Text>

//     <Text style={styles.text}>
//       📌 Type: {item.request_type || "Normal"}
//     </Text>

//     <View style={styles.buttonRow}>
//       <TouchableOpacity
//         style={styles.heldBtn}
//         onPress={() => heldClass(item.request_id)}
//       >
//         <Text style={styles.heldText}>Held</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.secondaryBtn}
//         onPress={() =>
//           getAvailableSlots(item.request_id, "Reschedule")
//         }
//       >
//         <Text style={styles.secondaryText}>
//           Re-Schedule
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.secondaryBtn}
//         onPress={() =>
//           getAvailableSlots(item.request_id, "Preschedule")
//         }
//       >
//         <Text style={styles.secondaryText}>
//           Pre-Schedule
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.cancelBtn}
//         onPress={() => cancelClass(item.request_id)}
//       >
//         <Text style={styles.cancelText}>Cancel</Text>
//       </TouchableOpacity>
//     </View>
//   </View>
// );

//   // =========================================
//   // RENDER
//   // =========================================
//   return (
//     <SafeAreaView style={styles.container}>

//       {/* HEADER */}
//       <View style={styles.header}>

//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color="#000" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={{ width: 26 }} />
//       </View>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} />
//       ) : (
//         <FlatList
//           data={classData}
//           keyExtractor={(item) => item.request_id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 80 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No classes found</Text>
//           }
//         />
//       )}

//       {/* SLOT MODAL */}
//       <Modal
//         visible={slotModalVisible}
//         transparent
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>

//             <Text style={styles.modalTitle}>
//               {actionType === "Reschedule"
//                 ? "Re-Schedule — Pick a Slot"
//                 : "Pre-Schedule — Pick a Slot"}
//             </Text>

//             <FlatList
//               data={availableSlots}
//               keyExtractor={(item, index) => index.toString()}
//               renderItem={renderSlot}
//               ListEmptyComponent={
//                 <Text style={styles.emptyText}>
//                   No available slots found
//                 </Text>
//               }
//             />

//             {/* DATE PICKER */}
//             {showDatePicker && (
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="date"
//                 display="calendar"
//                 minimumDate={new Date()}
//                 onChange={(event, date) => {
//                   setShowDatePicker(false);
//                   if (date && selectedSlot) {
//                     setSelectedDate(date);
//                     selectSlot(selectedSlot, date);
//                   }
//                 }}
//               />
//             )}

//             {/* CLOSE */}
//             <TouchableOpacity
//               style={styles.closeBtn}
//               onPress={() => setSlotModalVisible(false)}
//             >
//               <Text style={{ color: "#fff", fontWeight: "600" }}>
//                 Close
//               </Text>
//             </TouchableOpacity>

//           </View>
//         </View>
//       </Modal>

//     </SafeAreaView>
//   );
// };

// export default TutorAllClasses;

// // ==============================================
// // STYLES
// // ==============================================
// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   // ---- Header ----
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },

//   headerCenter: {
//     alignItems: "center",
//   },

//   logoImage: {
//     width: 28,
//     height: 28,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   // ---- Card ----
//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 14,
//     elevation: 3,
//   },

//   time: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: colors.primary,
//     marginBottom: 6,
//   },

//   text: {
//     fontSize: 13,
//     color: "#444",
//     marginBottom: 2,
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#999",
//   },

//   // ---- Button row ----
//   buttonRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 10,
//   },

//   // Held = teal/primary fill
//   heldBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 6,
//     marginTop: 6,
//   },

//   heldText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   // Re/Pre-Schedule = outlined primary
//   secondaryBtn: {
//     borderWidth: 1,
//     borderColor: colors.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 6,
//     marginTop: 6,
//   },

//   secondaryText: {
//     color: colors.primary,
//     fontSize: 12,
//   },

//   // Cancel = outlined red
//   cancelBtn: {
//     borderWidth: 1,
//     borderColor: "#e74c3c",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 6,
//     marginTop: 6,
//   },

//   cancelText: {
//     color: "#e74c3c",
//     fontSize: 12,
//   },

//   // ---- Modal ----
//   modalContainer: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },

//   modalContent: {
//     backgroundColor: "#fff",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     maxHeight: "70%",
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 16,
//     color: colors.primary,
//   },

//   slotCard: {
//     borderWidth: 1,
//     borderColor: colors.primary,
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 10,
//   },

//   slotDay: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: colors.primary,
//   },

//   slotText: {
//     fontSize: 13,
//     color: "#444",
//     marginTop: 2,
//   },

//   closeBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     alignItems: "center",
//     borderRadius: 12,
//     marginTop: 12,
//   },
// });
