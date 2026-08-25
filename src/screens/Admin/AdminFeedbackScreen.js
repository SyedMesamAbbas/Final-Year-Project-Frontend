import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

// Theme Fallbacks
const PRIMARY_COLOR = colors?.primary || "#4F46E5";
const PRIMARY_LIGHT = "#EEF2FF";
const BG_COLOR = "#F8FAFC";
const CARD_BG = "#FFFFFF";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";
const BORDER_COLOR = "#E2E8F0";
const DANGER_COLOR = "#EF4444";
const DANGER_LIGHT = "#FEF2F2";
const STAR_COLOR = "#F59E0B";

const AdminFeedbackScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState(0); // 0 = All

  // ================= FETCH FEEDBACK =================

  const fetchFeedback = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(`${BASE_URL}/Admin/all-feedback`);
      setData(response.data || []);
    } catch (error) {
      console.log(
        "Feedback Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load feedback."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ================= DELETE FEEDBACK =================

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Feedback",
      "Are you sure you want to permanently delete this feedback entry?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                `${BASE_URL}/Admin/delete-feedback/${id}`
              );

              Alert.alert(
                "Success",
                "Feedback deleted successfully."
              );

              fetchFeedback();
            } catch (error) {
              console.log(
                "Delete Error:",
                error.response?.data || error.message
              );

              Alert.alert(
                "Error",
                error.response?.data?.message ||
                  "Failed to delete feedback."
              );
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  // ================= COMPUTED METRICS =================

  const metrics = useMemo(() => {
    if (!data.length) return { total: 0, avgRating: "0.0", positivePercentage: "0%" };
    const total = data.length;
    const sumRating = data.reduce((acc, item) => acc + (Number(item.rating) || 0), 0);
    const avg = (sumRating / total).toFixed(1);
    const positiveCount = data.filter((item) => Number(item.rating) >= 4).length;
    const posPct = Math.round((positiveCount / total) * 100);

    return {
      total,
      avgRating: avg,
      positivePercentage: `${posPct}%`,
    };
  }, [data]);

  // ================= FILTERED DATA =================

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const studentMatch = item.studentName?.toLowerCase().includes(searchQuery.toLowerCase());
      const tutorMatch = item.tutorName?.toLowerCase().includes(searchQuery.toLowerCase());
      const textMatch = item.feedbackText?.toLowerCase().includes(searchQuery.toLowerCase());
      const feedbackByMatch = item.feedbackBy?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSearch = studentMatch || tutorMatch || textMatch || feedbackByMatch;
      const matchesRating = selectedRatingFilter === 0 || Number(item.rating) === selectedRatingFilter;

      return matchesSearch && matchesRating;
    });
  }, [data, searchQuery, selectedRatingFilter]);

  // Helper for rendering initials avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Render Stars Component
  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;
    return (
      <View style={styles.starsContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Icon
            key={index}
            name={index < numericRating ? "star" : "star-border"}
            size={18}
            color={index < numericRating ? STAR_COLOR : "#CBD5E1"}
          />
        ))}
      </View>
    );
  };

  // Render List Header (Summary KPI & Filter Controls)
  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* KPI Stats Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBadge, { backgroundColor: "#EEF2FF" }]}>
            <Icon name="rate-review" size={20} color={PRIMARY_COLOR} />
          </View>
          <Text style={styles.kpiValue}>{metrics.total}</Text>
          <Text style={styles.kpiLabel}>Total Reviews</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBadge, { backgroundColor: "#FEF3C7" }]}>
            <Icon name="star" size={20} color={STAR_COLOR} />
          </View>
          <Text style={styles.kpiValue}>{metrics.avgRating}</Text>
          <Text style={styles.kpiLabel}>Avg Rating</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBadge, { backgroundColor: "#DCFCE7" }]}>
            <Icon name="thumb-up" size={20} color="#16A34A" />
          </View>
          <Text style={styles.kpiValue}>{metrics.positivePercentage}</Text>
          <Text style={styles.kpiLabel}>Positive</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <Icon name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by student, tutor, or keywords..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {searchQuery !== "" && Platform.OS !== "ios" && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon name="close" size={18} color={TEXT_MUTED} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rating Filter Pills */}
      <View style={styles.filterPillsContainer}>
        {[0, 5, 4, 3, 2, 1].map((stars) => {
          const isActive = selectedRatingFilter === stars;
          return (
            <TouchableOpacity
              key={stars}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
              ]}
              onPress={() => setSelectedRatingFilter(stars)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                {stars === 0 ? "All" : `${stars} ★`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // Render Feedback Card Item
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Top Header Row: User Info & Delete Action */}
      <View style={styles.topRow}>
        <View style={styles.userInfoWrapper}>
          {/* Avatar Circle */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(item.studentName)}
            </Text>
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.name} numberOfLines={1}>
              {item.studentName || "Anonymous Student"}
            </Text>
            
            <View style={styles.metaRow}>
              <Icon name="person-outline" size={13} color={TEXT_MUTED} />
              <Text style={styles.tutor} numberOfLines={1}>
                Tutor: <Text style={styles.highlightText}>{item.tutorName || "N/A"}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Delete Action Button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.id)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete-outline" color={DANGER_COLOR} size={20} />
        </TouchableOpacity>
      </View>

      {/* Feedback Role / Origin Badge */}
      {Boolean(item.feedbackBy) && (
        <View style={styles.badgeRow}>
          <View style={styles.feedbackByBadge}>
            <Icon name="assignment-ind" size={12} color={PRIMARY_COLOR} />
            <Text style={styles.feedbackByText}>
              By: {item.feedbackBy}
            </Text>
          </View>
        </View>
      )}

      {/* Feedback Body Content */}
      <Text style={styles.feedback}>
        {item.feedbackText || "No detailed comments provided."}
      </Text>

      {/* Footer Row: Rating Stars & Numerical Score Badge */}
      <View style={styles.cardFooter}>
        {renderStars(item.rating)}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>
            {item.rating ? `${item.rating}.0` : "0.0"}
          </Text>
          <Text style={styles.scoreMaxText}>/ 5</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />

      {/* Top App Bar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back-ios" size={18} color={TEXT_DARK} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.refreshIconButton}
          onPress={() => fetchFeedback(true)}
          activeOpacity={0.7}
        >
          <Icon name="refresh" size={22} color={TEXT_MUTED} />
        </TouchableOpacity>
      </View>

      {/* Screen Title Bar */}
      <View style={styles.titleSection}>
        <Text style={styles.screenTitle}>Feedback Management</Text>
        <Text style={styles.screenSubtitle}>
          Review student ratings and detailed feedback
        </Text>
      </View>

      {/* Body Content / Loader */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          <Text style={styles.loadingText}>Loading feedback records...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) =>
            (item.id ?? index).toString()
          }
          renderItem={renderItem}
          ListHeaderComponent={renderListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchFeedback(true)}
              colors={[PRIMARY_COLOR]}
              tintColor={PRIMARY_COLOR}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Icon name="rate-review" size={42} color={TEXT_MUTED} />
              </View>
              <Text style={styles.emptyTitle}>No Feedback Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery || selectedRatingFilter !== 0
                  ? "Try clearing your search query or changing filters."
                  : "There are currently no feedback submissions recorded."}
              </Text>
              {(searchQuery !== "" || selectedRatingFilter !== 0) && (
                <TouchableOpacity
                  style={styles.resetFilterButton}
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedRatingFilter(0);
                  }}
                >
                  <Text style={styles.resetFilterButtonText}>Reset Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default AdminFeedbackScreen;

