import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/api";

const ENDPOINTS = {
  CANCELLED_CLASSES: `${BASE_URL}/Tutor/cancel-classes`,
  RESCHEDULE: `${BASE_URL}/Tutor/reschedule`,
};

const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

/**
 * Builds the auth headers required for authenticated API calls.
 * Throws if no token is available so callers can handle the
 * "not logged in" case explicitly.
 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No authentication token found.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const TutorCancelledClasses = () => {
  const navigation = useNavigation();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reschedulingId, setReschedulingId] = useState(null);

  const fetchCancelledClasses = useCallback(async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(ENDPOINTS.CANCELLED_CLASSES, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setClasses(result.data ?? []);
      } else {
        setClasses([]);
        Alert.alert("Error", result.message || GENERIC_ERROR_MESSAGE);
      }
    } catch (error) {
      console.log("fetchCancelledClasses error:", error);
      Alert.alert("Error", "Unable to fetch cancelled classes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCancelledClasses();
  }, [fetchCancelledClasses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCancelledClasses();
  }, [fetchCancelledClasses]);

  const handleReschedule = useCallback(
    async (requestId) => {
      setReschedulingId(requestId);

      try {
        const headers = await getAuthHeaders();
        const response = await fetch(ENDPOINTS.RESCHEDULE, {
          method: "POST",
          headers,
          body: JSON.stringify({ requestId }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          Alert.alert("Error", result.message || GENERIC_ERROR_MESSAGE);
          return;
        }

        if (result.autoScheduled) {
          Alert.alert(
            "Success",
            `Class automatically rescheduled.\n\nDay: ${result.data.day}\nTime: ${result.data.time}\nDate: ${formatDate(
              result.data.classDate
            )}`
          );
          fetchCancelledClasses();
          return;
        }

        if (result.manualRequired) {
          Alert.alert("Manual Reschedule", result.message, [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("TutorManualReschedule", {
                  requestId: result.data.requestId,
                  studentId: result.data.studentId,
                  courseId: result.data.courseId,
                });
              },
            },
          ]);
          return;
        }

        Alert.alert("Success", result.message || "Class rescheduled.");
      } catch (error) {
        console.log("handleReschedule error:", error);
        Alert.alert("Error", "Unable to reschedule class.");
      } finally {
        setReschedulingId(null);
      }
    },
    [fetchCancelledClasses, navigation]
  );

  const confirmReschedule = useCallback(
    (requestId) => {
      Alert.alert(
        "Reschedule",
        "Are you sure you want to reschedule this class?",
        [
          { text: "No", style: "cancel" },
          { text: "Yes", onPress: () => handleReschedule(requestId) },
        ]
      );
    },
    [handleReschedule]
  );

  const renderItem = ({ item }) => {
    const isRescheduling = reschedulingId === item.request_id;

    return (
      <View style={styles.card}>
        <InfoRow label="Student" value={item.student_name} />
        <InfoRow label="Course" value={item.course_name} />
        <InfoRow label="Date" value={formatDate(item.class_date)} />
        <InfoRow label="Day" value={item.day} />
        <InfoRow label="Time" value={item.time} />
        <InfoRow label="Request Type" value={item.request_type} />

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.rescheduleButton, isRescheduling && styles.rescheduleButtonDisabled]}
          onPress={() => confirmReschedule(item.request_id)}
          disabled={isRescheduling}
          accessibilityRole="button"
          accessibilityLabel={`Reschedule class with ${item.student_name}`}
        >
          {isRescheduling ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Reschedule</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Spacer to keep the logo centered */}
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.request_id.toString()}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[
          styles.listContent,
          classes.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Cancelled Classes Found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value ?? "-"}</Text>
  </View>
);

export default TutorCancelledClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    height: 65,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    elevation: 3,
  },

  backButton: {
    width: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 150,
    height: 45,
  },

  listContent: {
    paddingBottom: 20,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    padding: 15,
    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
    alignItems: "center",
  },

  label: {
    fontWeight: "bold",
    color: "#444",
    fontSize: 15,
  },

  value: {
    color: "#555",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },

  statusBox: {
    backgroundColor: "#E53935",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },

  statusText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
  },

  rescheduleButton: {
    marginTop: 12,
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },

  rescheduleButtonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    fontSize: 17,
    color: "#777",
  },
});




























// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//  StyleSheet,
//   SafeAreaView,
//   FlatList,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   Image,
//   Alert,
// } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useNavigation } from "@react-navigation/native";
// import { BASE_URL } from "../../config/api";

// const TutorCancelledClasses = (navigation) => {
//   const [classes, setClasses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchCancelledClasses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/cancel-classes`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const result = await response.json();

//       if (result.success) {
//         setClasses(result.data || []);
//       } else {
//         setClasses([]);
//         alert(result.message);
//       }
//     } catch (error) {
//       console.log(error);
//       alert("Unable to fetch cancelled classes.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchCancelledClasses();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchCancelledClasses();
//   }, []);

//   const handleReschedule = async (requestId) => {
//   try {
//     const token = await AsyncStorage.getItem("token");

