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
  Platform,
  RefreshControl,
  StatusBar,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const PRIMARY_COLOR = colors.primary || "#2563EB";

const TodayClasses = ({ navigation }) => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Re-Schedule / Pre-Schedule States
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

  // FETCH ALL CLASSES
  const fetchClasses = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Student/today-classes`, {
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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  // GET AVAILABLE TUTOR SLOTS
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

  // CREATE RE-SCHEDULE / PRE-SCHEDULE
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

  // HELPER: STATUS BADGE STYLING
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return { bg: "#DCFCE7", text: "#15803D", border: "#BBF7D0" };
      case "pending":
        return { bg: "#FEF9C3", text: "#A16207", border: "#FEF08A" };
      case "rejected":
        return { bg: "#FEE2E2", text: "#B91C1C", border: "#FECACA" };
      default:
        return { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
    }
  };

  // SLOT ITEM
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
        <Icon name="access-time" size={20} color={PRIMARY_COLOR} />
      </View>
      <View style={styles.slotTextContainer}>
        <Text style={styles.slotDay}>{item.day}</Text>
        <Text style={styles.slotText}>{item.time}</Text>
      </View>
      <Icon name="chevron-right" size={20} color="#94A3B8" />
    </TouchableOpacity>
  );

  // CLASS CARD
  const renderItem = ({ item }) => {
    const statusStyle = getStatusBadgeStyle(item.status);

    return (
      <View style={styles.card}>
        {/* Top Section: Course Title & Status Pill */}
        <View style={styles.cardHeader}>
          <Text style={styles.subject} numberOfLines={1}>
            {item.course_name || "Course"}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusStyle.bg,
                borderColor: statusStyle.border,
              },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status || "Normal"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Icon name="person-outline" size={16} color="#64748B" />
            <Text style={styles.infoText}>
              Tutor: <Text style={styles.infoValue}>{item.tutor_name || "N/A"}</Text>
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="event" size={16} color="#64748B" />
            <Text style={styles.infoText}>
              {item.class_date || "N/A"}{" "}
              <Text style={styles.dayText}>({item.day || "N/A"})</Text>
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="schedule" size={16} color={PRIMARY_COLOR} />
            <Text style={styles.timeValue}>{item.time || "Time not set"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="category" size={16} color="#64748B" />
            <Text style={styles.infoText}>
              Type: <Text style={styles.infoValue}>{item.request_type || "Normal"}</Text>
            </Text>
          </View>
        </View>

        {/* Action Buttons for Accepted Classes */}
        {item.status === "Accepted" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              onPress={() => getAvailableSlots(item.request_id, "Reschedule")}
            >
              <Icon name="event-repeat" size={15} color={PRIMARY_COLOR} />
              <Text style={styles.secondaryText}>Re-Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.7}
              onPress={() => getAvailableSlots(item.request_id, "Preschedule")}
            >
              <Icon name="update" size={15} color={PRIMARY_COLOR} />
              <Text style={styles.secondaryText}>Pre-Schedule</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios-new" size={18} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={styles.placeholderWidth} />
      </View>

      {/* Screen Sub-header */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Today's Classes</Text>
        <Text style={styles.subtitle}>
          Manage and schedule your active tuition sessions
        </Text>
      </View>

      {/* Content Stream */}
      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : (
        <FlatList
          data={classesData}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY_COLOR]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <Icon name="event-available" size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
              <Text style={styles.emptySubtitle}>
                You have no active class requests for today.
              </Text>
            </View>
          }
        />
      )}

      {/* Bottom Sheet Slot Modal */}
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
              <Text style={styles.modalTitle}>
                {actionType === "Reschedule"
                  ? "Re-Schedule Class"
                  : "Pre-Schedule Class"}
              </Text>
              <Text style={styles.modalSubtitle}>
                Select an available slot provided by your tutor
              </Text>
            </View>

            <FlatList
              data={availableSlots}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSlot}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}
              ListEmptyComponent={
                <View style={styles.emptyModalBox}>
                  <Text style={styles.emptyText}>
                    No open slots available for this tutor right now.
                  </Text>
                </View>
              }
            />

            {/* Date Picker */}
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
    </SafeAreaView>
  );
};

export default TodayClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImg: {
    width: 26,
    height: 26,
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  placeholderWidth: {
    width: 38,
  },

  // TITLE BAR
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  // LIST & LOADER
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
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

  // EMPTY STATE
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },

  // CARD DESIGN
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
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
  },
  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 10,
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
    marginVertical: 12,
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 8,
  },
  infoValue: {
    color: "#0F172A",
    fontWeight: "600",
  },
  dayText: {
    color: "#64748B",
    fontWeight: "400",
  },
  timeValue: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    marginLeft: 8,
  },

  // ACTION BUTTONS
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F8FAFC",
    gap: 8,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  secondaryText: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },

  // MODAL BOTTOM SHEET
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  slotIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  slotTextContainer: {
    flex: 1,
  },
  slotDay: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  slotText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  emptyModalBox: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
  closeBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 14,
    marginTop: 12,
  },
  closeBtnText: {
    color: "#475569",
    fontWeight: "700",
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

// const TodayClasses = ({ navigation }) => {
//   const [classesData, setClassesData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ===========================
//   // Re-Schedule / Pre-Schedule
//   // ===========================
//   const [slotModalVisible, setSlotModalVisible] = useState(false);
//   const [availableSlots, setAvailableSlots] = useState([]);
//   const [selectedRequestId, setSelectedRequestId] = useState(null);
//   const [actionType, setActionType] = useState("");

//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedSlot, setSelectedSlot] = useState(null);

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   // =========================================
//   // FETCH ALL CLASSES
//   // =========================================
//   const fetchClasses = async () => {
//     try {
//       setLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const response = await fetch(
//         `${BASE_URL}/Student/today-classes`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const json = await response.json();

//       console.log("Student Classes:", json);

//       if (json.success) {
//         setClassesData(json.data || []);
//       } else {
//         setClassesData([]);
//         Alert.alert(
//           "Error",
//           json.message || "Failed to fetch classes"
//         );
//       }
//     } catch (error) {
//       console.log("Fetch Classes Error:", error);
//       Alert.alert("Error", "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================================
//   // GET AVAILABLE TUTOR SLOTS
//   // =========================================
//   const getAvailableSlots = async (
//     requestId,
//     type
//   ) => {
//     try {
//       setSelectedRequestId(requestId);
//       setActionType(type);

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/available-slots/${requestId}`,
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
//         setAvailableSlots(
//           Array.isArray(data) ? data : []
//         );

