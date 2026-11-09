
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../config/api";

const PRIMARY = colors.primary || "#1E8E7E";

const TutorStudentRequest = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // =========================================
  // DATE FORMAT
  // =========================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    const value = String(date).split("T")[0];

    if (!value || value === "null") return "Not available";

    const parts = value.split("-");

    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    return value;
  };

  // =========================================
  // FETCH REQUESTS
  // =========================================

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Session Expired", "Please login again.");
        setRequests([]);
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/my-requests`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await response.text();

      console.log("TUTOR REQUEST API RESPONSE:", text);

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        throw new Error("Invalid response received from server.");
      }

      if (response.ok && data.success) {
        setRequests(Array.isArray(data.data) ? data.data : []);
      } else {
        setRequests([]);
        Alert.alert(
          "Error",
          data.message || "Failed to load student requests."
        );
      }
    } catch (error) {
      console.log("FETCH REQUEST ERROR:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchRequests();
    });

    return unsubscribe;
  }, [navigation, fetchRequests]);

  // =========================================
  // ACCEPT REQUEST
  // =========================================

  const handleAccept = async (id) => {
    if (!id || processingId !== null) return;

    Alert.alert(
      "Accept Request",
      "Are you sure you want to accept this student request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: async () => {
            try {
              setProcessingId(id);

              const token = await AsyncStorage.getItem("token");

              const response = await fetch(
                `${BASE_URL}/Tutor/accept-request/${id}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              const text = await response.text();
              let data = {};

              try {
                data = text ? JSON.parse(text) : {};
              } catch (e) {
                data = {};
              }

              if (response.ok) {
                Alert.alert(
                  "Success",
                  data.message || "Request accepted successfully."
                );

                setRequests((prev) =>
                  prev.filter(
                    (item) => Number(item.request_id) !== Number(id)
                  )
                );
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed to accept request."
                );
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // =========================================
  // REJECT REQUEST
  // =========================================

  const handleReject = async (id) => {
    if (!id || processingId !== null) return;

    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this student request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(id);

              const token = await AsyncStorage.getItem("token");

              const response = await fetch(
                `${BASE_URL}/Tutor/reject-request/${id}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                  },
                }
              );

              const text = await response.text();
              let data = {};

              try {
                data = text ? JSON.parse(text) : {};
              } catch (e) {
                data = {};
              }

              if (response.ok) {
                Alert.alert(
                  "Rejected",
                  data.message || "Request declined successfully."
                );

                setRequests((prev) =>
                  prev.filter(
                    (item) => Number(item.request_id) !== Number(id)
                  )
                );
              } else {
                Alert.alert(
                  "Error",
                  data.message || "Failed to decline request."
                );
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // =========================================
  // VIEW STUDENT PROFILE
  // =========================================

  const handleSeeProfile = (item) => {
    if (!item.student_id) {
      Alert.alert("Error", "Student ID not found.");
      return;
    }

    navigation.navigate("StudentProfile", {
      studentId: item.student_id,
    });
  };

  // =========================================
  // REUSABLE DETAIL ROW
  // =========================================

  const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={16} color={PRIMARY} />
      </View>

      <Text style={styles.detailLabel}>{label}</Text>

      <Text style={styles.detailValue}>
        {value !== null && value !== undefined && value !== ""
          ? String(value)
          : "Not available"}
      </Text>
    </View>
  );

  // =========================================
  // COURSE PLAN SECTION
  // =========================================

  const renderCoursePlan = (item) => {
    const planType =
      String(item.plan_type || "Normal").toLowerCase();

    const isAccelerated =
      planType === "accelerated";

    return (
      <View style={styles.planContainer}>
        {/* PLAN HEADER */}

        <View style={styles.planHeader}>
          <View style={styles.planTitleGroup}>
            <Icon
              name={isAccelerated ? "bolt" : "menu-book"}
              size={21}
              color={isAccelerated ? "#D97706" : PRIMARY}
            />

            <Text style={styles.planTitle}>
              Course Completion Plan
            </Text>
          </View>

          <View
            style={[
              styles.planBadge,
              isAccelerated
                ? styles.acceleratedBadge
                : styles.normalBadge,
            ]}
          >
            <Text
              style={[
                styles.planBadgeText,
                isAccelerated
                  ? styles.acceleratedBadgeText
                  : styles.normalBadgeText,
              ]}
            >
              {isAccelerated ? "ACCELERATED" : "NORMAL"}
            </Text>
          </View>
        </View>

        {isAccelerated ? (
          <>
            <Text style={styles.planDescription}>
              The student has requested to complete this course in a
              shorter period with more classes per week.
            </Text>

            <Text style={styles.sectionSmallTitle}>
              Standard Course Plan
            </Text>

            <View style={styles.planStatsRow}>
              <View style={styles.planStatBox}>
                <Icon name="date-range" size={20} color="#64748B" />

                <Text style={styles.planStatNumber}>
                  {item.original_duration_weeks ?? "-"}
                </Text>

                <Text style={styles.planStatLabel}>
                  Weeks
                </Text>
              </View>

              <View style={styles.planStatBox}>
                <Icon name="event-available" size={20} color="#64748B" />

                <Text style={styles.planStatNumber}>
                  {item.original_classes_per_week ?? "-"}
                </Text>

                <Text style={styles.planStatLabel}>
                  Classes / Week
                </Text>
              </View>
            </View>

            <View style={styles.planDivider} />

            <Text style={styles.sectionSmallTitle}>
              Student's Requested Plan
            </Text>

            <View style={styles.planStatsRow}>
              <View style={[styles.planStatBox, styles.requestedStatBox]}>
                <Icon name="date-range" size={20} color="#D97706" />

                <Text style={[styles.planStatNumber, styles.requestedNumber]}>
                  {item.requested_duration_weeks ?? "-"}
                </Text>

                <Text style={styles.planStatLabel}>
                  Weeks
                </Text>
              </View>

              <View style={[styles.planStatBox, styles.requestedStatBox]}>
                <Icon name="event-available" size={20} color="#D97706" />

                <Text style={[styles.planStatNumber, styles.requestedNumber]}>
                  {item.requested_classes_per_week ?? "-"}
                </Text>

                <Text style={styles.planStatLabel}>
                  Classes / Week
                </Text>
              </View>
            </View>

            <View style={styles.totalClassesBox}>
              <Icon name="school" size={20} color={PRIMARY} />

              <View style={{ flex: 1 }}>
                <Text style={styles.totalClassesLabel}>
                  Total Course Classes
                </Text>

                <Text style={styles.totalClassesValue}>
                  {item.total_classes ?? "Not available"} Classes
                </Text>
              </View>
            </View>

            <View style={styles.planDivider} />

            <DetailRow
              icon="event"
              label="Start Date"
              value={formatDate(item.plan_start_date)}
            />

            <DetailRow
              icon="event-available"
              label="Target End Date"
              value={formatDate(item.target_end_date)}
            />

            <DetailRow
              icon="info"
              label="Plan Status"
              value={item.plan_status || "Pending"}
            />

            <DetailRow
              icon="schedule"
              label="Class Duration"
              value={
                item.class_duration_minutes
                  ? `${item.class_duration_minutes} minutes`
                  : "Not configured"
              }
            />

            {item.tutor_remarks ? (
              <View style={styles.remarksBox}>
                <Text style={styles.remarksTitle}>
                  Tutor Remarks
                </Text>

                <Text style={styles.remarksText}>
                  {item.tutor_remarks}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <Text style={styles.planDescription}>
              This is a normal course completion request.
            </Text>

            <DetailRow
              icon="date-range"
              label="Standard Duration"
              value={
                item.standard_duration_weeks
                  ? `${item.standard_duration_weeks} weeks`
                  : "Not configured"
              }
            />

            <DetailRow
              icon="event-available"
              label="Classes Per Week"
              value={
                item.standard_classes_per_week
                  ? `${item.standard_classes_per_week} classes`
                  : "Not configured"
              }
            />
          </>
        )}
      </View>
    );
  };

  // =========================================
  // REQUEST CARD
  // =========================================

  const renderItem = ({ item }) => {
    const isProcessing =
      Number(processingId) === Number(item.request_id);

    return (
      <View style={styles.card}>
        {/* CARD HEADER */}

        <View style={styles.cardHeader}>
          <View style={styles.studentInfoGroup}>
            <View style={styles.avatarCircle}>
              <Icon name="person" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.studentTextGroup}>
              <Text style={styles.studentName}>
                {item.student_name || "Unknown Student"}
              </Text>

              <Text style={styles.requestSubtext}>
                Teaching Request
              </Text>
            </View>
          </View>

          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>
              {item.course_name || "Unknown Course"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* REQUEST DETAILS */}

        <Text style={styles.sectionHeading}>
          Request Information
        </Text>

        <View style={styles.detailsContainer}>
          <DetailRow
            icon="mark-email-read"
            label="Requested On"
            value={formatDate(item.request_date)}
          />

          <DetailRow
            icon="event"
            label="Class Date"
            value={formatDate(item.class_date)}
          />

          <DetailRow
            icon="schedule"
            label="Schedule"
            value={`${item.day || "N/A"} • ${item.time || "N/A"}`}
          />

          <DetailRow
            icon="category"
            label="Request Type"
            value={item.request_type || "Normal"}
          />

          <DetailRow
            icon="school"
            label="Learning Mode"
            value={item.learning_mode || "N/A"}
          />

          {item.learning_mode === "SpecificTime" && (
            <DetailRow
              icon="timer"
              label="Learning Duration"
              value={
                item.learning_duration
                  ? `${item.learning_duration} ${
                      item.learning_duration_unit || ""
                    }`
                  : "N/A"
              }
            />
          )}

          <DetailRow
            icon="format-list-numbered"
            label="Tutor Sequence"
            value={item.tutor_sequence ?? "N/A"}
          />

          <DetailRow
            icon="hourglass-bottom"
            label="Response Deadline"
            value={
              item.response_deadline
                ? formatDate(item.response_deadline) +
                  " " +
                  String(item.response_deadline).split("T")[1]?.slice(0, 5)
                : "N/A"
            }
          />
        </View>

        {/* COURSE PLAN */}

        {renderCoursePlan(item)}

        {/* STUDENT CONTACT INFORMATION */}

        <View style={styles.contactContainer}>
          <Text style={styles.sectionHeading}>
            Student Information
          </Text>

          <DetailRow
            icon="person"
            label="Student Name"
            value={item.student_name}
          />

          <DetailRow
            icon="email"
            label="Email"
            value={item.student_email}
          />

          <DetailRow
            icon="phone"
            label="Phone"
            value={item.student_phone}
          />
        </View>

        {/* ACTION BUTTONS */}

        <View style={styles.actionContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.profileBtn}
            onPress={() => handleSeeProfile(item)}
          >
            <Icon name="account-circle" size={19} color={PRIMARY} />

            <Text style={styles.profileBtnText}>
              View Student Profile
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.acceptBtn,
                isProcessing && styles.disabledButton,
              ]}
              disabled={processingId !== null}
              onPress={() => handleAccept(item.request_id)}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="check-circle" size={17} color="#FFFFFF" />

                  <Text style={styles.acceptText}>
                    Accept Request
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.declineBtn,
                isProcessing && styles.disabledButton,
              ]}
              disabled={processingId !== null}
              onPress={() => handleReject(item.request_id)}
            >
              <Icon name="cancel" size={17} color="#EF4444" />

              <Text style={styles.declineText}>
                Decline
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // =========================================
  // MAIN SCREEN
  // =========================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => navigation.navigate("TutorDrawer")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="menu" size={23} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => fetchRequests(true)}
        >
          <Icon name="refresh" size={21} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* LOADING */}

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />

          <Text style={styles.loadingText}>
            Fetching student requests...
          </Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.request_id)}
          renderItem={renderItem}
          extraData={processingId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRequests(true)}
              colors={[PRIMARY]}
            />
          }
          contentContainerStyle={
            requests.length === 0
              ? styles.flexGrow
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.screenTitle}>
                    Student Requests
                  </Text>

                  <Text style={styles.screenSubtitle}>
                    Review incoming teaching requests and course plans.
                  </Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {requests.length}
                  </Text>
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Icon name="inbox" size={40} color="#94A3B8" />
              </View>

              <Text style={styles.emptyTitle}>
                No Pending Requests
              </Text>

              <Text style={styles.emptySubtitle}>
                You currently have no new teaching requests. Check back later.
              </Text>

              <TouchableOpacity
                style={styles.emptyRefreshBtn}
                onPress={() => fetchRequests(true)}
              >
                <Icon name="refresh" size={17} color="#FFFFFF" />

                <Text style={styles.emptyRefreshText}>
                  Refresh Requests
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TutorHome")}
        >
          <Icon name="calendar-month" size={22} color="#94A3B8" />

          <Text style={styles.inactiveTab}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeTabIndicator}>
            <Icon name="description" size={22} color={PRIMARY} />

            <Text style={styles.activeTab}>
              Request
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TutorTodayClasses")}
        >
          <Icon name="school" size={22} color="#94A3B8" />

          <Text style={styles.inactiveTab}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("TutorAddSubject")}
        >
          <Icon name="add-box" size={22} color="#94A3B8" />

          <Text style={styles.inactiveTab}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TutorStudentRequest;

// =============================================
// STYLES
// =============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loaderContainer: {
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

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginRight: 8,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: PRIMARY,
    letterSpacing: -0.2,
  },

  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDFA",
  },

  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  screenSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "400",
  },

  countBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#E0F2F1",
    alignItems: "center",
    justifyContent: "center",
  },

  countBadgeText: {
    fontSize: 15,
    fontWeight: "800",
    color: PRIMARY,
  },

  listContent: {
    paddingBottom: 110,
  },

  flexGrow: {
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 7,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  studentInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  studentTextGroup: {
    flex: 1,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  requestSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  courseBadge: {
    backgroundColor: "#E0F2F1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#B2DFDB",
    maxWidth: 130,
  },

  courseBadgeText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },

  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 9,
  },

  detailsContainer: {
    backgroundColor: "#F8FAFC",
    padding: 11,
    borderRadius: 12,
    marginBottom: 14,
    gap: 9,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 27,
  },

  iconWrap: {
    width: 27,
    height: 27,
    borderRadius: 7,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  detailLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    width: 108,
  },

  detailValue: {
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },

  // COURSE PLAN

  planContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE7E6",
    borderRadius: 13,
    padding: 13,
    marginBottom: 15,
  },

  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  planTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 7,
  },

  planTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },

  planBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  acceleratedBadge: {
    backgroundColor: "#FEF3C7",
  },

  normalBadge: {
    backgroundColor: "#CCFBF1",
  },

  planBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  acceleratedBadgeText: {
    color: "#B45309",
  },

  normalBadgeText: {
    color: "#0F766E",
  },

  planDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
    marginBottom: 12,
  },

  sectionSmallTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 9,
  },

  planStatsRow: {
    flexDirection: "row",
    gap: 10,
  },

  planStatBox: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  requestedStatBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  planStatNumber: {
    fontSize: 21,
    fontWeight: "800",
    color: "#334155",
  },

  requestedNumber: {
    color: "#B45309",
  },

  planStatLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  planDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 13,
  },

  totalClassesBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#CCFBF1",
  },

  totalClassesLabel: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "600",
  },

  totalClassesValue: {
    fontSize: 15,
    color: PRIMARY,
    fontWeight: "800",
    marginTop: 2,
  },

  remarksBox: {
    backgroundColor: "#F8FAFC",
    padding: 11,
    borderRadius: 9,
    marginTop: 12,
  },

  remarksTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 4,
  },

  remarksText: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },

  contactContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 9,
  },

  actionContainer: {
    gap: 10,
  },

  profileBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: PRIMARY + "55",
    gap: 7,
  },

  profileBtnText: {
    color: PRIMARY,
    fontWeight: "700",
    fontSize: 13,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  acceptBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },

  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },

  disabledButton: {
    opacity: 0.55,
  },

  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },

  declineText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 12,
  },

  // EMPTY STATE

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },

  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 7,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
  },

  emptyRefreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 9,
    marginTop: 17,
    gap: 7,
  },

  emptyRefreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // BOTTOM NAVIGATION

  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  activeTabIndicator: {
    alignItems: "center",
  },

  activeTab: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY,
    marginTop: 2,
  },

  inactiveTab: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
  },
});
