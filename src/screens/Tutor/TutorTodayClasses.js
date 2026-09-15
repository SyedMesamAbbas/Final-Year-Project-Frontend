import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TutorTodayClasses = ({ navigation }) => {
  const [classData, setClassData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);

  // Manual Schedule Modal
  const [manualModalVisible, setManualModalVisible] = useState(false);
  const [manualScheduleType, setManualScheduleType] = useState("");
  const [manualRequestId, setManualRequestId] = useState(null);

  const [manualDay, setManualDay] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualDate, setManualDate] = useState("");

  useEffect(() => {
    fetchTodayClasses();
  }, []);

  // ============================================================
  // FETCH TODAY CLASSES
  // ============================================================

  const fetchTodayClasses = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/today-classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      console.log("TODAY CLASSES:", result);

      if (response.ok && result.success) {
        setClassData(result.data || []);
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to load today's classes"
        );
      }
    } catch (error) {
      console.log("Fetch Today Classes Error:", error);

      Alert.alert(
        "Error",
        error.message || "Unable to load today's classes"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GET TOKEN
  // ============================================================

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Error", "User not logged in");
      return null;
    }

    return token;
  };

  // ============================================================
  // COMPLETE CLASS
  // PUT /Tutor/complete-class/{requestId}
  // ============================================================

  const completeClass = async (requestId) => {
    Alert.alert(
      "Complete Class",
      "Are you sure you want to mark this class as complete?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Complete",
          onPress: async () => {
            try {
              setActionLoading(true);
              setActiveRequestId(requestId);

              const token = await getToken();

              if (!token) {
                return;
              }

              const response = await fetch(
                `${BASE_URL}/Tutor/complete-class/${requestId}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const result = await response.json();

              console.log("COMPLETE CLASS RESPONSE:", result);

              if (response.ok && result.success) {
                Alert.alert(
                  "Success",
                  result.message || "Class completed successfully."
                );

                // Remove completed class from today's list
                setClassData((prevData) =>
                  prevData.filter(
                    (item) => item.request_id !== requestId
                  )
                );
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to complete class."
                );
              }
            } catch (error) {
              console.log("Complete Class Error:", error);

              Alert.alert(
                "Error",
                error.message || "Something went wrong."
              );
            } finally {
              setActionLoading(false);
              setActiveRequestId(null);
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // CANCEL CLASS
  // PUT /Tutor/cancel-class/{requestId}
  // ============================================================

  const cancelClass = async (requestId) => {
    Alert.alert(
      "Cancel Class",
      "Are you sure you want to cancel this class?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              setActiveRequestId(requestId);

              const token = await getToken();

              if (!token) {
                return;
              }

              const response = await fetch(
                `${BASE_URL}/Tutor/cancel-class/${requestId}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const result = await response.json();

              console.log("CANCEL CLASS RESPONSE:", result);

              if (response.ok && result.success) {
                Alert.alert(
                  "Success",
                  result.message || "Class cancelled successfully."
                );

                // Remove cancelled class from today's list
                setClassData((prevData) =>
                  prevData.filter(
                    (item) => item.request_id !== requestId
                  )
                );
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to cancel class."
                );
              }
            } catch (error) {
              console.log("Cancel Class Error:", error);

              Alert.alert(
                "Error",
                error.message || "Something went wrong."
              );
            } finally {
              setActionLoading(false);
              setActiveRequestId(null);
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // AUTO RESCHEDULE
  // POST /Tutor/reschedule
  // ============================================================

  const rescheduleClass = async (requestId) => {
    try {
      setActionLoading(true);
      setActiveRequestId(requestId);

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/reschedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId,
        }),
      });

      const result = await response.json();

      console.log("AUTO RESCHEDULE RESPONSE:", result);

      if (!response.ok || !result.success) {
        Alert.alert(
          "Error",
          result.message || "Failed to reschedule class."
        );
        return;
      }

      // ========================================================
      // AUTO SCHEDULE SUCCESS
      // ========================================================

      if (result.autoScheduled === true) {
        const data = result.data || {};

        Alert.alert(
          "Success",
          result.message ||
            `Class rescheduled to ${data.Day || ""} ${
              data.Time || ""
            }`
        );

        // Refresh today's classes
        await fetchTodayClasses();

        return;
      }

      // ========================================================
      // MANUAL SCHEDULE REQUIRED
      // ========================================================

      if (result.manualRequired === true) {
        Alert.alert(
          "Manual Scheduling Required",
          result.message ||
            "No common free slot was found. Please select day, time and date.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Manual Schedule",
              onPress: () => {
                openManualSchedule(
                  requestId,
                  "Reschedule"
                );
              },
            },
          ]
        );

        return;
      }

      Alert.alert(
        "Information",
        result.message || "Reschedule process completed."
      );
    } catch (error) {
      console.log("Auto Reschedule Error:", error);

      Alert.alert(
        "Error",
        error.message || "Something went wrong."
      );
    } finally {
      setActionLoading(false);
      setActiveRequestId(null);
    }
  };

  // ============================================================
  // AUTO PRESCHEDULE
  // POST /Tutor/preschedule
  // ============================================================

  const prescheduleClass = async (requestId) => {
    try {
      setActionLoading(true);
      setActiveRequestId(requestId);

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(`${BASE_URL}/Tutor/preschedule`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: requestId,
        }),
      });

      const result = await response.json();

      console.log("AUTO PRESCHEDULE RESPONSE:", result);

      if (!response.ok || !result.success) {
        Alert.alert(
          "Error",
          result.message || "Failed to preschedule class."
        );
        return;
      }

      // ========================================================
      // AUTO SCHEDULE SUCCESS
      // ========================================================

      if (result.autoScheduled === true) {
        const data = result.data || {};

        Alert.alert(
          "Success",
          result.message ||
            `Class prescheduled to ${data.Day || ""} ${
              data.Time || ""
            }`
        );

        // Refresh today's classes
        await fetchTodayClasses();

        return;
      }

      // ========================================================
      // MANUAL SCHEDULE REQUIRED
      // ========================================================

      if (result.manualRequired === true) {
        Alert.alert(
          "Manual Scheduling Required",
          result.message ||
            "No common free slot was found. Please select day, time and date.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Manual Schedule",
              onPress: () => {
                openManualSchedule(
                  requestId,
                  "Preschedule"
                );
              },
            },
          ]
        );

        return;
      }

      Alert.alert(
        "Information",
        result.message || "Preschedule process completed."
      );
    } catch (error) {
      console.log("Auto Preschedule Error:", error);

      Alert.alert(
        "Error",
        error.message || "Something went wrong."
      );
    } finally {
      setActionLoading(false);
      setActiveRequestId(null);
    }
  };

  // ============================================================
  // OPEN MANUAL SCHEDULE
  // ============================================================

  const openManualSchedule = (requestId, type) => {
    setManualRequestId(requestId);
    setManualScheduleType(type);

    setManualDay("");
    setManualTime("");
    setManualDate("");

    setManualModalVisible(true);
  };

  // ============================================================
  // MANUAL SCHEDULE
  // POST /Tutor/manual-schedule
  // ============================================================

  const manualSchedule = async () => {
    if (!manualRequestId) {
      Alert.alert("Error", "Request ID is missing.");
      return;
    }

    if (!manualDay.trim()) {
      Alert.alert("Required", "Please enter day.");
      return;
    }

    if (!manualTime.trim()) {
      Alert.alert("Required", "Please enter time.");
      return;
    }

    if (!manualDate.trim()) {
      Alert.alert(
        "Required",
        "Please enter class date."
      );
      return;
    }

    // Convert DD-MM-YYYY / DD/MM/YYYY to YYYY-MM-DD
    const convertedDate = convertDateToApiFormat(
      manualDate.trim()
    );

    if (!convertedDate) {
      Alert.alert(
        "Invalid Date",
        "Please enter date in YYYY-MM-DD format."
      );
      return;
    }

    try {
      setActionLoading(true);

      const token = await getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${BASE_URL}/Tutor/manual-schedule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId: manualRequestId,
            day: manualDay.trim(),
            time: manualTime.trim(),

            // Backend expects DateTime.
            // Sending YYYY-MM-DDT00:00:00 is safe.
            classDate: `${convertedDate}T00:00:00`,

            // IMPORTANT:
            // Backend RequestType should be
            // Reschedule or Preschedule.
            requestType: manualScheduleType,
          }),
        }
      );

      const result = await response.json();

      console.log("MANUAL SCHEDULE RESPONSE:", result);

      if (response.ok && result.success) {
        setManualModalVisible(false);

        Alert.alert(
          "Success",
          result.message ||
            "Schedule request sent to student successfully."
        );

        await fetchTodayClasses();
      } else {
        Alert.alert(
          "Error",
          result.message || "Manual scheduling failed."
        );
      }
    } catch (error) {
      console.log("Manual Schedule Error:", error);

      Alert.alert(
        "Error",
        error.message || "Something went wrong."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // DATE CONVERTER
  // ============================================================

  const convertDateToApiFormat = (dateString) => {
    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const parts = dateString.split("-");

      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const parts = dateString.split("/");

      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return null;
  };

  // ============================================================
  // RENDER CLASS
  // ============================================================

  const renderItem = ({ item }) => {
    const requestId = item.request_id;

    const isThisItemLoading =
      actionLoading && activeRequestId === requestId;

    return (
      <View style={styles.card}>
        {/* Top Card Bar */}
        <View style={styles.cardHeader}>
          <View style={styles.timeBadge}>
            <Icon
              name="access-time"
              size={15}
              color={colors.primary || "#4F46E5"}
            />

            <Text style={styles.timeBadgeText}>
              {item.time || "Time Not Set"}
            </Text>
          </View>

          <View style={styles.typeTag}>
            <Text style={styles.typeTagText}>
              {item.request_type || "Standard"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Primary Details Grid */}
        <View style={styles.detailsGroup}>
          <View style={styles.studentInfoRow}>
            <View style={styles.avatarWrap}>
              <Icon
                name="person"
                size={20}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.studentTextGroup}>
              <Text style={styles.studentName}>
                {item.student_name || "Unknown Student"}
              </Text>

              <Text style={styles.courseSubtitle}>
                {item.course_name || "General Course"}
              </Text>
            </View>
          </View>

          <View style={styles.metaBox}>
            <View style={styles.metaItem}>
              <Icon
                name="calendar-today"
                size={14}
                color="#64748B"
              />

              <Text style={styles.metaLabel}>
                Date:
              </Text>

              <Text style={styles.metaValue}>
                {item.class_date || "Today"}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <Icon
                name="today"
                size={14}
                color="#64748B"
              />

              <Text style={styles.metaLabel}>
                Day:
              </Text>

              <Text style={styles.metaValue}>
                {item.day || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {/* COMPLETE */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.primaryBtn,
              isThisItemLoading && styles.disabledBtn,
            ]}
            disabled={isThisItemLoading}
            onPress={() => completeClass(requestId)}
          >
            {isThisItemLoading ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <>
                <Icon
                  name="check-circle-outline"
                  size={16}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryText}>
                  Complete Class
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.secondaryActionGroup}>
            {/* PRE-SCHEDULE */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryBtn}
              disabled={isThisItemLoading}
              onPress={() =>
                prescheduleClass(requestId)
              }
            >
              <Icon
                name="update"
                size={14}
                color={
                  colors.primary || "#4F46E5"
                }
              />

              <Text style={styles.secondaryText}>
                Pre-Schedule
              </Text>
            </TouchableOpacity>

            {/* RE-SCHEDULE */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.secondaryBtn}
              disabled={isThisItemLoading}
              onPress={() =>
                rescheduleClass(requestId)
              }
            >
              <Icon
                name="event-repeat"
                size={14}
                color={
                  colors.primary || "#4F46E5"
                }
              />

              <Text style={styles.secondaryText}>
                Re-Schedule
              </Text>
            </TouchableOpacity>

            {/* CANCEL */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.cancelBtn}
              disabled={isThisItemLoading}
              onPress={() =>
                cancelClass(requestId)
              }
            >
              <Icon
                name="highlight-off"
                size={14}
                color="#EF4444"
              />

              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* App Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() =>
            navigation.navigate("TutorDrawer")
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
            size={22}
            color="#1E293B"
          />
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

        <View style={{ width: 36 }} />
      </View>

      {/* Loading & Main Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={
              colors.primary || "#4F46E5"
            }
          />

          <Text style={styles.loadingText}>
            Fetching today's schedule...
          </Text>
        </View>
      ) : (
        <FlatList
          data={classData}
          keyExtractor={(item, index) =>
            item.request_id
              ? item.request_id.toString()
              : index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={
            classData.length === 0
              ? styles.flexGrow
              : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeaderContainer}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.screenTitle}>
                  Today's Classes
                </Text>

                <Text style={styles.screenSubtitle}>
                  Manage your active teaching schedule
                  for today.
                </Text>
              </View>

              {classData.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {classData.length} Session
                    {classData.length > 1
                      ? "s"
                      : ""}
                  </Text>
                </View>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconWrap}>
                <Icon
                  name="event-available"
                  size={38}
                  color="#94A3B8"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Classes Scheduled Today
              </Text>

              <Text style={styles.emptySubtitle}>
                You have no active teaching sessions
                on your schedule for today. Rest up
                or review your upcoming requests!
              </Text>
            </View>
          }
        />
      )}

      {/* =======================================================
          MANUAL SCHEDULE MODAL
      ======================================================== */}

      <Modal
        visible={manualModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setManualModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Manual Schedule
                </Text>

                <Text style={styles.modalSubtitle}>
                  {manualScheduleType ===
                  "Preschedule"
                    ? "Preschedule"
                    : "Reschedule"}{" "}
                  class
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() =>
                  setManualModalVisible(false)
                }
              >
                <Icon
                  name="close"
                  size={22}
                  color="#475569"
                />
              </TouchableOpacity>
            </View>

            {/* DAY */}
            <Text style={styles.inputLabel}>
              Day
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: Monday"
              placeholderTextColor="#94A3B8"
              value={manualDay}
              onChangeText={setManualDay}
            />

            {/* TIME */}
            <Text style={styles.inputLabel}>
              Time
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Example: 04:00 PM - 05:00 PM"
              placeholderTextColor="#94A3B8"
              value={manualTime}
              onChangeText={setManualTime}
            />

            {/* DATE */}
            <Text style={styles.inputLabel}>
              Class Date
            </Text>

            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={manualDate}
              onChangeText={setManualDate}
              keyboardType="numbers-and-punctuation"
            />

            <Text style={styles.dateHint}>
              Example: 2026-09-20
            </Text>

            {/* BUTTONS */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() =>
                  setManualModalVisible(false)
                }
                disabled={actionLoading}
              >
                <Text
                  style={styles.modalCancelText}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSaveBtn,
                  actionLoading &&
                    styles.disabledBtn,
                ]}
                onPress={manualSchedule}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Icon
                      name="save"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text
                      style={styles.modalSaveText}
                    >
                      Send Schedule
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* =======================================================
          BOTTOM NAVIGATION
      ======================================================== */}

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("TutorHome")
          }
        >
          <Icon
            name="calendar-month"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.inactiveTab}>
            Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "TutorStudentRequest"
            )
          }
        >
          <Icon
            name="description"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.inactiveTab}>
            Request
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
        >
          <View
            style={styles.activeTabIndicator}
          >
            <Icon
              name="school"
              size={22}
              color={
                colors.primary || "#4F46E5"
              }
            />

            <Text style={styles.activeTab}>
              Today
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate(
              "TutorAddSubject"
            )
          }
        >
          <Icon
            name="add-box"
            size={22}
            color="#94A3B8"
          />

          <Text style={styles.inactiveTab}>
            Add
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TutorTodayClasses;

