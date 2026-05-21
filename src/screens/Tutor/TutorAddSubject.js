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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TutorAddSubject = ({ navigation }) => {

  const [subjects, setSubjects] = useState([]);        // tutor courses
  const [availableCourses, setAvailableCourses] = useState([]); // all courses
  const [showCourses, setShowCourses] = useState(false);

  useEffect(() => {
    fetchMyCourses();
  }, []);


  const fetchMyCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Tutor/my-courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setSubjects(data);
      }
    } catch (e) {
      console.log("My Courses Error:", e);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const res = await fetch(`${BASE_URL}/Tutor/all-courses`);
      const data = await res.json();

      if (res.ok) {
        setAvailableCourses(data);
        setShowCourses(true);
      }
    } catch (e) {
      console.log("All Courses Error:", e);
    }
  };

  const addCourse = async (course) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/Tutor/add-courses`, {
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
        Alert.alert("Success", "Course added");

        setSubjects((prev) => {
          const exists = prev.find(c => c.course_id === course.course_id);
          if (exists) return prev;
          return [...prev, course];
        });

      } else {
        Alert.alert("Error", data.message);
      }

    } catch (e) {
      console.log("Add Course Error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("TutorDrawer")}>
          <Icon name="menu" size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Subjects You Teach</Text>

          <ScrollView>
            {subjects.map((sub, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.itemText}>
                  {index + 1}. {sub.course_name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.centerArea}>
          <TouchableOpacity style={styles.addBtn} onPress={fetchAllCourses}>
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available Courses</Text>

          <ScrollView>
            {showCourses && availableCourses.map((course, index) => (
              <TouchableOpacity
                key={index}
                style={styles.listItem}
                onPress={() => addCourse(course)}
              >
                <Text style={styles.itemText}>
                  {course.course_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorHome")}>
          <Icon name="calendar-month" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorStudentRequest")}>
          <Icon name="description" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorTodayClasses")}>
          <Icon name="school" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="add-box" size={24} color={colors.primary} />
          <Text style={styles.activeTab}>Add</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default TutorAddSubject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerCenter: {
    alignItems: "center",
  },

  logoImage: {
    width: 28,
    height: 28,
    marginBottom: 2,
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  content: {
    flex: 1,
    flexDirection: "row",
    padding: 12,
    justifyContent: "space-between",
  },

  card: {
    width: "40%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    elevation: 3,
  },

  cardTitle: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
    color: colors.primary,
  },

  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  itemText: {
    fontSize: 13,
    color: "#333",
  },

  centerArea: {
    justifyContent: "center",
    alignItems: "center",
  },

  addBtn: {
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  navItem: {
    alignItems: "center",
  },

  activeTab: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },

  inactiveTab: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
});
