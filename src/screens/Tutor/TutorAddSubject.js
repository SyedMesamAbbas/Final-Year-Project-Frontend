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
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TutorAddSubject = ({ navigation }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [grade, setGrade] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Tutor/my-courses`, {
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

      const res = await fetch(`${BASE_URL}/Tutor/all-courses`, {
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

const openGradeDialog = (course) => {
  setSelectedCourse(course);
  setGrade("");
  setHourlyRate("");
  setGradeModalVisible(true);
};

const addCourse = async () => {
  if (!selectedCourse) return;

  const enteredGrade = grade.trim().toUpperCase();
  const rate = parseFloat(hourlyRate);

  if (!["A", "B", "C", "D", "F"].includes(enteredGrade)) {
    Alert.alert(
      "Invalid Grade",
      "Please enter A, B, C, D or F"
    );
    return;
  }

  if (isNaN(rate) || rate <= 0) {
    Alert.alert(
      "Invalid Hourly Rate",
      "Please enter a valid hourly rate."
    );
    return;
  }

  try {
    const token = await AsyncStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/Tutor/add-courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courses: [
          {
            courseId: selectedCourse.course_id,
            grade: enteredGrade,
            hourlyRate: rate,
          },
        ],
      }),
    });

    const data = await res.json();

    if (res.ok) {
      Alert.alert(
        "Success",
        `${selectedCourse.course_name} added successfully`
      );

      setGradeModalVisible(false);
      setSelectedCourse(null);
      setGrade("");
      setHourlyRate("");

      await fetchMyCourses();
      await fetchAllCourses();
    } else {
      Alert.alert(
        "Error",
        data.message || "Unable to add course"
      );
    }
  } catch (e) {
    console.log("Add Course Error:", e);
    Alert.alert("Error", "Something went wrong.");
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.itemText}>
                            {index + 1}. {course.course_name}
                          </Text>

                          <Text style={styles.rateText}>
                            Rs. {course.hourly_rate}/hour
                          </Text>
                        </View>

                        <View style={styles.gradeBadge}>
                          <Text style={styles.gradeText}>
                            {course.grade}
                          </Text>
                        </View>
                      </View>
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
                    onPress={() => openGradeDialog(course)}
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

      <Modal
        visible={gradeModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Enter Grade
            </Text>

            <Text style={styles.modalCourse}>
              {selectedCourse?.course_name}
            </Text>

            <TextInput
              style={styles.gradeInput}
              placeholder="A, B, C, D or F"
              value={grade}
              maxLength={1}
              autoCapitalize="characters"
              onChangeText={setGrade}
            />

            <TextInput
              style={styles.rateInput}
              placeholder="Hourly Rate (Rs)"
              keyboardType="numeric"
              value={hourlyRate}
              onChangeText={setHourlyRate}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() =>
                  setGradeModalVisible(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={addCourse}
              >
                <Text style={styles.saveText}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Bottom Navigation */}
       <View style={styles.bottomNav}>
         <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("TutorHome")
          }
        >
          <Icon
            name="calendar-month"
            size={24}
            color="#999"
          />
          <Text style={styles.inactiveTab}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("TutorStudentRequest")
          }
        >
          <Icon
            name="description"
            size={24}
            color="#999"
          />
          <Text style={styles.inactiveTab}>
            Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("TutorTodayClasses")
          }
        >
          <Icon
            name="school"
            size={24}
            color="#999"
          />
          <Text style={styles.inactiveTab}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon
            name="add-box"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.activeTab}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TutorAddSubject;

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
  gradeBadge: {
  backgroundColor: colors.primary,
  paddingHorizontal: 12,
  paddingVertical: 4,
  borderRadius: 20,
},

gradeText: {
  color: "#fff",
  fontWeight: "700",
},

modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
},

modalContainer: {
  width: "85%",
  backgroundColor: "#fff",
  borderRadius: 15,
  padding: 20,
},

modalTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: colors.primary,
  marginBottom: 15,
  textAlign: "center",
},

modalCourse: {
  textAlign: "center",
  fontSize: 16,
  marginBottom: 15,
  color: "#333",
},

gradeInput: {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  paddingHorizontal: 15,
  height: 50,
  fontSize: 18,
  textAlign: "center",
  marginBottom: 20,
},

modalButtons: {
  flexDirection: "row",
  justifyContent: "space-between",
},

cancelBtn: {
  flex: 1,
  backgroundColor: "#ccc",
  padding: 12,
  borderRadius: 10,
  marginRight: 8,
},

saveBtn: {
  flex: 1,
  backgroundColor: colors.primary,
  padding: 12,
  borderRadius: 10,
  marginLeft: 8,
},

cancelText: {
  textAlign: "center",
  color: "#333",
  fontWeight: "600",
},

saveText: {
  textAlign: "center",
  color: "#fff",
  fontWeight: "600",
},
rateInput: {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  paddingHorizontal: 15,
  height: 50,
  fontSize: 16,
  marginBottom: 20,
},

rateText: {
  color: colors.primary,
  marginTop: 4,
  fontWeight: "600",
  fontSize: 13,
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

// const TutorAddSubject = ({ navigation }) => {
//   const [subjects, setSubjects] = useState([]);
//   const [availableCourses, setAvailableCourses] = useState([]);
//   const [showCourses, setShowCourses] = useState(false);

//   useEffect(() => {
//     fetchMyCourses();
//   }, []);

//   const fetchMyCourses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Tutor/my-courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setSubjects(data);
//       }
//     } catch (e) {
//       console.log("My Courses Error:", e);
//     }
//   };

//   const fetchAllCourses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Tutor/all-courses`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setAvailableCourses(data);
//         setShowCourses(true);
//       }
//     } catch (e) {
//       console.log("All Courses Error:", e);
//     }
//   };

//   const addCourse = async (course) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Tutor/add-courses`, {
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
//         Alert.alert("Success", "Course added successfully");

//         setSubjects((prev) => [...prev, course]);

//         setAvailableCourses((prev) =>
//           prev.filter(
//             (item) => item.course_id !== course.course_id
//           )
//         );
//       } else {
//         Alert.alert("Error", data.message);
//       }
//     } catch (e) {
//       console.log("Add Course Error:", e);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.navigate("TutorDrawer")}
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

//       {/* Content */}
//       <View style={styles.content}>
//         {/* My Subjects */}
//         <View
//           style={[
//             styles.card,
//             {
//               width: showCourses ? "40%" : "75%",
//             },
//           ]}
//         >
//           <Text style={styles.cardTitle}>
//             Subjects You Teach
//           </Text>

//           <ScrollView showsVerticalScrollIndicator={false}>
//             {subjects.length > 0 ? (
//               subjects.map((sub, index) => (
//                 <View
//                   key={sub.course_id}
//                   style={styles.listItem}
//                 >
//                   <Text style={styles.itemText}>
//                     {index + 1}. {sub.course_name}
//                   </Text>
//                 </View>
//               ))
//             ) : (
//               <Text style={styles.emptyText}>
//                 No subjects added yet
//               </Text>
//             )}
//           </ScrollView>
//         </View>

//         {/* Plus Button */}
//         <View style={styles.centerArea}>
//           <TouchableOpacity
//             style={styles.addBtn}
//             onPress={fetchAllCourses}
//           >
//             <Icon
//               name="add"
//               size={30}
//               color="#fff"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Available Courses */}
//         {showCourses && (
//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>
//               Available Courses
//             </Text>

//             <ScrollView showsVerticalScrollIndicator={false}>
//               {availableCourses.length > 0 ? (
//                 availableCourses.map((course) => (
//                   <TouchableOpacity
//                     key={course.course_id}
//                     style={styles.courseItem}
//                     onPress={() => addCourse(course)}
//                   >
//                     <Text style={styles.itemText}>
//                       {course.course_name}
//                     </Text>

//                     <Icon
//                       name="add-circle"
//                       size={22}
//                       color={colors.primary}
//                     />
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <Text style={styles.emptyText}>
//                   No more courses available
//                 </Text>
//               )}
//             </ScrollView>
//           </View>
//         )}
//       </View>

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("TutorHome")
//           }
//         >
//           <Icon
//             name="calendar-month"
//             size={24}
//             color="#999"
//           />
//           <Text style={styles.inactiveTab}>
//             Schedule
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("TutorStudentRequest")
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
//             navigation.navigate("TutorTodayClasses")
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

//         <TouchableOpacity style={styles.navItem}>
//           <Icon
//             name="add-box"
//             size={24}
//             color={colors.primary}
//           />
//           <Text style={styles.activeTab}>
//             Add
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default TutorAddSubject;

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
//     marginBottom: 10,
//     color: colors.primary,
//   },

//   listItem: {
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },

