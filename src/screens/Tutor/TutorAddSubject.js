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
  Modal,
  TextInput,
  StatusBar,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TutorAddSubject = ({ navigation }) => {
  const [myCourses, setMyCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);

  const [gradeModalVisible, setGradeModalVisible] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState(null);

  const [grade, setGrade] = useState("");
  const [institute, setInstitute] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  // Admin minimum and maximum rate
  const [minRate, setMinRate] = useState(null);
  const [maxRate, setMaxRate] = useState(null);

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // =========================================================
  // GET MY COURSES
  // =========================================================
  const fetchMyCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Tutor/my-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setMyCourses(Array.isArray(data) ? data : []);
      } else {
        console.log("My Courses Error:", data);
      }
    } catch (e) {
      console.log("Fetch My Courses Error:", e);
    }
  };

  // =========================================================
  // GET ALL COURSES
  // =========================================================
  const fetchAllCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Tutor/all-courses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setAvailableCourses(Array.isArray(data) ? data : []);
        setShowCourses(true);
      } else {
        console.log("All Courses Error:", data);

        Alert.alert(
          "Error",
          data.message || "Unable to load available courses."
        );
      }
    } catch (e) {
      console.log("Fetch All Courses Error:", e);

      Alert.alert(
        "Error",
        "Unable to connect to the server."
      );
    }
  };

  // =========================================================
  // OPEN GRADE / INSTITUTE / RATE DIALOG
  // =========================================================
  const openGradeDialog = (course) => {
    setSelectedCourse(course);

    setGrade("");
    setInstitute("");
    setHourlyRate("");

    // ---------------------------------------------------------
    // Get Admin Min / Max Rate if available from API
    // ---------------------------------------------------------
    const courseMinRate =
      course?.adminSetMinHourlyRate ??
      course?.admin_set_min_hourly_rate ??
      course?.minRate ??
      course?.min_rate ??
      null;

    const courseMaxRate =
      course?.adminSetMaxHourlyRate ??
      course?.admin_set_max_hourly_rate ??
      course?.maxRate ??
      course?.max_rate ??
      null;

    setMinRate(
      courseMinRate !== null
        ? Number(courseMinRate)
        : null
    );

    setMaxRate(
      courseMaxRate !== null
        ? Number(courseMaxRate)
        : null
    );

    setGradeModalVisible(true);
  };

  // =========================================================
  // ADD COURSE
  // =========================================================
  const addCourse = async () => {
    if (!selectedCourse) {
      Alert.alert("Error", "Please select a course.");
      return;
    }

    // ---------------------------------------------------------
    // Grade
    // ---------------------------------------------------------
    const enteredGrade = grade.trim().toUpperCase();

    if (!["A", "B", "C", "D", "F"].includes(enteredGrade)) {
      Alert.alert(
        "Invalid Grade",
        "Please enter A, B, C, D or F."
      );
      return;
    }

    // ---------------------------------------------------------
    // Institute
    // Backend requires Institute
    // ---------------------------------------------------------
    const enteredInstitute = institute.trim();

    if (!enteredInstitute) {
      Alert.alert(
        "Institute Required",
        "Please enter the institute from which you learned this course."
      );
      return;
    }

    if (enteredInstitute.length > 150) {
      Alert.alert(
        "Invalid Institute",
        "Institute name cannot be more than 150 characters."
      );
      return;
    }

    // ---------------------------------------------------------
    // Hourly Rate
    // ---------------------------------------------------------
    const rate = parseFloat(hourlyRate);

    if (isNaN(rate) || rate <= 0) {
      Alert.alert(
        "Invalid Hourly Rate",
        "Please enter a valid hourly rate."
      );
      return;
    }

    // ---------------------------------------------------------
    // Local Min / Max validation
    // This is an extra frontend check.
    // Backend also validates this.
    // ---------------------------------------------------------
    if (
      minRate !== null &&
      maxRate !== null &&
      (rate < minRate || rate > maxRate)
    ) {
      Alert.alert(
        "Invalid Hourly Rate",
        `You can set hourly rate between Rs. ${minRate} and Rs. ${maxRate} for ${selectedCourse.course_name}.`
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      // -------------------------------------------------------
      // Exact backend request structure
      // -------------------------------------------------------
      const requestBody = {
        courses: [
          {
            courseId: selectedCourse.course_id,
            grade: enteredGrade,
            institute: enteredInstitute,
            hourlyRate: rate,
          },
        ],
      };

      console.log(
        "Add Course Request:",
        JSON.stringify(requestBody, null, 2)
      );

      const res = await fetch(`${BASE_URL}/Tutor/add-courses`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      console.log("Add Course Response:", data);

      if (res.ok) {
        Alert.alert(
          "Success",
          `${selectedCourse.course_name} added successfully.`
        );

        // Close modal
        setGradeModalVisible(false);

        // Clear fields
        setSelectedCourse(null);
        setGrade("");
        setInstitute("");
        setHourlyRate("");
        setMinRate(null);
        setMaxRate(null);

        // Refresh courses
        await fetchMyCourses();

        // Refresh available courses
        await fetchAllCourses();
      } else {
        // -----------------------------------------------------
        // Backend hourly rate validation
        // -----------------------------------------------------
        if (
          data?.minRate !== undefined &&
          data?.maxRate !== undefined
        ) {
          Alert.alert(
            "Invalid Hourly Rate",
            data.message ||
              `You can set hourly rate between Rs. ${data.minRate} and Rs. ${data.maxRate}.`
          );
        } else {
          Alert.alert(
            "Error",
            data.message || "Unable to add course."
          );
        }
      }
    } catch (e) {
      console.log("Add Course Error:", e);

      Alert.alert(
        "Error",
        "Something went wrong while adding the course."
      );
    }
  };

  // =========================================================
  // GET GRADE COLOR
  // =========================================================
  const getGradeColor = (g) => {
    switch (g) {
      case "A":
        return "#10B981";

      case "B":
        return "#3B82F6";

      case "C":
        return "#F59E0B";

      case "D":
        return "#EF4444";

      default:
        return "#64748B";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      {/* =====================================================
          HEADER
      ====================================================== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("TutorDrawer")}
        >
          <Icon
            name="menu"
            size={22}
            color={colors.primary || "#4F46E5"}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <View style={styles.content}>
        {!showCourses ? (
          <>
            {/* MY COURSES HEADER */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  My Courses
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Subjects you are currently offering
                </Text>
              </View>

              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {myCourses.length}
                </Text>
              </View>
            </View>

            {/* MY COURSES */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}
            >
              {myCourses.length > 0 ? (
                myCourses.map((course, index) => (
                  <View
                    key={index}
                    style={styles.courseCard}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.courseIconBox}>
                        <Icon
                          name="menu-book"
                          size={20}
                          color={
                            colors.primary || "#4F46E5"
                          }
                        />
                      </View>

                      <View style={styles.courseInfo}>
                        <Text
                          style={styles.courseName}
                          numberOfLines={1}
                        >
                          {course.course_name ||
                            course.courseTitle ||
                            "Course"}
                        </Text>

                        {/* INSTITUTE */}
                        <View style={styles.detailRow}>
                          <Icon
                            name="account-balance"
                            size={14}
                            color="#64748B"
                          />

                          <Text
                            style={styles.detailText}
                            numberOfLines={1}
                          >
                            {course.institute ||
                              "Institute not available"}
                          </Text>
                        </View>

                        {/* RATE */}
                        <View style={styles.rateRow}>
                          <Icon
                            name="payments"
                            size={14}
                            color="#10B981"
                          />

                          <Text style={styles.rateText}>
                            Rs.{" "}
                            {course.hourly_rate ??
                              course.hourlyRate ??
                              0}

                            <Text style={styles.rateUnit}>
                              {" "}
                              / hour
                            </Text>
                          </Text>
                        </View>
                      </View>

                      {/* GRADE */}
                      <View
                        style={[
                          styles.gradeBadge,
                          {
                            backgroundColor: `${getGradeColor(
                              course.grade
                            )}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.gradeText,
                            {
                              color: getGradeColor(
                                course.grade
                              ),
                            },
                          ]}
                        >
                          Grade {course.grade}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Icon
                      name="auto-stories"
                      size={40}
                      color="#94A3B8"
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    No Courses Added Yet
                  </Text>

                  <Text style={styles.emptySubtext}>
                    Tap the floating button below to
                    explore available subjects and add
                    them to your tutor profile.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* FLOATING ADD BUTTON */}
            <TouchableOpacity
              style={styles.floatingBtn}
              activeOpacity={0.85}
              onPress={fetchAllCourses}
            >
              <Icon
                name="add"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* AVAILABLE COURSES HEADER */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Available Courses
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Select a subject to configure grade,
                  institute & rate
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                activeOpacity={0.7}
                onPress={() => setShowCourses(false)}
              >
                <Icon
                  name="close"
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* AVAILABLE COURSES */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollList}
            >
              {availableCourses.length > 0 ? (
                availableCourses.map((course, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.availableCard}
                    activeOpacity={0.7}
                    onPress={() =>
                      openGradeDialog(course)
                    }
                  >
                    <View style={styles.availableLeft}>
                      <View
                        style={styles.availableIconBox}
                      >
                        <Icon
                          name="add-task"
                          size={20}
                          color={
                            colors.primary || "#4F46E5"
                          }
                        />
                      </View>

                      <Text
                        style={styles.availableName}
                        numberOfLines={2}
                      >
                        {course.course_name ||
                          course.courseTitle ||
                          "Course"}
                      </Text>
                    </View>

                    <Icon
                      name="chevron-right"
                      size={22}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Icon
                      name="check-circle-outline"
                      size={40}
                      color="#10B981"
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    All Caught Up
                  </Text>

                  <Text style={styles.emptySubtext}>
                    No additional courses are currently
                    available to add.
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>

      {/* =====================================================
          ADD COURSE MODAL
      ====================================================== */}
      <Modal
        visible={gradeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setGradeModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* MODAL HEADER */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add Subject Details
                </Text>

                <Text
                  style={styles.modalCourseName}
                  numberOfLines={1}
                >
                  {selectedCourse?.course_name ||
                    selectedCourse?.courseTitle}
                </Text>
              </View>

              {/* =================================================
                  GRADE
              ================================================== */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Grade Achieved
                </Text>

                <View style={styles.inputWrapper}>
                  <Icon
                    name="workspace-premium"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. A, B, C, D, F"
                    placeholderTextColor="#94A3B8"
                    value={grade}
                    maxLength={1}
                    autoCapitalize="characters"
                    onChangeText={setGrade}
                  />
                </View>
              </View>

              {/* =================================================
                  INSTITUTE
              ================================================== */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Institute
                </Text>

                <View style={styles.inputWrapper}>
                  <Icon
                    name="account-balance"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. BIIT University"
                    placeholderTextColor="#94A3B8"
                    value={institute}
                    maxLength={150}
                    onChangeText={setInstitute}
                    autoCapitalize="words"
                  />
                </View>

                <Text style={styles.helperText}>
                  Enter the institute from which you learned
                  this course.
                </Text>
              </View>

              {/* =================================================
                  HOURLY RATE
              ================================================== */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Hourly Rate (PKR)
                </Text>

                <View style={styles.inputWrapper}>
                  <Icon
                    name="payments"
                    size={20}
                    color="#64748B"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 1500"
                    placeholderTextColor="#94A3B8"
                    keyboardType="decimal-pad"
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                  />
                </View>

                {/* ADMIN RATE RANGE */}
                {minRate !== null &&
                  maxRate !== null && (
                    <View style={styles.rateRangeBox}>
                      <Icon
                        name="info-outline"
                        size={16}
                        color="#64748B"
                      />

                      <Text
                        style={styles.rateRangeText}
                      >
                        Allowed rate: Rs. {minRate} - Rs.{" "}
                        {maxRate} / hour
                      </Text>
                    </View>
                  )}
              </View>

              {/* =================================================
                  BUTTONS
              ================================================== */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    setGradeModalVisible(false)
                  }
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveBtn}
                  activeOpacity={0.8}
                  onPress={addCourse}
                >
                  <Text style={styles.saveText}>
                    Save Course
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          BOTTOM NAVIGATION
      ====================================================== */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("TutorHome")
          }
        >
          <Icon
            name="calendar-month"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.inactiveTab}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "TutorStudentRequest"
            )
          }
        >
          <Icon
            name="description"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.inactiveTab}>
            Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "TutorTodayClasses"
            )
          }
        >
          <Icon
            name="school"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.inactiveTab}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
        >
          <Icon
            name="add-box"
            size={22}
            color={
              colors.primary || "#4F46E5"
            }
          />

          <Text style={styles.activeTab}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TutorAddSubject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =========================================================
  // HEADER
  // =========================================================

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
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },

      android: {
        elevation: 2,
      },
    }),
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
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
    marginRight: 8,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.3,
  },

  // =========================================================
  // CONTENT
  // =========================================================

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  countBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollList: {
    paddingBottom: 100,
  },

  // =========================================================
  // MY COURSE CARD
  // =========================================================

  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },

      android: {
        elevation: 1,
      },
    }),
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  courseIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  courseInfo: {
    flex: 1,
  },

  courseName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },

  // =========================================================
  // INSTITUTE / DETAILS
  // =========================================================

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  detailText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 5,
    flex: 1,
  },

  rateRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rateText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 4,
  },

  rateUnit: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },

  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },

  gradeText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // =========================================================
  // AVAILABLE COURSE
  // =========================================================

  availableCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  availableLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  availableIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  availableName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },

  // =========================================================
  // EMPTY
  // =========================================================

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
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  emptySubtext: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },

  // =========================================================
  // FLOATING BUTTON
  // =========================================================

  floatingBtn: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor:
      colors.primary || "#4F46E5",
    justifyContent: "center",
    alignItems: "center",

    ...Platform.select({
      ios: {
        shadowColor:
          colors.primary || "#4F46E5",
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },

      android: {
        elevation: 6,
      },
    }),
  },

  // =========================================================
  // MODAL
  // =========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },

      android: {
        elevation: 8,
      },
    }),
  },

  modalHeader: {
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  modalCourseName: {
    fontSize: 14,
    color: colors.primary || "#4F46E5",
    fontWeight: "600",
    marginTop: 2,
  },

  // =========================================================
  // INPUTS
  // =========================================================

  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },

  inputIcon: {
    marginRight: 8,
  },

  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#0F172A",
    fontWeight: "600",
  },

  helperText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 5,
  },

  // =========================================================
  // RATE RANGE
  // =========================================================

  rateRangeBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 7,
  },

  rateRangeText: {
    fontSize: 11,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "500",
  },

  // =========================================================
  // MODAL BUTTONS
  // =========================================================

  modalButtons: {
    flexDirection: "row",
    marginTop: 8,
  },

  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor:
      colors.primary || "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  saveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // =========================================================
  // BOTTOM NAV
  // =========================================================

  bottomNav: {
    flexDirection: "row",
    height: 60,
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
    justifyContent: "center",
    alignItems: "center",
  },

  inactiveTab: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
  },

  activeTab: {
    fontSize: 11,
    fontWeight: "700",
    color:
      colors.primary || "#4F46E5",
    marginTop: 2,
  },
});