// ============================================================
// STYLES
// ============================================================

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

  // ==========================================================
  // APP BAR
  // ==========================================================

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
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.2,
  },

  // ==========================================================
  // LIST HEADER
  // ==========================================================

  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  headerTitleContainer: {
    flex: 1,
    paddingRight: 8,
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
    backgroundColor:
      (colors.primary || "#4F46E5") + "12",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor:
      (colors.primary || "#4F46E5") + "20",
  },

  countText: {
    fontSize: 12,
    fontWeight: "700",
    color:
      colors.primary || "#4F46E5",
  },

  listContent: {
    paddingBottom: 110,
  },

  flexGrow: {
    flexGrow: 1,
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  timeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      (colors.primary || "#4F46E5") + "10",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  timeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color:
      colors.primary || "#4F46E5",
    marginLeft: 6,
  },

  typeTag: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  typeTagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    textTransform: "capitalize",
  },

  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },

  // ==========================================================
  // DETAILS
  // ==========================================================

  detailsGroup: {
    gap: 12,
  },

  studentInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      colors.primary || "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  studentTextGroup: {
    flex: 1,
  },

  studentName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },

  courseSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  metaBox: {
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  metaLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
    marginLeft: 5,
  },

  metaValue: {
    fontSize: 12,
    color: "#1E293B",
    fontWeight: "600",
    marginLeft: 4,
  },

  // ==========================================================
  // ACTIONS
  // ==========================================================

  actionSection: {
    marginTop: 14,
    gap: 8,
  },

  primaryBtn: {
    backgroundColor:
      colors.primary || "#4F46E5",
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor:
      colors.primary || "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 6,
  },

  secondaryActionGroup: {
    flexDirection: "row",
    gap: 6,
  },

  secondaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor:
      (colors.primary || "#4F46E5") +
      "35",
    paddingVertical: 8,
    borderRadius: 8,
  },

  secondaryText: {
    color:
      colors.primary || "#4F46E5",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },

  cancelBtn: {
    flex: 0.9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    paddingVertical: 8,
    borderRadius: 8,
  },

  cancelText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },

  disabledBtn: {
    opacity: 0.6,
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },

  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom:
      Platform.OS === "ios" ? 30 : 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 3,
  },

  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 8,
  },

  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  dateHint: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  modalCancelText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  modalSaveBtn: {
    flex: 1.5,
    height: 46,
    borderRadius: 10,
    backgroundColor:
      colors.primary || "#4F46E5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  modalSaveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 6,
  },

  // ==========================================================
  // BOTTOM NAVIGATION
  // ==========================================================

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
    shadowOffset: {
      width: 0,
      height: -2,
    },
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
    color:
      colors.primary || "#4F46E5",
    marginTop: 2,
  },

  inactiveTab: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
  },
});

















































// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   Alert,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import colors from "../utils/colors";
// import { BASE_URL } from "../../config/api";

// const TutorTodayClasses = ({ navigation }) => {
//   const [classData, setClassData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchTodayClasses();
//   }, []);

//   const fetchTodayClasses = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       if (!token) {
//         Alert.alert("Error", "User not logged in");
//         return;
//       }

//       const response = await fetch(`${BASE_URL}/Tutor/today-classes`, {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const result = await response.json();

//       console.log("TODAY CLASSES:", result);

//       if (response.ok && result.success) {
//         setClassData(result.data || []);
//       } else {
//         Alert.alert("Error", result.message || "Failed to load classes");
//       }
//     } catch (error) {
//       console.log("Fetch Error:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       {/* Top Card Bar */}
//       <View style={styles.cardHeader}>
//         <View style={styles.timeBadge}>
//           <Icon name="access-time" size={15} color={colors.primary || "#4F46E5"} />
//           <Text style={styles.timeBadgeText}>{item.time || "Time Not Set"}</Text>
//         </View>

//         <View style={styles.typeTag}>
//           <Text style={styles.typeTagText}>{item.request_type || "Standard"}</Text>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       {/* Primary Details Grid */}
//       <View style={styles.detailsGroup}>
//         <View style={styles.studentInfoRow}>
//           <View style={styles.avatarWrap}>
//             <Icon name="person" size={20} color="#FFFFFF" />
//           </View>
//           <View style={styles.studentTextGroup}>
//             <Text style={styles.studentName}>{item.student_name || "Unknown Student"}</Text>
//             <Text style={styles.courseSubtitle}>{item.course_name || "General Course"}</Text>
//           </View>
//         </View>

