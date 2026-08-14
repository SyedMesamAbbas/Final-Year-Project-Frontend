import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminTutorDetailScreen = ({ navigation, route }) => {
  const { tutorId } = route.params;

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    fetchTutor();
  }, []);

  const fetchTutor = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/Admin/tutor/${tutorId}`
      );

      setTutor(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to load tutor details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#4CAF50";

      case "Rejected":
        return "#F44336";

      case "Blocked":
        return "#212121";

      default:
        return "#FF9800";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
      </SafeAreaView>
    );
  }

  if (!tutor) {
    return (
      <SafeAreaView style={styles.loader}>
        <Text style={styles.errorText}>
          Tutor details not found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#F5F3FF"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
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

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile */}
        <View style={styles.profile}>
          <Icon
            name="account-circle"
            size={90}
            color={colors.primary}
          />

          <Text style={styles.name}>
            {tutor.fullName}
          </Text>

          <View
            style={[
              styles.status,
              {
                backgroundColor: getStatusColor(
                  tutor.status
                ),
              },
            ]}
          >
            <Text style={styles.statusText}>
              {tutor.status}
            </Text>
          </View>
        </View>

        {/* Tutor Information */}
        <View style={styles.card}>
          <Info
            title="Email"
            value={tutor.email}
          />

          <Info
            title="Phone"
            value={tutor.phone}
          />

          <Info
            title="CNIC"
            value={tutor.cnic}
          />

          <Info
            title="Qualification"
            value={tutor.qualification}
          />

          <Info
            title="Experience"
            value={
              tutor.experience !== null &&
              tutor.experience !== undefined
                ? `${tutor.experience} Years`
                : "-"
            }
          />

          <Info
            title="Location"
            value={tutor.location}
          />

          <Info
            title="Teaching Radius"
            value={
              tutor.radius !== null &&
              tutor.radius !== undefined
                ? `${tutor.radius} KM`
                : "-"
            }
          />
        </View>

        {/* Subjects */}
        <Text style={styles.sectionTitle}>
          Subjects
        </Text>

        <View style={styles.subjectCard}>
          <View style={styles.subjectContainer}>
            {tutor.subjects &&
            tutor.subjects.length > 0 ? (
              tutor.subjects.map((subject, index) => (
                <View
                  key={`${subject}-${index}`}
                  style={styles.subject}
                >
                  <Text style={styles.subjectText}>
                    {subject}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>
                No subjects available
              </Text>
            )}
          </View>
        </View>

        {/* Performance */}
        <Text style={styles.sectionTitle}>
          Performance
        </Text>

        <View style={styles.performanceCard}>
          {/* Rating */}
          <View style={styles.performanceItem}>
            <Icon
              name="star"
              size={54}
              color="#F2A900"
            />

            <Text style={styles.performanceNumber}>
              {Number(tutor.rating || 0).toFixed(1)}
            </Text>

            <Text style={styles.performanceLabel}>
              Rating
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.performanceDivider} />

          {/* Reviews */}
          <View style={styles.performanceItem}>
            <Icon
              name="rate-review"
              size={50}
              color={colors.primary}
            />

            <Text style={styles.performanceNumber}>
              {tutor.totalReviews || 0}
            </Text>

            <Text style={styles.performanceLabel}>
              Reviews
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const Info = ({ title, value }) => (
  <View style={styles.info}>
    <Text style={styles.label}>
      {title}
    </Text>

    <Text style={styles.value}>
      {value || "-"}
    </Text>
  </View>
);

export default AdminTutorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 16,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
  },

  errorText: {
    fontSize: 16,
    color: "#555",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    height: 55,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 120,
    height: 45,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  profile: {
    alignItems: "center",
    marginTop: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#222",
  },

  status: {
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
  },

  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  /* -----------------------------
     Tutor Information Card
  ------------------------------ */

  card: {
    backgroundColor: "#fff",
    marginTop: 25,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 5,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  info: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: "#777",
    marginBottom: 5,
  },

  value: {
    fontSize: 16,
    color: "#111",
    fontWeight: "600",
  },

  /* -----------------------------
     Section Titles
  ------------------------------ */

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#172033",
    marginTop: 26,
    marginBottom: 14,
  },

  /* -----------------------------
     Subjects
  ------------------------------ */

  subjectCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  subjectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  subject: {
    backgroundColor: "#EEF0FF",
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 28,
    marginRight: 8,
    marginBottom: 10,
  },

  subjectText: {
    color: colors.primary,
    fontWeight: "500",
    fontSize: 16,
  },

  noDataText: {
    color: "#777",
    fontSize: 15,
  },

  /* -----------------------------
     Performance
  ------------------------------ */

  performanceCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    minHeight: 230,
    paddingVertical: 28,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  performanceItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  performanceNumber: {
    fontSize: 40,
    fontWeight: "700",
    color: "#172033",
    marginTop: 8,
  },

  performanceLabel: {
    fontSize: 17,
    color: "#777",
    marginTop: 4,
  },

  performanceDivider: {
    width: 1,
    height: 145,
    backgroundColor: "#E5E5E5",
  },

  bottomSpace: {
    height: 25,
  },
});


















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   TouchableOpacity,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   StatusBar,
//   Alert,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import axios from "axios";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const AdminTutorDetailScreen = ({ navigation, route }) => {
//   const { tutorId } = route.params;

//   const [loading, setLoading] = useState(true);
//   const [tutor, setTutor] = useState(null);

//   useEffect(() => {
//     fetchTutor();
//   }, []);

//   const fetchTutor = async () => {
//     try {
//       const response = await axios.get(
//         `${BASE_URL}/Admin/tutor/${tutorId}`
//       );

//       setTutor(response.data);
//     } catch (error) {
//       console.log(error.response?.data || error.message);

//       Alert.alert(
//         "Error",
//         error.response?.data?.message ||
//           "Unable to load tutor details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Approved":
//         return "#4CAF50";

//       case "Rejected":
//         return "#F44336";

//       case "Blocked":
//         return "#212121";

//       default:
//         return "#FF9800";
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loader}>
//         <ActivityIndicator
//           size="large"
//           color={colors.primary}
//         />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//         >
//           <Icon
//             name="arrow-back"
//             size={26}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.profile}>
//           <Icon
//             name="account-circle"
//             size={90}
//             color={colors.primary}
//           />

//           <Text style={styles.name}>
//             {tutor.fullName}
//           </Text>

//           <View
//             style={[
//               styles.status,
//               {
//                 backgroundColor: getStatusColor(
//                   tutor.status
//                 ),
//               },
//             ]}
//           >
//             <Text style={styles.statusText}>
//               {tutor.status}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.card}>
//           <Info
//             title="Email"
//             value={tutor.email}
//           />

//           <Info
//             title="Phone"
//             value={tutor.phone}
//           />

//           <Info
//             title="CNIC"
//             value={tutor.cnic}
//           />

//           <Info
//             title="Qualification"
//             value={tutor.qualification}
//           />

//           <Info
//             title="Experience"
//             value={`${tutor.experience} Years`}
//           />

//           <Info
//             title="Location"
//             value={tutor.location}
//           />

//           <Info
//             title="Teaching Radius"
//             value={`${tutor.radius} KM`}
//           />

//           <Info
//             title="Rating"
//             value={`${Number(
//               tutor.rating
//             ).toFixed(1)} ⭐`}
//           />

//           <Info
//             title="Reviews"
//             value={tutor.totalReviews.toString()}
//           />

//           <View style={styles.info}>
//             <Text style={styles.label}>
//               Subjects
//             </Text>

//             <View style={styles.subjectContainer}>
//               {tutor.subjects.map(
//                 (subject, index) => (
//                   <View
//                     key={index}
//                     style={styles.subject}
//                   >
//                     <Text
//                       style={styles.subjectText}
//                     >
//                       {subject}
//                     </Text>
//                   </View>
//                 )
//               )}
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const Info = ({ title, value }) => (
//   <View style={styles.info}>
//     <Text style={styles.label}>
//       {title}
//     </Text>

//     <Text style={styles.value}>
//       {value || "-"}
//     </Text>
//   </View>
// );

// export default AdminTutorDetailScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F3FF",
//     paddingHorizontal: 16,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   profile: {
//     alignItems: "center",
//     marginTop: 25,
//   },

//   name: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginTop: 10,
//     color: "#222",
//   },

//   status: {
//     marginTop: 10,
//     borderRadius: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 6,
//   },

//   statusText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginTop: 25,
//     borderRadius: 15,
//     padding: 18,
//     marginBottom: 30,
//     elevation: 3,
//   },

//   info: {
//     marginBottom: 18,
//   },

//   label: {
//     fontSize: 13,
//     color: "#777",
//     marginBottom: 4,
//   },

//   value: {
//     fontSize: 16,
//     color: "#111",
//     fontWeight: "600",
//   },

//   subjectContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 8,
//   },

//   subject: {
//     backgroundColor: colors.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 18,
//     marginRight: 8,
//     marginBottom: 8,
//   },

//   subjectText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 13,
//   },
// });