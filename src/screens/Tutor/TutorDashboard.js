import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const TutorDashboard = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  const [dashboard, setDashboard] = useState({
    totalClasses: 0,
    students: [],
  });

  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    getDashboard();
  }, []);

  const getDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${BASE_URL}/Tutor/my-dashboard`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await response.json();

      console.log("Dashboard Response:", json);

      setDashboard(json);
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = (studentId) => {
    setExpanded((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#2196F3" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={30} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <View style={{ width: 26 }} />
      </View>

      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={dashboard.students}
        keyExtractor={(item) => item.studentId.toString()}
        ListHeaderComponent={
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Classes</Text>

            <Text style={styles.totalClasses}>
              {dashboard.totalClasses}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <TouchableOpacity
              style={styles.header}
              onPress={() => toggleDropdown(item.studentId)}
            >
              <View>
                <Text style={styles.studentName}>
                  {item.studentName}
                </Text>

                <Text style={styles.count}>
                  Total Classes: {item.totalClasses}
                </Text>
              </View>

              <Icon
                name={
                  expanded[item.studentId]
                    ? "keyboard-arrow-up"
                    : "keyboard-arrow-down"
                }
                size={28}
                color="#000"
              />
            </TouchableOpacity>

            {expanded[item.studentId] && (
              <View style={styles.classContainer}>
                {item.classes.map((cls) => (
                  <View
                    key={cls.requestId}
                    style={styles.classItem}
                  >
                    <Text style={styles.classText}>
                      Request ID: {cls.requestId}
                    </Text>

                    <Text style={styles.classText}>
                      Date: {cls.classDate || "N/A"}
                    </Text>

                    <Text style={styles.classText}>
                      Time: {cls.time}
                    </Text>

                    <Text style={styles.classText}>
                      Type: {cls.requestType}
                    </Text>

                    <Text style={styles.classText}>
                      Status: {cls.status}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No Students Found
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default TutorDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F9",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    elevation: 2,
  },

  headerCenter: {
    alignItems: "center",
  },

  logoImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  card: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
  },

  totalClasses: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 10,
  },

  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  studentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  count: {
    color: "#666",
    marginTop: 4,
  },

  classContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },

  classItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  classText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});