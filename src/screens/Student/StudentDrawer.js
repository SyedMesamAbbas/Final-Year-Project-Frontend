import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../utils/colors";

const StudentDrawer = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImg}
          />
          <Text style={styles.logoText}>House of Tutor</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("StudentProfile")}
        >
          <View style={styles.menuRow}>
            <Icon name="logout" size={22} color="red" />
            <Text style={[styles.menuText, { color: "red" }]}>Profile</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("AuthStack")}
        >
          <View style={styles.menuRow}>
            <Icon name="logout" size={22} color="red" />
            <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default StudentDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop:35
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImg: {
    width: 35,
    height: 35,
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },

  menu: {
    marginTop: 20,
  },
  menuItem: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 3,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
    color: "#333",
  },
});