//         <View style={styles.metaBox}>
//           <View style={styles.metaItem}>
//             <Icon name="calendar-today" size={14} color="#64748B" />
//             <Text style={styles.metaLabel}>Date:</Text>
//             <Text style={styles.metaValue}>{item.class_date || "Today"}</Text>
//           </View>

//           <View style={styles.metaItem}>
//             <Icon name="today" size={14} color="#64748B" />
//             <Text style={styles.metaLabel}>Day:</Text>
//             <Text style={styles.metaValue}>{item.day || "N/A"}</Text>
//           </View>
//         </View>
//       </View>

//       {/* Action Buttons Matrix */}
//       <View style={styles.actionSection}>
//         <TouchableOpacity activeOpacity={0.8} style={styles.primaryBtn}>
//           <Icon name="check-circle-outline" size={16} color="#FFFFFF" />
//           <Text style={styles.primaryText}>Complete Class</Text>
//         </TouchableOpacity>

//         <View style={styles.secondaryActionGroup}>
//           <TouchableOpacity activeOpacity={0.8} style={styles.secondaryBtn}>
//             <Icon name="update" size={14} color={colors.primary || "#4F46E5"} />
//             <Text style={styles.secondaryText}>Pre-Schedule</Text>
//           </TouchableOpacity>

