import React, { useEffect, useState, useCallback } from "react";
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
  Image
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

      setPayments(res.data);
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

  const InfoRow = ({ icon, iconColor, label, value, valueColor }) => (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${iconColor}1A` }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[styles.value, valueColor ? { color: valueColor, fontWeight: "700" } : null]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );

  const StatusPill = ({ text, positive }) => (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: positive ? "#E9F9EE" : "#FDEDEC",
          borderColor: positive ? "#27AE60" : "#E74C3C",
        },
      ]}
    >
      <View
        style={[
          styles.pillDot,
          { backgroundColor: positive ? "#27AE60" : "#E74C3C" },
        ]}
      />
      <Text
        style={[
          styles.pillText,
          { color: positive ? "#1E8449" : "#C0392B" },
        ]}
      >
        {text}
      </Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.studentBlock}>
          <View style={styles.avatarCircle}>
            <Icon name="account" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.studentName}>{item.student}</Text>
            <Text style={styles.courseName}>{item.course}</Text>
          </View>
        </View>
        <Text style={styles.amountText}>Rs. {item.amount}</Text>
      </View>

      <View style={styles.divider} />

      <InfoRow
        icon="credit-card-outline"
        iconColor="#F39C12"
        label="Payment Type"
        value={item.paymentType}
      />
      <InfoRow
        icon="calendar"
        iconColor="#2E86DE"
        label="Date"
        value={new Date(item.paymentDate).toLocaleDateString()}
      />

      <View style={styles.statusRow}>
        <View style={styles.statusBlock}>
          <Text style={styles.statusLabel}>Parent</Text>
          <StatusPill
            text={item.parentStatus}
            positive={item.parentStatus === "Paid"}
          />
        </View>
        <View style={styles.statusBlock}>
          <Text style={styles.statusLabel}>Tutor</Text>
          <StatusPill
            text={item.tutorStatus}
            positive={item.tutorStatus === "Received"}
          />
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.button, styles.receivedButton]}
          onPress={() => updateStatus(item.paymentId, "Received")}
        >
          <Icon name="check-circle-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Received</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.button, styles.notReceivedButton]}
          onPress={() => updateStatus(item.paymentId, "NotReceived")}
        >
          <Icon name="close-circle-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Not Received</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#2E86DE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={24} color="#1B1B1B" />
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

      <Text style={styles.screenTitle}>Payments</Text>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.paymentId.toString()}
        renderItem={renderItem}
        contentContainerStyle={
          payments.length === 0 ? styles.flexGrow : styles.listContent
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Icon name="cash-remove" size={70} color="#ccc" />
            <Text style={styles.emptyText}>No Payments Found</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F3F6",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerSpacer: {
    width: 38,
  },

  logoImage: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 2,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B1B1B",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 6,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F6F9",
  },

  listContent: {
    paddingBottom: 24,
  },

  flexGrow: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 14,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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
  },

  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2E86DE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B1B1B",
  },

  courseName: {
    fontSize: 13,
    color: "#8A94A6",
    marginTop: 1,
  },

  amountText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#27AE60",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  label: {
    fontWeight: "500",
    fontSize: 13,
    color: "#8A94A6",
    width: 110,
  },

  value: {
    fontSize: 14,
    color: "#1B1B1B",
    flex: 1,
    textAlign: "right",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },

  statusBlock: {
    flex: 1,
  },

  statusLabel: {
    fontSize: 12,
    color: "#8A94A6",
    marginBottom: 6,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 5,
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

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },

  receivedButton: {
    backgroundColor: "#27AE60",
  },

  notReceivedButton: {
    backgroundColor: "#E74C3C",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: "gray",
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