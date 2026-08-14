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
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const ParentChildClasses = ({ navigation, route }) => {
  const { studentId, courseId, courseTitle,} = route.params;

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-classes/${studentId}/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Classes:", response.data);

      setClasses(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child classes."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClasses();
  }, []);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "accepted":
        return "#2ECC71";

      case "pending":
        return "#F39C12";

      case "rejected":
        return "#E74C3C";

      case "completed":
        return "#3498DB";

      case "cancelled":
        return "#7F8C8D";

      default:
        return colors.primary;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.course}>
          📖 {item.courseName}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: getStatusColor(item.status),
            },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Icon
          name="school-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          {item.tutorName}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="mail-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          {item.tutorEmail}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="call-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          {item.tutorPhone}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="calendar-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Class Date : {formatDate(item.classDate)}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="today-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Day : {item.day}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="time-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Time : {item.time}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="sync-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Request Type : {item.requestType}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon
          name="document-text-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Request Date : {formatDate(item.requestDate)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="arrow-back"
              size={28}
              color={colors.primary}
            />
          </TouchableOpacity>

          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
          />

          <View style={{ width: 28 }} />
        </View>

        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

    return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name="arrow-back"
            size={28}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
        />

        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.title}>
        {courseTitle} Classes
      </Text>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.requestId.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 40,
          flexGrow: classes.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon
              name="school-outline"
              size={90}
              color="#999"
            />

            <Text style={styles.emptyText}>
              No classes found.
            </Text>
          </View>
        }
      />

    </SafeAreaView>
  );
};

export default ParentChildClasses;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  logo: {
    width: 90,
    height: 50,
    resizeMode: "contain",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  course: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginRight: 10,
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  value: {
    marginLeft: 10,
    color: "#555",
    fontSize: 15,
    flex: 1,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 15,
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },
});