//         setSlotModalVisible(true);
//       } else {
//         Alert.alert(
//           "Error",
//           "Failed to fetch available slots"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//     // =========================================
//   // CREATE RE-SCHEDULE / PRE-SCHEDULE
//   // =========================================
//   const selectSlot = async (
//     slot,
//     pickedDate
//   ) => {
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

//       console.log(
//         "REQUEST BODY:",
//         JSON.stringify(body)
//       );

//       const response = await fetch(
//         `${BASE_URL}/Student/${endpoint}`,
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

//         fetchClasses();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message || "Operation failed"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // SLOT ITEM
//   // =========================================
//   const renderSlot = ({ item }) => (
//     <TouchableOpacity
//       style={styles.slotCard}
//       onPress={() => {
//         setSelectedSlot(item);
//         setShowDatePicker(true);
//       }}
//     >
//       <Text style={styles.slotDay}>
//         {item.day}
//       </Text>

//       <Text style={styles.slotText}>
//         {item.time}
//       </Text>
//     </TouchableOpacity>
//   );

//   // =========================================
//   // CLASS CARD
//   // =========================================
//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.leftBorder} />

//       <View style={styles.cardContent}>
//         <View style={{ flex: 1 }}>

//           <Text style={styles.subject}>
//             {item.course_name || "Course"}
//           </Text>

//           <Text style={styles.info}>
//             Tutor: {item.tutor_name || "N/A"}
//           </Text>

//           <Text style={styles.info}>
//             📅 {item.class_date || "N/A"} (
//             {item.day || "N/A"})
//           </Text>

//           <Text style={styles.time}>
//             🕒 {item.time || "Time not set"}
//           </Text>