//           <TouchableOpacity activeOpacity={0.8} style={styles.secondaryBtn}>
//             <Icon name="event-repeat" size={14} color={colors.primary || "#4F46E5"} />
//             <Text style={styles.secondaryText}>Re-Schedule</Text>
//           </TouchableOpacity>

//           <TouchableOpacity activeOpacity={0.8} style={styles.cancelBtn}>
//             <Icon name="highlight-off" size={14} color="#EF4444" />
//             <Text style={styles.cancelText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

//       {/* App Bar */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.menuBtn}
//           onPress={() => navigation.navigate("TutorDrawer")}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="menu" size={22} color="#1E293B" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={{ width: 36 }} />
//       </View>

//       {/* Loading & Main Content */}
//       {loading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color={colors.primary || "#4F46E5"} />
//           <Text style={styles.loadingText}>Fetching today's schedule...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={classData}
//           keyExtractor={(item) => item.request_id.toString()}
//           renderItem={renderItem}
//           contentContainerStyle={
//             classData.length === 0 ? styles.flexGrow : styles.listContent
//           }
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={
//             <View style={styles.listHeaderContainer}>
//               <View>
//                 <Text style={styles.screenTitle}>Today's Classes</Text>
//                 <Text style={styles.screenSubtitle}>
//                   Manage your active teaching schedule for today.
//                 </Text>
//               </View>

//               {classData.length > 0 && (
//                 <View style={styles.countBadge}>
//                   <Text style={styles.countText}>{classData.length} Session{classData.length > 1 ? "s" : ""}</Text>
//                 </View>
//               )}
//             </View>
//           }
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <View style={styles.emptyIconWrap}>
//                 <Icon name="event-available" size={38} color="#94A3B8" />
//               </View>
//               <Text style={styles.emptyTitle}>No Classes Scheduled Today</Text>
//               <Text style={styles.emptySubtitle}>
//                 You have no active teaching sessions on your schedule for today. Rest up or review your upcoming requests!
//               </Text>
//             </View>
//           }
//         />
//       )}

//       {/* Bottom Navigation */}
//       <View style={styles.bottomNav}>
//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("TutorHome")}
//         >
//           <Icon name="calendar-month" size={22} color="#94A3B8" />
//           <Text style={styles.inactiveTab}>Schedule</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("TutorStudentRequest")}
//         >
//           <Icon name="description" size={22} color="#94A3B8" />
//           <Text style={styles.inactiveTab}>Request</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.navItem}>
//           <View style={styles.activeTabIndicator}>
//             <Icon name="school" size={22} color={colors.primary || "#4F46E5"} />
//             <Text style={styles.activeTab}>Today</Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.navItem}
//           onPress={() => navigation.navigate("TutorAddSubject")}
//         >
//           <Icon name="add-box" size={22} color="#94A3B8" />
//           <Text style={styles.inactiveTab}>Add</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default TutorTodayClasses;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: "#64748B",
//     fontWeight: "500",
//   },

//   /* App Bar */
//   header: {
//     height: 56,
//     flexDirection: "row",
//     alignItems: "center",
//     justifycontent: "space-between",
//     paddingHorizontal: 16,
//     backgroundColor: "#FFFFFF",
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },
//   menuBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     alignItems: "center",
//     justifycontent: "center",
//   },
//   headerCenter: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   logoImage: {
//     width: 26,
//     height: 26,
//     resizeMode: "contain",
//     marginRight: 8,
//   },
//   logoText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: colors.primary || "#4F46E5",
//     letterSpacing: -0.2,
//   },

