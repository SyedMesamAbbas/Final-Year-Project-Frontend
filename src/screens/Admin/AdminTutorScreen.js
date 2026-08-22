import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminTutorScreen = ({ navigation }) => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  //==================================================
  // FETCH TUTORS
  //==================================================

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Admin/all-tutors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Tutors API Response:", response.data);

      if (Array.isArray(response.data)) {
        setTutors(response.data);
      } else {
        setTutors([]);
      }
    } catch (error) {
      console.log(
        "Fetch Tutors Error:",
        error.response?.data || error.message
      );

      let message = "Failed to load tutors.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //==================================================
  // REFRESH
  //==================================================

  const onRefresh = () => {
    setRefreshing(true);
    fetchTutors();
  };

  //==================================================
  // GET TOKEN
  //==================================================

  const getAuthHeaders = async () => {
    const token = await AsyncStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  //==================================================
  // APPROVE TUTOR
  //==================================================

  const approveTutor = async (tutorId) => {
    try {
      setActionLoading(tutorId);

      const headers = await getAuthHeaders();

      const response = await axios.put(
        `${BASE_URL}/Admin/approve-tutor/${tutorId}`,
        {},
        {
          headers,
        }
      );

      Alert.alert(
        "Success",
        response.data?.message || "Tutor approved successfully."
      );

      fetchTutors();
    } catch (error) {
      console.log(
        "Approve Tutor Error:",
        error.response?.data || error.message
      );

      let message = "Unable to approve tutor.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      Alert.alert("Error", message);
    } finally {
      setActionLoading(null);
    }
  };

  //==================================================
  // REJECT TUTOR
  //==================================================

  const rejectTutor = async (tutorId) => {
    try {
      setActionLoading(tutorId);

      const headers = await getAuthHeaders();

      const response = await axios.put(
        `${BASE_URL}/Admin/reject-tutor/${tutorId}`,
        {},
        {
          headers,
        }
      );

      Alert.alert(
        "Success",
        response.data?.message || "Tutor rejected successfully."
      );

      fetchTutors();
    } catch (error) {
      console.log(
        "Reject Tutor Error:",
        error.response?.data || error.message
      );

      let message = "Unable to reject tutor.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      Alert.alert("Error", message);
    } finally {
      setActionLoading(null);
    }
  };

  //==================================================
  // BLOCK TUTOR
  //==================================================

  const blockTutor = async (tutorId) => {
    try {
      setActionLoading(tutorId);

      const headers = await getAuthHeaders();

      const response = await axios.put(
        `${BASE_URL}/Admin/block-tutor/${tutorId}`,
        {},
        {
          headers,
        }
      );

      Alert.alert(
        "Success",
        response.data?.message || "Tutor blocked successfully."
      );

      fetchTutors();
    } catch (error) {
      console.log(
        "Block Tutor Error:",
        error.response?.data || error.message
      );

      let message = "Unable to block tutor.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      Alert.alert("Error", message);
    } finally {
      setActionLoading(null);
    }
  };

  //==================================================
  // CONFIRM APPROVE
  //==================================================

  const confirmApprove = (item) => {
    Alert.alert(
      "Approve Tutor",
      `Are you sure you want to approve ${item.fullName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Approve",
          onPress: () => approveTutor(item.tutorId),
        },
      ]
    );
  };

  //==================================================
  // CONFIRM REJECT
  //==================================================

  const confirmReject = (item) => {
    Alert.alert(
      "Reject Tutor",
      `Are you sure you want to reject ${item.fullName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => rejectTutor(item.tutorId),
        },
      ]
    );
  };

  //==================================================
  // CONFIRM BLOCK
  //==================================================

  const confirmBlock = (item) => {
    Alert.alert(
      "Block Tutor",
      `Are you sure you want to block ${item.fullName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block",
          style: "destructive",
          onPress: () => blockTutor(item.tutorId),
        },
      ]
    );
  };

  //==================================================
  // STATUS STYLE MAPPER
  //==================================================

  const getStatusTheme = (status) => {
    const value = status?.toLowerCase();

    if (value === "approved" || value === "active") {
      return {
        bg: "#E8F5E9",
        text: "#1B5E20",
        border: "#A5D6A7",
        icon: "check-circle",
      };
    }

    if (value === "blocked") {
      return {
        bg: "#FFEBEE",
        text: "#C62828",
        border: "#EF9A9A",
        icon: "block",
      };
    }

    if (value === "rejected") {
      return {
        bg: "#FBE9E7",
        text: "#D84315",
        border: "#FFAB91",
        icon: "cancel",
      };
    }

    return {
      bg: "#FFF8E1",
      text: "#B78103",
      border: "#FFE082",
      icon: "schedule",
    };
  };

  //==================================================
  // TUTOR ITEM
  //==================================================

  const renderItem = ({ item }) => {
    const isLoading = actionLoading === item.tutorId;
    const statusTheme = getStatusTheme(item.status);

    return (
      <View style={styles.card}>
        {/* Card Top Banner / Profile Overview */}
        <View style={styles.tutorHeader}>
          <View style={styles.avatarContainer}>
            <Icon
              name="person"
              size={28}
              color={colors.primary || "#2A60E4"}
            />
          </View>

          <View style={styles.info}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {item.fullName || "Unknown Tutor"}
              </Text>
            </View>

            <Text style={styles.qualification} numberOfLines={1}>
              {item.qualification || "Qualification not provided"}
            </Text>

            <View style={styles.idChip}>
              <Text style={styles.tutorId}>ID: #{item.tutorId}</Text>
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusTheme.bg,
                borderColor: statusTheme.border,
              },
            ]}
          >
            <Icon
              name={statusTheme.icon}
              size={13}
              color={statusTheme.text}
            />
            <Text style={[styles.statusBadgeText, { color: statusTheme.text }]}>
              {item.status || "Pending"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Info Grid */}
        <View style={styles.detailsGrid}>
          {/* Email */}
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Icon
                name="email"
                size={16}
                color={colors.primary || "#2A60E4"}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.email || "Not Available"}
              </Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Icon
                name="phone"
                size={16}
                color={colors.primary || "#2A60E4"}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>
                {item.phone || "Not Available"}
              </Text>
            </View>
          </View>

          {/* CNIC */}
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Icon
                name="badge"
                size={16}
                color={colors.primary || "#2A60E4"}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>CNIC Number</Text>
              <Text style={styles.detailValue}>
                {item.cnic || "Not Available"}
              </Text>
            </View>
          </View>

          {/* Experience & Radius side by side */}
          <View style={styles.dualRow}>
            <View style={[styles.detailRow, { flex: 1 }]}>
              <View style={styles.iconBox}>
                <Icon
                  name="work"
                  size={16}
                  color={colors.primary || "#2A60E4"}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Experience</Text>
                <Text style={styles.detailValue}>
                  {item.experience !== null && item.experience !== undefined
                    ? `${item.experience} ${
                        item.experience === 1 ? "Year" : "Years"
                      }`
                    : "N/A"}
                </Text>
              </View>
            </View>

            <View style={[styles.detailRow, { flex: 1 }]}>
              <View style={styles.iconBox}>
                <Icon
                  name="explore"
                  size={16}
                  color={colors.primary || "#2A60E4"}
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Teaching Radius</Text>
                <Text style={styles.detailValue}>
                  {item.radius !== null && item.radius !== undefined
                    ? `${item.radius} km`
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Coordinates Section */}
        <View style={styles.coordinateContainer}>
          <View style={styles.coordinateBox}>
            <Text style={styles.coordinateLabel}>LATITUDE</Text>
            <Text style={styles.coordinateValue}>
              {item.latitude !== null && item.latitude !== undefined
                ? item.latitude
                : "N/A"}
            </Text>
          </View>
          <View style={styles.coordinateSeparator} />
          <View style={styles.coordinateBox}>
            <Text style={styles.coordinateLabel}>LONGITUDE</Text>
            <Text style={styles.coordinateValue}>
              {item.longitude !== null && item.longitude !== undefined
                ? item.longitude
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Actions Grid */}
        <View style={styles.buttonRow}>
          {/* VIEW */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.viewBtn]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("AdminTutorDetailScreen", {
                tutorId: item.tutorId,
              })
            }
          >
            <Icon name="visibility" size={16} color="#0284C7" />
            <Text style={[styles.buttonText, { color: "#0284C7" }]}>View</Text>
          </TouchableOpacity>

          {/* APPROVE */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.approveBtn,
              isLoading && styles.disabledButton,
            ]}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={() => confirmApprove(item)}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#15803D" />
            ) : (
              <>
                <Icon name="check-circle-outline" size={16} color="#15803D" />
                <Text style={[styles.buttonText, { color: "#15803D" }]}>
                  Approve
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* REJECT */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.rejectBtn,
              isLoading && styles.disabledButton,
            ]}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={() => confirmReject(item)}
          >
            <Icon name="highlight-off" size={16} color="#C2410C" />
            <Text style={[styles.buttonText, { color: "#C2410C" }]}>
              Reject
            </Text>
          </TouchableOpacity>

          {/* BLOCK */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.blockBtn,
              isLoading && styles.disabledButton,
            ]}
            activeOpacity={0.8}
            disabled={isLoading}
            onPress={() => confirmBlock(item)}
          >
            <Icon name="block" size={16} color="#DC2626" />
            <Text style={[styles.buttonText, { color: "#DC2626" }]}>Block</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  //==================================================
  // LOADING STATE
  //==================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={colors.primary || "#2A60E4"} />
          <Text style={styles.loadingTitle}>Fetching Tutors</Text>
          <Text style={styles.loadingSubtitle}>
            Please wait while we sync the records...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  //==================================================
  // MAIN UI
  //==================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="arrow-back-ios"
            size={18}
            color="#334155"
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>ADMIN DASHBOARD</Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={fetchTutors}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="refresh" size={22} color="#334155" />
        </TouchableOpacity>
      </View>

      {/* SCREEN TITLE & STATS */}
      <View style={styles.titleContainer}>
        <View style={styles.titleTextWrapper}>
          <Text style={styles.screenTitle}>Tutor Directory</Text>
          <Text style={styles.screenSubtitle}>
            Manage and approve partner tutors
          </Text>
        </View>

        <View style={styles.totalBadge}>
          <Icon
            name="people-alt"
            size={18}
            color={colors.primary || "#2A60E4"}
          />
          <Text style={styles.totalText}>{tutors.length}</Text>
          <Text style={styles.totalLabel}>
            {tutors.length === 1 ? "Tutor" : "Tutors"}
          </Text>
        </View>
      </View>

      {/* TUTOR LIST */}
      <FlatList
        data={tutors}
        keyExtractor={(item) => item.tutorId.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary || "#2A60E4"]}
            tintColor={colors.primary || "#2A60E4"}
          />
        }
        contentContainerStyle={
          tutors.length === 0 ? styles.emptyList : styles.listContent
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="person-off" size={42} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Tutors Registered</Text>
            <Text style={styles.emptySubtitle}>
              There are currently no tutor applications or active accounts
              found in the database.
            </Text>
            <TouchableOpacity
              style={styles.refreshEmptyButton}
              onPress={fetchTutors}
              activeOpacity={0.85}
            >
              <Icon name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.refreshEmptyText}>Reload Directory</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {/* HOME */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("AdminHome")}
          >
            <Icon name="grid-view" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          {/* TEACHER (ACTIVE) */}
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeNavIndicator}>
              <Icon
                name="school"
                size={22}
                color={colors.primary || "#2A60E4"}
              />
              <Text style={styles.navTextActive}>Tutors</Text>
            </View>
          </TouchableOpacity>

          {/* STUDENT */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("AdminStudent")}
          >
            <Icon name="groups" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Students</Text>
          </TouchableOpacity>

          {/* SUBJECT */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate("AdminSubject")}
          >
            <Icon name="book" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Subjects</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminTutorScreen;

//====================================================
// STYLESHEET
//====================================================

const styles = StyleSheet.create({
  // CONTAINER
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // LOADER
  loaderContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingCard: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    width: "85%",
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 14,
  },
  loadingSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  logo: {
    width: 75,
    height: 28,
  },
  headerTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 1.2,
    marginTop: 1,
  },

  // TITLE & STATS
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  titleTextWrapper: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  totalBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalText: {
    marginLeft: 6,
    color: colors.primary || "#2A60E4",
    fontSize: 14,
    fontWeight: "800",
  },
  totalLabel: {
    marginLeft: 4,
    color: colors.primary || "#2A60E4",
    fontSize: 12,
    fontWeight: "600",
  },

  // LIST CONTENT
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 110,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 110,
    justifyContent: "center",
  },

  // CARD
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  // TUTOR HEADER
  tutorHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  qualification: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
    fontWeight: "500",
  },
  idChip: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  tutorId: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  // STATUS BADGE
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
    textTransform: "capitalize",
  },

  // DIVIDER
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  // DETAILS GRID
  detailsGrid: {
    gap: 10,
  },
  dualRow: {
    flexDirection: "row",
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  detailValue: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
    marginTop: 1,
  },

  // COORDINATES
  coordinateContainer: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    alignItems: "center",
  },
  coordinateBox: {
    flex: 1,
    alignItems: "center",
  },
  coordinateSeparator: {
    width: 1,
    height: "80%",
    backgroundColor: "#E2E8F0",
  },
  coordinateLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  coordinateValue: {
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "700",
    marginTop: 2,
  },

  // ACTION BUTTONS
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
    borderWidth: 1,
  },
  viewBtn: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  approveBtn: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  rejectBtn: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FFEDD5",
  },
  blockBtn: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  refreshEmptyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary || "#2A60E4",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
    gap: 6,
  },
  refreshEmptyText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  // BOTTOM NAVIGATION
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    flex: 1,
  },
  activeNavIndicator: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 3,
  },
  navTextActive: {
    fontSize: 11,
    color: colors.primary || "#2A60E4",
    fontWeight: "700",
    marginTop: 3,
  },
});


















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
//   RefreshControl,
// } from "react-native";

// import Icon from "react-native-vector-icons/MaterialIcons";
// import axios from "axios";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const AdminTutorScreen = ({ navigation }) => {
//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [actionLoading, setActionLoading] = useState(null);

//   //==================================================
//   // FETCH TUTORS
//   //==================================================

//   useEffect(() => {
//     fetchTutors();
//   }, []);

//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       const token = await AsyncStorage.getItem("token");

//       const response = await axios.get(
//         `${BASE_URL}/Admin/all-tutors`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("Tutors API Response:", response.data);

//       if (Array.isArray(response.data)) {
//         setTutors(response.data);
//       } else {
//         setTutors([]);
//       }
//     } catch (error) {
//       console.log(
//         "Fetch Tutors Error:",
//         error.response?.data || error.message
//       );

//       let message = "Failed to load tutors.";

//       if (typeof error.response?.data === "string") {
//         message = error.response.data;
//       } else if (error.response?.data?.message) {
//         message = error.response.data.message;
//       }

//       Alert.alert("Error", message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   //==================================================
//   // REFRESH
//   //==================================================

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchTutors();
//   };

//   //==================================================
//   // GET TOKEN
//   //==================================================

//   const getAuthHeaders = async () => {
//     const token = await AsyncStorage.getItem("token");

//     return {
//       Authorization: `Bearer ${token}`,
//     };
//   };

//   //==================================================
//   // APPROVE TUTOR
//   //==================================================

//   const approveTutor = async (tutorId) => {
//     try {
//       setActionLoading(tutorId);

//       const headers = await getAuthHeaders();

//       const response = await axios.put(
//         `${BASE_URL}/Admin/approve-tutor/${tutorId}`,
//         {},
//         {
//           headers,
//         }
//       );

//       Alert.alert(
//         "Success",
//         response.data?.message || "Tutor approved successfully."
//       );

//       fetchTutors();
//     } catch (error) {
//       console.log(
//         "Approve Tutor Error:",
//         error.response?.data || error.message
//       );

//       let message = "Unable to approve tutor.";

//       if (typeof error.response?.data === "string") {
//         message = error.response.data;
//       } else if (error.response?.data?.message) {
//         message = error.response.data.message;
//       }

//       Alert.alert("Error", message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   //==================================================
//   // REJECT TUTOR
//   //==================================================

//   const rejectTutor = async (tutorId) => {
//     try {
//       setActionLoading(tutorId);

//       const headers = await getAuthHeaders();

//       const response = await axios.put(
//         `${BASE_URL}/Admin/reject-tutor/${tutorId}`,
//         {},
//         {
//           headers,
//         }
//       );

//       Alert.alert(
//         "Success",
//         response.data?.message || "Tutor rejected successfully."
//       );

//       fetchTutors();
//     } catch (error) {
//       console.log(
//         "Reject Tutor Error:",
//         error.response?.data || error.message
//       );

//       let message = "Unable to reject tutor.";

//       if (typeof error.response?.data === "string") {
//         message = error.response.data;
//       } else if (error.response?.data?.message) {
//         message = error.response.data.message;
//       }

//       Alert.alert("Error", message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   //==================================================
//   // BLOCK TUTOR
//   //==================================================

//   const blockTutor = async (tutorId) => {
//     try {
//       setActionLoading(tutorId);

//       const headers = await getAuthHeaders();

//       const response = await axios.put(
//         `${BASE_URL}/Admin/block-tutor/${tutorId}`,
//         {},
//         {
//           headers,
//         }
//       );

//       Alert.alert(
//         "Success",
//         response.data?.message || "Tutor blocked successfully."
//       );

//       fetchTutors();
//     } catch (error) {
//       console.log(
//         "Block Tutor Error:",
//         error.response?.data || error.message
//       );

//       let message = "Unable to block tutor.";

//       if (typeof error.response?.data === "string") {
//         message = error.response.data;
//       } else if (error.response?.data?.message) {
//         message = error.response.data.message;
//       }

//       Alert.alert("Error", message);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   //==================================================
//   // CONFIRM APPROVE
//   //==================================================

//   const confirmApprove = (item) => {
//     Alert.alert(
//       "Approve Tutor",
//       `Are you sure you want to approve ${item.fullName}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Approve",
//           onPress: () => approveTutor(item.tutorId),
//         },
//       ]
//     );
//   };

//   //==================================================
//   // CONFIRM REJECT
//   //==================================================

//   const confirmReject = (item) => {
//     Alert.alert(
//       "Reject Tutor",
//       `Are you sure you want to reject ${item.fullName}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Reject",
//           style: "destructive",
//           onPress: () => rejectTutor(item.tutorId),
//         },
//       ]
//     );
//   };

//   //==================================================
//   // CONFIRM BLOCK
//   //==================================================

//   const confirmBlock = (item) => {
//     Alert.alert(
//       "Block Tutor",
//       `Are you sure you want to block ${item.fullName}?`,
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Block",
//           style: "destructive",
//           onPress: () => blockTutor(item.tutorId),
//         },
//       ]
//     );
//   };

//   //==================================================
//   // STATUS COLOR
//   //==================================================

//   const getStatusColor = (status) => {
//     const value = status?.toLowerCase();

//     if (value === "approved" || value === "active") {
//       return "#2E7D32";
//     }

//     if (value === "blocked") {
//       return "#E53935";
//     }

//     if (value === "rejected") {
//       return "#D32F2F";
//     }

//     return "#F39C12";
//   };

//   //==================================================
//   // STATUS ICON
//   //==================================================

//   const getStatusIcon = (status) => {
//     const value = status?.toLowerCase();

//     if (value === "approved" || value === "active") {
//       return "check-circle";
//     }

//     if (value === "blocked") {
//       return "block";
//     }

//     if (value === "rejected") {
//       return "cancel";
//     }

//     return "schedule";
//   };

//   //==================================================
//   // TUTOR ITEM
//   //==================================================

//   const renderItem = ({ item }) => {
//     const isLoading = actionLoading === item.tutorId;

//     return (
//       <View style={styles.card}>

//         {/* ==========================================
//             Header
//         =========================================== */}

//         <View style={styles.tutorHeader}>

//           <View style={styles.avatarContainer}>
//             <Icon
//               name="person"
//               size={32}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.info}>
//             <Text
//               style={styles.name}
//               numberOfLines={1}
//             >
//               {item.fullName || "Unknown Tutor"}
//             </Text>

//             <Text style={styles.tutorId}>
//               Tutor ID: {item.tutorId}
//             </Text>

//             <Text style={styles.qualification}>
//               {item.qualification || "Qualification not provided"}
//             </Text>
//           </View>

//           {/* STATUS */}

//           <View
//             style={[
//               styles.statusBadge,
//               {
//                 backgroundColor: getStatusColor(
//                   item.status
//                 ),
//               },
//             ]}
//           >
//             <Icon
//               name={getStatusIcon(item.status)}
//               size={14}
//               color="#fff"
//             />

//             <Text style={styles.statusBadgeText}>
//               {item.status || "Pending"}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.divider} />

//         {/* ==========================================
//             Email
//         =========================================== */}

//         <View style={styles.detailRow}>
//           <View style={styles.iconBox}>
//             <Icon
//               name="email"
//               size={18}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.detailContent}>
//             <Text style={styles.detailLabel}>
//               Email
//             </Text>

//             <Text
//               style={styles.detailValue}
//               numberOfLines={2}
//             >
//               {item.email || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Phone
//         =========================================== */}

//         <View style={styles.detailRow}>
//           <View style={styles.iconBox}>
//             <Icon
//               name="phone"
//               size={18}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.detailContent}>
//             <Text style={styles.detailLabel}>
//               Phone
//             </Text>

//             <Text style={styles.detailValue}>
//               {item.phone || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             CNIC
//         =========================================== */}

//         <View style={styles.detailRow}>
//           <View style={styles.iconBox}>
//             <Icon
//               name="badge"
//               size={18}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.detailContent}>
//             <Text style={styles.detailLabel}>
//               CNIC
//             </Text>

//             <Text style={styles.detailValue}>
//               {item.cnic || "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Experience
//         =========================================== */}

//         <View style={styles.detailRow}>
//           <View style={styles.iconBox}>
//             <Icon
//               name="work"
//               size={18}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.detailContent}>
//             <Text style={styles.detailLabel}>
//               Experience
//             </Text>

//             <Text style={styles.detailValue}>
//               {item.experience !== null &&
//               item.experience !== undefined
//                 ? `${item.experience} ${
//                     item.experience === 1
//                       ? "Year"
//                       : "Years"
//                   }`
//                 : "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Location
//         =========================================== */}

//         {/* <View style={styles.detailRow}>
//           <View style={styles.iconBox}>
//             <Icon
//               name="location-on"
//               size={18}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.detailContent}>
//             <Text style={styles.detailLabel}>
//               Location
//             </Text>

//             <Text
//               style={styles.detailValue}
//               numberOfLines={2}
//             >
//               {item.location || "Not Available"}
//             </Text>
//           </View>
//         </View> */}

//         {/* ==========================================
//             Radius
//         =========================================== */}

//         <View style={styles.detailRow}>
//           <View style={styles.iconBox}>
//             <Icon
//               name="radio-button-checked"
//               size={18}
//               color={colors.primary}
//             />
//           </View>

//           <View style={styles.detailContent}>
//             <Text style={styles.detailLabel}>
//               Teaching Radius
//             </Text>

//             <Text style={styles.detailValue}>
//               {item.radius !== null &&
//               item.radius !== undefined
//                 ? `${item.radius} km`
//                 : "Not Available"}
//             </Text>
//           </View>
//         </View>

//         {/* ==========================================
//             Coordinates
//         =========================================== */}

//         <View style={styles.coordinateRow}>

//           <View style={styles.coordinateBox}>
//             <Text style={styles.coordinateLabel}>
//               Latitude
//             </Text>

//             <Text style={styles.coordinateValue}>
//               {item.latitude !== null &&
//               item.latitude !== undefined
//                 ? item.latitude
//                 : "N/A"}
//             </Text>
//           </View>

//           <View style={styles.coordinateBox}>
//             <Text style={styles.coordinateLabel}>
//               Longitude
//             </Text>

//             <Text style={styles.coordinateValue}>
//               {item.longitude !== null &&
//               item.longitude !== undefined
//                 ? item.longitude
//                 : "N/A"}
//             </Text>
//           </View>

//         </View>

//         {/* ==========================================
//             Buttons
//         =========================================== */}

//         <View style={styles.buttonRow}>

//           {/* VIEW */}

//           <TouchableOpacity
//             style={styles.viewBtn}
//             activeOpacity={0.85}
//             onPress={() =>
//               navigation.navigate(
//                 "AdminTutorDetailScreen",
//                 {
//                   tutorId: item.tutorId,
//                 }
//               )
//             }
//           >
//             <Icon
//               name="visibility"
//               size={17}
//               color="#fff"
//             />

//             <Text style={styles.buttonText}>
//               View
//             </Text>
//           </TouchableOpacity>

//           {/* APPROVE */}

//           <TouchableOpacity
//             style={[
//               styles.approveBtn,
//               isLoading && styles.disabledButton,
//             ]}
//             activeOpacity={0.85}
//             disabled={isLoading}
//             onPress={() => confirmApprove(item)}
//           >
//             {isLoading ? (
//               <ActivityIndicator
//                 size="small"
//                 color="#fff"
//               />
//             ) : (
//               <>
//                 <Icon
//                   name="check"
//                   size={17}
//                   color="#fff"
//                 />

//                 <Text style={styles.buttonText}>
//                   Approve
//                 </Text>
//               </>
//             )}
//           </TouchableOpacity>

//           {/* REJECT */}

//           <TouchableOpacity
//             style={[
//               styles.rejectBtn,
//               isLoading && styles.disabledButton,
//             ]}
//             activeOpacity={0.85}
//             disabled={isLoading}
//             onPress={() => confirmReject(item)}
//           >
//             <Icon
//               name="close"
//               size={17}
//               color="#fff"
//             />

//             <Text style={styles.buttonText}>
//               Reject
//             </Text>
//           </TouchableOpacity>

//           {/* BLOCK */}

//           <TouchableOpacity
//             style={[
//               styles.blockBtn,
//               isLoading && styles.disabledButton,
//             ]}
//             activeOpacity={0.85}
//             disabled={isLoading}
//             onPress={() => confirmBlock(item)}
//           >
//             <Icon
//               name="block"
//               size={17}
//               color="#fff"
//             />

//             <Text style={styles.buttonText}>
//               Block
//             </Text>
//           </TouchableOpacity>

//         </View>
//       </View>
//     );
//   };

//   //==================================================
//   // LOADING
//   //==================================================

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loaderContainer}>
//         <StatusBar
//           barStyle="dark-content"
//           backgroundColor="#FFFFFF"
//         />

//         <ActivityIndicator
//           size="large"
//           color={colors.primary}
//         />

//         <Text style={styles.loadingText}>
//           Loading tutors...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   //==================================================
//   // MAIN UI
//   //==================================================

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#FFFFFF"
//       />

//       {/* ==========================================
//           HEADER
//       =========================================== */}

//       <View style={styles.header}>

//         <TouchableOpacity
//           style={styles.headerButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Icon
//             name="arrow-back"
//             size={24}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logo}
//             resizeMode="contain"
//           />

//           <Text style={styles.headerTitle}>
//             Tutor Management
//           </Text>
//         </View>

//         <TouchableOpacity
//           style={styles.headerButton}
//           onPress={fetchTutors}
//         >
//           <Icon
//             name="refresh"
//             size={24}
//             color={colors.primary}
//           />
//         </TouchableOpacity>

//       </View>

//       {/* ==========================================
//           SCREEN TITLE
//       =========================================== */}

//       <View style={styles.titleContainer}>
//         <View>
//           <Text style={styles.screenTitle}>
//             All Tutors
//           </Text>

//           <Text style={styles.screenSubtitle}>
//             {tutors.length}{" "}
//             {tutors.length === 1
//               ? "tutor"
//               : "tutors"}{" "}
//             registered
//           </Text>
//         </View>

//         <View style={styles.totalBadge}>
//           <Icon
//             name="groups"
//             size={20}
//             color={colors.primary}
//           />

//           <Text style={styles.totalText}>
//             {tutors.length}
//           </Text>
//         </View>
//       </View>

//       {/* ==========================================
//           TUTOR LIST
//       =========================================== */}

//       <FlatList
//         data={tutors}
//         keyExtractor={(item) =>
//           item.tutorId.toString()
//         }
//         renderItem={renderItem}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={[colors.primary]}
//           />
//         }
//         contentContainerStyle={
//           tutors.length === 0
//             ? styles.emptyList
//             : styles.listContent
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>

//             <Icon
//               name="groups"
//               size={75}
//               color="#BBBBBB"
//             />

//             <Text style={styles.emptyTitle}>
//               No Tutors Available
//             </Text>

//             <Text style={styles.emptySubtitle}>
//               No tutor records were found.
//             </Text>

//             <TouchableOpacity
//               style={styles.refreshEmptyButton}
//               onPress={fetchTutors}
//             >
//               <Icon
//                 name="refresh"
//                 size={19}
//                 color="#fff"
//               />

//               <Text style={styles.refreshEmptyText}>
//                 Refresh
//               </Text>
//             </TouchableOpacity>

//           </View>
//         }
//       />

//       {/* ==========================================
//           BOTTOM NAVIGATION
//       =========================================== */}

//       <View style={styles.bottomNav}>

//         {/* HOME */}

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("AdminHome")
//           }
//         >
//           <Icon
//             name="home"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.navText}>
//             Home
//           </Text>
//         </TouchableOpacity>

//         {/* TEACHER */}

//         <TouchableOpacity
//           style={styles.navItem}
//         >
//           <Icon
//             name="groups"
//             size={24}
//             color={colors.primary}
//           />

//           <Text style={styles.navTextActive}>
//             Teacher
//           </Text>
//         </TouchableOpacity>

//         {/* STUDENT */}

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("AdminStudent")
//           }
//         >
//           <Icon
//             name="school"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.navText}>
//             Student
//           </Text>
//         </TouchableOpacity>

//         {/* SUBJECT */}

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() =>
//             navigation.navigate("AdminSubject")
//           }
//         >
//           <Icon
//             name="menu-book"
//             size={24}
//             color="#999"
//           />

//           <Text style={styles.navText}>
//             Subject
//           </Text>
//         </TouchableOpacity>

//       </View>
//     </SafeAreaView>
//   );
// };

// export default AdminTutorScreen;

// //====================================================
// // STYLES
// //====================================================

// const styles = StyleSheet.create({

//   //==================================================
//   // CONTAINER
//   //==================================================

//   container: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//     paddingHorizontal: 15,
//   },

//   //==================================================
//   // HEADER
//   //==================================================

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     backgroundColor: "#FFFFFF",
//     marginHorizontal: -15,
//     paddingHorizontal: 15,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   headerButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F1F3F6",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   headerCenter: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   logo: {
//     width: 80,
//     height: 35,
//   },

//   headerTitle: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: colors.primary,
//     marginTop: -2,
//   },

//   //==================================================
//   // TITLE
//   //==================================================

//   titleContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginVertical: 15,
//   },

//   screenTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#1B1B1B",
//   },

//   screenSubtitle: {
//     fontSize: 12,
//     color: "#8A94A6",
//     marginTop: 3,
//   },

//   totalBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#EEF3FF",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },

//   totalText: {
//     marginLeft: 5,
//     color: colors.primary,
//     fontSize: 15,
//     fontWeight: "800",
//   },

//   //==================================================
//   // LIST
//   //==================================================

//   listContent: {
//     paddingBottom: 100,
//   },

//   emptyList: {
//     flexGrow: 1,
//     paddingBottom: 100,
//   },

//   //==================================================
//   // CARD
//   //==================================================

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 17,
//     padding: 16,
//     marginBottom: 15,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//   },

//   //==================================================
//   // TUTOR HEADER
//   //==================================================

//   tutorHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatarContainer: {
//     width: 58,
//     height: 58,
//     borderRadius: 29,
//     backgroundColor: "#EEF3FF",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 11,
//   },

//   info: {
//     flex: 1,
//     marginRight: 7,
//   },

//   name: {
//     fontSize: 17,
//     fontWeight: "800",
//     color: "#1B1B1B",
//   },

//   tutorId: {
//     fontSize: 11,
//     color: "#8A94A6",
//     marginTop: 3,
//   },

//   qualification: {
//     fontSize: 13,
//     color: "#555",
//     marginTop: 4,
//     fontWeight: "500",
//   },

//   //==================================================
//   // STATUS
//   //==================================================

//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 9,
//     paddingVertical: 6,
//     borderRadius: 18,
//   },

//   statusBadgeText: {
//     color: "#FFFFFF",
//     fontSize: 10,
//     fontWeight: "800",
//     marginLeft: 4,
//   },

//   //==================================================
//   // DIVIDER
//   //==================================================

//   divider: {
//     height: 1,
//     backgroundColor: "#EEF1F5",
//     marginVertical: 15,
//   },

//   //==================================================
//   // DETAILS
//   //==================================================

//   detailRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 10,
//   },

//   iconBox: {
//     width: 34,
//     height: 34,
//     borderRadius: 17,
//     backgroundColor: "#F1F4FF",
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 10,
//   },

//   detailContent: {
//     flex: 1,
//   },

//   detailLabel: {
//     fontSize: 10,
//     color: "#8A94A6",
//     marginBottom: 2,
//   },

//   detailValue: {
//     fontSize: 13,
//     color: "#333333",
//     fontWeight: "600",
//   },

//   //==================================================
//   // COORDINATES
//   //==================================================

//   coordinateRow: {
//     flexDirection: "row",
//     marginTop: 2,
//     marginBottom: 5,
//   },

//   coordinateBox: {
//     flex: 1,
//     backgroundColor: "#F8F9FB",
//     borderRadius: 9,
//     padding: 10,
//     marginHorizontal: 3,
//   },

//   coordinateLabel: {
//     fontSize: 10,
//     color: "#8A94A6",
//   },

//   coordinateValue: {
//     fontSize: 12,
//     color: "#333333",
//     fontWeight: "700",
//     marginTop: 3,
//   },

//   //==================================================
//   // BUTTONS
//   //==================================================

//   buttonRow: {
//     flexDirection: "row",
//     marginTop: 15,
//   },

//   viewBtn: {
//     flex: 1,
//     backgroundColor: "#2196F3",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     marginHorizontal: 2,
//     elevation: 2,
//   },

//   approveBtn: {
//     flex: 1,
//     backgroundColor: "#4CAF50",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     marginHorizontal: 2,
//     elevation: 2,
//   },

//   rejectBtn: {
//     flex: 1,
//     backgroundColor: "#FF9800",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     marginHorizontal: 2,
//     elevation: 2,
//   },

//   blockBtn: {
//     flex: 1,
//     backgroundColor: "#F44336",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     flexDirection: "row",
//     marginHorizontal: 2,
//     elevation: 2,
//   },

//   disabledButton: {
//     opacity: 0.6,
//   },

//   buttonText: {
//     color: "#FFFFFF",
//     fontSize: 11,
//     fontWeight: "700",
//     marginLeft: 3,
//   },

//   //==================================================
//   // LOADING
//   //==================================================

//   loaderContainer: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   loadingText: {
//     marginTop: 12,
//     color: "#777777",
//     fontSize: 14,
//     fontWeight: "600",
//   },

//   //==================================================
//   // EMPTY
//   //==================================================

//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 25,
//   },

//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#333",
//     marginTop: 15,
//   },

//   emptySubtitle: {
//     fontSize: 13,
//     color: "#888",
//     marginTop: 6,
//     textAlign: "center",
//   },

//   refreshEmptyButton: {
//     marginTop: 18,
//     backgroundColor: colors.primary,
//     borderRadius: 10,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   refreshEmptyText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "700",
//     marginLeft: 6,
//   },

//   //==================================================
//   // BOTTOM NAV
//   //==================================================

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 9,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 0.5,
//     borderColor: "#DDD",
//     elevation: 10,
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     minWidth: 60,
//   },

//   navText: {
//     fontSize: 11,
//     color: "#999",
//     marginTop: 2,
//   },

//   navTextActive: {
//     fontSize: 11,
//     color: colors.primary,
//     fontWeight: "700",
//     marginTop: 2,
//   },
// });

















// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StatusBar,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const AdminTutorScreen = ({ navigation }) => {
//   const [tutors, setTutors] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // ================= FETCH TUTORS API =================
//   const fetchTutors = async () => {
//     try {
//       setLoading(true);

//       const response = await fetch(
//         `${BASE_URL}/Admin/all-tutors`,
//       );

//       const result = await response.json();

//       if (response.ok) {
//         setTutors(result);
//       } else {
//         Alert.alert("Error", "Failed to load tutors");
//       }
//     } catch (error) {
//       console.log("Fetch Tutors Error:", error);
//       Alert.alert("Error", "Unable to connect to server");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ================= ACTION API =================
//   const handleTutorAction = async (id, action) => {
//     try {
//       const response = await fetch(
//         `${BASE_URL}/Admin/${action}/${id}`,
//         {
//           method: "PUT",
//         }
//       );

//       if (response.ok) {
//         Alert.alert("Success", `Tutor ${action}d successfully`);
//         fetchTutors();
//       } else {
//         Alert.alert("Error", `Failed to ${action} tutor`);
//       }
//     } catch (error) {
//       console.log(`${action} Tutor Error:`, error);
//       Alert.alert("Error", "Unable to connect to server");
//     }
//   };

//   const renderStars = (rating) => {
//     return Array.from({ length: 5 }).map((_, index) => (
//       <Icon
//         key={index}
//         name="star"
//         size={16}
//         color={index < rating ? "#FFC107" : "#ddd"}
//       />
//     ));
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.row}>
//         <Image
//           source={{
//             uri:
//               item.profileImage ||
//               "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
//           }}
//           style={styles.avatar}
//         />

//         <View style={styles.info}>
//           <Text style={styles.name}>{item.fullName}</Text>
//           <Text style={styles.subText}>
//             Subjects: {item.subjects || "Not Assigned"}
//           </Text>

//           <View style={styles.ratingRow}>
//             {renderStars(item.rating)}
//             <Text style={styles.ratingText}> ({item.rating})</Text>
//           </View>

//           <Text style={styles.statusText}>
//             Status: {item.status || "Pending"}
//           </Text>
//         </View>
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonRow}>
//         <ActionButton
//           title="View"
//           onPress={() =>
//             navigation.navigate("TutorProfile", {
//               tutorId: item.id,
//             })
//           }
//         />

