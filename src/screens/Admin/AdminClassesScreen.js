import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminClassesScreen = ({ navigation }) => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Admin/all-classes`);
      setClassesData(response.data);
    } catch (error) {
      console.log("Classes Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "Pending") return "#FF9800";
    if (status === "Completed") return "#4CAF50";
    return "#F44336";
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View
        style={[
          styles.sideBar,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.student}>{item.studentName}</Text>
          <Text style={styles.subject}>{item.subjectName}</Text>
        </View>

        <Text style={styles.tutor}>Tutor: {item.tutorName}</Text>

        <Text style={styles.time}>
          {item.classTime
            ? new Date(item.classTime).toLocaleString()
            : "No Time"}
        </Text>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.screenTitle}>All Classes</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={classesData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No classes found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminClassesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },

  logo: {
    width: 120,
    height: 45,
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 15,
    color: "#333",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 30,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    overflow: "hidden",
  },

  sideBar: {
    width: 5,
  },

  content: {
    flex: 1,
    padding: 14,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  student: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  subject: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  tutor: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },

  time: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
});
















































// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const classesData = [
//   {
//     id: "1",
//     student: "Ali Hussain",
//     subject: "OOP",
//     tutor: "Manan Rana",
//     time: "Oct 12 | 10:00AM",
//     status: "Pending",
//   },
//   {
//     id: "2",
//     student: "Umair Khokhar",
//     subject: "DSA",
//     tutor: "Mesam Abbas",
//     time: "Oct 12 | 10:00AM",
//     status: "Canceled",
//   },
//   {
//     id: "3",
//     student: "Usaid ur Rehman",
//     subject: "AA",
//     tutor: "Laiba Batool",
//     time: "Oct 12 | 10:00AM",
//     status: "Completed",
//   },
//   {
//     id: "4",
//     student: "Zaryab Babar",
//     subject: "CA",
//     tutor: "Rimsha Abbasi",
//     time: "Oct 12 | 10:00AM",
//     status: "Canceled",
//   },
//   {
//     id: "5",
//     student: "Usman Hayat",
//     subject: "PF",
//     tutor: "Dur e Fishan",
//     time: "Oct 12 | 10:00AM",
//     status: "Pending",
//   },
// ];

// const AdminClassesScreen = ({ navigation }) => {
//   const getStatusColor = (status) => {
//     if (status === "Pending") return "#FF9800";
//     if (status === "Completed") return "#4CAF50";
//     return "#F44336";
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       {/* Left Color Bar */}
//       <View
//         style={[
//           styles.sideBar,
//           { backgroundColor: getStatusColor(item.status) },
//         ]}
//       />

//       {/* Content */}
//       <View style={styles.content}>
//         <View style={styles.row}>
//           <Text style={styles.student}>{item.student}</Text>
//           <Text style={styles.subject}>{item.subject}</Text>
//         </View>

//         <Text style={styles.tutor}>Tutor: {item.tutor}</Text>
//         <Text style={styles.time}>{item.time}</Text>

//         {/* Status */}
//         <View
//           style={[
//             styles.statusBadge,
//             { backgroundColor: getStatusColor(item.status) },
//           ]}
//         >
//           <Text style={styles.statusText}>{item.status}</Text>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       {/* Title */}
//       <Text style={styles.screenTitle}>All Classes</Text>

//       {/* List */}
//       <FlatList
//         data={classesData}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       />
//     </SafeAreaView>
//   );
// };

// export default AdminClassesScreen;

// /* ================= STYLES ================= */

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   screenTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginVertical: 15,
//     color: "#333",
//   },

//   card: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     marginBottom: 12,
//     elevation: 4,
//     overflow: "hidden",
//   },

//   sideBar: {
//     width: 5,
//   },

//   content: {
//     flex: 1,
//     padding: 14,
//   },

//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   student: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#000",
//   },

//   subject: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.primary,
//   },

//   tutor: {
//     fontSize: 13,
//     color: "#555",
//     marginTop: 4,
//   },

//   time: {
//     fontSize: 12,
//     color: "#777",
//     marginTop: 2,
//   },

//   statusBadge: {
//     alignSelf: "flex-start",
//     marginTop: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },

//   statusText: {
//     fontSize: 12,
//     color: "#fff",
//     fontWeight: "600",
//   },
// });