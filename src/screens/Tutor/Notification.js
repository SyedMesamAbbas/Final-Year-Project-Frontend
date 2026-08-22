import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const Notification = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${BASE_URL}/Tutor/notifications`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      console.log("Notifications:", text);

      let data = [];
      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        Alert.alert("Error", "Failed to load notifications");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      setProcessingId(requestId);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/accept-re-and-pre-schedule-request/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok && data.success) {
        Alert.alert("Success", data.message || "Request accepted");
        fetchNotifications();
      } else {
        Alert.alert("Error", data.message || "Failed to accept request");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      setProcessingId(requestId);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/reject-re-and-pre-schedule-request/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok && data.success) {
        Alert.alert("Success", data.message || "Request rejected");
        fetchNotifications();
      } else {
        Alert.alert("Error", data.message || "Failed to reject request");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item }) => {
    const isProcessing = processingId === item.requestId;

    return (
      <View style={styles.card}>
        {/* Header Badge */}
        <View style={styles.cardTopRow}>
          <View style={styles.typeContainer}>
            <Icon name="event-repeat" size={14} color={colors.primary || "#4F46E5"} />
            <Text style={styles.typeText}>{item.requestType}</Text>
          </View>
        </View>

        {/* Course & Student Info */}
        <View style={styles.mainInfoContainer}>
          <Text style={styles.courseTitle} numberOfLines={1}>
            {item.courseTitle}
          </Text>
          <View style={styles.studentRow}>
            <Icon name="person-outline" size={16} color="#64748B" />
            <Text style={styles.studentName}>{item.studentName}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Schedule Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Icon name="calendar-today" size={15} color="#64748B" />
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Class Date</Text>
              <Text style={styles.detailValue}>{item.classDate}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Icon name="schedule" size={15} color="#64748B" />
            <View style={styles.detailTextWrapper}>
              <Text style={styles.detailLabel}>Time & Day</Text>
              <Text style={styles.detailValue}>
                {item.day}, {item.time}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, styles.acceptBtn]}
            activeOpacity={0.8}
            disabled={isProcessing}
            onPress={() => acceptRequest(item.requestId)}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Icon name="check" size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Accept</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.rejectBtn]}
            activeOpacity={0.8}
            disabled={isProcessing}
            onPress={() => rejectRequest(item.requestId)}
          >
            {isProcessing ? (
              <ActivityIndicator color="#EF4444" size="small" />
            ) : (
              <>
                <Icon name="close" size={18} color="#EF4444" />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-ios" size={18} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notifications</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
          <Text style={styles.loadingText}>Fetching pending requests...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) =>
            item.requestId ? item.requestId.toString() : Math.random().toString()
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Icon name="notifications-none" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtext}>
                You have no pending reschedule or schedule requests at the moment.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  typeText: {
    color: colors.primary || "#4F46E5",
    fontWeight: "700",
    fontSize: 12,
  },
  mainInfoContainer: {
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  studentName: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 10,
  },
  detailsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
    marginTop: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  acceptBtn: {
    backgroundColor: "#10B981",
  },
  rejectBtn: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  rejectButtonText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
});




























// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/MaterialIcons";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const Notification = ({ navigation }) => {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       setLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/notifications`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text = await response.text();

//       console.log("Notifications:", text);

//       let data = [];

//       try {
//         data = text ? JSON.parse(text) : [];
//       } catch {}

//       if (response.ok) {
//         setNotifications(Array.isArray(data) ? data : []);
//       } else {
//         Alert.alert(
//           "Error",
//           "Failed to load notifications"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const acceptRequest = async (requestId) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/accept-re-and-pre-schedule-request/${requestId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text = await response.text();

//       let data = {};

//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {}

//       if (response.ok && data.success) {
//         Alert.alert(
//           "Success",
//           data.message || "Request accepted"
//         );

//         fetchNotifications();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message || "Failed to accept request"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   const rejectRequest = async (requestId) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/reject-re-and-pre-schedule-request/${requestId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text = await response.text();

//       let data = {};

//       try {
//         data = text ? JSON.parse(text) : {};
//       } catch {}

//       if (response.ok && data.success) {
//         Alert.alert(
//           "Success",
//           data.message || "Request rejected"
//         );

//         fetchNotifications();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message || "Failed to reject request"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", error.message);
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.typeContainer}>
//         <Text style={styles.type}>
//           {item.requestType}
//         </Text>
//       </View>

//       <Text style={styles.label}>
//         Student
//       </Text>
//       <Text style={styles.value}>
//         {item.studentName}
//       </Text>

//       <Text style={styles.label}>
//         Course
//       </Text>
//       <Text style={styles.value}>
//         {item.courseTitle}
//       </Text>

//       <Text style={styles.label}>
//         Day
//       </Text>
//       <Text style={styles.value}>
//         {item.day}
//       </Text>

//       <Text style={styles.label}>
//         Time
//       </Text>
//       <Text style={styles.value}>
//         {item.time}
//       </Text>

//       <Text style={styles.label}>
//         Class Date
//       </Text>
//       <Text style={styles.value}>
//         {item.classDate}
//       </Text>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           style={styles.acceptBtn}
//           onPress={() =>
//             acceptRequest(item.requestId)
//           }
//         >
//           <Text style={styles.buttonText}>
//             Accept
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.rejectBtn}
//           onPress={() =>
//             rejectRequest(item.requestId)
//           }
//         >
//           <Text style={styles.buttonText}>
//             Reject
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//         >
//           <Icon
//             name="arrow-back"
//             size={26}
//             color="#000"
//           />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>
//           Notifications
//         </Text>

//         <View style={{ width: 26 }} />
//       </View>

//       {loading ? (
//         <View style={styles.loader}>
//           <ActivityIndicator
//             size="large"
//             color={colors.primary}
//           />
//         </View>
//       ) : (
//         <FlatList
//           data={notifications}
//           keyExtractor={(item) =>
//             item.requestId.toString()
//           }
//           renderItem={renderItem}
//           contentContainerStyle={{
//             paddingBottom: 30,
//           }}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>
//               No pending notifications
//             </Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default Notification;

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
//     paddingVertical: 15,
//     backgroundColor: "#fff",
//     elevation: 2,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: colors.primary,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 50,
//     fontSize: 16,
//     color: "#777",
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginTop: 12,
//     borderRadius: 16,
//     padding: 16,
//     elevation: 3,
//   },

//   typeContainer: {
//     alignSelf: "flex-start",
//     backgroundColor: "#EEF6FF",
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     borderRadius: 20,
//     marginBottom: 10,
//   },

//   type: {
//     color: colors.primary,
//     fontWeight: "700",
//     fontSize: 12,
//   },

//   label: {
//     color: "#999",
//     fontSize: 12,
//     marginTop: 6,
//   },

//   value: {
//     color: "#222",
//     fontSize: 14,
//     fontWeight: "600",
//     marginTop: 2,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 16,
//   },

//   acceptBtn: {
//     flex: 1,
//     backgroundColor: "#27AE60",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     marginRight: 6,
//   },

//   rejectBtn: {
//     flex: 1,
//     backgroundColor: "#EB5757",
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: "center",
//     marginLeft: 6,
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//   },
// });