//         <ActionButton
//           title="Approve"
//           onPress={() => handleTutorAction(item.id, "approve")}
//         />

//         <ActionButton
//           title="Reject"
//           onPress={() => handleTutorAction(item.id, "reject")}
//         />

//         <ActionButton
//           title="Block"
//           onPress={() => handleTutorAction(item.id, "block")}
//         />

//         <ActionButton
//           title="Remove"
//           onPress={() => handleTutorAction(item.id, "remove")}
//         />
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <TouchableOpacity onPress={fetchTutors}>
//           <Icon name="refresh" size={24} color={colors.primary} />
//         </TouchableOpacity>
//       </View>

//       {/* Title */}
//       <Text style={styles.screenTitle}>Tutor Management</Text>

//       {/* List */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       ) : (
//         <FlatList
//           data={tutors}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={{ paddingBottom: 100 }}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <Text style={styles.emptyText}>No tutors available</Text>
//           }
//         />
//       )}

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("AdminHome")}
//         >
//           <Icon name="home" size={24} color="#999" />
//           <Text style={styles.navText}>Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="groups" size={24} color={colors.primary} />
//           <Text style={styles.navTextActive}>Teacher</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("AdminStudent")}
//         >
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.navText}>Student</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("AdminSubject")}
//         >
//           <Icon name="menu-book" size={24} color="#999" />
//           <Text style={styles.navText}>Subject</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AdminTutorScreen;

