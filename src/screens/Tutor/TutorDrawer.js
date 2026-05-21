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

const TutorDrawer = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.profileSection}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>House of Tutor</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("TutorProfile")}
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
          onPress={() => navigation.navigate("TutorAllClasses")}
        >
          <View style={styles.menuRow}>
            <Icon name="logout" size={22} color="red" />
            <Text style={[styles.menuText, { color: "red" }]}>Tutor All Classes</Text>
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

export default TutorDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  header: {
    padding: 20,
  },

  profileSection: {
    alignItems: "center",
    marginTop: 20,
  },

  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },

  appName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  subText: {
    fontSize: 12,
    color: "#e0f7f5",
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
