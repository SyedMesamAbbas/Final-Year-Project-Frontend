import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  Linking,
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const RATING_LABELS = {
  1: "Needs Improvement",
  2: "Fair",
  3: "Good",
  4: "Great",
  5: "Excellent!",
};

const MyStudentsScreen = ({ navigation }) => {
  // =====================================================
  // STUDENTS
  // =====================================================

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // FEEDBACK
  // =====================================================

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // COURSE CONTENT
  // =====================================================

  const [contentVisible, setContentVisible] = useState(false);

  const [courseContent, setCourseContent] = useState([]);

  const [selectedContentStudent, setSelectedContentStudent] =
    useState(null);

  const [contentLoading, setContentLoading] = useState(false);

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  useEffect(() => {
    loadStudents();
  }, []);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  // =====================================================
  // LOAD MY STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/Tutor/my-students`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("My Students Response:", data);

      if (response.ok) {
        setStudents(
          Array.isArray(data)
            ? data
            : []
        );
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to load students"
        );
      }
    } catch (error) {
      console.log("Load Students Error:", error);

      Alert.alert(
        "Error",
        "Network Error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // COMPLETE COURSE
  // =====================================================

  const completeCourse = async (courseId) => {
    Alert.alert(
      "Complete Course",
      "Are you sure you want to mark this course as completed?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Complete",
          style: "default",

          onPress: async () => {
            try {
              const token = await getToken();

              const response = await fetch(
                `${BASE_URL}/Tutor/complete-course`,
                {
                  method: "POST",

                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },

                  body: JSON.stringify({
                    courseId,
                  }),
                }
              );

              const data = await response.json();

              if (response.ok) {
                Alert.alert(
                  "Success",
                  "Course completed successfully"
                );

                loadStudents();
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed"
                );
              }
            } catch (error) {
              console.log(
                "Complete Course Error:",
                error
              );

              Alert.alert(
                "Error",
                "Network Error"
              );
            }
          },
        },
      ]
    );
  };

  // =====================================================
  // OPEN FEEDBACK
  // =====================================================

  const openFeedbackModal = (item) => {
    setSelectedStudent(item);

    setRating(5);

    setComment("");

    setFeedbackVisible(true);
  };

  // =====================================================
  // SUBMIT FEEDBACK
  // =====================================================

  const submitFeedback = async () => {
    if (!selectedStudent) {
      return;
    }

    try {
      setSubmitting(true);

      const token = await getToken();

      const response = await fetch(
        `${BASE_URL}/Tutor/give-feedback`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            studentId:
              selectedStudent.studentId,

            courseId:
              selectedStudent.courseId,

            rating: rating,

            comment: comment,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          "Feedback submitted successfully"
        );

        setFeedbackVisible(false);

        loadStudents();
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed"
        );
      }
    } catch (error) {
      console.log(
        "Feedback Error:",
        error
      );

      Alert.alert(
        "Error",
        "Network Error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // OPEN COURSE CONTENT
  //
  // API:
  // GET
  // /Tutor/tutor-course-content/{studentId}/{courseId}
  // =====================================================

  const openCourseContent = async (item) => {
    try {
      // -------------------------------------------------
      // Save selected student
      // -------------------------------------------------

      setSelectedContentStudent(item);

      // -------------------------------------------------
      // Remove previous content
      // -------------------------------------------------

      setCourseContent([]);

      // -------------------------------------------------
      // Open dialog
      // -------------------------------------------------

      setContentVisible(true);

      // -------------------------------------------------
      // Loading
      // -------------------------------------------------

      setContentLoading(true);

      // -------------------------------------------------
      // Token
      // -------------------------------------------------

      const token = await getToken();

      // -------------------------------------------------
      // API CALL
      // -------------------------------------------------

      const url =
        `${BASE_URL}/Tutor/tutor-course-content/` +
        `${item.studentId}/${item.courseId}`;

      console.log(
        "Course Content API:",
        url
      );

      const response = await fetch(
        url,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "Tutor Course Content Response:",
        data
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      if (response.ok) {
        setCourseContent(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } else {
        setCourseContent([]);

        Alert.alert(
          "Error",
          data.message ||
            "Failed to load course content"
        );
      }
    } catch (error) {
      console.log(
        "Course Content Error:",
        error
      );

      setCourseContent([]);

      Alert.alert(
        "Error",
        "Network Error while loading course content"
      );
    } finally {
      setContentLoading(false);
    }
  };

  // =====================================================
  // CLOSE COURSE CONTENT
  // =====================================================

  const closeCourseContent = () => {
    setContentVisible(false);

    setCourseContent([]);

    setSelectedContentStudent(null);
  };

  // =====================================================
  // CREATE CORRECT FILE URL
  //
  // IMPORTANT:
  //
  // BASE_URL may be:
  // http://192.168.137.1:5000/api
  //
  // Static files are:
  // http://192.168.137.1:5000/CourseContent/file.jpg
  //
  // So we MUST NOT create:
  // /api/CourseContent/file.jpg
  // =====================================================

  const getCorrectFileUrl = (contentItem) => {
    // -------------------------------------------------
    // FIRST PRIORITY:
    // Backend now returns file_url
    // -------------------------------------------------

    if (
      contentItem &&
      contentItem.file_url
    ) {
      return contentItem.file_url;
    }

    // -------------------------------------------------
    // SECOND PRIORITY:
    // Build URL from file_path
    // -------------------------------------------------

    let filePath =
      contentItem?.file_path;

    if (!filePath) {
      return null;
    }

    filePath = filePath
      .replace(/\\/g, "/")
      .trim();

    // -------------------------------------------------
    // If already complete URL
    // -------------------------------------------------

    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    // -------------------------------------------------
    // Remove starting slash
    // -------------------------------------------------

    filePath =
      filePath.replace(/^\/+/, "");

    // -------------------------------------------------
    // IMPORTANT:
    //
    // If BASE_URL is:
    // http://192.168.137.1:5000/api
    //
    // remove /api for static file
    // -------------------------------------------------

    let staticBaseUrl =
      BASE_URL.replace(/\/api\/?$/i, "");

    // -------------------------------------------------
    // Make sure CourseContent path exists
    // -------------------------------------------------

    if (
      filePath.toLowerCase().startsWith(
        "coursecontent/"
      )
    ) {
      return `${staticBaseUrl}/${filePath}`;
    }

    // -------------------------------------------------
    // If only filename was returned
    // -------------------------------------------------

    return `${staticBaseUrl}/CourseContent/${filePath}`;
  };

  // =====================================================
  // OPEN CONTENT FILE
  // =====================================================

  const openContentFile = async (contentItem) => {
    try {
      const fileUrl =
        getCorrectFileUrl(contentItem);

      console.log(
        "================================="
      );

      console.log(
        "FILE NAME:",
        contentItem?.file_name
      );

      console.log(
        "FILE PATH:",
        contentItem?.file_path
      );

      console.log(
        "FILE URL:",
        fileUrl
      );

      console.log(
        "================================="
      );

      if (!fileUrl) {
        Alert.alert(
          "File Not Found",
          "File URL is not available."
        );

        return;
      }

      // -------------------------------------------------
      // Check URL
      // -------------------------------------------------

      const supported =
        await Linking.canOpenURL(fileUrl);

      if (supported) {
        await Linking.openURL(fileUrl);
      } else {
        Alert.alert(
          "Cannot Open File",
          "This file cannot be opened on this device."
        );
      }
    } catch (error) {
      console.log(
        "Open File Error:",
        error
      );

      Alert.alert(
        "Error",
        "Unable to open this file."
      );
    }
  };

  // =====================================================
  // GET INITIALS
  // =====================================================

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    try {
      return new Date(
        date
      ).toLocaleDateString();
    } catch {
      return date;
    }
  };

  // =====================================================
  // RENDER COURSE CONTENT
  // =====================================================

  const renderCourseContent = ({ item }) => {
    return (
      <View style={styles.contentCard}>

        {/* ICON */}

        <View style={styles.contentIconContainer}>
          <MaterialIcons
            name="description"
            size={28}
            color="#4F46E5"
          />
        </View>

        {/* INFORMATION */}

        <View style={styles.contentInfo}>

          {/* TITLE */}

          <Text style={styles.contentTitle}>
            {item.title ||
              "Untitled Content"}
          </Text>

          {/* DESCRIPTION */}

          <Text style={styles.contentDescription}>
            {item.description ||
              "No description provided."}
          </Text>

          {/* FILE NAME */}

          {item.file_name ? (
            <View style={styles.fileRow}>

              <MaterialIcons
                name="insert-drive-file"
                size={17}
                color="#64748B"
              />

              <Text
                style={styles.fileName}
                numberOfLines={2}
              >
                {item.file_name}
              </Text>

            </View>
          ) : null}

          {/* DATE */}

          <View style={styles.dateRow}>

            <MaterialIcons
              name="calendar-today"
              size={15}
              color="#94A3B8"
            />

            <Text style={styles.dateText}>
              Uploaded:{" "}
              {formatDate(
                item.uploaded_date
              )}
            </Text>

          </View>

          {/* OPEN FILE */}

          {(item.file_url ||
            item.file_path) ? (
            <TouchableOpacity
              style={styles.openFileBtn}
              activeOpacity={0.8}
              onPress={() =>
                openContentFile(item)
              }
            >

              <MaterialIcons
                name="open-in-new"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.openFileText}>
                Open File
              </Text>

            </TouchableOpacity>
          ) : null}

        </View>
      </View>
    );
  };

  // =====================================================
  // RENDER STUDENT
  // =====================================================

  const renderStudent = ({ item }) => {
    return (
      <View style={styles.card}>

        {/* STUDENT HEADER */}

        <View style={styles.cardHeader}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>
              {getInitials(
                item.studentName
              )}
            </Text>

          </View>

          <View style={styles.studentInfo}>

            <Text
              style={styles.studentName}
              numberOfLines={1}
            >
              {item.studentName}
            </Text>

            <View style={styles.courseTag}>

              <MaterialIcons
                name="book"
                size={14}
                color="#64748B"
              />

              <Text
                style={styles.courseName}
                numberOfLines={1}
              >
                {item.courseName}
              </Text>

            </View>

          </View>

        </View>

        <View style={styles.divider} />

        {/* VIEW COURSE CONTENT */}

        <TouchableOpacity
          style={styles.contentBtn}
          activeOpacity={0.8}
          onPress={() =>
            openCourseContent(item)
          }
        >

          <MaterialIcons
            name="folder-open"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.btnText}>
            View Course Content
          </Text>

        </TouchableOpacity>

        {/* COURSE STATUS */}

        {item.isCompleted ? (

          <View style={styles.actionContainer}>

            <View style={styles.completedBadge}>

              <MaterialIcons
                name="check-circle"
                size={16}
                color="#15803D"
              />

              <Text style={styles.completedText}>
                Course Completed
              </Text>

            </View>

            {!item.feedbackGiven && (
              <TouchableOpacity
                style={styles.feedbackBtn}
                activeOpacity={0.8}
                onPress={() =>
                  openFeedbackModal(item)
                }
              >

                <MaterialIcons
                  name="rate-review"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.btnText}>
                  Give Feedback
                </Text>

              </TouchableOpacity>
            )}

            {item.feedbackGiven && (
              <View style={styles.feedbackDone}>

                <MaterialIcons
                  name="stars"
                  size={16}
                  color="#0369A1"
                />

                <Text style={styles.feedbackDoneText}>
                  Feedback Submitted
                </Text>

              </View>
            )}

          </View>

        ) : (

          <TouchableOpacity
            style={styles.completeBtn}
            activeOpacity={0.8}
            onPress={() =>
              completeCourse(
                item.courseId
              )
            }
          >

            <MaterialIcons
              name="task-alt"
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.btnText}>
              Mark as Completed
            </Text>

          </TouchableOpacity>
        )}

      </View>
    );
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        backgroundColor="#FFFFFF"
        barStyle="dark-content"
      />

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            navigation.goBack()
          }
          activeOpacity={0.7}
        >

          <MaterialIcons
            name="arrow-back-ios"
            size={20}
            color="#1E293B"
          />

        </TouchableOpacity>

        <Image
          source={require(
            "../../../assets/images/logo.png"
          )}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 40 }} />

      </View>

      {/* CONTENT */}

      <View style={styles.content}>

        <View style={styles.titleSection}>

          <Text style={styles.title}>
            My Students
          </Text>

          {!loading && (
            <View style={styles.countBadge}>

              <Text style={styles.countText}>
                {students.length}
              </Text>

            </View>
          )}

        </View>

        {loading ? (

          <View style={styles.loaderContainer}>

            <ActivityIndicator
              size="large"
              color="#4F46E5"
            />

            <Text style={styles.loadingText}>
              Fetching student list...
            </Text>

          </View>

        ) : (

          <FlatList
            data={students}

            keyExtractor={(item, index) =>
              `${item.studentId}-${item.courseId}-${index}`
            }

            renderItem={renderStudent}

            showsVerticalScrollIndicator={false}

            contentContainerStyle={
              styles.listContainer
            }

            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>

                <View style={styles.emptyIconBg}>

                  <MaterialIcons
                    name="people-outline"
                    size={48}
                    color="#94A3B8"
                  />

                </View>

                <Text style={styles.emptyTitle}>
                  No Students Assigned
                </Text>

                <Text style={styles.emptySubtext}>
                  When students enroll in your
                  courses, they will appear here.
                </Text>

              </View>
            )}
          />
        )}

      </View>

      {/* =====================================================
          COURSE CONTENT MODAL
          ===================================================== */}

      <Modal
        visible={contentVisible}
        transparent
        animationType="fade"
        onRequestClose={
          closeCourseContent
        }
      >

        <View style={styles.modalOverlay}>

          <View
            style={styles.contentModalCard}
          >

            {/* HEADER */}

            <View style={styles.modalHeader}>

              <View style={{ flex: 1 }}>

                <Text style={styles.modalTitle}>
                  Course Content
                </Text>

                {selectedContentStudent && (
                  <Text style={styles.modalSubTitle}>
                    {
                      selectedContentStudent.studentName
                    }
                  </Text>
                )}

              </View>

              <TouchableOpacity
                onPress={
                  closeCourseContent
                }
                style={styles.closeBtn}
              >

                <MaterialIcons
                  name="close"
                  size={22}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>

            {/* COURSE INFORMATION */}

            {selectedContentStudent && (
              <View
                style={
                  styles.targetStudentCard
                }
              >

                <View
                  style={styles.courseInfoRow}
                >

                  <MaterialIcons
                    name="book"
                    size={20}
                    color="#4F46E5"
                  />

                  <View
                    style={{
                      flex: 1,
                      marginLeft: 8,
                    }}
                  >

                    <Text
                      style={
                        styles.courseInfoLabel
                      }
                    >
                      Course
                    </Text>

                    <Text
                      style={
                        styles.courseInfoName
                      }
                    >
                      {
                        selectedContentStudent.courseName
                      }
                    </Text>

                  </View>

                </View>

              </View>
            )}

            {/* LOADING */}

            {contentLoading ? (

              <View
                style={styles.contentLoader}
              >

                <ActivityIndicator
                  size="large"
                  color="#4F46E5"
                />

                <Text
                  style={
                    styles.contentLoadingText
                  }
                >
                  Loading course content...
                </Text>

              </View>

            ) : courseContent.length ===
              0 ? (

              /* NO CONTENT */

              <View
                style={
                  styles.noContentContainer
                }
              >

                <View
                  style={
                    styles.noContentIcon
                  }
                >

                  <MaterialIcons
                    name="folder-off"
                    size={42}
                    color="#94A3B8"
                  />

                </View>

                <Text
                  style={
                    styles.noContentTitle
                  }
                >
                  No Course Content
                </Text>

                <Text
                  style={
                    styles.noContentText
                  }
                >
                  This student has not uploaded
                  any course content yet.
                </Text>

              </View>

            ) : (

              /* CONTENT LIST */

              <FlatList
                data={courseContent}
                keyExtractor={(
                  item,
                  index
                ) =>
                  item.content_id
                    ? item.content_id.toString()
                    : index.toString()
                }
                renderItem={
                  renderCourseContent
                }
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={{
                  paddingBottom: 10,
                }}
              />

            )}

            {/* CLOSE */}

            <TouchableOpacity
              style={styles.closeModalBtn}
              activeOpacity={0.8}
              onPress={
                closeCourseContent
              }
            >

              <Text
                style={styles.closeModalText}
              >
                Close
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

      {/* =====================================================
          FEEDBACK MODAL
          ===================================================== */}

      <Modal
        visible={feedbackVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setFeedbackVisible(false)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                Student Feedback
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setFeedbackVisible(false)
                }
                style={styles.closeBtn}
              >

                <MaterialIcons
                  name="close"
                  size={22}
                  color="#64748B"
                />

              </TouchableOpacity>

            </View>

            {selectedStudent && (
              <View
                style={
                  styles.targetStudentCard
                }
              >

                <Text
                  style={
                    styles.targetStudentName
                  }
                >
                  {
                    selectedStudent.studentName
                  }
                </Text>

                <Text
                  style={
                    styles.targetStudentCourse
                  }
                >
                  {
                    selectedStudent.courseName
                  }
                </Text>

              </View>
            )}

            <Text
              style={styles.inputLabel}
            >
              Rating Score
            </Text>

            <View
              style={styles.ratingSection}
            >

              <View
                style={
                  styles.ratingContainer
                }
              >

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.7}
                      onPress={() =>
                        setRating(star)
                      }
                      style={
                        styles.starTouch
                      }
                    >

                      <MaterialIcons
                        name={
                          star <= rating
                            ? "star"
                            : "star-outline"
                        }
                        size={36}
                        color={
                          star <= rating
                            ? "#F59E0B"
                            : "#CBD5E1"
                        }
                      />

                    </TouchableOpacity>
                  )
                )}

              </View>

              <Text
                style={styles.ratingLabel}
              >
                {RATING_LABELS[rating]}
              </Text>

            </View>

            <Text
              style={styles.inputLabel}
            >
              Feedback Comments
            </Text>

            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Share performance insights, progress notes, or recommendations..."
              placeholderTextColor="#94A3B8"
              value={comment}
              onChangeText={setComment}
            />

            <View
              style={styles.modalButtons}
            >

              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={() =>
                  setFeedbackVisible(false)
                }
              >

                <Text
                  style={styles.cancelText}
                >
                  Cancel
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.8}
                onPress={submitFeedback}
                disabled={submitting}
              >

                {submitting ? (

                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />

                ) : (

                  <Text
                    style={
                      styles.submitText
                    }
                  >
                    Submit Feedback
                  </Text>

                )}

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </SafeAreaView>
  );
};

