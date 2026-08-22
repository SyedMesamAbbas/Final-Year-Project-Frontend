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
  Image,
  Alert,
  StatusBar,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const ParentChildTutors = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTutors = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-tutors/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Tutors:", response.data);
      setTutors(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child tutors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTutors();
  }, []);

  // Helper to extract initials for avatar placeholder
  const getInitials = (name) => {
    if (!name) return "T";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Top Section: Profile Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.fullName)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {item.fullName}
          </Text>

          <View style={styles.qualificationBadge}>
            <Icon
              name="school-outline"
              size={13}
              color={colors.primary || "#3B82F6"}
            />
            <Text style={styles.qualificationText} numberOfLines={1}>
              {item.qualification || "Qualified Tutor"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Highlights Grid */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Icon name="briefcase-outline" size={16} color="#64748B" />
          <Text style={styles.statLabel}>Experience</Text>
          <Text style={styles.statValue}>
            {item.experience} {item.experience === 1 ? "Year" : "Years"}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Icon name="location-outline" size={16} color="#64748B" />
          <Text style={styles.statLabel}>Coverage</Text>
          <Text style={styles.statValue}>{item.radius} KM Radius</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Contact Details Section */}
      <View style={styles.contactSection}>
        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <Icon name="mail-outline" size={15} color="#475569" />
          </View>
          <Text style={styles.infoText} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconWrapper}>
            <Icon name="call-outline" size={15} color="#475569" />
          </View>
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
      </View>

      {/* Courses Section */}
      <View style={styles.courseContainer}>
        <View style={styles.courseHeader}>
          <Icon name="book-outline" size={16} color={colors.primary || "#3B82F6"} />
          <Text style={styles.courseTitle}>Assigned Courses</Text>
        </View>

        {item.coursesTeaching && item.coursesTeaching.length > 0 ? (
          <View style={styles.chipWrapper}>
            {item.coursesTeaching.map((course, index) => (
              <View key={index} style={styles.chip}>
                <Text style={styles.chipText}>{course}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyCoursesText}>
            No specific courses listed.
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navbar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="chevron-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
        />

        <View style={styles.headerPlaceholder} />
      </View>

      {/* Title Bar */}
      <View style={styles.titleContainer}>
        <View>
          <Text style={styles.title}>Assigned Tutors</Text>
          <Text style={styles.subtitle}>
            Manage and view academic instructors for your child
          </Text>
        </View>
      </View>

      {/* Content Area */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#3B82F6"} />
          <Text style={styles.loadingText}>Fetching tutors...</Text>
        </View>
      ) : (
        <FlatList
          data={tutors}
          keyExtractor={(item, index) => `${item.tutorId}-${index}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary || "#3B82F6"]}
              tintColor={colors.primary || "#3B82F6"}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            tutors.length === 0 && styles.flexGrowList,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon
                  name="school-outline"
                  size={48}
                  color={colors.primary || "#3B82F6"}
                />
              </View>
              <Text style={styles.emptyTitle}>No Tutors Assigned Yet</Text>
              <Text style={styles.emptySubtext}>
                When a tutor is assigned to your child, their profile and details will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ParentChildTutors;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justify: "center",
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 36,
    resizeMode: "contain",
  },
  headerPlaceholder: {
    width: 36,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  centerContainer: {
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
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  flexGrowList: {
    flexGrow: 1,
    justifyContent: "center",
  },

  /* Card Component Styling */
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
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary || "#3B82F6",
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  qualificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  qualificationText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
    marginLeft: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  /* Stats Section */
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },

  /* Info Rows */
  contactSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  infoText: {
    fontSize: 13.5,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },

  /* Course Badges Section */
  courseContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
    marginLeft: 6,
  },
  chipWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primary || "#2563EB",
  },
  emptyCoursesText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
  },

  /* Empty State */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
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
//   Image,
//   Alert,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import Icon from "react-native-vector-icons/Ionicons";

// import { BASE_URL } from "../../config/api";
// import colors from "../utils/colors";

// const ParentChildTutors = ({ navigation, route }) => {
//   const { studentId } = route.params;

//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchTutors = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await axios.get(
//         `${BASE_URL}/Parent/child-tutors/${studentId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Child Tutors:", response.data);

//       setTutors(response.data || []);
//     } catch (error) {
//       console.log(error.response?.data || error);

//       Alert.alert(
//         "Error",
//         error.response?.data?.message ||
//           "Unable to fetch child tutors."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     fetchTutors();
//   }, []);

//   const renderItem = ({ item }) => (
//   <View style={styles.card}>
//     <View style={styles.avatar}>
//       <Icon
//         name="school"
//         size={34}
//         color={colors.primary}
//       />
//     </View>

//     <View style={styles.info}>
//       {/* Full Name */}
//       <Text style={styles.name}>
//         {item.fullName}
//       </Text>

//       {/* Email */}
//       <View style={styles.row}>
//         <Icon
//           name="mail-outline"
//           size={18}
//           color={colors.primary}
//         />
//         <Text style={styles.value}>
//           {item.email}
//         </Text>
//       </View>

//       {/* Phone */}
//       <View style={styles.row}>
//         <Icon
//           name="call-outline"
//           size={18}
//           color={colors.primary}
//         />
//         <Text style={styles.value}>
//           {item.phone}
//         </Text>
//       </View>

//       {/* Qualification */}
//       <View style={styles.row}>
//         <Icon
//           name="school-outline"
//           size={18}
//           color={colors.primary}
//         />
//         <Text style={styles.value}>
//           Qualification: {item.qualification || "-"}
//         </Text>
//       </View>

//       {/* Experience */}
//       <View style={styles.row}>
//         <Icon
//           name="briefcase-outline"
//           size={18}
//           color={colors.primary}
//         />
//         <Text style={styles.value}>
//           Experience: {item.experience} Year{item.experience == 1 ? "" : "s"}
//         </Text>
//       </View>

//       {/* Radius */}
//       <View style={styles.row}>
//         <Icon
//           name="location-outline"
//           size={18}
//           color={colors.primary}
//         />
//         <Text style={styles.value}>
//           Radius: {item.radius} KM
//         </Text>
//       </View>

//       {/* Courses Teaching */}
//       <View style={styles.courseContainer}>
//         <View style={styles.row}>
//           <Icon
//             name="book-outline"
//             size={18}
//             color={colors.primary}
//           />
//           <Text style={styles.label}>
//             Courses Teaching
//           </Text>
//         </View>

//         {item.coursesTeaching?.length > 0 ? (
//           item.coursesTeaching.map((course, index) => (
//             <Text
//               key={index}
//               style={styles.courseText}
//             >
//               • {course}
//             </Text>
//           ))
//         ) : (
//           <Text style={styles.courseText}>
//             No Courses
//           </Text>
//         )}
//       </View>
//     </View>
//   </View>
// );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon
//               name="arrow-back"
//               size={28}
//               color={colors.primary}
//             />
//           </TouchableOpacity>

//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logo}
//           />

//           <View style={{ width: 28 }} />
//         </View>

//         <ActivityIndicator
//           size="large"
//           color={colors.primary}
//           style={{ marginTop: 60 }}
//         />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>

//       {/* Header */}

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon
//             name="arrow-back"
//             size={28}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//         />

//         <View style={{ width: 28 }} />
//       </View>

//       <Text style={styles.title}>
//         Child Tutors
//       </Text>

//       <FlatList
//         data={tutors}
//         keyExtractor={(item, index) =>
//           `${item.tutorId}-${index}`
//         }
//         renderItem={renderItem}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//           />
//         }
//         contentContainerStyle={{
//           padding: 15,
//           paddingBottom: 40,
//           flexGrow: tutors.length === 0 ? 1 : 0,
//         }}
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <Icon
//               name="school-outline"
//               size={90}
//               color="#999"
//             />

//             <Text style={styles.emptyText}>
//               No tutors assigned.
//             </Text>
//           </View>
//         }
//       />

//     </SafeAreaView>
//   );
// };

// export default ParentChildTutors;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   logo: {
//     width: 90,
//     height: 50,
//     resizeMode: "contain",
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: colors.primary,
//     textAlign: "center",
//     marginVertical: 15,
//   },

//   card: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     borderRadius: 12,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   avatar: {
//     width: 65,
//     height: 65,
//     borderRadius: 32.5,
//     backgroundColor: "#EEF4FF",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 15,
//   },

//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#222",
//     marginBottom: 10,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 6,
//   },

//   value: {
//     marginLeft: 8,
//     color: "#555",
//     fontSize: 14,
//     flex: 1,
//   },

//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     marginTop: 15,
//     fontSize: 18,
//     color: "#666",
//     fontWeight: "600",
//   },
//   label: {
//   fontWeight: "700",
//   color: colors.primary,
//   marginBottom: 4,
// },

// courseText: {
//   fontSize: 14,
//   color: "#555",
//   marginBottom: 2,
// },

// classTitle: {
//   fontSize: 16,
//   fontWeight: "700",
//   color: colors.primary,
//   marginBottom: 8,
// },

// classCard: {
//   backgroundColor: "#F6F8FC",
//   borderRadius: 8,
//   padding: 10,
//   marginBottom: 8,
// },

// classText: {
//   fontSize: 14,
//   color: "#444",
//   marginBottom: 2,
// },

// bold: {
//   fontWeight: "bold",
// },
// });