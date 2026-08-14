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

const ParentChildren = ({ navigation }) => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchChildren = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/Parent/my-children`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Children:", response.data);

      setChildren(response.data || []);
    } catch (error) {
      console.log(error.response?.data || error);

      Alert.alert(
        "Error",
        error.response?.data?.message || "Unable to fetch children."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChildren();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate("ParentChildDetail", {
          studentId: item.studentId,
          userId: item.userId,
          fullName: item.fullName,
          email: item.email,
        })
      }
    >
      <View style={styles.avatar}>
        <Icon name="person" size={32} color={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.fullName}</Text>

        <View style={styles.row}>
          <Icon
            name="mail-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>{item.email}</Text>
        </View>

        <View style={styles.row}>
          <Icon
            name="call-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>
            {item.phone || "Not Available"}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon
            name="card-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>{item.cnic}</Text>
        </View>

        {/* <View style={styles.row}>
          <Icon
            name="location-outline"
            size={16}
            color={colors.primary}
          />
          <Text style={styles.value}>
            {item.location || "Location not available"}
          </Text>
        </View> */}
      </View>

      <Icon
        name="chevron-forward"
        size={22}
        color={colors.primary}
      />
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
          style={{ marginTop: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          {/* <Icon
            name="arrow-back"
            size={28}
            color={colors.primary}
          /> */}
        </TouchableOpacity>

        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
        />

        <View style={{ width: 45 }} >
          <TouchableOpacity onPress={() => navigation.navigate("AuthStack")}>
            <Text style={{ color:colors.primary, fontSize:14, fontWeight:"bold"}}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>My Children</Text>

      <FlatList
        data={children}
        keyExtractor={(item) => item.studentId.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon
              name="people-outline"
              size={80}
              color="#999"
            />
            <Text style={styles.emptyText}>
              No children found.
            </Text>
          </View>
        }
        contentContainerStyle={{
          padding: 15,
          paddingBottom: 40,
          flexGrow: children.length === 0 ? 1 : 0,
        }}
      />
    </SafeAreaView>
  );
};

export default ParentChildren;

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
    alignItems: "center",
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
});
