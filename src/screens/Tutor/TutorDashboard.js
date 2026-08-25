import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const TutorDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    totalClasses: 0,
    students: [],
  });

  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/my-dashboard`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      console.log("Dashboard Response:", json);

      setDashboard(json);
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (studentId) => {
    setExpanded((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const getStatusStyle = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("cancel")) {
      return { container: styles.badgeCancelled, text: styles.badgeTextCancelled };
    }
    if (normalized.includes("confirm") || normalized.includes("complet") || normalized.includes("active")) {
      return { container: styles.badgeSuccess, text: styles.badgeTextSuccess };
    }
    return { container: styles.badgeDefault, text: styles.badgeTextDefault };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={dashboard.students}
        keyExtractor={(item) => item.studentId.toString()}
        ListHeaderComponent={
          <View style={styles.heroCard}>
            <View style={styles.heroCardContent}>
              <View style={styles.heroTextContainer}>
                <Text style={styles.cardTitle}>Total Classes Overview</Text>
                <Text style={styles.totalClasses}>
                  {dashboard.totalClasses || 0}
                </Text>
              </View>
              <View style={styles.heroIconBadge}>
                <Icon name="school" size={28} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.heroFooter}>
              <Icon name="event-available" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroFooterText}>Active Tutoring Sessions</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const isExpanded = !!expanded[item.studentId];

          return (
            <View style={styles.studentCard}>
              <TouchableOpacity
                style={styles.header}
                onPress={() => toggleDropdown(item.studentId)}
                activeOpacity={0.7}
              >
                <View style={styles.studentInfoRow}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {item.studentName ? item.studentName.charAt(0).toUpperCase() : "S"}
                    </Text>
                  </View>

                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>
                      {item.studentName || "Student"}
                    </Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {item.totalClasses} {item.totalClasses === 1 ? "Class" : "Classes"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.expandIconContainer}>
                  <Icon
                    name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                    size={24}
                    color="#64748B"
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.classContainer}>
                  {item.classes && item.classes.length > 0 ? (
                    item.classes.map((cls) => {
                      const statusStyle = getStatusStyle(cls.status);

                      return (
                        <View key={cls.requestId} style={styles.classItem}>
                          <View style={styles.classCardHeader}>
                            <Text style={styles.requestIdText}>
                              ID: #{cls.requestId}
                            </Text>
                            <View style={[styles.badge, statusStyle.container]}>
                              <Text style={[styles.badgeText, statusStyle.text]}>
                                {cls.status || "Pending"}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.classGrid}>
                            <View style={styles.gridItem}>
                              <Icon name="event" size={16} color="#64748B" />
                              <Text style={styles.gridText}>
                                {cls.classDate || "N/A"}
                              </Text>
                            </View>

                            <View style={styles.gridItem}>
                              <Icon name="schedule" size={16} color="#64748B" />
                              <Text style={styles.gridText}>
                                {cls.time || "N/A"}
                              </Text>
                            </View>

                            <View style={styles.gridItemFull}>
                              <Icon name="bookmark-border" size={16} color="#64748B" />
                              <Text style={styles.gridText}>
                                Type: {cls.requestType || "Standard"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.noClassesText}>No class records available.</Text>
                  )}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="person-off" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Students Found</Text>
            <Text style={styles.emptySubtitle}>
              When students book sessions with you, they will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default TutorDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },

  /* Header */
  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.2,
  },
  headerPlaceholder: {
    width: 36,
  },

  /* List & Layout */
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  /* Hero Card */
  heroCard: {
    backgroundColor: colors.primary || "#4F46E5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.primary || "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  totalClasses: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    marginTop: 4,
  },
  heroIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  heroFooterText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
    marginLeft: 6,
  },

  /* Student Accordion Card */
  studentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  studentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  countBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  countText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  expandIconContainer: {
    marginLeft: 8,
  },

  /* Inner Class Card Details */
  classContainer: {
    backgroundColor: "#F8FAFC",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 12,
  },
  classItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  classCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  requestIdText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  classGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 4,
  },
  gridItemFull: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    width: "100%",
    marginTop: 2,
  },
  gridText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 4,
    fontWeight: "500",
  },
  noClassesText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
    paddingVertical: 8,
  },

  /* Status Badges */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: "#DCFCE7",
  },
  badgeTextSuccess: {
    color: "#166534",
  },
  badgeCancelled: {
    backgroundColor: "#FEE2E2",
  },
  badgeTextCancelled: {
    color: "#991B1B",
  },
  badgeDefault: {
    backgroundColor: "#FEF3C7",
  },
  badgeTextDefault: {
    color: "#92400E",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  /* Empty State */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 40,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1E293B",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
});
