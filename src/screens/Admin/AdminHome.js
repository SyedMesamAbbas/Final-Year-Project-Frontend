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
  RefreshControl,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // Two-column grid math

const AdminHome = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const [statsData, setStatsData] = useState([
    {
      id: 1,
      title: "Total Tutors",
      value: "0",
      icon: require("../../../assets/images/tutor.png"),
      route: "AdminApprovedTutor",
      accent: "#4F46E5",
      bgAccent: "#EEF2FF",
    },
    {
      id: 2,
      title: "Total Students",
      value: "0",
      icon: require("../../../assets/images/student.png"),
      route: "AdminStudent",
      accent: "#0EA5E9",
      bgAccent: "#F0F9FF",
    },
    {
      id: 3,
      title: "All Classes",
      value: "0",
      icon: require("../../../assets/images/classes.png"),
      route: "AdminDrawer",
      accent: "#8B5CF6",
      bgAccent: "#F5F3FF",
    },
    {
      id: 4,
      title: "Total Subjects",
      value: "0",
      icon: require("../../../assets/images/books.png"),
      route: "AdminSubject",
      accent: "#10B981",
      bgAccent: "#ECFDF5",
    },
  ]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchNotificationCount()]);
    } catch (error) {
      console.log("Error initializing dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH DASHBOARD STATS
  // =====================================================
  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Admin/dashboard`);
      const data = response.data || {};

      setStatsData((prevData) =>
        prevData.map((item) => {
          let val = "0";
          if (item.id === 1) val = (data.totalTutors || 0).toString();
          if (item.id === 2) val = (data.totalStudents || 0).toString();
          if (item.id === 3) val = (data.totalClasses || 0).toString();
          if (item.id === 4) val = (data.totalSubjects || 0).toString();

          return { ...item, value: val };
        })
      );
    } catch (error) {
      console.log("Dashboard Error:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load dashboard data");
    }
  };

  // =====================================================
  // FETCH NOTIFICATION COUNT
  // =====================================================
  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/Admin/notification-count`);
      const count =
        response.data?.count ?? response.data?.notificationCount ?? 0;
      setNotificationCount(Number(count));
    } catch (error) {
      console.log("Notification Count Error:", error.response?.data || error.message);
      setNotificationCount(0);
    }
  };

  // =====================================================
  // PULL-TO-REFRESH HANDLER
  // =====================================================
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchNotificationCount()]);
    setRefreshing(false);
  }, []);

  // =====================================================
  // HEADER
  // =====================================================
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.headerIconButton}
        onPress={() => navigation.navigate("AdminDrawer")}
        activeOpacity={0.7}
      >
        <Icon name="menu" size={24} color="#1E293B" />
      </TouchableOpacity>

      <Image
        source={require("../../../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity
        style={styles.headerIconButton}
        onPress={() => navigation.navigate("AdminTutor")}
        activeOpacity={0.7}
      >
        <Icon name="notifications-none" size={25} color="#1E293B" />
        {notificationCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notificationCount > 99 ? "99+" : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // =====================================================
  // MAIN RENDER
  // =====================================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {renderHeader()}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
          <Text style={styles.loadingText}>Fetching insights...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary || "#4F46E5"}
            />
          }
        >
          {/* WELCOME SECTION */}
          <View style={styles.welcomeSection}>
            <View>
              <Text style={styles.greetingText}>Dashboard Overview</Text>
              <Text style={styles.welcomeTitle}>Welcome back, Admin 👋</Text>
            </View>
          </View>

          {/* GRID STATS SECTION */}
          <View style={styles.gridContainer}>
            {statsData.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.gridCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: item.bgAccent },
                    ]}
                  >
                    <Image source={item.icon} style={styles.cardIcon} />
                  </View>
                  <Icon
                    name="arrow-forward"
                    size={18}
                    color="#94A3B8"
                    style={styles.arrowIcon}
                  />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardValue}>{item.value}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* QUICK ACTIONS PANEL */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Management</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("AdminApprovedTutor")}
              >
                <View style={[styles.actionIconBg, { backgroundColor: "#EEF2FF" }]}>
                  <Icon name="person-add" size={20} color="#4F46E5" />
                </View>
                <Text style={styles.actionButtonText}>Approve Tutors</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("AdminSubject")}
              >
                <View style={[styles.actionIconBg, { backgroundColor: "#ECFDF5" }]}>
                  <Icon name="add-to-photos" size={20} color="#10B981" />
                </View>
                <Text style={styles.actionButtonText}>Add Subjects</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNavContainer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <View style={styles.activePill}>
            <Icon name="home" size={22} color={colors.primary || "#4F46E5"} />
          </View>
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminApprovedTutor")}
          activeOpacity={0.7}
        >
          <Icon name="groups" size={22} color="#64748B" />
          <Text style={styles.navText}>Tutors</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminStudent")}
          activeOpacity={0.7}
        >
          <Icon name="school" size={22} color="#64748B" />
          <Text style={styles.navText}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AdminSubject")}
          activeOpacity={0.7}
        >
          <Icon name="menu-book" size={22} color="#64748B" />
          <Text style={styles.navText}>Subjects</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminHome;

// =====================================================
// STYLESHEET
// =====================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // HEADER
  headerContainer: {
    height: 64,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: 120,
    height: 38,
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },

  // LOADER
  loaderContainer: {
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

  // CONTENT CONTAINER
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },

  // WELCOME SECTION
  welcomeSection: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  // STATS GRID
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  arrowIcon: {
    opacity: 0.6,
  },
  cardBody: {
    marginTop: 2,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
  },

  // QUICK ACTIONS
  quickActionsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  // BOTTOM NAVIGATION
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  activePill: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 2,
  },
  navText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  navTextActive: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    marginTop: 2,
  },
});
