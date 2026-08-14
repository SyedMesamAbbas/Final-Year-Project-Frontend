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
  Alert,
  Modal,
  TextInput,
  Image,
  ScrollView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { BASE_URL } from "../../config/api";
import Colors from "../utils/colors";

const ParentChildFee = () => {
  const navigation = useNavigation();

  //========================================
  // Fee States
  //========================================

  const [children, setChildren] = useState([]);

  const [parentTotalFee, setParentTotalFee] = useState(0);
  const [parentTotalPaid, setParentTotalPaid] = useState(0);
  const [parentTotalRemaining, setParentTotalRemaining] = useState(0);

  const [selectedChild, setSelectedChild] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  //========================================
  // Dropdown
  //========================================

  const [dropdownVisible, setDropdownVisible] = useState(false);

  //========================================
  // Payment Dialog
  //========================================

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedFeeId, setSelectedFeeId] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  //========================================
  // Format Money
  //========================================

  const formatMoney = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    });
  };

  //========================================
  // Load All Children Fees
  //========================================

  const loadFees = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        return;
      }

      const response = await axios.get(`${BASE_URL}/Parent/children-fee`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Children Fee Response:", response.data);

      const data = response.data || {};

      //========================================
      // Parent Total
      //========================================

      setParentTotalFee(Number(data.totalFee || 0));
      setParentTotalPaid(Number(data.totalPaid || 0));
      setParentTotalRemaining(Number(data.totalRemaining || 0));

      //========================================
      // Children
      //========================================

      const childrenData = Array.isArray(data.children)
        ? data.children
        : [];

      setChildren(childrenData);

      //========================================
      // Automatically Select First Child
      //========================================

      if (childrenData.length > 0) {
        setSelectedChild((previousChild) => {
          if (!previousChild) {
            return childrenData[0];
          }

          const updatedChild = childrenData.find(
            (child) => child.studentId === previousChild.studentId
          );

          return updatedChild || childrenData[0];
        });
      } else {
        setSelectedChild(null);
      }
    } catch (error) {
      console.log("Load Children Fee Error:", error);
      console.log("API Error:", error.response?.data);

      let message = "Unable to load fee information.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //========================================
  // Initial Load
  //========================================

  useEffect(() => {
    loadFees();
  }, []);

  //========================================
  // Refresh
  //========================================

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFees();
  }, []);

  //========================================
  // Select Child
  //========================================

  const selectChild = (child) => {
    setSelectedChild(child);
    setDropdownVisible(false);
  };

  //========================================
  // Open Payment Dialog
  //========================================

  const openPaymentDialog = (item, type) => {
    const remaining = Number(item.remaining || 0);

    if (remaining <= 0) {
      Alert.alert("Paid", "This fee has already been completely paid.");
      return;
    }

    setSelectedFeeId(item.feeId);
    setRemainingAmount(remaining);
    setPaymentType(type);

    if (type === "Full") {
      setAmount(remaining.toString());
    } else {
      setAmount("");
    }

    setModalVisible(true);
  };

  //========================================
  // Send Payment
  //========================================

  const sendPayment = async () => {
    if (!amount || amount.trim() === "") {
      Alert.alert("Error", "Please enter amount.");
      return;
    }

    const enteredAmount = parseFloat(amount);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    if (enteredAmount > remainingAmount) {
      Alert.alert(
        "Error",
        "Amount cannot be greater than the remaining fee."
      );
      return;
    }

    try {
      setSending(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Error", "Authentication token not found.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/Parent/send-payment`,
        {
          feeId: selectedFeeId,
          amount: enteredAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert(
        "Success",
        response.data?.message || "Payment sent successfully."
      );

      //========================================
      // Close Modal
      //========================================

      setModalVisible(false);
      setAmount("");
      setSelectedFeeId(null);
      setRemainingAmount(0);
      setPaymentType("");

      //========================================
      // Refresh Fee Data
      //========================================

      await loadFees();
    } catch (error) {
      console.log("Send Payment Error:", error);
      console.log("API Error:", error.response?.data);

      let message = "Payment failed.";

      if (typeof error.response?.data === "string") {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      Alert.alert("Error", message);
    } finally {
      setSending(false);
    }
  };

  //========================================
  // Render Course Fee
  //========================================

  const renderCourseFee = ({ item }) => {
    const totalFee = Number(item.totalFee || 0);
    const paid = Number(item.paid || 0);
    const remaining = Number(item.remaining || 0);

    const isPaid = remaining <= 0;

    return (
      <View style={styles.card}>
        {/* Course Header */}

        <View style={styles.header}>
          <Text style={styles.course} numberOfLines={1}>
            {item.course || "Unknown Course"}
          </Text>

          <View
            style={[
              styles.badge,
              isPaid ? styles.badgePaid : styles.badgePending,
            ]}
          >
            <Icon
              name={isPaid ? "check-circle" : "schedule"}
              size={14}
              color="#fff"
              style={{ marginRight: 5 }}
            />

            <Text style={styles.badgeText}>
              {isPaid ? "Paid" : "Pending"}
            </Text>
          </View>
        </View>

        {/* Tutor */}

        <View style={styles.tutorRow}>
          <View style={styles.tutorIconWrap}>
            <Icon name="person" size={18} color={Colors.primary} />
          </View>

          <Text style={styles.tutorText}>
            {item.tutor || "Unknown Tutor"}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Total */}

        <View style={styles.row}>
          <Icon name="payments" size={20} color="#555" />

          <Text style={styles.label}>Total Fee</Text>

          <Text style={styles.value}>
            Rs. {formatMoney(totalFee)}
          </Text>
        </View>

        {/* Paid */}

        <View style={styles.row}>
          <Icon name="check-circle" size={20} color="#2E7D32" />

          <Text style={styles.label}>Paid</Text>

          <Text style={[styles.value, { color: "#2E7D32" }]}>
            Rs. {formatMoney(paid)}
          </Text>
        </View>

        {/* Remaining */}

        <View style={styles.row}>
          <Icon name="warning" size={20} color="#E74C3C" />

          <Text style={styles.label}>Remaining</Text>

          <Text
            style={[
              styles.value,
              {
                color: remaining > 0 ? "#E74C3C" : "#2E7D32",
              },
            ]}
          >
            Rs. {formatMoney(remaining)}
          </Text>
        </View>

        {/* Payment Buttons */}

        {remaining > 0 && (
          <View style={styles.buttonContainer}>
            {/* Full Payment */}

            <TouchableOpacity
              style={styles.fullButton}
              activeOpacity={0.85}
              onPress={() => openPaymentDialog(item, "Full")}
            >
              <Icon name="payments" size={18} color="#fff" />

              <Text style={styles.buttonText}>
                Send Full Payment
              </Text>
            </TouchableOpacity>

            {/* Partial Payment */}

            <TouchableOpacity
              style={styles.partialButton}
              activeOpacity={0.85}
              onPress={() => openPaymentDialog(item, "Partial")}
            >
              <Icon
                name="account-balance-wallet"
                size={18}
                color="#fff"
              />

              <Text style={styles.buttonText}>
                Send Partial Payment
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  //========================================
  // Loading
  //========================================

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading fee information...
        </Text>
      </View>
    );
  }

  //========================================
  // Selected Child Data
  //========================================

  const selectedCourses = selectedChild?.courses || [];

  const selectedChildTotalFee = Number(
    selectedChild?.totalFee || 0
  );

  const selectedChildPaid = Number(
    selectedChild?.totalPaid || 0
  );

  const selectedChildRemaining = Number(
    selectedChild?.totalRemaining || 0
  );

  //========================================
  // Main UI
  //========================================

  return (
    <SafeAreaView style={styles.container}>
      {/* =====================================
          Header
      ====================================== */}

      <View style={styles.topHeader}>
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
            name="arrow-back"
            size={24}
            color="#1B1B1B"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logoImage}
          />

          <Text style={styles.logoText}>
            House of Tutor
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={selectedCourses}
        keyExtractor={(item, index) =>
          item.feeId
            ? item.feeId.toString()
            : index.toString()
        }
        renderItem={renderCourseFee}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          selectedCourses.length === 0 &&
            styles.flexGrow,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* =====================================
                Screen Title
            ====================================== */}

            <Text style={styles.screenTitle}>
              Fee Details
            </Text>

            {/* =====================================
                Parent Overall Fee
            ====================================== */}

            <View style={styles.totalCard}>
              <View style={styles.totalHeader}>
                <View>
                  <Text style={styles.totalTitle}>
                    Total Family Fee
                  </Text>

                  <Text style={styles.totalSubtitle}>
                    All children
                  </Text>
                </View>

                <View style={styles.totalIcon}>
                  <Icon
                    name="account-balance-wallet"
                    size={28}
                    color="#fff"
                  />
                </View>
              </View>

              <Text style={styles.totalAmount}>
                Rs. {formatMoney(parentTotalFee)}
              </Text>

              <View style={styles.totalDivider} />

              <View style={styles.totalRow}>
                <View style={styles.totalSmallBox}>
                  <Icon
                    name="check-circle"
                    size={18}
                    color="#2E7D32"
                  />

                  <View>
                    <Text style={styles.totalSmallLabel}>
                      Paid
                    </Text>

                    <Text style={styles.totalPaid}>
                      Rs. {formatMoney(parentTotalPaid)}
                    </Text>
                  </View>
                </View>

                <View style={styles.totalSmallBox}>
                  <Icon
                    name="warning"
                    size={18}
                    color="#E74C3C"
                  />

                  <View>
                    <Text style={styles.totalSmallLabel}>
                      Remaining
                    </Text>

                    <Text style={styles.totalRemaining}>
                      Rs. {formatMoney(parentTotalRemaining)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* =====================================
                Child Dropdown
            ====================================== */}

            {children.length > 0 && (
              <View style={styles.childSection}>
                <Text style={styles.sectionTitle}>
                  Select Child
                </Text>

                <TouchableOpacity
                  style={styles.dropdown}
                  activeOpacity={0.8}
                  onPress={() =>
                    setDropdownVisible(!dropdownVisible)
                  }
                >
                  <View style={styles.dropdownLeft}>
                    <View style={styles.childIcon}>
                      <Icon
                        name="person"
                        size={20}
                        color={Colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.dropdownLabel}>
                        Child
                      </Text>

                      <Text
                        style={styles.selectedChildName}
                        numberOfLines={1}
                      >
                        {selectedChild?.studentName ||
                          "Select Child"}
                      </Text>
                    </View>
                  </View>

                  <Icon
                    name={
                      dropdownVisible
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={28}
                    color="#555"
                  />
                </TouchableOpacity>

                {/* Dropdown Items */}

                {dropdownVisible && (
                  <View style={styles.dropdownMenu}>
                    {children.map((child) => {
                      const isSelected =
                        selectedChild?.studentId ===
                        child.studentId;

                      return (
                        <TouchableOpacity
                          key={child.studentId.toString()}
                          style={[
                            styles.dropdownItem,
                            isSelected &&
                              styles.dropdownItemSelected,
                          ]}
                          onPress={() =>
                            selectChild(child)
                          }
                        >
                          <View
                            style={
                              styles.dropdownItemIcon
                            }
                          >
                            <Icon
                              name="person"
                              size={19}
                              color={
                                isSelected
                                  ? Colors.primary
                                  : "#777"
                              }
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.dropdownItemName,
                                isSelected &&
                                  styles.dropdownItemNameSelected,
                              ]}
                            >
                              {child.studentName}
                            </Text>

                            <Text
                              style={
                                styles.dropdownItemFee
                              }
                            >
                              Total: Rs.{" "}
                              {formatMoney(
                                child.totalFee
                              )}
                            </Text>
                          </View>

                          {isSelected && (
                            <Icon
                              name="check"
                              size={22}
                              color={Colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* =====================================
                Selected Child Summary
            ====================================== */}

            {selectedChild && (
              <View style={styles.childSummaryCard}>
                <View style={styles.childSummaryHeader}>
                  <View>
                    <Text style={styles.childSummaryTitle}>
                      {selectedChild.studentName}
                    </Text>

                    <Text
                      style={styles.childSummarySubtitle}
                    >
                      Fee Summary
                    </Text>
                  </View>

                  <View style={styles.childSummaryIcon}>
                    <Icon
                      name="person"
                      size={24}
                      color={Colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryGrid}>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>
                      Total Fee
                    </Text>

                    <Text style={styles.summaryTotal}>
                      Rs.{" "}
                      {formatMoney(
                        selectedChildTotalFee
                      )}
                    </Text>
                  </View>

                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>
                      Paid
                    </Text>

                    <Text style={styles.summaryPaid}>
                      Rs.{" "}
                      {formatMoney(
                        selectedChildPaid
                      )}
                    </Text>
                  </View>

                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>
                      Remaining
                    </Text>

                    <Text
                      style={[
                        styles.summaryRemaining,
                        selectedChildRemaining <=
                          0 && {
                          color: "#2E7D32",
                        },
                      ]}
                    >
                      Rs.{" "}
                      {formatMoney(
                        selectedChildRemaining
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* =====================================
                Course Heading
            ====================================== */}

            {selectedChild && (
              <Text style={styles.courseSectionTitle}>
                Course-wise Fee
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          selectedChild ? (
            <View style={styles.empty}>
              <Icon
                name="payments"
                size={80}
                color="#BBBBBB"
              />

              <Text style={styles.emptyText}>
                No Fee Record Found
              </Text>

              <Text style={styles.emptySubText}>
                No course fee has been added for this
                child yet.
              </Text>
            </View>
          ) : children.length === 0 ? (
            <View style={styles.empty}>
              <Icon
                name="people"
                size={80}
                color="#BBBBBB"
              />

              <Text style={styles.emptyText}>
                No Children Found
              </Text>

              <Text style={styles.emptySubText}>
                No children are linked to this parent
                account.
              </Text>
            </View>
          ) : null
        }
      />

      {/* =====================================
          Payment Modal
      ====================================== */}

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => {
          if (!sending) {
            setModalVisible(false);
          }
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            {/* Modal Title */}

            <Text style={styles.modalTitle}>
              {paymentType === "Full"
                ? "Send Full Payment"
                : "Send Partial Payment"}
            </Text>

            {/* Course Payment Info */}

            <Text style={styles.modalSubtitle}>
              Remaining Fee
            </Text>

            <Text style={styles.modalAmount}>
              Rs. {formatMoney(remainingAmount)}
            </Text>

            {/* Input */}

            <Text style={styles.inputLabel}>
              Payment Amount
            </Text>

            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={amount}
              editable={
                paymentType !== "Full" && !sending
              }
              onChangeText={setAmount}
              placeholder="Enter Amount"
              placeholderTextColor="#999"
            />

            {/* Modal Buttons */}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.85}
                disabled={sending}
                onPress={() => {
                  setModalVisible(false);
                  setAmount("");
                  setSelectedFeeId(null);
                  setRemainingAmount(0);
                  setPaymentType("");
                }}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sendButton}
                activeOpacity={0.85}
                disabled={sending}
                onPress={sendPayment}
              >
                {sending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.sendText}>
                    Send
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ParentChildFee;

//====================================================
// STYLES
//====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  //==================================================
  // Header
  //==================================================

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F3F6",
  },

  headerCenter: {
    alignItems: "center",
  },

  headerSpacer: {
    width: 38,
  },

  logoImage: {
    width: 42,
    height: 42,
    resizeMode: "contain",
  },

  logoText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 2,
  },

  //==================================================
  // Screen
  //==================================================

  screenTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1B1B1B",
    marginBottom: 14,
  },

  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 30,
  },

  flexGrow: {
    flexGrow: 1,
  },

  //==================================================
  // Loader
  //==================================================

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
  },

  loadingText: {
    marginTop: 12,
    color: "#777",
    fontSize: 14,
    fontWeight: "500",
  },

  //==================================================
  // Parent Total Card
  //==================================================

  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    marginBottom: 18,
  },

  totalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  totalSubtitle: {
    fontSize: 13,
    color: "#8A94A6",
    marginTop: 3,
  },

  totalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  totalAmount: {
    fontSize: 30,
    fontWeight: "900",
    color: Colors.primary,
    marginTop: 18,
  },

  totalDivider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 16,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  totalSmallBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  totalSmallLabel: {
    fontSize: 12,
    color: "#8A94A6",
    marginLeft: 8,
  },

  totalPaid: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2E7D32",
    marginLeft: 8,
    marginTop: 2,
  },

  totalRemaining: {
    fontSize: 14,
    fontWeight: "800",
    color: "#E74C3C",
    marginLeft: 8,
    marginTop: 2,
  },

  //==================================================
  // Child Dropdown
  //==================================================

  childSection: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B1B1B",
    marginBottom: 9,
  },

  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    minHeight: 65,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E8ED",
    elevation: 2,
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  childIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  dropdownLabel: {
    fontSize: 11,
    color: "#8A94A6",
    marginBottom: 2,
  },

  selectedChildName: {
    fontSize: 16,
    color: "#1B1B1B",
    fontWeight: "800",
  },

  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E5E8ED",
    elevation: 5,
    overflow: "hidden",
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F3",
  },

  dropdownItemSelected: {
    backgroundColor: "#F3F6FF",
  },

  dropdownItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F3F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  dropdownItemName: {
    fontSize: 15,
    color: "#333",
    fontWeight: "700",
  },

  dropdownItemNameSelected: {
    color: Colors.primary,
  },

  dropdownItemFee: {
    fontSize: 12,
    color: "#8A94A6",
    marginTop: 3,
  },

  //==================================================
  // Child Summary
  //==================================================

  childSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 17,
    marginBottom: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  childSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  childSummaryTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1B1B1B",
  },

  childSummarySubtitle: {
    fontSize: 13,
    color: "#8A94A6",
    marginTop: 3,
  },

  childSummaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EEF3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginVertical: 15,
  },

  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryBox: {
    flex: 1,
  },

  summaryLabel: {
    fontSize: 11,
    color: "#8A94A6",
    marginBottom: 5,
  },

  summaryTotal: {
    fontSize: 14,
    color: "#1B1B1B",
    fontWeight: "800",
  },

  summaryPaid: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "800",
  },

  summaryRemaining: {
    fontSize: 14,
    color: "#E74C3C",
    fontWeight: "800",
  },

  courseSectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1B1B1B",
    marginBottom: 2,
  },

  //==================================================
  // Course Card
  //==================================================

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  course: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1B1B1B",
    flex: 1,
    marginRight: 10,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgePaid: {
    backgroundColor: "#2E7D32",
  },

  badgePending: {
    backgroundColor: "#F39C12",
  },

  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  tutorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  tutorIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: `${Colors.primary}1A`,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  tutorText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF1F5",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  label: {
    width: 95,
    fontSize: 14,
    color: "#8A94A6",
    marginLeft: 10,
  },

  value: {
    flex: 1,
    fontSize: 15,
    color: "#1B1B1B",
    fontWeight: "700",
    textAlign: "right",
  },

  buttonContainer: {
    marginTop: 16,
  },

  fullButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  partialButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },

  //==================================================
  // Empty
  //==================================================

  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
    paddingHorizontal: 20,
  },

  emptyText: {
    marginTop: 15,
    fontSize: 17,
    color: "#777",
    fontWeight: "700",
  },

  emptySubText: {
    marginTop: 7,
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },

  //==================================================
  // Payment Modal
  //==================================================

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    color: Colors.primary,
    marginBottom: 10,
  },

  modalSubtitle: {
    fontSize: 14,
    color: "#8A94A6",
    textAlign: "center",
  },

  modalAmount: {
    fontSize: 26,
    color: "#2E7D32",
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },

  inputLabel: {
    fontSize: 13,
    color: "#555",
    fontWeight: "600",
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E1E5EA",
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 18,
    height: 52,
    backgroundColor: "#FAFAFA",
    color: "#1B1B1B",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#9E9E9E",
    marginRight: 8,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },

  sendButton: {
    flex: 1,
    backgroundColor: "#2E7D32",
    marginLeft: 8,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: "center",
  },

  cancelText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});










//only show total fee and pay it
// import React, { useEffect, useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   Modal,
//   TextInput,
//   Image,
// } from "react-native";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { BASE_URL } from "../../config/api";
// import Colors from "../utils/colors";

// const ParentChildFee = () => {
//   const route = useRoute();
//   const navigation = useNavigation();

//   const { studentId } = route.params;

//   const [fees, setFees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   // Payment Dialog
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedFeeId, setSelectedFeeId] = useState(null);
//   const [remainingAmount, setRemainingAmount] = useState(0);
//   const [paymentType, setPaymentType] = useState("");
//   const [amount, setAmount] = useState("");
//   const [sending, setSending] = useState(false);

//   //=============================
//   // Load Fee List
//   //=============================

//   const loadFees = async () => {
//     try {
//       const token = await AsyncStorage.getItem("token");

//       const response = await axios.get(
//         `${BASE_URL}/Parent/child-fee/${studentId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       setFees(response.data);
//     } catch (error) {
//       console.log(error.response?.data);

//       let message = "Unable to load fee.";

//       if (typeof error.response?.data === "string")
//         message = error.response.data;
//       else if (error.response?.data?.message)
//         message = error.response.data.message;

//       Alert.alert("Error", message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     loadFees();
//   }, []);

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadFees();
//   }, []);

//   //=============================
//   // Open Dialog
//   //=============================

//   const openPaymentDialog = (item, type) => {
//     setSelectedFeeId(item.feeId);
//     setRemainingAmount(item.remaining);
//     setPaymentType(type);

//     if (type === "Full") {
//       setAmount(item.remaining.toString());
//     } else {
//       setAmount("");
//     }

//     setModalVisible(true);
//   };

//   //=============================
//   // Send Payment
//   //=============================

//   const sendPayment = async () => {
//     if (!amount) {
//       Alert.alert("Error", "Please enter amount.");
//       return;
//     }

//     const enteredAmount = parseFloat(amount);

//     if (isNaN(enteredAmount) || enteredAmount <= 0) {
//       Alert.alert("Error", "Enter valid amount.");
//       return;
//     }

//     if (enteredAmount > remainingAmount) {
//       Alert.alert("Error", "Amount cannot be greater than remaining fee.");
//       return;
//     }

//     try {
//       setSending(true);

//       const token = await AsyncStorage.getItem("token");

//       const response = await axios.post(
//         `${BASE_URL}/Parent/send-payment`,
//         {
//           feeId: selectedFeeId,
//           amount: enteredAmount,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       Alert.alert("Success", response.data.message);

//       setModalVisible(false);

//       setAmount("");
//       setSelectedFeeId(null);

//       loadFees();
//     } catch (error) {
//       console.log(error.response?.data);

//       let message = "Payment failed.";

//       if (typeof error.response?.data === "string")
//         message = error.response.data;
//       else if (error.response?.data?.message)
//         message = error.response.data.message;

//       Alert.alert("Error", message);
//     } finally {
//       setSending(false);
//     }
//   };

//   //=============================
//   // Render Card
//   //=============================

//   const renderItem = ({ item }) => {
//     const isPaid = item.remaining === 0;

//     return (
//       <View style={styles.card}>
//         <View style={styles.header}>
//           <Text style={styles.course} numberOfLines={1}>
//             {item.course}
//           </Text>

//           <View
//             style={[
//               styles.badge,
//               isPaid ? styles.badgePaid : styles.badgePending,
//             ]}
//           >
//             <Icon
//               name={isPaid ? "check-circle" : "schedule"}
//               size={14}
//               color="#fff"
//               style={{ marginRight: 5 }}
//             />
//             <Text style={styles.badgeText}>
//               {isPaid ? "Paid" : "Pending"}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.tutorRow}>
//           <View style={styles.tutorIconWrap}>
//             <Icon name="person" size={18} color={Colors.primary} />
//           </View>
//           <Text style={styles.tutorText}>{item.tutor}</Text>
//         </View>

//         <View style={styles.divider} />

//         <View style={styles.row}>
//           <Icon name="payments" size={20} color="#555" />
//           <Text style={styles.label}>Total Fee</Text>
//           <Text style={styles.value}>
//             Rs. {Number(item.totalFee).toLocaleString()}
//           </Text>
//         </View>

//         <View style={styles.row}>
//           <Icon name="check-circle" size={20} color="green" />
//           <Text style={styles.label}>Paid</Text>
//           <Text style={[styles.value, { color: "#2E7D32" }]}>
//             Rs. {Number(item.paid).toLocaleString()}
//           </Text>
//         </View>

//         <View style={styles.row}>
//           <Icon name="warning" size={20} color="#E74C3C" />
//           <Text style={styles.label}>Remaining</Text>
//           <Text style={styles.remaining}>
//             Rs. {Number(item.remaining).toLocaleString()}
//           </Text>
//         </View>

//         {item.remaining > 0 && (
//           <View style={styles.buttonContainer}>
//             <TouchableOpacity
//               style={styles.fullButton}
//               activeOpacity={0.85}
//               onPress={() => openPaymentDialog(item, "Full")}
//             >
//               <Icon name="payments" size={18} color="#fff" />
//               <Text style={styles.buttonText}>Send Full Payment</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.partialButton}
//               activeOpacity={0.85}
//               onPress={() => openPaymentDialog(item, "Partial")}
//             >
//               <Icon name="account-balance-wallet" size={18} color="#fff" />
//               <Text style={styles.buttonText}>Send Partial Payment</Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" color={Colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.topHeader}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Icon name="arrow-back" size={24} color="#1B1B1B" />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <Image
//             source={require("../../../assets/images/logo.png")}
//             style={styles.logoImage}
//           />
//           <Text style={styles.logoText}>House of Tutor</Text>
//         </View>

//         <View style={styles.headerSpacer} />
//       </View>

//       <Text style={styles.screenTitle}>Fee Details</Text>

//       <FlatList
//         data={fees}
//         keyExtractor={(item) => item.feeId.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={
//           fees.length === 0 ? styles.flexGrow : styles.listContent
//         }
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <Icon name="payments" size={90} color="#BBBBBB" />
//             <Text style={styles.emptyText}>No Fee Record Found</Text>
//           </View>
//         }
//       />

//       {/* Payment Dialog */}

//       <Modal visible={modalVisible} animationType="fade" transparent>
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>
//               {paymentType === "Full"
//                 ? "Send Full Payment"
//                 : "Send Partial Payment"}
//             </Text>

//             <Text style={styles.modalSubtitle}>Remaining Fee</Text>

//             <Text style={styles.modalAmount}>
//               Rs. {Number(remainingAmount).toLocaleString()}
//             </Text>

//             <TextInput
//               style={styles.input}
//               keyboardType="numeric"
//               value={amount}
//               editable={paymentType !== "Full"}
//               onChangeText={setAmount}
//               placeholder="Enter Amount"
//               placeholderTextColor="#999"
//             />

//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={styles.cancelButton}
//                 activeOpacity={0.85}
//                 onPress={() => {
//                   setModalVisible(false);
//                   setAmount("");
//                 }}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.sendButton}
//                 activeOpacity={0.85}
//                 disabled={sending}
//                 onPress={sendPayment}
//               >
//                 {sending ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.sendText}>Send</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default ParentChildFee;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F5F6FA",
//   },

//   topHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: "#fff",
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//   },

//   backButton: {
//     width: 38,
//     height: 38,
//     borderRadius: 19,
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#F1F3F6",
//   },

//   headerCenter: {
//     alignItems: "center",
//   },

//   headerSpacer: {
//     width: 38,
//   },

//   logoImage: {
//     width: 42,
//     height: 42,
//     resizeMode: "contain",
//   },

//   logoText: {
//     fontSize: 13,
//     fontWeight: "700",
//     color: Colors.primary,
//     marginTop: 2,
//   },

//   screenTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#1B1B1B",
//     paddingHorizontal: 18,
//     paddingTop: 16,
//     paddingBottom: 6,
//   },

//   loader: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F5F6FA",
//   },

//   listContent: {
//     paddingHorizontal: 15,
//     paddingBottom: 24,
//   },

//   flexGrow: {
//     flexGrow: 1,
//   },

//   card: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 18,
//     marginTop: 16,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     shadowOffset: { width: 0, height: 3 },
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   course: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#1B1B1B",
//     flex: 1,
//     marginRight: 10,
//   },

//   badge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },

//   badgePaid: {
//     backgroundColor: "#2E7D32",
//   },

//   badgePending: {
//     backgroundColor: "#F39C12",
//   },

//   badgeText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 12,
//   },

//   tutorRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   tutorIconWrap: {
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     backgroundColor: `${Colors.primary}1A`,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: 8,
//   },

//   tutorText: {
//     fontSize: 14,
//     color: "#555",
//     fontWeight: "500",
//   },

//   divider: {
//     height: 1,
//     backgroundColor: "#EEF1F5",
//     marginBottom: 10,
//   },

//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 6,
//   },

//   label: {
//     width: 95,
//     fontSize: 14,
//     color: "#8A94A6",
//     marginLeft: 10,
//   },

//   value: {
//     flex: 1,
//     fontSize: 15,
//     color: "#1B1B1B",
//     fontWeight: "700",
//     textAlign: "right",
//   },

//   remaining: {
//     flex: 1,
//     fontSize: 15,
//     color: "#E74C3C",
//     fontWeight: "800",
//     textAlign: "right",
//   },

//   buttonContainer: {
//     marginTop: 16,
//   },

//   fullButton: {
//     backgroundColor: "#2E7D32",
//     paddingVertical: 13,
//     borderRadius: 10,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//     marginBottom: 10,
//     gap: 8,
//   },

//   partialButton: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 13,
//     borderRadius: 10,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 8,
//   },

//   buttonText: {
//     color: "#fff",
//     fontWeight: "700",
//     fontSize: 15,
//     marginLeft: 6,
//   },

//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   emptyText: {
//     marginTop: 15,
//     fontSize: 16,
//     color: "#888",
//     fontWeight: "600",
//   },

//   // Modal

//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.55)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },

//   modalContainer: {
//     width: "100%",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 18,
//     padding: 22,
//   },

//   modalTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     textAlign: "center",
//     color: Colors.primary,
//     marginBottom: 10,
//   },

//   modalSubtitle: {
//     fontSize: 14,
//     color: "#8A94A6",
//     textAlign: "center",
//   },

//   modalAmount: {
//     fontSize: 26,
//     color: "#2E7D32",
//     fontWeight: "800",
//     textAlign: "center",
//     marginVertical: 12,
//   },

//   input: {
//     borderWidth: 1,
//     borderColor: "#E1E5EA",
//     borderRadius: 10,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     marginBottom: 18,
//     height: 52,
//     backgroundColor: "#FAFAFA",
//     color: "#1B1B1B",
//   },

//   modalButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },

//   cancelButton: {
//     flex: 1,
//     backgroundColor: "#9E9E9E",
//     marginRight: 8,
//     borderRadius: 10,
//     paddingVertical: 13,
//     alignItems: "center",
//   },

//   sendButton: {
//     flex: 1,
//     backgroundColor: "#2E7D32",
//     marginLeft: 8,
//     borderRadius: 10,
//     paddingVertical: 13,
//     alignItems: "center",
//   },

//   cancelText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 15,
//   },

//   sendText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//     fontSize: 15,
//   },
// });