export default MyStudentsScreen;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 64,
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

  logo: {
    width: 120,
    height: 36,
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  countBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },

  countText: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 13,
  },

  listContainer: {
    paddingBottom: 24,
  },

  card: {
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
          height: 4,
        },
        shadowOpacity: 0.03,
        shadowRadius: 10,
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

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
  },

  studentInfo: {
    marginLeft: 12,
    flex: 1,
  },

  studentName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0F172A",
  },

  courseTag: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  courseName: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "400",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  actionContainer: {
    gap: 10,
  },

  // ===================================================
  // VIEW CONTENT BUTTON
  // CHANGE COLOR HERE
  // ===================================================

  contentBtn: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  completeBtn: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },

  feedbackBtn: {
    backgroundColor: "#4F46E5",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },

  btnText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 14,
  },

  completedBadge: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  completedText: {
    color: "#15803D",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  feedbackDone: {
    backgroundColor: "#F0F9FF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },

  feedbackDoneText: {
    color: "#0369A1",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },

  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },

  emptySubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },

  // =====================================================
  // MODAL
  // =====================================================

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor:
      "rgba(15, 23, 42, 0.5)",
    padding: 20,
  },

  contentModalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    maxHeight: "85%",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
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

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  modalSubTitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  closeBtn: {
    padding: 4,
  },

  targetStudentCard: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#4F46E5",
  },

  targetStudentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },

  targetStudentCourse: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  courseInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  courseInfoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  courseInfoName: {
    fontSize: 15,
    color: "#1E293B",
    fontWeight: "600",
    marginTop: 2,
  },

  // =====================================================
  // CONTENT CARD
  // =====================================================

  contentCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
  },

  contentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contentInfo: {
    flex: 1,
  },

  contentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 5,
  },

  contentDescription: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 8,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
  },

  fileName: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12,
    color: "#475569",
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  dateText: {
    marginLeft: 6,
    fontSize: 11,
    color: "#94A3B8",
  },

  // =====================================================
  // OPEN FILE
  // =====================================================

  openFileBtn: {
    backgroundColor: "#0EA5E9",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 2,
  },

  openFileText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },

  // =====================================================
  // CONTENT LOADING
  // =====================================================

  contentLoader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  contentLoadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 14,
  },

  // =====================================================
  // NO CONTENT
  // =====================================================

  noContentContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 35,
    paddingHorizontal: 15,
  },

  noContentIcon: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  noContentTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
  },

  noContentText: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 19,
  },

  closeModalBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  closeModalText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },

  // =====================================================
  // FEEDBACK
  // =====================================================

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  ratingSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },

  starTouch: {
    padding: 4,
  },

  ratingLabel: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#F59E0B",
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    height: 110,
    textAlignVertical: "top",
    padding: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  submitBtn: {
    flex: 1.5,
    backgroundColor: "#4F46E5",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },

  submitText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
















































// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   Modal,
//   TextInput,
//   Image,
//   SafeAreaView,
//   StatusBar,
//   Platform,
// } from "react-native";
// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const RATING_LABELS = {
//   1: "Needs Improvement",
//   2: "Fair",
//   3: "Good",
//   4: "Great",
//   5: "Excellent!",
// };

// const MyStudentsScreen = ({ navigation }) => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [feedbackVisible, setFeedbackVisible] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const [rating, setRating] = useState(5);
//   const [comment, setComment] = useState("");

//   const [submitting, setSubmitting] = useState(false);

//   useEffect(() => {
//     loadStudents();
//   }, []);

//   const getToken = async () => {
//     return await AsyncStorage.getItem("token");
//   };

//   const loadStudents = async () => {
//     try {
//       setLoading(true);
//       const token = await getToken();

//       const response = await fetch(`${BASE_URL}/Tutor/my-students`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setStudents(data);
//       } else {
//         Alert.alert("Error", data.message || "Failed to load students");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Network Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const completeCourse = async (courseId) => {
//     Alert.alert(
//       "Complete Course",
//       "Are you sure you want to mark this course as completed?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Complete",
//           style: "default",
//           onPress: async () => {
//             try {
//               const token = await getToken();

//               const response = await fetch(
//                 `${BASE_URL}/Tutor/complete-course`,
//                 {
//                   method: "POST",
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                   },
//                   body: JSON.stringify({
//                     courseId,
//                   }),
//                 }
//               );