//   courseItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },

//   itemText: {
//     fontSize: 13,
//     color: "#333",
//     flex: 1,
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#999",
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

//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 8,
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
//     marginTop: 2,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },
// });
















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

// const TutorAddSubject = ({ navigation }) => {

//   const [subjects, setSubjects] = useState([]);        // tutor courses
//   const [availableCourses, setAvailableCourses] = useState([]); // all courses
//   const [showCourses, setShowCourses] = useState(false);

//   useEffect(() => {
//     fetchMyCourses();
//   }, []);


//   const fetchMyCourses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Tutor/my-courses`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setSubjects(data);
//       }
//     } catch (e) {
//       console.log("My Courses Error:", e);
//     }
//   };

//   const fetchAllCourses = async () => {
//     try {
//       const res = await fetch(`${BASE_URL}/Tutor/all-courses`);
//       const data = await res.json();

//       if (res.ok) {
//         setAvailableCourses(data);
//         setShowCourses(true);
//       }
//     } catch (e) {
//       console.log("All Courses Error:", e);
//     }
//   };

//   const addCourse = async (course) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await fetch(`${BASE_URL}/Tutor/add-courses`, {
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

//         setSubjects((prev) => {
//           const exists = prev.find(c => c.course_id === course.course_id);
//           if (exists) return prev;
//           return [...prev, course];
//         });

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

//       <View style={styles.content}>
        
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Subjects You Teach</Text>

//           <ScrollView>
//             {subjects.map((sub, index) => (
//               <View key={index} style={styles.listItem}>
//                 <Text style={styles.itemText}>
//                   {index + 1}. {sub.course_name}
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
//         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorHome")}>
//           <Icon name="calendar-month" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorStudentRequest")}>
//           <Icon name="description" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Request</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorTodayClasses")}>
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.inactiveTab}>Today</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="add-box" size={24} color={colors.primary} />
//           <Text style={styles.activeTab}>Add</Text>
//         </TouchableOpacity>
//       </View>

//     </SafeAreaView>
//   );
// };

// export default TutorAddSubject;

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

//   bottomNav: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 8,
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
//     marginTop: 2,
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },
// });