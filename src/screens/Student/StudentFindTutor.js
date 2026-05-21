import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const StudentFindTutor = ({ navigation, route }) => {
  const { day, time, course_id } = route.params || {};

  const [tutorsData, setTutorsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  const loadLocation = async () => {
    try {
      const lat = await AsyncStorage.getItem("latitude");
      const lng = await AsyncStorage.getItem("longitude");

      if (!lat || !lng) {
        Alert.alert("Error", "Location not found");
        return;
      }

      setUserLat(parseFloat(lat));
      setUserLng(parseFloat(lng));
    } catch (err) {
      console.log("Location Error:", err);
    }
  };

  useEffect(() => {
    loadLocation();
  }, []);

  useEffect(() => {
    if (userLat !== null && userLng !== null) {
      fetchTutors();
    }
  }, [userLat, userLng]);

  const fetchTutors = async () => {
    try {
      setLoading(true);

      if (!day || !time || !course_id) {
        Alert.alert("Error", "Missing required data");
        navigation.goBack();
        return;
      }

      const formattedTime = time.toLowerCase().replace(/\s/g, "");
      const formattedDay = day.toLowerCase().trim();


      const url = `${BASE_URL}/Student/search-by-time-location?day=${formattedDay}&time=${formattedTime}&userLat=${userLat}&userLng=${userLng}&courseId=${course_id}`;

      console.log("API URL:", url);

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setTutorsData(Array.isArray(data) ? data : []);
      } else {
        setTutorsData([]);
        Alert.alert("Info", data.message || "No tutors found");
      }
    } catch (error) {
      console.log("Fetch Error:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (tutorId) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BASE_URL}/Student/create-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tutor_id: tutorId,
          course_id: course_id,
          day: day,
          time: time,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Request sent successfully");
      } else {
        Alert.alert("Error", data.message || "Request failed");
      }
    } catch (error) {
      console.log("Request Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  const filteredTutors = tutorsData.filter((item) =>
    item?.tutor_name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderTutor = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.tutor_name}</Text>

      <Text style={styles.info}>
        📍 {item.location || "Unknown location"}
      </Text>

      <Text style={styles.info}>
        🚶 {item.distance ? item.distance.toFixed(2) : "0.00"} km away
      </Text>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => sendRequest(item.tutor_id)}
      >
        <Text style={styles.primaryText}>Request</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Find Tutor</Text>

        <View style={{ width: 26 }} />
      </View>

      <View style={styles.selectedBox}>
        <Text style={styles.selectedText}>
          {day && time ? `${day}, ${time}` : "No time selected"}
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          placeholder="Search tutor..."
          style={styles.input}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <FlatList
          data={filteredTutors}
          keyExtractor={(item) => item.tutor_id.toString()}
          renderItem={renderTutor}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No tutor found in your area
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default StudentFindTutor;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F4F6F9",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },

  selectedBox: {
    backgroundColor: "#caf8dd",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },

  selectedText: {
    color: colors.primary,
    fontWeight: "600",
  },

  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  input: {
    marginLeft: 10,
    flex: 1,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },

  name: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  info: {
    color: "#666",
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
});