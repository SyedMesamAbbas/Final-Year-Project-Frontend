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
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const MyTutor = ({ navigation }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // ---- Grade state ----
  const [gradeVisible, setGradeVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [grade, setGrade] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  useEffect(() => {
    loadTutors();
  }, []);

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const loadTutors = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const response = await fetch(`${BASE_URL}/Student/my-tutors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTutors(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load tutors");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (item) => {
    setSelectedTutor(item);
    setRating(5);
    setComment("");
    setFeedbackVisible(true);
  };

  const submitFeedback = async () => {
    if (!selectedTutor) return;

    try {
      setSubmitting(true);
      const token = await getToken();

      const response = await fetch(`${BASE_URL}/Student/give-feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorId: selectedTutor.tutorId,
          courseId: selectedTutor.courseId,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Feedback submitted successfully");
        setFeedbackVisible(false);
        loadTutors();
      } else {
        Alert.alert("Error", data.message || "Failed");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Network Error");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Grade handlers ----
  const openGradeModal = (item) => {
    setSelectedCourse(item);
    setGrade(item.grade || "");
    setGradeVisible(true);
  };

  const submitGrade = async () => {
    if (!selectedCourse) return;

    if (!grade.trim()) {
      Alert.alert("Error", "Please enter a grade");
      return;
    }

    try {
      setSavingGrade(true);
      const token = await getToken();

      const response = await fetch(`${BASE_URL}/Student/save-grade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourse.courseId,
          grade: grade.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Grade saved successfully");
        setGradeVisible(false);
        loadTutors();
      } else {
        Alert.alert("Error", data.message || "Failed to save grade");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Network Error");
    } finally {
      setSavingGrade(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTutor = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Tutor Header Info */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.tutorName)}</Text>
          </View>
          <View style={styles.tutorDetails}>
            <Text style={styles.tutorName}>{item.tutorName}</Text>
            <View style={styles.courseRow}>
              <MaterialIcons name="book" size={14} color="#64748B" style={styles.courseIcon} />
              <Text style={styles.courseName}>{item.courseName}</Text>
            </View>
          </View>
          
          {item.grade ? (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeLabel}>GRADE</Text>
              <Text style={styles.gradeText}>{item.grade}</Text>
            </View>
          ) : null}
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Status Section */}
        <View style={styles.statusContainer}>
          {item.isCompleted ? (
            <View style={[styles.statusBadge, styles.completedBadge]}>
              <MaterialIcons name="check-circle" size={16} color="#059669" />
              <Text style={styles.completedText}>Course Completed</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.waitingBadge]}>
              <MaterialIcons name="schedule" size={16} color="#D97706" />
              <Text style={styles.waitingText}>In Progress</Text>
            </View>
          )}
        </View>

        {/* Action Buttons Container */}
        <View style={styles.actionsRow}>
          {/* Grade Action */}
          <TouchableOpacity
            style={[styles.btn, styles.gradeBtn]}
            onPress={() => openGradeModal(item)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="grade" size={18} color="#4F46E5" />
            <Text style={styles.gradeBtnText}>
              {item.grade ? "Update Grade" : "Add Grade"}
            </Text>
          </TouchableOpacity>

          {/* Feedback Section */}
          {item.isCompleted && (
            <>
              {!item.feedbackGiven ? (
                <TouchableOpacity
                  style={[styles.btn, styles.feedbackBtn]}
                  onPress={() => openFeedbackModal(item)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="rate-review" size={18} color="#FFFFFF" />
                  <Text style={styles.feedbackBtnText}>Give Feedback</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.feedbackDoneBadge}>
                  <MaterialIcons name="stars" size={16} color="#059669" />
                  <Text style={styles.feedbackDoneText}>Feedback Given</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color="#0F172A" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 40 }} />
      </View>

      {/* Section Heading */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>My Tutors</Text>
        <Text style={styles.subtitle}>Track your coursework, grades, and tutor feedback</Text>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Fetching your tutors...</Text>
        </View>
      ) : (
        <FlatList
          data={tutors}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderTutor}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="school" size={48} color="#94A3B8" />
              </View>
              <Text style={styles.emptyTitle}>No Tutors Found</Text>
              <Text style={styles.emptySubtitle}>
                You currently don't have any assigned tutors or active courses.
              </Text>
            </View>
          )}
        />
      )}

      {/* Feedback Modal */}
      <Modal visible={feedbackVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Tutor Feedback</Text>
                {selectedTutor && (
                  <Text style={styles.modalSubtitle}>{selectedTutor.tutorName}</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setFeedbackVisible(false)}
                style={styles.closeModalBtn}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity 
                    key={star} 
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    style={styles.starTouch}
                  >
                    <MaterialIcons
                      name={star <= rating ? "star" : "star-border"}
                      size={36}
                      color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Your Feedback</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={4}
                placeholder="How was your experience learning with this tutor?"
                placeholderTextColor="#94A3B8"
                value={comment}
                onChangeText={setComment}
              />

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setFeedbackVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && styles.disabledBtn]}
                  onPress={submitFeedback}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Feedback</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Grade Modal */}
      <Modal visible={gradeVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Grade Record</Text>
                {selectedCourse && (
                  <Text style={styles.modalSubtitle}>{selectedCourse.courseName}</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={() => setGradeVisible(false)}
                style={styles.closeModalBtn}
              >
                <MaterialIcons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Enter Final or Current Grade</Text>
            <TextInput
              style={styles.gradeInput}
              placeholder="e.g. A, B+, 92%"
              placeholderTextColor="#94A3B8"
              value={grade}
              onChangeText={setGrade}
              autoCapitalize="characters"
              autoFocus
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setGradeVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, savingGrade && styles.disabledBtn]}
                onPress={submitGrade}
                disabled={savingGrade}
                activeOpacity={0.8}
              >
                {savingGrade ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Grade</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default MyTutor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header Styles
  header: {
    height: 64,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 110,
    height: 36,
  },

  // Title Section
  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  // Loading & Empty States
  loadingContainer: {
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

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },

  // List & Cards
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
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

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },

  avatarText: {
    color: "#4F46E5",
    fontSize: 16,
    fontWeight: "700",
  },

  tutorDetails: {
    flex: 1,
    marginLeft: 14,
  },

  tutorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  courseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  courseIcon: {
    marginRight: 4,
  },

  courseName: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  gradeBadge: {
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },

  gradeBadgeLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0D9488",
    letterSpacing: 0.5,
  },

  gradeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F766E",
    marginTop: 1,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  // Status Badges
  statusContainer: {
    flexDirection: "row",
    marginBottom: 14,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  completedBadge: {
    backgroundColor: "#ECFDF5",
  },

  completedText: {
    color: "#047857",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  waitingBadge: {
    backgroundColor: "#FFFBEB",
  },

  waitingText: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  // Action Buttons
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    flex: 1,
  },

  gradeBtn: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },

  gradeBtnText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  feedbackBtn: {
    backgroundColor: "#4F46E5",
  },

  feedbackBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  feedbackDoneBadge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 42,
    backgroundColor: "#F0FDF4",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },

  feedbackDoneText: {
    color: "#166534",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },

  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    maxHeight: "85%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
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
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },

  closeModalBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    marginTop: 10,
  },

  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  starTouch: {
    paddingHorizontal: 6,
  },

  textArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#0F172A",
    height: 110,
    textAlignVertical: "top",
  },

  gradeInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "600",
  },

  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },

  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  cancelBtnText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },

  submitBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },

  disabledBtn: {
    opacity: 0.7,
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
// } from "react-native";

// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const MyTutor = ({ navigation }) => {
//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [feedbackVisible, setFeedbackVisible] = useState(false);
//   const [selectedTutor, setSelectedTutor] = useState(null);

//   const [rating, setRating] = useState(5);
//   const [comment, setComment] = useState("");

//   const [submitting, setSubmitting] = useState(false);

//   // ---- Grade state ----
//   const [gradeVisible, setGradeVisible] = useState(false);
//   const [selectedCourse, setSelectedCourse] = useState(null);
//   const [grade, setGrade] = useState("");
//   const [savingGrade, setSavingGrade] = useState(false);

//   useEffect(() => {
//     loadTutors();
//   }, []);

//   const getToken = async () => {
//     return await AsyncStorage.getItem("token");
//   };

//   const loadTutors = async () => {
//     try {
//       setLoading(true);

//       const token = await getToken();

//       const response = await fetch(`${BASE_URL}/Student/my-tutors`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setTutors(data);
//       } else {
//         Alert.alert("Error", data.message || "Failed to load tutors");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Network Error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openFeedbackModal = (item) => {
//     setSelectedTutor(item);
//     setRating(5);
//     setComment("");
//     setFeedbackVisible(true);
//   };

//   const submitFeedback = async () => {
//     if (!selectedTutor) return;

//     try {
//       setSubmitting(true);

//       const token = await getToken();

//       const response = await fetch(`${BASE_URL}/Student/give-feedback`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           tutorId: selectedTutor.tutorId,
//           courseId: selectedTutor.courseId,
//           rating: rating,
//           comment: comment,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Feedback submitted successfully");

//         setFeedbackVisible(false);
//         loadTutors();
//       } else {
//         Alert.alert("Error", data.message || "Failed");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Network Error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---- Grade handlers ----
//   const openGradeModal = (item) => {
//     setSelectedCourse(item);
//     setGrade(item.grade || "");
//     setGradeVisible(true);
//   };

//   const submitGrade = async () => {
//     if (!selectedCourse) return;

//     if (!grade.trim()) {
//       Alert.alert("Error", "Please enter a grade");
//       return;
//     }

//     try {
//       setSavingGrade(true);

//       const token = await getToken();

//       const response = await fetch(`${BASE_URL}/Student/save-grade`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           courseId: selectedCourse.courseId,
//           grade: grade.trim(),
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Grade saved successfully");

//         setGradeVisible(false);
//         loadTutors();
//       } else {
//         Alert.alert("Error", data.message || "Failed to save grade");
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert("Error", "Network Error");
//     } finally {
//       setSavingGrade(false);
//     }
//   };

//   const renderTutor = ({ item }) => {
//     return (
//       <View style={styles.card}>
//         <Text style={styles.tutorName}>{item.tutorName}</Text>

//         <Text style={styles.courseName}>{item.courseName}</Text>

//         {item.grade ? (
//           <View style={styles.gradeBadge}>
//             <Text style={styles.gradeText}>My Grade: {item.grade}</Text>
//           </View>
//         ) : null}

//         {/* Grade button available any time */}
//         <TouchableOpacity
//           style={styles.gradeBtn}
//           onPress={() => openGradeModal(item)}
//         >
//           <MaterialIcons name="grade" size={20} color="#fff" />
//           <Text style={styles.btnText}>
//             {item.grade ? "Update Grade" : "Add Grade"}
//           </Text>
//         </TouchableOpacity>

//         {item.isCompleted ? (
//           <>
//             <View style={styles.completedBadge}>
//               <Text style={styles.completedText}>
//                 Course Completed By Tutor
//               </Text>
//             </View>

//             {!item.feedbackGiven && (
//               <TouchableOpacity
//                 style={styles.feedbackBtn}
//                 onPress={() => openFeedbackModal(item)}
//               >
//                 <MaterialIcons name="rate-review" size={20} color="#fff" />

//                 <Text style={styles.btnText}>Give Feedback</Text>
//               </TouchableOpacity>
//             )}

//             {item.feedbackGiven && (
//               <View style={styles.feedbackDone}>
//                 <Text style={styles.feedbackDoneText}>
//                   Feedback Submitted
//                 </Text>
//               </View>
//             )}
//           </>
//         ) : (
//           <View style={styles.waitingBadge}>
//             <Text style={styles.waitingText}>
//               Waiting For Tutor To Complete Course
//             </Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor="#fff" barStyle="dark-content" />

//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <MaterialIcons name="arrow-back" size={28} color="#000" />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 28 }} />
//       </View>

//       <Text style={styles.title}>My Tutors</Text>

//       {loading ? (
//         <ActivityIndicator
//           size="large"
//           color="#2E86DE"
//           style={{ marginTop: 50 }}
//         />
//       ) : (
//         <FlatList
//           data={tutors}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={renderTutor}
//           contentContainerStyle={{ paddingBottom: 30 }}
//           ListEmptyComponent={() => (
//             <Text style={styles.emptyText}>No Tutors Found</Text>
//           )}
//         />
//       )}

//       {/* Feedback Modal */}
//       <Modal visible={feedbackVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modal}>
//             <Text style={styles.modalTitle}>Tutor Feedback</Text>

//             <Text style={styles.label}>Rating</Text>

//             <View style={styles.ratingContainer}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <TouchableOpacity key={star} onPress={() => setRating(star)}>
//                   <MaterialIcons
//                     name={star <= rating ? "star" : "star-border"}
//                     size={40}
//                     color="#FFC107"
//                   />
//                 </TouchableOpacity>
//               ))}
//             </View>

//             <Text style={styles.label}>Comment</Text>

//             <TextInput
//               style={styles.input}
//               multiline
//               placeholder="Write feedback..."
//               value={comment}
//               onChangeText={setComment}
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => setFeedbackVisible(false)}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.submitBtn}
//                 onPress={submitFeedback}
//                 disabled={submitting}
//               >
//                 {submitting ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.submitText}>Submit</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Grade Modal */}
//       <Modal visible={gradeVisible} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modal}>
//             <Text style={styles.modalTitle}>Enter Grade</Text>

//             {selectedCourse && (
//               <Text style={styles.label}>{selectedCourse.courseName}</Text>
//             )}

//             <TextInput
//               style={styles.gradeInput}
//               placeholder="e.g. A, B+, 85"
//               value={grade}
//               onChangeText={setGrade}
//               autoCapitalize="characters"
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 onPress={() => setGradeVisible(false)}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.submitBtn}
//                 onPress={submitGrade}
//                 disabled={savingGrade}
//               >
//                 {savingGrade ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.submitText}>Save</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default MyTutor;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//   },

//   header: {
//     height: 60,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     elevation: 3,
//   },

//   logo: {
//     width: 120,
//     height: 40,
//   },

//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     margin: 15,
//   },

//   card: {
//     backgroundColor: "#fff",
//     marginHorizontal: 15,
//     marginBottom: 12,
//     borderRadius: 12,
//     padding: 15,
//     elevation: 2,
//   },

//   tutorName: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#000",
//   },

//   courseName: {
//     marginTop: 5,
//     fontSize: 15,
//     color: "#666",
//   },

//   gradeBadge: {
//     marginTop: 10,
//     alignSelf: "flex-start",
//     backgroundColor: "#E3F2FD",
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//   },

//   gradeText: {
//     color: "#1565C0",
//     fontWeight: "bold",
//   },

//   gradeBtn: {
//     marginTop: 12,
//     backgroundColor: "#6C5CE7",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 10,
//   },

//   gradeInput: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 10,
//     fontSize: 16,
//   },

//   feedbackBtn: {
//     marginTop: 15,
//     backgroundColor: "#2E86DE",
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 12,
//     borderRadius: 10,
//   },

//   btnText: {
//     color: "#fff",
//     marginLeft: 8,
//     fontWeight: "bold",
//   },

//   completedBadge: {
//     marginTop: 12,
//     backgroundColor: "#D4EDDA",
//     padding: 10,
//     borderRadius: 8,
//   },

//   completedText: {
//     color: "#155724",
//     fontWeight: "bold",
//   },

//   waitingBadge: {
//     marginTop: 12,
//     backgroundColor: "#FFF3CD",
//     padding: 10,
//     borderRadius: 8,
//   },

//   waitingText: {
//     color: "#856404",
//     fontWeight: "bold",
//   },

//   feedbackDone: {
//     marginTop: 15,
//     backgroundColor: "#E8F5E9",
//     padding: 10,
//     borderRadius: 8,
//   },

//   feedbackDoneText: {
//     textAlign: "center",
//     color: "#2E7D32",
//     fontWeight: "bold",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 50,
//     fontSize: 16,
//     color: "#999",
//   },

//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     backgroundColor: "rgba(0,0,0,0.5)",
//     padding: 20,
//   },

//   modal: {
//     backgroundColor: "#fff",
//     borderRadius: 15,
//     padding: 20,
//   },

//   modalTitle: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 15,
//   },

//   label: {
//     fontWeight: "bold",
//     marginBottom: 10,
//   },

//   ratingContainer: {
//     flexDirection: "row",
//     marginBottom: 20,
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: "#ddd",
//     borderRadius: 10,
//     height: 120,
//     textAlignVertical: "top",
//     padding: 12,
//   },

//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 20,
//   },

//   cancelBtn: {
//     flex: 1,
//     marginRight: 10,
//     backgroundColor: "#ccc",
//     padding: 12,
//     borderRadius: 10,
//   },

//   submitBtn: {
//     flex: 1,
//     backgroundColor: "#2E86DE",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//   },

//   cancelText: {
//     textAlign: "center",
//     fontWeight: "bold",
//   },

//   submitText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
// });


















// import React, { useEffect, useState } from "react";
// import {
// View,
// Text,
// StyleSheet,
// FlatList,
// TouchableOpacity,
// ActivityIndicator,
// Alert,
// Modal,
// TextInput,
// Image,
// SafeAreaView,
// StatusBar,
// } from "react-native";

// import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";

// const MyTutor = ({ navigation }) => {
// const [tutors, setTutors] = useState([]);
// const [loading, setLoading] = useState(true);

// const [feedbackVisible, setFeedbackVisible] = useState(false);
// const [selectedTutor, setSelectedTutor] = useState(null);

// const [rating, setRating] = useState(5);
// const [comment, setComment] = useState("");

// const [submitting, setSubmitting] = useState(false);

// useEffect(() => {
// loadTutors();
// }, []);

// const getToken = async () => {
// return await AsyncStorage.getItem("token");
// };

// const loadTutors = async () => {
// try {
// setLoading(true);

//   const token = await getToken();

//   const response = await fetch(
//     `${BASE_URL}/Student/my-tutors`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   const data = await response.json();

//   if (response.ok) {
//     setTutors(data);
//   } else {
//     Alert.alert("Error", data.message || "Failed to load tutors");
//   }
// } catch (error) {
//   console.log(error);
//   Alert.alert("Error", "Network Error");
// } finally {
//   setLoading(false);
// }


// };

// const openFeedbackModal = (item) => {
// setSelectedTutor(item);
// setRating(5);
// setComment("");
// setFeedbackVisible(true);
// };

// const submitFeedback = async () => {
// if (!selectedTutor) return;


// try {
//   setSubmitting(true);

//   const token = await getToken();

//   const response = await fetch(
//     `${BASE_URL}/Student/give-feedback`,
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         tutorId: selectedTutor.tutorId,
//         courseId: selectedTutor.courseId,
//         rating: rating,
//         comment: comment,
//       }),
//     }
//   );

//   const data = await response.json();

//   if (response.ok) {
//     Alert.alert(
//       "Success",
//       "Feedback submitted successfully"
//     );

//     setFeedbackVisible(false);
//     loadTutors();
//   } else {
//     Alert.alert(
//       "Error",
//       data.message || "Failed"
//     );
//   }
// } catch (error) {
//   console.log(error);
//   Alert.alert("Error", "Network Error");
// } finally {
//   setSubmitting(false);
// }


// };

// const renderTutor = ({ item }) => {
// return ( <View style={styles.card}> <Text style={styles.tutorName}>
// {item.tutorName} </Text>

//     <Text style={styles.courseName}>
//       {item.courseName}
//     </Text>

//     {item.isCompleted ? (
//       <>
//         <View style={styles.completedBadge}>
//           <Text style={styles.completedText}>
//             Course Completed By Tutor
//           </Text>
//         </View>

//         {!item.feedbackGiven && (
//           <TouchableOpacity
//             style={styles.feedbackBtn}
//             onPress={() => openFeedbackModal(item)}
//           >
//             <MaterialIcons
//               name="rate-review"
//               size={20}
//               color="#fff"
//             />

//             <Text style={styles.btnText}>
//               Give Feedback
//             </Text>
//           </TouchableOpacity>
//         )}

//         {item.feedbackGiven && (
//           <View style={styles.feedbackDone}>
//             <Text style={styles.feedbackDoneText}>
//               Feedback Submitted
//             </Text>
//           </View>
//         )}
//       </>
//     ) : (
//       <View style={styles.waitingBadge}>
//         <Text style={styles.waitingText}>
//           Waiting For Tutor To Complete Course
//         </Text>
//       </View>
//     )}
//   </View>
// );
// };

// return ( <SafeAreaView style={styles.container}> <StatusBar
//      backgroundColor="#fff"
//      barStyle="dark-content"
//    />

//   <View style={styles.header}>
//     <TouchableOpacity
//       onPress={() => navigation.goBack()}
//     >
//       <MaterialIcons
//         name="arrow-back"
//         size={28}
//         color="#000"
//       />
//     </TouchableOpacity>

//     <Image
//       source={require("../../../assets/images/logo.png")}
//       style={styles.logo}
//       resizeMode="contain"
//     />

//     <View style={{ width: 28 }} />
//   </View>

//   <Text style={styles.title}>
//     My Tutors
//   </Text>

//   {loading ? (
//     <ActivityIndicator
//       size="large"
//       color="#2E86DE"
//       style={{ marginTop: 50 }}
//     />
//   ) : (
//     <FlatList
//       data={tutors}
//       keyExtractor={(item, index) =>
//         index.toString()
//       }
//       renderItem={renderTutor}
//       contentContainerStyle={{
//         paddingBottom: 30,
//       }}
//       ListEmptyComponent={() => (
//         <Text style={styles.emptyText}>
//           No Tutors Found
//         </Text>
//       )}
//     />
//   )}

//   <Modal
//     visible={feedbackVisible}
//     transparent
//     animationType="slide"
//   >
//     <View style={styles.modalOverlay}>
//       <View style={styles.modal}>
//         <Text style={styles.modalTitle}>
//           Tutor Feedback
//         </Text>

//         <Text style={styles.label}>
//           Rating
//         </Text>

//         <View style={styles.ratingContainer}>
//           {[1, 2, 3, 4, 5].map((star) => (
//             <TouchableOpacity
//               key={star}
//               onPress={() => setRating(star)}
//             >
//               <MaterialIcons
//                 name={
//                   star <= rating
//                     ? "star"
//                     : "star-border"
//                 }
//                 size={40}
//                 color="#FFC107"
//               />
//             </TouchableOpacity>
//           ))}
//         </View>

//         <Text style={styles.label}>
//           Comment
//         </Text>

//         <TextInput
//           style={styles.input}
//           multiline
//           placeholder="Write feedback..."
//           value={comment}
//           onChangeText={setComment}
//         />

//         <View style={styles.modalButtons}>
//           <TouchableOpacity
//             style={styles.cancelBtn}
//             onPress={() =>
//               setFeedbackVisible(false)
//             }
//           >
//             <Text style={styles.cancelText}>
//               Cancel
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.submitBtn}
//             onPress={submitFeedback}
//             disabled={submitting}
//           >
//             {submitting ? (
//               <ActivityIndicator
//                 color="#fff"
//               />
//             ) : (
//               <Text style={styles.submitText}>
//                 Submit
//               </Text>
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   </Modal>
// </SafeAreaView>
// );
// };

// export default MyTutor;

// const styles = StyleSheet.create({
// container: {
// flex: 1,
// backgroundColor: "#F5F6FA",
// },

// header: {
// height: 60,
// backgroundColor: "#fff",
// flexDirection: "row",
// alignItems: "center",
// justifyContent: "space-between",
// paddingHorizontal: 15,
// elevation: 3,
// },

// logo: {
// width: 120,
// height: 40,
// },

// title: {
// fontSize: 24,
// fontWeight: "bold",
// margin: 15,
// },

// card: {
// backgroundColor: "#fff",
// marginHorizontal: 15,
// marginBottom: 12,
// borderRadius: 12,
// padding: 15,
// elevation: 2,
// },

// tutorName: {
// fontSize: 18,
// fontWeight: "700",
// color: "#000",
// },

// courseName: {
// marginTop: 5,
// fontSize: 15,
// color: "#666",
// },

// feedbackBtn: {
// marginTop: 15,
// backgroundColor: "#2E86DE",
// flexDirection: "row",
// justifyContent: "center",
// alignItems: "center",
// padding: 12,
// borderRadius: 10,
// },

// btnText: {
// color: "#fff",
// marginLeft: 8,
// fontWeight: "bold",
// },

// completedBadge: {
// marginTop: 12,
// backgroundColor: "#D4EDDA",
// padding: 10,
// borderRadius: 8,
// },

// completedText: {
// color: "#155724",
// fontWeight: "bold",
// },

// waitingBadge: {
// marginTop: 12,
// backgroundColor: "#FFF3CD",
// padding: 10,
// borderRadius: 8,
// },

// waitingText: {
// color: "#856404",
// fontWeight: "bold",
// },

// feedbackDone: {
// marginTop: 15,
// backgroundColor: "#E8F5E9",
// padding: 10,
// borderRadius: 8,
// },

// feedbackDoneText: {
// textAlign: "center",
// color: "#2E7D32",
// fontWeight: "bold",
// },

// emptyText: {
// textAlign: "center",
// marginTop: 50,
// fontSize: 16,
// color: "#999",
// },

// modalOverlay: {
// flex: 1,
// justifyContent: "center",
// backgroundColor: "rgba(0,0,0,0.5)",
// padding: 20,
// },

// modal: {
// backgroundColor: "#fff",
// borderRadius: 15,
// padding: 20,
// },

// modalTitle: {
// fontSize: 22,
// fontWeight: "bold",
// marginBottom: 15,
// },

// label: {
// fontWeight: "bold",
// marginBottom: 10,
// },

// ratingContainer: {
// flexDirection: "row",
// marginBottom: 20,
// },

// input: {
// borderWidth: 1,
// borderColor: "#ddd",
// borderRadius: 10,
// height: 120,
// textAlignVertical: "top",
// padding: 12,
// },

// modalButtons: {
// flexDirection: "row",
// justifyContent: "space-between",
// marginTop: 20,
// },

// cancelBtn: {
// flex: 1,
// marginRight: 10,
// backgroundColor: "#ccc",
// padding: 12,
// borderRadius: 10,
// },

// submitBtn: {
// flex: 1,
// backgroundColor: "#2E86DE",
// padding: 12,
// borderRadius: 10,
// alignItems: "center",
// },

// cancelText: {
// textAlign: "center",
// fontWeight: "bold",
// },

// submitText: {
// color: "#fff",
// fontWeight: "bold",
// },
// });
