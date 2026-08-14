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

const TutorTodayClasses = ({ navigation }) => {

  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayClasses();
  }, []);

  // const fetchTodayClasses = async () => {
  //   try {
  //     const token = await AsyncStorage.getItem("token");

  //     if (!token) {
  //       Alert.alert("Error", "User not logged in");
  //       return;
  //     }

  //     const response = await fetch(`${BASE_URL}/Tutor/today-classes`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     const text = await response.text();
  //     console.log("TODAY CLASSES RESPONSE:", text);

  //     let data = [];
  //     try {
  //       data = text ? JSON.parse(text) : [];
  //     } catch {}

  //     if (response.ok) {
  //       setClassData(Array.isArray(data) ? data : []);
  //     } else {
  //       Alert.alert("Error", data.message || "Failed to load classes");
  //     }

  //   } catch (error) {
  //     console.log("Fetch Error:", error);
  //     Alert.alert("Error", error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchTodayClasses = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const response = await fetch(
      `${BASE_URL}/Tutor/today-classes`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    console.log("TODAY CLASSES:", result);

    if (response.ok && result.success) {
      setClassData(result.data || []);
    } else {
      Alert.alert(
        "Error",
        result.message || "Failed to load classes"
      );
    }
  } catch (error) {
    console.log("Fetch Error:", error);
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};

  const renderItem = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.time}>
      ⏰ {item.time || "N/A"}
    </Text>

    <Text style={styles.text}>
      👤 Student: {item.student_name}
    </Text>

    <Text style={styles.text}>
      📘 Course: {item.course_name}
    </Text>

    <Text style={styles.text}>
      📅 Date: {item.class_date}
    </Text>

    <Text style={styles.text}>
      🗓️ Day: {item.day}
    </Text>

    <Text style={styles.text}>
      📌 Type: {item.request_type}
    </Text>

    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.primaryBtn}>
        <Text style={styles.primaryText}>Complete</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>
          Pre-Schedule
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn}>
        <Text style={styles.secondaryText}>
          Re-Schedule
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelBtn}>
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={classData}
          keyExtractor={(item) => item.request_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No classes today
            </Text>
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorHome")}>
          <Icon name="calendar-month" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorStudentRequest")}>
          <Icon name="description" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="school" size={24} color={colors.primary} />
          <Text style={styles.activeTab}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("TutorAddSubject")}>
          <Icon name="add-box" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Add</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default TutorTodayClasses;

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
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 3,
  },

  time: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 6,
  },

  text: {
    fontSize: 13,
    color: "#444",
    marginBottom: 2,
  },

  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 6,
    marginTop: 6,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 6,
    marginTop: 6,
  },

  cancelBtn: {
    borderWidth: 1,
    borderColor: "#e74c3c",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 6,
    marginTop: 6,
  },

  primaryText: {
    color: "#fff",
    fontSize: 12,
  },

  secondaryText: {
    color: colors.primary,
    fontSize: 12,
  },

  cancelText: {
    color: "#e74c3c",
    fontSize: 12,
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
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
