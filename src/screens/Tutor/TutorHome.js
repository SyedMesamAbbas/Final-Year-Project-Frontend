import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeSlots = [
  "8:00-9:00 am",
  "9:00-10:00 am",
  "10:00-11:00 am",
  "11:00-12:00 pm",
  "12:00-1:00 pm",
  "1:00-2:00 pm",
  "2:00-3:00 pm",
  "3:00-4:00 pm",
  "4:00-5:00 pm",
  "5:00-6:00 pm",
  "6:00-7:00 pm",
  "7:00-8:00 pm",
  "8:00-9:00 pm",
  "9:00-10:00 pm",
];

const TutorHome = ({ navigation }) => {

  // =========================================
  // STATES
  // =========================================

  // key → true/false (slot selected or not)
  const [schedule, setSchedule] = useState({});

  // key → "green" | "red" | "yellow"
  const [slotStatus, setSlotStatus] = useState({});

  const [teachMode, setTeachMode] = useState("full");

  const [startDate, setStartDate] = useState(null);

  const [endDate, setEndDate] = useState(null);

  const [showStartPicker, setShowStartPicker] = useState(false);

  const [showEndPicker, setShowEndPicker] = useState(false);

  const [notificationCount, setNotificationCount] = useState(0);

  // =========================================
  // LOAD SCHEDULE ON MOUNT
  // =========================================
useEffect(() => {
  fetchSchedule();
  fetchNotificationCount();
}, []);
  // =========================================
  // FETCH SCHEDULE
  // =========================================
  const fetchSchedule = async () => {
    try {

      const token = await AsyncStorage.getItem("token");

      if (!token) return;

      const response = await fetch(
        `${BASE_URL}/Tutor/get-schedule`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("FETCHED SCHEDULE:", data);

      if (response.ok && Array.isArray(data)) {

        const loadedSchedule = {};
        const loadedStatus   = {};

        data.forEach((item) => {

          const key = `${item.day}-${item.time}`;

          // Mark slot as selected
          loadedSchedule[key] = true;

          // Store color status from backend
          // "green" | "red" | "yellow"
          loadedStatus[key] =
            item.slot_status || "green";
        });

        setSchedule(loadedSchedule);
        setSlotStatus(loadedStatus);

        // =====================================
        // SET TEACH MODE
        // =====================================
        const hasShortTime = data.some(
          (x) => x.type === "Short Time"
        );

        if (hasShortTime) {

          setTeachMode("specific");

          if (data[0]?.start_date) {
            setStartDate(new Date(data[0].start_date));
          }

          if (data[0]?.end_date) {
            setEndDate(new Date(data[0].end_date));
          }

        } else {

          setTeachMode("full");
        }
      }

    } catch (error) {

      console.log("FETCH SCHEDULE ERROR:", error);
    }
  };

  const fetchNotificationCount = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) return;

    const response = await fetch(
      `${BASE_URL}/Tutor/notification-badge-count`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    console.log("Notification Count:", data);

    if (response.ok) {
      setNotificationCount(data.count || 0);
    }
  } catch (error) {
    console.log("Notification Count Error:", error);
  }
};

  // =========================================
  // TOGGLE SLOT
  // =========================================
  const toggleSlot = (day, time) => {

    const key = `${day}-${time}`;

    setSchedule((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // =========================================
  // GET SELECTED SLOTS
  // =========================================
  const getSelectedSlots = () => {

    const selected = [];

    Object.keys(schedule).forEach((key) => {

      if (schedule[key]) {

        const parts = key.split("-");
        const day   = parts[0];
        const time  = parts.slice(1).join("-");

        selected.push({ day, time });
      }
    });

    return selected;
  };

  // =========================================
  // SAVE SCHEDULE
  // =========================================
  const handleSave = async () => {

    try {

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const selectedSlots = getSelectedSlots();

      // =====================================
      // VALIDATION
      // =====================================
      if (selectedSlots.length === 0) {
        Alert.alert("Error", "Please select schedule slots");
        return;
      }

      if (teachMode === "specific") {
        if (!startDate || !endDate) {
          Alert.alert("Error", "Please select start and end date");
          return;
        }
      }

      // =====================================
      // PAYLOAD
      // =====================================
      const payload = {
        teachType: teachMode,
        startDate: teachMode === "specific"
          ? startDate.toISOString()
          : null,
        endDate: teachMode === "specific"
          ? endDate.toISOString()
          : null,
        slots: selectedSlots,
      };

      console.log("SAVE PAYLOAD:", JSON.stringify(payload));

      const response = await fetch(
        `${BASE_URL}/Tutor/save-schedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();

      console.log("RAW RESPONSE:", text);

      let resData = {};

      try {
        resData = text ? JSON.parse(text) : {};
      } catch {
        resData = { message: text };
      }

      if (response.ok) {

        Alert.alert(
          "Success",
          resData.message || "Schedule saved successfully"
        );

        await fetchSchedule();

      } else {

        Alert.alert(
          "Error",
          resData.message || "Failed to save schedule"
        );
      }

    } catch (error) {

      console.log("SAVE ERROR:", error);
      Alert.alert("Error", error.message);
    }
  };

  // =========================================
  // RENDER CELL
  // Grey   → not in tutor's schedule
  // Green  → available (no accepted class)
  // Red    → Normal class accepted
  // Yellow → Pre/Reschedule class accepted
  // =========================================
  const renderCell = (day, time) => {

    const key      = `${day}-${time}`;
    const selected = schedule[key];
    const status   = slotStatus[key];

    let cellStyle = styles.cell;

    if (selected) {
      if (status === "red") {
        cellStyle = [styles.cell, styles.redCell];
      } else if (status === "yellow") {
        cellStyle = [styles.cell, styles.yellowCell];
      } else {
        // "green" or default
        cellStyle = [styles.cell, styles.greenCell];
      }
    }

    return (
      <TouchableOpacity
        key={key}
        style={cellStyle}
        onPress={() => toggleSlot(day, time)}
      >
        {selected && (
          <Icon name="check" size={12} color="#fff" />
        )}
      </TouchableOpacity>
    );
  };

  // =========================================
  // RENDER
  // =========================================
  return (
    <SafeAreaView style={styles.container}>

      {/* ======================================= */}
      {/* HEADER                                  */}
      {/* ======================================= */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.navigate("TutorDrawer")}
        >
          <Icon name="menu" size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ position: "relative" }}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Notification")
            }
          >
            <Icon
              name="notifications"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>

          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount}
              </Text>
            </View>
          )}

        </View>
      </View>

      {/* ======================================= */}
      {/* BODY — vertical scroll only             */}
      {/* ======================================= */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 120 }}
      >

        <Text style={styles.welcome}>
          Select Your Availability
        </Text>

        {/* ================================= */}
        {/* TOGGLE                            */}
        {/* ================================= */}
        <View style={styles.toggleContainer}>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              teachMode === "specific" && styles.toggleActive,
            ]}
            onPress={() => setTeachMode("specific")}
          >
            <Text style={styles.toggleText}>
              Teach for specific time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              teachMode === "full" && styles.toggleActive,
            ]}
            onPress={() => setTeachMode("full")}
          >
            <Text style={styles.toggleText}>
              Teach Full Time
            </Text>
          </TouchableOpacity>

        </View>

        {/* ================================= */}
        {/* DATE PICKERS                      */}
        {/* ================================= */}
        {teachMode === "specific" && (

          <View style={{ marginHorizontal: 16 }}>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowStartPicker(true)}
            >
              <Text>
                {startDate
                  ? startDate.toDateString()
                  : "Select Start Date"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() => setShowEndPicker(true)}
            >
              <Text>
                {endDate
                  ? endDate.toDateString()
                  : "Select End Date"}
              </Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="calendar"
                onChange={(e, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="calendar"
                onChange={(e, date) => {
                  setShowEndPicker(false);
                  if (date) setEndDate(date);
                }}
              />
            )}

          </View>
        )}

        {/* ================================= */}
        {/* COLOUR LEGEND                     */}
        {/* ================================= */}
        <View style={styles.legendRow}>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.greenCell]} />
            <Text style={styles.legendText}>Available</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.redCell]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.yellowCell]} />
            <Text style={styles.legendText}>Pre / Reschedule</Text>
          </View>

        </View>

        {/* ================================= */}
        {/* SCHEDULE TABLE                    */}
        {/* No horizontal scroll — fits       */}
        {/* screen width via flex: 1 cells    */}
        {/* ================================= */}
        <View style={styles.card}>

          {/* Day headers */}
          <View style={styles.row}>
            <View style={styles.timeHeader} />
            {days.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Time slot rows */}
          {timeSlots.map((time) => (
            <View key={time} style={styles.row}>
              <Text style={styles.timeText}>{time}</Text>
              {days.map((day) => renderCell(day, time))}
            </View>
          ))}

        </View>

        {/* ================================= */}
        {/* SAVE / CANCEL BUTTONS             */}
        {/* ================================= */}
        <View style={styles.buttonRow}>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSave}
          >
            <Text style={styles.primaryText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setSchedule({});
              setSlotStatus({});
            }}
          >
            <Text style={styles.secondaryText}>Cancel</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* ======================================= */}
      {/* BOTTOM NAV                              */}
      {/* ======================================= */}
      <View style={styles.bottomNav}>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="calendar-month" size={24} color={colors.primary} />
          <Text style={styles.activeTab}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TutorStudentRequest")}
        >
          <Icon name="description" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TutorTodayClasses")}
        >
          <Icon name="school" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TutorAddSubject")}
        >
          <Icon name="add-box" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Add</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default TutorHome;

// ==============================================
// STYLES
// ==============================================
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  content: {
    flex: 1,
  },

  // ---- Header ----
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerCenter: {
    alignItems: "center",
  },

  logoImage: {
    width: 90,
    height: 50,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },

  // ---- Title ----
  welcome: {
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "600",
    color: colors.primary,
  },

  // ---- Toggle ----
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
  },

  toggleBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },

  toggleActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },

  toggleText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // ---- Date pickers ----
  dateBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#fff",
  },

  // ---- Legend ----
  legendRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 4,
  },

  legendText: {
    fontSize: 10,
    color: "#555",
  },

  // ---- Card / Table ----
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 8,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Fixed time column; day columns fill remaining space with flex:1
  timeHeader: {
    width: 68,
  },

  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 10,
    color: "#555",
  },

  timeText: {
    width: 68,
    fontSize: 8,
    color: "#666",
  },

  // Base cell — flex:1 so 7 columns fill screen width
  cell: {
    flex: 1,
    height: 28,
    borderRadius: 4,
    margin: 1,
    backgroundColor: "#ecf0f1",
    justifyContent: "center",
    alignItems: "center",
  },

  // ---- Slot status colours ----
  greenCell: {
    backgroundColor: "#22C55E",
  },

  redCell: {
    backgroundColor: "#EF4444",
  },

  yellowCell: {
    backgroundColor: "#FACC15",
  },

  // ---- Buttons ----
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryText: {
    color: "#555",
    fontWeight: "600",
  },

  // ---- Bottom nav ----
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  navItem: {
    alignItems: "center",
  },

  activeTab: {
    fontSize: 11,
    color: colors.primary,
  },

  inactiveTab: {
    fontSize: 11,
    color: "#999",
  },
  badge: {
  position: "absolute",
  top: -5,
  right: -8,
  minWidth: 18,
  height: 18,
  borderRadius: 9,
  backgroundColor: "#EF4444",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
},

badgeText: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold",
},
});




























// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Alert,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import colors from "../utils/colors";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const timeSlots = [
//   "8:00-9:00 am",
//   "9:00-10:00 am",
//   "10:00-11:00 am",
//   "11:00-12:00 pm",
//   "12:00-1:00 pm",
//   "1:00-2:00 pm",
//   "2:00-3:00 pm",
//   "3:00-4:00 pm",
//   "4:00-5:00 pm",
//   "5:00-6:00 pm",
//   "6:00-7:00 pm",
//   "7:00-8:00 pm",
//   "8:00-9:00 pm",
//   "9:00-10:00 pm",
// ];

// const TutorHome = ({ navigation }) => {

//   // =========================================
//   // STATES
//   // =========================================
//   const [schedule, setSchedule] = useState({});
  
//   const [slotStatus, setSlotStatus] = useState({});

//   const [teachMode, setTeachMode] = useState("full");

//   const [startDate, setStartDate] = useState(null);

//   const [endDate, setEndDate] = useState(null);

//   const [showStartPicker, setShowStartPicker] = useState(false);

//   const [showEndPicker, setShowEndPicker] = useState(false);
  

//   // =========================================
//   // LOAD SCHEDULE
//   // =========================================
//   useEffect(() => {
//     fetchSchedule();
//   }, []);

//   // =========================================
//   // FETCH SCHEDULE
//   // =========================================
//   const fetchSchedule = async () => {
//     try {

//       const token = await AsyncStorage.getItem("token");

//       if (!token) return;

//       const response = await fetch(
//         `${BASE_URL}/Tutor/get-schedule`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       console.log("FETCHED SCHEDULE:", data);

//       if (response.ok && Array.isArray(data)) {

//         const loadedSchedule = {};

//         data.forEach((item) => {

//           const key = `${item.day}-${item.time}`;

//           loadedSchedule[key] = true;
//         });

//         setSchedule(loadedSchedule);

//         // =====================================
//         // SET MODE
//         // =====================================
//         const hasShortTime = data.some(
//           (x) => x.type === "Short Time"
//         );

//         if (hasShortTime) {

//           setTeachMode("specific");

//           if (data[0]?.startDate) {
//             setStartDate(new Date(data[0].startDate));
//           }

//           if (data[0]?.endDate) {
//             setEndDate(new Date(data[0].endDate));
//           }

//         } else {

//           setTeachMode("full");
//         }
//       }

//     } catch (error) {

//       console.log("FETCH SCHEDULE ERROR:", error);
//     }
//   };

//   // =========================================
//   // TOGGLE SLOT
//   // =========================================
//   const toggleSlot = (day, time) => {

//     const key = `${day}-${time}`;

//     setSchedule((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   // =========================================
//   // GET SELECTED SLOTS
//   // =========================================
//   const getSelectedSlots = () => {

//     const selected = [];

//     Object.keys(schedule).forEach((key) => {

//       if (schedule[key]) {

//         const parts = key.split("-");

//         const day = parts[0];

//         const time = parts.slice(1).join("-");

//         selected.push({
//           day,
//           time,
//         });
//       }
//     });

//     return selected;
//   };

//   // =========================================
//   // SAVE SCHEDULE
//   // =========================================
//   const handleSave = async () => {

//     try {

//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const selectedSlots = getSelectedSlots();

//       // =====================================
//       // VALIDATION
//       // =====================================
//       if (selectedSlots.length === 0) {
//         Alert.alert("Error", "Please select schedule slots");
//         return;
//       }

//       if (teachMode === "specific") {

//         if (!startDate || !endDate) {

//           Alert.alert(
//             "Error",
//             "Please select start and end date"
//           );

//           return;
//         }
//       }

//       // =====================================
//       // PAYLOAD
//       // =====================================
//       const payload = {

//         teachType: teachMode,

//         startDate:
//           teachMode === "specific"
//             ? startDate.toISOString()
//             : null,

//         endDate:
//           teachMode === "specific"
//             ? endDate.toISOString()
//             : null,

//         slots: selectedSlots,
//       };

//       console.log(
//         "SAVE PAYLOAD:",
//         JSON.stringify(payload)
//       );

//       const response = await fetch(
//         `${BASE_URL}/Tutor/save-schedule`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const text = await response.text();

//       console.log("RAW RESPONSE:", text);

//       let data = {};

//       try {

//         data = text ? JSON.parse(text) : {};

//       } catch {

//         data = { message: text };
//       }

//       if (response.ok) {

//         Alert.alert(
//           "Success",
//           data.message || "Schedule saved successfully"
//         );

//         // REFRESH
//         await fetchSchedule();

//       } else {

//         Alert.alert(
//           "Error",
//           data.message || "Failed to save schedule"
//         );
//       }

//     } catch (error) {

//       console.log("SAVE ERROR:", error);

//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // RENDER CELL
//   // =========================================
//   // const renderCell = (day, time) => {

//   //   const key = `${day}-${time}`;

//   //   const selected = schedule[key];

//   //   return (
//   //     <TouchableOpacity
//   //       key={key}
//   //       style={[
//   //         styles.cell,
//   //         selected && styles.activeCell,
//   //       ]}
//   //       onPress={() => toggleSlot(day, time)}
//   //     >
//   //       {selected && (
//   //         <Icon
//   //           name="check"
//   //           size={14}
//   //           color="#fff"
//   //         />
//   //       )}
//   //     </TouchableOpacity>
//   //   );
//   // };
//   const renderCell = (day, time) => {
//   const key = `${day}-${time}`;

//   const selected = schedule[key];
//   const status = slotStatus[key];

//   let colorStyle = null;

//   if (selected) {
//     if (status === "red") {
//       colorStyle = styles.redCell;
//     } else if (status === "yellow") {
//       colorStyle = styles.yellowCell;
//     } else {
//       colorStyle = styles.greenCell;
//     }
//   }

//   return (
//     <TouchableOpacity
//       key={key}
//       style={[styles.cell, colorStyle]}
//       onPress={() => toggleSlot(day, time)}
//     >
//       {selected && (
//         <Icon
//           name="check"
//           size={14}
//           color="#fff"
//         />
//       )}
//     </TouchableOpacity>
//   );
// };

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* HEADER */}
//       <View style={styles.header}>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate("TutorDrawer")
//           }
//         >
//           <Icon
//             name="menu"
//             size={26}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />

//           <Text style={styles.logoText}>
//             House of Tutor
//           </Text>
//         </View>

//         <View style={{ width: 26 }} />
//       </View>

//       <ScrollView
//         style={styles.content}
//         contentContainerStyle={{
//           paddingBottom: 120,
//         }}
//       >
//         <View>

//         <Text style={styles.welcome}>
//           Select Your Availability
//         </Text>

//         {/* ================================= */}
//         {/* TOGGLE */}
//         {/* ================================= */}
//         <View style={styles.toggleContainer}>

//           <TouchableOpacity
//             style={[
//               styles.toggleBtn,
//               teachMode === "specific" &&
//               styles.toggleActive,
//             ]}
//             onPress={() =>
//               setTeachMode("specific")
//             }
//           >
//             <Text style={styles.toggleText}>
//               Teach for specific time
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.toggleBtn,
//               teachMode === "full" &&
//               styles.toggleActive,
//             ]}
//             onPress={() =>
//               setTeachMode("full")
//             }
//           >
//             <Text style={styles.toggleText}>
//               Teach Full Time
//             </Text>
//           </TouchableOpacity>

//         </View>

//         {/* ================================= */}
//         {/* DATE PICKERS */}
//         {/* ================================= */}
//         {teachMode === "specific" && (

//           <View style={{ marginHorizontal: 16 }}>

//             <TouchableOpacity
//               style={styles.dateBox}
//               onPress={() =>
//                 setShowStartPicker(true)
//               }
//             >
//               <Text>
//                 {
//                   startDate
//                     ? startDate.toDateString()
//                     : "Select Start Date"
//                 }
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dateBox}
//               onPress={() =>
//                 setShowEndPicker(true)
//               }
//             >
//               <Text>
//                 {
//                   endDate
//                     ? endDate.toDateString()
//                     : "Select End Date"
//                 }
//               </Text>
//             </TouchableOpacity>

//             {showStartPicker && (

//               <DateTimePicker
//                 value={startDate || new Date()}
//                 mode="date"
//                 display="calendar"
//                 onChange={(e, date) => {

//                   setShowStartPicker(false);

//                   if (date) {
//                     setStartDate(date);
//                   }
//                 }}
//               />
//             )}

//             {showEndPicker && (

//               <DateTimePicker
//                 value={endDate || new Date()}
//                 mode="date"
//                 display="calendar"
//                 onChange={(e, date) => {

//                   setShowEndPicker(false);

//                   if (date) {
//                     setEndDate(date);
//                   }
//                 }}
//               />
//             )}

//           </View>
//         )}

//         {/* ================================= */}
//         {/* TABLE */}
//         {/* ================================= */}
//         <View style={styles.card}>

//           {/* <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//           > */}

//             <View>

//               <View style={styles.row}>

//                 <View style={styles.timeHeader} />

//                 {days.map((day) => (
//                   <Text
//                     key={day}
//                     style={styles.dayHeader}
//                   >
//                     {day}
//                   </Text>
//                 ))}
//               </View>

//               {timeSlots.map((time) => (

//                 <View
//                   key={time}
//                   style={styles.row}
//                 >

//                   <Text style={styles.timeText}>
//                     {time}
//                   </Text>

//                   {days.map((day) =>
//                     renderCell(day, time)
//                   )}

//                 </View>
//               ))}

//             </View>

//           {/* </ScrollView> */}
//           </View>

//         </View>

//         {/* ================================= */}
//         {/* BUTTONS */}
//         {/* ================================= */}
//         <View style={styles.buttonRow}>

//           <TouchableOpacity
//             style={styles.primaryBtn}
//             onPress={handleSave}
//           >
//             <Text style={styles.primaryText}>
//               Save
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.secondaryBtn}
//             onPress={() => {
//               setSchedule({});
//               setSlotStatus({});
//             }}
//           >
//             <Text style={styles.secondaryText}>
//               Cancel
//             </Text>
//           </TouchableOpacity>

//         </View>

//       </ScrollView>

//       {/* ================================= */}
//       {/* BOTTOM NAV */}
//       {/* ================================= */}
//       <View style={styles.bottomNav}>

//         <TouchableOpacity style={styles.navItem}>
//           <Icon
//             name="calendar-month"
//             size={24}
//             color={colors.primary}
//           />
//           <Text style={styles.activeTab}>
//             Schedule
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "TutorStudentRequest"
//             )
//           }
//         >
//           <Icon
//             name="description"
//             size={24}
//             color="#999"
//           />
//           <Text style={styles.inactiveTab}>
//             Request
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "TutorTodayClasses"
//             )
//           }
//         >
//           <Icon
//             name="school"
//             size={24}
//             color="#999"
//           />
//           <Text style={styles.inactiveTab}>
//             Today
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "TutorAddSubject"
//             )
//           }
//         >
//           <Icon
//             name="add-box"
//             size={24}
//             color="#999"
//           />
//           <Text style={styles.inactiveTab}>
//             Add
//           </Text>
//         </TouchableOpacity>

//       </View>

//     </SafeAreaView>
//   );
// };

// export default TutorHome;


// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   content: {
//     flex: 1,
//   },

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
//     width: 90,
//     height: 50,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   welcome: {
//     fontSize: 16,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 12,
//     borderRadius: 12,
//     padding: 10,
//     elevation: 3,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   // timeHeader: {
//   //   width: 95,
//   // },

//   // dayHeader: {
//   //   width: 55,
//   //   textAlign: "center",
//   //   fontWeight: "600",
//   //   fontSize: 12,
//   //   color: "#555",
//   // },

//   // timeText: {
//   //   width: 95,
//   //   fontSize: 11,
//   //   color: "#666",
//   // },

//   // cell: {
//   //   width: 55,
//   //   height: 38,
//   //   borderRadius: 6,
//   //   margin: 2,
//   //   backgroundColor: "#ecf0f1",
//   //   justifyContent: "center",
//   //   alignItems: "center",
//   // },

//   timeHeader: {
//   width: 72,
// },

// dayHeader: {
//   width: 36,
//   textAlign: "center",
//   fontWeight: "600",
//   fontSize: 10,
//   color: "#555",
// },

// timeText: {
//   width: 72,
//   fontSize: 9,
//   color: "#666",
// },

// cell: {
//   width: 36,
//   height: 30,
//   borderRadius: 5,
//   margin: 1,
//   backgroundColor: "#ecf0f1",
//   justifyContent: "center",
//   alignItems: "center",
// },

// greenCell: {
//   backgroundColor: "#22C55E",
// },

// redCell: {
//   backgroundColor: "#EF4444",
// },

// yellowCell: {
//   backgroundColor: "#FACC15",
// },


//   activeCell: {
//     backgroundColor: colors.primary,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: 16,
//     marginTop: 20,
//   },

//   primaryBtn: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginRight: 8,
//   },

//   secondaryBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#999",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 8,
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   secondaryText: {
//     color: "#555",
//     fontWeight: "600",
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderColor: "#eee",
//   },

//   navItem: {
//     alignItems: "center",
//   },

//   activeTab: {
//     fontSize: 11,
//     color: colors.primary,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//   },
//   toggleContainer: {
//   flexDirection: "row",
//   marginHorizontal: 16,
//   marginVertical: 10,
// },

// toggleBtn: {
//   flex: 1,
//   padding: 10,
//   marginHorizontal: 5,
//   borderWidth: 1,
//   borderColor: "#ccc",
//   borderRadius: 8,
//   alignItems: "center",
// },

// toggleActive: {
//   backgroundColor: "#4CAF50",
//   borderColor: "#4CAF50",
// },

// toggleText: {
//   fontSize: 12,
//   fontWeight: "600",
// },

// dateBox: {
//   padding: 12,
//   borderWidth: 1,
//   borderColor: "#ccc",
//   borderRadius: 8,
//   marginTop: 10,
//   backgroundColor: "#fff",
// },
// });
























// import React, { useState } from "react";


























// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const timeSlots = [
//   "8:00-9:00 am","9:00-10:00 am","10:00-11:00 am","11:00-12:00 pm",
//   "12:00-1:00 pm","1:00-2:00 pm","2:00-3:00 pm","3:00-4:00 pm",
//   "4:00-5:00 pm","5:00-6:00 pm","6:00-7:00 pm","7:00-8:00 pm",
//   "8:00-9:00 pm","9:00-10:00 pm",
// ];

// const TutorHomeNonDateBased = ({ navigation }) => {
//   const [schedule, setSchedule] = useState({});

//   const toggleSlot = (day, time) => {
//     const key = `${day}-${time}`;
//     setSchedule((prev) => ({
//       ...prev,
//       [key]: !prev[key], // true/false
//     }));
//   };

//   const getSelectedSlots = () => {
//     const selected = [];

//     Object.keys(schedule).forEach((key) => {
//       if (schedule[key]) {
//         const [day, ...timeParts] = key.split("-");
//         const time = timeParts.join("-");

//         selected.push({
//           day,
//           time: time.toLowerCase().replace(/\s/g, ""),
//         });
//       }
//     });

//     return selected;
//   };

//   const handleSave = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const slots = getSelectedSlots();

//       if (slots.length === 0) {
//         Alert.alert("Error", "Please select at least one slot");
//         return;
//       }

//       const response = await fetch(`${BASE_URL}/Tutor/save-schedule`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ slots }),
//       });

//       const text = await response.text();
//       console.log("SCHEDULE RESPONSE:", text);

//       const data = text ? JSON.parse(text) : {};

//       if (response.ok) {
//         Alert.alert("Success", data.message);
//       } else {
//         Alert.alert("Error", data.message || "Failed to save schedule");
//       }

//     } catch (error) {
//       console.log("Save Error:", error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   const renderCell = (day, time) => {
//     const key = `${day}-${time}`;
//     const selected = schedule[key];

//     return (
//       <TouchableOpacity
//         key={key}
//         style={[styles.cell, selected && styles.activeCell]}
//         onPress={() => toggleSlot(day, time)}
//       >
//         {selected && <Icon name="check" size={14} color="#fff" />}
//       </TouchableOpacity>
//     );
//   };

//   return (
//   <SafeAreaView style={styles.container}>

//     <View style={styles.header}>
//       <TouchableOpacity onPress={() => navigation.navigate("TutorDrawer")}>
//         <Icon name="menu" size={26} color={colors.primary} />
//       </TouchableOpacity>

//       <View style={styles.headerCenter}>
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logoImage}
//         />
//         <Text style={styles.logoText}>House of Tutor</Text>
//       </View>

//       <View style={{ width: 26 }} />
//     </View>

//     {/* CONTENT */}
//     <ScrollView
//       style={styles.content}
//       contentContainerStyle={{ paddingBottom: 120 }}
//       showsVerticalScrollIndicator={false}
//     >
//       <Text style={styles.welcome}>Select Your Availability</Text>

//       <View style={styles.card}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <View>
//             <View style={styles.row}>
//               <View style={styles.timeHeader} />
//               {days.map((day) => (
//                 <Text key={day} style={styles.dayHeader}>{day}</Text>
//               ))}
//             </View>

//             {timeSlots.map((time) => (
//               <View key={time} style={styles.row}>
//                 <Text style={styles.timeText}>{time}</Text>
//                 {days.map((day) => renderCell(day, time))}
//               </View>
//             ))}
//           </View>
//         </ScrollView>
//       </View>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
//           <Text style={styles.primaryText}>Save</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           onPress={() => setSchedule({})}
//         >
//           <Text style={styles.secondaryText}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>

//     <View style={styles.bottomNav}>
//       <TouchableOpacity style={styles.navItem}>
//         <Icon name="calendar-month" size={24} color={colors.primary} />
//         <Text style={styles.activeTab}>Schedule</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navItem}
//         onPress={() => navigation.navigate("TutorStudentRequest")}
//       >
//         <Icon name="description" size={24} color="#999" />
//         <Text style={styles.inactiveTab}>Request</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navItem}
//         onPress={() => navigation.navigate("TutorTodayClasses")}
//       >
//         <Icon name="school" size={24} color="#999" />
//         <Text style={styles.inactiveTab}>Today</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navItem}
//         onPress={() => navigation.navigate("TutorAddSubject")}
//       >
//         <Icon name="add-box" size={24} color="#999" />
//         <Text style={styles.inactiveTab}>Add</Text>
//       </TouchableOpacity>
//     </View>

//   </SafeAreaView>
// );
// }
// export default TutorHomeNonDateBased;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   content: {
//     flex: 1,
//   },

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
//     width: 90,
//     height: 50,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   welcome: {
//     fontSize: 16,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 12,
//     borderRadius: 12,
//     padding: 10,
//     elevation: 3,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   timeHeader: {
//     width: 95,
//   },

//   dayHeader: {
//     width: 55,
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: 12,
//     color: "#555",
//   },

//   timeText: {
//     width: 95,
//     fontSize: 11,
//     color: "#666",
//   },

//   cell: {
//     width: 55,
//     height: 38,
//     borderRadius: 6,
//     margin: 2,
//     backgroundColor: "#ecf0f1",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   activeCell: {
//     backgroundColor: colors.primary,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginHorizontal: 16,
//     marginTop: 20,
//   },

//   primaryBtn: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginRight: 8,
//   },

//   secondaryBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#999",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 8,
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   secondaryText: {
//     color: "#555",
//     fontWeight: "600",
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderColor: "#eee",
//   },

//   navItem: {
//     alignItems: "center",
//   },

//   activeTab: {
//     fontSize: 11,
//     color: colors.primary,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//   },
// });







// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   Alert,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import colors from "../utils/colors";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const timeSlots = [
//   "8:00-9:00 am","9:00-10:00 am","10:00-11:00 am","11:00-12:00 pm",
//   "12:00-1:00 pm","1:00-2:00 pm","2:00-3:00 pm","3:00-4:00 pm",
//   "4:00-5:00 pm","5:00-6:00 pm","6:00-7:00 pm","7:00-8:00 pm",
//   "8:00-9:00 pm","9:00-10:00 pm",
// ];

// const TutorHomeNonDateBased = ({ navigation }) => {

//   // schedule selection
//   const [schedule, setSchedule] = useState({});

//   // toggle mode
//   const [teachMode, setTeachMode] = useState("full"); // full | specific

//   // dates
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);

//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);

//   // toggle slot
//   const toggleSlot = (day, time) => {
//     const key = `${day}-${time}`;
//     setSchedule((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   const getSelectedSlots = () => {
//     const selected = [];

//     Object.keys(schedule).forEach((key) => {
//       if (schedule[key]) {
//         const [day, ...timeParts] = key.split("-");
//         const time = timeParts.join("-");

//         selected.push({
//           day,
//           time: time.toLowerCase().replace(/\s/g, ""),
//         });
//       }
//     });

//     return selected;
//   };

//   // const handleSave = async () => {
//   //   try {
//   //     const token = await AsyncStorage.getItem("token");

//   //     if (!token) {
//   //       Alert.alert("Error", "User not logged in");
//   //       return;
//   //     }

//   //     if (teachMode === "specific") {
//   //       if (!startDate || !endDate) {
//   //         Alert.alert("Error", "Please select start and end date");
//   //         return;
//   //       }
//   //     }

//   //     const payload = {
//   //       mode: teachMode,
//   //       startDate: teachMode === "specific" ? startDate : null,
//   //       endDate: teachMode === "specific" ? endDate : null,
//   //       slots: teachMode === "full" ? getSelectedSlots() : []
//   //     };

//   //     const response = await fetch(`${BASE_URL}/Tutor/save-schedule`, {
//   //       method: "POST",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`,
//   //       },
//   //       body: JSON.stringify(payload),
//   //     });

//   //     const data = await response.json();

//   //     if (response.ok) {
//   //       Alert.alert("Success", data.message);
//   //     } else {
//   //       Alert.alert("Error", data.message || "Failed");
//   //     }

//   //   } catch (error) {
//   //     Alert.alert("Error", error.message);
//   //   }
//   // };

//   const handleSave = async () => {
//   try {

//     const token = await AsyncStorage.getItem("token");

//     if (!token) {
//       Alert.alert("Error", "User not logged in");
//       return;
//     }

//     const selectedSlots = getSelectedSlots();

//     // CHECK SLOT SELECTION
//     if (selectedSlots.length === 0) {
//       Alert.alert("Error", "Please select schedule slots");
//       return;
//     }

//     // CHECK DATES
//     if (teachMode === "specific") {

//       if (!startDate || !endDate) {
//         Alert.alert("Error", "Please select start and end date");
//         return;
//       }
//     }

//     const payload = {
//       teachType: teachMode, // IMPORTANT

//       startDate:
//         teachMode === "specific"
//           ? startDate.toISOString()
//           : null,

//       endDate:
//         teachMode === "specific"
//           ? endDate.toISOString()
//           : null,

//       slots: selectedSlots,
//     };

//     console.log("PAYLOAD:", JSON.stringify(payload));

//     const response = await fetch(`${BASE_URL}/Tutor/save-schedule`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(payload),
//     });

//     const text = await response.text();

//     console.log("RAW RESPONSE:", text);

//     let data = {};

//     try {
//       data = text ? JSON.parse(text) : {};
//     } catch {
//       data = { message: text };
//     }

//     if (response.ok) {
//       Alert.alert("Success", data.message || "Saved successfully");
//     } else {
//       Alert.alert("Error", data.message || "Failed to save");
//     }

//   } catch (error) {

//     console.log("SAVE ERROR:", error);

//     Alert.alert("Error", error.message);
//   }
// };
//   const renderCell = (day, time) => {
//     const key = `${day}-${time}`;
//     const selected = schedule[key];

//     return (
//       <TouchableOpacity
//         key={key}
//         style={[styles.cell, selected && styles.activeCell]}
//         onPress={() => toggleSlot(day, time)}
//       >
//         {selected && <Icon name="check" size={14} color="#fff" />}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.navigate("TutorDrawer")}>
//           <Icon name="menu" size={26} color={colors.primary} />
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

//       <ScrollView
//         style={styles.content}
//         contentContainerStyle={{ paddingBottom: 120 }}
//       >

//         <Text style={styles.welcome}>Select Your Availability</Text>

//         {/* TOGGLE BUTTONS */}
//         <View style={styles.toggleContainer}>

//           <TouchableOpacity
//             style={[
//               styles.toggleBtn,
//               teachMode === "specific" && styles.toggleActive
//             ]}
//             onPress={() => setTeachMode("specific")}
//           >
//             <Text style={styles.toggleText}>Teach for specific time</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.toggleBtn,
//               teachMode === "full" && styles.toggleActive
//             ]}
//             onPress={() => setTeachMode("full")}
//           >
//             <Text style={styles.toggleText}>Teach Full Time</Text>
//           </TouchableOpacity>

//         </View>

//         {/* DATE PICKERS */}
//         {teachMode === "specific" && (
//           <View style={{ marginHorizontal: 16 }}>

//             <TouchableOpacity
//               style={styles.dateBox}
//               onPress={() => setShowStartPicker(true)}
//             >
//               <Text>
//                 {startDate ? startDate.toDateString() : "Select Start Date"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dateBox}
//               onPress={() => setShowEndPicker(true)}
//             >
//               <Text>
//                 {endDate ? endDate.toDateString() : "Select End Date"}
//               </Text>
//             </TouchableOpacity>

//             {showStartPicker && (
//               <DateTimePicker
//                 value={startDate || new Date()}
//                 mode="date"
//                 display="calendar"
//                 onChange={(e, date) => {
//                   setShowStartPicker(false);
//                   if (date) setStartDate(date);
//                 }}
//               />
//             )}

//             {showEndPicker && (
//               <DateTimePicker
//                 value={endDate || new Date()}
//                 mode="date"
//                 display="calendar"
//                 onChange={(e, date) => {
//                   setShowEndPicker(false);
//                   if (date) setEndDate(date);
//                 }}
//               />
//             )}

//           </View>
//         )}

//         {/* SCHEDULE TABLE */}
//         <View style={styles.card}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             <View>
//               <View style={styles.row}>
//                 <View style={styles.timeHeader} />
//                 {days.map((day) => (
//                   <Text key={day} style={styles.dayHeader}>{day}</Text>
//                 ))}
//               </View>

//               {timeSlots.map((time) => (
//                 <View key={time} style={styles.row}>
//                   <Text style={styles.timeText}>{time}</Text>
//                   {days.map((day) => renderCell(day, time))}
//                 </View>
//               ))}
//             </View>
//           </ScrollView>
//         </View>

//         {/* BUTTONS */}
//         <View style={styles.buttonRow}>
//           <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
//             <Text style={styles.primaryText}>Save</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.secondaryBtn}
//             onPress={() => setSchedule({})}
//           >
//             <Text style={styles.secondaryText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>

//       </ScrollView>

//       {/* BOTTOM NAV */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="calendar-month" size={24} color={colors.primary} />
//           <Text style={styles.activeTab}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate("TutorStudentRequest")}>
//           <Icon name="description" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Request</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate("TutorTodayClasses")}>
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Today</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate("TutorAddSubject")}>
//           <Icon name="add-box" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Add</Text>
//         </TouchableOpacity>
//       </View>

//     </SafeAreaView>
//   );
// };

// export default TutorHomeNonDateBased;
