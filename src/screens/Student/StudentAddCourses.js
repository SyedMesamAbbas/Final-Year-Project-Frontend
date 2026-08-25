import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentAddCourses = ({ navigation }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // =====================================================
  // API INTEGRATIONS (UNTOUCHED LOGIC)
  // =====================================================

  const fetchMyCourses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMyCourses(data);
      } else {
        console.log("My Courses Error:", data);
      }
    } catch (e) {
      console.log("Fetch My Courses Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/all-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setAvailableCourses(data);
        setShowCourses(true);
      } else {
        console.log("All Courses Error:", data);
      }
    } catch (e) {
      console.log("Fetch All Courses Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (course) => {
    setAddingId(course.course_id);
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Student/add-courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseIds: [course.course_id],
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "Course added successfully");

        await fetchMyCourses();

        setShowCourses(false);
        setAvailableCourses([]);
        setSearchQuery("");
      } else {
        Alert.alert("Error", data.message || "Unable to add course");
      }
    } catch (e) {
      console.log("Add Course Error:", e);
    } finally {
      setAddingId(null);
    }
  };

  // Filter available courses based on client search input
  const filteredAvailableCourses = availableCourses.filter((course) =>
    course.course_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentDrawer")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

        <View style={{ width: 40 }} />
      </View>

      {/* CONTENT AREA */}
      <View style={styles.content}>
        {!showCourses ? (
          // =====================================================
          // MY ENROLLED COURSES VIEW
          // =====================================================
          <>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.pageTitle}>My Courses</Text>
                <Text style={styles.pageSubtitle}>
                  {myCourses.length}{" "}
                  {myCourses.length === 1 ? "course" : "courses"} currently
                  enrolled
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
                <Text style={styles.loadingText}>Loading your courses...</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {myCourses.length > 0 ? (
                  myCourses.map((course, index) => (
                    <View key={index} style={styles.courseCard}>
                      <View style={styles.courseIconBox}>
                        <Icon name="class" size={22} color={colors.primary || "#4F46E5"} />
                      </View>
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseTitle}>
                          {course.course_name}
                        </Text>
                        <View style={styles.activeTag}>
                          <View style={styles.activeDot} />
                          <Text style={styles.activeTagText}>Enrolled</Text>
                        </View>
                      </View>
                      <Icon name="chevron-right" size={20} color="#94A3B8" />
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconCircle}>
                      <Icon name="menu-book" size={36} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>No Courses Added Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Tap the button below to browse available catalog courses and start learning.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            {/* FLOATING ACTION BUTTON */}
            <TouchableOpacity
              style={styles.floatingBtn}
              activeOpacity={0.85}
              onPress={fetchAllCourses}
            >
              <Icon name="add" size={28} color="#FFFFFF" />
              <Text style={styles.floatingBtnText}>Add Course</Text>
            </TouchableOpacity>
          </>
        ) : (
          // =====================================================
          // AVAILABLE CATALOG COURSES VIEW
          // =====================================================
          <View style={styles.catalogContainer}>
            <View style={styles.catalogHeader}>
              <View>
                <Text style={styles.pageTitle}>Course Catalog</Text>
                <Text style={styles.pageSubtitle}>
                  Select a course to add to your study plan
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                activeOpacity={0.7}
                onPress={() => {
                  setShowCourses(false);
                  setSearchQuery("");
                }}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* SEARCH INPUT */}
            <View style={styles.searchBox}>
              <Icon name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search courses..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Icon name="cancel" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
                <Text style={styles.loadingText}>Fetching available catalog...</Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {filteredAvailableCourses.length > 0 ? (
                  filteredAvailableCourses.map((course, index) => (
                    <View key={index} style={styles.availableCard}>
                      <View style={styles.availableIconBox}>
                        <Icon name="school" size={22} color="#0EA5E9" />
                      </View>

                      <View style={styles.courseInfo}>
                        <Text style={styles.courseTitle}>
                          {course.course_name}
                        </Text>
                        <Text style={styles.availableSubtext}>
                          Available for enrollment
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.addBtn}
                        activeOpacity={0.8}
                        disabled={addingId === course.course_id}
                        onPress={() => addCourse(course)}
                      >
                        {addingId === course.course_id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Icon name="add" size={16} color="#FFFFFF" />
                            <Text style={styles.addBtnText}>Add</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconCircle}>
                      <Icon name="search-off" size={36} color="#94A3B8" />
                    </View>
                    <Text style={styles.emptyTitle}>No Courses Found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? `No subjects matching "${searchQuery}"`
                        : "There are no additional courses available at this time."}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentHome")}
        >
          <Icon name="calendar-today" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <View style={styles.activeNavIndicator}>
            <Icon
              name="library-add"
              size={22}
              color={colors.primary || "#4F46E5"}
            />
            <Text style={styles.navTextActive}>Add Courses</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentCourses")}
        >
          <Icon name="menu-book" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("StudentAllClasses")}
        >
          <Icon name="school" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Classes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentAddCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =====================================================
  // HEADER STYLES
  // =====================================================

  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
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
    letterSpacing: -0.3,
  },

  // =====================================================
  // CONTENT AREA
  // =====================================================

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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

  scrollContent: {
    paddingBottom: 100,
  },

  loadingState: {
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

  // =====================================================
  // COURSE CARDS (MY COURSES)
  // =====================================================

  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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

  courseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  courseInfo: {
    flex: 1,
  },

  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },

  activeTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },

  activeTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
  },

  // =====================================================
  // CATALOG COURSES VIEW
  // =====================================================

  catalogContainer: {
    flex: 1,
  },

  catalogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
  },

  availableCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  availableIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  availableSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary || "#4F46E5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    justifyContent: "center",
  },

  addBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 2,
  },

  // =====================================================
  // EMPTY STATES & FLOATING BUTTON
  // =====================================================

  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  floatingBtn: {
    position: "absolute",
    right: 20,
    bottom: 80,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary || "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary || "#4F46E5",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  floatingBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },

  // =====================================================
  // BOTTOM NAVIGATION
  // =====================================================

  bottomNav: {
    flexDirection: "row",
    justifycontent: "space-around",
    alignItems: "center",
    height: 64,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  activeNavIndicator: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 3,
  },

  navTextActive: {
    fontSize: 11,
    color: colors.primary || "#4F46E5",
    fontWeight: "700",
    marginTop: 3,
  },
});