//     const response = await fetch(`${BASE_URL}/Tutor/reschedule`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         requestId: requestId,
//       }),
//     });

//     const result = await response.json();

//     if (result.success) {
//       if (result.autoScheduled) {
//         Alert.alert(
//           "Success",
//           `Class automatically rescheduled.

// Day: ${result.data.day}
// Time: ${result.data.time}
// Date: ${new Date(result.data.classDate).toLocaleDateString()}`
//         );

//         fetchCancelledClasses();
//       } else if (result.manualRequired) {
//         Alert.alert(
//           "Manual Reschedule",
//           result.message,
//           [
//             {
//               text: "OK",
//               onPress: () => {
//                 // Navigate to Manual Reschedule Screen if needed
//                 // navigation.navigate("TutorManualReschedule", {
//                 //   requestId: result.data.requestId,
//                 //   studentId: result.data.studentId,
//                 //   courseId: result.data.courseId,
//                 // });
//               },
//             },
//           ]
//         );
//       } else {
//         Alert.alert("Success", result.message);
//       }
//     } else {
//       Alert.alert("Error", result.message);
//     }
//   } catch (error) {
//     console.log(error);
//     Alert.alert("Error", "Unable to reschedule class.");
//   }
// };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.row}>
//         <Text style={styles.label}>Student</Text>
//         <Text style={styles.value}>{item.student_name}</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Course</Text>
//         <Text style={styles.value}>{item.course_name}</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Date</Text>
//         <Text style={styles.value}>
//           {new Date(item.class_date).toLocaleDateString()}
//         </Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Day</Text>
//         <Text style={styles.value}>{item.day}</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Time</Text>
//         <Text style={styles.value}>{item.time}</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Request Type</Text>
//         <Text style={styles.value}>{item.request_type}</Text>
//       </View>

//       <View style={styles.row}>
//         <Text style={styles.label}>Status</Text>

//         <View style={styles.statusBox}>
//           <Text style={styles.statusText}>{item.status}</Text>
//         </View>
        
//         <View style={styles.buttonContainer}>
//   <TouchableOpacity
//     style={styles.rescheduleButton}
//     onPress={() =>
//       Alert.alert(
//         "Reschedule",
//         "Are you sure you want to reschedule this class?",
//         [
//           {
//             text: "No",
//             style: "cancel",
//           },
//           {
//             text: "Yes",
//             onPress: () => handleReschedule(item.request_id),
//           },
//         ]
//       )
//     }
//   >
//     <Text style={styles.buttonText}>Reschedule</Text>
//   </TouchableOpacity>
// </View>

//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loaderContainer}>
//         <ActivityIndicator size="large" color="#E53935" />
//       </SafeAreaView>
//     );
//   }

//   return (
//   <SafeAreaView style={styles.container}>

//     {/* Header */}
//     <View style={styles.header}>
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Icon name="arrow-back" size={28} color="#000" />
//       </TouchableOpacity>

//       <Image
//         source={require("../../../assets/images/logo.png")} 
//         style={styles.logo}
//         resizeMode="contain"
//       />

//       {/* Empty view to balance header */}
//       <View style={styles.backButton} />
//     </View>

//     <FlatList
//       data={classes}
//       keyExtractor={(item) => item.request_id.toString()}
//       renderItem={renderItem}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//         />
//       }
//       contentContainerStyle={{
//         paddingBottom: 20,
//         flexGrow: classes.length === 0 ? 1 : 0,
//       }}
//       ListEmptyComponent={
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>
//             No Cancelled Classes Found
//           </Text>
//         </View>
//       }
//     />
//   </SafeAreaView>
// );
// };

// export default TutorCancelledClasses;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F5F5",
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   card: {
//     backgroundColor: "#FFF",
//     marginHorizontal: 15,
//     marginVertical: 8,
//     borderRadius: 10,
//     padding: 15,
//     elevation: 3,
//   },

//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginVertical: 5,
//   },

//   label: {
//     fontWeight: "bold",
//     color: "#444",
//     fontSize: 15,
//   },

//   value: {
//     color: "#555",
//     fontSize: 15,
//     flex: 1,
//     textAlign: "right",
//     marginLeft: 10,
//   },

//   statusBox: {
//     backgroundColor: "#E53935",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 15,
//   },

//   statusText: {
//     color: "#FFF",
//     fontWeight: "bold",
//   },

//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 80,
//   },

//   emptyText: {
//     fontSize: 17,
//     color: "#777",
//   },
//     header: {
//     height: 65,
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E5E5",
//     elevation: 3,
//   },

//   backButton: {
//     width: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   logo: {
//     width: 150,
//     height: 45,
//   },
//   buttonContainer: {
//   marginTop: 18,
// },

// rescheduleButton: {
//   backgroundColor: "#2196F3",
//   paddingVertical: 12,
//   borderRadius: 8,
//   alignItems: "center",
// },

// buttonText: {
//   color: "#FFF",
//   fontSize: 16,
//   fontWeight: "bold",
// },
// });

