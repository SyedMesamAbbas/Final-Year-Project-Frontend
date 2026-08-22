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
  StatusBar,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../utils/colors";
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

const StudentHome = ({ navigation }) => {
  // =========================================
  // STATES (Logic intact)
  // =========================================
  const [schedule, setSchedule] = useState({});
  const [teachMode, setTeachMode] = useState("full");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // =========================================
  // LOAD SCHEDULE & NOTIFICATIONS
  // =========================================
  useEffect(() => {
    fetchSchedule();
    fetchNotificationCount();
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${BASE_URL}/Student/get-student-schedules`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("FETCHED STUDENT SCHEDULE:", data);

      if (response.ok && Array.isArray(data)) {
        const loadedSchedule = {};

        data.forEach((item) => {
          const key = `${item.day}-${item.time}`;
          loadedSchedule[key] = true;
        });

        setSchedule(loadedSchedule);

        const hasSpecificTime = data.some(
          (x) => x.type?.toLowerCase() === "specific time"
        );

        if (hasSpecificTime) {
          setTeachMode("specific");

          if (data[0]?.startDate) {
            setStartDate(new Date(data[0].startDate));
          }

          if (data[0]?.endDate) {
            setEndDate(new Date(data[0].endDate));
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
        `${BASE_URL}/Student/notification-badge-count`,
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
  // TOGGLE & HELPER LOGIC
  // =========================================
  const toggleSlot = (day, time) => {
    const key = `${day}-${time}`;
    setSchedule((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getSelectedSlots = () => {
    const selected = [];
    Object.keys(schedule).forEach((key) => {
      if (schedule[key]) {
        const parts = key.split("-");
        const day = parts[0];
        const time = parts.slice(1).join("-");
        selected.push({ day, time });
      }
    });
    return selected;
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const selectedSlots = getSelectedSlots();

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

      const payload = {
        availabilityType: teachMode === "specific" ? "specific" : "full",
        startDate:
          teachMode === "specific" ? startDate.toISOString() : null,
        endDate: teachMode === "specific" ? endDate.toISOString() : null,
        slots: selectedSlots,
      };

      console.log("SAVE PAYLOAD:", JSON.stringify(payload));

      const response = await fetch(
        `${BASE_URL}/Student/save-student-schedule`,
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

      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (response.ok) {
        Alert.alert("Success", data.message || "Schedule saved successfully");
        await fetchSchedule();
      } else {
        Alert.alert("Error", data.message || "Failed to save schedule");
      }
    } catch (error) {
      console.log("SAVE ERROR:", error);
      Alert.alert("Error", error.message);
    }
  };

  const selectedCount = Object.values(schedule).filter(Boolean).length;

  // =========================================
  // CELL RENDERER
  // =========================================
  const renderCell = (day, time) => {
    const key = `${day}-${time}`;
    const selected = schedule[key];

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.7}
        style={[styles.cell, selected && styles.activeCell]}
        onPress={() => toggleSlot(day, time)}
      >
        {selected ? (
          <Icon name="check" size={13} color="#FFFFFF" />
        ) : (
          <View style={styles.cellDot} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("StudentDrawer")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={styles.notificationContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Notification")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="notifications-none" size={24} color="#1E293B" />
          </TouchableOpacity>

          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {notificationCount > 99 ? "99+" : notificationCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TITLE SECTION */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.welcomeTitle}>Manage Availability</Text>
            <Text style={styles.welcomeSubtitle}>
              Select the time slots you are available for learning
            </Text>
          </View>
          {selectedCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{selectedCount} Selected</Text>
            </View>
          )}
        </View>

        {/* MODE TOGGLE */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.toggleBtn,
              teachMode === "full" && styles.toggleActive,
            ]}
            onPress={() => setTeachMode("full")}
          >
            <Icon
              name="all-inclusive"
              size={18}
              color={teachMode === "full" ? colors.primary || "#2563EB" : "#64748B"}
              style={styles.toggleIcon}
            />
            <Text
              style={[
                styles.toggleText,
                teachMode === "full" && styles.toggleTextActive,
              ]}
            >
              Full Time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.toggleBtn,
              teachMode === "specific" && styles.toggleActive,
            ]}
            onPress={() => setTeachMode("specific")}
          >
            <Icon
              name="date-range"
              size={18}
              color={teachMode === "specific" ? colors.primary || "#2563EB" : "#64748B"}
              style={styles.toggleIcon}
            />
            <Text
              style={[
                styles.toggleText,
                teachMode === "specific" && styles.toggleTextActive,
              ]}
            >
              Specific Range
            </Text>
          </TouchableOpacity>
        </View>

        {/* DATE PICKERS CARD */}
        {teachMode === "specific" && (
          <View style={styles.dateSectionCard}>
            <Text style={styles.cardLabel}>SELECT DATE RANGE</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dateBox}
                activeOpacity={0.7}
                onPress={() => setShowStartPicker(true)}
              >
                <Icon name="event" size={20} color="#64748B" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <Text style={styles.dateValueText}>
                    {startDate ? startDate.toDateString() : "Select Date"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateBox}
                activeOpacity={0.7}
                onPress={() => setShowEndPicker(true)}
              >
                <Icon name="event-available" size={20} color="#64748B" />
                <View style={styles.dateTextContainer}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <Text style={styles.dateValueText}>
                    {endDate ? endDate.toDateString() : "Select Date"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

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

        {/* TIMETABLE GRID CARD */}
        <View style={styles.gridCard}>
          <View style={styles.gridHeaderRow}>
            <Text style={styles.cardLabel}>WEEKLY SCHEDULE</Text>
            <Text style={styles.gridSubtext}>Tap to select/deselect</Text>
          </View>

          {/* Days Header */}
          <View style={styles.tableHeaderRow}>
            <View style={styles.timeHeaderCol} />
            {days.map((day) => (
              <View key={day} style={styles.dayHeaderCol}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time Rows */}
          {timeSlots.map((time) => {
            const shortTime = time.replace(":00", "").replace(" ", "");
            return (
              <View key={time} style={styles.tableRow}>
                <View style={styles.timeHeaderCol}>
                  <Text style={styles.timeText}>{shortTime}</Text>
                </View>
                {days.map((day) => renderCell(day, time))}
              </View>
            );
          })}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.8}
            onPress={() => {
              setSchedule({});
              setTeachMode("full");
              setStartDate(null);
              setEndDate(null);
            }}
          >
            <Text style={styles.secondaryText}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleSave}
          >
            <Icon name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.primaryText}>Save Schedule</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.activeTabIndicator}>
            <Icon name="calendar-month" size={22} color={colors.primary || "#2563EB"} />
          </View>
          <Text style={styles.activeTab}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentAddCourses")}
        >
          <Icon name="library-add" size={22} color="#94A3B8" />
          <Text style={styles.inactiveTab}>Add Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentCourses")}
        >
          <Icon name="menu-book" size={22} color="#94A3B8" />
          <Text style={styles.inactiveTab}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentAllClasses")}
        >
          <Icon name="school" size={22} color="#94A3B8" />
          <Text style={styles.inactiveTab}>Classes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentHome;

// =========================================
// MODERN STYLESHEET
// =========================================
const PRIMARY_COLOR = colors.primary || "#2563EB";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },

  // TOGGLE
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  toggleIcon: {
    marginRight: 6,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  toggleTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },

  // DATE SECTION CARD
  dateSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  dateRow: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  dateBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dateTextContainer: {
    marginLeft: 8,
  },
  dateLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dateValueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 1,
  },

  // GRID CARD
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  gridHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  gridSubtext: {
    fontSize: 11,
    color: "#94A3B8",
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 4,
  },
  timeHeaderCol: {
    width: 62,
    justifyContent: "center",
  },
  dayHeaderCol: {
    flex: 1,
    alignItems: "center",
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
  },
  timeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#64748B",
  },
  cell: {
    flex: 1,
    height: 30,
    borderRadius: 8,
    marginHorizontal: 2,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCell: {
    backgroundColor: PRIMARY_COLOR,
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cellDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },

  // BUTTONS
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  primaryBtn: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: PRIMARY_COLOR,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },

  // BOTTOM NAVIGATION
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    position: "absolute",
    bottom: 0,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activeTabIndicator: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeTab: {
    fontSize: 11,
    color: PRIMARY_COLOR,
    fontWeight: "700",
    marginTop: 3,
  },
  inactiveTab: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 3,
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
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import colors from "../utils/colors";
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

// const StudentHome = ({ navigation }) => {
//   // =========================================
//   // STATES
//   // =========================================
//   const [schedule, setSchedule] = useState({});
//   const [teachMode, setTeachMode] = useState("full");
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
//   const [notificationCount, setNotificationCount] = useState(0);

//   // =========================================
//   // LOAD SCHEDULE
//   // =========================================
//   useEffect(() => {
//     fetchSchedule();
//     fetchNotificationCount();
//   }, []);

//   // =========================================
//   // FETCH SCHEDULE
//   // =========================================
//   const fetchSchedule = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;

//       const response = await fetch(
//         `${BASE_URL}/Student/get-student-schedules`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();
//       console.log("FETCHED STUDENT SCHEDULE:", data);

//       if (response.ok && Array.isArray(data)) {
//         const loadedSchedule = {};

//         data.forEach((item) => {
//           const key = `${item.day}-${item.time}`;
//           loadedSchedule[key] = true;
//         });

//         setSchedule(loadedSchedule);

//         const hasSpecificTime = data.some(
//           (x) => x.type?.toLowerCase() === "specific time"
//         );

//         if (hasSpecificTime) {
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

//   const fetchNotificationCount = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;

//       const response = await fetch(
//         `${BASE_URL}/Student/notification-badge-count`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();
//       console.log("Notification Count:", data);

//       if (response.ok) {
//         setNotificationCount(data.count || 0);
//       }
//     } catch (error) {
//       console.log("Notification Count Error:", error);
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

//         selected.push({ day, time });
//       }
//     });

//     return selected;
//   };

//   // =========================================
//   // SAVE
//   // =========================================
//   const handleSave = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const selectedSlots = getSelectedSlots();

//       if (selectedSlots.length === 0) {
//         Alert.alert("Error", "Please select schedule slots");
//         return;
//       }

//       if (teachMode === "specific") {
//         if (!startDate || !endDate) {
//           Alert.alert("Error", "Please select start and end date");
//           return;
//         }
//       }

//       const payload = {
//         availabilityType: teachMode === "specific" ? "specific" : "full",
//         startDate:
//           teachMode === "specific" ? startDate.toISOString() : null,
//         endDate: teachMode === "specific" ? endDate.toISOString() : null,
//         slots: selectedSlots,
//       };

//       console.log("SAVE PAYLOAD:", JSON.stringify(payload));

//       const response = await fetch(
//         `${BASE_URL}/Student/save-student-schedule`,
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
//         Alert.alert("Success", data.message || "Schedule saved successfully");
//         await fetchSchedule();
//       } else {
//         Alert.alert("Error", data.message || "Failed to save schedule");
//       }
//     } catch (error) {
//       console.log("SAVE ERROR:", error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   // =========================================
//   // RENDER CELL
//   // =========================================
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
//         <TouchableOpacity
//           style={styles.sideIcon}
//           onPress={() => navigation.navigate("StudentDrawer")}
//         >
//           <Icon name="menu" size={28} color={colors.primary} />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={styles.notificationContainer}>
//           <TouchableOpacity
//             style={styles.sideIcon}
//             onPress={() => navigation.navigate("Notification")}
//           >
//             <Icon name="notifications" size={26} color={colors.primary} />
//           </TouchableOpacity>

//           {notificationCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{notificationCount}</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       {/* MAIN CONTENT - vertical scroll only */}
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.card}>
//           <Text style={styles.welcome}>Select Your Availability</Text>

//           {/* TOGGLE */}
//           <View style={styles.toggleContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.toggleBtn,
//                 teachMode === "specific" && styles.toggleActive,
//               ]}
//               onPress={() => setTeachMode("specific")}
//             >
//               <Text style={styles.toggleText}>Learn for specific time</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.toggleBtn,
//                 teachMode === "full" && styles.toggleActive,
//               ]}
//               onPress={() => setTeachMode("full")}
//             >
//               <Text style={styles.toggleText}>Learn Full Time</Text>
//             </TouchableOpacity>
//           </View>

//           {/* DATE PICKERS */}
//           {teachMode === "specific" && (
//             <View style={{ marginHorizontal: 16 }}>
//               <TouchableOpacity
//                 style={styles.dateBox}
//                 onPress={() => setShowStartPicker(true)}
//               >
//                 <Text>
//                   {startDate ? startDate.toDateString() : "Select Start Date"}
//                 </Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dateBox}
//                 onPress={() => setShowEndPicker(true)}
//               >
//                 <Text>
//                   {endDate ? endDate.toDateString() : "Select End Date"}
//                 </Text>
//               </TouchableOpacity>

//               {showStartPicker && (
//                 <DateTimePicker
//                   value={startDate || new Date()}
//                   mode="date"
//                   display="calendar"
//                   onChange={(e, date) => {
//                     setShowStartPicker(false);
//                     if (date) {
//                       setStartDate(date);
//                     }
//                   }}
//                 />
//               )}

//               {showEndPicker && (
//                 <DateTimePicker
//                   value={endDate || new Date()}
//                   mode="date"
//                   display="calendar"
//                   onChange={(e, date) => {
//                     setShowEndPicker(false);
//                     if (date) {
//                       setEndDate(date);
//                     }
//                   }}
//                 />
//               )}
//             </View>
//           )}

//           {/* TABLE - horizontal scroll removed, fits within screen width */}
//           <View style={styles.card}>
//             <View>
//               <View style={styles.row}>
//                 <View style={styles.timeHeader} />

//                 {days.map((day) => (
//                   <Text key={day} style={styles.dayHeader}>
//                     {day}
//                   </Text>
//                 ))}
//               </View>

//               {timeSlots.map((time) => (
//                 <View key={time} style={styles.row}>
//                   <Text style={styles.timeText}>{time}</Text>

//                   {days.map((day) => renderCell(day, time))}
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* BUTTONS */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
//               <Text style={styles.primaryText}>Save</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.secondaryBtn}
//               onPress={() => {
//                 setSchedule({});
//                 setTeachMode("full");
//                 setStartDate(null);
//                 setEndDate(null);
//               }}
//             >
//               <Text style={styles.secondaryText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* BOTTOM NAV */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="calendar-month" size={24} color={colors.primary} />
//           <Text style={styles.activeTab}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAddCourses")}
//         >
//           <Icon name="library-add" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Add Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentCourses")}
//         >
//           <Icon name="menu-book" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAllClasses")}
//         >
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Classes</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentHome;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   content: {
//     flex: 1,
//   },

//   // =========================================
//   // HEADER
//   // =========================================
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },

//   sideIcon: {
//     width: 40,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   logoImage: {
//     width: 85,
//     height: 45,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: colors.primary,
//     marginTop: -4,
//   },

//   // =========================================
//   // TITLE
//   // =========================================
//   welcome: {
//     fontSize: 16,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   // =========================================
//   // TOGGLE
//   // =========================================
//   toggleContainer: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     marginBottom: 16,
//     backgroundColor: "#EAECEF",
//     borderRadius: 12,
//     padding: 4,
//   },

//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   toggleActive: {
//     backgroundColor: colors.primary,
//   },

//   toggleText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#fff",
//   },

//   // =========================================
//   // DATE PICKER
//   // =========================================
//   dateBox: {
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },

//   // =========================================
//   // CARD
//   // =========================================
//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 8,
//     borderRadius: 12,
//     padding: 6,
//     elevation: 3,
//   },

//   // =========================================
//   // TABLE
//   // =========================================
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   timeHeader: {
//     width: 66,
//   },

//   dayHeader: {
//     flex: 1,
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: 11,
//     color: "#555",
//     marginBottom: 6,
//   },

//   timeText: {
//     width: 66,
//     fontSize: 10,
//     color: "#666",
//   },

//   cell: {
//     flex: 1,
//     aspectRatio: 1,
//     maxWidth: 32,
//     maxHeight: 32,
//     borderRadius: 6,
//     marginHorizontal: 1,
//     marginVertical: 2,
//     backgroundColor: "#ECF0F1",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   activeCell: {
//     backgroundColor: colors.primary,
//   },

//   // =========================================
//   // BUTTONS
//   // =========================================
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
//     elevation: 2,
//   },

//   secondaryBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#999",
//     backgroundColor: "#fff",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 8,
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   secondaryText: {
//     color: "#555",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // =========================================
//   // BOTTOM NAV
//   // =========================================
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fff",
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//   },

//   activeTab: {
//     fontSize: 11,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },

//   notificationContainer: {
//     position: "relative",
//   },

//   badge: {
//     position: "absolute",
//     top: -2,
//     right: 2,
//     minWidth: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: "#EF4444",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 4,
//   },

//   badgeText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
// });

















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
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const timeSlots = [
//   "8:00-9:00 am", "9:00-10:00 am", "10:00-11:00 am", "11:00-12:00 pm",
//   "12:00-1:00 pm", "1:00-2:00 pm", "2:00-3:00 pm", "3:00-4:00 pm",
//   "4:00-5:00 pm", "5:00-6:00 pm", "6:00-7:00 pm", "7:00-8:00 pm",
//   "8:00-9:00 pm", "9:00-10:00 pm",
// ];

// const StudentHome = ({ navigation }) => {
//   const [schedule, setSchedule] = useState({});
//   const [teachMode, setTeachMode] = useState("full");
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [showStartPicker, setShowStartPicker] = useState(false);
//   const [showEndPicker, setShowEndPicker] = useState(false);
//   const [notificationCount, setNotificationCount] = useState(0);

//   useEffect(() => {
//     fetchSchedule();
//     fetchNotificationCount();
//   }, []);

//   const fetchSchedule = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;

//       const response = await fetch(`${BASE_URL}/Student/get-student-schedules`, {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await response.json();
//       console.log("FETCHED STUDENT SCHEDULE:", data);

//       if (response.ok && Array.isArray(data)) {
//         const loadedSchedule = {};
//         data.forEach((item) => {
//           const key = `${item.day}-${item.time}`;
//           loadedSchedule[key] = true;
//         });
//         setSchedule(loadedSchedule);

//         const hasSpecificTime = data.some(
//           (x) => x.type?.toLowerCase() === "specific time"
//         );

//         if (hasSpecificTime) {
//           setTeachMode("specific");
//           if (data[0]?.startDate) setStartDate(new Date(data[0].startDate));
//           if (data[0]?.endDate) setEndDate(new Date(data[0].endDate));
//         } else {
//           setTeachMode("full");
//         }
//       }
//     } catch (error) {
//       console.log("FETCH SCHEDULE ERROR:", error);
//     }
//   };

//   const fetchNotificationCount = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) return;

//       const response = await fetch(`${BASE_URL}/Student/notification-badge-count`, {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await response.json();
//       console.log("Notification Count:", data);
//       if (response.ok) setNotificationCount(data.count || 0);
//     } catch (error) {
//       console.log("Notification Count Error:", error);
//     }
//   };

//   const toggleSlot = (day, time) => {
//     const key = `${day}-${time}`;
//     setSchedule((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const getSelectedSlots = () => {
//     const selected = [];
//     Object.keys(schedule).forEach((key) => {
//       if (schedule[key]) {
//         const parts = key.split("-");
//         const day = parts[0];
//         const time = parts.slice(1).join("-");
//         selected.push({ day, time });
//       }
//     });
//     return selected;
//   };

//   const handleSave = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");
//       if (!token) { Alert.alert("Error", "User not logged in"); return; }

//       const selectedSlots = getSelectedSlots();
//       if (selectedSlots.length === 0) {
//         Alert.alert("Error", "Please select schedule slots");
//         return;
//       }

//       if (teachMode === "specific" && (!startDate || !endDate)) {
//         Alert.alert("Error", "Please select start and end date");
//         return;
//       }

//       const payload = {
//         availabilityType: teachMode === "specific" ? "specific" : "full",
//         startDate: teachMode === "specific" ? startDate.toISOString() : null,
//         endDate: teachMode === "specific" ? endDate.toISOString() : null,
//         slots: selectedSlots,
//       };

//       console.log("SAVE PAYLOAD:", JSON.stringify(payload));

//       const response = await fetch(`${BASE_URL}/Student/save-student-schedule`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const text = await response.text();
//       console.log("RAW RESPONSE:", text);

//       let data = {};
//       try { data = text ? JSON.parse(text) : {}; }
//       catch { data = { message: text }; }

//       if (response.ok) {
//         Alert.alert("Success", data.message || "Schedule saved successfully");
//         await fetchSchedule();
//       } else {
//         Alert.alert("Error", data.message || "Failed to save schedule");
//       }
//     } catch (error) {
//       console.log("SAVE ERROR:", error);
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
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.sideIcon}
//           onPress={() => navigation.navigate("StudentDrawer")}
//         >
//           <Icon name="menu" size={28} color={colors.primary} />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={styles.notificationContainer}>
//           <TouchableOpacity
//             style={styles.sideIcon}
//             onPress={() => navigation.navigate("Notification")}
//           >
//             <Icon name="notifications" size={26} color={colors.primary} />
//           </TouchableOpacity>
//           {notificationCount > 0 && (
//             <View style={styles.badge}>
//               <Text style={styles.badgeText}>{notificationCount}</Text>
//             </View>
//           )}
//         </View>
//       </View>

//       {/* ✅ SCROLLVIEW wraps everything so buttons are never hidden */}
//       <ScrollView
//         contentContainerStyle={{ paddingBottom: 90 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.card}>
//           <Text style={styles.welcome}>Select Your Availability</Text>

//           {/* TOGGLE */}
//           <View style={styles.toggleContainer}>
//             <TouchableOpacity
//               style={[styles.toggleBtn, teachMode === "specific" && styles.toggleActive]}
//               onPress={() => setTeachMode("specific")}
//             >
//               <Text style={styles.toggleText}>Learn for specific time</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.toggleBtn, teachMode === "full" && styles.toggleActive]}
//               onPress={() => setTeachMode("full")}
//             >
//               <Text style={styles.toggleText}>Learn Full Time</Text>
//             </TouchableOpacity>
//           </View>

//           {/* DATE PICKERS */}
//           {teachMode === "specific" && (
//             <View style={{ marginHorizontal: 16 }}>
//               <TouchableOpacity
//                 style={styles.dateBox}
//                 onPress={() => setShowStartPicker(true)}
//               >
//                 <Text>{startDate ? startDate.toDateString() : "Select Start Date"}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.dateBox}
//                 onPress={() => setShowEndPicker(true)}
//               >
//                 <Text>{endDate ? endDate.toDateString() : "Select End Date"}</Text>
//               </TouchableOpacity>

//               {showStartPicker && (
//                 <DateTimePicker
//                   value={startDate || new Date()}
//                   mode="date"
//                   display="calendar"
//                   onChange={(e, date) => {
//                     setShowStartPicker(false);
//                     if (date) setStartDate(date);
//                   }}
//                 />
//               )}

//               {showEndPicker && (
//                 <DateTimePicker
//                   value={endDate || new Date()}
//                   mode="date"
//                   display="calendar"
//                   onChange={(e, date) => {
//                     setShowEndPicker(false);
//                     if (date) setEndDate(date);
//                   }}
//                 />
//               )}
//             </View>
//           )}

//           {/* TABLE */}
//           <View style={styles.tableCard}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               <View>
//                 <View style={styles.row}>
//                   <View style={styles.timeHeader} />
//                   {days.map((day) => (
//                     <Text key={day} style={styles.dayHeader}>{day}</Text>
//                   ))}
//                 </View>

//                 {timeSlots.map((time) => (
//                   <View key={time} style={styles.row}>
//                     <Text style={styles.timeText}>{time}</Text>
//                     {days.map((day) => renderCell(day, time))}
//                   </View>
//                 ))}
//               </View>
//             </ScrollView>
//           </View>

//           {/* ✅ BUTTONS always rendered, never hidden */}
//           <View style={styles.buttonRow}>
//             <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
//               <Text style={styles.primaryText}>Save</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.secondaryBtn}
//               onPress={() => {
//                 setSchedule({});
//                 setTeachMode("full");
//                 setStartDate(null);
//                 setEndDate(null);
//               }}
//             >
//               <Text style={styles.secondaryText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </ScrollView>

//       {/* BOTTOM NAV */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="calendar-month" size={24} color={colors.primary} />
//           <Text style={styles.activeTab}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAddCourses")}
//         >
//           <Icon name="library-add" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Add Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentCourses")}
//         >
//           <Icon name="menu-book" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAllClasses")}
//         >
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Classes</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentHome;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F4F6F9" },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   sideIcon: { width: 40, alignItems: "center", justifyContent: "center" },
//   headerCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
//   logoImage: { width: 85, height: 45, resizeMode: "contain" },
//   logoText: { fontSize: 13, fontWeight: "700", color: colors.primary, marginTop: -4 },

//   welcome: {
//     fontSize: 16, marginHorizontal: 16, marginTop: 12,
//     marginBottom: 10, fontWeight: "600", color: colors.primary,
//   },

//   toggleContainer: {
//     flexDirection: "row", marginHorizontal: 16, marginBottom: 16,
//     backgroundColor: "#EAECEF", borderRadius: 12, padding: 4,
//   },
//   toggleBtn: {
//     flex: 1, paddingVertical: 12, borderRadius: 10,
//     alignItems: "center", justifyContent: "center",
//   },
//   toggleActive: { backgroundColor: colors.primary },
//   toggleText: { fontSize: 13, fontWeight: "600", color: "#fff" },

//   dateBox: {
//     backgroundColor: "#fff", paddingVertical: 14, paddingHorizontal: 16,
//     borderRadius: 10, marginBottom: 12, elevation: 2,
//     borderWidth: 1, borderColor: "#E5E7EB",
//   },

//   card: {
//     backgroundColor: "#fff", marginHorizontal: 8, marginTop: 8,
//     borderRadius: 12, padding: 6, elevation: 3,
//   },
//   // ✅ Renamed inner table card to avoid style conflict
//   tableCard: {
//     backgroundColor: "#fff", borderRadius: 12,
//     padding: 6, elevation: 1, marginTop: 4,
//   },

//   row: { flexDirection: "row", alignItems: "center" },
//   timeHeader: { width: 70 },
//   dayHeader: {
//     width: 38, textAlign: "center", fontWeight: "600",
//     fontSize: 12, color: "#555", marginBottom: 6,
//   },
//   timeText: { width: 70, fontSize: 11, color: "#666" },
//   cell: {
//     width: 38, height: 32, borderRadius: 6, margin: 2,
//     backgroundColor: "#ECF0F1", justifyContent: "center", alignItems: "center",
//   },
//   activeCell: { backgroundColor: colors.primary },

//   buttonRow: {
//     flexDirection: "row", justifyContent: "space-between",
//     marginHorizontal: 16, marginTop: 20, marginBottom: 16,
//   },
//   primaryBtn: {
//     flex: 1, backgroundColor: colors.primary, paddingVertical: 12,
//     borderRadius: 8, alignItems: "center", marginRight: 8, elevation: 2,
//   },
//   secondaryBtn: {
//     flex: 1, borderWidth: 1, borderColor: "#999", backgroundColor: "#fff",
//     paddingVertical: 12, borderRadius: 8, alignItems: "center", marginLeft: 8,
//   },
//   primaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
//   secondaryText: { color: "#555", fontWeight: "600", fontSize: 14 },

//   bottomNav: {
//     flexDirection: "row", justifyContent: "space-around", alignItems: "center",
//     paddingVertical: 10, borderTopWidth: 1, borderColor: "#eee",
//     backgroundColor: "#fff", position: "absolute", bottom: 0, width: "100%",
//   },
//   navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
//   activeTab: { fontSize: 11, color: colors.primary, fontWeight: "600", marginTop: 2 },
//   inactiveTab: { fontSize: 11, color: "#999", marginTop: 2 },

//   notificationContainer: { position: "relative" },
//   badge: {
//     position: "absolute", top: -2, right: 2, minWidth: 18, height: 18,
//     borderRadius: 9, backgroundColor: "#EF4444",
//     justifyContent: "center", alignItems: "center", paddingHorizontal: 4,
//   },
//   badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
// });

















//New 
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
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const days = [
//   "Mon",
//   "Tue",
//   "Wed",
//   "Thu",
//   "Fri",
//   "Sat",
//   "Sun",
// ];

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

// const StudentHome = ({ navigation }) => {
//   // =========================================
//   // STATES
//   // =========================================
//   const [schedule, setSchedule] = useState({});
//   const [teachMode, setTeachMode] = useState("full");

//   const [startDate, setStartDate] =useState(null);

//   const [endDate, setEndDate] =useState(null);

//   const [showStartPicker,setShowStartPicker] = useState(false);

//   const [showEndPicker,setShowEndPicker] = useState(false);

//   const [notificationCount, setNotificationCount] = useState(0);

//   // =========================================
//   // LOAD SCHEDULE
//   // =========================================
//   useEffect(() => {
//   fetchSchedule();
//   fetchNotificationCount();
// }, []);

//   // =========================================
//   // FETCH SCHEDULE
//   // =========================================
//   const fetchSchedule = async () => {
//     try {
//       const token =
//         await AsyncStorage.getItem("token");

//       if (!token) return;

//       const response = await fetch(
//         `${BASE_URL}/Student/get-student-schedules`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       console.log(
//         "FETCHED STUDENT SCHEDULE:",
//         data
//       );

//       if (response.ok && Array.isArray(data)) {
//         const loadedSchedule = {};

//         data.forEach((item) => {
//           const key =
//             `${item.day}-${item.time}`;

//           loadedSchedule[key] = true;
//         });

//         setSchedule(loadedSchedule);

//         const hasSpecificTime = data.some(
//           (x) =>
//             x.type?.toLowerCase() ===
//             "specific time"
//         );

//         if (hasSpecificTime) {
//           setTeachMode("specific");

//           if (data[0]?.startDate) {
//             setStartDate(
//               new Date(data[0].startDate)
//             );
//           }

//           if (data[0]?.endDate) {
//             setEndDate(
//               new Date(data[0].endDate)
//             );
//           }
//         } else {
//           setTeachMode("full");
//         }
//       }
//     } catch (error) {
//       console.log(
//         "FETCH SCHEDULE ERROR:",
//         error
//       );
//     }
//   };


//   const fetchNotificationCount = async () => {
//   try {
//     const token = await AsyncStorage.getItem("token");

//     if (!token) return;

//     const response = await fetch(
//       `${BASE_URL}/Student/notification-badge-count`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     const data = await response.json();

//     console.log("Notification Count:", data);

//     if (response.ok) {
//       setNotificationCount(data.count || 0);
//     }
//   } catch (error) {
//     console.log(
//       "Notification Count Error:",
//       error
//     );
//   }
// };

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

//         const time =
//           parts.slice(1).join("-");

//         selected.push({
//           day,
//           time,
//         });
//       }
//     });

//     return selected;
//   };

//   // =========================================
//   // SAVE
//   // =========================================
//   const handleSave = async () => {
//     try {
//       const token =
//         await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert(
//           "Error",
//           "User not logged in"
//         );

//         return;
//       }

//       const selectedSlots =
//         getSelectedSlots();

//       if (selectedSlots.length === 0) {
//         Alert.alert(
//           "Error",
//           "Please select schedule slots"
//         );

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

//       const payload = {
//         availabilityType:
//           teachMode === "specific"
//             ? "specific"
//             : "full",

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
//         `${BASE_URL}/Student/save-student-schedule`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",

//             Authorization:
//               `Bearer ${token}`,
//           },

//           body: JSON.stringify(payload),
//         }
//       );

//       const text =
//         await response.text();

//       console.log(
//         "RAW RESPONSE:",
//         text
//       );

//       let data = {};

//       try {
//         data = text
//           ? JSON.parse(text)
//           : {};
//       } catch {
//         data = { message: text };
//       }

//       if (response.ok) {
//         Alert.alert(
//           "Success",
//           data.message ||
//             "Schedule saved successfully"
//         );

//         await fetchSchedule();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message ||
//             "Failed to save schedule"
//         );
//       }
//     } catch (error) {
//       console.log(
//         "SAVE ERROR:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error.message
//       );
//     }
//   };

//   // =========================================
//   // RENDER CELL
//   // =========================================
//   const renderCell = (day, time) => {
//     const key = `${day}-${time}`;

//     const selected = schedule[key];

//     return (
//       <TouchableOpacity
//         key={key}
//         style={[
//           styles.cell,
//           selected &&
//             styles.activeCell,
//         ]}
//         onPress={() =>
//           toggleSlot(day, time)
//         }
//       >
//         {selected && (
//           <Icon
//             name="check"
//             size={14}
//             color="#fff"
//           />
//         )}
//       </TouchableOpacity>
//     );
//   };

//   return (
//   <SafeAreaView style={styles.container}>
//     {/* HEADER */}
//     <View style={styles.header}>
//       <TouchableOpacity
//         style={styles.sideIcon}
//         onPress={() =>
//           navigation.navigate("StudentDrawer")
//         }
//       >
//         <Icon
//           name="menu"
//           size={28}
//           color={colors.primary}
//         />
//       </TouchableOpacity>

//       <View style={styles.headerCenter}>
//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logoImage}
//         />
//         <Text style={styles.logoText}>
//           House of Tutor
//         </Text>
//       </View>

//       <View style={styles.notificationContainer}>
//         <TouchableOpacity
//           style={styles.sideIcon}
//           onPress={() =>
//             navigation.navigate("Notification")
//           }
//         >
//           <Icon
//             name="notifications"
//             size={26}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         {notificationCount > 0 && (
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>
//               {notificationCount}
//             </Text>
//           </View>
//         )}
//       </View>
//     </View>

//     {/* MAIN CONTENT */}
//     <ScrollView
//       style={{ flex: 1 }}
//       contentContainerStyle={{
//         paddingBottom: 120,
//       }}
//       showsVerticalScrollIndicator={false}
//     >
//       <View style={styles.card}>
//         <Text style={styles.welcome}>
//           Select Your Availability
//         </Text>

//         {/* TOGGLE */}
//         <View style={styles.toggleContainer}>
//           <TouchableOpacity
//             style={[
//               styles.toggleBtn,
//               teachMode === "specific" &&
//                 styles.toggleActive,
//             ]}
//             onPress={() =>
//               setTeachMode("specific")
//             }
//           >
//             <Text style={styles.toggleText}>
//               Learn for specific time
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.toggleBtn,
//               teachMode === "full" &&
//                 styles.toggleActive,
//             ]}
//             onPress={() =>
//               setTeachMode("full")
//             }
//           >
//             <Text style={styles.toggleText}>
//               Learn Full Time
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* DATE PICKERS */}
//         {teachMode === "specific" && (
//           <View
//             style={{
//               marginHorizontal: 16,
//             }}
//           >
//             <TouchableOpacity
//               style={styles.dateBox}
//               onPress={() =>
//                 setShowStartPicker(true)
//               }
//             >
//               <Text>
//                 {startDate
//                   ? startDate.toDateString()
//                   : "Select Start Date"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dateBox}
//               onPress={() =>
//                 setShowEndPicker(true)
//               }
//             >
//               <Text>
//                 {endDate
//                   ? endDate.toDateString()
//                   : "Select End Date"}
//               </Text>
//             </TouchableOpacity>

//             {showStartPicker && (
//               <DateTimePicker
//                 value={
//                   startDate ||
//                   new Date()
//                 }
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
//                 value={
//                   endDate ||
//                   new Date()
//                 }
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

//         {/* TABLE */}
//         <View style={styles.card}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={
//               false
//             }
//           >
//             <View>
//               <View style={styles.row}>
//                 <View
//                   style={styles.timeHeader}
//                 />

//                 {days.map((day) => (
//                   <Text
//                     key={day}
//                     style={
//                       styles.dayHeader
//                     }
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
//                   <Text
//                     style={
//                       styles.timeText
//                     }
//                   >
//                     {time}
//                   </Text>

//                   {days.map((day) =>
//                     renderCell(day, time)
//                   )}
//                 </View>
//               ))}
//             </View>
//           </ScrollView>
//         </View>

//         {/* BUTTONS */}
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
//               setTeachMode("full");
//               setStartDate(null);
//               setEndDate(null);
//             }}
//           >
//             <Text
//               style={styles.secondaryText}
//             >
//               Cancel
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>

//     {/* BOTTOM NAV */}
//     <View style={styles.bottomNav}>
//       <TouchableOpacity
//         style={styles.navItem}
//       >
//         <Icon
//           name="calendar-month"
//           size={24}
//           color={colors.primary}
//         />
//         <Text style={styles.activeTab}>
//           Schedule
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navItem}
//         onPress={() =>
//           navigation.navigate(
//             "StudentAddCourses"
//           )
//         }
//       >
//         <Icon
//           name="library-add"
//           size={24}
//           color="#999"
//         />
//         <Text style={styles.inactiveTab}>
//           Add Courses
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navItem}
//         onPress={() =>
//           navigation.navigate(
//             "StudentCourses"
//           )
//         }
//       >
//         <Icon
//           name="menu-book"
//           size={24}
//           color="#999"
//         />
//         <Text style={styles.inactiveTab}>
//           Courses
//         </Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.navItem}
//         onPress={() =>
//           navigation.navigate(
//             "StudentAllClasses"
//           )
//         }
//       >
//         <Icon
//           name="school"
//           size={24}
//           color="#999"
//         />
//         <Text style={styles.inactiveTab}>
//           Classes
//         </Text>
//       </TouchableOpacity>
//     </View>
//   </SafeAreaView>
// );
// };
// export default StudentHome;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   content: {
//     flex: 1,
//   },

//   // =========================================
//   // HEADER
//   // =========================================
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     elevation: 4,

//     shadowColor: "#000",

//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },

//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },

//   sideIcon: {
//     width: 40,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerCenter: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   logoImage: {
//     width: 85,
//     height: 45,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: colors.primary,
//     marginTop: -4,
//   },

//   // =========================================
//   // TITLE
//   // =========================================
//   welcome: {
//     fontSize: 16,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   // =========================================
//   // TOGGLE
//   // =========================================
//   toggleContainer: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     marginBottom: 16,
//     backgroundColor: "#EAECEF",
//     borderRadius: 12,
//     padding: 4,
//   },

//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   toggleActive: {
//     backgroundColor: colors.primary,
//   },

//   toggleText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#fff",
//   },

//   // =========================================
//   // DATE PICKER
//   // =========================================
//   dateBox: {
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },

//   // =========================================
//   // CARD
//   // =========================================
//   card: {
//   backgroundColor: "#fff",
//   marginHorizontal: 8,
//   borderRadius: 12,
//   padding: 6,
//   elevation: 3,
//   },
//   // =========================================
//   // TABLE
//   // =========================================
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   timeHeader: {
//     width: 70,
//   },

//   dayHeader: {
//     width: 38,
//     textAlign: "center",
//     fontWeight: "600",
//     fontSize: 12,
//     color: "#555",
//     marginBottom: 6,
//   },

//   timeText: {
//     width: 70,
//     fontSize: 11,
//     color: "#666",
//   },

//   cell: {
//     width: 38,
//     height: 32,
//     borderRadius: 6,
//     margin: 2,
//     backgroundColor: "#ECF0F1",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   activeCell: {
//     backgroundColor: colors.primary,
//   },

//   // =========================================
//   // BUTTONS
//   // =========================================
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
//     elevation: 2,
//   },

//   secondaryBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#999",
//     backgroundColor: "#fff",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 8,
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   secondaryText: {
//     color: "#555",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // =========================================
//   // BOTTOM NAV
//   // =========================================
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fff",
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//   },

//   activeTab: {
//     fontSize: 11,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },
//   notificationContainer: {
//   position: "relative",
// },

// badge: {
//   position: "absolute",
//   top: -2,
//   right: 2,
//   minWidth: 18,
//   height: 18,
//   borderRadius: 9,
//   backgroundColor: "#EF4444",
//   justifyContent: "center",
//   alignItems: "center",
//   paddingHorizontal: 4,
// },

// badgeText: {
//   color: "#fff",
//   fontSize: 10,
//   fontWeight: "bold",
// },
// });


















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//  ScrollView,
//   Image,
//   Alert,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const days = [
//   "Mon",
//   "Tue",
//   "Wed",
//   "Thu",
//   "Fri",
//   "Sat",
//   "Sun",
// ];

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

// const StudentHome = ({ navigation }) => {

//   // =========================================
//   // STATES
//   // =========================================
//   const [schedule, setSchedule] = useState({});

//   const [teachMode, setTeachMode] =
//     useState("full");

//   const [startDate, setStartDate] =
//     useState(null);

//   const [endDate, setEndDate] =
//     useState(null);

//   const [showStartPicker,
//     setShowStartPicker] = useState(false);

//   const [showEndPicker,
//     setShowEndPicker] = useState(false);

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

//       const token =
//         await AsyncStorage.getItem("token");

//       if (!token) return;

//       const response = await fetch(
//         `${BASE_URL}/Student/get-student-schedules`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       console.log(
//         "FETCHED STUDENT SCHEDULE:",
//         data
//       );

//       if (response.ok && Array.isArray(data)) {

//         const loadedSchedule = {};

//         data.forEach((item) => {

//           const key =
//             `${item.day}-${item.time}`;

//           loadedSchedule[key] = true;
//         });

//         setSchedule(loadedSchedule);

//         // =====================================
//         // CHECK TYPE
//         // =====================================
//         const hasSpecificTime = data.some(
//           (x) =>
//             x.type?.toLowerCase() ===
//             "specific time"
//         );

//         if (hasSpecificTime) {

//           setTeachMode("specific");

//           if (data[0]?.startDate) {

//             setStartDate(
//               new Date(data[0].startDate)
//             );
//           }

//           if (data[0]?.endDate) {

//             setEndDate(
//               new Date(data[0].endDate)
//             );
//           }

//         } else {

//           setTeachMode("full");
//         }
//       }

//     } catch (error) {

//       console.log(
//         "FETCH SCHEDULE ERROR:",
//         error
//       );
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

//         const time =
//           parts.slice(1).join("-");

//         selected.push({
//           day,
//           time,
//         });
//       }
//     });

//     return selected;
//   };

//   // =========================================
//   // SAVE
//   // =========================================
//   const handleSave = async () => {

//     try {

//       const token =
//         await AsyncStorage.getItem("token");

//       if (!token) {

//         Alert.alert(
//           "Error",
//           "User not logged in"
//         );

//         return;
//       }

//       const selectedSlots =
//         getSelectedSlots();

//       // =====================================
//       // VALIDATION
//       // =====================================
//       if (selectedSlots.length === 0) {

//         Alert.alert(
//           "Error",
//           "Please select schedule slots"
//         );

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

//         availabilityType:
//           teachMode === "specific"
//             ? "specific"
//             : "full",

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
//         `${BASE_URL}/Student/save-student-schedule`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",

//             Authorization:
//               `Bearer ${token}`,
//           },

//           body: JSON.stringify(payload),
//         }
//       );

//       const text =
//         await response.text();

//       console.log(
//         "RAW RESPONSE:",
//         text
//       );

//       let data = {};

//       try {

//         data = text
//           ? JSON.parse(text)
//           : {};

//       } catch {

//         data = { message: text };
//       }

//       if (response.ok) {

//         Alert.alert(
//           "Success",
//           data.message ||
//             "Schedule saved successfully"
//         );

//         // REFRESH
//         await fetchSchedule();

//       } else {

//         Alert.alert(
//           "Error",
//           data.message ||
//             "Failed to save schedule"
//         );
//       }

//     } catch (error) {

//       console.log(
//         "SAVE ERROR:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error.message
//       );
//     }
//   };

//   // =========================================
//   // RENDER CELL
//   // =========================================
//   const renderCell = (day, time) => {

//     const key = `${day}-${time}`;

//     const selected = schedule[key];

//     return (
//       <TouchableOpacity
//         key={key}
//         style={[
//           styles.cell,
//           selected &&
//           styles.activeCell,
//         ]}
//         onPress={() =>
//           toggleSlot(day, time)
//         }
//       >
//         {selected && (
//           <Icon
//             name="check"
//             size={14}
//             color="#fff"
//           />
//         )}
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* HEADER */}
//       <View style={styles.header}>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.navigate(
//               "StudentDrawer"
//             )
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

//           <TouchableOpacity
//             style={styles.iconBtn}
//             onPress={() => navigation.navigate("Notification")}
//           >
//             <Icon name="notifications" size={26} color="#000" />
//           </TouchableOpacity>
        
//         <View style={{ width: 26 }} />
//       </View>

//       <ScrollView
//         style={styles.content}
//         contentContainerStyle={{
//           paddingBottom: 120,
//         }}
//       >

//         <Text style={styles.welcome}>
//           Select Your Availability
//         </Text>

//         {/* TOGGLE */}
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
//               Learn for specific time
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
//               Learn Full Time
//             </Text>
//           </TouchableOpacity>

//         </View>

//         {/* DATE PICKERS */}
//         {teachMode === "specific" && (

//           <View
//             style={{
//               marginHorizontal: 16,
//             }}
//           >

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
//                 value={
//                   startDate ||
//                   new Date()
//                 }

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
//                 value={
//                   endDate ||
//                   new Date()
//                 }

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

//         {/* TABLE */}
//         <View style={styles.card}>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//           >

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

//           </ScrollView>

//         </View>

//         {/* BUTTONS */}
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

//               setTeachMode("full");

//               setStartDate(null);

//               setEndDate(null);
//             }}
//           >
//             <Text style={styles.secondaryText}>
//               Cancel
//             </Text>
//           </TouchableOpacity>

//         </View>

//       </ScrollView>

//       {/* BOTTOM NAV */}
//       <View style={styles.bottomNav}>

//         <TouchableOpacity
//           style={styles.navItem}
//         >
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
//               "StudentAddCourses"
//             )
//           }
//         >
//           <Icon
//             name="library-add"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.inactiveTab}>
//             Add Courses
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "StudentCourses"
//             )
//           }
//         >
//           <Icon
//             name="menu-book"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.inactiveTab}>
//             Courses
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate(
//               "StudentAllClasses"
//             )
//           }
//         >
//           <Icon
//             name="school"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.inactiveTab}>
//             Classes
//           </Text>
//         </TouchableOpacity>

//       </View>

//     </SafeAreaView>
//   );
// };

// export default StudentHome;

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   content: {
//     flex: 1,
//   },

//   // =========================================
//   // HEADER
//   // =========================================
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

//   // =========================================
//   // TITLE
//   // =========================================
//   welcome: {
//     fontSize: 16,
//     marginHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 10,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   // =========================================
//   // TOGGLE
//   // =========================================
//   toggleContainer: {
//     flexDirection: "row",
//     marginHorizontal: 16,
//     marginBottom: 16,
//     backgroundColor: "#EAECEF",
//     borderRadius: 12,
//     padding: 4,
//   },

//   toggleBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   toggleActive: {
//     backgroundColor: colors.primary,
//   },

//   toggleText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#fff",
//   },

//   // =========================================
//   // DATE PICKER
//   // =========================================
//   dateBox: {
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },

//   // =========================================
//   // CARD
//   // =========================================
//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 12,
//     borderRadius: 12,
//     padding: 10,
//     elevation: 3,
//   },

//   // =========================================
//   // TABLE
//   // =========================================
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
//     marginBottom: 6,
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
//     backgroundColor: "#ECF0F1",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   activeCell: {
//     backgroundColor: colors.primary,
//   },

//   // =========================================
//   // BUTTONS
//   // =========================================
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
//     elevation: 2,
//   },

//   secondaryBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#999",
//     backgroundColor: "#fff",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginLeft: 8,
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   secondaryText: {
//     color: "#555",
//     fontWeight: "600",
//     fontSize: 14,
//   },

//   // =========================================
//   // BOTTOM NAV
//   // =========================================
//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fff",
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//   },

//   activeTab: {
//     fontSize: 11,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },
//   iconBtn: {
//     marginRight: 15,
//   },
// });

















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

// const StudentHome = ({ navigation }) => {
//   const [schedule, setSchedule] = useState({});

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
//         selected.push({ day, time });
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

//       const response = await fetch(
//         `${BASE_URL}/Student/save-student-schedule`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ slots }),
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", data.message || "Schedule saved successfully");
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
//     <SafeAreaView style={styles.container}>

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.navigate("StudentDrawer")}>
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
//         style={{ flex: 1 }}
//         contentContainerStyle={{ paddingBottom: 120 }}
//         showsVerticalScrollIndicator={false}
//       >
//         <Text style={styles.welcome}>Select Your Availability</Text>

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

//       <View style={styles.bottomNav}>
//         {/* Schedule */}
//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="calendar-today" size={24} color={colors.primary} />
//           <Text style={styles.navTextActive}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAddCourses")}
//         >
//           <Icon name="library-add" size={24} color="#999" />
//           <Text style={styles.navText}>Add Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentCourses")}
//         >
//           <Icon name="menu-book" size={24} color="#999" />
//           <Text style={styles.navText}>Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAllClasses")}
//         >
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.navText}>Classes</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default StudentHome;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
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
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderColor: "#eee",
//     backgroundColor: "#fff",
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     flex: 1,
//   },

//   navText: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },

//   navTextActive: {
//     fontSize: 11,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },
// });