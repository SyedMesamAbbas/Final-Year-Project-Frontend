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

const ParentChildCourses = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-courses/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Courses:", response.data);

      setCourses(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child courses."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ParentChildClasses", {
          studentId: studentId,
          courseId: item.courseId,
          courseTitle: item.courseTitle,
        })
      }
    >
      <View style={styles.iconContainer}>
        <Icon
          name="book-outline"
          size={32}
          color={colors.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.courseTitle}>
          {item.courseTitle}
        </Text>
      </View>

      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>
          {index + 1}
        </Text>
      </View>
    </TouchableOpacity>
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
        Child Courses
      </Text>

      <FlatList
        data={courses}
        keyExtractor={(item) =>
          item.courseId.toString()
        }
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
          flexGrow: courses.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon
              name="book-outline"
              size={90}
              color="#999"
            />

            <Text style={styles.emptyText}>
              No courses found.
            </Text>
          </View>
        }
      />

    </SafeAreaView>
  );
};

export default ParentChildCourses;

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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },

  courseId: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },

  numberCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  numberText: {
    color: "#fff",
    fontWeight: "bold",
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