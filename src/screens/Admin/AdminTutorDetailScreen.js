import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Alert,
  Linking,
  Platform,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminTutorDetailScreen = ({ navigation, route }) => {
  const { tutorId } = route.params;

  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);

  useEffect(() => {
    fetchTutor();
  }, []);

  const fetchTutor = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/Admin/tutor/${tutorId}`
      );

      setTutor(response.data);
    } catch (error) {
      console.log(error.response?.data || error.message);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to load tutor details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Approved":
        return {
          color: "#059669",
          bgColor: "#ECFDF5",
          borderColor: "#A7F3D0",
          icon: "check-circle",
        };
      case "Rejected":
        return {
          color: "#DC2626",
          bgColor: "#FEF2F2",
          borderColor: "#FECACA",
          icon: "cancel",
        };
      case "Blocked":
        return {
          color: "#4B5563",
          bgColor: "#F3F4F6",
          borderColor: "#E5E7EB",
          icon: "block",
        };
      default:
        return {
          color: "#D97706",
          bgColor: "#FFFBEB",
          borderColor: "#FDE68A",
          icon: "hourglass-empty",
        };
    }
  };

  const handlePhonePress = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
          <Text style={styles.loaderText}>Fetching tutor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tutor) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <View style={styles.errorCard}>
          <Icon name="error-outline" size={56} color="#EF4444" />
          <Text style={styles.errorTitle}>Detail Load Failed</Text>
          <Text style={styles.errorSubText}>
            We couldn't retrieve the requested tutor details. Please check your connection or try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchTutor}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(tutor.status);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="arrow-back-ios"
            size={20}
            color={colors.primary || "#4F46E5"}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tutor Hero Banner / Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Icon
              name="account-circle"
              size={84}
              color={colors.primary || "#4F46E5"}
            />
          </View>

          <Text style={styles.name}>{tutor.fullName}</Text>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusConfig.bgColor,
                borderColor: statusConfig.borderColor,
              },
            ]}
          >
            <Icon
              name={statusConfig.icon}
              size={15}
              color={statusConfig.color}
              style={{ marginRight: 5 }}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {tutor.status || "Pending"}
            </Text>
          </View>

          {/* Action Chips for direct Contact */}
          <View style={styles.quickActionRow}>
            {tutor.phone ? (
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handlePhonePress(tutor.phone)}
                activeOpacity={0.7}
              >
                <Icon name="phone" size={16} color={colors.primary || "#4F46E5"} />
                <Text style={styles.actionChipText}>Call</Text>
              </TouchableOpacity>
            ) : null}

            {tutor.email ? (
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => handleEmailPress(tutor.email)}
                activeOpacity={0.7}
              >
                <Icon name="email" size={16} color={colors.primary || "#4F46E5"} />
                <Text style={styles.actionChipText}>Email</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Tutor Details Section */}
        <Text style={styles.sectionTitle}>General Information</Text>

        <View style={styles.infoCard}>
          <InfoRow
            icon="email"
            title="Email Address"
            value={tutor.email}
            onPress={() => handleEmailPress(tutor.email)}
          />
          <View style={styles.divider} />

          <InfoRow
            icon="phone"
            title="Phone Number"
            value={tutor.phone}
            onPress={() => handlePhonePress(tutor.phone)}
          />
          <View style={styles.divider} />

          <InfoRow
            icon="badge"
            title="CNIC / ID Number"
            value={tutor.cnic}
          />
          <View style={styles.divider} />

          <InfoRow
            icon="school"
            title="Qualification"
            value={tutor.qualification}
          />
          <View style={styles.divider} />

          <InfoRow
            icon="work-outline"
            title="Teaching Experience"
            value={
              tutor.experience !== null && tutor.experience !== undefined
                ? `${tutor.experience} ${
                    tutor.experience === 1 ? "Year" : "Years"
                  }`
                : null
            }
          />
          <View style={styles.divider} />

          <InfoRow
            icon="place"
            title="Primary Location"
            value={tutor.location}
          />
          <View style={styles.divider} />

          <InfoRow
            icon="explore"
            title="Teaching Radius"
            value={
              tutor.radius !== null && tutor.radius !== undefined
                ? `${tutor.radius} KM`
                : null
            }
            isLast
          />
        </View>

        {/* Subjects Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Teaching Subjects</Text>
          {tutor.subjects && tutor.subjects.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{tutor.subjects.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.subjectCard}>
          {tutor.subjects && tutor.subjects.length > 0 ? (
            <View style={styles.subjectContainer}>
              {tutor.subjects.map((subject, index) => (
                <View
                  key={`${subject}-${index}`}
                  style={styles.subjectChip}
                >
                  <Icon
                    name="book"
                    size={14}
                    color={colors.primary || "#4F46E5"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.subjectText}>{subject}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySubjectsContainer}>
              <Icon name="menu-book" size={32} color="#9CA3AF" />
              <Text style={styles.noDataText}>No subjects registered yet</Text>
            </View>
          )}
        </View>

        {/* Performance Overview */}
        <Text style={styles.sectionTitle}>Performance Overview</Text>

        <View style={styles.performanceCard}>
          {/* Rating */}
          <View style={styles.performanceItem}>
            <View style={[styles.kpiIconWrapper, { backgroundColor: "#FFFBEB" }]}>
              <Icon name="star" size={28} color="#F59E0B" />
            </View>
            <Text style={styles.performanceNumber}>
              {Number(tutor.rating || 0).toFixed(1)}
            </Text>
            <Text style={styles.performanceLabel}>Average Rating</Text>
          </View>

          {/* Vertical Divider */}
          <View style={styles.performanceDivider} />

          {/* Reviews */}
          <View style={styles.performanceItem}>
            <View
              style={[
                styles.kpiIconWrapper,
                { backgroundColor: "#EEF2FF" },
              ]}
            >
              <Icon
                name="rate-review"
                size={26}
                color={colors.primary || "#4F46E5"}
              />
            </View>
            <Text style={styles.performanceNumber}>
              {tutor.totalReviews || 0}
            </Text>
            <Text style={styles.performanceLabel}>Total Reviews</Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* Reusable Information Row Component */
const InfoRow = ({ icon, title, value, onPress, isLast }) => (
  <TouchableOpacity
    style={styles.infoRow}
    disabled={!onPress}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View style={styles.infoIconWrapper}>
      <Icon name={icon} size={20} color="#6B7280" />
    </View>

    <View style={styles.infoTextContainer}>
      <Text style={styles.label}>{title}</Text>
      <Text style={[styles.value, !value && styles.placeholderValue]}>
        {value || "Not provided"}
      </Text>
    </View>

    {onPress && value ? (
      <Icon name="chevron-right" size={20} color="#9CA3AF" />
    ) : null}
  </TouchableOpacity>
);

export default AdminTutorDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  /* Loader & Error Screens */
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 20,
  },
  loaderCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loaderText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "500",
    color: "#4B5563",
  },
  errorCard: {
    backgroundColor: "#FFFFFF",
    padding: 28,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
  },
  errorSubText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary || "#4F46E5",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#F8FAFC",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  logo: {
    width: 130,
    height: 40,
  },
  headerSpacer: {
    width: 40,
  },

  /* Scroll Area */
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 32,
  },

  /* Profile Card */
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  avatarWrapper: {
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusText: {
    fontWeight: "600",
    fontSize: 13,
  },
  quickActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    gap: 10,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary || "#4F46E5",
    marginLeft: 6,
  },

  /* Section Title */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 26,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
  },
  countBadge: {
    backgroundColor: colors.primary || "#4F46E5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  /* Information Card */
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  infoIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoTextContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  placeholderValue: {
    color: "#94A3B8",
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 52,
  },

  /* Subjects Section */
  subjectCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  subjectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  subjectText: {
    color: colors.primary || "#4F46E5",
    fontWeight: "600",
    fontSize: 14,
  },
  emptySubjectsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  noDataText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },

  /* Performance Card */
  performanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.03,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  performanceItem: {
    flex: 1,
    alignItems: "center",
  },
  kpiIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  performanceNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  performanceLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 2,
  },
  performanceDivider: {
    width: 1,
    height: 70,
    backgroundColor: "#F1F5F9",
  },

  bottomSpace: {
    height: 20,
  },
});
