import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/Ionicons";

import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const ParentChildProfile = ({ navigation, route }) => {
  const { studentId } = route.params;

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/child-profile/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Child Profile:", response.data);

      setChild(response.data);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to fetch child profile."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile();
  }, []);

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

  if (!child) {
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

        <View style={styles.empty}>
          <Icon
            name="person-circle-outline"
            size={90}
            color="#999"
          />

          <Text style={styles.emptyText}>
            Child profile not found.
          </Text>
        </View>
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

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >

        <View style={styles.profileCard}>

          <View style={styles.avatar}>
            <Icon
              name="person"
              size={70}
              color={colors.primary}
            />
          </View>

          <Text style={styles.name}>
            {child.fullName}
          </Text>

          <View style={styles.item}>
            <Icon
              name="mail-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.value}>
              {child.email}
            </Text>
          </View>

          <View style={styles.item}>
            <Icon
              name="call-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.value}>
              {child.phone || "Not Available"}
            </Text>
          </View>

          <View style={styles.item}>
            <Icon
              name="card-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.value}>
              {child.cnic}
            </Text>
          </View>

          <View style={styles.item}>
            <Icon
              name="location-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.value}>
              {child.location || "Location not available"}
            </Text>
          </View>

          <View style={styles.item}>
            <Icon
              name="navigate-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.value}>
              Latitude : {child.latitude ?? "-"}
            </Text>
          </View>

          <View style={styles.item}>
            <Icon
              name="compass-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.value}>
              Longitude : {child.longitude ?? "-"}
            </Text>
          </View>

        </View>

      </ScrollView>

    </SafeAreaView>
  );
};

export default ParentChildProfile;

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

  profileCard: {
    backgroundColor: "#fff",
    margin: 18,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#EEF4FF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 25,
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingBottom: 12,
  },

  value: {
    marginLeft: 12,
    fontSize: 16,
    color: "#444",
    flex: 1,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
  },
});