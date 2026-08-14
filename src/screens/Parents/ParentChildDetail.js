import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const timeSlots = [
  "8:00-9:00 am",
  "9:00-10:00 am",
  "10:00-11:00 am",
  "11:00-12:00 pm",
  "12:00-1:00 pm",
  "1:00-2:00 pm",
  "2:00-3:00 pm",
  "3:00-4:00 pm",
  "4:00-5:00 pm",
  "5:00-6:00 pm",
  "6:00-7:00 pm",
  "7:00-8:00 pm",
  "8:00-9:00 pm",
  "9:00-10:00 pm",
];

const ParentChildDetail = ({ navigation, route }) => {
  const { studentId } = route.params;

  // =========================================
  // STATES
  // =========================================
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({});
  const [teachMode, setTeachMode] = useState("full");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [child, setChild] = useState(null);

  // =========================================
  // EFFECTS (All hooks moved above early returns)
  // =========================================
  useEffect(() => {
    loadChild();
  }, []);

  useEffect(() => {
    fetchChildSchedule();
  }, []);

  // =========================================
  // DATA FETCHING FUNCTIONS
  // =========================================
  const loadChild = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/Parent/child-profile/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChild(response.data);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to load child."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchChildSchedule = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/Parent/child-schedule/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        const loadedSchedule = {};

        data.forEach((item) => {
          const key = `${item.day}-${item.time}`;
          loadedSchedule[key] = true;
        });

        setSchedule(loadedSchedule);

        const hasSpecificTime = data.some(
          (x) => x.type?.toLowerCase() === "specific time"
        );

        if (hasSpecificTime) {
          setTeachMode("specific");
          if (data[0]?.startDate) {
            setStartDate(new Date(data[0].startDate));
          }
          if (data[0]?.endDate) {
            setEndDate(new Date(data[0].endDate));
          }
        } else {
          setTeachMode("full");
        }
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to load child schedule."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // RENDER CELL (read-only, no toggle)
  // =========================================
  const renderCell = (day, time) => {
    const key = `${day}-${time}`;
    const selected = schedule[key];

    return (
      <View
        key={key}
        style={[styles.cell, selected && styles.activeCell]}
      >
        {selected && <Icon name="check" size={14} color="#fff" />}
      </View>
    );
  };

  // =========================================
  // CONDITIONAL RENDER (Safely below Hooks)
  // =========================================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* STUDENT CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon
              name="person"
              size={65}
              color={colors.primary}
            />
          </View>

          <Text style={styles.name}>{child?.fullName}</Text>
          <Text style={styles.email}>{child?.email}</Text>
          <Text style={styles.phone}>{child?.phone}</Text>
        </View>

        {/* SCHEDULE CARD */}
        <View style={styles.card}>
          {teachMode === "specific" && (
            <View style={{ marginHorizontal: 10 }}>
              <View style={styles.dateBox}>
                <Text>
                  Start: {startDate ? startDate.toDateString() : "N/A"}
                </Text>
              </View>

              <View style={styles.dateBox}>
                <Text>
                  End: {endDate ? endDate.toDateString() : "N/A"}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.timeHeader} />
            {days.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {timeSlots.map((time) => (
            <View key={time} style={styles.row}>
              <Text style={styles.timeText}>{time}</Text>
              {days.map((day) => renderCell(day, time))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="calendar-month" size={24} color={colors.primary} />
          <Text style={styles.activeTab}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("ParentChildProfile", { studentId })
          }
        >
          <Icon name="person" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("ParentChildCourses", { studentId })
          }
        >
          <Icon name="menu-book" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("ParentChildTutors", { studentId })
          }
        >
          <Icon name="school" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Tutors</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("ParentChildClasses", { studentId })
          }
        >
          <Icon name="library-books" size={24} color="#999" />
          <Text style={styles.inactiveTab}>Classes</Text>
        </TouchableOpacity> */}
      
      
      <TouchableOpacity
      style={styles.navItem}
        onPress={() =>
          navigation.navigate("ParentChildFee", { studentId })
        }
      >
        <Icon name="library-books" size={24} color="#999" />
        <Text style={styles.inactiveTab}>Fee</Text>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ParentChildDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 85,
    height: 45,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    marginTop: -4,
  },
  dateBox: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 6,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeHeader: {
    width: 66,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
  },
  timeText: {
    width: 66,
    fontSize: 10,
    color: "#666",
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 32,
    maxHeight: 32,
    borderRadius: 6,
    marginHorizontal: 1,
    marginVertical: 2,
    backgroundColor: "#ECF0F1",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCell: {
    backgroundColor: colors.primary,
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
    width: "100%",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activeTab: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  inactiveTab: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF4FF",
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  email: {
    marginTop: 5,
    fontSize: 15,
    color: "#666",
  },
  phone: {
    marginTop: 5,
    fontSize: 15,
    color: "#666",
  },
});