//   /* List Header */
//   listHeaderContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 8,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
//   screenTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#0F172A",
//     letterSpacing: -0.3,
//   },
//   screenSubtitle: {
//     fontSize: 13,
//     color: "#64748B",
//     marginTop: 4,
//     fontWeight: "400",
//   },
//   countBadge: {
//     backgroundColor: (colors.primary || "#4F46E5") + "12",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: (colors.primary || "#4F46E5") + "20",
//   },
//   countText: {
//     fontSize: 12,
//     fontWeight: "700",
//     color: colors.primary || "#4F46E5",
//   },

//   listContent: {
//     paddingBottom: 110,
//   },
//   flexGrow: {
//     flexGrow: 1,
//   },

//   /* Card Layout */
//   card: {
//     backgroundColor: "#FFFFFF",
//     marginHorizontal: 16,
//     marginVertical: 6,
//     padding: 16,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.04,
//     shadowRadius: 8,
//     elevation: 2,
//   },

//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   timeBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: (colors.primary || "#4F46E5") + "10",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 8,
//     gap: 6,
//   },
//   timeBadgeText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: colors.primary || "#4F46E5",
//   },
//   typeTag: {
//     backgroundColor: "#F1F5F9",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },
//   typeTagText: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#475569",
//     textTransform: "capitalize",
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#F1F5F9",
//     marginVertical: 12,
//   },