// /* ---------- Button ---------- */
// const ActionButton = ({ title, onPress }) => (
//   <TouchableOpacity style={styles.button} onPress={onPress}>
//     <Text style={styles.buttonText}>{title}</Text>
//   </TouchableOpacity>
// );

// /* ---------- Styles ---------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   screenTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginVertical: 15,
//     color: "#333",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 18,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 4,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//   },

//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: "#000",
//   },

//   subText: {
//     fontSize: 14,
//     color: "#555",
//     marginVertical: 2,
//   },

//   ratingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },

//   ratingText: {
//     marginLeft: 5,
//     color: "#444",
//   },

//   statusText: {
//     fontSize: 13,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 4,
//   },

//   buttonRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 12,
//   },

//   button: {
//     backgroundColor: colors.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 12,
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     textAlign: "center",
//     marginTop: 40,
//     fontSize: 15,
//     color: "#777",
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 0.5,
//     borderColor: "#ddd",
//   },

//   navItem: {
//     alignItems: "center",
//   },

//   navText: {
//     fontSize: 12,
//     color: "#999",
//     marginTop: 2,
//   },

//   navTextActive: {
//     fontSize: 12,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },
// });
















































// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import colors from "../utils/colors";

// const tutors = [
//   {
//     id: "1",
//     name: "Mesam Abbas",
//     subjects: "OOP, AP",
//     rating: 4,
//     image: require("../../../assets/images/user1.png"),
//   },
//   {
//     id: "2",
//     name: "Faizan Shahid",
//     subjects: "English, HCICG",
//     rating: 3,
//     image: require("../../../assets/images/user2.png"),
//   },
//   {
//     id: "3",
//     name: "Maryam Bibi",
//     subjects: "CN, PF",
//     rating: 5,
//     image: require("../../../assets/images/user3.png"),
//   },
// ];

