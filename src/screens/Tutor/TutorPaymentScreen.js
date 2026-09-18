import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
  StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../utils/colors";
import { BASE_URL } from "../../config/api";

export default function TutorPaymentScreen({ navigation }) {
  // =========================================================
  // STATES
  // =========================================================

  // Payment records returned by backend
  const [payments, setPayments] = useState([]);

  // Total collected returned separately by backend
  const [totalCollected, setTotalCollected] = useState(0);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  // =========================================================
  // LOAD PAYMENTS WHEN SCREEN OPENS
  // =========================================================

  useEffect(() => {
    loadPayments();
  }, []);


  // =========================================================
  // LOAD PAYMENT LIST
  // =========================================================

  const loadPayments = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Login token not found.");
        return;
      }

      const res = await axios.get(
        `${BASE_URL}/Tutor/payment-list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      // =====================================================
      // BACKEND RESPONSE
      //
      // {
      //   payments: [...],
      //   totalCollected: 15000
      // }
      // =====================================================

      console.log("Payment API Response:", res.data);


      // =====================================================
      // SET PAYMENT LIST
      //
      // Backend already removes Received payments.
      // =====================================================

      setPayments(res.data?.payments || []);


      // =====================================================
      // SET TOTAL COLLECTED
      //
      // This value comes directly from backend.
      // Do NOT calculate it from payments.
      // =====================================================

      setTotalCollected(
        Number(res.data?.totalCollected || 0)
      );

    } catch (error) {
      console.log(
        "Payment List Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to load payments."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  // =========================================================
  // REFRESH
  // =========================================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPayments();
  }, []);


  // =========================================================
  // UPDATE PAYMENT STATUS
  // =========================================================

  const updateStatus = async (paymentId, status) => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Login token not found.");
        return;
      }

      await axios.put(
        `${BASE_URL}/Tutor/payment-status`,
        {
          paymentId: paymentId,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        "Payment status updated."
      );

      // Reload list and total collected
      loadPayments();

    } catch (error) {
      console.log(
        "Update Payment Error:",
        error.response?.data || error.message
      );

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to update payment."
      );
    }
  };


  // =========================================================
  // SUMMARY METRICS
  // =========================================================
  //
  // IMPORTANT:
  //
  // totalCollected comes from backend.
  //
  // payments only contains payments where:
  //
  // TutorStatus != "Received"
  //
  // Therefore we should NOT calculate totalReceived
  // from payments.
  // =========================================================

  const metrics = useMemo(() => {
    let totalPending = 0;

    payments.forEach((p) => {
      const amount = Number(p.amount) || 0;

      totalPending += amount;
    });

    return {
      totalCollected: totalCollected,
      totalPending: totalPending,
      totalCount: payments.length,
    };
  }, [payments, totalCollected]);


  // =========================================================
  // INFO ROW COMPONENT
  // =========================================================

  const InfoRow = ({
    icon,
    iconColor,
    label,
    value,
  }) => (
    <View style={styles.infoRow}>

      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: `${iconColor}15`,
          },
        ]}
      >
        <Icon
          name={icon}
          size={16}
          color={iconColor}
        />
      </View>

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={styles.infoValue}
        numberOfLines={1}
      >
        {value || "-"}
      </Text>

    </View>
  );


  // =========================================================
  // STATUS PILL COMPONENT
  // =========================================================

  const StatusPill = ({
    text,
    positive,
  }) => (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: positive
            ? "#ECFDF5"
            : "#FEF2F2",

          borderColor: positive
            ? "#A7F3D0"
            : "#FCA5A5",
        },
      ]}
    >

      <View
        style={[
          styles.pillDot,
          {
            backgroundColor: positive
              ? "#10B981"
              : "#EF4444",
          },
        ]}
      />

      <Text
        style={[
          styles.pillText,
          {
            color: positive
              ? "#047857"
              : "#B91C1C",
          },
        ]}
      >
        {text || "Pending"}
      </Text>

    </View>
  );


  // =========================================================
  // RENDER PAYMENT CARD
  // =========================================================

  const renderItem = ({ item }) => (
    <View style={styles.card}>

      {/* ===================================================
          STUDENT + AMOUNT
      =================================================== */}

      <View style={styles.cardHeader}>

        <View style={styles.studentBlock}>

          <View style={styles.avatarCircle}>
            <Icon
              name="account"
              size={22}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.studentTextGroup}>

            <Text style={styles.studentName}>
              {item.student || "Unknown Student"}
            </Text>

            <Text style={styles.courseName}>
              {item.course || "Unknown Course"}
            </Text>

          </View>

        </View>


        {/* Amount */}

        <View style={styles.amountContainer}>

          <Text style={styles.amountLabel}>
            AMOUNT
          </Text>

          <Text style={styles.amountText}>
            Rs.{" "}
            {Number(item.amount || 0).toLocaleString()}
          </Text>

        </View>

      </View>


      <View style={styles.divider} />


      {/* ===================================================
          PAYMENT INFORMATION
      =================================================== */}

      <View style={styles.metaContainer}>

        <InfoRow
          icon="credit-card-outline"
          iconColor="#F59E0B"
          label="Payment Method"
          value={item.paymentType}
        />

        <InfoRow
          icon="calendar-month-outline"
          iconColor="#3B82F6"
          label="Transaction Date"
          value={
            item.paymentDate
              ? new Date(
                  item.paymentDate
                ).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "-"
          }
        />

      </View>


      {/* ===================================================
          STATUS
      =================================================== */}

      <View style={styles.statusSection}>

        {/* Parent Status */}

        <View style={styles.statusBlock}>

          <Text style={styles.statusLabel}>
            Parent Status
          </Text>

          <StatusPill
            text={item.parentStatus}
            positive={
              item.parentStatus === "Paid"
            }
          />

        </View>


        {/* Tutor Status */}

        <View style={styles.statusBlock}>

          <Text style={styles.statusLabel}>
            Tutor Status
          </Text>

          <StatusPill
            text={item.tutorStatus}
            positive={
              item.tutorStatus === "Received"
            }
          />

        </View>

      </View>


      {/* ===================================================
          ACTION BUTTONS
      =================================================== */}

      <View style={styles.buttonRow}>

        {/* Mark Received */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.button,
            styles.receivedButton,
          ]}
          onPress={() =>
            updateStatus(
              item.paymentId,
              "Received"
            )
          }
        >

          <Icon
            name="check-circle"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.receivedButtonText}>
            Mark Received
          </Text>

        </TouchableOpacity>


        {/* Not Received */}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.button,
            styles.notReceivedButton,
          ]}
          onPress={() =>
            updateStatus(
              item.paymentId,
              "NotReceived"
            )
          }
        >

          <Icon
            name="close-circle-outline"
            size={18}
            color="#EF4444"
          />

          <Text style={styles.notReceivedButtonText}>
            Not Received
          </Text>

        </TouchableOpacity>

      </View>

    </View>
  );


  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
      >

        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        <ActivityIndicator
          size="large"
          color={
            colors.primary || "#4F46E5"
          }
        />

        <Text style={styles.loadingText}>
          Fetching payment history...
        </Text>

      </SafeAreaView>
    );
  }


  // =========================================================
  // MAIN SCREEN
  // =========================================================

  return (
    <SafeAreaView style={styles.container}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />


      {/* ===================================================
          TOP HEADER
      =================================================== */}

      <View style={styles.topHeader}>

        {/* Back Button */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >

          <Icon
            name="arrow-left"
            size={22}
            color="#1E293B"
          />

        </TouchableOpacity>


        {/* Logo */}

        <View style={styles.headerCenter}>

          <Image
            source={require(
              "../../../assets/images/logo.png"
            )}
            style={styles.logoImage}
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>

        </View>


        <View style={styles.headerSpacer} />

      </View>


      {/* ===================================================
          PAYMENT LIST
      =================================================== */}

      <FlatList
        data={payments}

        keyExtractor={(item) =>
          item.paymentId.toString()
        }

        renderItem={renderItem}

        contentContainerStyle={
          payments.length === 0
            ? styles.flexGrow
            : styles.listContent
        }

        showsVerticalScrollIndicator={false}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={
              colors.primary || "#4F46E5"
            }
          />
        }


        //=================================================
        //    HEADER / SUMMARY
        //================================================= 

        ListHeaderComponent={
          <View style={styles.headerContainer}>

            <View style={styles.titleRow}>

              <Text style={styles.screenTitle}>
                Payment Overview
              </Text>

              <Text style={styles.recordCount}>
                {payments.length}{" "}
                {payments.length === 1
                  ? "Record"
                  : "Records"}
              </Text>

            </View>


            {/* =================================================
                FINANCIAL SUMMARY
            ================================================= */}

            <View style={styles.summaryCard}>

              {/* Total Collected */}

              <View style={styles.summaryItem}>

                <Text style={styles.summaryLabel}>
                  Total Collected
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: "#10B981",
                    },
                  ]}
                >
                  Rs.{" "}
                  {Number(
                    metrics.totalCollected
                  ).toLocaleString()}
                </Text>

              </View>


              <View style={styles.summaryDivider} />


              {/* Pending Clearance */}

              <View style={styles.summaryItem}>

                <Text style={styles.summaryLabel}>
                  Pending Clearance
                </Text>

                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: "#F59E0B",
                    },
                  ]}
                >
                  Rs.{" "}
                  {Number(
                    metrics.totalPending
                  ).toLocaleString()}
                </Text>

              </View>

            </View>

          </View>
        }


        //  ===================================================
        //     EMPTY STATE
        // =================================================== 

        ListEmptyComponent={
          <View style={styles.emptyContainer}>

            <View style={styles.emptyIconCircle}>

              <Icon
                name="cash-multiple"
                size={36}
                color="#94A3B8"
              />

            </View>

            <Text style={styles.emptyTitle}>
              No Pending Payment Records Found
            </Text>

            <Text style={styles.emptySubtitle}>
              There are currently no payments
              waiting for your action.
            </Text>

          </View>
        }
      />

    </SafeAreaView>
  );
}


// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },


  // ===========================================================
  // TOP HEADER
  // ===========================================================

  topHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 26,
    height: 26,
    resizeMode: "contain",
    marginRight: 8,
  },

  logoText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary || "#4F46E5",
    letterSpacing: -0.2,
  },

  headerSpacer: {
    width: 36,
  },


  // ===========================================================
  // LIST HEADER
  // ===========================================================

  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },

  recordCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },


  // ===========================================================
  // SUMMARY CARD
  // ===========================================================

  summaryCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  summaryItem: {
    flex: 1,
    alignItems: "center",
  },

  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 2,
  },


  // ===========================================================
  // FLAT LIST
  // ===========================================================

  listContent: {
    paddingBottom: 24,
  },

  flexGrow: {
    flexGrow: 1,
  },


  // ===========================================================
  // PAYMENT CARD
  // ===========================================================

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  studentBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },

  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      colors.primary || "#4F46E5",
    alignItems: "center",

    // FIXED:
    // It was "justifycontent"
    justifyContent: "center",

    marginRight: 12,
  },

  studentTextGroup: {
    flex: 1,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  courseName: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },


  // ===========================================================
  // AMOUNT
  // ===========================================================

  amountContainer: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },

  amountText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#10B981",
    marginTop: 2,
  },


  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },


  // ===========================================================
  // META INFORMATION
  // ===========================================================

  metaContainer: {
    gap: 8,
    backgroundColor: "#F8FAFC",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    width: 110,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
    textAlign: "right",
  },


  // ===========================================================
  // STATUS
  // ===========================================================

  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },

  statusBlock: {
    flex: 1,
  },

  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },

  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },


  // ===========================================================
  // BUTTONS
  // ===========================================================

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },

  receivedButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  notReceivedButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  receivedButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  notReceivedButtonText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 13,
  },


  // ===========================================================
  // EMPTY STATE
  // ===========================================================

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },

  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },

});
