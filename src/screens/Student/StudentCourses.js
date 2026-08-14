// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   Image,
//   SafeAreaView,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";
// import colors from "../utils/colors";
// import { Picker } from "@react-native-picker/picker";
// import Icon from "react-native-vector-icons/MaterialIcons";

// const StudentCourses = ({ navigation }) => {
//   const [subjects, setSubjects] = useState([]);
//   const [times, setTimes] = useState([]);
//   const [selectedTime, setSelectedTime] = useState("");
//   const [loading, setLoading] = useState(true);

//   const [userLat, setUserLat] = useState(null);
//   const [userLng, setUserLng] = useState(null);

//   const loadLocation = async () => {
//     try {
//       const lat = await AsyncStorage.getItem("latitude");
//       const lng = await AsyncStorage.getItem("longitude");

//       if (lat && lng) {
//         setUserLat(parseFloat(lat));
//         setUserLng(parseFloat(lng));
//       }
//     } catch (err) {
//       console.log("Location error:", err);
//     }
//   };

//   // const fetchSchedule = async () => {
//   //   try {
//   //     const token = await AsyncStorage.getItem("token");

//   //     const res = await fetch(`${BASE_URL}/Student/get-student-schedule`, {
//   //       headers: { Authorization: `Bearer ${token}` },
//   //     });

//   //     const data = await res.json();

//   //     if (res.ok) {
//   //       const formatted = (data.data || []).map(
//   //         (item) => `${item.day}, ${item.time}`
//   //       );

//   //       const unique = [...new Set(formatted)];

//   //       setTimes(unique);

//   //       if (unique.length > 0) {
//   //         setSelectedTime(unique[0]);
//   //       }
//   //     }
//   //   } catch (err) {
//   //     console.log("Schedule error:", err);
//   //   }
//   // };

//   const fetchSubjects = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Student/my-courses`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         const formatted = (data || []).map((c) => ({
//           id: c.course_id,
//           name: c.course_name,
//         }));

//         setSubjects(formatted);
//       }
//     } catch (err) {
//       console.log("Courses error:", err);
//     }
//   };

//   useEffect(() => {
//     const init = async () => {
//       await loadLocation();
//       // await fetchSchedule();
//       await fetchSubjects();
//       setLoading(false);
//     };

//     init();
//   }, []);

//   const handleFindTutor = (subject) => {
//     if (!selectedTime) {
//       Alert.alert("Error", "Select time first");
//       return;
//     }

//     const [day, time] = selectedTime.split(", ");

//     navigation.navigate("StudentFindTutor", {
//       course_id: subject.id,
//       course_name: subject.name,
//       day,
//       time,
//       userLat,
//       userLng,
//     });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
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

//       {loading && (
//         <View style={styles.loaderOverlay}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       )}

//       <View style={styles.content}>
//         <Text style={styles.label}>Select Day & Time</Text>

//         <View style={styles.selectedBox}>
//           <Text style={styles.selectedText}>
//             {selectedTime || "No time selected"}
//           </Text>
//         </View>

//         <View style={styles.dropdownWrapper}>
//           <Picker
//             selectedValue={selectedTime}
//             onValueChange={(value) => setSelectedTime(value)}
//             style={{ flex: 1 }}
//           >
//             {times.length === 0 ? (
//               <Picker.Item label="No time available" value="" />
//             ) : (
//               times.map((item, i) => (
//                 <Picker.Item key={i} label={item} value={item} />
//               ))
//             )}
//           </Picker>

//           <Icon name="arrow-drop-down" size={28} color="#555" />
//         </View>

//         <FlatList
//           data={subjects}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => (
//             <View style={styles.card}>
//               <Text style={styles.subject}>{item.name}</Text>

//               <TouchableOpacity
//                 style={styles.button}
//                 onPress={() => handleFindTutor(item)}
//               >
//                 <Text style={styles.buttonText}>Find Tutor</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//           contentContainerStyle={{ paddingBottom: 120 }}
//           ListEmptyComponent={
//             !loading && (
//               <Text style={{ textAlign: "center", marginTop: 20 }}>
//                 No Courses Found
//               </Text>
//             )
//           }
//         />
//       </View>

//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentHome")}
//         >
//           <Icon name="calendar-today" size={24} color="#999" />
//           <Text style={styles.navText}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("StudentAddCourses")}
//         >
//           <Icon name="library-add" size={24} color="#999" />
//           <Text style={styles.navText}>Add Courses</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="menu-book" size={24} color={colors.primary} />
//           <Text style={styles.navTextActive}>Courses</Text>
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

// export default StudentCourses;

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

//   content: {
//     flex: 1,
//     padding: 16,
//   },

