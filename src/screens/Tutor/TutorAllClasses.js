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
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TutorAllClasses = ({ navigation }) => {
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionType, setActionType] = useState(""); // "Reschedule" or "Preschedule"

  // =========================================
  // DATE PICKER STATES
  // =========================================
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
        Alert.alert("Error", "User not logged in");
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
        Alert.alert("Error", result.message || "Failed to load classes");
        setClassData([]);
      }
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // HELD — marks class as Complete
  // =========================================
  const heldClass = async (requestId) => {
    try {
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
        Alert.alert("Success", data.message || "Class marked as held");
        fetchAllClasses();
      } else {
        Alert.alert("Error", data.message || "Failed to mark class as held");
      }
    } catch (error) {
      console.log("Held Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  // =========================================
  // CANCEL — marks class as Cancelled
  // =========================================
  const cancelClass = async (requestId) => {
    Alert.alert("Confirm Cancel", "Are you sure you want to cancel this class?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
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
              Alert.alert("Success", data.message || "Class cancelled");
              fetchAllClasses();
            } else {
              Alert.alert("Error", data.message || "Failed to cancel class");
            }
          } catch (error) {
            console.log("Cancel Error:", error);
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  // =========================================
  // INITIAL PROCESS FOR RE/PRE-SCHEDULE
  // =========================================
  const handleScheduleProcess = async (requestId, type) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      
      // Determine endpoint matching back-end routes: "reschedule" or "preschedule"
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
      console.log("AUTO SCHEDULE RESPONSE:", result);

      if (response.ok && result.success) {
        if (result.autoScheduled) {
          // Case 1: Common slot found and updated on the spot
          Alert.alert("Success", result.message || "Class automatically updated!");
          setLoading(false);
          fetchAllClasses();
        } else if (result.manualRequired) {
          // Case 2: No free common slot found, load fallback manual modal options
          Alert.alert("Notice", result.message);
          setSelectedRequestId(requestId);
          setActionType(type);
          await loadManualSlots(requestId, token);
        }
      } else {
        setLoading(false);
        Alert.alert("Error", result.message || "Operation failed");
      }
    } catch (error) {
      setLoading(false);
      console.log("Schedule Process Error:", error);
      Alert.alert("Error", error.message);
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
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // SUBMIT MANUAL SCHEDULE SELECTION
  // =========================================
  const selectSlot = async (slot, pickedDate) => {
    try {
      const token = await AsyncStorage.getItem("token");

      // Format ISO Date safely for .NET backend API processing
      const formattedDate = pickedDate.toISOString();

      const body = {
        requestId: selectedRequestId,
        day: slot.day,
        time: slot.time,
        classDate: formattedDate,
        requestType: actionType, // Matches "Reschedule" or "Preschedule"
      };

      console.log("MANUAL SCHEDULE BODY:", JSON.stringify(body));

      const response = await fetch(`${BASE_URL}/Tutor/manual-schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log("MANUAL REQUEST RESPONSE:", result);

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
  // RENDER SLOT ITEM
  // =========================================
  const renderSlot = ({ item }) => (
    <TouchableOpacity
      style={styles.slotCard}
      onPress={() => {
        setSelectedSlot(item);
        setShowDatePicker(true);
      }}
    >
      <Text style={styles.slotDay}>{item.day}</Text>
      <Text style={styles.slotText}>{item.time}</Text>
    </TouchableOpacity>
  );

  // =========================================
  // RENDER CLASS CARD
  // =========================================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.time}>⏰ {item.time || "N/A"}</Text>
      <Text style={styles.text}>👤 Student: {item.student_name}</Text>
      <Text style={styles.text}>📘 Course: {item.course_name}</Text>
      <Text style={styles.text}>📅 Date: {item.class_date || "N/A"}</Text>
      <Text style={styles.text}>🗓️ Day: {item.day || "N/A"}</Text>
      <Text style={styles.text}>📌 Type: {item.request_type || "Normal"}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.heldBtn} onPress={() => heldClass(item.request_id)}>
          <Text style={styles.heldText}>Held</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => handleScheduleProcess(item.request_id, "Reschedule")}
        >
          <Text style={styles.secondaryText}>Re-Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => handleScheduleProcess(item.request_id, "Preschedule")}
        >
          <Text style={styles.secondaryText}>Pre-Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => cancelClass(item.request_id)}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image source={require("../../../assets/images/logo.png")} style={styles.logoImage} />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={classData}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No classes found</Text>}
        />
      )}

      {/* SLOT MODAL */}
      <Modal visible={slotModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === "Reschedule"
                ? "Re-Schedule — Pick Manual Slot"
                : "Pre-Schedule — Pick Manual Slot"}
            </Text>

            <FlatList
              data={availableSlots}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderSlot}
              ListEmptyComponent={<Text style={styles.emptyText}>No available slots found</Text>}
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

            {/* CLOSE */}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSlotModalVisible(false)}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TutorAllClasses;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerCenter: { alignItems: "center" },
  logoImage: { width: 28, height: 28, resizeMode: "contain" },
  logoText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
  },
  time: { fontSize: 13, fontWeight: "600", color: colors.primary, marginBottom: 6 },
  text: { fontSize: 13, color: "#444", marginBottom: 2 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  heldBtn: { backgroundColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginTop: 6 },
  heldText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  secondaryBtn: { borderWidth: 1, borderColor: colors.primary, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginTop: 6 },
  secondaryText: { color: colors.primary, fontSize: 12 },
  cancelBtn: { borderWidth: 1, borderColor: "#e74c3c", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 6, marginTop: 6 },
  cancelText: { color: "#e74c3c", fontSize: 12 },
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "70%" },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: colors.primary },
  slotCard: { borderWidth: 1, borderColor: colors.primary, borderRadius: 12, padding: 14, marginBottom: 10 },
  slotDay: { fontSize: 14, fontWeight: "700", color: colors.primary },
  slotText: { fontSize: 13, color: "#444", marginTop: 2 },
  closeBtn: { backgroundColor: colors.primary, paddingVertical: 12, alignItems: "center", borderRadius: 12, marginTop: 12 },
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
