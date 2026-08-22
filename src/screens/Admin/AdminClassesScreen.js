import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  TextInput,
  RefreshControl,
  Platform,
} from "react-native";

import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

//==================================================
// Design System Tokens
//==================================================
const Theme = {
  primary: colors?.primary || "#4F46E5",
  primaryLight: "#EEF2FF",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  borderSubtle: "#F1F5F9",

  // Status Theme Configs
  statusPending: "#D97706",
  statusPendingLight: "#FFFBEB",
  statusPendingBorder: "#FDE68A",

  statusCompleted: "#059669",
  statusCompletedLight: "#ECFDF5",
  statusCompletedBorder: "#A7F3D0",

  statusCancelled: "#DC2626",
  statusCancelledLight: "#FEF2F2",
  statusCancelledBorder: "#FCA5A5",
};

const AdminClassesScreen = ({ navigation }) => {
  //==================================================
  // States
  //==================================================
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");

  //==================================================
  // API Call
  //==================================================
  const fetchClasses = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Admin/all-classes`);
      if (Array.isArray(response.data)) {
        setClassesData(response.data);
      } else {
        setClassesData([]);
      }
    } catch (error) {
      console.log("Classes Error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load classes"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

  //==================================================
  // Helper Functions
  //==================================================
  const getStatusTheme = (status) => {
    switch (status) {
      case "Pending":
        return {
          color: Theme.statusPending,
          bg: Theme.statusPendingLight,
          border: Theme.statusPendingBorder,
          icon: "hourglass-empty",
        };
      case "Completed":
        return {
          color: Theme.statusCompleted,
          bg: Theme.statusCompletedLight,
          border: Theme.statusCompletedBorder,
          icon: "check-circle-outline",
        };
      default:
        return {
          color: Theme.statusCancelled,
          bg: Theme.statusCancelledLight,
          border: Theme.statusCancelledBorder,
          icon: "highlight-off",
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Schedule Pending";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Schedule Pending";
    }
  };

  //==================================================
  // Filtered List Logic
  //==================================================
  const filteredClasses = useMemo(() => {
    return classesData.filter((item) => {
      // Status Pill Filter
      if (
        selectedStatusFilter !== "All" &&
        item.status !== selectedStatusFilter
      ) {
        return false;
      }

      // Search Bar Query
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      const student = item.studentName ? item.studentName.toLowerCase() : "";
      const tutor = item.tutorName ? item.tutorName.toLowerCase() : "";
      const subject = item.subjectName ? item.subjectName.toLowerCase() : "";

      return (
        student.includes(query) ||
        tutor.includes(query) ||
        subject.includes(query)
      );
    });
  }, [classesData, searchQuery, selectedStatusFilter]);

  //==================================================
  // Render Item
  //==================================================
  const renderItem = ({ item }) => {
    const statusConfig = getStatusTheme(item.status);

    return (
      <View style={styles.card}>
        {/* Accent Status Side Bar */}
        <View
          style={[
            styles.sideBar,
            { backgroundColor: statusConfig.color },
          ]}
        />

        <View style={styles.cardContent}>
          {/* Header Row: Subject & Status Pill */}
          <View style={styles.cardTopRow}>
            <View style={styles.subjectBadge}>
              <Icon name="book" size={13} color={Theme.primary} />
              <Text style={styles.subjectText} numberOfLines={1}>
                {item.subjectName || "General Subject"}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusConfig.bg,
                  borderColor: statusConfig.border,
                },
              ]}
            >
              <Icon
                name={statusConfig.icon}
                size={13}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {item.status || "Unknown"}
              </Text>
            </View>
          </View>

          {/* People Details */}
          <View style={styles.peopleSection}>
            <View style={styles.personRow}>
              <View style={styles.personIconBox}>
                <Icon name="school" size={15} color={Theme.textSecondary} />
              </View>
              <Text style={styles.personRoleLabel}>Student:</Text>
              <Text style={styles.personName} numberOfLines={1}>
                {item.studentName || "N/A"}
              </Text>
            </View>

            <View style={styles.personRow}>
              <View style={styles.personIconBox}>
                <Icon
                  name="person-outline"
                  size={15}
                  color={Theme.textSecondary}
                />
              </View>
              <Text style={styles.personRoleLabel}>Tutor:</Text>
              <Text style={styles.personName} numberOfLines={1}>
                {item.tutorName || "Unassigned"}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          {/* Schedule Footer */}
          <View style={styles.cardFooter}>
            <Icon name="event" size={15} color={Theme.textMuted} />
            <Text style={styles.timeText}>{formatDate(item.classTime)}</Text>
          </View>
        </View>
      </View>
    );
  };

  //==================================================
  // Main Render
  //==================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.surface} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
        >
          <Icon name="arrow-back-ios" size={16} color={Theme.textPrimary} style={{ marginLeft: 5 }} />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchClasses}
          accessibilityLabel="Refresh list"
        >
          <Icon name="refresh" size={20} color={Theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Title & Stats Header */}
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.screenTitle}>Class Management</Text>
          <Text style={styles.screenSubtitle}>
            Overview of scheduled and active sessions
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{classesData.length} Total</Text>
        </View>
      </View>

      {/* Search Bar & Filter Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color={Theme.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by student, tutor, or subject..."
            placeholderTextColor={Theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && Platform.OS !== "ios" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Icon name="close" size={18} color={Theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status Filter Chips */}
        <View style={styles.filterBar}>
          {["All", "Pending", "Completed"].map((filter) => {
            const isSelected = selectedStatusFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedStatusFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content Body */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Theme.primary} />
            <Text style={styles.loadingText}>Loading sessions...</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredClasses}
          keyExtractor={(item) =>
            item.id ? item.id.toString() : Math.random().toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            filteredClasses.length === 0
              ? styles.emptyListContainer
              : styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Theme.primary]}
              tintColor={Theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon
                  name={searchQuery ? "search-off" : "class"}
                  size={36}
                  color={Theme.textMuted}
                />
              </View>

              <Text style={styles.emptyTitle}>
                {searchQuery ? "No Matching Classes" : "No Classes Available"}
              </Text>

              <Text style={styles.emptyText}>
                {searchQuery
                  ? `No classes matching "${searchQuery}" were found under ${selectedStatusFilter} filter.`
                  : "There are currently no class sessions recorded in the system."}
              </Text>

              {searchQuery ? (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedStatusFilter("All");
                  }}
                >
                  <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={fetchClasses}
                >
                  <Icon name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.resetButtonText}>Refresh List</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminClassesScreen;

//====================================================
// STYLESHEET
//====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  logo: {
    width: 110,
    height: 38,
  },

  // Title Section
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Theme.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Theme.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Theme.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: Theme.primary,
  },

  // Controls Toolbar
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.textPrimary,
    paddingVertical: 0,
    fontWeight: "400",
  },
  filterBar: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  filterChipActive: {
    backgroundColor: Theme.primary,
    borderColor: Theme.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  // List Layout
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },

  // Class Card
  card: {
    flexDirection: "row",
    backgroundColor: Theme.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: "hidden",
  },
  sideBar: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  subjectBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
  },
  subjectText: {
    fontSize: 13,
    fontWeight: "700",
    color: Theme.primary,
    marginLeft: 5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },

  // People Section
  peopleSection: {
    marginTop: 12,
    gap: 6,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  personIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Theme.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  personRoleLabel: {
    fontSize: 12,
    color: Theme.textMuted,
    fontWeight: "500",
    marginRight: 4,
  },
  personName: {
    fontSize: 13,
    fontWeight: "600",
    color: Theme.textPrimary,
    flex: 1,
  },

  cardDivider: {
    height: 1,
    backgroundColor: Theme.borderSubtle,
    marginVertical: 10,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 12,
    color: Theme.textSecondary,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Loader & Empty States
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    backgroundColor: Theme.surface,
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: Theme.border,
  },
  loadingText: {
    marginTop: 12,
    color: Theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Theme.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: Theme.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  resetButton: {
    marginTop: 18,
    backgroundColor: Theme.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
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
// import axios from "axios";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const AdminClassesScreen = ({ navigation }) => {
//   const [classesData, setClassesData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchClasses();
//   }, []);

//   const fetchClasses = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/Admin/all-classes`);
//       setClassesData(response.data);
//     } catch (error) {
//       console.log("Classes Error:", error.response?.data || error.message);
//       Alert.alert("Error", "Failed to load classes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     if (status === "Pending") return "#FF9800";
//     if (status === "Completed") return "#4CAF50";
//     return "#F44336";
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View
//         style={[
//           styles.sideBar,
//           { backgroundColor: getStatusColor(item.status) },
//         ]}
//       />

//       <View style={styles.content}>
//         <View style={styles.row}>
//           <Text style={styles.student}>{item.studentName}</Text>
//           <Text style={styles.subject}>{item.subjectName}</Text>
//         </View>

//         <Text style={styles.tutor}>Tutor: {item.tutorName}</Text>

//         <Text style={styles.time}>
//           {item.classTime
//             ? new Date(item.classTime).toLocaleString()
//             : "No Time"}
//         </Text>

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

//       <Text style={styles.screenTitle}>All Classes</Text>

//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       ) : (
//         <FlatList
//           data={classesData}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={{ paddingBottom: 40 }}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No classes found</Text>
//           }
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// export default AdminClassesScreen;

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

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     fontSize: 16,
//     color: "#666",
//     marginTop: 30,
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