//   loaderOverlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.6)",
//     zIndex: 10,
//   },

//   label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },

//   selectedBox: {
//     backgroundColor: "#d1f3e6",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 8,
//   },

//   selectedText: {
//     fontSize: 14,
//     color: colors.primary,
//     fontWeight: "600",
//   },

//   dropdownWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 8,
//     marginBottom: 16,
//     paddingRight: 8,
//   },

//   card: {
//     backgroundColor: "#fff",
//     padding: 16,
//     marginBottom: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },

//   subject: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 10,
//   },

//   button: {
//     backgroundColor: colors.primary,
//     padding: 10,
//     borderRadius: 6,
//     alignItems: "center",
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 1,
//     borderColor: "#eee",
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

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";
import Icon from "react-native-vector-icons/MaterialIcons";

const StudentCourses = ({ navigation }) => {
  const [subjects,  setSubjects]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [userLat,   setUserLat]   = useState(null);
  const [userLng,   setUserLng]   = useState(null);

  // ── Load location + userId saved at login ─────────────────────────
  const loadUserData = async () => {
  try {
    const lat = await AsyncStorage.getItem("latitude");
    const lng = await AsyncStorage.getItem("longitude");

    if (lat) {
      setUserLat(parseFloat(lat));
    }

    if (lng) {
      setUserLng(parseFloat(lng));
    }
  } catch (err) {
    console.log("User data error:", err);
  }
};

  // ── Fetch student's enrolled courses ──────────────────────────────
  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const formatted = (data || []).map((c) => ({
          id:   c.course_id,
          name: c.course_name,
        }));
        setSubjects(formatted);
      }
    } catch (err) {
      console.log("Courses error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadUserData();
      await fetchSubjects();
      setLoading(false);
    };
    init();
  }, []);

  // ── Navigate to StudentFindTutor ───────────────────────────────────
  const handleFindTutor = (subject) => {
  if (userLat == null || userLng == null) {
    alert("Location not found. Please enable location access.");
    return;
  }

  navigation.navigate("StudentFindTutor", {
    courseId: subject.id,
    courseName: subject.name,
    userLat,
    userLng,
  });
};

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("StudentDrawer")}>
          <Icon name="menu" size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      {/* LOADER */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.pageTitle}>My Courses</Text>

        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>No Courses Found</Text>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.subject}>{item.name}</Text>

              <TouchableOpacity
                style={styles.button}
                onPress={() => handleFindTutor(item)}
              >
                <Text style={styles.buttonText}>Find Tutor</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentHome")}
        >
          <Icon name="calendar-today" size={24} color="#999" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentAddCourses")}
        >
          <Icon name="library-add" size={24} color="#999" />
          <Text style={styles.navText}>Add Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="menu-book" size={24} color={colors.primary} />
          <Text style={styles.navTextActive}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentAllClasses")}
        >
          <Icon name="school" size={24} color="#999" />
          <Text style={styles.navText}>Classes</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default StudentCourses;

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: "#F4F6F9" },

  header: {
    flexDirection:     "row",
    alignItems:        "center",
    justifyContent:    "space-between",
    paddingHorizontal: 16,
    paddingVertical:   12,
    backgroundColor:   "#fff",
    elevation:         2,
  },

  headerCenter: { alignItems: "center" },

  logoImage: { width: 90, height: 50, resizeMode: "contain" },

  logoText: { fontSize: 13, fontWeight: "600", color: colors.primary },

  content: { flex: 1, padding: 16 },

  loaderOverlay: {
    position:        "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent:  "center",
    alignItems:      "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    zIndex:          10,
  },

  pageTitle: {
    fontSize:     18,
    fontWeight:   "700",
    color:        "#333",
    marginBottom: 16,
  },

  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },

  card: {
    backgroundColor: "#fff",
    padding:         16,
    marginBottom:    10,
    borderRadius:    10,
    elevation:       2,
  },

  subject: { fontSize: 16, fontWeight: "600", marginBottom: 10 },

  button: {
    backgroundColor: colors.primary,
    padding:         10,
    borderRadius:    6,
    alignItems:      "center",
  },

  buttonText: { color: "#fff", fontWeight: "600" },

  bottomNav: {
    position:        "absolute",
    bottom:          0,
    width:           "100%",
    flexDirection:   "row",
    justifyContent:  "space-around",
    alignItems:      "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopWidth:  1,
    borderColor:     "#eee",
  },

  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },

  navText:       { fontSize: 11, color: "#999",         marginTop: 2 },
  navTextActive: { fontSize: 11, color: colors.primary, marginTop: 2, fontWeight: "600" },
});