import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";
import Icon from "react-native-vector-icons/MaterialIcons";

const StudentCourses = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  // ── Load location + userId saved at login ─────────────────────────
  const loadUserData = async () => {
    try {
      const lat = await AsyncStorage.getItem("latitude");
      const lng = await AsyncStorage.getItem("longitude");

      if (lat) {
        setUserLat(parseFloat(lat));
      }

      if (lng) {
        setUserLng(parseFloat(lng));
      }
    } catch (err) {
      console.log("User data error:", err);
    }
  };

  // ── Fetch student's enrolled courses ──────────────────────────────
  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        const formatted = (data || []).map((c) => ({
          id: c.course_id,
          name: c.course_name,
        }));
        setSubjects(formatted);
      }
    } catch (err) {
      console.log("Courses error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadUserData();
      await fetchSubjects();
      setLoading(false);
    };
    init();
  }, []);

  // ── Navigate to StudentFindTutor ───────────────────────────────────
  const handleFindTutor = (subject) => {
    if (userLat == null || userLng == null) {
      alert("Location not found. Please enable location access.");
      return;
    }

    navigation.navigate("StudentFindTutor", {
      courseId: subject.id,
      courseName: subject.name,
      userLat,
      userLng,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.navigate("StudentDrawer")}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => navigation.navigate("StudentAddCourses")}
          activeOpacity={0.7}
        >
          <Icon name="add" size={24} color={colors.primary || "#4F46E5"} />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <View>
            <Text style={styles.pageTitle}>My Enrolled Courses</Text>
            <Text style={styles.pageSubtitle}>
              Select a subject to find tutors near your location
            </Text>
          </View>
          {subjects.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{subjects.length}</Text>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
            <Text style={styles.loadingText}>Fetching your courses...</Text>
          </View>
        ) : (
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="class" size={48} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No Enrolled Courses</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't added any courses to your profile yet. Add a course to start searching for tutors.
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => navigation.navigate("StudentAddCourses")}
                  activeOpacity={0.8}
                >
                  <Icon name="add-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.emptyButtonText}>Explore Courses</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.courseIconContainer}>
                    <Icon name="auto-stories" size={22} color={colors.primary || "#4F46E5"} />
                  </View>
                  <View style={styles.courseDetails}>
                    <Text style={styles.subject} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.courseMeta}>Active Course</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleFindTutor(item)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.buttonText}>Find Tutor</Text>
                  <Icon name="search" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentHome")}
          activeOpacity={0.7}
        >
          <Icon name="calendar-today" size={22} color="#64748B" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentAddCourses")}
          activeOpacity={0.7}
        >
          <Icon name="library-add" size={22} color="#64748B" />
          <Text style={styles.navText}>Add Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.activeNavIndicator}>
            <Icon name="menu-book" size={22} color={colors.primary || "#4F46E5"} />
          </View>
          <Text style={styles.navTextActive}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentAllClasses")}
          activeOpacity={0.7}
        >
          <Icon name="school" size={22} color="#64748B" />
          <Text style={styles.navText}>Classes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // ── HEADER STYLES ──────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },

  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 32,
    height: 32,
    resizeMode: "contain",
    marginRight: 8,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.3,
  },

  // ── CONTENT STYLES ─────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  pageSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  badge: {
    backgroundColor: (colors.primary || "#4F46E5") + "15",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    color: colors.primary || "#4F46E5",
    fontSize: 12,
    fontWeight: "700",
  },

  listContainer: {
    paddingBottom: 100,
  },

  // ── CARD STYLES ────────────────────────────────────────────────
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  courseIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: (colors.primary || "#4F46E5") + "10",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  courseDetails: {
    flex: 1,
  },

  subject: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    lineHeight: 22,
  },

  courseMeta: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
  },

  button: {
    backgroundColor: colors.primary || "#4F46E5",
    height: 44,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // ── EMPTY & LOADING STATES ─────────────────────────────────────
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
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
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary || "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  // ── BOTTOM NAV STYLES ──────────────────────────────────────────
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 84 : 64,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  activeNavIndicator: {
    padding: 2,
  },

  navText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "500",
  },

  navTextActive: {
    fontSize: 11,
    color: colors.primary || "#4F46E5",
    marginTop: 4,
    fontWeight: "700",
  },
});