// ================= STYLES =================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },

  /* Header Bar */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 12 : 8,
    paddingBottom: 12,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BG_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  logo: {
    width: 110,
    height: 36,
  },

  refreshIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BG_COLOR,
    justifycontent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },

  /* Title Section */
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: -0.3,
  },

  screenSubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginTop: 2,
  },

  /* KPI Cards */
  listHeaderContainer: {
    marginBottom: 8,
  },

  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  kpiIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  kpiValue: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  kpiLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: TEXT_MUTED,
    marginTop: 2,
  },

  /* Search & Filter Bar */
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 12,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_DARK,
    paddingVertical: 0,
  },

  filterPillsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },

  filterPillActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },

  filterPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },

  filterPillTextActive: {
    color: "#FFFFFF",
  },

  /* Feedback Card */
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  userInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_LIGHT,
    justifycontent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },

  userDetails: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },

  tutor: {
    fontSize: 12,
    color: TEXT_MUTED,
  },

  highlightText: {
    color: TEXT_DARK,
    fontWeight: "600",
  },

  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: DANGER_LIGHT,
    justifycontent: "center",
    alignItems: "center",
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  feedbackByBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  feedbackByText: {
    fontSize: 11,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },

  feedback: {
    fontSize: 13.5,
    color: "#334155",
    lineHeight: 20,
    marginVertical: 12,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },

  scoreBadge: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  scoreText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
  },

  scoreMaxText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#D97706",
    marginLeft: 2,
  },

  /* Empty & Loading States */
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TEXT_MUTED,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_DARK,
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 18,
  },

  resetFilterButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 8,
  },

  resetFilterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },
});
