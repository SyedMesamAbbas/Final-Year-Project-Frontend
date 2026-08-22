import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentProfile = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, []);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/student-profile/${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const text = await response.text();
      console.log("STUDENT PROFILE RESPONSE:", text);

      const data = text ? JSON.parse(text) : {};

      if (response.ok) {
        setStudent(data);
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to load student profile"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back-ios"
            size={18}
            color={colors.primary || "#0F172A"}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Student Profile</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card / Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.avatarWrapper}>
            {student?.profile_image ? (
              <Image
                source={{
                  uri: student.profile_image.startsWith("http")
                    ? student.profile_image
                    : `${BASE_URL}/${student.profile_image}`,
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {getInitials(student?.full_name)}
                </Text>
              </View>
            )}
            <View style={styles.verifiedBadge}>
              <Icon name="check" size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.studentName}>
            {student?.full_name || "No Name"}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.studentRole}>Student</Text>
          </View>
        </View>

        {/* Contact Information Group */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.card}>
            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon
                  name="email"
                  size={20}
                  color={colors.primary || "#4F46E5"}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{student?.email || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Phone */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon
                  name="phone"
                  size={20}
                  color={colors.primary || "#4F46E5"}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.label}>Phone Number</Text>
                <Text style={styles.value}>{student?.phone || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* CNIC */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon
                  name="badge"
                  size={20}
                  color={colors.primary || "#4F46E5"}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.label}>CNIC / National ID</Text>
                <Text style={styles.value}>{student?.cnic || "N/A"}</Text>
              </View>
            </View>

            {/* Gender (Commented out per original logic) */}
            {/* 
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon
                  name="person"
                  size={20}
                  color={colors.primary || "#4F46E5"}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{student?.gender || "N/A"}</Text>
              </View>
            </View>
            */}

            {/* Address (Commented out per original logic) */}
            {/* 
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon
                  name="location-on"
                  size={20}
                  color={colors.primary || "#4F46E5"}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{student?.address || "N/A"}</Text>
              </View>
            </View>
            */}
          </View>
        </View>

        {/* Location Details Group */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Location Details</Text>

          <View style={styles.card}>
            {/* Location */}
            <View style={styles.infoRow}>
              <View style={styles.iconCircle}>
                <Icon
                  name="place"
                  size={20}
                  color={colors.primary || "#4F46E5"}
                />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.label}>City / Location</Text>
                <Text style={styles.value}>{student?.location || "N/A"}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Latitude & Longitude Side-by-Side */}
            <View style={styles.coordsContainer}>
              <View style={styles.coordBox}>
                <View style={styles.coordHeader}>
                  <Icon name="my-location" size={16} color="#64748B" />
                  <Text style={styles.coordLabel}>Latitude</Text>
                </View>
                <Text style={styles.coordValue} numberOfLines={1}>
                  {student?.latitude ? String(student.latitude) : "N/A"}
                </Text>
              </View>

              <View style={styles.coordBox}>
                <View style={styles.coordHeader}>
                  <Icon name="explore" size={16} color="#64748B" />
                  <Text style={styles.coordLabel}>Longitude</Text>
                </View>
                <Text style={styles.coordValue} numberOfLines={1}>
                  {student?.longitude ? String(student.longitude) : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
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
  backButton: {
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.primary || "#4F46E5",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary || "#4F46E5",
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#10B981",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  studentName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  roleBadge: {
    marginTop: 6,
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentRole: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoText: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 6,
  },
  coordsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  coordBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  coordHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  coordLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  coordValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
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
//   ActivityIndicator,
//   Alert,
//   ScrollView,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const StudentProfile = ({ navigation, route }) => {

//   const { studentId } = route.params;

//   const [student, setStudent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchStudentProfile();
//   }, []);

//   const fetchStudentProfile = async () => {
//     try {

//       setLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       const response = await fetch(
//         `${BASE_URL}/Tutor/student-profile/${studentId}`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const text = await response.text();

//       console.log("STUDENT PROFILE RESPONSE:", text);

//       const data = text ? JSON.parse(text) : {};

//       if (response.ok) {
//         setStudent(data);
//       } else {
//         Alert.alert(
//           "Error",
//           data.message || "Failed to load student profile"
//         );
//       }

//     } catch (error) {
//       console.log(error);

//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loaderContainer}>
//         <ActivityIndicator
//           size="large"
//           color={colors.primary}
//         />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Header */}
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

//         <Text style={styles.headerTitle}>
//           Student Profile
//         </Text>

//         <View style={{ width: 26 }} />

//       </View>

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 30 }}
//       >

