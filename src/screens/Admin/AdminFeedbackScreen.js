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

const AdminFeedbackScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH FEEDBACK =================

  const fetchFeedback = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/Admin/all-feedback`
      );

      setData(response.data || []);
    } catch (error) {
      console.log(
        "Feedback Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to load feedback."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE FEEDBACK =================

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Feedback",
      "Are you sure you want to delete this feedback?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                `${BASE_URL}/Admin/delete-feedback/${id}`
              );

              Alert.alert(
                "Success",
                "Feedback deleted successfully."
              );

              fetchFeedback();
            } catch (error) {
              console.log(
                "Delete Error:",
                error.response?.data || error.message
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete feedback."
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Icon
        key={index}
        name="star"
        size={16}
        color={index < rating ? "#FFC107" : "#DDD"}
      />
    ));
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.studentName}</Text>
          <Text style={styles.tutor}>
            Tutor: {item.tutorName}
          </Text>
           <Text style={styles.feedbackBy}>
              Feedback By: {item.feedbackBy}
           </Text>
        </View>
        

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" color="#fff" size={18} />
        </TouchableOpacity>
      </View>

      <Text style={styles.feedback}>
        {item.feedbackText}
      </Text>

      <View style={styles.ratingRow}>
        <View style={{ flexDirection: "row" }}>
          {renderStars(item.rating)}
        </View>

        <Text style={styles.score}>
          {item.rating}/5
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#EDE7F6"
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.screenTitle}>
        Feedback Management
      </Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            (item.id ?? index).toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No feedback available
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminFeedbackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  },

  logo: {
    width: 120,
    height: 45,
  },

  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginVertical: 15,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    fontSize: 15,
    color: "#777",
    marginTop: 40,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  tutor: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  feedback: {
    fontSize: 13,
    color: "#444",
    marginVertical: 10,
    lineHeight: 20,
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  score: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  feedbackBy: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 2,
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
//   Image,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const AdminFeedbackScreen = ({ navigation }) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ================= FETCH FEEDBACK API =================
//   const fetchFeedback = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         "http://YOUR_IP_ADDRESS:5000/api/all-feedback"
//       );

//       const result = await response.json();

//       if (response.ok) {
//         setData(result);
//       } else {
//         Alert.alert("Error", "Failed to load feedback");
//       }
//     } catch (error) {
//       console.log("Fetch Feedback Error:", error);
//       Alert.alert("Error", "Unable to connect to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= DELETE FEEDBACK API =================
//   const handleDelete = async (id) => {
//     Alert.alert(
//       "Delete Feedback",
//       "Are you sure you want to delete this feedback?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Delete",
//           onPress: async () => {
//             try {
//               const response = await fetch(
//                 `http://YOUR_IP_ADDRESS:5000/api/Feedback/${id}`,
//                 {
//                   method: "DELETE",
//                 }
//               );

//               if (response.ok) {
//                 setData((prevData) =>
//                   prevData.filter((item) => item.id !== id)
//                 );
//                 Alert.alert("Success", "Feedback deleted successfully");
//               } else {
//                 Alert.alert("Error", "Failed to delete feedback");
//               }
//             } catch (error) {
//               console.log("Delete Feedback Error:", error);
//               Alert.alert("Error", "Unable to connect to server");
//             }
//           },
//         },
//       ]
//     );
//   };

//   useEffect(() => {
//     fetchFeedback();
//   }, []);

//   const renderStars = (rating) => {
//     return Array.from({ length: 5 }).map((_, i) => (
//       <Icon
//         key={i}
//         name="star"
//         size={16}
//         color={i < rating ? "#FFC107" : "#ddd"}
//       />
//     ));
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       {/* Top Row */}
//       <View style={styles.topRow}>
//         <View>
//           <Text style={styles.name}>{item.studentName}</Text>
//           <Text style={styles.tutor}>Tutor: {item.tutorName}</Text>
//         </View>

