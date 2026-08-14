import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

import { BASE_URL } from "../../config/api";

const TutorClassHistory = () => {
  const navigation = useNavigation();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassHistory();
  }, []);

  const fetchClassHistory = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      console.log("TOKEN:", token);

      const response = await fetch(
        `${BASE_URL}/Tutor/tutor-class-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json = await response.json();

      console.log("History Response:", json);

      if (json.success) {
        setHistory(json.data || []);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.log("History Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.studentName}>{item.student_name}</Text>

          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>{item.status}</Text>
          </View>
        </View>

        {/* Course */}
        <View style={styles.row}>
          <Icon name="menu-book" size={20} color="#444" />
          <Text style={styles.infoText}>{item.course_name}</Text>
        </View>

        {/* Date */}
        <View style={styles.row}>
          <Icon name="calendar-month" size={20} color="#444" />
          <Text style={styles.infoText}>
            {item.class_date} ({item.day})
          </Text>
        </View>

        {/* Time */}
        <View style={styles.row}>
          <Icon name="access-time" size={20} color="#444" />
          <Text style={styles.infoText}>{item.time}</Text>
        </View>

        {/* Request Type */}
        <View style={styles.row}>
          <Icon name="repeat" size={20} color="#444" />
          <Text style={styles.infoText}>{item.request_type}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#5D3FD3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.appHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back-ios"
            size={22}
            color="#000"
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Empty view to keep logo centered */}
        <View style={styles.rightPlaceholder} />
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="history"
            size={80}
            color="#bbb"
          />

          <Text style={styles.emptyText}>
            No Class History Found
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) =>
            item.request_id.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default TutorClassHistory;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    paddingHorizontal: 15,
  },

  // ================= HEADER =================

  appHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: -15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    elevation: 4,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: 150,
    height: 45,
  },

  rightPlaceholder: {
    width: 40,
    height: 40,
  },

  // ================= CARD =================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    flex: 1,
    marginRight: 10,
  },

  completeBadge: {
    backgroundColor: "#28A745",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  completeText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "capitalize",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
    flex: 1,
  },

  // ================= LOADER =================

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },

  // ================= EMPTY =================

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777",
    fontWeight: "500",
  },
});