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

const ParentChildTutors = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTutors = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-tutors/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Tutors:", response.data);

      setTutors(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child tutors."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTutors();
  }, []);

  const renderItem = ({ item }) => (
  <View style={styles.card}>
    <View style={styles.avatar}>
      <Icon
        name="school"
        size={34}
        color={colors.primary}
      />
    </View>

    <View style={styles.info}>
      {/* Full Name */}
      <Text style={styles.name}>
        {item.fullName}
      </Text>

      {/* Email */}
      <View style={styles.row}>
        <Icon
          name="mail-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          {item.email}
        </Text>
      </View>

      {/* Phone */}
      <View style={styles.row}>
        <Icon
          name="call-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          {item.phone}
        </Text>
      </View>

      {/* Qualification */}
      <View style={styles.row}>
        <Icon
          name="school-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Qualification: {item.qualification || "-"}
        </Text>
      </View>

      {/* Experience */}
      <View style={styles.row}>
        <Icon
          name="briefcase-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Experience: {item.experience} Year{item.experience == 1 ? "" : "s"}
        </Text>
      </View>

      {/* Radius */}
      <View style={styles.row}>
        <Icon
          name="location-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.value}>
          Radius: {item.radius} KM
        </Text>
      </View>

      {/* Courses Teaching */}
      <View style={styles.courseContainer}>
        <View style={styles.row}>
          <Icon
            name="book-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.label}>
            Courses Teaching
          </Text>
        </View>

        {item.coursesTeaching?.length > 0 ? (
          item.coursesTeaching.map((course, index) => (
            <Text
              key={index}
              style={styles.courseText}
            >
              • {course}
            </Text>
          ))
        ) : (
          <Text style={styles.courseText}>
            No Courses
          </Text>
        )}
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
        Child Tutors
      </Text>

      <FlatList
        data={tutors}
        keyExtractor={(item, index) =>
          `${item.tutorId}-${index}`
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
          flexGrow: tutors.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon
              name="school-outline"
              size={90}
              color="#999"
            />

            <Text style={styles.emptyText}>
              No tutors assigned.
            </Text>
          </View>
        }
      />

    </SafeAreaView>
  );
};

export default ParentChildTutors;

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
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
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

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  info: {
    flex: 1,
  },

  name: {
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
    color: "#555",
    fontSize: 14,
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
  label: {
  fontWeight: "700",
  color: colors.primary,
  marginBottom: 4,
},

courseText: {
  fontSize: 14,
  color: "#555",
  marginBottom: 2,
},

classTitle: {
  fontSize: 16,
  fontWeight: "700",
  color: colors.primary,
  marginBottom: 8,
},

classCard: {
  backgroundColor: "#F6F8FC",
  borderRadius: 8,
  padding: 10,
  marginBottom: 8,
},

classText: {
  fontSize: 14,
  color: "#444",
  marginBottom: 2,
},

bold: {
  fontWeight: "bold",
},
});