import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

// --- Sub-components for Clean Architecture ---

const CourseCard = ({ item, index, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    style={styles.cardContainer}
    onPress={onPress}
  >
    <View style={styles.cardContent}>
      <View style={styles.courseIconBadge}>
        <Icon name="book" size={22} color={colors.primary || "#2563EB"} />
      </View>

      <View style={styles.courseTextContainer}>
        <View style={styles.courseHeaderRow}>
          <Text style={styles.courseBadge}>Course #{index + 1}</Text>
        </View>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {item.courseTitle}
        </Text>
      </View>

      <View style={styles.actionCircle}>
        <Icon name="chevron-forward" size={18} color={colors.primary || "#2563EB"} />
      </View>
    </View>

    <View style={styles.cardFooter}>
      <Text style={styles.footerActionText}>View Enrolled Classes</Text>
      <Icon name="arrow-forward" size={14} color={colors.primary || "#2563EB"} />
    </View>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Icon name="library-outline" size={48} color="#94A3B8" />
    </View>
    <Text style={styles.emptyTitle}>No Courses Found</Text>
    <Text style={styles.emptySubtitle}>
      There are no active course enrollments registered for this student.
    </Text>
  </View>
);

// --- Main Screen ---

const ParentChildCourses = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-courses/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCourses(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Connection Error",
        error.response?.data?.message || "Unable to fetch child courses."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  const handleCoursePress = (item) => {
    navigation.navigate("ParentChildClasses", {
      studentId: studentId,
      courseId: item.courseId,
      courseTitle: item.courseTitle,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Navigation Header */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
        />

        <View style={{ width: 36 }} />
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.courseId.toString()}
          renderItem={({ item, index }) => (
            <CourseCard
              item={item}
              index={index}
              onPress={() => handleCoursePress(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.screenHeader}>
              <Text style={styles.title}>Enrolled Courses</Text>
              <Text style={styles.subtitle}>
                Select a course subject to view detailed class schedules
              </Text>
            </View>
          }
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ParentChildCourses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Navbar Styling
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 90,
    height: 38,
    resizeMode: "contain",
  },

  // Header Titles
  screenHeader: {
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  // List Layout
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    flexGrow: 1,
  },

  // Modern Course Card
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  courseIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  courseBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 22,
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  footerActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary || "#2563EB",
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
