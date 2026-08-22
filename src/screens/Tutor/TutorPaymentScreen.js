import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

export default function TutorPaymentScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${BASE_URL}/Tutor/payment-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPayments(res.data || []);
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Unable to load payments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPayments();
  }, []);

  const updateStatus = async (paymentId, status) => {
    try {
      const token = await AsyncStorage.getItem("token");

      await axios.put(
        `${BASE_URL}/Tutor/payment-status`,
        {
          paymentId: paymentId,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Payment status updated.");
      loadPayments();
    } catch (error) {
      console.log(error.response?.data);
      Alert.alert("Error", "Unable to update payment.");
    }
  };

  // =========================================
  // CALCULATE SUMMARY METRICS
  // =========================================
  const metrics = useMemo(() => {
    let totalReceived = 0;
    let totalPending = 0;
    let countReceived = 0;

    payments.forEach((p) => {
      const amount = Number(p.amount) || 0;
      if (p.tutorStatus === "Received") {
        totalReceived += amount;
        countReceived += 1;
      } else {
        totalPending += amount;
      }
    });

    return {
      totalReceived,
      totalPending,
      countReceived,
      totalCount: payments.length,
    };
  }, [payments]);

  // =========================================
  // HELPER COMPONENTS
  // =========================================
  const InfoRow = ({ icon, iconColor, label, value }) => (
    <View style={styles.infoRow}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}15` }]}>
        <Icon name={icon} size={16} color={iconColor} />
      </View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );

  const StatusPill = ({ text, positive }) => (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: positive ? "#ECFDF5" : "#FEF2F2",
          borderColor: positive ? "#A7F3D0" : "#FCA5A5",
        },
      ]}
    >
      <View
        style={[
          styles.pillDot,
          { backgroundColor: positive ? "#10B981" : "#EF4444" },
        ]}
      />
      <Text
        style={[
          styles.pillText,
          { color: positive ? "#047857" : "#B91C1C" },
        ]}
      >
        {text}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Top Block: Student Info & Amount */}
      <View style={styles.cardHeader}>
        <View style={styles.studentBlock}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.studentTextGroup}>
            <Text style={styles.studentName}>{item.student}</Text>
            <Text style={styles.courseName}>{item.course}</Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <Text style={styles.amountText}>
            Rs. {Number(item.amount).toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Meta Information Rows */}
      <View style={styles.metaContainer}>
        <InfoRow
          icon="credit-card-outline"
          iconColor="#F59E0B"
          label="Payment Method"
          value={item.paymentType}
        />
        <InfoRow
          icon="calendar-month-outline"
          iconColor="#3B82F6"
          label="Transaction Date"
          value={new Date(item.paymentDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        />
      </View>

      {/* Status Indicators */}
      <View style={styles.statusSection}>
        <View style={styles.statusBlock}>
          <Text style={styles.statusLabel}>Parent Status</Text>
          <StatusPill
            text={item.parentStatus}
            positive={item.parentStatus === "Paid"}
          />
        </View>

        <View style={styles.statusBlock}>
          <Text style={styles.statusLabel}>Tutor Status</Text>
          <StatusPill
            text={item.tutorStatus}
            positive={item.tutorStatus === "Received"}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, styles.receivedButton]}
          onPress={() => updateStatus(item.paymentId, "Received")}
        >
          <Icon name="check-circle" size={18} color="#FFFFFF" />
          <Text style={styles.receivedButtonText}>Mark Received</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, styles.notReceivedButton]}
          onPress={() => updateStatus(item.paymentId, "NotReceived")}
        >
          <Icon name="close-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.notReceivedButtonText}>Not Received</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
        <Text style={styles.loadingText}>Fetching payment history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Screen Title & Summary Component Header */}
      <FlatList
        data={payments}
        keyExtractor={(item) => item.paymentId.toString()}
        renderItem={renderItem}
        contentContainerStyle={
          payments.length === 0 ? styles.flexGrow : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary || "#4F46E5"}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.screenTitle}>Payment Overview</Text>
              <Text style={styles.recordCount}>
                {payments.length} {payments.length === 1 ? "Record" : "Records"}
              </Text>
            </View>

            {/* Financial Summary Card */}
            {payments.length > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Collected</Text>
                  <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                    Rs. {metrics.totalReceived.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pending Clearance</Text>
                  <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
                    Rs. {metrics.totalPending.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="cash-multiple" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Payments Records Found</Text>
            <Text style={styles.emptySubtitle}>
              When students process payments for your courses, they will show up here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  /* Top App Bar */
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 36,
  },

  /* List Header Components */
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  recordCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  /* Summary Card */
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 2,
  },

  /* FlatList Styles */
  listContent: {
    paddingBottom: 24,
  },
  flexGrow: {
    flexGrow: 1,
  },

  /* Payment Card */
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary || "#4F46E5",
    alignItems: "center",
    justifycontent: "center",
    marginRight: 12,
  },
  studentTextGroup: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  courseName: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  amountContainer: {
    alignItems: "flex-end",
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10B981",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  /* Meta Info Rows */
  metaContainer: {
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    width: 110,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
    textAlign: "right",
  },

  /* Status Pills */
  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  statusBlock: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* Buttons */
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  receivedButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  notReceivedButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  receivedButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  notReceivedButtonText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 13,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },
});




























// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Image
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// export default function TutorPaymentScreen({ navigation }) {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     loadPayments();
//   }, []);

//   const loadPayments = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await axios.get(`${BASE_URL}/Tutor/payment-list`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setPayments(res.data);
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Unable to load payments.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadPayments();
//   }, []);

//   const updateStatus = async (paymentId, status) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       await axios.put(
//         `${BASE_URL}/Tutor/payment-status`,
//         {
//           paymentId: paymentId,
//           status: status,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       Alert.alert("Success", "Payment status updated.");

//       loadPayments();
//     } catch (error) {
//       console.log(error.response?.data);
//       Alert.alert("Error", "Unable to update payment.");
//     }
//   };

//   const InfoRow = ({ icon, iconColor, label, value, valueColor }) => (
//     <View style={styles.row}>
//       <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1A` }]}>
//         <Icon name={icon} size={18} color={iconColor} />
//       </View>
//       <Text style={styles.label}>{label}</Text>
//       <Text
//         style={[styles.value, valueColor ? { color: valueColor, fontWeight: "700" } : null]}
//         numberOfLines={1}
//       >
//         {value}
//       </Text>
//     </View>
//   );