// const AdminTutorScreen = ({ navigation }) => {
//   const renderStars = (rating) => {
//     return Array.from({ length: 5 }).map((_, index) => (
//       <Icon
//         key={index}
//         name="star"
//         size={16}
//         color={index < rating ? "#FFC107" : "#ddd"}
//       />
//     ));
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <View style={styles.row}>
//         <Image source={item.image} style={styles.avatar} />

//         <View style={styles.info}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.subText}>
//             Subjects: {item.subjects}
//           </Text>

//           <View style={styles.ratingRow}>
//             {renderStars(item.rating)}
//             <Text style={styles.ratingText}> ({item.rating})</Text>
//           </View>
//         </View>
//       </View>

//       {/* Buttons */}
//       <View style={styles.buttonRow}>
//         <ActionButton title="View" />
//         <ActionButton title="Approve" />
//         <ActionButton title="Reject" />
//         <ActionButton title="Block" />
//         <ActionButton title="Remove" />
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back" size={26} color={colors.primary} />
//         </TouchableOpacity>

//         <Image
//           source={require("../../../assets/images/logo.png")}
//           style={styles.logo}
//           resizeMode="contain"
//         />

//         <View style={{ width: 26 }} />
//       </View>

//       {/* Title */}
//       <Text style={styles.screenTitle}>Tutor Management</Text>