//               const data = await response.json();

//               if (response.ok) {
//                 Alert.alert(
//                   "Success",
//                   "Course completed successfully"
//                 );
//                 loadStudents();
//               } else {
//                 Alert.alert(
//                   "Error",
//                   data.message || "Failed"
//                 );
//               }
//             } catch (error) {
//               console.log(error);
//               Alert.alert("Error", "Network Error");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const openFeedbackModal = (item) => {
//     setSelectedStudent(item);
//     setRating(5);
//     setComment("");
//     setFeedbackVisible(true);
//   };

//   const submitFeedback = async () => {
//     if (!selectedStudent) return;

//     try {
//       setSubmitting(true);
//       const token = await getToken();

//       const response = await fetch(`${BASE_URL}/Tutor/give-feedback`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           studentId: selectedStudent.studentId,
//           courseId: selectedStudent.courseId,
//           rating: rating,
//           comment: comment,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert(
//           "Success",
//           "Feedback submitted successfully"
//         );
//         setFeedbackVisible(false);
//         loadStudents();
//       } else {
//         Alert.alert(
//           "Error",
//           data.message || "Failed"
//         );
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Network Error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const getInitials = (name = "") => {
//     return name
//       .split(" ")
//       .map((n) => n[0])
//       .join("")
//       .substring(0, 2)
//       .toUpperCase();
//   };

//   const renderStudent = ({ item }) => {
//     return (
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {getInitials(item.studentName)}
//             </Text>
//           </View>
//           <View style={styles.studentInfo}>
//             <Text style={styles.studentName} numberOfLines={1}>
//               {item.studentName}
//             </Text>
//             <View style={styles.courseTag}>
//               <MaterialIcons name="book" size={14} color="#64748B" />
//               <Text style={styles.courseName} numberOfLines={1}>
//                 {item.courseName}
//               </Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.divider} />

//         {item.isCompleted ? (
//           <View style={styles.actionContainer}>
//             <View style={styles.completedBadge}>
//               <MaterialIcons name="check-circle" size={16} color="#15803D" />
//               <Text style={styles.completedText}>Course Completed</Text>
//             </View>

//             {!item.feedbackGiven && (
//               <TouchableOpacity
//                 style={styles.feedbackBtn}
//                 activeOpacity={0.8}
//                 onPress={() => openFeedbackModal(item)}
//               >
//                 <MaterialIcons name="rate-review" size={18} color="#FFFFFF" />
//                 <Text style={styles.btnText}>Give Feedback</Text>
//               </TouchableOpacity>
//             )}

//             {item.feedbackGiven && (
//               <View style={styles.feedbackDone}>
//                 <MaterialIcons name="stars" size={16} color="#0369A1" />
//                 <Text style={styles.feedbackDoneText}>
//                   Feedback Submitted
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={styles.completeBtn}
//             activeOpacity={0.8}
//             onPress={() => completeCourse(item.courseId)}
//           >
//             <MaterialIcons name="task-alt" size={18} color="#FFFFFF" />
//             <Text style={styles.btnText}>Mark as Completed</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

//       {/* Modern App Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.iconBtn}
//           onPress={() => navigation.goBack()}
//           activeOpacity={0.7}
//         >
//           <MaterialIcons name="arrow-back-ios" size={20} color="#1E293B" />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 40 }} />
//       </View>

//       {/* Content Area */}
//       <View style={styles.content}>
//         <View style={styles.titleSection}>
//           <Text style={styles.title}>My Students</Text>
//           {!loading && (
//             <View style={styles.countBadge}>
//               <Text style={styles.countText}>{students.length}</Text>
//             </View>
//           )}
//         </View>

//         {loading ? (
//           <View style={styles.loaderContainer}>
//             <ActivityIndicator size="large" color="#4F46E5" />
//             <Text style={styles.loadingText}>Fetching student list...</Text>
//           </View>
//         ) : (
//           <FlatList
//             data={students}
//             keyExtractor={(item, index) =>
//               item.studentId ? item.studentId.toString() : index.toString()
//             }
//             renderItem={renderStudent}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={styles.listContainer}
//             ListEmptyComponent={() => (
//               <View style={styles.emptyContainer}>
//                 <View style={styles.emptyIconBg}>
//                   <MaterialIcons name="people-outline" size={48} color="#94A3B8" />
//                 </View>
//                 <Text style={styles.emptyTitle}>No Students Assigned</Text>
//                 <Text style={styles.emptySubtext}>
//                   When students enroll in your courses, they will appear here.
//                 </Text>
//               </View>
//             )}
//           />
//         )}
//       </View>

//       {/* Styled Feedback Modal */}
//       <Modal
//         visible={feedbackVisible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setFeedbackVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Student Feedback</Text>
//               <TouchableOpacity
//                 onPress={() => setFeedbackVisible(false)}
//                 style={styles.closeBtn}
//               >
//                 <MaterialIcons name="close" size={22} color="#64748B" />
//               </TouchableOpacity>
//             </View>

//             {selectedStudent && (
//               <View style={styles.targetStudentCard}>
//                 <Text style={styles.targetStudentName}>
//                   {selectedStudent.studentName}
//                 </Text>
//                 <Text style={styles.targetStudentCourse}>
//                   {selectedStudent.courseName}
//                 </Text>
//               </View>
//             )}

//             <Text style={styles.inputLabel}>Rating Score</Text>
//             <View style={styles.ratingSection}>
//               <View style={styles.ratingContainer}>
//                 {[1, 2, 3, 4, 5].map((star) => (
//                   <TouchableOpacity
//                     key={star}
//                     activeOpacity={0.7}
//                     onPress={() => setRating(star)}
//                     style={styles.starTouch}
//                   >
//                     <MaterialIcons
//                       name={star <= rating ? "star" : "star-outline"}
//                       size={36}
//                       color={star <= rating ? "#F59E0B" : "#CBD5E1"}
//                     />
//                   </TouchableOpacity>
//                 ))}
//               </View>
//               <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
//             </View>

//             <Text style={styles.inputLabel}>Feedback Comments</Text>
//             <TextInput
//               style={styles.input}
//               multiline
//               numberOfLines={4}
//               placeholder="Share performance insights, progress notes, or recommendations..."
//               placeholderTextColor="#94A3B8"
//               value={comment}
//               onChangeText={setComment}
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 activeOpacity={0.7}
//                 onPress={() => setFeedbackVisible(false)}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.submitBtn}
//                 activeOpacity={0.8}
//                 onPress={submitFeedback}
//                 disabled={submitting}
//               >
//                 {submitting ? (
//                   <ActivityIndicator color="#FFFFFF" size="small" />
//                 ) : (
//                   <Text style={styles.submitText}>Submit Feedback</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default MyStudentsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },
//   header: {
//     height: 64,
//     backgroundColor: "#FFFFFF",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#0F172A",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.04,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 2,
//       },
//     }),
//   },
//   iconBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 10,
//     backgroundColor: "#F1F5F9",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   logo: {
//     width: 120,
//     height: 36,
//   },
//   content: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },
//   titleSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#0F172A",
//     letterSpacing: -0.5,
//   },
//   countBadge: {
//     backgroundColor: "#EEF2FF",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   countText: {
//     color: "#4F46E5",
//     fontWeight: "700",
//     fontSize: 13,
//   },
//   listContainer: {
//     paddingBottom: 24,
//   },
//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#0F172A",
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.03,
//         shadowRadius: 10,
//       },
//       android: {
//         elevation: 1,
//       },
//     }),
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "#EEF2FF",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#C7D2FE",
//   },
//   avatarText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#4F46E5",
//   },
//   studentInfo: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   studentName: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#0F172A",
//   },
//   courseTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },
//   courseName: {
//     fontSize: 14,
//     color: "#64748B",
//     marginLeft: 6,
//     fontWeight: "400",
//   },
//   divider: {
//     height: 1,
//     backgroundColor: "#F1F5F9",
//     marginVertical: 14,
//   },
//   actionContainer: {
//     gap: 10,
//   },
//   completeBtn: {
//     backgroundColor: "#10B981",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   feedbackBtn: {
//     backgroundColor: "#4F46E5",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   btnText: {
//     color: "#FFFFFF",
//     marginLeft: 8,
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   completedBadge: {
//     backgroundColor: "#DCFCE7",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   completedText: {
//     color: "#15803D",
//     fontWeight: "600",
//     fontSize: 13,
//     marginLeft: 6,
//   },
//   feedbackDone: {
//     backgroundColor: "#F0F9FF",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#BAE6FD",
//   },
//   feedbackDoneText: {
//     color: "#0369A1",
//     fontWeight: "600",
//     fontSize: 13,
//     marginLeft: 6,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     marginTop: 60,
//   },
//   loadingText: {
//     marginTop: 12,
//     color: "#64748B",
//     fontSize: 14,
//   },
//   emptyContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 60,
//     paddingHorizontal: 20,
//   },
//   emptyIconBg: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#F1F5F9",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#334155",
//     marginBottom: 6,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#94A3B8",
//     textAlign: "center",
//     lineHeight: 20,
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(15, 23, 42, 0.5)",
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     padding: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 10 },
//         shadowOpacity: 0.15,
//         shadowRadius: 20,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   closeBtn: {
//     padding: 4,
//   },
//   targetStudentCard: {
//     backgroundColor: "#F8FAFC",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 16,
//     borderLeftWidth: 3,
//     borderLeftColor: "#4F46E5",
//   },
//   targetStudentName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#1E293B",
//   },
//   targetStudentCourse: {
//     fontSize: 13,
//     color: "#64748B",
//     marginTop: 2,
//   },
//   inputLabel: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#475569",
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   ratingSection: {
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//   },
//   starTouch: {
//     padding: 4,
//   },
//   ratingLabel: {
//     marginTop: 4,
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#F59E0B",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#CBD5E1",
//     borderRadius: 12,
//     height: 110,
//     textAlignVertical: "top",
//     padding: 12,
//     fontSize: 14,
//     color: "#0F172A",
//     backgroundColor: "#F8FAFC",
//     marginBottom: 20,
//   },
//   modalButtons: {
//     flexDirection: "row",
//     gap: 12,
//   },
//   cancelBtn: {
//     flex: 1,
//     backgroundColor: "#F1F5F9",
//     paddingVertical: 13,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   submitBtn: {
//     flex: 1.5,
//     backgroundColor: "#4F46E5",
//     paddingVertical: 13,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   cancelText: {
//     color: "#475569",
//     fontWeight: "600",
//     fontSize: 14,
//   },
//   submitText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 14,
//   },
// });
