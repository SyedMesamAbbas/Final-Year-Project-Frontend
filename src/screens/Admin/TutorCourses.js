import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/api";

const TutorCourses = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tutors, setTutors] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [minRate, setMinRate] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [expandedTutor, setExpandedTutor] = useState(null);

  const toggleTutor = (id) => {
    if (expandedTutor === id) setExpandedTutor(null);
    else setExpandedTutor(id);
  };

  const fetchTutorCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/Admin/all-tutors-courses`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTutors(data);
      } else {
        alert(data.message || "Unable to load tutors.");
      }
    } catch (error) {
      console.log(error);
      alert("Network request failed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // const saveRate = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");

  //     const response = await fetch(
  //       `${BASE_URL}/Admin/set-rate-by-qualification`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           tutorId: selectedTutorId,
  //           courseId: selectedCourseId,
  //           minHourlyRate: Number(minRate),
  //           maxHourlyRate: Number(maxRate),
  //         }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (response.ok) {
  //       alert("Rate Updated");
  //       setModalVisible(false);
  //       fetchTutorCourses();
  //     } else {
  //       alert(data.message);
  //     }
  //   } catch (error) {
  //     alert("Network Error");
  //   }
  // };
  const saveRate = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/Admin/set-rate-by-tutor-course`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tutorId: selectedTutorId,
        courseId: selectedCourseId,
        minHourlyRate: Number(minRate),
        maxHourlyRate: Number(maxRate),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message || "Rate Updated");
      setModalVisible(false);
      fetchTutorCourses();
    } else {
      alert(data.message || data.title || "Failed to update rate.");
    }
  } catch (error) {
    alert("Network Error: " + error.message);
  }
};
  useEffect(() => {
    fetchTutorCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTutorCourses();
  }, []);

  const renderCourse = ({ item }) => (
    <View style={styles.courseCard}>
      <Text style={styles.courseTitle}>{item.course_name}</Text>

      <Text style={styles.courseText}>
        Grade : <Text style={styles.bold}>{item.grade}</Text>
      </Text>

      <Text style={styles.courseText}>
        Hourly Fee :
        <Text style={styles.bold}> Rs. {item.hourly_rate}</Text>
      </Text>

      <Text style={styles.courseText}>
        Admin Min :
        <Text style={styles.bold}>
          {" "}
          {item.admin_set_min_hourly_rate == null
            ? "-"
            : `Rs. ${item.admin_set_min_hourly_rate}`}
        </Text>
      </Text>

      <Text style={styles.courseText}>
        Admin Max :
        <Text style={styles.bold}>
          {" "}
          {item.admin_set_max_hourly_rate == null
            ? "-"
            : `Rs. ${item.admin_set_max_hourly_rate}`}
        </Text>
      </Text>
      
      <Text
        style={[
          styles.status,
          {
            color: item.is_completed ? "green" : "red",
          },
        ]}
      >
        {item.is_completed ? "Completed" : "Active"}
      </Text>

      {item.completed_date && (
        <Text style={styles.courseText}>
          Completed:
          <Text style={styles.bold}> {item.completed_date}</Text>
        </Text>
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setSelectedTutorId(item.tutor_id);
          setSelectedCourseId(item.course_id);

          setMinRate(item.admin_set_min_hourly_rate?.toString() || "");

          setMaxRate(item.admin_set_max_hourly_rate?.toString() || "");

          setModalVisible(true);
          setSelectedTutorId(item.tutor_id);
        }}
      >
        <Text style={styles.buttonText}>Set Rate</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTutor = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.tutor_name}</Text>

      <Text style={styles.text}>
        Qualification:
        <Text style={styles.bold}> {item.qualification}</Text>
      </Text>

      <Text style={styles.text}>
        Experience:
        <Text style={styles.bold}> {item.experience}</Text>
      </Text>

      <Text style={styles.text}>
        Location:
        <Text style={styles.bold}> {item.location}</Text>
      </Text>

      <Text
        style={[
          styles.text,
          {
            color:
              item.status === "Approved"
                ? "green"
                : item.status === "Pending"
                ? "orange"
                : "red",
          },
        ]}
      >
        Status: {item.status}
      </Text>

      <Text style={styles.totalCourses}>
        Total Courses : {item.total_courses}
      </Text>

      <TouchableOpacity
        style={styles.tutorHeader}
        onPress={() => toggleTutor(item.tutor_id)}
      >
        <View>
          <Text style={styles.name}>{item.tutor_name}</Text>
          <Text>{item.qualification}</Text>
        </View>

        <Text style={styles.arrow}>
          {expandedTutor === item.tutor_id ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      {expandedTutor === item.tutor_id && (
        <FlatList
          data={item.courses}
          keyExtractor={(course) => course.course_id.toString()}
          renderItem={({ item: course }) =>
                renderCourse({
                    item: {
                        ...course,
                        tutor_id: item.tutor_id,
                    },
                })
            }
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#1565C0" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.heading}>Tutors & Courses</Text>

      <FlatList
        data={tutors}
        keyExtractor={(item) => item.tutor_id.toString()}
        renderItem={renderTutor}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Hourly Rate</Text>

            <TextInput
              placeholder="Minimum Hourly Rate"
              keyboardType="numeric"
              value={minRate}
              onChangeText={setMinRate}
            />

            <TextInput
              placeholder="Maximum Hourly Rate"
              keyboardType="numeric"
              value={maxRate}
              onChangeText={setMaxRate}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveRate}>
              <Text style={{ color: "#fff" }}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TutorCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    elevation: 4,
  },

  back: {
    fontSize: 28,
    color: "#1565C0",
    fontWeight: "bold",
  },

  logo: {
    width: 130,
    height: 45,
  },

  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1565C0",
    margin: 15,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 18,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },

  tutorHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  arrow: {
    fontSize: 16,
    color: "#1565C0",
  },

  name: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 8,
  },

  text: {
    fontSize: 15,
    marginBottom: 5,
    color: "#444",
  },

  bold: {
    fontWeight: "bold",
    color: "#000",
  },

  totalCourses: {
    marginTop: 10,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D47A1",
  },

  courseCard: {
    backgroundColor: "#F3F7FD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1565C0",
    marginBottom: 6,
  },

  courseText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#444",
  },

  status: {
    marginTop: 8,
    fontWeight: "bold",
    fontSize: 15,
  },

  button: {
    marginTop: 10,
    backgroundColor: "#1565C0",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1565C0",
  },

  saveButton: {
    marginTop: 15,
    backgroundColor: "#1565C0",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
});


















// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Modal,
//   TextInput,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import { BASE_URL } from "../../config/api";

// const TutorCourses = () => {
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [tutors, setTutors] = useState([]);
//   const [modalVisible,setModalVisible]=useState(false);
//   const [selectedTutorId,setSelectedTutorId]=useState(null);
//   const [selectedCourseId,setSelectedCourseId]=useState(null);
//   const [minRate,setMinRate]=useState("");
//   const [maxRate,setMaxRate]=useState("");
//   const [expandedTutor, setExpandedTutor] = useState(null);

//   const toggleTutor = (id) => {
//       if (expandedTutor === id)
//           setExpandedTutor(null);
//       else
//           setExpandedTutor(id);
//   };
//   const fetchTutorCourses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Admin/all-tutors-courses`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             Accept: "application/json",
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutors(data);
//       } else {
//         alert(data.message || "Unable to load tutors.");
//       }
//     } catch (error) {
//       console.log(error);
//       alert("Network request failed.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };


//   const saveRate = async () => {

// try{

// const token = await AsyncStorage.getItem("token");

// const response = await fetch(
// `${BASE_URL}/Admin/set-rate-by-qualification`,
// {

// method:"POST",

// headers:{
// Authorization:`Bearer ${token}`,
// "Content-Type":"application/json"
// },

// body:JSON.stringify({

// tutorId:selectedTutorId,

// courseId:selectedCourseId,

// minHourlyRate:Number(minRate),

// maxHourlyRate:Number(maxRate)

// })

// });

// const data=await response.json();

// if(response.ok){

// alert("Rate Updated");

// setModalVisible(false);

// fetchTutorCourses();

// }
// else{

// alert(data.message);

// }

// }catch(error){

// alert("Network Error");

// }

// };

//   useEffect(() => {
//     fetchTutorCourses();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchTutorCourses();
//   }, []);

//   const renderCourse = ({ item }) => (
//     <View style={styles.courseCard}>
//       <Text style={styles.courseTitle}>{item.course_name}</Text>

//       <Text style={styles.courseText}>
//         Grade : <Text style={styles.bold}>{item.grade}</Text>
//       </Text>

//       <Text style={styles.courseText}>
//         Hourly Fee :
//         <Text style={styles.bold}> Rs. {item.hourly_rate}</Text>
//       </Text>

//       <Text style={styles.courseText}>
//         Admin Min :
//         <Text style={styles.bold}>
//           {" "}
//           {item.admin_set_min_hourly_rate == null
//             ? "-"
//             : `Rs. ${item.admin_set_min_hourly_rate}`}
//         </Text>
//       </Text>

//       <Text style={styles.courseText}>
//         Admin Max :
//         <Text style={styles.bold}>
//           {" "}
//           {item.admin_set_max_hourly_rate == null
//             ? "-"
//             : `Rs. ${item.admin_set_max_hourly_rate}`}
//         </Text>
//       </Text>

//       <Text
//         style={[
//           styles.status,
//           {
//             color: item.is_completed ? "green" : "red",
//           },
//         ]}
//       >
//         {item.is_completed ? "Completed" : "Active"}
//       </Text>

