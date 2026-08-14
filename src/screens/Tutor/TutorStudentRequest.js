import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const TutorStudentRequest = ({ navigation }) => {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {

      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/my-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      console.log("REQUEST RESPONSE:", text);

      const data = text ? JSON.parse(text) : [];

      if (response.ok && data.success) {
        setRequests(data.data || []);
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to load requests"
        );
        setRequests([]);
      }

    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/accept-request/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        Alert.alert("Success", "Request Accepted");

        setRequests((prev) =>
          prev.filter((item) => item.request_id !== id)
        );

      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to accept request"
        );
      }

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleReject = async (id) => {
    try {

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/reject-request/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        Alert.alert("Rejected", "Request Rejected");

        setRequests((prev) =>
          prev.filter((item) => item.request_id !== id)
        );

      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to reject request"
        );
      }

    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleSeeProfile = (item) => {

  console.log("FULL ITEM:", item);

  console.log("STUDENT ID:", item.student_id);

  if (!item.student_id) {
    Alert.alert("Error", "Student ID not found");
    return;
  }

  navigation.navigate("StudentProfile", {
    studentId: item.student_id,
  });
};

  const renderItem = ({ item }) => (
    <View style={styles.card}>

      <View style={styles.cardHeader}>

        <Text style={styles.requestText}>
          Teaching Request
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.course_name}
          </Text>
        </View>

      </View>

      <Text style={styles.name}>
        {item.student_name}
      </Text>

      <View style={styles.divider} />

      <Text style={styles.details}>
        📩 Request Date:{" "}
        {item.request_date
          ? item.request_date.split("T")[0]
          : "N/A"}
      </Text>

      <Text style={styles.details}>
        📅 Class Date:{" "}
        {item.class_date
          ? item.class_date.split("T")[0]
          : "Not Selected"}
      </Text>

      <Text style={styles.details}>
        🗓️ Day: {item.day || "N/A"}
      </Text>

      <Text style={styles.details}>
        🕒 Time: {item.time || "N/A"}
      </Text>

      <Text style={styles.details}>
        📌 Request Type: {item.request_type || "Normal"}
      </Text>

      {/* See Profile */}
      <TouchableOpacity
        style={styles.profileBtn}
        onPress={() => handleSeeProfile(item)}
      >
        <Icon
          name="person"
          size={18}
          color="#fff"
        />

        <Text style={styles.profileText}>
          See Profile
        </Text>
      </TouchableOpacity>

      {/* Accept Reject */}
      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() =>
            handleAccept(item.request_id)
          }
        >
          <Text style={styles.acceptText}>
            Accept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() =>
            handleReject(item.request_id)
          }
        >
          <Text style={styles.declineText}>
            Reject
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("TutorDrawer")
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

      {/* List */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) =>
            item.request_id.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No pending requests
            </Text>
          }
        />
      )}

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

        <TouchableOpacity style={styles.navItem}>
          <Icon
            name="description"
            size={24}
            color={colors.primary}
          />

          <Text style={styles.activeTab}>
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("TutorAddSubject")
          }
        >
          <Icon
            name="add-box"
            size={24}
            color="#999"
          />

          <Text style={styles.inactiveTab}>
            Add
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default TutorStudentRequest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  requestText: {
    fontSize: 12,
    color: "#888",
  },

  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    marginTop: 6,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },

  details: {
    fontSize: 13,
    color: "#444",
    marginBottom: 5,
    lineHeight: 20,
  },

  profileBtn: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },

  profileText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },

  buttonRow: {
    flexDirection: "row",
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 6,
    alignItems: "center",
  },

  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e74c3c",
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 6,
    alignItems: "center",
  },

  acceptText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  declineText: {
    color: "#e74c3c",
    fontWeight: "600",
    fontSize: 12,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
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
    marginTop: 2,
  },

  inactiveTab: {
    fontSize: 11,
    color: "#999",
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
//   FlatList,
//   Image,
//   Alert,
//   ActivityIndicator,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const TutorStudentRequest = ({ navigation }) => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   const fetchRequests = async () => {
//     try {
//       setLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(`${BASE_URL}/Tutor/my-requests`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const text = await response.text();

//       console.log("REQUEST RESPONSE:", text);

//       const data = text ? JSON.parse(text) : [];

//       if (response.ok) {
//         setRequests(data);
//       } else {
//         Alert.alert("Error", data.message || "Failed to load requests");
//       }
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAccept = async (id) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/accept-request/${id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Request Accepted");

//         setRequests((prev) =>
//           prev.filter((item) => item.request_id !== id)
//         );
//       } else {
//         Alert.alert("Error", data.message || "Failed to accept request");
//       }
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     }
//   };

//   const handleReject = async (id) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/reject-request/${id}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Rejected", "Request Rejected");

//         setRequests((prev) =>
//           prev.filter((item) => item.request_id !== id)
//         );
//       } else {
//         Alert.alert("Error", data.message || "Failed to reject request");
//       }
//     } catch (error) {
//       Alert.alert("Error", error.message);
//     }
//   };

//   const handleSeeProfile = (item) => {
//     navigation.navigate("StudentProfile", {
//       studentId: item.student_id,
//       studentName: item.student_name,
//     });
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <Text style={styles.requestText}>Teaching Request</Text>

//         <View style={styles.badge}>
//           <Text style={styles.badgeText}>{item.course_name}</Text>
//         </View>
//       </View>

//       <Text style={styles.name}>{item.student_name}</Text>

//       <View style={styles.divider} />

//       <Text style={styles.details}>
//         📅{" "}
//         {item.request_date
//           ? item.request_date.split("T")[0]
//           : ""}
//       </Text>

//       {/* See Profile Button */}
//       <TouchableOpacity
//         style={styles.profileBtn}
//         onPress={() => navigation.navigate("StudentProfile")}
//       >
//         <Icon name="person" size={18} color="#fff" />

//         <Text style={styles.profileText}>See Profile</Text>
//       </TouchableOpacity>

//       {/* Accept Reject Buttons */}
//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           style={styles.acceptBtn}
//           onPress={() => handleAccept(item.request_id)}
//         >
//           <Text style={styles.acceptText}>Accept</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.declineBtn}
//           onPress={() => handleReject(item.request_id)}
//         >
//           <Text style={styles.declineText}>Reject</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.navigate("TutorDrawer")}
//         >
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

//       {/* Request List */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator
//             size="large"
//             color={colors.primary}
//           />
//         </View>
//       ) : (
//         <FlatList
//           data={requests}
//           keyExtractor={(item) => item.request_id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               No pending requests
//             </Text>
//           }
//         />
//       )}

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("TutorHome")}
//         >
//           <Icon
//             name="calendar-month"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.inactiveTab}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem}>
//           <Icon
//             name="description"
//             size={24}
//             color={colors.primary}
//           />