//   const StatusPill = ({ text, positive }) => (
//     <View
//       style={[
//         styles.pill,
//         {
//           backgroundColor: positive ? "#E9F9EE" : "#FDEDEC",
//           borderColor: positive ? "#27AE60" : "#E74C3C",
//         },
//       ]}
//     >
//       <View
//         style={[
//           styles.pillDot,
//           { backgroundColor: positive ? "#27AE60" : "#E74C3C" },
//         ]}
//       />
//       <Text
//         style={[
//           styles.pillText,
//           { color: positive ? "#1E8449" : "#C0392B" },
//         ]}
//       >
//         {text}
//       </Text>
//     </View>
//   );

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.cardHeader}>
//         <View style={styles.studentBlock}>
//           <View style={styles.avatarCircle}>
//             <Icon name="account" size={20} color="#fff" />
//           </View>
//           <View>
//             <Text style={styles.studentName}>{item.student}</Text>
//             <Text style={styles.courseName}>{item.course}</Text>
//           </View>
//         </View>
//         <Text style={styles.amountText}>Rs. {item.amount}</Text>
//       </View>

//       <View style={styles.divider} />

//       <InfoRow
//         icon="credit-card-outline"
//         iconColor="#F39C12"
//         label="Payment Type"
//         value={item.paymentType}
//       />
//       <InfoRow
//         icon="calendar"
//         iconColor="#2E86DE"
//         label="Date"
//         value={new Date(item.paymentDate).toLocaleDateString()}
//       />

//       <View style={styles.statusRow}>
//         <View style={styles.statusBlock}>
//           <Text style={styles.statusLabel}>Parent</Text>
//           <StatusPill
//             text={item.parentStatus}
//             positive={item.parentStatus === "Paid"}
//           />
//         </View>
//         <View style={styles.statusBlock}>
//           <Text style={styles.statusLabel}>Tutor</Text>
//           <StatusPill
//             text={item.tutorStatus}
//             positive={item.tutorStatus === "Received"}
//           />
//         </View>
//       </View>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[styles.button, styles.receivedButton]}
//           onPress={() => updateStatus(item.paymentId, "Received")}
//         >
//           <Icon name="check-circle-outline" size={18} color="#fff" />
//           <Text style={styles.buttonText}>Received</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[styles.button, styles.notReceivedButton]}
//           onPress={() => updateStatus(item.paymentId, "NotReceived")}
//         >
//           <Icon name="close-circle-outline" size={18} color="#fff" />
//           <Text style={styles.buttonText}>Not Received</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loading}>
//         <ActivityIndicator size="large" color="#2E86DE" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.topHeader}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="arrow-left" size={24} color="#1B1B1B" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={styles.headerSpacer} />
//       </View>

