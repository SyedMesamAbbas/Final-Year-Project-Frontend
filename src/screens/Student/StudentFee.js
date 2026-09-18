import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import { BASE_URL } from "../../config/api";

// =====================================================
// STUDENT FEE SCREEN
// =====================================================

const StudentFee = ({ navigation }) => {
  // =====================================================
  // STUDENT INFORMATION
  // =====================================================

  const [studentId, setStudentId] = useState(null);
  const [studentName, setStudentName] = useState("");

  // =====================================================
  // FEE RESPONSIBILITY
  // ByMe / ByParent
  // =====================================================

  const [feeResponsibility, setFeeResponsibility] = useState("");

  // =====================================================
  // COURSE FEES
  // =====================================================

  const [fees, setFees] = useState([]);

  // =====================================================
  // TOTALS
  // =====================================================

  const [totalFee, setTotalFee] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalRemaining, setTotalRemaining] = useState(0);

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // PAYMENT LOADING
  // =====================================================

  const [paymentLoading, setPaymentLoading] = useState(null);

  // =====================================================
  // PARTIAL PAYMENT AMOUNTS
  // =====================================================

  const [partialAmounts, setPartialAmounts] = useState({});

  // =====================================================
  // OPEN PARTIAL PAYMENT
  // =====================================================

  const [partialOpenFeeId, setPartialOpenFeeId] = useState(null);

  // =====================================================
  // GET TOKEN
  // =====================================================

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    return token;
  };

  // =====================================================
  // GET STUDENT FEE
  //
  // GET /api/Student/student-fee
  // =====================================================

  const getStudentFee = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session has expired. Please login again."
        );
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/Student/student-fee`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      console.log("=================================");
      console.log("Student Fee Response:");
      console.log(data);
      console.log("=================================");

      // Student
      setStudentId(data.studentId ?? null);

      setStudentName(
        data.studentName || "Student"
      );

      // Fee responsibility
      setFeeResponsibility(
        data.feeResponsibility || ""
      );

      // Total fee
      setTotalFee(
        Number(data.totalFee) || 0
      );

      // Total paid
      setTotalPaid(
        Number(data.totalPaid) || 0
      );

      // Total remaining
      setTotalRemaining(
        Number(data.totalRemaining) || 0
      );

      // Courses
      setFees(
        Array.isArray(data.courses)
          ? data.courses
          : []
      );
    } catch (error) {
      console.log(
        "Get Student Fee Error:",
        error?.response?.data || error.message
      );

      let message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Unable to load your course fee.";

      if (typeof message !== "string") {
        message = "Unable to load your course fee.";
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const onRefresh = async () => {
    setRefreshing(true);

    await getStudentFee(false);

    setRefreshing(false);
  };

  // =====================================================
  // LOAD SCREEN
  // =====================================================

  useEffect(() => {
    getStudentFee();
  }, []);

  // =====================================================
  // UPDATE PARTIAL AMOUNT
  // =====================================================

  const updatePartialAmount = (feeId, value) => {
    setPartialAmounts((previous) => ({
      ...previous,
      [feeId]: value,
    }));
  };

  // =====================================================
  // SEND STUDENT PAYMENT
  //
  // POST /api/Student/student-send-payment
  // =====================================================

  const sendStudentPayment = async (fee, amount) => {
    try {
      // Check amount
      if (!amount || Number(amount) <= 0) {
        Alert.alert(
          "Invalid Amount",
          "Please enter a valid payment amount."
        );
        return;
      }

      // Remaining amount
      const remaining =
        Number(fee.remaining) || 0;

      // Amount cannot be greater than remaining
      if (Number(amount) > remaining) {
        Alert.alert(
          "Invalid Amount",
          "Payment amount cannot be greater than remaining fee."
        );
        return;
      }

      // Token
      const token = await getToken();

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session has expired. Please login again."
        );
        return;
      }

      // Payment loading
      setPaymentLoading(fee.feeId);

      // Payment API
      const response = await axios.post(
        `${BASE_URL}/Student/student-send-payment`,
        {
          feeId: fee.feeId,
          amount: Number(amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      console.log(
        "Student Payment Response:",
        data
      );

      // Clear partial amount
      setPartialAmounts((previous) => ({
        ...previous,
        [fee.feeId]: "",
      }));

      // Close partial payment
      setPartialOpenFeeId(null);

      // Success
      Alert.alert(
        "Payment Submitted",
        `${data.message || "Payment Sent Successfully."}\n\n` +
          `Amount: Rs. ${Number(
            data.amount || amount
          ).toLocaleString()}\n` +
          `Payment Type: ${
            data.paymentType || "Partial"
          }`,
        [
          {
            text: "OK",
            onPress: async () => {
              await getStudentFee(false);
            },
          },
        ]
      );
    } catch (error) {
      console.log(
        "Student Payment Error:",
        error?.response?.data || error.message
      );

      let message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Payment could not be processed.";

      if (typeof message !== "string") {
        message = "Payment could not be processed.";
      }

      Alert.alert(
        "Payment Error",
        message
      );
    } finally {
      setPaymentLoading(null);
    }
  };

  // =====================================================
  // FULL PAYMENT
  // =====================================================

  const handleFullPayment = (fee) => {
    const remaining =
      Number(fee.remaining) || 0;

    if (remaining <= 0) {
      Alert.alert(
        "Already Paid",
        "This course fee has already been fully paid."
      );
      return;
    }

    Alert.alert(
      "Confirm Full Payment",
      `Are you sure you want to pay the full remaining fee?\n\n` +
        `Course: ${
          fee.course || "Course"
        }\n` +
        `Amount: Rs. ${remaining.toLocaleString()}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay Full",
          onPress: () => {
            sendStudentPayment(
              fee,
              remaining
            );
          },
        },
      ]
    );
  };

  // =====================================================
  // OPEN PARTIAL PAYMENT
  // =====================================================

  const openPartialPayment = (fee) => {
    const remaining =
      Number(fee.remaining) || 0;

    if (remaining <= 0) {
      Alert.alert(
        "Already Paid",
        "This course fee has already been fully paid."
      );
      return;
    }

    if (partialOpenFeeId === fee.feeId) {
      setPartialOpenFeeId(null);
    } else {
      setPartialOpenFeeId(fee.feeId);
    }
  };

  // =====================================================
  // SUBMIT PARTIAL PAYMENT
  // =====================================================

  const handlePartialPayment = (fee) => {
    const amountText =
      partialAmounts[fee.feeId] || "";

    const amount = Number(amountText);

    if (!amountText || amount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid payment amount."
      );
      return;
    }

    const remaining =
      Number(fee.remaining) || 0;

    if (amount > remaining) {
      Alert.alert(
        "Invalid Amount",
        "Payment amount cannot be greater than remaining fee."
      );
      return;
    }

    Alert.alert(
      "Confirm Partial Payment",
      `Are you sure you want to submit this payment?\n\n` +
        `Course: ${
          fee.course || "Course"
        }\n` +
        `Amount: Rs. ${amount.toLocaleString()}\n` +
        `Remaining After Payment: Rs. ${(
          remaining - amount
        ).toLocaleString()}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay",
          onPress: () => {
            sendStudentPayment(
              fee,
              amount
            );
          },
        },
      ]
    );
  };

  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const money = (value) => {
    return Number(
      value || 0
    ).toLocaleString();
  };

  // =====================================================
  // COURSE CARD
  // =====================================================

  const renderFeeCard = (fee) => {
    const total =
      Number(fee.totalFee) || 0;

    const paid =
      Number(fee.paid) || 0;

    const remaining =
      Number(fee.remaining) || 0;

    const isFullyPaid =
      remaining <= 0;

    const canPay =
      feeResponsibility === "ByMe" &&
      !isFullyPaid;

    const partialOpen =
      partialOpenFeeId === fee.feeId;

    return (
      <View
        key={fee.feeId}
        style={styles.courseCard}
      >
        {/* =================================================
            COURSE HEADER
        ================================================= */}

        <View style={styles.courseHeader}>
          <View style={styles.courseTitleArea}>
            <Text
              style={styles.courseTitle}
              numberOfLines={1}
            >
              {fee.course || "Course"}
            </Text>

            <View style={styles.tutorRow}>
              <View style={styles.tutorIconCircle}>
                <Text style={styles.tutorIcon}>
                  T
                </Text>
              </View>

              <Text
                style={styles.tutorName}
                numberOfLines={1}
              >
                {fee.tutor || "Unknown Tutor"}
              </Text>
            </View>
          </View>

          {/* STATUS */}

          <View
            style={
              isFullyPaid
                ? styles.paidBadge
                : styles.pendingBadge
            }
          >
            <View
              style={
                isFullyPaid
                  ? styles.paidDot
                  : styles.pendingDot
              }
            />

            <Text
              style={
                isFullyPaid
                  ? styles.paidBadgeText
                  : styles.pendingBadgeText
              }
            >
              {isFullyPaid
                ? "Paid"
                : "Pending"}
            </Text>
          </View>
        </View>

        {/* DIVIDER */}

        <View style={styles.courseDivider} />

        {/* =================================================
            COURSE FEE VALUES
        ================================================= */}

        <View style={styles.courseFeeRow}>
          {/* TOTAL */}

          <View style={styles.courseFeeColumn}>
            <Text style={styles.courseFeeLabel}>
              Total
            </Text>

            <Text style={styles.courseTotal}>
              Rs. {money(total)}
            </Text>
          </View>

          {/* PAID */}

          <View style={styles.courseFeeColumn}>
            <Text style={styles.courseFeeLabel}>
              Paid
            </Text>

            <Text style={styles.coursePaid}>
              Rs. {money(paid)}
            </Text>
          </View>

          {/* REMAINING */}

          <View style={styles.courseFeeColumn}>
            <Text style={styles.courseFeeLabel}>
              Remaining
            </Text>

            <Text style={styles.courseRemaining}>
              Rs. {money(remaining)}
            </Text>
          </View>
        </View>

        {/* =================================================
            PAYMENT BUTTONS
        ================================================= */}

        {canPay && (
          <View style={styles.coursePaymentArea}>
            {/* FULL PAYMENT */}

            <TouchableOpacity
              style={styles.courseFullButton}
              onPress={() =>
                handleFullPayment(fee)
              }
              disabled={
                paymentLoading === fee.feeId
              }
              activeOpacity={0.8}
            >
              {paymentLoading === fee.feeId ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Text style={styles.checkIcon}>
                    ✓
                  </Text>

                  <Text
                    style={styles.courseFullButtonText}
                  >
                    Pay Full
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* PARTIAL PAYMENT */}

            <TouchableOpacity
              style={styles.coursePartialButton}
              onPress={() =>
                openPartialPayment(fee)
              }
              disabled={
                paymentLoading === fee.feeId
              }
              activeOpacity={0.8}
            >
              <Text style={styles.editIcon}>
                +
              </Text>

              <Text
                style={
                  styles.coursePartialButtonText
                }
              >
                Partial
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            PARTIAL PAYMENT INPUT
        ================================================= */}

        {canPay && partialOpen && (
          <View style={styles.partialBox}>
            <Text style={styles.partialLabel}>
              Enter Partial Amount
            </Text>

            <TextInput
              style={styles.partialInput}
              placeholder="Enter amount"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={
                partialAmounts[
                  fee.feeId
                ] || ""
              }
              onChangeText={(value) =>
                updatePartialAmount(
                  fee.feeId,
                  value
                )
              }
              editable={
                paymentLoading !== fee.feeId
              }
            />

            <TouchableOpacity
              style={styles.submitPartialButton}
              onPress={() =>
                handlePartialPayment(fee)
              }
              disabled={
                paymentLoading === fee.feeId
              }
              activeOpacity={0.8}
            >
              {paymentLoading === fee.feeId ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={styles.submitPartialText}
                >
                  Submit Payment
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* =================================================
            FULLY PAID MESSAGE
        ================================================= */}

        {isFullyPaid && (
          <View style={styles.fullyPaidBox}>
            <View style={styles.successCircle}>
              <Text style={styles.successCheck}>
                ✓
              </Text>
            </View>

            <Text style={styles.fullyPaidText}>
              Fee Fully Paid
            </Text>
          </View>
        )}
      </View>
    );
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#FFFFFF"
        />

        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() =>
              navigation?.goBack()
            }
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>
              ‹
            </Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Image
              source={require("../../../assets/images/logo.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />

            <Text style={styles.headerTitle}>
              House of Tutor
            </Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        {/* LOADING */}

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#249688"
          />

          <Text style={styles.loadingText}>
            Loading your fees...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // MAIN SCREEN
  // =====================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        {/* BACK */}

        <TouchableOpacity
          onPress={() =>
            navigation?.goBack()
          }
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>
            ‹
          </Text>
        </TouchableOpacity>

        {/* LOGO + TITLE */}

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />

          <Text style={styles.headerTitle}>
            House of Tutor
          </Text>
        </View>

        {/* RIGHT SPACE */}

        <View style={styles.headerRight} />
      </View>

      {/* =================================================
          MAIN SCROLL
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#249688"]}
            tintColor="#249688"
          />
        }
      >
        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <View style={styles.pageTitleRow}>
          <View>
            <Text style={styles.pageTitle}>
              My Fee Statement
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage and track your course fees
            </Text>
          </View>
        </View>

        {/* =================================================
            OVERALL STATEMENT CARD
        ================================================= */}

        <View style={styles.statementCard}>
          {/* TOP */}

          <View style={styles.statementTop}>
            <View style={styles.statementTitleArea}>
              <Text style={styles.overallLabel}>
                OVERALL STATEMENT
              </Text>

              <Text style={styles.statementTitle}>
                Total Balance
              </Text>
            </View>
          </View>

          {/* TOTAL */}

          <View style={styles.totalBalanceRow}>
            <Text style={styles.rsText}>
              Rs.
            </Text>

            <Text style={styles.totalBalance}>
              {money(totalFee)}
            </Text>
          </View>

          {/* PAID / REMAINING */}

          <View style={styles.balanceBox}>
            {/* PAID */}

            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>
                Paid
              </Text>

              <Text style={styles.balancePaid}>
                Rs. {money(totalPaid)}
              </Text>
            </View>

            <View style={styles.balanceDivider} />

            {/* REMAINING */}

            <View style={styles.balanceColumn}>
              <Text style={styles.balanceLabel}>
                Remaining
              </Text>

              <Text
                style={styles.balanceRemaining}
              >
                Rs. {money(totalRemaining)}
              </Text>
            </View>
          </View>

          {/* FEE RESPONSIBILITY */}

          {feeResponsibility !== "" && (
            <View
              style={
                styles.responsibilitySmall
              }
            >
              <Text
                style={
                  styles.responsibilitySmallLabel
                }
              >
                Fee Responsibility
              </Text>

              <View
                style={
                  styles.responsibilityBadge
                }
              >
                <Text
                  style={
                    styles.responsibilitySmallValue
                  }
                >
                  {feeResponsibility ===
                  "ByMe"
                    ? "By Me"
                    : feeResponsibility ===
                      "ByParent"
                    ? "By Parent"
                    : feeResponsibility}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* =================================================
            BY PARENT MESSAGE
        ================================================= */}

        {feeResponsibility ===
          "ByParent" && (
          <View
            style={
              styles.parentMessageBox
            }
          >
            <View
              style={
                styles.parentMessageIcon
              }
            >
              <Text
                style={
                  styles.parentMessageIconText
                }
              >
                i
              </Text>
            </View>

            <View
              style={
                styles.parentMessageContent
              }
            >
              <Text
                style={
                  styles.parentMessageTitle
                }
              >
                Fee Payment Managed by Parent
              </Text>

              <Text
                style={
                  styles.parentMessageText
                }
              >
                Fee concerns are discussed
                with your parent because
                you selected By Parent.
              </Text>
            </View>
          </View>
        )}

        {/* =================================================
            COURSE BREAKDOWN
        ================================================= */}

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>
              Course Fees
            </Text>

            <Text style={styles.sectionSubtitle}>
              Your enrolled course payments
            </Text>
          </View>

          <View style={styles.courseCountBadge}>
            <Text style={styles.courseCountText}>
              {fees.length}
            </Text>
          </View>
        </View>

        {/* =================================================
            NO COURSE
        ================================================= */}

        {fees.length === 0 && (
          <View style={styles.noFeeBox}>
            <View style={styles.noFeeIcon}>
              <Text style={styles.noFeeIconText}>
                ₨
              </Text>
            </View>

            <Text style={styles.noFeeTitle}>
              No Course Fee Found
            </Text>

            <Text style={styles.noFeeText}>
              You currently do not have any
              course fee.
            </Text>
          </View>
        )}

        {/* =================================================
            COURSE LIST
        ================================================= */}

        {fees.map((fee) =>
          renderFeeCard(fee)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentFee;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // =====================================================
  // MAIN
  // =====================================================

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    height: 68,

    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 16,

    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  backButton: {
    width: 40,
    height: 40,

    borderRadius: 12,

    backgroundColor: "#F1F5F9",

    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: {
    color: "#07152E",

    fontSize: 35,

    lineHeight: 36,

    marginTop: -4,
  },

  headerCenter: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",
  },

  headerLogo: {
    width: 31,
    height: 31,

    marginRight: 7,
  },

  headerTitle: {
    color: "#07152E",

    fontSize: 15,

    fontWeight: "800",
  },

  headerRight: {
    width: 40,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,

    color: "#64748B",

    fontSize: 14,
  },

  // =====================================================
  // SCROLL
  // =====================================================

  scrollContent: {
    paddingHorizontal: 16,

    paddingTop: 18,

    paddingBottom: 40,
  },

  // =====================================================
  // PAGE TITLE
  // =====================================================

  pageTitleRow: {
    marginBottom: 16,
  },

  pageTitle: {
    color: "#07152E",

    fontSize: 24,

    fontWeight: "800",

    marginBottom: 4,
  },

  pageSubtitle: {
    color: "#64748B",

    fontSize: 13,
  },

  // =====================================================
  // OVERALL STATEMENT CARD
  // =====================================================

  statementCard: {
    backgroundColor: "#0E172B",

    borderRadius: 20,

    padding: 18,

    marginBottom: 20,

    elevation: 4,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.15,

    shadowRadius: 6,
  },

  statementTop: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  statementTitleArea: {
    flex: 1,
  },

  overallLabel: {
    color: "#94A3B8",

    fontSize: 10,

    fontWeight: "800",

    letterSpacing: 1.1,

    marginBottom: 4,
  },

  statementTitle: {
    color: "#FFFFFF",

    fontSize: 20,

    fontWeight: "800",
  },

  walletCircle: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor: "#263148",

    justifyContent: "center",

    alignItems: "center",
  },

  walletIcon: {
    color: "#FFFFFF",

    fontSize: 21,

    fontWeight: "800",
  },

  // =====================================================
  // TOTAL BALANCE
  // =====================================================

  totalBalanceRow: {
    flexDirection: "row",

    alignItems: "baseline",

    marginTop: 20,

    marginBottom: 16,
  },

  rsText: {
    color: "#94A3B8",

    fontSize: 17,

    marginRight: 6,
  },

  totalBalance: {
    color: "#FFFFFF",

    fontSize: 32,

    fontWeight: "800",
  },

  // =====================================================
  // BALANCE BOX
  // =====================================================

  balanceBox: {
    backgroundColor: "#1C263B",

    borderRadius: 14,

    minHeight: 72,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-around",

    paddingVertical: 12,
  },

  balanceColumn: {
    flex: 1,

    alignItems: "center",
  },

  balanceLabel: {
    color: "#A8B2C3",

    fontSize: 12,

    marginBottom: 4,
  },

  balancePaid: {
    color: "#4ADE80",

    fontSize: 15,

    fontWeight: "800",
  },

  balanceRemaining: {
    color: "#F87171",

    fontSize: 15,

    fontWeight: "800",
  },

  balanceDivider: {
    width: 1,

    height: 34,

    backgroundColor: "#475166",
  },

  // =====================================================
  // RESPONSIBILITY
  // =====================================================

  responsibilitySmall: {
    marginTop: 12,

    backgroundColor: "#172238",

    borderRadius: 10,

    paddingHorizontal: 11,

    paddingVertical: 9,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",
  },

  responsibilitySmallLabel: {
    color: "#A8B2C3",

    fontSize: 11,
  },

  responsibilityBadge: {
    backgroundColor: "#20354A",

    borderRadius: 7,

    paddingHorizontal: 9,

    paddingVertical: 4,
  },

  responsibilitySmallValue: {
    color: "#5EEAD4",

    fontSize: 11,

    fontWeight: "800",
  },

  // =====================================================
  // SECTION HEADER
  // =====================================================

  sectionHeaderRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "space-between",

    marginBottom: 12,
  },

  sectionTitle: {
    color: "#07152E",

    fontSize: 20,

    fontWeight: "800",

    marginBottom: 2,
  },

  sectionSubtitle: {
    color: "#64748B",

    fontSize: 12,
  },

  courseCountBadge: {
    minWidth: 30,
    height: 30,

    borderRadius: 10,

    backgroundColor: "#E6F7F4",

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 8,
  },

  courseCountText: {
    color: "#249688",

    fontSize: 13,

    fontWeight: "800",
  },

  // =====================================================
  // PARENT MESSAGE
  // =====================================================

  parentMessageBox: {
    backgroundColor: "#FFF7ED",

    borderRadius: 14,

    padding: 13,

    marginBottom: 20,

    borderWidth: 1,

    borderColor: "#FED7AA",

    flexDirection: "row",

    alignItems: "flex-start",
  },

  parentMessageIcon: {
    width: 28,
    height: 28,

    borderRadius: 14,

    backgroundColor: "#FFEDD5",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 10,
  },

  parentMessageIconText: {
    color: "#C2410C",

    fontSize: 15,

    fontWeight: "800",
  },

  parentMessageContent: {
    flex: 1,
  },

  parentMessageTitle: {
    color: "#9A3412",

    fontSize: 13,

    fontWeight: "800",

    marginBottom: 3,
  },

  parentMessageText: {
    color: "#7C2D12",

    fontSize: 12,

    lineHeight: 18,
  },

  // =====================================================
  // COURSE CARD
  // =====================================================

  courseCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 18,

    padding: 16,

    marginBottom: 14,

    borderWidth: 1,

    borderColor: "#E2E8F0",

    elevation: 2,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,

    shadowRadius: 4,
  },

  // =====================================================
  // COURSE HEADER
  // =====================================================

  courseHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",
  },

  courseTitleArea: {
    flex: 1,

    paddingRight: 8,
  },

  courseTitle: {
    color: "#07152E",

    fontSize: 17,

    fontWeight: "800",

    marginBottom: 7,
  },

  tutorRow: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  tutorIconCircle: {
    width: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor: "#E8F7F5",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 7,
  },

  tutorIcon: {
    color: "#249688",

    fontSize: 11,

    fontWeight: "800",
  },

  tutorName: {
    color: "#64748B",

    fontSize: 12,

    flex: 1,
  },

  // =====================================================
  // PENDING BADGE
  // =====================================================

  pendingBadge: {
    backgroundColor: "#FEF3C7",

    borderRadius: 15,

    paddingHorizontal: 9,

    paddingVertical: 5,

    flexDirection: "row",

    alignItems: "center",
  },

  pendingDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#D97706",

    marginRight: 5,
  },

  pendingBadgeText: {
    color: "#B45309",

    fontSize: 10,

    fontWeight: "800",
  },

  // =====================================================
  // PAID BADGE
  // =====================================================

  paidBadge: {
    backgroundColor: "#DCFCE7",

    borderRadius: 15,

    paddingHorizontal: 9,

    paddingVertical: 5,

    flexDirection: "row",

    alignItems: "center",
  },

  paidDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#16A34A",

    marginRight: 5,
  },

  paidBadgeText: {
    color: "#15803D",

    fontSize: 10,

    fontWeight: "800",
  },

  // =====================================================
  // DIVIDER
  // =====================================================

  courseDivider: {
    height: 1,

    backgroundColor: "#E5E7EB",

    marginVertical: 14,
  },

  // =====================================================
  // COURSE FEES
  // =====================================================

  courseFeeRow: {
    flexDirection: "row",

    justifyContent: "space-between",
  },

  courseFeeColumn: {
    flex: 1,
  },

  courseFeeLabel: {
    color: "#64748B",

    fontSize: 11,

    marginBottom: 4,
  },

  courseTotal: {
    color: "#07152E",

    fontSize: 14,

    fontWeight: "800",
  },

  coursePaid: {
    color: "#16A34A",

    fontSize: 14,

    fontWeight: "800",
  },

  courseRemaining: {
    color: "#DC2626",

    fontSize: 14,

    fontWeight: "800",
  },

  // =====================================================
  // PAYMENT AREA
  // =====================================================

  coursePaymentArea: {
    flexDirection: "row",

    marginTop: 16,
  },

  // =====================================================
  // FULL BUTTON
  // =====================================================

  courseFullButton: {
    flex: 1,

    height: 43,

    borderRadius: 10,

    backgroundColor: "#249688",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginRight: 6,
  },

  checkIcon: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "900",

    marginRight: 5,
  },

  courseFullButtonText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "800",
  },

  // =====================================================
  // PARTIAL BUTTON
  // =====================================================

  coursePartialButton: {
    flex: 1,

    height: 43,

    borderRadius: 10,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#CBD5E1",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginLeft: 6,
  },

  editIcon: {
    color: "#249688",

    fontSize: 18,

    fontWeight: "700",

    marginRight: 5,
  },

  coursePartialButtonText: {
    color: "#07152E",

    fontSize: 13,

    fontWeight: "800",
  },

  // =====================================================
  // PARTIAL PAYMENT BOX
  // =====================================================

  partialBox: {
    marginTop: 12,

    backgroundColor: "#F8FAFC",

    borderRadius: 12,

    padding: 12,

    borderWidth: 1,

    borderColor: "#E2E8F0",
  },

  partialLabel: {
    color: "#07152E",

    fontSize: 12,

    fontWeight: "700",

    marginBottom: 7,
  },

  partialInput: {
    height: 43,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,

    borderColor: "#CBD5E1",

    borderRadius: 9,

    paddingHorizontal: 12,

    color: "#07152E",

    fontSize: 13,

    marginBottom: 9,
  },

  submitPartialButton: {
    height: 43,

    backgroundColor: "#07152E",

    borderRadius: 9,

    justifyContent: "center",

    alignItems: "center",
  },

  submitPartialText: {
    color: "#FFFFFF",

    fontSize: 13,

    fontWeight: "800",
  },

  // =====================================================
  // FULLY PAID
  // =====================================================

  fullyPaidBox: {
    marginTop: 14,

    backgroundColor: "#F0FDF4",

    borderRadius: 10,

    paddingVertical: 9,

    paddingHorizontal: 11,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    borderWidth: 1,

    borderColor: "#DCFCE7",
  },

  successCircle: {
    width: 21,
    height: 21,

    borderRadius: 11,

    backgroundColor: "#16A34A",

    justifyContent: "center",

    alignItems: "center",

    marginRight: 7,
  },

  successCheck: {
    color: "#FFFFFF",

    fontSize: 12,

    fontWeight: "900",
  },

  fullyPaidText: {
    color: "#15803D",

    fontSize: 12,

    fontWeight: "800",
  },

  // =====================================================
  // NO FEE
  // =====================================================

  noFeeBox: {
    backgroundColor: "#FFFFFF",

    borderRadius: 16,

    paddingVertical: 28,

    paddingHorizontal: 20,

    alignItems: "center",

    borderWidth: 1,

    borderColor: "#E2E8F0",
  },

  noFeeIcon: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor: "#E8F7F5",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 10,
  },

  noFeeIconText: {
    color: "#249688",

    fontSize: 21,

    fontWeight: "800",
  },

  noFeeTitle: {
    color: "#07152E",

    fontSize: 16,

    fontWeight: "800",

    marginBottom: 5,
  },

  noFeeText: {
    color: "#64748B",

    fontSize: 12,

    textAlign: "center",

    lineHeight: 18,
  },
});
