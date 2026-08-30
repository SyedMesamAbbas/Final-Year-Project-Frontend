import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  TextInput,
  Clipboard,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { BASE_URL } from "../../config/api";
import Colors from "../utils/colors";

//==================================================
// DESIGN SYSTEM
//==================================================

const Theme = {
  primary: Colors?.primary || "#4F46E5",
  primaryLight: "#EEF2FF",
  primaryDark: "#4338CA",

  background: "#F8FAFC",
  surface: "#FFFFFF",

  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderSubtle: "#F1F5F9",

  danger: "#EF4444",
  dangerLight: "#FEF2F2",
  dangerBorder: "#FCA5A5",

  success: "#10B981",
  successLight: "#ECFDF5",

  accent: "#6366F1",
};

//==================================================
// COMPONENT
//==================================================

const AdminBlockedTutors = () => {
  const navigation = useNavigation();

  //==================================================
  // STATES
  //==================================================

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  //==================================================
  // ERROR MESSAGE
  //==================================================

  const getErrorMessage = (error, defaultMessage) => {
    if (typeof error?.response?.data === "string") {
      return error.response.data;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.response?.data?.title) {
      return error.response.data.title;
    }

    if (error?.message) {
      return error.message;
    }

    return defaultMessage;
  };

  //==================================================
  // LOAD BLOCKED TUTORS
  //==================================================

  const loadBlockedTutors = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Login token not found. Please login again."
        );

        return;
      }

      console.log(
        "Loading blocked tutors from:",
        `${BASE_URL}/Admin/blocked-tutors`
      );

      const response = await axios.get(
        `${BASE_URL}/Admin/blocked-tutors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 15000,
        }
      );

      console.log(
        "Blocked Tutors API Response:",
        JSON.stringify(response.data, null, 2)
      );

      if (Array.isArray(response.data)) {
        setTutors(response.data);
      } else {
        console.log("Unexpected API response:", response.data);
        setTutors([]);
      }
    } catch (error) {
      console.log(
        "Get Blocked Tutors Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        getErrorMessage(
          error,
          "Unable to load blocked tutors."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  //==================================================
  // INITIAL LOAD
  //==================================================

  useEffect(() => {
    loadBlockedTutors();
  }, [loadBlockedTutors]);

  //==================================================
  // PULL TO REFRESH
  //==================================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBlockedTutors();
  }, [loadBlockedTutors]);

  //==================================================
  // FILTER TUTORS
  //==================================================

  const filteredTutors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return tutors;
    }

    return tutors.filter((item) => {
      const name = item?.fullName
        ? String(item.fullName).toLowerCase()
        : "";

      const email = item?.email
        ? String(item.email).toLowerCase()
        : "";

      const id = item?.id
        ? String(item.id).toLowerCase()
        : "";

      const phone = item?.phone
        ? String(item.phone).toLowerCase()
        : "";

      const cnic = item?.cnic
        ? String(item.cnic).toLowerCase()
        : "";

      const location = item?.location
        ? String(item.location).toLowerCase()
        : "";

      return (
        name.includes(query) ||
        email.includes(query) ||
        id.includes(query) ||
        phone.includes(query) ||
        cnic.includes(query) ||
        location.includes(query)
      );
    });
  }, [tutors, searchQuery]);

  //==================================================
  // COPY TO CLIPBOARD
  //==================================================

  const handleCopyText = (text, label) => {
    if (
      text === null ||
      text === undefined ||
      String(text).trim() === "" ||
      text === "Not Available"
    ) {
      return;
    }

    Clipboard.setString(String(text));

    if (Platform.OS === "android") {
      Alert.alert(
        "Copied",
        `${label} copied to clipboard.`
      );
    }
  };

  //==================================================
  // GET INITIALS
  //==================================================

  const getInitials = (name) => {
    if (!name) {
      return "TR";
    }

    const parts = String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return String(name)
      .substring(0, 2)
      .toUpperCase();
  };

  //==================================================
  // RESTORE CONFIRMATION
  //==================================================

  const confirmRestore = (tutor) => {
    Alert.alert(
      "Restore Access",
      `Are you sure you want to restore access for ${
        tutor?.fullName || "this tutor"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Restore Tutor",
          style: "default",
          onPress: () => restoreTutor(tutor),
        },
      ]
    );
  };

  //==================================================
  // RESTORE TUTOR
  //==================================================

  const restoreTutor = async (tutor) => {
    const tutorId = tutor?.id;

    if (!tutorId) {
      Alert.alert(
        "Error",
        "Tutor ID is missing. Cannot restore tutor."
      );

      return;
    }

    try {
      setRestoringId(tutorId);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "Authentication Error",
          "Login token not found. Please login again."
        );

        return;
      }

      const response = await axios.put(
        `${BASE_URL}/Admin/restore-tutors/${tutorId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          timeout: 15000,
        }
      );

      console.log(
        "Restore Tutor Response:",
        response.data
      );

      Alert.alert(
        "Tutor Restored",
        response.data?.message ||
          "Tutor account has been restored successfully."
      );

      // Remove restored tutor from current list
      setTutors((previousTutors) =>
        previousTutors.filter(
          (item) => item?.id !== tutorId
        )
      );
    } catch (error) {
      console.log(
        "Restore Tutor Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        getErrorMessage(
          error,
          "Unable to restore tutor."
        )
      );
    } finally {
      setRestoringId(null);
    }
  };

  //==================================================
  // RENDER INFORMATION ROW
  //==================================================

  const renderInfoRow = ({
    icon,
    label,
    value,
    copyable = false,
    numberOfLines = 1,
  }) => {
    const displayValue =
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
        ? String(value)
        : "Not Available";

    return (
      <TouchableOpacity
        activeOpacity={copyable ? 0.7 : 1}
        onPress={() => {
          if (copyable && displayValue !== "Not Available") {
            handleCopyText(displayValue, label);
          }
        }}
        style={styles.infoRow}
      >
        <View style={styles.infoIconContainer}>
          <Icon
            name={icon}
            size={15}
            color={Theme.primary}
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>
            {label}
          </Text>

          <Text
            style={[
              styles.infoValue,
              displayValue === "Not Available" &&
                styles.notAvailableText,
            ]}
            numberOfLines={numberOfLines}
          >
            {displayValue}
          </Text>
        </View>

        {copyable &&
          displayValue !== "Not Available" && (
            <Icon
              name="content-copy"
              size={14}
              color={Theme.textMuted}
            />
          )}
      </TouchableOpacity>
    );
  };

  //==================================================
  // RENDER TUTOR
  //==================================================

  const renderTutor = ({ item }) => {
    const tutorId = item?.id ?? "N/A";

    const isRestoring =
      restoringId === tutorId;

    const initials = getInitials(
      item?.fullName
    );

    return (
      <View style={styles.tutorCard}>
        {/*========================================
            CARD HEADER
        ========================================*/}

        <View style={styles.tutorHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {initials}
            </Text>
          </View>

          <View style={styles.tutorHeaderInfo}>
            <View style={styles.nameRow}>
              <Text
                style={styles.tutorName}
                numberOfLines={1}
              >
                {item?.fullName ||
                  "Unknown Tutor"}
              </Text>
            </View>

            <View style={styles.idChip}>
              <Icon
                name="fingerprint"
                size={12}
                color={Theme.textMuted}
              />

              <Text style={styles.tutorIdText}>
                ID: {tutorId}
              </Text>
            </View>
          </View>

          <View style={styles.blockedBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.blockedBadgeText}>
              Blocked
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/*========================================
            DETAILS
        ========================================*/}

        <View style={styles.detailsGrid}>
          {/* EMAIL */}

          {renderInfoRow({
            icon: "alternate-email",
            label: "Email Address",
            value: item?.email,
            copyable: true,
          })}

          {/* PHONE */}

          {renderInfoRow({
            icon: "phone",
            label: "Phone Number",
            value: item?.phone,
            copyable: true,
          })}

          {/* CNIC */}

          {renderInfoRow({
            icon: "badge",
            label: "CNIC",
            value: item?.cnic,
            copyable: true,
          })}

          {/* LOCATION */}

          {renderInfoRow({
            icon: "place",
            label: "Location / Address",
            value: item?.location,
            numberOfLines: 2,
          })}
        </View>

        {/*========================================
            RESTORE BUTTON
        ========================================*/}

        <TouchableOpacity
          style={[
            styles.restoreButton,
            isRestoring &&
              styles.restoreButtonDisabled,
          ]}
          activeOpacity={0.8}
          disabled={isRestoring}
          onPress={() =>
            confirmRestore(item)
          }
        >
          {isRestoring ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <>
              <Icon
                name="restore"
                size={18}
                color="#FFFFFF"
              />

              <Text
                style={styles.restoreButtonText}
              >
                Restore Tutor
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  //==================================================
  // LOADING SCREEN
  //==================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loaderContainer}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Theme.surface}
        />

        <View style={styles.loadingBox}>
          <ActivityIndicator
            size="large"
            color={Theme.primary}
          />

          <Text style={styles.loadingText}>
            Fetching blocked accounts...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  //==================================================
  // MAIN SCREEN
  //==================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Theme.surface}
      />

      {/*========================================
          HEADER
      ========================================*/}

      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() =>
            navigation.goBack()
          }
          hitSlop={{
            top: 8,
            bottom: 8,
            left: 8,
            right: 8,
          }}
          accessibilityLabel="Go Back"
        >
          <Icon
            name="arrow-back-ios"
            size={16}
            color={Theme.textPrimary}
            style={{ marginLeft: 5 }}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Blocked Tutors
          </Text>

          <Text style={styles.headerSubtitle}>
            Account Access Management
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={loadBlockedTutors}
          accessibilityLabel="Refresh list"
        >
          <Icon
            name="refresh"
            size={20}
            color={Theme.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/*========================================
          SEARCH
      ========================================*/}

      <View style={styles.toolbarContainer}>
        <View style={styles.searchBar}>
          <Icon
            name="search"
            size={20}
            color={Theme.textMuted}
            style={{ marginRight: 8 }}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, phone, CNIC or email..."
            placeholderTextColor={
              Theme.textMuted
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />

          {searchQuery.length > 0 &&
            Platform.OS !== "ios" && (
              <TouchableOpacity
                onPress={() =>
                  setSearchQuery("")
                }
              >
                <Icon
                  name="close"
                  size={18}
                  color={Theme.textMuted}
                />
              </TouchableOpacity>
            )}
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryBar}>
          <View style={styles.summaryBadge}>
            <Icon
              name="shield"
              size={14}
              color={Theme.danger}
            />

            <Text
              style={styles.summaryBadgeText}
            >
              {tutors.length} Total Blocked
            </Text>
          </View>

          {searchQuery.trim().length > 0 && (
            <Text
              style={styles.searchResultsCount}
            >
              Showing {filteredTutors.length} matches
            </Text>
          )}
        </View>
      </View>

      {/*========================================
          TUTOR LIST
      ========================================*/}

      <FlatList
        data={filteredTutors}
        keyExtractor={(item, index) =>
          item?.id?.toString() ||
          `tutor-${index}`
        }
        renderItem={renderTutor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredTutors.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Theme.primary]}
            tintColor={Theme.primary}
          />
        }
        ListEmptyComponent={
          <View
            style={styles.emptyContainer}
          >
            <View
              style={styles.emptyIconCircle}
            >
              <Icon
                name={
                  searchQuery
                    ? "search-off"
                    : "verified-user"
                }
                size={40}
                color={
                  searchQuery
                    ? Theme.textMuted
                    : Theme.success
                }
              />
            </View>

            <Text style={styles.emptyTitle}>
              {searchQuery
                ? "No Matching Results"
                : "No Blocked Tutors"}
            </Text>

            <Text style={styles.emptyText}>
              {searchQuery
                ? `No blocked tutors matched "${searchQuery}". Try another search.`
                : "All tutor accounts are currently active with full platform access."}
            </Text>

            {searchQuery ? (
              <TouchableOpacity
                style={
                  styles.emptyActionButton
                }
                onPress={() =>
                  setSearchQuery("")
                }
              >
                <Text
                  style={styles.emptyActionText}
                >
                  Clear Search Query
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={
                  styles.emptyActionButton
                }
                onPress={loadBlockedTutors}
              >
                <Icon
                  name="refresh"
                  size={18}
                  color="#FFFFFF"
                  style={{
                    marginRight: 6,
                  }}
                />

                <Text
                  style={styles.emptyActionText}
                >
                  Refresh Data
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminBlockedTutors;

//====================================================
// STYLESHEET
//====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },

  //==================================================
  // LOADER
  //==================================================

  loaderContainer: {
    flex: 1,
    backgroundColor: Theme.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingBox: {
    alignItems: "center",
    padding: 28,
    borderRadius: 20,
    backgroundColor: Theme.surface,
    elevation: 4,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    borderWidth: 1,
    borderColor: Theme.border,
  },

  loadingText: {
    marginTop: 14,
    color: Theme.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  //==================================================
  // HEADER
  //==================================================

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },

  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.background,
    borderWidth: 1,
    borderColor: Theme.border,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.textPrimary,
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 11,
    color: Theme.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },

  //==================================================
  // TOOLBAR
  //==================================================

  toolbarContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: Theme.border,
    shadowColor: "#0F172A",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.textPrimary,
    paddingVertical: 0,
    fontWeight: "400",
  },

  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },

  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.dangerBorder,
  },

  summaryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.danger,
    marginLeft: 6,
  },

  searchResultsCount: {
    fontSize: 12,
    color: Theme.textMuted,
    fontWeight: "500",
  },

  //==================================================
  // LIST
  //==================================================

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },

  //==================================================
  // TUTOR CARD
  //==================================================

  tutorCard: {
    backgroundColor: Theme.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    elevation: 2,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  tutorHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Theme.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: Theme.primary,
  },

  tutorHeaderInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  tutorName: {
    fontSize: 16,
    fontWeight: "700",
    color: Theme.textPrimary,
    letterSpacing: -0.2,
    flexShrink: 1,
  },

  idChip: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },

  tutorIdText: {
    fontSize: 12,
    color: Theme.textMuted,
    marginLeft: 4,
    fontWeight: "500",
  },

  blockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.dangerLight,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.dangerBorder,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.danger,
    marginRight: 5,
  },

  blockedBadgeText: {
    color: Theme.danger,
    fontSize: 11,
    fontWeight: "700",
  },

  //==================================================
  // DIVIDER
  //==================================================

  divider: {
    height: 1,
    backgroundColor: Theme.borderSubtle,
    marginVertical: 14,
  },

  //==================================================
  // DETAILS
  //==================================================

  detailsGrid: {
    gap: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.background,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Theme.borderSubtle,
  },

  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Theme.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: Theme.border,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: Theme.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  infoValue: {
    fontSize: 13,
    color: Theme.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },

  notAvailableText: {
    color: Theme.textMuted,
    fontWeight: "500",
  },

  //==================================================
  // RESTORE BUTTON
  //==================================================

  restoreButton: {
    marginTop: 14,
    backgroundColor: Theme.success,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: Theme.success,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  restoreButtonDisabled: {
    opacity: 0.6,
  },

  restoreButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  //==================================================
  // EMPTY STATE
  //==================================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Theme.textPrimary,
  },

  emptyText: {
    fontSize: 13,
    color: Theme.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    maxWidth: 290,
  },

  emptyActionButton: {
    marginTop: 20,
    backgroundColor: Theme.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Theme.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  emptyActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