//       {item.completed_date && (
//         <Text style={styles.courseText}>
//           Completed:
//           <Text style={styles.bold}> {item.completed_date}</Text>
//         </Text>
//       )}
//       <TouchableOpacity
//         style={styles.button}
//         onPress={()=>{
//         setSelectedTutorId(item.tutor_id);
//         setSelectedCourseId(course.course_id);

//         setMinRate(
//         course.admin_set_min_hourly_rate?.toString() || ""
//         );

//         setMaxRate(
//         course.admin_set_max_hourly_rate?.toString() || ""
//         );

//         setModalVisible(true);

//         }}
//         >

//         <Text style={styles.buttonText}>
//         Set Rate
//         </Text>

//         </TouchableOpacity>
//     </View>
//   );

//   const renderTutor = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.name}>{item.tutor_name}</Text>

//       <Text style={styles.text}>
//         Qualification:
//         <Text style={styles.bold}> {item.qualification}</Text>
//       </Text>

//       <Text style={styles.text}>
//         Experience:
//         <Text style={styles.bold}> {item.experience}</Text>
//       </Text>

//       <Text style={styles.text}>
//         Location:
//         <Text style={styles.bold}> {item.location}</Text>
//       </Text>

//       <Text
//         style={[
//           styles.text,
//           {
//             color:
//               item.status === "Approved"
//                 ? "green"
//                 : item.status === "Pending"
//                 ? "orange"
//                 : "red",
//           },
//         ]}
//       >
//         Status: {item.status}
//       </Text>

//       <Text style={styles.totalCourses}>
//         Total Courses : {item.total_courses}
//       </Text>

//       <TouchableOpacity
//         style={styles.tutorHeader}
//         onPress={() => toggleTutor(item.tutor_id)}
//       >

//           <View>
//               <Text style={styles.name}>{item.tutor_name}</Text>
//               <Text>{item.qualification}</Text>
//           </View>

//           <Text style={styles.arrow}>
//               {expandedTutor === item.tutor_id ? "▲" : "▼"}
//           </Text>

//       </TouchableOpacity>

//       {
//         expandedTutor === item.tutor_id && (

//         <FlatList
//         data={item.courses}
//         renderItem={renderCourse}
//         />

//         )
//       }
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator size="large" color="#1565C0" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Text style={styles.back}>←</Text>
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 30 }} />
//       </View>

//       <Text style={styles.heading}>Tutors & Courses</Text>

//       <FlatList
//         data={tutors}
//         keyExtractor={(item) => item.tutor_id.toString()}
//         renderItem={renderTutor}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           />
//         }
//         contentContainerStyle={{ paddingBottom: 30 }}
//       />
//       <Modal
// visible={modalVisible}
// transparent
// animationType="slide"
// >

// <View style={styles.modalContainer}>

// <View style={styles.modalCard}>

// <Text style={styles.modalTitle}>
// Set Hourly Rate
// </Text>

// <TextInput
// placeholder="Minimum Hourly Rate"
// keyboardType="numeric"
// value={minRate}
// onChangeText={setMinRate}
// />

// <TextInput
// placeholder="Maximum Hourly Rate"
// keyboardType="numeric"
// value={maxRate}
// onChangeText={setMaxRate}
// />

// <TouchableOpacity
// style={styles.saveButton}
// onPress={saveRate}
// >

// <Text style={{color:"#fff"}}>
// Save
// </Text>

// </TouchableOpacity>

// <TouchableOpacity
// onPress={()=>setModalVisible(false)}
// >

// <Text style={{marginTop:15}}>
// Cancel
// </Text>

// </TouchableOpacity>

// </View>

// </View>

// </Modal>
//     </SafeAreaView>
//   );
// };

// export default TutorCourses;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F7FA",
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     elevation: 4,
//   },

//   back: {
//     fontSize: 28,
//     color: "#1565C0",
//     fontWeight: "bold",
//   },

//   logo: {
//     width: 130,
//     height: 45,
//   },

//   heading: {
//     fontSize: 22,
//     fontWeight: "bold",
//     color: "#1565C0",
//     margin: 15,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     marginBottom: 18,
//     borderRadius: 10,
//     padding: 15,
//     elevation: 3,
//   },

//   name: {
//     fontSize: 21,
//     fontWeight: "bold",
//     color: "#1565C0",
//     marginBottom: 8,
//   },

//   text: {
//     fontSize: 15,
//     marginBottom: 5,
//     color: "#444",
//   },

//   bold: {
//     fontWeight: "bold",
//     color: "#000",
//   },

//   totalCourses: {
//     marginTop: 10,
//     marginBottom: 12,
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#0D47A1",
//   },

//   courseCard: {
//     backgroundColor: "#F3F7FD",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//   },

//   courseTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#1565C0",
//     marginBottom: 6,
//   },

//   courseText: {
//     fontSize: 14,
//     marginBottom: 4,
//     color: "#444",
//   },

//   status: {
//     marginTop: 8,
//     fontWeight: "bold",
//     fontSize: 15,
//   },
// });