//           <Text style={styles.activeTab}>Request</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("TutorTodayClasses")
//           }
//         >
//           <Icon name="school" size={24} color="#999" />

//           <Text style={styles.inactiveTab}>Today</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("TutorAddSubject")
//           }
//         >
//           <Icon name="add-box" size={24} color="#999" />

//           <Text style={styles.inactiveTab}>Add</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default TutorStudentRequest;

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
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 30,
//     color: "#777",
//     fontSize: 14,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 14,
//     elevation: 3,
//   },

//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   requestText: {
//     fontSize: 12,
//     color: "#888",
//   },

//   badge: {
//     backgroundColor: colors.primary,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },

//   badgeText: {
//     color: "#fff",
//     fontSize: 11,
//     fontWeight: "600",
//   },

//   name: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: colors.primary,
//     marginTop: 8,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#eee",
//     marginVertical: 10,
//   },

//   details: {
//     fontSize: 13,
//     color: "#444",
//     marginBottom: 10,
//   },

//   profileBtn: {
//     backgroundColor: "#3498db",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 10,
//     borderRadius: 10,
//     marginBottom: 12,
//   },

//   profileText: {
//     color: "#fff",
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 6,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   acceptBtn: {
//     flex: 1,
//     backgroundColor: colors.primary,
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginRight: 8,
//     alignItems: "center",
//   },

//   declineBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#e74c3c",
//     paddingVertical: 10,
//     borderRadius: 20,
//     marginLeft: 8,
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },

//   acceptText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 13,
//   },

