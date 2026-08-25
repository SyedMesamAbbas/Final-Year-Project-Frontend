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
  Platform,
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
      if (navigation.openDrawer) {
        navigation.openDrawer();
        return;
      }

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
  // GET APPROVED TUTORS
  // =========================================================
  const fetchApprovedTutors = useCallback(async () => {
    try {
      setLoading(true);

      const token =
        await AsyncStorage.getItem("token");

      const url =
        `${BASE_URL}/Admin/approved-tutors`;

      console.log(
        "Fetching Approved Tutors:",
        url
      );

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Accept: "application/json",

          ...(token
            ? {
                Authorization:
                  `Bearer ${token}`,
              }
            : {}),
        },
      });

      let data = [];

      try {
        data = await response.json();
      } catch (jsonError) {
        console.log(
          "Approved Tutors JSON Error:",
          jsonError
        );
      }

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
        setTutors([]);
        return;
      }

      // =====================================================
      // Normalize backend response
      // =====================================================
      const formattedTutors = data.map(
        (item) => ({
          id:
            item?.id ??
            item?.Id,

          fullName:
            item?.fullName ??
            item?.FullName ??
            "Unknown Tutor",

          status:
            item?.status ??
            item?.Status ??
            "Approved",
        })
      );

      console.log(
        "Formatted Approved Tutors:",
        formattedTutors
      );

      setTutors(formattedTutors);
    } catch (error) {
      console.log(
        "Fetch Approved Tutors Error:",
        error
      );

      setTutors([]);

      Alert.alert(
        "Error",
        error?.message ||
          "Unable to load approved tutors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // =========================================================
  // LOAD SCREEN
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
    if (
      id === null ||
      id === undefined
    ) {
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
  const handleRejectTutor = (
    id,
    name
  ) => {
    if (
      id === null ||
      id === undefined
    ) {
      Alert.alert(
        "Error",
        "Tutor ID is missing."
      );

      return;
    }

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

              const url =
                `${BASE_URL}/Admin/reject-tutor/${id}`;

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
                          Authorization:
                            `Bearer ${token}`,
                        }
                      : {}),
                  },
                });

              let data = {};

              try {
                data =
                  await response.json();
              } catch (jsonError) {
                console.log(
                  "Reject JSON Error:",
                  jsonError
                );
              }

              console.log(
                "Reject Tutor Response:",
                data
              );

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

              // Remove rejected tutor
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
                error?.message ||
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
  const handleBlockTutor = (
    id,
    name
  ) => {
    if (
      id === null ||
      id === undefined
    ) {
      Alert.alert(
        "Error",
        "Tutor ID is missing."
      );

      return;
    }

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

              const url =
                `${BASE_URL}/Admin/block-tutor/${id}`;

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
                          Authorization:
                            `Bearer ${token}`,
                        }
                      : {}),
                  },
                });

              let data = {};

              try {
                data =
                  await response.json();
              } catch (jsonError) {
                console.log(
                  "Block JSON Error:",
                  jsonError
                );
              }

              console.log(
                "Block Tutor Response:",
                data
              );

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

              // Remove blocked tutor
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
                error?.message ||
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
  // GET INITIALS
  // =========================================================
  const getInitials = (name) => {
    if (!name) {
      return "TU";
    }

    const parts =
      name.trim().split(/\s+/);

    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`
        .toUpperCase();
    }

    return name
      .slice(0, 2)
      .toUpperCase();
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

    const tutorName =
      item.fullName ||
      "Unknown Tutor";

    const tutorStatus =
      item.status ||
      "Approved";

    return (
      <View style={styles.card}>
        {/* =================================================
            HEADER
            ================================================= */}
        <View style={styles.cardHeader}>
          {/* AVATAR */}
          <View
            style={[
              styles.avatar,
              {
                backgroundColor:
                  `${primaryColor}15`,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarInitials,
                {
                  color:
                    primaryColor,
                },
              ]}
            >
              {getInitials(
                tutorName
              )}
            </Text>
          </View>

          {/* NAME + STATUS */}
          <View style={styles.headerInfo}>
            <Text
              style={styles.tutorName}
              numberOfLines={1}
            >
              {tutorName}
            </Text>

            <View
              style={styles.badgeRow}
            >
              <View
                style={
                  styles.statusBadge
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
                  {tutorStatus}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =================================================
            TUTOR INFORMATION
            ================================================= */}
        <View
          style={
            styles.infoContainer
          }
        >
          {/* <View
            style={styles.infoRow}
          >
            <Icon
              name="person"
              size={18}
              color={primaryColor}
            />

            <View
              style={
                styles.infoTextContainer
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Tutor Name
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {tutorName}
              </Text>
            </View>
          </View> */}

          <View
            style={styles.infoRow}
          >
            <Icon
              name="verified"
              size={18}
              color="#16A34A"
            />

            <View
              style={
                styles.infoTextContainer
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Status
              </Text>

              <Text
                style={
                  styles.infoValue
                }
              >
                {tutorStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            ACTION BUTTONS
            ================================================= */}
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
            activeOpacity={0.85}
          >
            <Icon
              name="visibility"
              size={16}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.viewButtonText
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
                tutorName
              )
            }
            disabled={
              isRejecting ||
              isBlocking
            }
            activeOpacity={0.85}
          >
            {isRejecting ? (
              <ActivityIndicator
                size="small"
                color="#D97706"
              />
            ) : (
              <>
                <Icon
                  name="cancel"
                  size={16}
                  color="#D97706"
                />

                <Text
                  style={
                    styles.rejectButtonText
                  }
                >
                  Reject
                </Text>
              </>
            )}
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
                tutorName
              )
            }
            disabled={
              isRejecting ||
              isBlocking
            }
            activeOpacity={0.85}
          >
            {isBlocking ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <>
                <Icon
                  name="block"
                  size={16}
                  color="#DC2626"
                />

                <Text
                  style={
                    styles.blockButtonText
                  }
                >
                  Block
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================
  // LOADING STATE
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

        <View
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.headerSide}
            onPress={
              openAdminDrawer
            }
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <Icon
              name="menu"
              size={24}
              color="#1E293B"
            />
          </TouchableOpacity>

          <Image
            source={require(
              "../../../assets/images/logo.png"
            )}
            style={
              styles.headerLogo
            }
            resizeMode="contain"
          />

          <View
            style={styles.headerSide}
          />
        </View>

        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={primaryColor}
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Fetching tutor directory...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =========================================================
  // MAIN RENDER
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
          TOP NAVBAR
          ===================================================== */}
      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.headerSide}
          onPress={
            openAdminDrawer
          }
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Icon
            name="menu"
            size={24}
            color="#1E293B"
          />
        </TouchableOpacity>

        <Image
          source={require(
            "../../../assets/images/logo.png"
          )}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <View
          style={styles.headerSide}
        />
      </View>

      {/* =====================================================
          LIST
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
            refreshing={refreshing}
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
                size={42}
                color="#94A3B8"
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
              approved tutors in the
              directory.
            </Text>
          </View>
        }
      />

      {/* =====================================================
          BOTTOM NAVIGATION
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
            size={22}
            color="#94A3B8"
          />

          <Text
            style={styles.navText}
          >
            Home
          </Text>
        </TouchableOpacity>

        {/* TUTORS */}
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
                  `${primaryColor}12`,
              },
            ]}
          >
            <Icon
              name="groups"
              size={22}
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
            Tutors
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
            size={22}
            color="#94A3B8"
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
            size={22}
            color="#94A3B8"
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =======================================================
  // HEADER
  // =======================================================
  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.03,
        shadowRadius: 8,
      },

      android: {
        elevation: 2,
      },
    }),
  },

  headerSide: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerLogo: {
    width: 120,
    height: 38,
  },

  // =======================================================
  // LIST
  // =======================================================
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },

  // =======================================================
  // CARD
  // =======================================================
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },

      android: {
        elevation: 3,
      },
    }),
  },

  // =======================================================
  // CARD HEADER
  // =======================================================
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarInitials: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },

  tutorName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
    marginRight: 5,
  },

  statusText: {
    fontSize: 11,
    color: "#15803D",
    fontWeight: "600",
  },

  // =======================================================
  // TUTOR INFORMATION
  // =======================================================
  infoContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },

  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  // =======================================================
  // ACTION BUTTONS
  // =======================================================
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },

  button: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  viewButton: {
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  rejectButton: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  rejectButtonText: {
    color: "#D97706",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  blockButton: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  blockButtonText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  // =======================================================
  // LOADING
  // =======================================================
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  // =======================================================
  // EMPTY
  // =======================================================
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },

  emptyText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  // =======================================================
  // BOTTOM NAVIGATION
  // =======================================================
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingBottom:
      Platform.OS === "ios"
        ? 12
        : 0,

    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: {
          width: 0,
          height: -4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },

      android: {
        elevation: 8,
      },
    }),
  },

  navItem: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  activeIconContainer: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 2,
  },

  navText: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
    marginTop: 2,
  },

  navTextActive: {
    fontWeight: "700",
  },
});

export default AdminApprovedTutor;