//       {/* List */}
//       <FlatList
//         data={tutors}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={{ paddingBottom: 100 }}
//         showsVerticalScrollIndicator={false}
//       />

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("AdminHome")}
//         >
//           <Icon name="home" size={24} color="#999" />
//           <Text style={styles.navText}>Home</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem}>
//           <Icon name="groups" size={24} color={colors.primary} />
//           <Text style={styles.navTextActive}>Teacher</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("AdminStudent")}
//         >
//           <Icon name="school" size={24} color="#999" />
//           <Text style={styles.navText}>Student</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("AdminSubject")}
//         >
//           <Icon name="menu-book" size={24} color="#999" />
//           <Text style={styles.navText}>Subject</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default AdminTutorScreen;

// /* ---------- Button ---------- */
// const ActionButton = ({ title, onPress }) => (
//   <TouchableOpacity style={styles.button} onPress={onPress}>
//     <Text style={styles.buttonText}>{title}</Text>
//   </TouchableOpacity>
// );

// /* ---------- Styles ---------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDE7F6",
//     paddingHorizontal: 16,
//   },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginTop: 40,
//   },

//   logo: {
//     width: 120,
//     height: 45,
//   },

//   screenTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginVertical: 15,
//     color: "#333",
//   },

//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 18,
//     padding: 15,
//     marginBottom: 15,
//     elevation: 4,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   avatar: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 12,
//   },

//   info: {
//     flex: 1,
//   },

//   name: {
//     fontSize: 17,
//     fontWeight: "700",
//     color: "#000",
//   },

//   subText: {
//     fontSize: 14,
//     color: "#555",
//     marginVertical: 2,
//   },

//   ratingRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },

//   ratingText: {
//     marginLeft: 5,
//     color: "#444",
//   },

//   buttonRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginTop: 12,
//   },

//   button: {
//     backgroundColor: colors.primary,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 8,
//     marginBottom: 8,
//   },

//   buttonText: {
//     color: "#fff",
//     fontSize: 12,
//   },

//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "#fff",
//     borderTopWidth: 0.5,
//     borderColor: "#ddd",
//   },

//   navItem: {
//     alignItems: "center",
//   },

//   navText: {
//     fontSize: 12,
//     color: "#999",
//     marginTop: 2,
//   },

//   navTextActive: {
//     fontSize: 12,
//     color: colors.primary,
//     fontWeight: "600",
//     marginTop: 2,
//   },
// });