//   /* Student Info & Details */
//   detailsGroup: {
//     gap: 12,
//   },
//   studentInfoRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   avatarWrap: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: colors.primary || "#4F46E5",
//     alignItems: "center",
//     justifycontent: "center",
//     marginRight: 12,
//   },
//   studentTextGroup: {
//     flex: 1,
//   },
//   studentName: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//   },
//   courseSubtitle: {
//     fontSize: 13,
//     color: "#64748B",
//     marginTop: 2,
//     fontWeight: "500",
//   },

//   metaBox: {
//     backgroundColor: "#F8FAFC",
//     padding: 10,
//     borderRadius: 10,
//     flexDirection: "row",
//     justifycontent: "space-between",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#F1F5F9",
//   },
//   metaItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 5,
//   },
//   metaLabel: {
//     fontSize: 12,
//     color: "#64748B",
//     fontWeight: "500",
//   },
//   metaValue: {
//     fontSize: 12,
//     color: "#1E293B",
//     fontWeight: "600",
//   },

//   /* Actions Area */
//   actionSection: {
//     marginTop: 14,
//     gap: 8,
//   },
//   primaryBtn: {
//     backgroundColor: colors.primary || "#4F46E5",
//     paddingVertical: 10,
//     borderRadius: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     justifycontent: "center",
//     gap: 6,
//     shadowColor: colors.primary || "#4F46E5",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   primaryText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   secondaryActionGroup: {
//     flexDirection: "row",
//     gap: 6,
//   },
//   secondaryBtn: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifycontent: "center",
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: (colors.primary || "#4F46E5") + "35",
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 4,
//   },
//   secondaryText: {
//     color: colors.primary || "#4F46E5",
//     fontSize: 11,
//     fontWeight: "600",
//   },

//   cancelBtn: {
//     flex: 0.9,
//     flexDirection: "row",
//     alignItems: "center",
//     justifycontent: "center",
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#FECACA",
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 4,
//   },
//   cancelText: {
//     color: "#EF4444",
//     fontSize: 11,
//     fontWeight: "600",
//   },

//   /* Empty State */
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifycontent: "center",
//     paddingHorizontal: 32,
//     paddingVertical: 60,
//   },
//   emptyIconWrap: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifycontent: "center",
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#1E293B",
//     marginBottom: 6,
//     textAlign: "center",
//   },
//   emptySubtitle: {
//     fontSize: 13,
//     color: "#64748B",
//     textAlign: "center",
//     lineHeight: 18,
//   },

//   /* Bottom Navigation Bar */
//   bottomNav: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     flexDirection: "row",
//     justifycontent: "space-around",
//     alignItems: "center",
//     paddingVertical: 10,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderColor: "#F1F5F9",
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//   },
//   navItem: {
//     alignItems: "center",
//     justifycontent: "center",
//     flex: 1,
//   },
//   activeTabIndicator: {
//     alignItems: "center",
//   },
//   activeTab: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: colors.primary || "#4F46E5",
//     marginTop: 2,
//   },
//   inactiveTab: {
//     fontSize: 11,
//     fontWeight: "500",
//     color: "#94A3B8",
//     marginTop: 2,
//   },
// });
