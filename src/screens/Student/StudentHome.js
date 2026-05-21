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
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const days = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

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
  // STATES
  // =========================================
  const [schedule, setSchedule] = useState({});

  const [teachMode, setTeachMode] =
    useState("full");

  const [startDate, setStartDate] =
    useState(null);

  const [endDate, setEndDate] =
    useState(null);

  const [showStartPicker,
    setShowStartPicker] = useState(false);

  const [showEndPicker,
    setShowEndPicker] = useState(false);

  // =========================================
  // LOAD SCHEDULE
  // =========================================
  useEffect(() => {
    fetchSchedule();
  }, []);

  // =========================================
  // FETCH SCHEDULE
  // =========================================
  const fetchSchedule = async () => {

    try {

      const token =
        await AsyncStorage.getItem("token");

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

      console.log(
        "FETCHED STUDENT SCHEDULE:",
        data
      );

      if (response.ok && Array.isArray(data)) {

        const loadedSchedule = {};

        data.forEach((item) => {

          const key =
            `${item.day}-${item.time}`;

          loadedSchedule[key] = true;
        });

        setSchedule(loadedSchedule);

        // =====================================
        // CHECK TYPE
        // =====================================
        const hasSpecificTime = data.some(
          (x) =>
            x.type?.toLowerCase() ===
            "specific time"
        );

        if (hasSpecificTime) {

          setTeachMode("specific");

          if (data[0]?.startDate) {

            setStartDate(
              new Date(data[0].startDate)
            );
          }

          if (data[0]?.endDate) {

            setEndDate(
              new Date(data[0].endDate)
            );
          }

        } else {

          setTeachMode("full");
        }
      }

    } catch (error) {

      console.log(
        "FETCH SCHEDULE ERROR:",
        error
      );
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

        const day = parts[0];

        const time =
          parts.slice(1).join("-");

        selected.push({
          day,
          time,
        });
      }
    });

    return selected;
  };

  // =========================================
  // SAVE
  // =========================================
  const handleSave = async () => {

    try {

      const token =
        await AsyncStorage.getItem("token");

      if (!token) {

        Alert.alert(
          "Error",
          "User not logged in"
        );

        return;
      }

      const selectedSlots =
        getSelectedSlots();

      // =====================================
      // VALIDATION
      // =====================================
      if (selectedSlots.length === 0) {

        Alert.alert(
          "Error",
          "Please select schedule slots"
        );

        return;
      }

      if (teachMode === "specific") {

        if (!startDate || !endDate) {

          Alert.alert(
            "Error",
            "Please select start and end date"
          );

          return;
        }
      }

      // =====================================
      // PAYLOAD
      // =====================================
      const payload = {

        availabilityType:
          teachMode === "specific"
            ? "specific"
            : "full",

        startDate:
          teachMode === "specific"
            ? startDate.toISOString()
            : null,

        endDate:
          teachMode === "specific"
            ? endDate.toISOString()
            : null,

        slots: selectedSlots,
      };

      console.log(
        "SAVE PAYLOAD:",
        JSON.stringify(payload)
      );

      const response = await fetch(
        `${BASE_URL}/Student/save-student-schedule`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      const text =
        await response.text();

      console.log(
        "RAW RESPONSE:",
        text
      );

      let data = {};

      try {

        data = text
          ? JSON.parse(text)
          : {};

      } catch {

        data = { message: text };
      }

      if (response.ok) {

        Alert.alert(
          "Success",
          data.message ||
            "Schedule saved successfully"
        );

        // REFRESH
        await fetchSchedule();

      } else {

        Alert.alert(
          "Error",
          data.message ||
            "Failed to save schedule"
        );
      }

    } catch (error) {

      console.log(
        "SAVE ERROR:",
        error
      );

      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  // =========================================
  // RENDER CELL
  // =========================================
  const renderCell = (day, time) => {

    const key = `${day}-${time}`;

    const selected = schedule[key];

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.cell,
          selected &&
          styles.activeCell,
        ]}
        onPress={() =>
          toggleSlot(day, time)
        }
      >
        {selected && (
          <Icon
            name="check"
            size={14}
            color="#fff"
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              "StudentDrawer"
            )
          }
        >
          <Icon
            name="menu"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >

        <Text style={styles.welcome}>
          Select Your Availability
        </Text>

        {/* TOGGLE */}
        <View style={styles.toggleContainer}>

          <TouchableOpacity
            style={[
              styles.toggleBtn,

              teachMode === "specific" &&
              styles.toggleActive,
            ]}
            onPress={() =>
              setTeachMode("specific")
            }
          >
            <Text style={styles.toggleText}>
              Learn for specific time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,

              teachMode === "full" &&
              styles.toggleActive,
            ]}
            onPress={() =>
              setTeachMode("full")
            }
          >
            <Text style={styles.toggleText}>
              Learn Full Time
            </Text>
          </TouchableOpacity>

        </View>

        {/* DATE PICKERS */}
        {teachMode === "specific" && (

          <View
            style={{
              marginHorizontal: 16,
            }}
          >

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() =>
                setShowStartPicker(true)
              }
            >
              <Text>
                {
                  startDate
                    ? startDate.toDateString()
                    : "Select Start Date"
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateBox}
              onPress={() =>
                setShowEndPicker(true)
              }
            >
              <Text>
                {
                  endDate
                    ? endDate.toDateString()
                    : "Select End Date"
                }
              </Text>
            </TouchableOpacity>

            {showStartPicker && (

              <DateTimePicker
                value={
                  startDate ||
                  new Date()
                }

                mode="date"

                display="calendar"

                onChange={(e, date) => {

                  setShowStartPicker(false);

                  if (date) {

                    setStartDate(date);
                  }
                }}
              />
            )}

            {showEndPicker && (

              <DateTimePicker
                value={
                  endDate ||
                  new Date()
                }

                mode="date"

                display="calendar"

                onChange={(e, date) => {

                  setShowEndPicker(false);

                  if (date) {

                    setEndDate(date);
                  }
                }}
              />
            )}

          </View>
        )}

        {/* TABLE */}
        <View style={styles.card}>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            <View>

              <View style={styles.row}>

                <View style={styles.timeHeader} />

                {days.map((day) => (

                  <Text
                    key={day}
                    style={styles.dayHeader}
                  >
                    {day}
                  </Text>

                ))}

              </View>

              {timeSlots.map((time) => (

                <View
                  key={time}
                  style={styles.row}
                >

                  <Text style={styles.timeText}>
                    {time}
                  </Text>

                  {days.map((day) =>
                    renderCell(day, time)
                  )}

                </View>
              ))}

            </View>

          </ScrollView>

        </View>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleSave}
          >
            <Text style={styles.primaryText}>
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {

              setSchedule({});

              setTeachMode("full");

              setStartDate(null);

              setEndDate(null);
            }}
          >
            <Text style={styles.secondaryText}>
              Cancel
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>

        <TouchableOpacity
          style={styles.navItem}
        >
          <Icon
            name="calendar-month"
            size={24}
            color={colors.primary}
          />

          <Text style={styles.activeTab}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "StudentAddCourses"
            )
          }
        >
          <Icon
            name="library-add"
            size={24}
            color="#999"
          />

          <Text style={styles.inactiveTab}>
            Add Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "StudentCourses"
            )
          }
        >
          <Icon
            name="menu-book"
            size={24}
            color="#999"
          />

          <Text style={styles.inactiveTab}>
            Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "StudentAllClasses"
            )
          }
        >
          <Icon
            name="school"
            size={24}
            color="#999"
          />

          <Text style={styles.inactiveTab}>
            Classes
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default StudentHome;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  content: {
    flex: 1,
  },

  // =========================================
  // HEADER
  // =========================================
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

  // =========================================
  // TITLE
  // =========================================
  welcome: {
    fontSize: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    fontWeight: "600",
    color: colors.primary,
  },

  // =========================================
  // TOGGLE
  // =========================================
  toggleContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#EAECEF",
    borderRadius: 12,
    padding: 4,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  toggleActive: {
    backgroundColor: colors.primary,
  },

  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },

  // =========================================
  // DATE PICKER
  // =========================================
  dateBox: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  // =========================================
  // CARD
  // =========================================
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },

  // =========================================
  // TABLE
  // =========================================
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeHeader: {
    width: 95,
  },

  dayHeader: {
    width: 55,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
    color: "#555",
    marginBottom: 6,
  },

  timeText: {
    width: 95,
    fontSize: 11,
    color: "#666",
  },

  cell: {
    width: 55,
    height: 38,
    borderRadius: 6,
    margin: 2,
    backgroundColor: "#ECF0F1",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCell: {
    backgroundColor: colors.primary,
  },

  // =========================================
  // BUTTONS
  // =========================================
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 20,
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
    elevation: 2,
  },

  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#999",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  secondaryText: {
    color: "#555",
    fontWeight: "600",
    fontSize: 14,
  },

  // =========================================
  // BOTTOM NAV
  // =========================================
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  activeTab: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },

  inactiveTab: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

});

















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