//       <Text style={styles.screenTitle}>Payments</Text>

//       <FlatList
//         data={payments}
//         keyExtractor={(item) => item.paymentId.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={
//           payments.length === 0 ? styles.flexGrow : styles.listContent
//         }
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={() => (
//           <View style={styles.empty}>
//             <Icon name="cash-remove" size={70} color="#ccc" />
//             <Text style={styles.emptyText}>No Payments Found</Text>
//           </View>
//         )}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   topHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: "#fff",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },

//   backButton: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F1F3F6",
//   },

//   headerCenter: {
//     alignItems: "center",
//   },

//   headerSpacer: {
//     width: 38,
//   },

//   logoImage: {
//     width: 42,
//     height: 42,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: colors.primary,
//     marginTop: 2,
//   },

//   screenTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#1B1B1B",
//     paddingHorizontal: 18,
//     paddingTop: 16,
//     paddingBottom: 6,
//   },

//   loading: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F4F6F9",
//   },

//   listContent: {
//     paddingBottom: 24,
//   },

//   flexGrow: {
//     flexGrow: 1,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 14,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 14,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.07,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 3 },
//   },

//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },

//   studentBlock: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },

//   avatarCircle: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     backgroundColor: "#2E86DE",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   studentName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1B1B1B",
//   },

//   courseName: {
//     fontSize: 13,
//     color: "#8A94A6",
//     marginTop: 1,
//   },

//   amountText: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#27AE60",
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#EEF1F5",
//     marginVertical: 12,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 5,
//   },

//   iconWrap: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   label: {
//     fontWeight: "500",
//     fontSize: 13,
//     color: "#8A94A6",
//     width: 110,
//   },

//   value: {
//     fontSize: 14,
//     color: "#1B1B1B",
//     flex: 1,
//     textAlign: "right",
//   },

//   statusRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 14,
//   },

//   statusBlock: {
//     flex: 1,
//   },

//   statusLabel: {
//     fontSize: 12,
//     color: "#8A94A6",
//     marginBottom: 6,
//   },

//   pill: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-start",
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 20,
//     borderWidth: 1,
//   },

//   pillDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginRight: 6,
//   },

//   pillText: {
//     fontSize: 12,
//     fontWeight: "700",
//   },

//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 16,
//   },

//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     width: "48%",
//     paddingVertical: 11,
//     borderRadius: 10,
//     gap: 6,
//   },

//   receivedButton: {
//     backgroundColor: "#27AE60",
//   },

//   notReceivedButton: {
//     backgroundColor: "#E74C3C",
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 14,
//     marginLeft: 6,
//   },

//   empty: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   emptyText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: "gray",
//   },
// });


















// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Image
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// export default function TutorPaymentScreen({ navigation }) {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   useEffect(() => {
//     loadPayments();
//   }, []);

//   const loadPayments = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const res = await axios.get(
//         `${BASE_URL}/Tutor/payment-list`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setPayments(res.data);
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Unable to load payments.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadPayments();
//   }, []);

//   const updateStatus = async (paymentId, status) => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       await axios.put(
//         `${BASE_URL}/Tutor/payment-status`,
//         {
//           paymentId: paymentId,
//           status: status,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       Alert.alert("Success", "Payment status updated.");

//       loadPayments();
//     } catch (error) {
//       console.log(error.response?.data);
//       Alert.alert("Error", "Unable to update payment.");
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>

//       <View style={styles.row}>
//         <Icon name="account" size={22} color="#2E86DE" />
//         <Text style={styles.label}> Student :</Text>
//         <Text style={styles.value}>{item.student}</Text>
//       </View>

//       <View style={styles.row}>
//         <Icon name="book-open-page-variant" size={22} color="#2E86DE" />
//         <Text style={styles.label}> Course :</Text>
//         <Text style={styles.value}>{item.course}</Text>
//       </View>

//       <View style={styles.row}>
//         <Icon name="cash" size={22} color="green" />
//         <Text style={styles.label}> Amount :</Text>
//         <Text style={[styles.value, { color: "green" }]}>
//           Rs. {item.amount}
//         </Text>
//       </View>

//       <View style={styles.row}>
//         <Icon name="credit-card-outline" size={22} color="#F39C12" />
//         <Text style={styles.label}> Payment Type :</Text>
//         <Text style={styles.value}>{item.paymentType}</Text>
//       </View>

//       <View style={styles.row}>
//         <Icon name="account-check" size={22} color="#8E44AD" />
//         <Text style={styles.label}> Parent Status :</Text>
//         <Text
//           style={[
//             styles.value,
//             {
//               color:
//                 item.parentStatus === "Paid"
//                   ? "green"
//                   : "#E67E22",
//             },
//           ]}
//         >
//           {item.parentStatus}
//         </Text>
//       </View>

//       <View style={styles.row}>
//         <Icon name="check-decagram" size={22} color="#16A085" />
//         <Text style={styles.label}> Tutor Status :</Text>
//         <Text
//           style={[
//             styles.value,
//             {
//               color:
//                 item.tutorStatus === "Received"
//                   ? "green"
//                   : "red",
//             },
//           ]}
//         >
//           {item.tutorStatus}
//         </Text>
//       </View>

//       <View style={styles.row}>
//         <Icon name="calendar" size={22} color="#2E86DE" />
//         <Text style={styles.label}> Date :</Text>
//         <Text style={styles.value}>
//           {new Date(item.paymentDate).toLocaleDateString()}
//         </Text>
//       </View>

//       <View style={styles.buttonRow}>
//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: "#27AE60" }]}
//           onPress={() =>
//             updateStatus(item.paymentId, "Received")
//           }
//         >
//           <Text style={styles.buttonText}>Received</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: "#E74C3C" }]}
//           onPress={() =>
//             updateStatus(item.paymentId, "NotReceived")
//           }
//         >
//           <Text style={styles.buttonText}>Not Received</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loading}>
//         <ActivityIndicator size="large" color="#2E86DE" />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

// <View style={styles.topHeader}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//         >
//           <Icon
//             name="arrow-back"
//             size={30}
//             color="#000"
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

//         <View style={{ width: 30 }} />
//       </View>

//       <FlatList
//         data={payments}
//         keyExtractor={(item) => item.paymentId.toString()}
//         renderItem={renderItem}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//           />
//         }
//         ListEmptyComponent={() => (
//           <View style={styles.empty}>
//             <Icon
//               name="cash-remove"
//               size={70}
//               color="#ccc"
//             />
//             <Text style={styles.emptyText}>
//               No Payments Found
//             </Text>
//           </View>
//         )}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   topHeader: {
//       flexDirection: "row",
//       alignItems: "center",
//       justifyContent: "space-between",
//       paddingHorizontal: 16,
//       paddingVertical: 20,
//       backgroundColor: "#fff",
//       elevation: 2,
//     },
  
//     headerCenter: {
//       alignItems: "center",
//     },
  
//     logoImage: {
//       width: 50,
//       height: 50,
//       resizeMode: "contain",
//     },
  
//     logoText: {
//       fontSize: 14,
//       fontWeight: "600",
//       color: colors.primary,
//     },

//   loading: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   header: {
//     backgroundColor: "#2E86DE",
//     padding: 18,
//     alignItems: "center",
//   },

//   headerTitle: {
//     color: "#fff",
//     fontSize: 22,
//     fontWeight: "bold",
//   },

//   card: {
//     backgroundColor: "#fff",
//     margin: 12,
//     padding: 15,
//     borderRadius: 10,
//     elevation: 3,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 6,
//   },

//   label: {
//     fontWeight: "bold",
//     marginLeft: 8,
//     fontSize: 15,
//   },

//   value: {
//     marginLeft: 6,
//     fontSize: 15,
//     flex: 1,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 18,
//   },

//   button: {
//     width: "47%",
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 15,
//   },

//   empty: {
//     marginTop: 120,
//     alignItems: "center",
//   },

//   emptyText: {
//     marginTop: 15,
//     fontSize: 18,
//     color: "gray",
//   },
// });