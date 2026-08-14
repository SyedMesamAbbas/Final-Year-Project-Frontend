import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentAddCourses = ({ navigation }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMyCourses(data);
      } else {
        console.log("My Courses Error:", data);
      }
    } catch (e) {
      console.log("Fetch My Courses Error:", e);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/all-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setAvailableCourses(data);
        setShowCourses(true);
      } else {
        console.log("All Courses Error:", data);
      }
    } catch (e) {
      console.log("Fetch All Courses Error:", e);
    }
  };

  const addCourse = async (course) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/add-courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseIds: [course.course_id],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Course added successfully");

        await fetchMyCourses();

        setShowCourses(false);
        setAvailableCourses([]);
      } else {
        Alert.alert("Error", data.message || "Unable to add course");
      }
    } catch (e) {
      console.log("Add Course Error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate("StudentDrawer")}
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

        <View style={{ width: 26 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {!showCourses ? (
          <>
            <View style={styles.cardFull}>
              <Text style={styles.cardTitle}>My Courses</Text>

              <ScrollView>
                {myCourses.length > 0 ? (
                  myCourses.map((course, index) => (
                    <View key={index} style={styles.listItem}>
                      <Text style={styles.itemText}>
                        {index + 1}. {course.course_name}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>
                    No Courses Added Yet
                  </Text>
                )}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.floatingBtn}
              onPress={fetchAllCourses}
            >
              <Icon name="add" size={32} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.cardFull}>
            <View style={styles.availableHeader}>
              <Text style={styles.cardTitle}>Available Courses</Text>

              <TouchableOpacity
                onPress={() => setShowCourses(false)}
              >
                <Icon
                  name="close"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {availableCourses.length > 0 ? (
                availableCourses.map((course, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.listItem}
                    onPress={() => addCourse(course)}
                  >
                    <Text style={styles.itemText}>
                      {course.course_name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No More Courses Available
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentHome")}
        >
          <Icon name="calendar-today" size={24} color="#999" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon
            name="library-add"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.navTextActive}>
            Add Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentCourses")}
        >
          <Icon name="menu-book" size={24} color="#999" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("StudentAllClasses")
          }
        >
          <Icon name="school" size={24} color="#999" />
          <Text style={styles.navText}>Classes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentAddCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

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
    width: 28,
    height: 28,
    marginBottom: 2,
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  content: {
    flex: 1,
    padding: 12,
  },

  cardFull: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    marginBottom: 80,
  },

  cardTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: colors.primary,
    marginBottom: 10,
  },

  availableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  itemText: {
    fontSize: 14,
    color: "#333",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#999",
  },

  floatingBtn: {
    position: "absolute",
    right: 25,
    bottom: 100,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    elevation: 5,
  },

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

  navText: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  navTextActive: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
});


















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentAddCourses = ({ navigation }) => {

//   const [myCourses, setMyCourses] = useState([]);
//   const [availableCourses, setAvailableCourses] = useState([]);
//   const [showCourses, setShowCourses] = useState(false);

//   useEffect(() => {
//     fetchMyCourses();
//   }, []);

//   const fetchMyCourses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Student/my-courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMyCourses(data);
//       } else {
//         console.log("My Courses Error:", data);
//       }

//     } catch (e) {
//       console.log("Fetch My Courses Error:", e);
//     }
//   };

//   const fetchAllCourses = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/Student/all-courses`);
//       const data = await res.json();

//       if (res.ok) {
//         setAvailableCourses(data);
//         setShowCourses(true);
//       } else {
//         console.log("All Courses Error:", data);
//       }

//     } catch (e) {
//       console.log("Fetch All Courses Error:", e);
//     }
//   };

//   const addCourse = async (course) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Student/add-courses`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           courseIds: [course.course_id],
//         }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         Alert.alert("Success", "Course added");

//         fetchMyCourses();

//       } else {
//         Alert.alert("Error", data.message);
//       }

//     } catch (e) {
//       console.log("Add Course Error:", e);
//     }
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

//       <View style={styles.content}>

//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>My Courses</Text>

//           <ScrollView>
//             {myCourses.map((course, index) => (
//               <View key={index} style={styles.listItem}>
//                 <Text style={styles.itemText}>
//                   {index + 1}. {course.course_name}
//                 </Text>
//               </View>
//             ))}
//           </ScrollView>
//         </View>

//         <View style={styles.centerArea}>
//           <TouchableOpacity style={styles.addBtn} onPress={fetchAllCourses}>
//             <Icon name="add" size={30} color="#fff" />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Available Courses</Text>

//           <ScrollView>
//             {showCourses && availableCourses.map((course, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={styles.listItem}
//                 onPress={() => addCourse(course)}
//               >
//                 <Text style={styles.itemText}>
//                   {course.course_name}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>
//       </View>

//       <View style={styles.bottomNav}>
//         {/* Schedule */}
//         <TouchableOpacity 
//         style={styles.navItem}  
//         onPress={() => navigation.navigate("StudentHome")}>
//           <Icon name="calendar-today" size={24} color="#999" />
//           <Text style={styles.navText}>Schedule</Text>
//         </TouchableOpacity>

//         {/* Add Courses */}
//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="library-add" size={24} color={colors.primary} />
//           <Text style={styles.navTextActive}>Add Courses</Text>
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

// export default StudentAddCourses;

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
//     width: 28,
//     height: 28,
//     marginBottom: 2,
//   },

//   logoText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   content: {
//     flex: 1,
//     flexDirection: "row",
//     padding: 12,
//     justifyContent: "space-between",
//   },

//   card: {
//     width: "40%",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 10,
//     elevation: 3,
//   },

//   cardTitle: {
//     fontWeight: "600",
//     fontSize: 14,
//     marginBottom: 8,
//     color: colors.primary,
//   },

//   listItem: {
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },

//   itemText: {
//     fontSize: 13,
//     color: "#333",
//   },

//   centerArea: {
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   addBtn: {
//     backgroundColor: colors.primary,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 5,
//   },

//  bottomNav: {
//      flexDirection: "row",
//      justifyContent: "space-around",
//      alignItems: "center",
//      paddingVertical: 10,
//      borderTopWidth: 1,
//      borderColor: "#eee",
//      backgroundColor: "#fff",
//      position: "absolute",
//      bottom: 0,
//      width: "100%",
//    },
 
//    navItem: {
//      alignItems: "center",
//      justifyContent: "center",
//      flex: 1,
//    },
 
//    navText: {
//      fontSize: 11,
//      color: "#999",
//      marginTop: 2,
//    },
 
//    navTextActive: {
//      fontSize: 11,
//      color: colors.primary,
//      fontWeight: "600",
//      marginTop: 2,
//    },
// });