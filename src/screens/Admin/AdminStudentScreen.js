import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

const AdminStudentScreen = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH STUDENTS =================
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/Admin/all-students`
      );

      const result = await response.json();

      console.log("Students API Response:", result);

      if (response.ok) {
        setStudents(result);
      } else {
        Alert.alert(
          "Error",
          result.message || "Failed to load students"
        );
      }
    } catch (error) {
      console.log("Fetch Students Error:", error);

      Alert.alert(
        "Error",
        "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= BLOCK STUDENT =================
  const blockStudent = async (id) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/Admin/block-student/${id}`
      );

      console.log(
        "Block Student Response:",
        response.data
      );

      Alert.alert(
        "Success",
        response.data.message || "Student blocked successfully"
      );

      fetchStudents();
    } catch (error) {
      console.log(
        "Block Student Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to block student"
      );
    }
  };

  // ================= REJECT STUDENT =================
  const rejectStudent = async (id) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/Admin/reject-student/${id}`
      );

      console.log(
        "Reject Student Response:",
        response.data
      );

      Alert.alert(
        "Success",
        response.data.message || "Student rejected successfully"
      );

      fetchStudents();
    } catch (error) {
      console.log(
        "Reject Student Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to reject student"
      );
    }
  };

  // ================= CONFIRM BLOCK =================
  const confirmBlock = (id, name) => {
    Alert.alert(
      "Block Student",
      `Are you sure you want to block ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Block",
          style: "destructive",
          onPress: () => blockStudent(id),
        },
      ]
    );
  };

  // ================= CONFIRM REJECT =================
  const confirmReject = (id, name) => {
    Alert.alert(
      "Reject Student",
      `Are you sure you want to reject ${name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => rejectStudent(id),
        },
      ]
    );
  };

  // ================= STUDENT ITEM =================
  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* Student Information */}
      <View style={styles.row}>

        <Image
          source={{
            uri:
              "https://cdn-icons-png.flaticon.com/512/3135/3135810.png",
          }}
          style={styles.avatar}
        />

        <View style={styles.info}>

          <Text style={styles.name}>
            {item.fullName || "Unknown Student"}
          </Text>

          <Text style={styles.subText}>
            Email: {item.email || "Not Available"}
          </Text>

          <Text style={styles.subText}>
            Phone: {item.phone || "Not Available"}
          </Text>

          <Text style={styles.subText}>
            CNIC: {item.cnic || "Not Available"}
          </Text>

          <Text style={styles.subText}>
            Location: {item.location || "Not Available"}
          </Text>

          <Text style={styles.statusText}>
            Status: {item.status || "Active"}
          </Text>

        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>

        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() =>
            confirmReject(
              item.id,
              item.fullName
            )
          }
        >
          <Icon
            name="cancel"
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.buttonText}>
            Reject
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.blockBtn}
          onPress={() =>
            confirmBlock(
              item.id,
              item.fullName
            )
          }
        >
          <Icon
            name="block"
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.buttonText}>
            Block
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-back"
            size={26}
            color={colors.primary}
          />
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TouchableOpacity
          onPress={fetchStudents}
        >
          <Icon
            name="refresh"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

      </View>

      {/* ================= TITLE ================= */}
      <Text style={styles.screenTitle}>
        Student Management
      </Text>

      {/* ================= STUDENT LIST ================= */}
      {loading ? (

        <View style={styles.loaderContainer}>

          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.loadingText}>
            Loading students...
          </Text>

        </View>

      ) : (

        <FlatList
          data={students}
          keyExtractor={(item) =>
            item.id.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchStudents}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              No students available
            </Text>
          }
        />

      )}

      {/* ================= BOTTOM NAVIGATION ================= */}
      <View style={styles.bottomNav}>

        {/* HOME */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("AdminHome")
          }
        >
          <Icon
            name="home"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Home
          </Text>
        </TouchableOpacity>

        {/* TEACHER */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("AdminApprovedTutor")
          }
        >
          <Icon
            name="groups"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Teacher
          </Text>
        </TouchableOpacity>

        {/* STUDENT */}
        <TouchableOpacity
          style={styles.navItem}
        >
          <Icon
            name="school"
            size={24}
            color={colors.primary}
          />

          <Text style={styles.navTextActive}>
            Student
          </Text>
        </TouchableOpacity>

        {/* SUBJECT */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() =>
            navigation.navigate("AdminSubject")
          }
        >
          <Icon
            name="menu-book"
            size={24}
            color="#999"
          />

          <Text style={styles.navText}>
            Subject
          </Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
};

export default AdminStudentScreen;


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#EDE7F6",
    paddingHorizontal: 16,
  },

  // ================= HEADER =================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 40,
  },

  logo: {
    width: 120,
    height: 45,
  },

  // ================= TITLE =================

  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginVertical: 15,
    color: "#333",
  },

  // ================= CARD =================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },

  subText: {
    fontSize: 13,
    color: "#555",
    marginVertical: 2,
  },

  statusText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    marginTop: 5,
  },

  // ================= BUTTONS =================

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: "#FF9800",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 5,
    elevation: 2,
  },

  blockBtn: {
    flex: 1,
    backgroundColor: "#F44336",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginLeft: 5,
    elevation: 2,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 5,
  },

  // ================= LOADING =================

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },

  // ================= EMPTY =================

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
    color: "#777",
  },

  // ================= BOTTOM NAV =================

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderColor: "#DDD",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },

  navTextActive: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },

});