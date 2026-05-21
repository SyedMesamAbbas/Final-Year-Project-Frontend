import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentAllClasses = ({ navigation }) => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Student/my-classes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : [];

      if (response.ok) {
        setClassesData(Array.isArray(data) ? data : []);
      } else {
        Alert.alert("Error", data.message || "Failed to load classes");
      }
    } catch (error) {
      console.log("Fetch Classes Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftBorder} />

      <View style={styles.cardContent}>
        <View>
          <Text style={styles.subject}>
            {item.course_name || "Course"}
          </Text>

          <Text style={styles.info}>
            Tutor: {item.tutor_name || "N/A"}
          </Text>

          <Text style={styles.time}>
            🕒 {item.time || "Time not set"}
          </Text>

          {/* DATE */}
          <Text style={styles.info}>
            📅 {item.request_date
              ? new Date(item.request_date).toLocaleDateString()
              : "Date"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={()=>Alert.alert("Request Sended", "Thank You!")}
        >
          <View style={styles.redDot} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("StudentDrawer")}>
          <Icon name="menu" size={28} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImg}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.title}>Your Classes</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={classesData}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No classes found</Text>
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentHome")}
        >
          <Icon name="calendar-today" size={24} color="#999" />
          <Text style={styles.navText}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentAddCourses")}
        >
          <Icon name="library-add" size={24} color="#999" />
          <Text style={styles.navText}>Add Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("StudentCourses")}
        >
          <Icon name="menu-book" size={24} color="#999" />
          <Text style={styles.navText}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="school" size={24} color={colors.primary} />
          <Text style={styles.navTextActive}>Classes</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default StudentAllClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 35,
    marginBottom: 10,
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImg: {
    width: 30,
    height: 30,
    marginRight: 6,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 10,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3,
  },

  leftBorder: {
    width: 5,
    backgroundColor: "#F5A623",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },

  cardContent: {
    flex: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  subject: {
    fontSize: 16,
    fontWeight: "bold",
  },

  info: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },

  time: {
    fontSize: 13,
    color: "#2F80ED",
    marginTop: 2,
    fontWeight: "600",
  },

  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  redDot: {
    width: 8,
    height: 8,
    backgroundColor: "red",
    borderRadius: 4,
    marginRight: 6,
  },

  cancelText: {
    color: "#fff",
    fontSize: 12,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    position: "absolute",
    bottom: 0,
    width: "107%",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  navText: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },

  navTextActive: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
});