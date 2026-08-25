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
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const ParentChildSchedule = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-schedule/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Schedule:", response.data);

      setSchedule(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Child Schedule Error:", error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child schedule."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, []);

  // Header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Icon name="arrow-back" size={22} color="#1E293B" />
      </TouchableOpacity>

      <Image
        source={require("../../../assets/images/logo.png")}
        style={styles.logo}
      />

      <View style={styles.headerSpacer} />
    </View>
  );

  // Schedule Card
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.dayContainer}>
          <View style={styles.calendarDot} />

          <Text
            style={styles.dayText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.day || "Day not specified"}
          </Text>
        </View>

        {item.type ? (
          <View style={styles.typeBadge}>
            <Text
              style={styles.typeBadgeText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.type}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Schedule Details */}
      <View style={styles.cardBody}>
        {/* Time */}
        <View style={styles.timeBanner}>
          <Icon
            name="time-outline"
            size={18}
            color={colors.primary}
          />

          <Text
            style={styles.timeText}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.time || "Time not specified"}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Dates */}
        <View style={styles.dateRow}>
          {/* Start Date */}
          <View style={styles.dateColumn}>
            <View style={styles.dateLabelRow}>
              <Icon
                name="play-circle-outline"
                size={14}
                color="#10B981"
              />

              <Text style={styles.dateLabel}>START DATE</Text>
            </View>

            <Text
              style={styles.dateValue}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.startDate || "-"}
            </Text>
          </View>

          {/* Divider */}
          <View style={styles.verticalDivider} />

          {/* End Date */}
          <View style={styles.dateColumn}>
            <View style={styles.dateLabelRow}>
              <Icon
                name="stop-circle-outline"
                size={14}
                color="#EF4444"
              />

              <Text style={styles.dateLabel}>END DATE</Text>
            </View>

            <Text
              style={styles.dateValue}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.endDate || "-"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Loading
  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
        onStartShouldSetResponder={() => false}
      >
        {renderHeader()}

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading schedule...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <FlatList
        data={schedule}
        keyExtractor={(item, index) =>
          item.scheduleId
            ? item.scheduleId.toString()
            : index.toString()
        }
        renderItem={renderItem}

        /* IMPORTANT:
           Keep the list strictly vertical.
        */
        horizontal={false}
        directionalLockEnabled={true}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}

        /* Prevent RTL/horizontal direction behavior */
        contentContainerStyle={[
          styles.listContainer,
          schedule.length === 0 && styles.emptyListContainer,
        ]}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            enabled={true}
          />
        }

        ListHeaderComponent={
          <View style={styles.titleSection}>
            <Text style={styles.screenTitle}>
              Child Schedule
            </Text>

            <Text style={styles.screenSubtitle}>
              Weekly breakdown and session durations
            </Text>
          </View>
        }

        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <Icon
                name="calendar-outline"
                size={56}
                color="#A0AEC0"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Schedule Found
            </Text>

            <Text style={styles.emptySubtitle}>
              There are no scheduled sessions registered for
              this child at the moment.
            </Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchSchedule}
              activeOpacity={0.8}
            >
              <Icon
                name="refresh"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />

              <Text style={styles.retryButtonText}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ParentChildSchedule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },

  /* Header */
  header: {
    width: "100%",
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },

      android: {
        elevation: 2,
      },
    }),
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },

  logo: {
    width: 96,
    height: 38,
    resizeMode: "contain",
  },

  headerSpacer: {
    width: 40,
  },

  /* Title */
  titleSection: {
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 4,
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },

  screenSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 3,
  },

  /* List */
  listContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  emptyListContainer: {
    flexGrow: 1,
  },

  /* Card */
  card: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },

      android: {
        elevation: 2,
      },
    }),
  },

  /* Card Header */
  cardHeader: {
    width: "100%",
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  dayContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  calendarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 10,
  },

  dayText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  typeBadge: {
    maxWidth: 110,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },

  typeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    textTransform: "capitalize",
  },

  /* Card Body */
  cardBody: {
    width: "100%",
    padding: 16,
  },

  timeBanner: {
    width: "100%",
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  timeText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  /* Dates */
  dateRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  dateColumn: {
    flex: 1,
    minWidth: 0,
  },

  dateLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  dateLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    marginLeft: 6,
    letterSpacing: 0.5,
  },

  dateValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 10,
  },

  /* Loading */
  loadingContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },

  /* Empty */
  emptyContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
