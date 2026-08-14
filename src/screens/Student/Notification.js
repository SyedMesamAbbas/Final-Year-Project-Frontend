import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const Notification = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  // =====================================================
  // FETCH REQUESTS
  // =====================================================

  const fetchRequests = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Student/pre-reschedule-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      console.log("REQUESTS:", text);

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setRequests(Array.isArray(data) ? data : []);
      } else {
        Alert.alert(
          "Error",
          text || "Failed to fetch requests"
        );
      }
    } catch (error) {
      console.log("FETCH ERROR:", error);

      Alert.alert(
        "Error",
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ACCEPT REQUEST
  // =====================================================

  const confirmAccept = (
    requestId,
    type
  ) => {
    Alert.alert(
      "Confirm Accept",
      `Are you sure you want to accept this ${type} request?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () =>
            acceptRequest(
              requestId,
              type
            ),
        },
      ]
    );
  };

  const acceptRequest = async (
    requestId,
    type
  ) => {
    try {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const endpoint =
        type === "Reschedule"
          ? `accept-reschedule/${requestId}`
          : `accept-preschedule/${requestId}`;

      const response = await fetch(
        `${BASE_URL}/Student/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      console.log(
        "ACCEPT RESPONSE:",
        text
      );

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {}

      if (response.ok) {
        Alert.alert(
          "Success",
          type === "Reschedule"
            ? "Class Re-Scheduled Successfully"
            : "Class Pre-Scheduled Successfully"
        );

        fetchRequests();
      } else {
        Alert.alert(
          "Error",
          data.message ||
            "Failed to accept request"
        );
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  // =====================================================
  // REJECT REQUEST
  // =====================================================

  const confirmReject = (
    requestId
  ) => {
    Alert.alert(
      "Confirm Reject",
      "Are you sure you want to reject this request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () =>
            rejectRequest(requestId),
        },
      ]
    );
  };

  const rejectRequest = async (
    requestId
  ) => {
    try {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const response = await fetch(
        `${BASE_URL}/Student/reject-request/${requestId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      console.log(
        "REJECT RESPONSE:",
        text
      );

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {}

      if (response.ok) {
        Alert.alert(
          "Success",
          "Request rejected successfully"
        );

        fetchRequests();
      } else {
        Alert.alert(
          "Error",
          data.message ||
            "Failed to reject request"
        );
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        error.message
      );
    }
  };

  // =====================================================
  // REQUEST ITEM
  // =====================================================

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* TYPE BADGE */}
      <View
        style={[
          styles.typeContainer,

          item.request_type ===
          "Reschedule"
            ? styles.typeBadgeReschedule
            : styles.typeBadgePreschedule,
        ]}
      >
        <Text style={styles.typeText}>
          {item.request_type}
        </Text>
      </View>

      {/* DAY + TIME */}
      <Text style={styles.time}>
        {item.day} , {item.time}
      </Text>

      {/* DATE */}
      <Text style={styles.date}>
        📅 Date : {item.class_date}
      </Text>

      {/* TUTOR */}
      <Text style={styles.text}>
        👨‍🏫 Tutor : {item.tutor_name}
      </Text>

      {/* COURSE */}
      <Text style={styles.text}>
        📘 Course :{" "}
        {item.course_name}
      </Text>

      {/* STATUS */}
      <Text
        style={[
          styles.statusText,
          styles.pendingStatus,
        ]}
      >
        ● Pending
      </Text>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        {/* ACCEPT */}
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() =>
            confirmAccept(
              item.request_id,
              item.request_type
            )
          }
        >
          <Icon
            name="check"
            size={14}
            color="#fff"
          />

          <Text
            style={styles.acceptText}
          >
            Accept
          </Text>
        </TouchableOpacity>

        {/* REJECT */}
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() =>
            confirmReject(
              item.request_id
            )
          }
        >
          <Icon
            name="close"
            size={14}
            color="#e74c3c"
          />

          <Text
            style={styles.rejectText}
          >
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Icon
            name="arrow-back"
            size={26}
            color="#000"
          />
        </TouchableOpacity>

        <View
          style={styles.headerCenter}
        >
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      {/* TITLE */}
      <Text style={styles.pageTitle}>
        Requests
      </Text>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{
            marginTop: 30,
          }}
        />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) =>
            item.request_id.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 80,
          }}
          ListEmptyComponent={
            <Text
              style={styles.emptyText}
            >
              No Re-Schedule /
              Pre-Schedule Requests
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerCenter: {
    alignItems: "center",
  },

  logoImage: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },

  // =====================================================
  // CARD
  // =====================================================

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },

  typeContainer: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },

  typeBadgeReschedule: {
    backgroundColor: "#f39c12",
  },

  typeBadgePreschedule: {
    backgroundColor:
      colors.primary,
  },

  typeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  time: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
  },

  date: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  },

  text: {
    fontSize: 13,
    color: "#444",
    marginBottom: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginBottom: 2,
  },

  pendingStatus: {
    color: "#f39c12",
  },

  // =====================================================
  // BUTTONS
  // =====================================================

  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
    marginRight: 10,
  },

  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 22,
  },

  acceptText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },

  rejectText: {
    color: "#e74c3c",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#777",
    fontSize: 14,
  },
});