//   declineText: {
//     color: "#e74c3c",
//     fontWeight: "600",
//     fontSize: 13,
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     flexDirection: "row",
//     justifyContent: "space-around",
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
//     fontWeight: "600",
//   },

//   inactiveTab: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },
// });


















// // import React, { useEffect, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   SafeAreaView,
// //   TouchableOpacity,
// //   FlatList,
// //   Image,
// //   Alert,
// //   ActivityIndicator,
// // } from "react-native";
// // import Icon from "react-native-vector-icons/MaterialIcons";
// // import colors from "../utils/colors";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { BASE_URL } from "../../config/api";

// // const TutorStudentRequest = ({ navigation }) => {
// //   const [requests, setRequests] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     fetchRequests();
// //   }, []);

// //   const fetchRequests = async () => {
// //     try {
// //       setLoading(true);

// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(`${BASE_URL}/Tutor/my-requests`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //         },
// //       });

// //       const text = await response.text();
// //       console.log("REQUEST RESPONSE:", text);

// //       const data = text ? JSON.parse(text) : [];

// //       if (response.ok) {
// //         setRequests(data);
// //       } else {
// //         Alert.alert("Error", data.message || "Failed to load requests");
// //       }

// //     } catch (error) {
// //       Alert.alert("Error", error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleAccept = async (id) => {
// //     try {
// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(
// //         `${BASE_URL}/Tutor/accept-request/${id}`,
// //         {
// //           method: "PUT",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok) {
// //         Alert.alert("Success", "Request Accepted");

// //         setRequests((prev) =>
// //           prev.filter((item) => item.request_id !== id)
// //         );
// //       } else {
// //         Alert.alert("Error", data.message);
// //       }

// //     } catch (error) {
// //       Alert.alert("Error", error.message);
// //     }
// //   };

// //   const handleReject = async (id) => {
// //     try {
// //       const token = await AsyncStorage.getItem("token");

// //       const response = await fetch(
// //         `${BASE_URL}/Tutor/reject-request/${id}`,
// //         {
// //           method: "PUT",
// //           headers: {
// //             Authorization: `Bearer ${token}`,
// //           },
// //         }
// //       );

// //       const data = await response.json();

// //       if (response.ok) {
// //         Alert.alert("Rejected", "Request Rejected");

// //         setRequests((prev) =>
// //           prev.filter((item) => item.request_id !== id)
// //         );
// //       } else {
// //         Alert.alert("Error", data.message);
// //       }

// //     } catch (error) {
// //       Alert.alert("Error", error.message);
// //     }
// //   };

// //   const renderItem = ({ item }) => (
// //     <View style={styles.card}>

// //       <View style={styles.cardHeader}>
// //         <Text style={styles.requestText}>Teaching Request</Text>
// //         <View style={styles.badge}>
// //           <Text style={styles.badgeText}>{item.course_name}</Text>
// //         </View>
// //       </View>

// //       <Text style={styles.name}>{item.student_name}</Text>

// //       <View style={styles.divider} />

// //       <Text style={styles.details}>
// //         📅 {item.request_date ? item.request_date.split("T")[0] : ""}
// //       </Text>

// //       <View style={styles.buttonRow}>
// //         <TouchableOpacity
// //           style={styles.acceptBtn}
// //           onPress={() => handleAccept(item.request_id)}
// //         >
// //           <Text style={styles.acceptText}>Accept</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity
// //           style={styles.declineBtn}
// //           onPress={() => handleReject(item.request_id)}
// //         >
// //           <Text style={styles.declineText}>Reject</Text>
// //         </TouchableOpacity>
// //       </View>

// //     </View>
// //   );

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <View style={styles.header}>
// //         <TouchableOpacity onPress={() => navigation.navigate("TutorDrawer")}>
// //           <Icon name="menu" size={26} color={colors.primary} />
// //         </TouchableOpacity>

// //         <View style={styles.headerCenter}>
// //           <Image
// //             source={require("../../../assets/images/logo.png")}
// //             style={styles.logoImage}
// //           />
// //           <Text style={styles.logoText}>House of Tutor</Text>
// //         </View>

// //         <View style={{ width: 26 }} />
// //       </View>

