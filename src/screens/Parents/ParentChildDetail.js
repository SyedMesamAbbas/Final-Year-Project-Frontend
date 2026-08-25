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
  StatusBar,
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
  // EFFECTS
  // =========================================
  useEffect(() => {
    loadChild();
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
        error.response?.data?.message || "Unable to load child profile."
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
  // RENDER CELL (read-only)
  // =========================================
  const renderCell = (day, time) => {
    const key = `${day}-${time}`;
    const selected = schedule[key];

    return (
      <View
        key={key}
        style={[styles.cell, selected && styles.activeCell]}
      >
        {selected && <Icon name="check" size={13} color="#FFFFFF" />}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#2563EB"} />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* MAIN CONTENT */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* STUDENT PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color={colors.primary || "#2563EB"} />
          </View>

          <Text style={styles.name}>{child?.fullName || "Student Name"}</Text>

          <View style={styles.metaRow}>
            {child?.email ? (
              <View style={styles.metaItem}>
                <Icon name="email" size={14} color="#64748B" />
                <Text style={styles.metaText}>{child.email}</Text>
              </View>
            ) : null}

            {child?.phone ? (
              <View style={styles.metaItem}>
                <Icon name="phone" size={14} color="#64748B" />
                <Text style={styles.metaText}>{child.phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* SCHEDULE MATRIX CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon name="event" size={20} color={colors.primary || "#2563EB"} />
              <Text style={styles.cardTitle}>Weekly Timetable</Text>
            </View>
            <View style={styles.legendBadge}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Active Class</Text>
            </View>
          </View>

          {teachMode === "specific" && (
            <View style={styles.dateContainer}>
              <View style={styles.dateBox}>
                <Icon name="calendar-today" size={14} color="#64748B" />
                <Text style={styles.dateLabel}>
                  Start: <Text style={styles.dateValue}>{startDate ? startDate.toDateString() : "N/A"}</Text>
                </Text>
              </View>

              <View style={styles.dateBox}>
                <Icon name="event-available" size={14} color="#64748B" />
                <Text style={styles.dateLabel}>
                  End: <Text style={styles.dateValue}>{endDate ? endDate.toDateString() : "N/A"}</Text>
                </Text>
              </View>
            </View>
          )}

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.matrixContainer}>
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
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Icon name="calendar-today" size={22} color={colors.primary || "#2563EB"} />
          <Text style={styles.activeTab}>Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("ParentChildProfile", { studentId })
          }
        >
          <Icon name="person-outline" size={22} color="#94A3B8" />
          <Text style={styles.inactiveTab}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("ParentChildCourses", { studentId })
          }
        >
          <Icon name="menu-book" size={22} color="#94A3B8" />
          <Text style={styles.inactiveTab}>Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate("ParentChildTutors", { studentId })
          }
        >
          <Icon name="school" size={22} color="#94A3B8" />
          <Text style={styles.inactiveTab}>Tutors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ParentChildFee", { studentId })}
        >
          <Icon name="payments" size={22} color="#94A3B8" />
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
    backgroundColor: "#F8FAFC",
  },
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

  // Navbar
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 75,
    height: 32,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary || "#2563EB",
    marginTop: -2,
    letterSpacing: 0.2,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  // Timetable Matrix Card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  legendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary || "#2563EB",
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary || "#2563EB",
  },

  // Date Boxes
  dateContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  dateBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  dateLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  dateValue: {
    fontWeight: "600",
    color: "#1E293B",
  },

  // Grid / Matrix
  matrixContainer: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timeHeader: {
    width: 78,
  },
  dayHeader: {
    width: 34,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 11,
    color: "#64748B",
    marginBottom: 6,
  },
  timeText: {
    width: 78,
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
  },
  cell: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginHorizontal: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  activeCell: {
    backgroundColor: colors.primary || "#2563EB",
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activeTab: {
    fontSize: 11,
    color: colors.primary || "#2563EB",
    fontWeight: "600",
    marginTop: 3,
  },
  inactiveTab: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 3,
  },
});
