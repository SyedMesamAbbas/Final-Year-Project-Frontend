import React, { useCallback, useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminApprovedTutor = () => {
  const navigation = useNavigation();

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const primaryColor = colors?.primary || "#4F46E5";

  // =========================================================
  // OPEN ADMIN DRAWER
  // =========================================================
  const openAdminDrawer = () => {
    try {
      // If this screen is inside DrawerNavigator
      if (navigation.openDrawer) {
        navigation.openDrawer();
        return;
      }

      // Fallback if AdminDrawer is registered as a screen
      navigation.navigate("AdminDrawer");
    } catch (error) {
      console.log("Admin Drawer Error:", error);

      Alert.alert(
        "Error",
        "Unable to open admin menu."
      );
    }
  };

  // =========================================================
  // GET ALL APPROVED TUTORS
  // =========================================================
  const fetchApprovedTutors = useCallback(async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const url = `${BASE_URL}/Admin/approved-tutors`;

      console.log("=================================");
      console.log("GET APPROVED TUTORS");
      console.log("URL:", url);
      console.log("=================================");

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",

          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      });

      console.log(
        "Approved Tutors Status:",
        response.status
      );

      const data = await response.json();

      console.log(
        "Approved Tutors Response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Server returned status ${response.status}`
        );
      }

      if (!Array.isArray(data)) {
        console.log(
          "Expected array but received:",
          data
        );

        setTutors([]);
        return;
      }

      setTutors(data);
    } catch (error) {
      console.log(
        "Fetch Approved Tutors Error:",
        error
      );

      setTutors([]);

      Alert.alert(
        "Error",
        error.message ||
          "Unable to load approved tutors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // SCREEN LOAD
  // =========================================================
  useEffect(() => {
    fetchApprovedTutors();
  }, [fetchApprovedTutors]);

  // =========================================================
  // REFRESH
  // =========================================================
  const onRefresh = () => {
    setRefreshing(true);
    fetchApprovedTutors();
  };

  // =========================================================
  // VIEW TUTOR
  // =========================================================
  const handleViewTutor = (id) => {
    if (!id) {
      Alert.alert(
        "Error",
        "Tutor ID is missing."
      );
      return;
    }

    navigation.navigate(
      "AdminTutorDetailScreen",
      {
        tutorId: id,
      }
    );
  };

  // =========================================================
  // REJECT TUTOR
  // =========================================================
  const handleRejectTutor = (id, name) => {
    Alert.alert(
      "Reject Tutor",
      `Are you sure you want to reject ${
        name || "this tutor"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Reject",
          style: "destructive",

          onPress: async () => {
            try {
              setActionLoading(
                `reject-${id}`
              );

              const token =
                await AsyncStorage.getItem(
                  "token"
                );

              const url = `${BASE_URL}/Admin/reject-tutor/${id}`;

              const response =
                await fetch(url, {
                  method: "PUT",

                  headers: {
                    Accept:
                      "application/json",

                    "Content-Type":
                      "application/json",

                    ...(token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : {}),
                  },
                });

              const data =
                await response.json();

              if (!response.ok) {
                throw new Error(
                  data?.message ||
                    data?.error ||
                    `Server returned status ${response.status}`
                );
              }

              Alert.alert(
                "Success",
                data?.message ||
                  "Tutor rejected successfully."
              );

              setTutors(
                (previousTutors) =>
                  previousTutors.filter(
                    (tutor) =>
                      Number(tutor.id) !==
                      Number(id)
                  )
              );
            } catch (error) {
              console.log(
                "Reject Tutor Error:",
                error
              );

              Alert.alert(
                "Error",
                error.message ||
                  "Unable to reject tutor."
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // BLOCK TUTOR
  // =========================================================
  const handleBlockTutor = (id, name) => {
    Alert.alert(
      "Block Tutor",
      `Are you sure you want to block ${
        name || "this tutor"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Block",
          style: "destructive",

          onPress: async () => {
            try {
              setActionLoading(
                `block-${id}`
              );

              const token =
                await AsyncStorage.getItem(
                  "token"
                );

              const url = `${BASE_URL}/Admin/block-tutor/${id}`;

              const response =
                await fetch(url, {
                  method: "PUT",

                  headers: {
                    Accept:
                      "application/json",

                    "Content-Type":
                      "application/json",

                    ...(token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : {}),
                  },
                });

              const data =
                await response.json();

              if (!response.ok) {
                throw new Error(
                  data?.message ||
                    data?.error ||
                    `Server returned status ${response.status}`
                );
              }

              Alert.alert(
                "Success",
                data?.message ||
                  "Tutor blocked successfully."
              );

              setTutors(
                (previousTutors) =>
                  previousTutors.filter(
                    (tutor) =>
                      Number(tutor.id) !==
                      Number(id)
                  )
              );
            } catch (error) {
              console.log(
                "Block Tutor Error:",
                error
              );

              Alert.alert(
                "Error",
                error.message ||
                  "Unable to block tutor."
              );
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // TUTOR CARD
  // =========================================================
  const renderTutor = ({ item }) => {
    const isRejecting =
      actionLoading ===
      `reject-${item.id}`;

    const isBlocking =
      actionLoading ===
      `block-${item.id}`;

    const subjects =
      Array.isArray(item.subjects) &&
      item.subjects.length > 0
        ? item.subjects.join(", ")
        : "No subjects";

    return (
      <View style={styles.card}>

        {/* CARD HEADER */}
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  primaryColor,
              },
            ]}
          >
            <Icon
              name="person"
              size={30}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.headerInfo}>
            <Text
              style={styles.tutorName}
              numberOfLines={1}
            >
              {item.fullName ||
                "Unknown Tutor"}
            </Text>

            <View
              style={
                styles.statusContainer
              }
            >
              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {item.status ||
                  "Approved"}
              </Text>
            </View>
          </View>
        </View>

        {/* SUBJECTS */}
        <View
          style={styles.infoRow}
        >
          <Icon
            name="school"
            size={20}
            color={primaryColor}
          />

          <View
            style={
              styles.infoContent
            }
          >
            <Text
              style={
                styles.infoLabel
              }
            >
              Subjects
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {subjects}
            </Text>
          </View>
        </View>

        {/* RATING / REVIEWS */}
        <View
          style={styles.statsRow}
        >
          <View
            style={styles.statBox}
          >
            <Icon
              name="star"
              size={20}
              color="#F59E0B"
            />

            <Text
              style={
                styles.statValue
              }
            >
              {Number(
                item.rating || 0
              ).toFixed(1)}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Rating
            </Text>
          </View>

          <View
            style={styles.divider}
          />

          <View
            style={styles.statBox}
          >
            <Icon
              name="rate-review"
              size={20}
              color={primaryColor}
            />

            <Text
              style={
                styles.statValue
              }
            >
              {item.totalReviews ||
                0}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Reviews
            </Text>
          </View>
        </View>

        {/* ACTION BUTTONS */}
        <View
          style={styles.buttonRow}
        >
          {/* VIEW */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.viewButton,
              {
                backgroundColor:
                  primaryColor,
              },
            ]}
            onPress={() =>
              handleViewTutor(
                item.id
              )
            }
            disabled={
              isRejecting ||
              isBlocking
            }
            activeOpacity={0.8}
          >
            <Icon
              name="visibility"
              size={18}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.buttonText
              }
            >
              View
            </Text>
          </TouchableOpacity>

          {/* REJECT */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.rejectButton,
            ]}
            onPress={() =>
              handleRejectTutor(
                item.id,
                item.fullName
              )
            }
            disabled={
              isRejecting ||
              isBlocking
            }
            activeOpacity={0.8}
          >
            {isRejecting ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Icon
                name="cancel"
                size={18}
                color="#FFFFFF"
              />
            )}

            <Text
              style={
                styles.buttonText
              }
            >
              {isRejecting
                ? "Rejecting..."
                : "Reject"}
            </Text>
          </TouchableOpacity>

          {/* BLOCK */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.blockButton,
            ]}
            onPress={() =>
              handleBlockTutor(
                item.id,
                item.fullName
              )
            }
            disabled={
              isRejecting ||
              isBlocking
            }
            activeOpacity={0.8}
          >
            {isBlocking ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Icon
                name="block"
                size={18}
                color="#FFFFFF"
              />
            )}

            <Text
              style={
                styles.buttonText
              }
            >
              {isBlocking
                ? "Blocking..."
                : "Block"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (loading) {
    return (
      <SafeAreaView
        style={styles.safeArea}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        {/* FIXED HEADER */}
        <View style={styles.header}>

          {/* LEFT DRAWER BUTTON */}
          <TouchableOpacity
            style={styles.headerSide}
            onPress={openAdminDrawer}
            activeOpacity={0.7}
          >
            <Icon
              name="menu"
              size={30}
              color={primaryColor}
            />
          </TouchableOpacity>

          {/* CENTER LOGO */}
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />

          {/* RIGHT SPACER */}
          <View
            style={styles.headerSide}
          />
        </View>

        <View
          style={styles.loadingContainer}
        >
          <ActivityIndicator
            size="large"
            color={primaryColor}
          />

          <Text
            style={styles.loadingText}
          >
            Loading approved tutors...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =========================================================
  // MAIN SCREEN
  // =========================================================
  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* =====================================================
          HEADER
      ===================================================== */}
      <View style={styles.header}>

        {/* LEFT - MENU */}
        <TouchableOpacity
          style={styles.headerSide}
          onPress={openAdminDrawer}
          activeOpacity={0.7}
        >
          <Icon
            name="menu"
            size={30}
            color={primaryColor}
          />
        </TouchableOpacity>

        {/* CENTER - APP LOGO */}
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        {/* RIGHT - EMPTY SPACE
            This keeps logo perfectly centered */}
        <View
          style={styles.headerSide}
        />
      </View>

      {/* =====================================================
          TUTOR LIST
      ===================================================== */}
      <FlatList
        data={tutors}
        keyExtractor={(
          item,
          index
        ) =>
          item?.id != null
            ? String(item.id)
            : String(index)
        }
        renderItem={renderTutor}
        contentContainerStyle={[
          styles.listContent,
          tutors.length === 0 &&
            styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={onRefresh}
            colors={[
              primaryColor,
            ]}
            tintColor={
              primaryColor
            }
          />
        }
        ListEmptyComponent={
          <View
            style={
              styles.emptyContainer
            }
          >
            <View
              style={
                styles.emptyIconContainer
              }
            >
              <Icon
                name="person-off"
                size={55}
                color="#9CA3AF"
              />
            </View>

            <Text
              style={
                styles.emptyTitle
              }
            >
              No Approved Tutors
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              There are currently no
              approved tutors.
            </Text>
          </View>
        }
      />

      {/* =====================================================
          FIXED BOTTOM NAVIGATION
      ===================================================== */}
      <View
        style={styles.bottomNav}
      >
        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "AdminHome"
            )
          }
        >
          <Icon
            name="home"
            size={25}
            color="#9CA3AF"
          />

          <Text
            style={styles.navText}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* TEACHER - ACTIVE */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={onRefresh}
        >
          <View
            style={[
              styles.activeIconContainer,
              {
                backgroundColor:
                  `${primaryColor}15`,
              },
            ]}
          >
            <Icon
              name="groups"
              size={25}
              color={primaryColor}
            />
          </View>

          <Text
            style={[
              styles.navText,
              styles.navTextActive,
              {
                color:
                  primaryColor,
              },
            ]}
          >
            Teacher
          </Text>
        </TouchableOpacity>

        {/* STUDENT */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "AdminStudent"
            )
          }
        >
          <Icon
            name="school"
            size={25}
            color="#9CA3AF"
          />

          <Text
            style={styles.navText}
          >
            Student
          </Text>
        </TouchableOpacity>

        {/* SUBJECT */}
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate(
              "AdminSubject"
            )
          }
        >
          <Icon
            name="menu-book"
            size={25}
            color="#9CA3AF"
          />

          <Text
            style={styles.navText}
          >
            Subject
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// =========================================================
// STYLES
// =========================================================
const styles = StyleSheet.create({

  // =======================================================
  // SCREEN
  // =======================================================
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  // =======================================================
  // HEADER
  // =======================================================
  header: {
    height: 68,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    paddingHorizontal: 16,

    borderBottomWidth: 1,

    borderBottomColor: "#E5E7EB",

    elevation: 3,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.06,

    shadowRadius: 3,

    position: "relative",
  },

  /*
   * Same width on both sides ensures
   * logo stays exactly in the center.
   */
  headerSide: {
    width: 45,

    height: 45,

    alignItems: "center",

    justifyContent: "center",
  },

  headerLogo: {
    width: 135,

    height: 48,

    position: "absolute",

    left: "50%",

    transform: [
      {
        translateX: -67.5,
      },
    ],
  },

  // =======================================================
  // LIST
  // =======================================================
  listContent: {
    padding: 15,

    paddingBottom: 105,
  },

  emptyListContent: {
    flexGrow: 1,

    paddingBottom: 105,
  },

  // =======================================================
  // CARD
  // =======================================================
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    marginBottom: 15,

    padding: 16,

    elevation: 3,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,

    shadowRadius: 5,
  },

  cardHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 16,
  },

  avatar: {
    width: 58,

    height: 58,

    borderRadius: 29,

    justifyContent: "center",

    alignItems: "center",
  },

  headerInfo: {
    flex: 1,

    marginLeft: 13,
  },

  tutorName: {
    fontSize: 18,

    fontWeight: "700",

    color: "#1F2937",
  },

  statusContainer: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 5,
  },

  statusDot: {
    width: 8,

    height: 8,

    borderRadius: 4,

    backgroundColor: "#22C55E",

    marginRight: 6,
  },

  statusText: {
    fontSize: 12,

    color: "#16A34A",

    fontWeight: "600",
  },

  // =======================================================
  // SUBJECTS
  // =======================================================
  infoRow: {
    flexDirection: "row",

    alignItems: "flex-start",

    backgroundColor: "#F8FAFC",

    borderRadius: 10,

    padding: 11,

    marginBottom: 12,
  },

  infoContent: {
    flex: 1,

    marginLeft: 10,
  },

  infoLabel: {
    fontSize: 11,

    color: "#6B7280",

    marginBottom: 3,
  },

  infoValue: {
    fontSize: 14,

    color: "#374151",

    fontWeight: "500",

    lineHeight: 20,
  },

  // =======================================================
  // STATS
  // =======================================================
  statsRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 15,
  },

  statBox: {
    flex: 1,

    alignItems: "center",

    flexDirection: "row",

    justifyContent: "center",
  },

  statValue: {
    fontSize: 16,

    fontWeight: "700",

    color: "#1F2937",

    marginLeft: 6,
  },

  statLabel: {
    fontSize: 12,

    color: "#6B7280",

    marginLeft: 5,
  },

  divider: {
    width: 1,

    height: 30,

    backgroundColor: "#E5E7EB",
  },

  // =======================================================
  // BUTTONS
  // =======================================================
  buttonRow: {
    flexDirection: "row",

    gap: 8,
  },

  button: {
    flex: 1,

    minHeight: 42,

    borderRadius: 9,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: 5,
  },

  viewButton: {
    backgroundColor: "#4F46E5",
  },

  rejectButton: {
    backgroundColor: "#F59E0B",
  },

  blockButton: {
    backgroundColor: "#DC2626",
  },

  buttonText: {
    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "700",

    marginLeft: 5,
  },

  // =======================================================
  // LOADING
  // =======================================================
  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F5F7FB",
  },

  loadingText: {
    marginTop: 12,

    fontSize: 14,

    color: "#6B7280",
  },

  // =======================================================
  // EMPTY
  // =======================================================
  emptyContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 30,
  },

  emptyIconContainer: {
    width: 100,

    height: 100,

    borderRadius: 50,

    backgroundColor: "#E5E7EB",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#374151",

    marginTop: 5,
  },

  emptyText: {
    fontSize: 14,

    color: "#9CA3AF",

    textAlign: "center",

    marginTop: 7,

    lineHeight: 20,
  },

  // =======================================================
  // BOTTOM NAVIGATION
  // =======================================================
  bottomNav: {
    position: "absolute",

    left: 0,

    right: 0,

    bottom: 0,

    height: 72,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    borderTopWidth: 1,

    borderTopColor: "#E5E7EB",

    elevation: 12,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: -3,
    },

    shadowOpacity: 0.08,

    shadowRadius: 6,

    paddingHorizontal: 5,

    paddingBottom: 3,
  },

  navItem: {
    flex: 1,

    height: 68,

    alignItems: "center",

    justifyContent: "center",
  },

  activeIconContainer: {
    width: 42,

    height: 32,

    borderRadius: 16,

    alignItems: "center",

    justifyContent: "center",

    marginBottom: 2,
  },

  navText: {
    fontSize: 11,

    color: "#9CA3AF",

    fontWeight: "500",

    marginTop: 2,
  },

  navTextActive: {
    fontWeight: "700",
  },
});

export default AdminApprovedTutor;