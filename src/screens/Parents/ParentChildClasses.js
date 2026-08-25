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

// Helper function to format status badges with modern pill styling
const getStatusBadgeStyle = (status) => {
  switch ((status || "").toLowerCase()) {
    case "accepted":
      return { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
    case "pending":
      return { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" };
    case "rejected":
      return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    case "completed":
      return { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" };
    case "cancelled":
      return { bg: "#F1F5F9", text: "#475569", border: "#E2E8F0" };
    default:
      return { bg: "#EFF6FF", text: colors.primary || "#2563EB", border: "#DBEAFE" };
  }
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// --- Sub-components for Clean Modular Architecture ---

const ClassCard = ({ item }) => {
  const statusStyle = getStatusBadgeStyle(item.status);

  return (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.courseTitleWrapper}>
          <View style={styles.bookIconBg}>
            <Icon name="book-outline" size={16} color={colors.primary || "#2563EB"} />
          </View>
          <Text style={styles.courseName} numberOfLines={1}>
            {item.courseName}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Tutor Profile Block */}
      <View style={styles.tutorCard}>
        <View style={styles.tutorHeader}>
          <Icon name="person-circle-outline" size={28} color="#475569" />
          <View style={styles.tutorMeta}>
            <Text style={styles.tutorName}>{item.tutorName}</Text>
            <Text style={styles.tutorRole}>Assigned Instructor</Text>
          </View>
        </View>

        <View style={styles.tutorDetails}>
          <View style={styles.tutorContactRow}>
            <Icon name="mail-outline" size={13} color="#64748B" />
            <Text style={styles.tutorContactText} numberOfLines={1}>
              {item.tutorEmail}
            </Text>
          </View>
          <View style={styles.tutorContactRow}>
            <Icon name="call-outline" size={13} color="#64748B" />
            <Text style={styles.tutorContactText}>
              {item.tutorPhone || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Grid Schedule Information */}
      <View style={styles.infoGrid}>
        <View style={styles.gridItem}>
          <Icon name="calendar-outline" size={15} color={colors.primary} />
          <View style={styles.gridTextGroup}>
            <Text style={styles.gridLabel}>Class Date</Text>
            <Text style={styles.gridValue}>{formatDate(item.classDate)}</Text>
          </View>
        </View>

        <View style={styles.gridItem}>
          <Icon name="time-outline" size={15} color={colors.primary} />
          <View style={styles.gridTextGroup}>
            <Text style={styles.gridLabel}>Time / Day</Text>
            <Text style={styles.gridValue}>
              {item.time ? `${item.time} (${item.day})` : item.day || "-"}
            </Text>
          </View>
        </View>

        <View style={styles.gridItem}>
          <Icon name="sync-outline" size={15} color={colors.primary} />
          <View style={styles.gridTextGroup}>
            <Text style={styles.gridLabel}>Request Type</Text>
            <Text style={styles.gridValue}>{item.requestType || "-"}</Text>
          </View>
        </View>

        <View style={styles.gridItem}>
          <Icon name="document-text-outline" size={15} color={colors.primary} />
          <View style={styles.gridTextGroup}>
            <Text style={styles.gridLabel}>Request Date</Text>
            <Text style={styles.gridValue}>{formatDate(item.requestDate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconCircle}>
      <Icon name="school-outline" size={48} color="#94A3B8" />
    </View>
    <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
    <Text style={styles.emptySubtitle}>
      There are currently no class sessions recorded for this course.
    </Text>
  </View>
);

// --- Main Screen ---

const ParentChildClasses = ({ navigation, route }) => {
  const { studentId, courseId, courseTitle } = route.params;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-classes/${studentId}/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClasses(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Connection Error",
        error.response?.data?.message || "Unable to fetch child classes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

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

      {/* Screen Title & Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading class schedule...</Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.requestId.toString()}
          renderItem={({ item }) => <ClassCard item={item} />}
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
              <Text style={styles.title}>{courseTitle}</Text>
              <Text style={styles.subtitle}>Scheduled sessions & class status</Text>
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

export default ParentChildClasses;

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

  // Card Styling
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  courseTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  bookIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  // Tutor Block
  tutorCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  tutorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tutorMeta: {
    marginLeft: 8,
  },
  tutorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  tutorRole: {
    fontSize: 11,
    color: "#94A3B8",
  },
  tutorDetails: {
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  tutorContactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tutorContactText: {
    fontSize: 12,
    color: "#64748B",
    marginLeft: 6,
  },

  // Grid Info Section
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  gridItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "flex-start",
  },
  gridTextGroup: {
    marginLeft: 8,
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },
  gridValue: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
    marginTop: 1,
  },

  // Load & Empty States
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
