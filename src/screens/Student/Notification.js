import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const Notification = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================================
  // FETCH REQUESTS
  // =====================================================

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/pre-reschedule-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      console.log("REQUESTS:", text);

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setRequests(Array.isArray(data) ? data : []);
      } else {
        Alert.alert(
          "Error",
          text || "Failed to fetch requests"
        );
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);

      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ACCEPT REQUEST
  // =====================================================

  const confirmAccept = (
    requestId,
    type
  ) => {
    Alert.alert(
      "Confirm Accept",
      `Are you sure you want to accept this ${type} request?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () =>
            acceptRequest(
              requestId,
              type
            ),
        },
      ]
    );
  };

  const acceptRequest = async (
    requestId,
    type
  ) => {
    try {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const endpoint =
        type === "Reschedule"
          ? `accept-reschedule/${requestId}`
          : `accept-preschedule/${requestId}`;

      const response = await fetch(
        `${BASE_URL}/Student/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      console.log(
        "ACCEPT RESPONSE:",
        text
      );

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {}

      if (response.ok) {
        Alert.alert(
          "Success",
          type === "Reschedule"
            ? "Class Re-Scheduled Successfully"
            : "Class Pre-Scheduled Successfully"
        );

        fetchRequests();
      } else {
        Alert.alert(
          "Error",
          data.message ||
            "Failed to accept request"
        );
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  // =====================================================
  // REJECT REQUEST
  // =====================================================

  const confirmReject = (
    requestId
  ) => {
    Alert.alert(
      "Confirm Reject",
      "Are you sure you want to reject this request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () =>
            rejectRequest(requestId),
        },
      ]
    );
  };

  const rejectRequest = async (
    requestId
  ) => {
    try {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const response = await fetch(
        `${BASE_URL}/Student/reject-request/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      console.log(
        "REJECT RESPONSE:",
        text
      );

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {}

      if (response.ok) {
        Alert.alert(
          "Success",
          "Request rejected successfully"
        );

        fetchRequests();
      } else {
        Alert.alert(
          "Error",
          data.message ||
            "Failed to reject request"
        );
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  // =====================================================
  // REQUEST ITEM
  // =====================================================

  const renderItem = ({ item }) => {
    const isReschedule = item.request_type === "Reschedule";

    return (
      <View style={styles.card}>
        {/* CARD TOP BAR */}
        <View style={styles.cardHeader}>
          {/* TYPE BADGE */}
          <View
            style={[
              styles.typeBadge,
              isReschedule
                ? styles.typeBadgeReschedule
                : styles.typeBadgePreschedule,
            ]}
          >
            <Icon
              name={isReschedule ? "update" : "event-available"}
              size={13}
              color={isReschedule ? "#B45309" : "#4338CA"}
              style={styles.badgeIcon}
            />
            <Text
              style={[
                styles.typeText,
                isReschedule
                  ? styles.typeTextReschedule
                  : styles.typeTextPreschedule,
              ]}
            >
              {item.request_type}
            </Text>
          </View>

          {/* STATUS PENDING */}
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>

        {/* TIME & SCHEDULE HIGHLIGHT */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {item.day}, {item.time}
          </Text>
        </View>

        {/* METADATA GRID */}
        <View style={styles.infoContainer}>
          {/* DATE */}
          <View style={styles.infoRow}>
            <Icon name="event" size={16} color="#64748B" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Date:</Text>
            <Text style={styles.infoValue}>{item.class_date}</Text>
          </View>

          {/* TUTOR */}
          <View style={styles.infoRow}>
            <Icon name="person-outline" size={16} color="#64748B" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Tutor:</Text>
            <Text style={styles.infoValue}>{item.tutor_name}</Text>
          </View>

          {/* COURSE */}
          <View style={styles.infoRow}>
            <Icon name="auto-stories" size={16} color="#64748B" style={styles.infoIcon} />
            <Text style={styles.infoLabel}>Course:</Text>
            <Text style={styles.infoValue}>{item.course_name}</Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonRow}>
          {/* ACCEPT */}
          <TouchableOpacity
            style={styles.acceptBtn}
            activeOpacity={0.8}
            onPress={() =>
              confirmAccept(
                item.request_id,
                item.request_type
              )
            }
          >
            <Icon name="check" size={16} color="#FFFFFF" />
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>

          {/* REJECT */}
          <TouchableOpacity
            style={styles.rejectBtn}
            activeOpacity={0.8}
            onPress={() =>
              confirmReject(item.request_id)
            }
          >
            <Icon name="close" size={16} color="#EF4444" />
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back-ios" size={18} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* TITLE & SUBTITLE */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Schedule Requests</Text>
        <Text style={styles.pageSubtitle}>
          Review and manage class pre-schedule and reschedule requests
        </Text>
      </View>

      {/* LIST OR LOADING */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary || "#4F46E5"}
          />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="notifications-none" size={40} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
              <Text style={styles.emptyText}>
                You don't have any reschedule or pre-schedule requests at the moment.
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

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 64,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    marginRight: 8,
  },

  logoText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.3,
  },

  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  // =====================================================
  // LIST CONTAINER & LOADING / EMPTY STATES
  // =====================================================

  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 8,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
  },

  // =====================================================
  // CARD
  // =====================================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeIcon: {
    marginRight: 4,
  },

  typeBadgeReschedule: {
    backgroundColor: "#FEF3C7",
  },

  typeBadgePreschedule: {
    backgroundColor: "#EEF2FF",
  },

  typeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  typeTextReschedule: {
    color: "#B45309",
  },

  typeTextPreschedule: {
    color: "#4338CA",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D97706",
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D97706",
  },

  timeContainer: {
    marginBottom: 14,
  },

  timeText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  // =====================================================
  // METADATA
  // =====================================================

  infoContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    marginRight: 8,
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    width: 55,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },

  // =====================================================
  // BUTTONS
  // =====================================================

  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary || "#4F46E5",
    height: 42,
    borderRadius: 10,
  },

  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    height: 42,
    borderRadius: 10,
  },

  acceptText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  rejectText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },
});




























// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Image,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Icon from "react-native-vector-icons/MaterialIcons";

// import { BASE_URL } from "../../config/api";
// import colors from "../utils/colors";

// const Notification = ({ navigation }) => {
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchRequests();
//   }, []);

//   // =====================================================
//   // FETCH REQUESTS
//   // =====================================================

//   const fetchRequests = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Student/pre-reschedule-requests`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text = await response.text();

//       console.log("REQUESTS:", text);

//       let data = [];

//       try {
//         data = text ? JSON.parse(text) : [];
//       } catch {}

//       if (response.ok) {
//         setRequests(Array.isArray(data) ? data : []);
//       } else {
//         Alert.alert(
//           "Error",
//           text || "Failed to fetch requests"
//         );
//       }
//     } catch (error) {
//       console.log("FETCH ERROR:", error);

//       Alert.alert(
//         "Error",
//         error.message
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =====================================================
//   // ACCEPT REQUEST
//   // =====================================================

//   const confirmAccept = (
//     requestId,
//     type
//   ) => {
//     Alert.alert(
//       "Confirm Accept",
//       `Are you sure you want to accept this ${type} request?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Accept",
//           onPress: () =>
//             acceptRequest(
//               requestId,
//               type
//             ),
//         },
//       ]
//     );
//   };

//   const acceptRequest = async (
//     requestId,
//     type
//   ) => {
//     try {
//       const token =
//         await AsyncStorage.getItem(
//           "token"
//         );

//       const endpoint =
//         type === "Reschedule"
//           ? `accept-reschedule/${requestId}`
//           : `accept-preschedule/${requestId}`;

//       const response = await fetch(
//         `${BASE_URL}/Student/${endpoint}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text =
//         await response.text();

//       console.log(
//         "ACCEPT RESPONSE:",
//         text
//       );

//       let data = {};

//       try {
//         data = text
//           ? JSON.parse(text)
//           : {};
//       } catch {}

//       if (response.ok) {
//         Alert.alert(
//           "Success",
//           type === "Reschedule"
//             ? "Class Re-Scheduled Successfully"
//             : "Class Pre-Scheduled Successfully"
//         );

//         fetchRequests();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message ||
//             "Failed to accept request"
//         );
//       }
//     } catch (error) {
//       console.log(error);

//       Alert.alert(
//         "Error",
//         error.message
//       );
//     }
//   };

//   // =====================================================
//   // REJECT REQUEST
//   // =====================================================

//   const confirmReject = (
//     requestId
//   ) => {
//     Alert.alert(
//       "Confirm Reject",
//       "Are you sure you want to reject this request?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Reject",
//           style: "destructive",
//           onPress: () =>
//             rejectRequest(requestId),
//         },
//       ]
//     );
//   };

//   const rejectRequest = async (
//     requestId
//   ) => {
//     try {
//       const token =
//         await AsyncStorage.getItem(
//           "token"
//         );

//       const response = await fetch(
//         `${BASE_URL}/Student/reject-request/${requestId}`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const text =
//         await response.text();

//       console.log(
//         "REJECT RESPONSE:",
//         text
//       );

//       let data = {};

//       try {
//         data = text
//           ? JSON.parse(text)
//           : {};
//       } catch {}

//       if (response.ok) {
//         Alert.alert(
//           "Success",
//           "Request rejected successfully"
//         );

//         fetchRequests();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message ||
//             "Failed to reject request"
//         );
//       }
//     } catch (error) {
//       console.log(error);

//       Alert.alert(
//         "Error",
//         error.message
//       );
//     }
//   };

//   // =====================================================
//   // REQUEST ITEM
//   // =====================================================

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       {/* TYPE BADGE */}
//       <View
//         style={[
//           styles.typeContainer,

//           item.request_type ===
//           "Reschedule"
//             ? styles.typeBadgeReschedule
//             : styles.typeBadgePreschedule,
//         ]}
//       >
//         <Text style={styles.typeText}>
//           {item.request_type}
//         </Text>
//       </View>

//       {/* DAY + TIME */}
//       <Text style={styles.time}>
//         {item.day} , {item.time}
//       </Text>

//       {/* DATE */}
//       <Text style={styles.date}>
//         📅 Date : {item.class_date}
//       </Text>

//       {/* TUTOR */}
//       <Text style={styles.text}>
//         👨‍🏫 Tutor : {item.tutor_name}
//       </Text>

//       {/* COURSE */}
//       <Text style={styles.text}>
//         📘 Course :{" "}
//         {item.course_name}
//       </Text>

//       {/* STATUS */}
//       <Text
//         style={[
//           styles.statusText,
//           styles.pendingStatus,
//         ]}
//       >
//         ● Pending
//       </Text>

//       {/* BUTTONS */}
//       <View style={styles.buttonRow}>
//         {/* ACCEPT */}
//         <TouchableOpacity
//           style={styles.acceptBtn}
//           onPress={() =>
//             confirmAccept(
//               item.request_id,
//               item.request_type
//             )
//           }
//         >
//           <Icon
//             name="check"
//             size={14}
//             color="#fff"
//           />

//           <Text
//             style={styles.acceptText}
//           >
//             Accept
//           </Text>
//         </TouchableOpacity>

//         {/* REJECT */}
//         <TouchableOpacity
//           style={styles.rejectBtn}
//           onPress={() =>
//             confirmReject(
//               item.request_id
//             )
//           }
//         >
//           <Icon
//             name="close"
//             size={14}
//             color="#e74c3c"
//           />

//           <Text
//             style={styles.rejectText}
//           >
//             Reject
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

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
//             color="#000"
//           />
//         </TouchableOpacity>

//         <View
//           style={styles.headerCenter}
//         >
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

//       {/* TITLE */}
//       <Text style={styles.pageTitle}>
//         Requests
//       </Text>

//       {/* LIST */}
//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color={colors.primary}
//           style={{
//             marginTop: 30,
//           }}
//         />
//       ) : (
//         <FlatList
//           data={requests}
//           keyExtractor={(item) =>
//             item.request_id.toString()
//           }
//           renderItem={renderItem}
//           contentContainerStyle={{
//             paddingBottom: 80,
//           }}
//           ListEmptyComponent={
//             <Text
//               style={styles.emptyText}
//             >
//               No Re-Schedule /
//               Pre-Schedule Requests
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

//   // =====================================================
//   // HEADER
//   // =====================================================

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent:
//       "space-between",
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

//   pageTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1a1a1a",
//     marginHorizontal: 16,
//     marginTop: 20,
//     marginBottom: 4,
//   },

//   // =====================================================
//   // CARD
//   // =====================================================

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginTop: 16,
//     borderRadius: 16,
//     padding: 16,
//     elevation: 3,
//   },

//   typeContainer: {
//     alignSelf: "flex-start",
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     marginBottom: 10,
//   },

//   typeBadgeReschedule: {
//     backgroundColor: "#f39c12",
//   },

//   typeBadgePreschedule: {
//     backgroundColor:
//       colors.primary,
//   },

//   typeText: {
//     color: "#fff",
//     fontSize: 12,
//     fontWeight: "600",
//   },

//   time: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: colors.primary,
//     marginBottom: 6,
//   },

//   date: {
//     fontSize: 13,
//     color: "#555",
//     marginBottom: 6,
//   },

//   text: {
//     fontSize: 13,
//     color: "#444",
//     marginBottom: 4,
//   },

//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//     marginTop: 6,
//     marginBottom: 2,
//   },

//   pendingStatus: {
//     color: "#f39c12",
//   },

//   // =====================================================
//   // BUTTONS
//   // =====================================================

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 14,
//   },

//   acceptBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor:
//       colors.primary,
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 22,
//     marginRight: 10,
//   },

//   rejectBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#e74c3c",
//     paddingVertical: 8,
//     paddingHorizontal: 18,
//     borderRadius: 22,
//   },

//   acceptText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "600",
//     marginLeft: 4,
//   },

//   rejectText: {
//     color: "#e74c3c",
//     fontSize: 13,
//     fontWeight: "600",
//     marginLeft: 4,
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     color: "#777",
//     fontSize: 14,
//   },
// });