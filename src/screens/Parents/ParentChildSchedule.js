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

const ParentChildSchedule = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSchedule = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-schedule/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Schedule:", response.data);

      setSchedule(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child schedule."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSchedule();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon
          name="calendar-outline"
          size={32}
          color={colors.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.day}>
          {item.day}
        </Text>

        <View style={styles.row}>
          <Icon
            name="time-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>
            {item.time}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon
            name="play-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>
            Start: {item.startDate || "-"}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon
            name="stop-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>
            End: {item.endDate || "-"}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon
            name="layers-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>
            Type: {item.type || "-"}
          </Text>
        </View>
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
        Child Schedule
      </Text>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.scheduleId.toString()}
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
          flexGrow: schedule.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon
              name="calendar-outline"
              size={90}
              color="#999"
            />

            <Text style={styles.emptyText}>
              No schedule found.
            </Text>
          </View>
        }
      />

    </SafeAreaView>
  );
};

export default ParentChildSchedule;

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
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  day: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  value: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
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
    fontWeight: "600",
    color: "#666",
  },
});