//           <Text style={styles.info}>
//             Type: {item.request_type || "Normal"}
//           </Text>

//           {/* ONLY ACCEPTED CLASSES */}
//           {item.status === "Accepted" && (
//             <View style={styles.actionRow}>

//               <TouchableOpacity
//                 style={styles.secondaryBtn}
//                 onPress={() =>
//                   getAvailableSlots(
//                     item.request_id,
//                     "Reschedule"
//                   )
//                 }
//               >
//                 <Text style={styles.secondaryText}>
//                   Re-Schedule
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.secondaryBtn}
//                 onPress={() =>
//                   getAvailableSlots(
//                     item.request_id,
//                     "Preschedule"
//                   )
//                 }
//               >
//                 <Text style={styles.secondaryText}>
//                   Pre-Schedule
//                 </Text>
//               </TouchableOpacity>

//             </View>
//           )}

//         </View>

//         <View style={styles.statusButton}>
//           <Text style={styles.statusText}>
//             {item.status}
//           </Text>
//         </View>
//       </View>
//     </View>
//   );

//     return (
//     <SafeAreaView style={styles.container}>

//       {/* Header */}
//       <View style={styles.header}>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.goBack()
//           }
//         >
//           <Icon
//             name="arrow-back"
//             size={28}
//             color="#000"
//           />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImg}
//           />

//           <Text style={styles.logoText}>
//             House of Tutor
//           </Text>
//         </View>

//         <View style={{ width: 28 }} />

//       </View>

//       {/* Title */}
//       <Text style={styles.title}>
//         Your Classes
//       </Text>

//       {/* Loader */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator
//             size="large"
//             color={colors.primary}
//           />
//         </View>
//       ) : (
//         <FlatList
//           data={classesData}
//           keyExtractor={(item) =>
//             item.request_id.toString()
//           }
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{
//             paddingBottom: 120,
//           }}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               No classes found
//             </Text>
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
//                 ? "Re-Schedule - Select Slot"
//                 : "Pre-Schedule - Select Slot"}
//             </Text>

//             <FlatList
//               data={availableSlots}
//               keyExtractor={(item, index) =>
//                 index.toString()
//               }
//               renderItem={renderSlot}
//               ListEmptyComponent={
//                 <Text style={styles.emptyText}>
//                   No slots available
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

//                     selectSlot(
//                       selectedSlot,
//                       date
//                     );
//                   }
//                 }}
//               />
//             )}

//             <TouchableOpacity
//               style={styles.closeBtn}
//               onPress={() =>
//                 setSlotModalVisible(false)
//               }
//             >
//               <Text
//                 style={{
//                   color: "#fff",
//                   fontWeight: "600",
//                 }}
//               >
//                 Close
//               </Text>
//             </TouchableOpacity>

//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default TodayClasses;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 35,
//     marginBottom: 10,
//   },

//   headerCenter: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   logoImg: {
//     width: 30,
//     height: 30,
//     marginRight: 6,
//   },

//   logoText: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: colors.primary,
//   },

//   title: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: colors.primary,
//     marginVertical: 10,
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 30,
//     fontSize: 16,
//     color: "#777",
//   },

//   card: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     borderRadius: 14,
//     marginBottom: 14,
//     elevation: 3,
//   },

//   leftBorder: {
//     width: 5,
//     backgroundColor: "#F5A623",
//     borderTopLeftRadius: 14,
//     borderBottomLeftRadius: 14,
//   },

//   cardContent: {
//     flex: 1,
//     padding: 14,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },

//   subject: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#222",
//   },

//   info: {
//     fontSize: 13,
//     color: "#666",
//     marginTop: 4,
//   },

//   time: {
//     fontSize: 13,
//     color: "#2F80ED",
//     marginTop: 4,
//     fontWeight: "600",
//   },

//   statusButton: {
//     backgroundColor: colors.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginLeft: 10,
//   },

//   statusText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   actionRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 10,
//   },

//   secondaryBtn: {
//     borderWidth: 1,
//     borderColor: colors.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 8,
//     marginTop: 5,
//   },

//   secondaryText: {
//     color: colors.primary,
//     fontSize: 12,
//     fontWeight: "600",
//   },

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