// //       {loading ? (
// //         <ActivityIndicator size="large" color={colors.primary} />
// //       ) : (
// //         <FlatList
// //           data={requests}
// //           keyExtractor={(item) => item.request_id.toString()}
// //           renderItem={renderItem}
// //           ListEmptyComponent={
// //             <Text style={{ textAlign: "center", marginTop: 20 }}>
// //               No pending requests
// //             </Text>
// //           }
// //         />
// //       )}

// //       <View style={styles.bottomNav}>
// //         <TouchableOpacity style={styles.navItem}   onPress={() => navigation.navigate("TutorHome")}>
// //           <Icon name="calendar-month" size={24} color="#999"/>
// //           <Text style={styles.inactiveTab}>Schedule</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.navItem}>
// //           <Icon name="description" size={24} color={colors.primary}  />
// //           <Text style={styles.activeTab}>Request</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorTodayClasses")}>
// //           <Icon name="school" size={24} color="#999" />
// //           <Text style={styles.inactiveTab}>Today</Text>
// //         </TouchableOpacity>

// //         <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorAddSubject")}>
// //           <Icon name="add-box" size={24} color="#999" />
// //           <Text style={styles.inactiveTab}>Add</Text>
// //         </TouchableOpacity>
// //       </View>   
// //     </SafeAreaView>
// //   );
// // };

// // export default TutorStudentRequest;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#F4F6F9",
// //   },

// //   header: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     justifyContent: "space-between",
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     backgroundColor: "#fff",
// //     elevation: 2,
// //   },

// //   headerCenter: {
// //     alignItems: "center",
// //   },

// //   logoImage: {
// //     width: 28,
// //     height: 28,
// //   },

// //   logoText: {
// //     fontSize: 14,
// //     fontWeight: "600",
// //     color: colors.primary,
// //   },

// //   card: {
// //     backgroundColor: "#fff",
// //     marginHorizontal: 16,
// //     marginVertical: 8,
// //     padding: 16,
// //     borderRadius: 14,
// //     elevation: 3,
// //   },

// //   cardHeader: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //   },

// //   requestText: {
// //     fontSize: 12,
// //     color: "#888",
// //   },

// //   badge: {
// //     backgroundColor: colors.primary,
// //     paddingHorizontal: 10,
// //     paddingVertical: 4,
// //     borderRadius: 20,
// //   },

// //   badgeText: {
// //     color: "#fff",
// //     fontSize: 11,
// //   },

// //   name: {
// //     fontSize: 16,
// //     fontWeight: "600",
// //     color: colors.primary,
// //     marginTop: 6,
// //   },

// //   semester: {
// //     fontSize: 12,
// //     color: "#777",
// //   },

// //   divider: {
// //     height: 1,
// //     backgroundColor: "#eee",
// //     marginVertical: 10,
// //   },

// //   details: {
// //     fontSize: 13,
// //     color: "#444",
// //     marginBottom: 2,
// //   },

// //   buttonRow: {
// //     flexDirection: "row",
// //     marginTop: 12,
// //   },

// //   acceptBtn: {
// //     backgroundColor: colors.primary,
// //     paddingVertical: 8,
// //     paddingHorizontal: 16,
// //     borderRadius: 20,
// //     marginRight: 10,
// //   },

// //   declineBtn: {
// //     borderWidth: 1,
// //     borderColor: "#e74c3c",
// //     paddingVertical: 8,
// //     paddingHorizontal: 16,
// //     borderRadius: 20,
// //   },

// //   acceptText: {
// //     color: "#fff",
// //     fontWeight: "600",
// //     fontSize: 12,
// //   },

// //   declineText: {
// //     color: "#e74c3c",
// //     fontWeight: "600",
// //     fontSize: 12,
// //   },

// //   bottomNav: {
// //     position: "absolute",
// //     bottom: 0,
// //     width: "100%",
// //     flexDirection: "row",
// //     justifyContent: "space-around",
// //     paddingVertical: 8,
// //     backgroundColor: "#fff",
// //     borderTopWidth: 1,
// //     borderColor: "#eee",
// //   },

// //   navItem: {
// //     alignItems: "center",
// //   },

// //   activeTab: {
// //     fontSize: 11,
// //     color: colors.primary,
// //     marginTop: 2,
// //   },

// //   inactiveTab: {
// //     fontSize: 11,
// //     color: "#999",
// //     marginTop: 2,
// //   },
// // });
