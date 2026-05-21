import React, { useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  TouchableOpacity
} from "react-native";
import AppButton from "../../components/AppButton";
import colors from "../utils/colors";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../../config/api";

const StudentSignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: "",
    cnic: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (
      !form.name ||
      !form.cnic ||
      !form.phone ||
      !form.email ||
      !form.password
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/Auth/register`, {
        fullName: form.name,
        cnic: form.cnic,
        phone: form.phone,
        email: form.email,
        password: form.password,
        role: "Student",
      });

      const userId = response.data.userId;

      Alert.alert("Success", "Account created! Now select location");

      navigation.navigate("Map", {
        userId: Number(userId),
      });

    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Image
          source={require("../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Create Your Account</Text>

        <View style={styles.inputContainer}>
          <Icon name="person-outline" size={20} color="#555" />
          <TextInput
            placeholder="Enter Your Full Name"
            placeholderTextColor="#6e6e6e"
            style={styles.input}
            value={form.name}
            onChangeText={(val) => handleChange("name", val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="card-outline" size={20} color="#555" />
          <TextInput
            placeholder="Enter Your CNIC"
            placeholderTextColor="#6e6e6e"
            style={styles.input}
            value={form.cnic}
            onChangeText={(val) => handleChange("cnic", val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="call-outline" size={20} color="#555" />
          <TextInput
            placeholder="Enter Phone Number"
            placeholderTextColor="#6e6e6e"
            style={styles.input}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(val) => handleChange("phone", val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="mail-outline" size={20} color="#555" />
          <TextInput
            placeholder="Enter Email"
            placeholderTextColor="#6e6e6e"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(val) => handleChange("email", val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} color="#555" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#6e6e6e"
            secureTextEntry
            style={styles.input}
            onChangeText={(val) => handleChange("password", val)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} color="#555" />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#6e6e6e"
            secureTextEntry
            style={styles.input}
            onChangeText={(val) =>
              handleChange("confirmPassword", val)
            }
          />
        </View>

        <AppButton title="Register" onPress={handleSubmit} />

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>
            Already have an account?
          </Text>
        </TouchableOpacity>        
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentSignUpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEAF0" },
  inner: { padding: 16 },

  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginTop: 40,
  },

  title: {
    fontSize: 26,
    textAlign: "center",
    marginVertical: 20,
    color: colors.primary,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 10,
    marginVertical: 6,
  },

  input: {
    flex: 1,
    height: 45,
    marginLeft: 10,
    fontSize: 16,
    color: "#000",
  },
  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: colors.primary,
    fontSize: 16,
  },
});