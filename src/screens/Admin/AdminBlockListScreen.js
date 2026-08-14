import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminBlockListScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(
      `${BASE_URL}/Admin/blocked-users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setData(response.data);
  } catch (error) {
    console.log(error.response?.data || error);

    Alert.alert(
      "Error",
      error.response?.data?.message ||
        "Failed to load blocked users"
    );
  } finally {
    setLoading(false);
  }
};

  const handleRestore = async (id) => {
  try {

    const token = await AsyncStorage.getItem("token");

    const response = await axios.put(
      `${BASE_URL}/Admin/restore-user/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    Alert.alert("Success", response.data.message);

    fetchBlockedUsers();

  } catch (error) {

    console.log(error.response?.data || error);

    Alert.alert(
      "Error",
      error.response?.data?.message ||
      "Failed to restore user"
    );
  }
};

  const renderItem = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={
            index % 4 === 0
              ? require("../../../assets/images/user1.png")
              : index % 4 === 1
              ? require("../../../assets/images/user2.png")
              : index % 4 === 2
              ? require("../../../assets/images/user3.png")
              : require("../../../assets/images/user4.png")
          }
          style={styles.avatar}
        />

        <View style={styles.info}>
          <Text style={styles.name}>{item.fullName}</Text>

          <Text style={styles.subject}>
            {item.subjects || item.role || "No Subject"}
          </Text>

          <View style={styles.buttonRow}>
            <ActionButton
              title="Restore"
              icon="restore"
              onPress={() => handleRestore(item.id)}
            />
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() =>
                navigation.navigate("AdminTutorDetailScreen", {
                  tutorId: item.id,
                })
              }
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>            
          </View>
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

      <Text style={styles.screenTitle}>Blocked Users</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No blocked users found</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminBlockListScreen;

const ActionButton = ({ title, icon, onPress, danger }) => (
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: danger ? "#FDECEA" : "#E3F2FD" },
    ]}
    onPress={onPress}
  >
    <Icon
      name={icon}
      size={16}
      color={danger ? "#D32F2F" : "#1976D2"}
      style={{ marginRight: 5 }}
    />
    <Text
      style={[
        styles.buttonText,
        { color: danger ? "#D32F2F" : "#1976D2" },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

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
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  subject: {
    fontSize: 13,
    color: "#666",
    marginVertical: 4,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },

  buttonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  viewBtn: {
  flex: 1,
  backgroundColor: "#2196F3",
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: "center",
  marginHorizontal: 3,
  elevation: 2,
},
 buttonText: {
    color: "#fff",
    fontSize: 12,
  },
});
















































// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   Alert,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const initialData = [
//   {
//     id: "1",
//     name: "Faizan Shahid",
//     subject: "Mathematics",
//     image: require("../../../assets/images/user1.png"),
//   },
//   {
//     id: "2",
//     name: "Mesam Abbas",
//     subject: "OOP",
//     image: require("../../../assets/images/user2.png"),
//   },
//   {
//     id: "3",
//     name: "Maryam Bibi",
//     subject: "Software Engineering",
//     image: require("../../../assets/images/user3.png"),
//   },
//   {
//     id: "4",
//     name: "Mannan Rana Jee",
//     subject: "PF",
//     image: require("../../../assets/images/user4.png"),
//   },
// ];

// const AdminBlockListScreen = ({ navigation }) => {
//   const [data, setData] = useState(initialData);

//   const handleRestore = (id) => {
//     Alert.alert("Restore", "User restored successfully");
//     setData(data.filter((item) => item.id !== id));
//   };

//   const handleDelete = (id) => {
//     Alert.alert("Delete", "User deleted permanently");
//     setData(data.filter((item) => item.id !== id));
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.row}>
//         <Image source={item.image} style={styles.avatar} />

//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.subject}>{item.subject}</Text>

//           <View style={styles.buttonRow}>
//             <ActionButton
//               title="Restore"
//               icon="restore"
//               onPress={() => handleRestore(item.id)}
//             />

//             <ActionButton
//               title="Delete"
//               icon="delete"
//               danger
//               onPress={() => handleDelete(item.id)}
//             />
//           </View>
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
//       <Text style={styles.screenTitle}>Blocked Users</Text>

//       {/* List */}
//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 40 }}
//       />
//     </SafeAreaView>
//   );
// };

// export default AdminBlockListScreen;

// /* ---------- Button ---------- */
// const ActionButton = ({ title, icon, onPress, danger }) => (
//   <TouchableOpacity
//     style={[
//       styles.button,
//       { backgroundColor: danger ? "#FDECEA" : "#E3F2FD" },
//     ]}
//     onPress={onPress}
//   >
//     <Icon
//       name={icon}
//       size={16}
//       color={danger ? "#D32F2F" : "#1976D2"}
//       style={{ marginRight: 5 }}
//     />
//     <Text
//       style={[
//         styles.buttonText,
//         { color: danger ? "#D32F2F" : "#1976D2" },
//       ]}
//     >
//       {title}
//     </Text>
//   </TouchableOpacity>
// );

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
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 12,
//     elevation: 4,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//   },

//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#000",
//   },

//   subject: {
//     fontSize: 13,
//     color: "#666",
//     marginVertical: 4,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 8,
//   },

//   button: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 10,
//   },

//   buttonText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
// });