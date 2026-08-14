// Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentFindTutor = ({ navigation, route }) => {
  const { courseId, courseName, userLat, userLng } = route.params || {};

  const [tutorsData, setTutorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [requestModal, setRequestModal] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [learningMode, setLearningMode] = useState("FullTime");
  const [learningDuration, setLearningDuration] = useState("");
  const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
  const [selectedClassDate, setSelectedClassDate] = useState(null);

  useEffect(() => {
    fetchTutors();
  }, []);

  // ==========================
  // FETCH TUTORS
  // ==========================
  const fetchTutors = async () => {
    try {
      setLoading(true);

      if (!courseId || userLat == null || userLng == null) {
        Alert.alert("Error", "Missing required data");
        navigation.goBack();
        return;
      }

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTutorsData(Array.isArray(data) ? data : []);
      } else {
        setTutorsData([]);
        Alert.alert("Info", data.message || "No tutors found.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to load tutors.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // SEND REQUEST
  // ==========================
  const sendRequest = async () => {
  try {
    if (
      learningMode === "SpecificTime" &&
      (learningDuration === "" ||
        Number(learningDuration) <= 0)
    ) {
      Alert.alert(
        "Validation",
        "Enter learning duration."
      );
      return;
    }

    const token = await AsyncStorage.getItem("token");

    const response = await fetch(
      `${BASE_URL}/Student/create-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutor_id: selectedTutor,
          course_id: courseId,
          day: selectedDay,
          time: selectedTime,
          class_date: selectedClassDate,

          learning_mode: learningMode,

          learning_duration:
            learningMode === "SpecificTime"
              ? Number(learningDuration)
              : null,

          learning_duration_unit:
            learningMode === "SpecificTime"
              ? learningDurationUnit
              : null,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      Alert.alert(
        "Success",
        "Request sent successfully."
      );

      setRequestModal(false);

      setLearningMode("FullTime");

      setLearningDuration("");

      setLearningDurationUnit("Weeks");
    } else {
      Alert.alert(
        "Error",
        data.message || "Request failed."
      );
    }
  } catch (error) {
    Alert.alert("Error", error.message);
  }
};

  // ==========================
  // ONE CARD FOR EACH SLOT
  // ==========================
  const filteredTutors = tutorsData
    .flatMap((tutor) =>
      (tutor.common_slots || []).map((slot, index) => ({
        id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

        tutor_id: tutor.tutor_id,
        tutor_name: tutor.tutor_name,
        location: tutor.location,
        distance: tutor.distance,
        average_rating: tutor.average_rating,
        total_reviews: tutor.total_reviews,

        day: slot.day,
        time: slot.time,

        // NEW
        is_available: slot.is_available,
        availability_message: slot.availability_message,
        request_type: slot.request_type,
        class_date: slot.class_date,
      }))
    )
    .filter((item) =>
      item.tutor_name?.toLowerCase().includes(search.toLowerCase())
    );

  // ==========================
  // RENDER TUTOR
  // ==========================
  const renderTutor = ({ item }) => {
  const unavailable = item.is_available === false;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.name}>{item.tutor_name}</Text>

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
            ⭐ {Number(item.average_rating || 0).toFixed(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.info}>
        📍 {item.location || "Unknown Location"}
      </Text>

      <Text style={styles.info}>
        🚶 {Number(item.distance || 0).toFixed(2)} km away
      </Text>

      <Text style={styles.info}>
        📝 {item.total_reviews} Reviews
      </Text>

      {/* SLOT */}

      <View
        style={[
          styles.slotBox,
          unavailable && styles.unavailableSlotBox,
        ]}
      >
        <Text
          style={[
            styles.slotHeading,
            unavailable && styles.unavailableHeading,
          ]}
        >
          {unavailable ? "Unavailable Slot" : "Available Slot"}
        </Text>

        <Text style={styles.slotText}>
          📅 {item.day}
        </Text>

        <Text style={styles.slotText}>
          🕒 {item.time}
        </Text>

        {unavailable && (
          <>
            <View style={{ height: 8 }} />

            <Text style={styles.unavailableMessage}>
              {item.availability_message}
            </Text>

            <Text style={styles.requestType}>
              {item.request_type}
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity
        disabled={unavailable}
        style={[
          styles.primaryBtn,
          unavailable && styles.disabledButton,
        ]}
        onPress={() => {
          setSelectedTutor(item.tutor_id);
          setSelectedDay(item.day);
          setSelectedTime(item.time);
          setRequestModal(true);
        }}
      >
        <Text style={styles.primaryText}>
          {unavailable ? "Unavailable" : "Request"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          placeholder="Search Tutor..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filteredTutors}
          keyExtractor={(item) => item.id}
          renderItem={renderTutor}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No Tutor Found</Text>
          }
        />
      )}

      <Modal
        visible={requestModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              Send Request
            </Text>

            <Text style={styles.label}>
              Learning Mode
            </Text>

            <TouchableOpacity
              style={[
                styles.modeButton,
                learningMode === "FullTime" &&
                  styles.selectedMode,
              ]}
              onPress={() =>
                setLearningMode("FullTime")
              }
            >
              <Text>Full Time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                learningMode === "SpecificTime" &&
                  styles.selectedMode,
              ]}
              onPress={() =>
                setLearningMode("SpecificTime")
              }
            >
              <Text>Specific Time</Text>
            </TouchableOpacity>

            {learningMode === "SpecificTime" && (
              <>
                <TextInput
                  placeholder="Duration"
                  keyboardType="numeric"
                  value={learningDuration}
                  onChangeText={setLearningDuration}
                  style={styles.inputBox}
                />

                <Picker
                  selectedValue={
                    learningDurationUnit
                  }
                  onValueChange={(v) =>
                    setLearningDurationUnit(v)
                  }
                >
                  <Picker.Item
                    label="Days"
                    value="Days"
                  />
                  <Picker.Item
                    label="Weeks"
                    value="Weeks"
                  />
                  <Picker.Item
                    label="Months"
                    value="Months"
                  />
                </Picker>
              </>
            )}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={sendRequest}
            >
              <Text style={styles.primaryText}>
                Send Request
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() =>
                setRequestModal(false)
              }
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles moved outside the component function block
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    elevation: 2,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
    marginRight: 10,
  },
  ratingBadge: {
    backgroundColor: "#FFF4CC",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ratingText: {
    color: "#B8860B",
    fontWeight: "bold",
    fontSize: 14,
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  slotBox: {
    backgroundColor: "#EAF7FF",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  slotHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  slotText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
  unavailableSlotBox: {
    backgroundColor: "#FFF8E1",
    borderLeftColor: "#FF9800",
  },

  unavailableHeading: {
    color: "#E65100",
  },

  unavailableMessage: {
    color: "#D84315",
    fontWeight: "700",
    marginTop: 4,
    fontSize: 14,
  },

  requestType: {
    marginTop: 6,
    color: "#FB8C00",
    fontWeight: "bold",
    fontSize: 13,
  },

  disabledButton: {
    backgroundColor: "#BDBDBD",
  },
    modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalBox: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  modeButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  selectedMode: {
    borderColor: colors.primary,
    backgroundColor: "#E3F2FD",
  },

  inputBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },

  cancelBtn: {
    alignItems: "center",
    marginTop: 12,
  },
});

export default StudentFindTutor;





























// // Hide all Normal accepted classes and student enter learning_mode, learning_duration, learning_duration_unit, class_date
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// //import DateTimePicker from "@react-native-community/datetimepicker";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentFindTutor = ({ navigation, route }) => {
//   const { courseId, courseName, userLat, userLng } = route.params || {};

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [requestModal, setRequestModal] = useState(false);
//   const [selectedTutor, setSelectedTutor] = useState(null);
//   const [selectedDay, setSelectedDay] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [learningMode, setLearningMode] = useState("FullTime");
//   const [learningDuration, setLearningDuration] = useState("");
//   const [learningDurationUnit, setLearningDurationUnit] = useState("Weeks");
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [selectedClassDate, setSelectedClassDate] = useState(new Date());

//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   // ==========================
//   // FETCH TUTORS
//   // ==========================
//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       if (!courseId || userLat == null || userLng == null) {
//         Alert.alert("Error", "Missing required data");
//         navigation.goBack();
//         return;
//       }

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutorsData(Array.isArray(data) ? data : []);
//       } else {
//         setTutorsData([]);
//         Alert.alert("Info", data.message || "No tutors found.");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Unable to load tutors.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================
//   // SEND REQUEST
//   // ==========================
//   const sendRequest = async () => {
//   try {
//     if (
//       learningMode === "SpecificTime" &&
//       (learningDuration === "" ||
//         Number(learningDuration) <= 0)
//     ) {
//       Alert.alert(
//         "Validation",
//         "Enter learning duration."
//       );
//       return;
//     }

//     const token = await AsyncStorage.getItem("token");

//     const response = await fetch(
//       `${BASE_URL}/Student/create-request`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           tutor_id: selectedTutor,
//           course_id: courseId,
//           day: selectedDay,
//           time: selectedTime,
//           class_date: selectedClassDate,

//           learning_mode: learningMode,

//           learning_duration:
//             learningMode === "SpecificTime"
//               ? Number(learningDuration)
//               : null,

//           learning_duration_unit:
//             learningMode === "SpecificTime"
//               ? learningDurationUnit
//               : null,
//         }),
//       }
//     );

//     const data = await response.json();

//     if (response.ok) {
//       Alert.alert(
//         "Success",
//         "Request sent successfully."
//       );

//       setRequestModal(false);

//       setLearningMode("FullTime");

//       setLearningDuration("");

//       setLearningDurationUnit("Weeks");
//     } else {
//       Alert.alert(
//         "Error",
//         data.message || "Request failed."
//       );
//     }
//   } catch (error) {
//     Alert.alert("Error", error.message);
//   }
// };

//   // ==========================
//   // ONE CARD FOR EACH SLOT
//   // ==========================
//   const filteredTutors = tutorsData
//     .flatMap((tutor) =>
//       (tutor.common_slots || []).map((slot, index) => ({
//         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

//         tutor_id: tutor.tutor_id,
//         tutor_name: tutor.tutor_name,
//         location: tutor.location,
//         distance: tutor.distance,
//         average_rating: tutor.average_rating,
//         total_reviews: tutor.total_reviews,

//         day: slot.day,
//         time: slot.time,

//         // NEW
//         is_available: slot.is_available,
//         availability_message: slot.availability_message,
//         request_type: slot.request_type,
//         class_date: slot.class_date,
//       }))
//     )
//     .filter((item) =>
//       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
//     );

//   // ==========================
//   // RENDER TUTOR
//   // ==========================
//   const renderTutor = ({ item }) => {
//   const unavailable = item.is_available === false;

//   return (
//     <View style={styles.card}>
//       <View style={styles.topRow}>
//         <Text style={styles.name}>{item.tutor_name}</Text>

//         <View style={styles.ratingBadge}>
//           <Text style={styles.ratingText}>
//             ⭐ {Number(item.average_rating || 0).toFixed(1)}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.info}>
//         📍 {item.location || "Unknown Location"}
//       </Text>

//       <Text style={styles.info}>
//         🚶 {Number(item.distance || 0).toFixed(2)} km away
//       </Text>

//       <Text style={styles.info}>
//         📝 {item.total_reviews} Reviews
//       </Text>

//       {/* SLOT */}

//       <View
//         style={[
//           styles.slotBox,
//           unavailable && styles.unavailableSlotBox,
//         ]}
//       >
//         <Text
//           style={[
//             styles.slotHeading,
//             unavailable && styles.unavailableHeading,
//           ]}
//         >
//           {unavailable ? "Unavailable Slot" : "Available Slot"}
//         </Text>

//         <Text style={styles.slotText}>
//           📅 {item.day}
//         </Text>

//         <Text style={styles.slotText}>
//           🕒 {item.time}
//         </Text>

//         {unavailable && (
//           <>
//             <View style={{ height: 8 }} />

//             <Text style={styles.unavailableMessage}>
//               {item.availability_message}
//             </Text>

//             <Text style={styles.requestType}>
//               {item.request_type}
//             </Text>
//           </>
//         )}
//       </View>

//       <TouchableOpacity
//         disabled={unavailable}
//         style={[
//           styles.primaryBtn,
//           unavailable && styles.disabledButton,
//         ]}
//         onPress={() => {
//           setSelectedTutor(item.tutor_id);
//           setSelectedDay(item.day);
//           setSelectedTime(item.time);
//           setRequestModal(true);
//         }}
//       >
//         <Text style={styles.primaryText}>
//           {unavailable ? "Unavailable" : "Request"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>
//         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
//         <View style={{ width: 26 }} />
//       </View>

//       {/* SEARCH */}
//       <View style={styles.searchBar}>
//         <Icon name="search" size={20} color="#666" />
//         <TextInput
//           placeholder="Search Tutor..."
//           value={search}
//           onChangeText={setSearch}
//           style={styles.input}
//         />
//       </View>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} />
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) => item.id}
//           renderItem={renderTutor}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No Tutor Found</Text>
//           }
//         />
//       )}

//       <Modal
//         visible={requestModal}
//         transparent
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalBox}>

//             <Text style={styles.modalTitle}>
//               Send Request
//             </Text>

//             <Text style={styles.label}>
//               Learning Mode
//             </Text>

//             <TouchableOpacity
//               style={[
//                 styles.modeButton,
//                 learningMode === "FullTime" &&
//                   styles.selectedMode,
//               ]}
//               onPress={() =>
//                 setLearningMode("FullTime")
//               }
//             >
//               <Text>Full Time</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.modeButton,
//                 learningMode === "SpecificTime" &&
//                   styles.selectedMode,
//               ]}
//               onPress={() =>
//                 setLearningMode("SpecificTime")
//               }
//             >
//               <Text>Specific Time</Text>
//             </TouchableOpacity>

//             {learningMode === "SpecificTime" && (
//               <>
//                 <TextInput
//                   placeholder="Duration"
//                   keyboardType="numeric"
//                   value={learningDuration}
//                   onChangeText={setLearningDuration}
//                   style={styles.inputBox}
//                 />

//                 <Picker
//                   selectedValue={
//                     learningDurationUnit
//                   }
//                   onValueChange={(v) =>
//                     setLearningDurationUnit(v)
//                   }
//                 >
//                   <Picker.Item
//                     label="Days"
//                     value="Days"
//                   />
//                   <Picker.Item
//                     label="Weeks"
//                     value="Weeks"
//                   />
//                   <Picker.Item
//                     label="Months"
//                     value="Months"
//                   />
//                 </Picker>
//               </>
//             )}

//             {/* For Date  */}
//             {/* <Text style={styles.label}>
//                 Select Class Date
//             </Text>

//             <TouchableOpacity
//                 style={styles.dateButton}
//                 onPress={() => setShowDatePicker(true)}
//             >
//                 <Text>
//                     {selectedClassDate.toDateString()}
//                 </Text>
//             </TouchableOpacity>

//             {showDatePicker && (
//                 <DateTimePicker
//                     value={selectedClassDate}
//                     mode="date"
//                     display="default"
//                     minimumDate={new Date()}
//                     onChange={(event, date) => {
//                         setShowDatePicker(false);

//                         if (date) {
//                             setSelectedClassDate(date);
//                         }
//                     }}
//                 />
//             )} */}

//             <TouchableOpacity
//               style={styles.primaryBtn}
//               onPress={sendRequest}
//             >
//               <Text style={styles.primaryText}>
//                 Send Request
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.cancelBtn}
//               onPress={() =>
//                 setRequestModal(false)
//               }
//             >
//               <Text>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// // Styles moved outside the component function block
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//     padding: 16,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: colors.primary,
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   input: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#000",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   name: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#222",
//     marginRight: 10,
//   },
//   ratingBadge: {
//     backgroundColor: "#FFF4CC",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   ratingText: {
//     color: "#B8860B",
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   info: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 4,
//   },
//   slotBox: {
//     backgroundColor: "#EAF7FF",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//   },
//   slotHeading: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: 8,
//   },
//   slotText: {
//     fontSize: 15,
//     color: "#333",
//     marginBottom: 4,
//   },
//   primaryBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   primaryText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#777",
//   },
//   unavailableSlotBox: {
//     backgroundColor: "#FFF8E1",
//     borderLeftColor: "#FF9800",
//   },

//   unavailableHeading: {
//     color: "#E65100",
//   },

//   unavailableMessage: {
//     color: "#D84315",
//     fontWeight: "700",
//     marginTop: 4,
//     fontSize: 14,
//   },

//   requestType: {
//     marginTop: 6,
//     color: "#FB8C00",
//     fontWeight: "bold",
//     fontSize: 13,
//   },

//   disabledButton: {
//     backgroundColor: "#BDBDBD",
//   },
//     modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.4)",
//   },

//   modalBox: {
//     margin: 20,
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },

//   label: {
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   modeButton: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//   },

//   selectedMode: {
//     borderColor: colors.primary,
//     backgroundColor: "#E3F2FD",
//   },

//   inputBox: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginVertical: 10,
//   },

//   cancelBtn: {
//     alignItems: "center",
//     marginTop: 12,
//   },
// });

// export default StudentFindTutor;




























// // Hide all Normal accepted classes
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentFindTutor = ({ navigation, route }) => {
//   const { courseId, courseName, userLat, userLng } = route.params || {};

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   // ==========================
//   // FETCH TUTORS
//   // ==========================
//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       if (!courseId || userLat == null || userLng == null) {
//         Alert.alert("Error", "Missing required data");
//         navigation.goBack();
//         return;
//       }

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutorsData(Array.isArray(data) ? data : []);
//       } else {
//         setTutorsData([]);
//         Alert.alert("Info", data.message || "No tutors found.");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Unable to load tutors.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================
//   // SEND REQUEST
//   // ==========================
//   const sendRequest = async (tutorId, day, time) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(`${BASE_URL}/Student/create-request`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           tutor_id: tutorId,
//           course_id: courseId,
//           day: day,
//           time: time,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Request sent successfully.");
//       } else {
//         Alert.alert("Error", data.message || "Request failed.");
//       }
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     }
//   };

//   // ==========================
//   // ONE CARD FOR EACH SLOT
//   // ==========================
//   const filteredTutors = tutorsData
//     .flatMap((tutor) =>
//       (tutor.common_slots || []).map((slot, index) => ({
//         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,

//         tutor_id: tutor.tutor_id,
//         tutor_name: tutor.tutor_name,
//         location: tutor.location,
//         distance: tutor.distance,
//         average_rating: tutor.average_rating,
//         total_reviews: tutor.total_reviews,

//         day: slot.day,
//         time: slot.time,

//         // NEW
//         is_available: slot.is_available,
//         availability_message: slot.availability_message,
//         request_type: slot.request_type,
//         class_date: slot.class_date,
//       }))
//     )
//     .filter((item) =>
//       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
//     );

//   // ==========================
//   // RENDER TUTOR
//   // ==========================
//   const renderTutor = ({ item }) => {
//   const unavailable = item.is_available === false;

//   return (
//     <View style={styles.card}>
//       <View style={styles.topRow}>
//         <Text style={styles.name}>{item.tutor_name}</Text>

//         <View style={styles.ratingBadge}>
//           <Text style={styles.ratingText}>
//             ⭐ {Number(item.average_rating || 0).toFixed(1)}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.info}>
//         📍 {item.location || "Unknown Location"}
//       </Text>

//       <Text style={styles.info}>
//         🚶 {Number(item.distance || 0).toFixed(2)} km away
//       </Text>

//       <Text style={styles.info}>
//         📝 {item.total_reviews} Reviews
//       </Text>

//       {/* SLOT */}

//       <View
//         style={[
//           styles.slotBox,
//           unavailable && styles.unavailableSlotBox,
//         ]}
//       >
//         <Text
//           style={[
//             styles.slotHeading,
//             unavailable && styles.unavailableHeading,
//           ]}
//         >
//           {unavailable ? "Unavailable Slot" : "Available Slot"}
//         </Text>

//         <Text style={styles.slotText}>
//           📅 {item.day}
//         </Text>

//         <Text style={styles.slotText}>
//           🕒 {item.time}
//         </Text>

//         {unavailable && (
//           <>
//             <View style={{ height: 8 }} />

//             <Text style={styles.unavailableMessage}>
//               {item.availability_message}
//             </Text>

//             <Text style={styles.requestType}>
//               {item.request_type}
//             </Text>
//           </>
//         )}
//       </View>

//       <TouchableOpacity
//         disabled={unavailable}
//         style={[
//           styles.primaryBtn,
//           unavailable && styles.disabledButton,
//         ]}
//         onPress={() =>
//           sendRequest(item.tutor_id, item.day, item.time)
//         }
//       >
//         <Text style={styles.primaryText}>
//           {unavailable ? "Unavailable" : "Request"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>
//         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
//         <View style={{ width: 26 }} />
//       </View>

//       {/* SEARCH */}
//       <View style={styles.searchBar}>
//         <Icon name="search" size={20} color="#666" />
//         <TextInput
//           placeholder="Search Tutor..."
//           value={search}
//           onChangeText={setSearch}
//           style={styles.input}
//         />
//       </View>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} />
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) => item.id}
//           renderItem={renderTutor}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No Tutor Found</Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// // Styles moved outside the component function block
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//     padding: 16,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: colors.primary,
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   input: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#000",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   name: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#222",
//     marginRight: 10,
//   },
//   ratingBadge: {
//     backgroundColor: "#FFF4CC",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   ratingText: {
//     color: "#B8860B",
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   info: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 4,
//   },
//   slotBox: {
//     backgroundColor: "#EAF7FF",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//   },
//   slotHeading: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: 8,
//   },
//   slotText: {
//     fontSize: 15,
//     color: "#333",
//     marginBottom: 4,
//   },
//   primaryBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   primaryText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#777",
//   },
//   unavailableSlotBox: {
//     backgroundColor: "#FFF8E1",
//     borderLeftColor: "#FF9800",
//   },

//   unavailableHeading: {
//     color: "#E65100",
//   },

//   unavailableMessage: {
//     color: "#D84315",
//     fontWeight: "700",
//     marginTop: 4,
//     fontSize: 14,
//   },

//   requestType: {
//     marginTop: 6,
//     color: "#FB8C00",
//     fontWeight: "bold",
//     fontSize: 13,
//   },

//   disabledButton: {
//     backgroundColor: "#BDBDBD",
//   },
// });

// export default StudentFindTutor;





























// // Hide all accepted classes
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentFindTutor = ({ navigation, route }) => {
//   const { courseId, courseName, userLat, userLng } = route.params || {};

//   const [tutorsData, setTutorsData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   // ==========================
//   // FETCH TUTORS
//   // ==========================
//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       if (!courseId || userLat == null || userLng == null) {
//         Alert.alert("Error", "Missing required data");
//         navigation.goBack();
//         return;
//       }

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         setTutorsData(Array.isArray(data) ? data : []);
//       } else {
//         setTutorsData([]);
//         Alert.alert("Info", data.message || "No tutors found.");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Unable to load tutors.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==========================
//   // SEND REQUEST
//   // ==========================
//   const sendRequest = async (tutorId, day, time) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(`${BASE_URL}/Student/create-request`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           tutor_id: tutorId,
//           course_id: courseId,
//           day: day,
//           time: time,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Request sent successfully.");
//       } else {
//         Alert.alert("Error", data.message || "Request failed.");
//       }
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     }
//   };

//   // ==========================
//   // ONE CARD FOR EACH SLOT
//   // ==========================
//   const filteredTutors = tutorsData
//     .flatMap((tutor) =>
//       (tutor.common_slots || []).map((slot, index) => ({
//         id: `${tutor.tutor_id}-${slot.day}-${slot.time}-${index}`,
//         tutor_id: tutor.tutor_id,
//         tutor_name: tutor.tutor_name,
//         location: tutor.location,
//         distance: tutor.distance,
//         average_rating: tutor.average_rating,
//         total_reviews: tutor.total_reviews,
//         day: slot.day,
//         time: slot.time,
//       }))
//     )
//     .filter((item) =>
//       item.tutor_name?.toLowerCase().includes(search.toLowerCase())
//     );

//   // ==========================
//   // RENDER TUTOR
//   // ==========================
//   const renderTutor = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.topRow}>
//         <Text style={styles.name}>{item.tutor_name}</Text>
//         <View style={styles.ratingBadge}>
//           <Text style={styles.ratingText}>
//             ⭐ {Number(item.average_rating || 0).toFixed(1)}
//           </Text>
//         </View>
//       </View>

//       <Text style={styles.info}>📍 {item.location || "Unknown Location"}</Text>
//       <Text style={styles.info}>
//         🚶 {Number(item.distance || 0).toFixed(2)} km away
//       </Text>
//       <Text style={styles.info}>📝 {item.total_reviews} Reviews</Text>

//       {/* SLOT */}
//       <View style={styles.slotBox}>
//         <Text style={styles.slotHeading}>Available Slot</Text>
//         <Text style={styles.slotText}>📅 {item.day}</Text>
//         <Text style={styles.slotText}>🕒 {item.time}</Text>
//       </View>

//       <TouchableOpacity
//         style={styles.primaryBtn}
//         onPress={() => sendRequest(item.tutor_id, item.day, item.time)}
//       >
//         <Text style={styles.primaryText}>Request</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>
//         <Text style={styles.title}>{courseName || "Find Tutor"}</Text>
//         <View style={{ width: 26 }} />
//       </View>

//       {/* SEARCH */}
//       <View style={styles.searchBar}>
//         <Icon name="search" size={20} color="#666" />
//         <TextInput
//           placeholder="Search Tutor..."
//           value={search}
//           onChangeText={setSearch}
//           style={styles.input}
//         />
//       </View>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator size="large" color={colors.primary} />
//       ) : (
//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) => item.id}
//           renderItem={renderTutor}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No Tutor Found</Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// // Styles moved outside the component function block
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//     padding: 16,
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 15,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: colors.primary,
//   },
//   searchBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     marginBottom: 15,
//     elevation: 2,
//   },
//   input: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#000",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 15,
//     elevation: 3,
//   },
//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   name: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#222",
//     marginRight: 10,
//   },
//   ratingBadge: {
//     backgroundColor: "#FFF4CC",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   ratingText: {
//     color: "#B8860B",
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   info: {
//     fontSize: 14,
//     color: "#555",
//     marginTop: 4,
//   },
//   slotBox: {
//     backgroundColor: "#EAF7FF",
//     borderRadius: 10,
//     padding: 12,
//     marginTop: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//   },
//   slotHeading: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: 8,
//   },
//   slotText: {
//     fontSize: 15,
//     color: "#333",
//     marginBottom: 4,
//   },
//   primaryBtn: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 15,
//   },
//   primaryText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 16,
//     color: "#777",
//   },
// });

// export default StudentFindTutor;






































// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TextInput,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Platform,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentFindTutor = ({ navigation, route }) => {

//   const {courseId,courseName, userLat,userLng,} = route.params || {};

//   const [tutorsData, setTutorsData] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [search, setSearch] =
//     useState("");



// useEffect(() => {
//     fetchTutors();
// }, []);

//   // FETCH TUTORS
//   const fetchTutors = async () => {

//     try {

//       setLoading(true);

//       if (
//           !courseId ||
//           userLat == null ||
//           userLng == null
//       ) {
//           Alert.alert("Error", "Missing required data");
//           navigation.goBack();
//           return;
//       }
//       // const url =
//       //   // `${BASE_URL}/Student/search-by-time-location?day=${formattedDay}&time=${formattedTime}&userLat=${userLat}&userLng=${userLng}&courseId=${course_id}`;
//       //   `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`
//         const token = await AsyncStorage.getItem("token");

//         const response = await fetch(
//         `${BASE_URL}/Student/search-by-time-location?courseId=${courseId}&userLat=${userLat}&userLng=${userLng}`,
//         {
//             headers:{
//                 Authorization:`Bearer ${token}`
//             }
//         });

//       const data =
//         await response.json();

//       if (response.ok) {

//         setTutorsData(
//           Array.isArray(data)
//             ? data
//             : []
//         );

//       } else {

//         setTutorsData([]);

//         Alert.alert(
//           "Info",
//           data.message ||
//             "No tutors found"
//         );
//       }

//     } catch (error) {

//       console.log(
//         "Fetch Error:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error.message
//       );

//     } finally {

//       setLoading(false);
//     }
//   };

//   // SEND REQUEST
// const sendRequest = async (
//   tutorId,
//   day,
//   time
// ) => {

//     try {

//       const token =
//         await AsyncStorage.getItem(
//           "token"
//         );

//       if (!token) {

//         Alert.alert(
//           "Error",
//           "User not logged in"
//         );

//         return;
//       }

//       const response = await fetch(
//         `${BASE_URL}/Student/create-request`,
//         {
//           method: "POST",

//           headers: {
//             "Content-Type":
//               "application/json",

//             Authorization:
//               `Bearer ${token}`,
//           },

//           body: JSON.stringify({

//             tutor_id: tutorId,

//             course_id: course_id,

//             day: day,

//             time: time,

//             class_date:
//               formatDate(
//                 selectedDate
//               ),
//           }),
//         }
//       );

//       const data =
//         await response.json();

//       if (response.ok) {

//         Alert.alert(
//           "Success",
//           "Request sent successfully"
//         );

//       } else {

//         Alert.alert(
//           "Error",
//           data.message ||
//             "Request failed"
//         );
//       }

//     } catch (error) {

//       console.log(
//         "Request Error:",
//         error
//       );

//       Alert.alert(
//         "Error",
//         error.message
//       );
//     }
//   };

//   // FILTER SEARCH
//  const filteredTutors = tutorsData
//   .flatMap((tutor) =>
//     (tutor.common_slots || []).map((slot) => ({
//       tutor_id: tutor.tutor_id,
//       tutor_name: tutor.tutor_name,
//       location: tutor.location,
//       distance: tutor.distance,
//       average_rating: tutor.average_rating,
//       total_reviews: tutor.total_reviews,
//       day: slot.day,
//       time: slot.time,
//     }))
//   )
//   .filter((item) =>
//     item.tutor_name
//       ?.toLowerCase()
//       .includes(search.toLowerCase())
//   );

// const renderTutor = ({ item }) => (
//   <View style={styles.card}>

//     <View style={styles.topRow}>
//       <Text style={styles.name}>
//         {item.tutor_name}
//       </Text>

//       <View style={styles.ratingBadge}>
//         <Text style={styles.ratingText}>
//           ⭐ {Number(item.average_rating || 0).toFixed(1)}
//         </Text>
//       </View>
//     </View>

//     {/* <Text style={styles.info}>
//       📍 {item.location || "Unknown location"}
//     </Text> */}

//     <Text style={styles.info}>
//       🚶 {Number(item.distance || 0).toFixed(2)} km away
//     </Text>

//     <Text style={styles.info}>
//       📝 {item.total_reviews} Reviews
//     </Text>

//     <View style={styles.slotBox}>
//       <Text style={styles.slotTitle}>
//         Available Slot
//       </Text>

//       <Text style={styles.slotText}>
//         📅 {item.day}
//       </Text>

//       <Text style={styles.slotText}>
//         🕒 {item.time}
//       </Text>
//     </View>

//     <TouchableOpacity
//       style={styles.primaryBtn}
//       onPress={() =>
//         sendRequest(
//           item.tutor_id,
//           item.day,
//           item.time
//         )
//       }
//     >
//       <Text style={styles.primaryText}>
//         Request
//       </Text>
//     </TouchableOpacity>

//   </View>
// );

//   return (

//     <SafeAreaView
//       style={styles.container}
//     >

//       {/* HEADER */}
//       <View style={styles.header}>

//         <TouchableOpacity
//           onPress={() =>
//             navigation.goBack()
//           }
//         >

//           <Icon
//             name="arrow-back"
//             size={26}
//             color={colors.primary}
//           />

//         </TouchableOpacity>

//         <Text style={styles.title}>
//           Find Tutor
//         </Text>

//         <View
//           style={{ width: 26 }}
//         />

//       </View>

//       {/* SEARCH */}
//       <View
//         style={styles.searchBar}
//       >

//         <Icon
//           name="search"
//           size={20}
//           color="#666"
//         />

//         <TextInput
//           placeholder="Search tutor..."
//           style={styles.input}
//           value={search}
//           onChangeText={
//             setSearch
//           }
//         />

//       </View>

//       {/* LIST */}
//       {loading ? (

//         <ActivityIndicator
//           size="large"
//           color={colors.primary}
//         />

//       ) : (

//         <FlatList
//           data={filteredTutors}
//           keyExtractor={(item) =>
//             item.tutor_id.toString()
//           }
//           renderItem={renderTutor}
//           contentContainerStyle={{
//             paddingBottom: 100,
//           }}
//           ListEmptyComponent={

//             <Text
//               style={
//                 styles.emptyText
//               }
//             >
//               No tutor found in
//               your area
//             </Text>
//           }
//         />
//       )}

//     </SafeAreaView>
//   );
// };

// export default StudentFindTutor;

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor:
//       "#F4F6F9",
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent:
//       "space-between",
//     alignItems: "center",
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: colors.primary,
//   },

//   selectedBox: {
//     backgroundColor:
//       "#caf8dd",
//     padding: 10,
//     borderRadius: 8,
//     marginVertical: 10,
//   },

//   selectedText: {
//     color: colors.primary,
//     fontWeight: "600",
//   },

//   // DATE BOX
//   dateBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 12,
//     elevation: 2,
//   },

//   dateText: {
//     marginLeft: 10,
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#000",
//   },

//   searchBar: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 10,
//     alignItems: "center",
//   },

//   input: {
//     marginLeft: 10,
//     flex: 1,
//   },

//   card: {
//     backgroundColor: "#fff",
//     padding: 15,
//     marginBottom: 10,
//     borderRadius: 10,
//     elevation: 2,
//   },

//   name: {
//     fontWeight: "bold",
//     marginBottom: 5,
//     fontSize: 16,
//     color: "#000",
//   },

//   info: {
//     color: "#666",
//     marginTop: 2,
//   },

//   primaryBtn: {
//     backgroundColor:
//       colors.primary,
//     padding: 10,
//     borderRadius: 6,
//     marginTop: 10,
//     alignItems: "center",
//   },

//   primaryText: {
//     color: "#fff",
//     fontWeight: "600",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: "#999",
//   },
//   topRow: {
//   flexDirection: "row",
//   justifyContent: "space-between",
//   alignItems: "center",
//   marginBottom: 8,
// },

// ratingBadge: {
//   backgroundColor: "#FFF4CC",
//   paddingHorizontal: 10,
//   paddingVertical: 4,
//   borderRadius: 20,
// },

// ratingText: {
//   color: "#B8860B",
//   fontWeight: "bold",
//   fontSize: 14,
// },
// slotBox: {
//   backgroundColor: "#EEF8FF",
//   padding: 10,
//   borderRadius: 8,
//   marginTop: 10,
// },

// slotTitle: {
//   fontWeight: "bold",
//   color: colors.primary,
//   marginBottom: 5,
//   fontSize: 15,
// },

// slotText: {
//   fontSize: 14,
//   color: "#333",
//   marginTop: 3,
// },
// });
