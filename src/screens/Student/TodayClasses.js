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
  Modal,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const TodayClasses = ({ navigation }) => {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===========================
  // Re-Schedule / Pre-Schedule
  // ===========================
  const [slotModalVisible, setSlotModalVisible] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [actionType, setActionType] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  // =========================================
  // FETCH ALL CLASSES
  // =========================================
  const fetchClasses = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/Student/today-classes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await response.json();

      console.log("Student Classes:", json);

      if (json.success) {
        setClassesData(json.data || []);
      } else {
        setClassesData([]);
        Alert.alert(
          "Error",
          json.message || "Failed to fetch classes"
        );
      }
    } catch (error) {
      console.log("Fetch Classes Error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // GET AVAILABLE TUTOR SLOTS
  // =========================================
  const getAvailableSlots = async (
    requestId,
    type
  ) => {
    try {
      setSelectedRequestId(requestId);
      setActionType(type);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/available-slots/${requestId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      console.log("AVAILABLE SLOTS:", text);

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setAvailableSlots(
          Array.isArray(data) ? data : []
        );

        setSlotModalVisible(true);
      } else {
        Alert.alert(
          "Error",
          "Failed to fetch available slots"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

    // =========================================
  // CREATE RE-SCHEDULE / PRE-SCHEDULE
  // =========================================
  const selectSlot = async (
    slot,
    pickedDate
  ) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const endpoint =
        actionType === "Reschedule"
          ? "create-reschedule"
          : "create-preschedule";

      const body = {
        parentRequestId: selectedRequestId,
        newClassDate: pickedDate,
        day: slot.day,
        time: slot.time,
      };

      console.log(
        "REQUEST BODY:",
        JSON.stringify(body)
      );

      const response = await fetch(
        `${BASE_URL}/Student/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const text = await response.text();

      console.log("REQUEST RESPONSE:", text);

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok) {
        Alert.alert(
          "Success",
          actionType === "Reschedule"
            ? "Re-Schedule request sent successfully"
            : "Pre-Schedule request sent successfully"
        );

        setSlotModalVisible(false);

        fetchClasses();
      } else {
        Alert.alert(
          "Error",
          data.message || "Operation failed"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  // =========================================
  // SLOT ITEM
  // =========================================
  const renderSlot = ({ item }) => (
    <TouchableOpacity
      style={styles.slotCard}
      onPress={() => {
        setSelectedSlot(item);
        setShowDatePicker(true);
      }}
    >
      <Text style={styles.slotDay}>
        {item.day}
      </Text>

      <Text style={styles.slotText}>
        {item.time}
      </Text>
    </TouchableOpacity>
  );

  // =========================================
  // CLASS CARD
  // =========================================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftBorder} />

      <View style={styles.cardContent}>
        <View style={{ flex: 1 }}>

          <Text style={styles.subject}>
            {item.course_name || "Course"}
          </Text>

          <Text style={styles.info}>
            Tutor: {item.tutor_name || "N/A"}
          </Text>

          <Text style={styles.info}>
            📅 {item.class_date || "N/A"} (
            {item.day || "N/A"})
          </Text>

          <Text style={styles.time}>
            🕒 {item.time || "Time not set"}
          </Text>

          <Text style={styles.info}>
            Type: {item.request_type || "Normal"}
          </Text>

          {/* ONLY ACCEPTED CLASSES */}
          {item.status === "Accepted" && (
            <View style={styles.actionRow}>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() =>
                  getAvailableSlots(
                    item.request_id,
                    "Reschedule"
                  )
                }
              >
                <Text style={styles.secondaryText}>
                  Re-Schedule
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() =>
                  getAvailableSlots(
                    item.request_id,
                    "Preschedule"
                  )
                }
              >
                <Text style={styles.secondaryText}>
                  Pre-Schedule
                </Text>
              </TouchableOpacity>

            </View>
          )}

        </View>

        <View style={styles.statusButton}>
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

    return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Icon
            name="arrow-back"
            size={28}
            color="#000"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImg}
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <View style={{ width: 28 }} />

      </View>

      {/* Title */}
      <Text style={styles.title}>
        Your Classes
      </Text>

      {/* Loader */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={classesData}
          keyExtractor={(item) =>
            item.request_id.toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No classes found
            </Text>
          }
        />
      )}

      {/* SLOT MODAL */}
      <Modal
        visible={slotModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            <Text style={styles.modalTitle}>
              {actionType === "Reschedule"
                ? "Re-Schedule - Select Slot"
                : "Pre-Schedule - Select Slot"}
            </Text>

            <FlatList
              data={availableSlots}
              keyExtractor={(item, index) =>
                index.toString()
              }
              renderItem={renderSlot}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No slots available
                </Text>
              }
            />

            {/* DATE PICKER */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="calendar"
                minimumDate={new Date()}
                onChange={(event, date) => {
                  setShowDatePicker(false);

                  if (date && selectedSlot) {
                    setSelectedDate(date);

                    selectSlot(
                      selectedSlot,
                      date
                    );
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() =>
                setSlotModalVisible(false)
              }
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                }}
              >
                Close
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default TodayClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 35,
    marginBottom: 10,
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImg: {
    width: 30,
    height: 30,
    marginRight: 6,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 10,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#777",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3,
  },

  leftBorder: {
    width: 5,
    backgroundColor: "#F5A623",
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },

  cardContent: {
    flex: 1,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  subject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },

  info: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  time: {
    fontSize: 13,
    color: "#2F80ED",
    marginTop: 4,
    fontWeight: "600",
  },

  statusButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },

  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginTop: 5,
  },

  secondaryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.primary,
  },

  slotCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  slotDay: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  slotText: {
    fontSize: 13,
    color: "#444",
    marginTop: 2,
  },

  closeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 12,
  },
});