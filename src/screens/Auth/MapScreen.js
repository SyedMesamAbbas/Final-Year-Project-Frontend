import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { BASE_URL } from "../../config/api";
import colors from "../utils/colors";

const PRIMARY_COLOR = colors?.primary || "#4F46E5";

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

      // API call (unchanged logic)
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
          `Location saved successfully!\n\n${data.address || ""}`,
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Floating Header Surface */}
      <View style={styles.headerCard}>
        <View style={styles.headerTextRow}>
          <View style={styles.headerIconCircle}>
            <Icon name="my-location" size={20} color={PRIMARY_COLOR} />
          </View>
          <View>
            <Text style={styles.title}>Select Your Location</Text>
            <Text style={styles.subtitle}>
              Tap on the map to drop pin at your home or tutor center
            </Text>
          </View>
        </View>
      </View>

      {/* Full Area Interactive Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          onPress={handleMapPress}
          showsUserLocation={false}
        >
          <UrlTile
            urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maximumZ={19}
          />

          <Marker coordinate={marker}>
            <View style={styles.customMarkerContainer}>
              <View style={styles.markerBadge}>
                <Icon name="location-on" size={28} color="#EF4444" />
              </View>
              <View style={styles.markerPinPulse} />
            </View>
          </Marker>
        </MapView>

        {/* Dynamic Instruction Badge */}
        <View style={styles.instructionBadge}>
          <Icon name="touch-app" size={16} color="#475569" />
          <Text style={styles.instructionText}>
            Tap anywhere to update marker location
          </Text>
        </View>
      </View>

      {/* Bottom Action Sheet Card */}
      <View style={styles.bottomCard}>
        {/* Selected Coordinates Chip Row */}
        <View style={styles.coordsRow}>
          <View style={styles.coordChip}>
            <Text style={styles.coordLabel}>LAT</Text>
            <Text style={styles.coordValue}>
              {marker.latitude.toFixed(4)}
            </Text>
          </View>
          <View style={styles.coordChip}>
            <Text style={styles.coordLabel}>LNG</Text>
            <Text style={styles.coordValue}>
              {marker.longitude.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Icon name="check-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header Card
  headerCard: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    zIndex: 10,
    elevation: 3,
  },
  headerTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  // Map Canvas
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  customMarkerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  markerPinPulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginTop: 2,
  },

  // Floating Instruction Badge
  instructionBadge: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },

  // Bottom Card & Action Button
  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  coordsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  coordChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  coordLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },
  coordValue: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY_COLOR,
  },
  confirmBtn: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.7,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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
//   TouchableOpacity,
// } from "react-native";
// import MapView, { Marker, UrlTile } from "react-native-maps";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../../config/api";
// import colors from "../utils/colors";

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
//           <ActivityIndicator size="large" color={colors.primary} />
//         ) : (
//           <TouchableOpacity
//             style={styles.confirmBtn}
//             onPress={handleSubmit}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.confirmBtnText}>Confirm Location</Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default MapScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.background,
//   },
//   title: {
//     textAlign: "center",
//     marginTop: 10,
//     fontSize: 18,
//     fontWeight: "600",
//     color: colors.textDark,
//   },
//   map: {
//     flex: 1,
//     margin: 10,
//     borderRadius: 12,
//   },
//   buttonContainer: {
//     padding: 15,
//   },
//   confirmBtn: {
//     backgroundColor: colors.primary,
//     borderRadius: 12,
//     height: 50,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   confirmBtnText: {
//     color: colors.textInverse,
//     fontSize: 16,
//     fontWeight: "700",
//   },
// });












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
// import colors from "../utils/colors";

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
//           <ActivityIndicator size="large" color={colors.primary} />
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
//     backgroundColor: colors.background,
//   },
//   title: {
//     textAlign: "center",
//     marginTop: 10,
//     fontSize: 18,
//     fontWeight: "600",
//     color: colors.textPrimary,
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


















// // import React, { useState } from "react";
// // import {
// //   View,
// //   StyleSheet,
// //   SafeAreaView,
// //   Text,
// //   Alert,
// //   ActivityIndicator,
// // } from "react-native";
// // import MapView, { Marker, UrlTile } from "react-native-maps";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import AppButton from "../../components/AppButton";
// // import { BASE_URL } from "../../config/api";

// // const MapScreen = ({ navigation, route }) => {
// //   const userId = route.params?.userId;

// //   const [region] = useState({
// //     latitude: 33.6844,
// //     longitude: 73.0479,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   });

// //   const [marker, setMarker] = useState({
// //     latitude: 33.6844,
// //     longitude: 73.0479,
// //   });

// //   const [loading, setLoading] = useState(false);

// //   const handleMapPress = (event) => {
// //     const { coordinate } = event.nativeEvent;
// //     setMarker(coordinate);
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       setLoading(true);

// //       const userIdSafe = route?.params?.userId;

// //       console.log("UserId:", userIdSafe);
// //       console.log("Marker:", marker);

// //       await AsyncStorage.setItem("latitude", marker.latitude.toString());
// //       await AsyncStorage.setItem("longitude", marker.longitude.toString());

// //       console.log("Saved Lat/Lng:", marker.latitude, marker.longitude);

// //       if (!userIdSafe) {
// //         Alert.alert("Error", "UserId not received from signup");
// //         return;
// //       }

// //       // 🔵 API call (unchanged logic)
// //       const response = await fetch(`${BASE_URL}/Auth/update-location`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           userId: userIdSafe,
// //           latitude: marker.latitude,
// //           longitude: marker.longitude,
// //         }),
// //       });

// //       const data = await response.json();

// //       if (response.ok) {
// //         Alert.alert(
// //           "Success",
// //           `Location saved\n\n${data.address || ""}`,
// //           [
// //             {
// //               text: "OK",
// //               onPress: () => navigation.replace("Login"),
// //             },
// //           ]
// //         );
// //       } else {
// //         Alert.alert("Warning", data.message || "Saved locally but server failed");
// //       }
// //     } catch (error) {
// //       console.log("ERROR:", error);
// //       Alert.alert("Error", error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <Text style={styles.title}>Select Location</Text>

// //       <MapView
// //         style={styles.map}
// //         initialRegion={region}
// //         onPress={handleMapPress}
// //       >
// //         <UrlTile
// //           urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// //           maximumZ={19}
// //         />

// //         <Marker coordinate={marker} />
// //       </MapView>

// //       <View style={styles.buttonContainer}>
// //         {loading ? (
// //           <ActivityIndicator size="large" />
// //         ) : (
// //           <AppButton
// //             title="Confirm Location"
// //             onPress={handleSubmit}
// //           />
// //         )}
// //       </View>
// //     </SafeAreaView>
// //   );
// // };

// // export default MapScreen;

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#EDEAF0",
// //   },
// //   title: {
// //     textAlign: "center",
// //     marginTop: 10,
// //     fontSize: 18,
// //     fontWeight: "600",
// //   },
// //   map: {
// //     flex: 1,
// //     margin: 10,
// //     borderRadius: 12,
// //   },
// //   buttonContainer: {
// //     padding: 15,
// //   },
// // });