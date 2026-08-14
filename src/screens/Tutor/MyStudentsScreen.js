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
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";


const MyStudentsScreen = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

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

      if (response.ok) {
        setStudents(data);
      } else {
        Alert.alert("Error", data.message || "Failed to load students");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Network Error");
    } finally {
      setLoading(false);
    }
  };

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
              console.log(error);
              Alert.alert("Error", "Network Error");
            }
          },
        },
      ]
    );
  };

  const openFeedbackModal = (item) => {
    setSelectedStudent(item);
    setRating(5);
    setComment("");
    setFeedbackVisible(true);
  };

  const submitFeedback = async () => {
    if (!selectedStudent) return;

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
            studentId: selectedStudent.studentId,
            courseId: selectedStudent.courseId,
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
      console.log(error);
      Alert.alert("Error", "Network Error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStudent = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.studentName}>
          {item.studentName}
        </Text>

        <Text style={styles.courseName}>
          {item.courseName}
        </Text>

        {item.isCompleted ? (
          <>
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>
                Course Completed
              </Text>
            </View>

            {!item.feedbackGiven && (
              <TouchableOpacity
                style={styles.feedbackBtn}
                onPress={() =>
                  openFeedbackModal(item)
                }
              >
                <MaterialIcons
                  name="rate-review"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.btnText}>
                  Give Feedback
                </Text>
              </TouchableOpacity>
            )}

            {item.feedbackGiven && (
              <View style={styles.feedbackDone}>
                <Text style={styles.feedbackDoneText}>
                  Feedback Submitted
                </Text>
              </View>
            )}
          </>
        ) : (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() =>
              completeCourse(item.courseId)
            }
          >
            <MaterialIcons
              name="check-circle"
              size={20}
              color="#fff"
            />

            <Text style={styles.btnText}>
              Complete Course
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#fff"
        barStyle="dark-content"
      />

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back"
            size={28}
            color="#000"
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.title}>
        My Students
      </Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2E86DE"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) =>
            index.toString()
          }
          renderItem={renderStudent}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              No Students Found
            </Text>
          )}
        />
      )}

      {/* Feedback Modal */}

      <Modal
        visible={feedbackVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              Student Feedback
            </Text>

            <Text style={styles.label}>
              Rating
            </Text>

            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() =>
                    setRating(star)
                  }
                >
                  <MaterialIcons
                    name={
                      star <= rating
                        ? "star"
                        : "star-border"
                    }
                    size={40}
                    color="#FFC107"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              Comment
            </Text>

            <TextInput
              style={styles.input}
              multiline
              placeholder="Write feedback..."
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() =>
                  setFeedbackVisible(false)
                }
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitFeedback}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator
                    color="#fff"
                  />
                ) : (
                  <Text style={styles.submitText}>
                    Submit
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 3,
  },

  logo: {
    width: 120,
    height: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 15,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  courseName: {
    marginTop: 5,
    fontSize: 15,
    color: "#666",
  },

  completeBtn: {
    marginTop: 15,
    backgroundColor: "#27AE60",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
  },

  feedbackBtn: {
    marginTop: 15,
    backgroundColor: "#2E86DE",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },

  completedBadge: {
    marginTop: 12,
    backgroundColor: "#D4EDDA",
    padding: 10,
    borderRadius: 8,
  },

  completedText: {
    color: "#155724",
    fontWeight: "bold",
  },

  feedbackDone: {
    marginTop: 15,
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
  },

  feedbackDoneText: {
    textAlign: "center",
    color: "#2E7D32",
    fontWeight: "bold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },

  modal: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  ratingContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    height: 120,
    textAlignVertical: "top",
    padding: 12,
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 10,
  },

  submitBtn: {
    flex: 1,
    backgroundColor: "#2E86DE",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    textAlign: "center",
    fontWeight: "bold",
  },

  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
});