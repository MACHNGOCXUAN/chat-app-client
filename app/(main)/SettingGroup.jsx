import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Switch,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  FontAwesome5,
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Entypo,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import axiosInstance from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import * as ImagePicker from "expo-image-picker";

const SettingGroup = () => {
  const params = useLocalSearchParams();
  const conversation = params.conversation
    ? JSON.parse(params.conversation)
    : null;
  const { user, accessToken } = useSelector((state) => state.auth);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPermissionModalVisible, setIsPermissionModalVisible] =
    useState(false);
  const [currentPermission, setCurrentPermission] = useState(null);
  const [selectedOption, setSelectedOption] = useState("all");

  const permissions = [
    {
      id: "edit_info",
      title: "Quyền sửa thông tin nhóm",
      options: [
        { id: "all", title: "Tất cả mọi người" },
        { id: "admins", title: "Chỉ trưởng nhóm và phó nhóm" },
      ],
    },
    {
      id: "create_poll",
      title: "Quyền tạo bình chọn",
      options: [
        { id: "all", title: "Tất cả mọi người" },
        { id: "admins", title: "Chỉ trưởng nhóm và phó nhóm" },
      ],
    },
    {
      id: "pin_message",
      title: "Quyền ghim tin nhắn",
      options: [
        { id: "all", title: "Tất cả mọi người" },
        { id: "admins", title: "Chỉ trưởng nhóm và phó nhóm" },
      ],
    },
    {
      id: "send_message",
      title: "Quyền gửi tin nhắn",
      options: [
        { id: "all", title: "Tất cả mọi người" },
        { id: "admins", title: "Chỉ trưởng nhóm và phó nhóm" },
      ],
    },
  ];

  const handleDeleteGroup = () => {
    if (!isAdmin) {
      Alert.alert("Thông báo", "Chỉ quản trị viên mới có thể giải tán nhóm");
      return;
    }

    Alert.alert(
      "Giải tán nhóm",
      "Bạn có chắc chắn muốn giải tán nhóm chat này không? Hành động này không thể khôi phục.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Giải tán",
          style: "destructive",
          onPress: () => {
            socket.emit("delete_conversation", {
              conversationId: conversation._id,
              userId: user._id,
            });

            Alert.alert("Thành công", "Đã giải tán nhóm");
            router.back();
          },
        },
      ]
    );
  };

  const [currentPermissions, setCurrentPermissions] = useState({
    edit_info: "all",
    create_poll: "all",
    pin_message: "all",
    send_message: "all",
  });

  const openPermissionModal = (permission) => {
    setCurrentPermission(permission);
    setIsPermissionModalVisible(true);
    setSelectedOption(currentPermissions[permission.id]);
  };

  useEffect(() => {
    const handleGroupSettingsUpdated = (data) => {
      if (data.conversationId === conversation._id) {
        if (data.setting === 'messagePermission') {
          const frontendPermission = data.permission === 'admin' ? 'admins' : 'all';
          setCurrentPermissions(prev => ({
            ...prev,
            send_message: frontendPermission
          }));
        }
        // Thêm các trường hợp khác nếu cần
      }
    };
  
    socket.on('group_settings_updated', handleGroupSettingsUpdated);
  
    return () => {
      socket.off('group_settings_updated', handleGroupSettingsUpdated);
    };
  }, [conversation?._id]);

  const handleSavePermission = async () => {
    try {
      if (!currentPermission) return;

      const permissionMap = {
        all: "all",
        admins: "admin",
      };

      const backendPermission = permissionMap[selectedOption];
      const backendSetting =
        currentPermission.id === "send_message" ? "messagePermission" : null;

      if (!backendSetting) return;

      const response = await axiosInstance.put(
        "/api/conversation/updatePermission",
        {
          conversationId: conversation._id,
          setting: backendSetting,
          permission: backendPermission,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.success) {
        setCurrentPermissions((prev) => ({
          ...prev,
          [currentPermission.id]: selectedOption,
        }));

        Alert.alert("Thành công", "Đã cập nhật quyền thành công");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quyền:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi cập nhật quyền");
    } finally {
      setIsPermissionModalVisible(false);
    }
  };

  const getPermissionText = (permissionId, optionId) => {
    const permission = permissions.find((p) => p.id === permissionId);
    const option = permission?.options.find((o) => o.id === optionId);
    return option?.title || "";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Group Info Section */}
        <View style={styles.groupInfoSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: conversation?.avatar || "https://via.placeholder.com/80",
              }}
              style={styles.groupAvatar}
            />
          </View>
          <Text style={styles.groupName}>
            {conversation?.name || "Nhóm chat"}
          </Text>
          <Text style={styles.memberCount}>
            {conversation?.members?.length || 0} thành viên
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="search" size={20} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>Tìm tin nhắn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="notifications" size={20} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="people" size={20} color="#007AFF" />
            </View>
            <Text style={styles.quickActionText}>Danh sách thành viên</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THIẾT LẬP TIN NHẮN</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>
                Làm nổi bật tin nhắn từ trường nhóm
              </Text>
            </View>
            <Switch
              value={isNotificationEnabled}
              onValueChange={(value) => setIsNotificationEnabled(value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isNotificationEnabled ? "#007AFF" : "#f4f3f4"}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>
                Thành viên mới xem được tin nhắn gần nhất
              </Text>
            </View>
            <Switch
              value={isNotificationEnabled}
              onValueChange={(value) => setIsNotificationEnabled(value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isNotificationEnabled ? "#007AFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Permission Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUYỀN CỦA THÀNH VIÊN</Text>
          {permissions.map((permission) => (
            <TouchableOpacity
              key={permission.id}
              style={styles.permissionItem}
              onPress={() => openPermissionModal(permission)}
            >
              <Text style={styles.permissionText}>{permission.title}</Text>
              <View style={styles.permissionValue}>
                <Text style={styles.permissionValueText}>
                  {getPermissionText(
                    permission.id,
                    currentPermissions[permission.id]
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Group Management */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUẢN LÝ NHÓM</Text>
            <TouchableOpacity style={styles.managementItem}>
              <Text style={styles.managementText}>Thêm phó nhóm</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.managementItem}>
              <Text style={styles.managementText}>Đổi tên nhóm</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.managementItem}>
              <Text style={styles.managementText}>Đổi ảnh nhóm</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          </View>
        )}

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KHÁC</Text>
          <TouchableOpacity style={styles.dangerItem}>
            <Text style={[styles.dangerText, { color: "#007AFF" }]}>
              Rời nhóm
            </Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={styles.dangerItem}
              onPress={handleDeleteGroup}
            >
              <Text style={[styles.dangerText, { color: "#FF3B30" }]}>
                Giải tán nhóm
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Permission Modal */}
      <Modal
        visible={isPermissionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsPermissionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentPermission?.title}</Text>
              <TouchableOpacity
                onPress={() => setIsPermissionModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {currentPermission?.options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionItem,
                    selectedOption === option.id && styles.selectedOption,
                  ]}
                  onPress={() => setSelectedOption(option.id)}
                >
                  <Text style={styles.optionText}>{option.title}</Text>
                  {selectedOption === option.id && (
                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePermission}
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  groupInfoSection: {
    backgroundColor: "white",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  avatarContainer: {
    marginBottom: 15,
  },
  groupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 14,
    color: "#888",
  },
  quickActionsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5f2ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  quickActionText: {
    fontSize: 12,
    color: "#007AFF",
  },
  section: {
    backgroundColor: "white",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  sectionTitle: {
    fontSize: 13,
    color: "#888",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingText: {
    fontSize: 16,
  },
  permissionItem: {
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  permissionText: {
    fontSize: 16,
  },
  permissionValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  permissionValueText: {
    fontSize: 14,
    color: "#888",
    marginRight: 5,
  },
  managementItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  managementText: {
    fontSize: 16,
  },
  dangerItem: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  dangerText: {
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
  },
  modalHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  modalContent: {
    padding: 15,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e5e5",
  },
  selectedOption: {
    backgroundColor: "#f5f5f5",
  },
  optionText: {
    fontSize: 16,
  },
  modalFooter: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SettingGroup;
