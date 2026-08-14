import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const MarkCourseDoneScreen = () => {
  const navigation = useNavigation();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Login Required", "Please login first");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/Tutor/my-courses-for-mark-as-done`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const responseText = await response.text();

      console.log("Get Courses Status:", response.status);
      console.log("Get Courses Response:", responseText);

      let data = [];

      if (responseText && responseText.trim() !== "") {
        data = JSON.parse(responseText);
      }

      if (response.ok) {
    // Remove duplicates just in case
          const uniqueCourses = Array.from(
              new Map(
                  (Array.isArray(data) ? data : []).map(item => [
                      `${item.student_id}-${item.course_id}`,
                      item
                  ])
              ).values()
          );

          setCourses(uniqueCourses);
      }else {
        Alert.alert(
          "Error",
          data?.message || "Failed to load courses"
        );
      }
    } catch (error) {
      console.log("Load Courses Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const markCourseDone = async (studentId, courseId) => {
    Alert.alert(
      "Confirm",
      "Are you sure you want to mark this course as completed?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              setProcessing(true);
              if (!token) {
                Alert.alert(
                  "Login Required",
                  "Please login first"
                );
                return;
              }

              const response = await fetch(
                `${BASE_URL}/Tutor/mark-course-done`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    studentId,
                    courseId,
                }),
                }
              );

              const responseText = await response.text();

              console.log(
                "Mark Done Status:",
                response.status
              );
              console.log(
                "Mark Done Response:",
                responseText
              );

              let data = {};

              if (
                responseText &&
                responseText.trim() !== ""
              ) {
                data = JSON.parse(responseText);
              }

              if (response.ok) {
                Alert.alert(
                  "Success",
                  data?.message ||
                    "Course marked as completed successfully"
                );

                loadCourses();
              } else {
                Alert.alert(
                  "Error",
                  data?.message ||
                    "Failed to mark course completed"
                );
              }
            } catch (error) {
              console.log(
                "Mark Course Done Error:",
                error
              );
              Alert.alert("Error", error.message);
            }finally{
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>

        <Text style={styles.studentName}>
            👨‍🎓 {item.student_name}
        </Text>

        <Text style={styles.courseName}>
            📚 {item.course_name}
        </Text>

        <Text style={styles.status}>
            Status :
            <Text
                style={{
                    color: item.is_completed ? "green" : "#FF9800",
                    fontWeight: "bold"
                }}
            >
                {item.is_completed ? " Completed" : " In Progress"}
            </Text>
        </Text>

        {item.grade && (
            <Text style={styles.infoText}>
                Grade : {item.grade}
            </Text>
        )}

        {item.completed_date && (
            <Text style={styles.infoText}>
                Completed :
                {" "}
                {new Date(item.completed_date).toLocaleDateString()}
            </Text>
        )}

        {!item.is_completed ? (
            <TouchableOpacity
                style={[
                    styles.button,
                    processing && { opacity: 0.6 }
                ]}
                disabled={processing}
                onPress={() =>
                    markCourseDone(
                        item.student_id,
                        item.course_id
                    )
                }
            >
                <Text style={styles.buttonText}>
                    {processing
                        ? "Please wait..."
                        : "Mark As Done"}
                </Text>
            </TouchableOpacity>
        ) : (
            <View style={styles.completedBadge}>
                <Text style={styles.completedText}>
                    ✓ Course Completed
                </Text>
            </View>
        )}

    </View>
);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={30}
            color="#000"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <View style={{ width: 30 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color="#2196F3"
          />
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No courses found
          </Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) =>
            `${item.student_id}-${item.course_id}`
          }
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 15,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default MarkCourseDoneScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerCenter: {
    alignItems: "center",
  },

  logoImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  status: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },

  button: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 14,
  },

  completedText: {
    marginTop: 12,
    color: colors.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  studentName: {
  fontSize: 18,
  fontWeight: "bold",
  color: colors.primary,
  marginBottom: 8,
},
infoText: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
},

completedBadge: {
    marginTop: 12,
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
},
});