//         <TouchableOpacity
//           style={styles.deleteBtn}
//           onPress={() => handleDelete(item.id)}
//         >
//           <Icon name="delete" size={18} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Feedback */}
//       <Text style={styles.feedback}>{item.feedbackText}</Text>

//       {/* Rating */}
//       <View style={styles.ratingRow}>
//         <View style={{ flexDirection: "row" }}>
//           {renderStars(item.rating)}
//         </View>
//         <Text style={styles.score}>{item.rating}.0</Text>
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
//       <Text style={styles.screenTitle}>Feedback Management</Text>

//       {/* Loader */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       ) : (
//         <FlatList
//           data={data}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No feedback available</Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default AdminFeedbackScreen;

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
//     elevation: 3,
//   },

//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   tutor: {
//     fontSize: 13,
//     color: "#666",
//   },

//   deleteBtn: {
//     backgroundColor: "#E53935",
//     padding: 6,
//     borderRadius: 20,
//   },

//   feedback: {
//     fontSize: 13,
//     color: "#444",
//     marginVertical: 10,
//     lineHeight: 18,
//   },

//   ratingRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   score: {
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
//     marginTop: 40,
//     fontSize: 15,
//     color: "#777",
//   },
// });
















































// import React, { useState } from "react";
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

// const initialFeedback = [
//   {
//     id: "1",
//     name: "Faizan Shahid",
//     tutor: "Ali",
//     rating: 5,
//     score: 4.9,
//     feedback:
//       "Tutor Ali explains concepts in a very clear and simple way. I was struggling with mathematics before, but after his sessions, I understand topics much better.",
//   },
//   {
//     id: "2",
//     name: "Mesam Abbas",
//     tutor: "Muneeb",
//     rating: 5,
//     score: 4.9,
//     feedback:
//       "Great teaching style and very supportive tutor. I improved my concepts quickly.",
//   },
//   {
//     id: "3",
//     name: "Maryam Bibi",
//     tutor: "Eman",
//     rating: 5,
//     score: 4.9,
//     feedback:
//       "Excellent experience! The tutor made everything easy to understand.",
//   },
// ];

// const AdminFeedbackScreen = ({ navigation }) => {
//   const [data, setData] = useState(initialFeedback);

//   const handleDelete = (id) => {
//     setData(data.filter((item) => item.id !== id));
//   };

//   const renderStars = (rating) => {
//     return Array.from({ length: 5 }).map((_, i) => (
//       <Icon
//         key={i}
//         name="star"
//         size={16}
//         color={i < rating ? "#FFC107" : "#ddd"}
//       />
//     ));
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       {/* Top Row */}
//       <View style={styles.topRow}>
//         <View>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.tutor}>Tutor: {item.tutor}</Text>
//         </View>

//         <TouchableOpacity
//           style={styles.deleteBtn}
//           onPress={() => handleDelete(item.id)}
//         >
//           <Icon name="delete" size={18} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       {/* Feedback */}
//       <Text style={styles.feedback}>{item.feedback}</Text>

//       {/* Rating */}
//       <View style={styles.ratingRow}>
//         <View style={{ flexDirection: "row" }}>
//           {renderStars(item.rating)}
//         </View>
//         <Text style={styles.score}>{item.score}</Text>
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
//       <Text style={styles.screenTitle}>Feedback Management</Text>

//       {/* List */}
//       <FlatList
//         data={data}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 100 }}
//       />
//     </SafeAreaView>
//   );
// };

// export default AdminFeedbackScreen;

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
//     elevation: 3,
//   },

//   topRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   name: {
//     fontSize: 16,
//     fontWeight: "700",
//   },

//   tutor: {
//     fontSize: 13,
//     color: "#666",
//   },

//   deleteBtn: {
//     backgroundColor: "#E53935",
//     padding: 6,
//     borderRadius: 20,
//   },

//   feedback: {
//     fontSize: 13,
//     color: "#444",
//     marginVertical: 10,
//     lineHeight: 18,
//   },

//   ratingRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   score: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: colors.primary,
//   },
// });