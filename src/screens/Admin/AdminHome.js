import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminHome = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const [statsData, setStatsData] = useState([
    {
      id: 1,
      title: "Total Tutors",
      value: "0",
      icon: require("../../../assets/images/tutor.png"),
    },
    {
      id: 2,
      title: "Total Students",
      value: "0",
      icon: require("../../../assets/images/student.png"),
    },
    {
      id: 3,
      title: "All Classes",
      value: "0",
      icon: require("../../../assets/images/classes.png"),
    },
    {
      id: 4,
      title: "Total Subjects",
      value: "0",
      icon: require("../../../assets/images/books.png"),
    },
  ]);

  // =====================================================
  // LOAD DATA WHEN SCREEN OPENS
  // =====================================================

  useEffect(() => {
    fetchDashboardStats();
    fetchNotificationCount();
  }, []);

  // =====================================================
  // FETCH DASHBOARD
  // =====================================================

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BASE_URL}/Admin/dashboard`
      );

      console.log("Dashboard Response:", response.data);

      const data = response.data;

      setStatsData([
        {
          id: 1,
          title: "Total Tutors",
          value: (data.totalTutors || 0).toString(),
          icon: require("../../../assets/images/tutor.png"),
        },
        {
          id: 2,
          title: "Total Students",
          value: (data.totalStudents || 0).toString(),
          icon: require("../../../assets/images/student.png"),
        },
        {
          id: 3,
          title: "All Classes",
          value: (data.totalClasses || 0).toString(),
          icon: require("../../../assets/images/classes.png"),
        },
        {
          id: 4,
          title: "Total Subjects",
          value: (data.totalSubjects || 0).toString(),
          icon: require("../../../assets/images/books.png"),
        },
      ]);
    } catch (error) {
      console.log(
        "Dashboard Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH NOTIFICATION COUNT
  // =====================================================

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/Admin/notification-count`
      );

      console.log(
        "Notification Count:",
        response.data
      );

      const count =
        response.data?.count ??
        response.data?.notificationCount ??
        0;

      setNotificationCount(Number(count));
    } catch (error) {
      console.log(
        "Notification Count Error:",
        error.response?.data || error.message
      );

      // Don't show Alert here because notification
      // count failure should not block dashboard.
      setNotificationCount(0);
    }
  };

  // =====================================================
  // REFRESH ALL DATA
  // =====================================================

  const refreshData = useCallback(() => {
    fetchDashboardStats();
    fetchNotificationCount();
  }, []);

  // =====================================================
  // HEADER
  // =====================================================

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        {/* MENU */}
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() =>
            navigation.navigate("AdminDrawer")
          }
          activeOpacity={0.7}
        >
          <Icon
            name="menu"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* LOGO */}
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* NOTIFICATION */}
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate("AdminTutor")}
            activeOpacity={0.7}
          >
          <Icon
            name="notifications-none"
            size={29}
            color={colors.primary}
          />

          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99
                  ? "99+"
                  : notificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      {renderHeader()}

      {/* WELCOME */}
      <Text style={styles.welcome}>
        Welcome, Admin 👋
      </Text>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          onScrollBeginDrag={fetchNotificationCount}
        >
          {statsData.map((item) => (
            <View
              key={item.id}
              style={styles.card}
            >
              <View style={styles.iconBox}>
                <Image
                  source={item.icon}
                  style={styles.icon}
                />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>
                  {item.title}
                </Text>

                <Text style={styles.value}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            refreshData();
          }}
        >
          <Icon
            name="home"
            size={24}
            color={colors.primary}
          />

          <Text style={styles.navTextActive}>
            Home
          </Text>
        </TouchableOpacity>

        {/* TEACHER */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("AdminApprovedTutor")
          }
        >
          <Icon
            name="groups"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Teacher
          </Text>
        </TouchableOpacity>

        {/* STUDENT */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("AdminStudent")
          }
        >
          <Icon
            name="school"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Student
          </Text>
        </TouchableOpacity>

        {/* SUBJECT */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("AdminSubject")
          }
        >
          <Icon
            name="menu-book"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Subject
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminHome;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // ===================================================
  // HEADER
  // ===================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },

  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 140,
    height: 50,
  },

  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // ===================================================
  // NOTIFICATION BADGE
  // ===================================================

  notificationBadge: {
    position: "absolute",
    top: 0,
    right: -1,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#E53935",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#F8FAFC",
  },

  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },

  // ===================================================
  // WELCOME
  // ===================================================

  welcome: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },

  // ===================================================
  // LOADER
  // ===================================================

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ===================================================
  // DASHBOARD CARD
  // ===================================================

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 14,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 38,
    height: 38,
    resizeMode: "contain",
  },

  textContainer: {
    marginLeft: 18,
  },

  title: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 6,
  },

  value: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
  },

  // ===================================================
  // BOTTOM NAVIGATION
  // ===================================================

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },

  navTextActive: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: "700",
  },
});