//         {/* Profile Section */}
//         <View style={styles.profileSection}>

//           {/* <Image
//             source={
//               student?.profile_image
//                 ? {
//                     uri:
//                       student.profile_image.startsWith("http")
//                         ? student.profile_image
//                         : `${BASE_URL}/${student.profile_image}`,
//                   }
//                 : require("../../../assets/images/user.png")
//             }
//             style={styles.profileImage}
//           /> */}

//           <Text style={styles.studentName}>
//             {student?.full_name || "No Name"}
//           </Text>

//           <Text style={styles.studentRole}>
//             Student
//           </Text>

//         </View>

//         {/* Information Card */}
//         <View style={styles.card}>

//           {/* Email */}
//           <View style={styles.infoRow}>

//             <Icon
//               name="email"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Email
//               </Text>

//               <Text style={styles.value}>
//                 {student?.email || "N/A"}
//               </Text>
//             </View>

//           </View>

//           <View style={styles.divider} />

//           {/* Phone */}
//           <View style={styles.infoRow}>

//             <Icon
//               name="phone"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Phone
//               </Text>

//               <Text style={styles.value}>
//                 {student?.phone || "N/A"}
//               </Text>
//             </View>

//           </View>

//           <View style={styles.divider} />

//           {/* CNIC */}
//           <View style={styles.infoRow}>

//             <Icon
//               name="badge"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 CNIC
//               </Text>

//               <Text style={styles.value}>
//                 {student?.cnic || "N/A"}
//               </Text>
//             </View>

//           </View>

//           <View style={styles.divider} />

//           {/* Gender */}
//           {/* <View style={styles.infoRow}>

//             <Icon
//               name="person"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Gender
//               </Text>

//               <Text style={styles.value}>
//                 {student?.gender || "N/A"}
//               </Text>
//             </View>

//           </View> */}

//           <View style={styles.divider} />

//           {/* Address */}
//           {/* <View style={styles.infoRow}>

//             <Icon
//               name="location-on"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Address
//               </Text>

//               <Text style={styles.value}>
//                 {student?.address || "N/A"}
//               </Text>
//             </View>

//           </View> */}

//           <View style={styles.divider} />

//           {/* Location */}
//           <View style={styles.infoRow}>

//             <Icon
//               name="map"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Location
//               </Text>

//               <Text style={styles.value}>
//                 {student?.location || "N/A"}
//               </Text>
//             </View>

//           </View>

//           <View style={styles.divider} />

//           {/* Latitude */}
//           <View style={styles.infoRow}>

//             <Icon
//               name="my-location"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Latitude
//               </Text>

//               <Text style={styles.value}>
//                 {student?.latitude || "N/A"}
//               </Text>
//             </View>

//           </View>

//           <View style={styles.divider} />

//           {/* Longitude */}
//           <View style={styles.infoRow}>

//             <Icon
//               name="explore"
//               size={22}
//               color={colors.primary}
//             />

//             <View style={styles.infoText}>
//               <Text style={styles.label}>
//                 Longitude
//               </Text>

//               <Text style={styles.value}>
//                 {student?.longitude || "N/A"}
//               </Text>
//             </View>

//           </View>

//         </View>

//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default StudentProfile;

// const styles = StyleSheet.create({

//   container: {
//     flex: 1,
//     backgroundColor: "#F4F6F9",
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: "#fff",
//     elevation: 3,
//   },

//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: colors.primary,
//   },

//   profileSection: {
//     alignItems: "center",
//     marginTop: 25,
//   },

//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     borderWidth: 3,
//     borderColor: colors.primary,
//   },

//   studentName: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#222",
//     marginTop: 14,
//   },

//   studentRole: {
//     fontSize: 15,
//     color: "#777",
//     marginTop: 4,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginTop: 25,
//     marginBottom: 20,
//     borderRadius: 18,
//     padding: 18,
//     elevation: 3,
//   },

//   infoRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     paddingVertical: 12,
//   },

//   infoText: {
//     marginLeft: 14,
//     flex: 1,
//   },

//   label: {
//     fontSize: 13,
//     color: "#888",
//     marginBottom: 3,
//   },

//   value: {
//     fontSize: 15,
//     color: "#222",
//     fontWeight: "600",
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#eee",
//   },

// });