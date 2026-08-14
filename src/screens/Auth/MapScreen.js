import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppButton from "../../components/AppButton";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const MapScreen = ({ navigation, route }) => {
  const userId = route.params?.userId;

  const [region] = useState({
    latitude: 33.6844,
    longitude: 73.0479,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [marker, setMarker] = useState({
    latitude: 33.6844,
    longitude: 73.0479,
  });

  const [loading, setLoading] = useState(false);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setMarker(coordinate);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const userIdSafe = route?.params?.userId;

      console.log("UserId:", userIdSafe);
      console.log("Marker:", marker);

      await AsyncStorage.setItem("latitude", marker.latitude.toString());
      await AsyncStorage.setItem("longitude", marker.longitude.toString());

      console.log("Saved Lat/Lng:", marker.latitude, marker.longitude);

      if (!userIdSafe) {
        Alert.alert("Error", "UserId not received from signup");
        return;
      }

      // 🔵 API call (unchanged logic)
      const response = await fetch(`${BASE_URL}/Auth/update-location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userIdSafe,
          latitude: marker.latitude,
          longitude: marker.longitude,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `Location saved\n\n${data.address || ""}`,
          [
            {
              text: "OK",
              onPress: () => navigation.replace("Login"),
            },
          ]
        );
      } else {
        Alert.alert("Warning", data.message || "Saved locally but server failed");
      }
    } catch (error) {
      console.log("ERROR:", error);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Location</Text>

      <MapView
        style={styles.map}
        initialRegion={region}
        onPress={handleMapPress}
      >
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        <Marker coordinate={marker} />
      </MapView>

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <AppButton
            title="Confirm Location"
            onPress={handleSubmit}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  map: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
  },
  buttonContainer: {
    padding: 15,
  },
});


















// import React, { useState } from "react";
// import {
//   View,
//   StyleSheet,
//   SafeAreaView,
//   Text,
//   Alert,
//   ActivityIndicator,
// } from "react-native";
// import MapView, { Marker, UrlTile } from "react-native-maps";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import AppButton from "../../components/AppButton";
// import { BASE_URL } from "../../config/api";

// const MapScreen = ({ navigation, route }) => {
//   const userId = route.params?.userId;

//   const [region] = useState({
//     latitude: 33.6844,
//     longitude: 73.0479,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   });

//   const [marker, setMarker] = useState({
//     latitude: 33.6844,
//     longitude: 73.0479,
//   });

//   const [loading, setLoading] = useState(false);

//   const handleMapPress = (event) => {
//     const { coordinate } = event.nativeEvent;
//     setMarker(coordinate);
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);

//       const userIdSafe = route?.params?.userId;

//       console.log("UserId:", userIdSafe);
//       console.log("Marker:", marker);

//       await AsyncStorage.setItem("latitude", marker.latitude.toString());
//       await AsyncStorage.setItem("longitude", marker.longitude.toString());

//       console.log("Saved Lat/Lng:", marker.latitude, marker.longitude);

//       if (!userIdSafe) {
//         Alert.alert("Error", "UserId not received from signup");
//         return;
//       }

//       // 🔵 API call (unchanged logic)
//       const response = await fetch(`${BASE_URL}/Auth/update-location`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: userIdSafe,
//           latitude: marker.latitude,
//           longitude: marker.longitude,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert(
//           "Success",
//           `Location saved\n\n${data.address || ""}`,
//           [
//             {
//               text: "OK",
//               onPress: () => navigation.replace("Login"),
//             },
//           ]
//         );
//       } else {
//         Alert.alert("Warning", data.message || "Saved locally but server failed");
//       }
//     } catch (error) {
//       console.log("ERROR:", error);
//       Alert.alert("Error", error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>Select Location</Text>

//       <MapView
//         style={styles.map}
//         initialRegion={region}
//         onPress={handleMapPress}
//       >
//         <UrlTile
//           urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           maximumZ={19}
//         />

//         <Marker coordinate={marker} />
//       </MapView>

//       <View style={styles.buttonContainer}>
//         {loading ? (
//           <ActivityIndicator size="large" />
//         ) : (
//           <AppButton
//             title="Confirm Location"
//             onPress={handleSubmit}
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#EDEAF0",
//   },
//   title: {
//     textAlign: "center",
//     marginTop: 10,
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   map: {
//     flex: 1,
//     margin: 10,
//     borderRadius: 12,
//   },
//   buttonContainer: {
//     padding: 15,
//   },
// });