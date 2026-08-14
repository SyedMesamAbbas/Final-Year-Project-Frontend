import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const Notification = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      console.log("Notifications:", text);

      let data = [];

      try {
        data = text ? JSON.parse(text) : [];
      } catch {}

      if (response.ok) {
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        Alert.alert(
          "Error",
          "Failed to load notifications"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/accept-re-and-pre-schedule-request/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          data.message || "Request accepted"
        );

        fetchNotifications();
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to accept request"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BASE_URL}/Tutor/reject-re-and-pre-schedule-request/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (response.ok && data.success) {
        Alert.alert(
          "Success",
          data.message || "Request rejected"
        );

        fetchNotifications();
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to reject request"
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.typeContainer}>
        <Text style={styles.type}>
          {item.requestType}
        </Text>
      </View>

      <Text style={styles.label}>
        Student
      </Text>
      <Text style={styles.value}>
        {item.studentName}
      </Text>

      <Text style={styles.label}>
        Course
      </Text>
      <Text style={styles.value}>
        {item.courseTitle}
      </Text>

      <Text style={styles.label}>
        Day
      </Text>
      <Text style={styles.value}>
        {item.day}
      </Text>

      <Text style={styles.label}>
        Time
      </Text>
      <Text style={styles.value}>
        {item.time}
      </Text>

      <Text style={styles.label}>
        Class Date
      </Text>
      <Text style={styles.value}>
        {item.classDate}
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() =>
            acceptRequest(item.requestId)
          }
        >
          <Text style={styles.buttonText}>
            Accept
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() =>
            rejectRequest(item.requestId)
          }
        >
          <Text style={styles.buttonText}>
            Reject
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={26}
            color="#000"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) =>
            item.requestId.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No pending notifications
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#777",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },

  typeContainer: {
    alignSelf: "flex-start",
    backgroundColor: "#EEF6FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },

  type: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },

  label: {
    color: "#999",
    fontSize: 12,
    marginTop: 6,
  },

  value: {
    color: "#222",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 16,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: "#27AE60",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 6,
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: "#EB5757",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});