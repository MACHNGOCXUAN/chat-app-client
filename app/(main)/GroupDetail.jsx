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

const GroupDetail = () => {
  const params = useLocalSearchParams();
  const conversation = params.conversation
    ? JSON.parse(params.conversation)
    : null;
  const { user, accessToken } = useSelector((state) => state.auth);

  // Sử dụng useRef để theo dõi đã khởi tạo dữ liệu chưa
  const initializedRef = useRef(false);

  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isChangingPhoto, setIsChangingPhoto] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Hàm fetch thông tin chi tiết nhóm
  const fetchGroupDetail = async () => {
    if (!conversation || !conversation._id) return;

    try {
      // Thay vì gọi API, sử dụng dữ liệu conversation hiện có
      // và lắng nghe sự kiện socket để cập nhật
      socket.emit("get_conversation_details", conversation._id);

      // Vẫn tiếp tục xử lý dữ liệu từ conversation đã có
      setGroupInfo(conversation);
      if (conversation.name) {
        setNewGroupName(conversation.name);
      }

      // Xử lý thông tin thành viên với dữ liệu đã có
      handleMembersData(conversation);
    } catch (error) {
      console.error("Error processing group info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý dữ liệu members
  const handleMembersData = (data) => {
    if (!data || !data.members) return;

    let membersList = [];
    const members = data.members;

    // Kiểm tra xem members có phải là mảng các object user đầy đủ hay không
    if (members[0]?.userId) {
      // Trường hợp members là mảng các object {userId: {...}, role: "..."}
      membersList = members.map((member) => ({
        ...member.userId,
        role: member.role || "member",
      }));

      // Kiểm tra xem user hiện tại có phải là admin của nhóm không
      const currentUserMember = members.find(
        (m) => m.userId && m.userId._id === user._id
      );
      setIsAdmin(currentUserMember?.role === "admin");
    } else {
      // Trường hợp members là mảng các user object trực tiếp
      membersList = members;

      // Kiểm tra nếu có trường admin và so sánh với user hiện tại
      if (data.admin?._id) {
        setIsAdmin(data.admin._id === user._id);
      }
    }

    setMembers(membersList);
  };

  useEffect(() => {
    // Chỉ chạy một lần khi component mount và có conversation
    if (conversation && !initializedRef.current) {
      initializedRef.current = true; // Đánh dấu đã khởi tạo
      setIsLoading(true);

      // Thiết lập thông tin ban đầu từ dữ liệu đã có
      setGroupInfo(conversation);
      if (conversation.name) {
        setNewGroupName(conversation.name);
      }

      // Xử lý dữ liệu members
      let membersList = [];
      if (conversation.members) {
        // Kiểm tra xem members có phải là mảng các object user đầy đủ hay không
        if (conversation.members[0]?.userId) {
          // Trường hợp members là mảng các object {userId: {...}, role: "..."}
          membersList = conversation.members.map((member) => ({
            ...member.userId,
            role: member.role || "member",
          }));

          // Kiểm tra xem user hiện tại có phải là admin của nhóm không
          const currentUserMember = conversation.members.find(
            (m) => m.userId && m.userId._id === user._id
          );
          setIsAdmin(currentUserMember?.role === "admin");
        } else {
          // Trường hợp members là mảng các user object trực tiếp
          membersList = conversation.members;

          // Kiểm tra nếu có trường admin và so sánh với user hiện tại
          if (conversation.admin?._id) {
            setIsAdmin(conversation.admin._id === user._id);
          }
        }
      }

      setMembers(membersList);

      // Fetch thông tin đầy đủ từ server
      fetchGroupDetail();
    }
  }, []);

  useEffect(() => {
    // Lắng nghe sự kiện cập nhật quyền thành viên
    socket.on(
      "member_role_updated",
      ({ conversationId, targetUserId, newRole, updatedConversation }) => {
        if (conversationId === conversation._id) {
          // Cập nhật trạng thái thành viên trong danh sách
          setMembers((prevMembers) =>
            prevMembers.map((member) =>
              member._id === targetUserId
                ? { ...member, role: newRole }
                : member
            )
          );

          // Nếu user hiện tại được thay đổi quyền, cập nhật isAdmin
          if (targetUserId === user._id) {
            setIsAdmin(newRole === "admin");
          }

          // Cập nhật thông tin nhóm
          if (updatedConversation) {
            setGroupInfo(updatedConversation);
          }
        }
    }, []);

    useEffect(() => {
        // Lắng nghe sự kiện cập nhật quyền thành viên
        socket.on('member_role_updated', ({ conversationId, targetUserId, newRole, previousAdminId }) => {
            if (conversationId === conversation._id) {
                console.log('Nhận sự kiện cập nhật quyền:', {
                    targetUserId,
                    newRole,
                    previousAdminId,
                    currentUserId: user._id
                });
                
                // Cập nhật danh sách thành viên
                setMembers(prevMembers => {
                    const updatedMembers = prevMembers.map(member => ({
                        ...member,
                        role: member._id === targetUserId ? 'admin' :
                              member._id === previousAdminId ? 'member' :
                              member.role
                    }));
                    console.log('Danh sách thành viên sau cập nhật:', updatedMembers);
                    return updatedMembers;
                });

                // Cập nhật trạng thái admin của người dùng hiện tại
                if (user._id === targetUserId) {
                    console.log('Người dùng được thăng cấp lên admin');
                    setIsAdmin(true);
                    Alert.alert('Thông báo', 'Bạn đã trở thành quản trị viên của nhóm');
                } else if (user._id === previousAdminId) {
                    console.log('Người dùng không còn là admin');
                    setIsAdmin(false);
                    Alert.alert('Thông báo', 'Bạn không còn là quản trị viên của nhóm');
                }

                // Hiển thị thông báo cho các thành viên khác
                if (user._id !== targetUserId && user._id !== previousAdminId) {
                    const targetMember = members.find(m => m._id === targetUserId);
                    if (targetMember) {
                        Alert.alert(
                            'Thông báo',
                            `${targetMember.username} đã trở thành quản trị viên mới của nhóm`
                        );
                    }
                }
              }

        // Lắng nghe sự kiện nhận chi tiết cuộc trò chuyện
        socket.on('conversation_details', (conversationDetails) => {
            if (conversationDetails && conversationDetails._id === conversation._id) {
                setGroupInfo(conversationDetails);
                if (conversationDetails.name) {
                    setNewGroupName(conversationDetails.name);
                }
                handleMembersData(conversationDetails);
                // Lưu conversation details mới vào localStorage
                localStorage.setItem(`conversation_${conversation._id}`, JSON.stringify(conversationDetails));
            }
          },
        },
      ]
    );
  };

  const handleAddMember = () => {
    setIsAddMemberModalVisible(true);
    setSearchText("");
    setSelectedFriends([]);
    fetchFriends();
  };

  const fetchFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const response = await axiosInstance.get("/api/friend/friends", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Kiểm tra xem response.data có chứa acceptedFriends không, thay vì kiểm tra success
      if (response.data && response.data.acceptedFriends) {
        // Lấy danh sách bạn bè và loại bỏ trùng lặp bằng Set của các ID
        let allFriends = response.data.acceptedFriends || [];
        console.log("All friends from API:", allFriends.length);

        // Loại bỏ trùng lặp bằng cách dùng Map với key là ID
        const uniqueFriendsMap = new Map();
        allFriends.forEach((friend) => {
          if (friend && friend._id) {
            uniqueFriendsMap.set(friend._id.toString(), friend);
          }
        });
        // Lắng nghe sự kiện thành viên bị xóa
        socket.on('member_removed', ({ conversationId, memberId, memberName, adminName }) => {
            if (conversationId === conversation._id) {
                console.log('Nhận sự kiện xóa thành viên:', {
                    memberId,
                    memberName,
                    adminName,
                    currentUserId: user._id
                });
                
                // Cập nhật danh sách thành viên
                setMembers(prevMembers => {
                    const updatedMembers = prevMembers.filter(member => member._id !== memberId);
                    console.log('Danh sách thành viên sau khi xóa:', updatedMembers);
                    return updatedMembers;
                });

                // Xử lý thông báo và chuyển hướng
                if (memberId === user._id) {
                    console.log('Người dùng hiện tại bị xóa khỏi nhóm');
                    Alert.alert(
                        'Thông báo',
                        'Bạn đã bị quản trị viên xóa khỏi nhóm',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    console.log('Chuyển hướng người dùng bị xóa về trang chats');
                                    router.replace("/(tabs)/chats");
                                }
                            }
                        ]
                    );
                } else {
                    console.log('Thông báo cho các thành viên khác');
                    Alert.alert(
                        'Thông báo',
                        `${memberName} đã bị ${adminName} xóa khỏi nhóm`
                    );
                }
            }
        });

        // Lọc ra bạn bè chưa có trong nhóm
        const existingMemberIds = members
          .map((member) => member?._id?.toString())
          .filter(Boolean);
        console.log("Current group members:", existingMemberIds.length);

        const availableFriends = allFriends.filter((friend) => {
          if (!friend || !friend._id) return false;
          const friendId = friend._id.toString();
          return !existingMemberIds.includes(friendId);
        });

        console.log("Available friends to add:", availableFriends.length);

        setFriendsList(availableFriends);
        setFilteredFriends(availableFriends);
        // Khi component mount, kiểm tra và lấy dữ liệu từ localStorage
        const savedConversation = localStorage.getItem(`conversation_${conversation._id}`);
        if (savedConversation) {
            const parsedConversation = JSON.parse(savedConversation);
            setGroupInfo(parsedConversation);
            handleMembersData(parsedConversation);
        }

        // Lắng nghe sự kiện nhóm bị giải tán
        socket.on('group_disbanded', (data) => {
            console.log('Nhận sự kiện giải tán nhóm:', data);
            
            if (data.conversationId === conversation._id) {
                // Xóa dữ liệu local
                try {
                    localStorage.removeItem(`conversation_${data.conversationId}`);
                    console.log('Đã xóa dữ liệu local của nhóm');
                } catch (error) {
                    console.error('Lỗi khi xóa dữ liệu local:', error);
                }
                
                // Hiển thị thông báo và chuyển hướng
                Alert.alert(
                    'Thông báo',
                    `Nhóm "${data.groupName}" đã bị giải tán bởi quản trị viên`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log('Chuyển hướng sau khi nhóm bị giải tán');
                                router.replace("/(tabs)/chats");
                            }
                        }
                    ]
                );
            }
        });

        // Lắng nghe sự kiện thành viên rời nhóm
        socket.on('member_left_group', ({ conversationId, userId, username }) => {
            if (conversationId === conversation._id) {
                console.log('Thành viên rời nhóm:', { userId, username });
                
                // Cập nhật danh sách thành viên
                setMembers(prevMembers => {
                    const updatedMembers = prevMembers.filter(member => member._id !== userId);
                    console.log('Danh sách thành viên sau khi rời nhóm:', updatedMembers);
                    return updatedMembers;
                });

                // Nếu người rời nhóm là người dùng hiện tại
                if (userId === user._id) {
                    router.replace("/(tabs)/chats");
                }
            }
        });

        // Lắng nghe sự kiện lỗi từ server
        socket.on('disband_error', (error) => {
            console.error('Lỗi từ server khi giải tán nhóm:', error);
            Alert.alert('Lỗi', error.message || 'Không thể giải tán nhóm. Vui lòng thử lại sau.');
        });

        // Lắng nghe sự kiện lỗi khi xóa thành viên
        socket.on('remove_member_error', (error) => {
            console.error('Lỗi khi xóa thành viên:', error);
            Alert.alert('Lỗi', error.message || 'Không thể xóa thành viên. Vui lòng thử lại sau.');
        });

        return () => {
            socket.off('member_role_updated');
            socket.off('group_updated');
            socket.off('members_added');
            socket.off('conversation_details');
            socket.off('member_removed');
            socket.off('conversation_deleted');
            socket.off('removed_from_group');
            socket.off('group_disbanded');
            socket.off('member_left_group');
            socket.off('disband_error');
            socket.off('remove_member_error');
        };
    }, [conversation, user, members]);

    const handleLeaveGroup = () => {
        Alert.alert(
            'Rời nhóm',
            'Bạn có chắc chắn muốn rời khỏi nhóm chat này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rời nhóm',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Nếu người dùng là admin và là admin duy nhất, hiển thị thông báo
                            if (isAdmin) {
                                const adminCount = members.filter(m => m.role === 'admin').length;
                                if (adminCount <= 1) {
                                    Alert.alert('Thông báo', 'Bạn cần chuyển quyền admin cho người khác trước khi rời nhóm');
                                    return;
                                }
                            }

                            // Gửi thông báo đến nhóm trước khi rời
                            socket.emit("send_message", {
                                conversationId: conversation._id,
                                senderId: user._id,
                                content: `${user.username} đã rời khỏi nhóm`,
                                messageType: "system"
                            });

                            // Emit sự kiện rời nhóm với thông tin đầy đủ
                            socket.emit("leave_conversation", {
                                conversationId: conversation._id,
                                userId: user._id,
                                username: user.username
                            });

                            // Không chuyển hướng ngay lập tức, đợi phản hồi từ server qua sự kiện 'member_left_group'
                        } catch (error) {
                            console.error('Error leaving group:', error);
                            Alert.alert('Lỗi', 'Không thể rời khỏi nhóm');
                        }
                    }
                },
            ]
        );
        Alert.alert("Thông báo", "Không tìm thấy danh sách bạn bè");
      }
    } catch (error) {
      console.error(
        "Error fetching friends:",
        error.message || "Unknown error"
      );
      Alert.alert("Lỗi", "Không thể tải danh sách bạn bè");
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const handleSearchFriends = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredFriends(friendsList);
    } else {
      const filtered = friendsList.filter(
        (friend) =>
          friend.username.toLowerCase().includes(text.toLowerCase()) ||
          (friend.phoneNumber && friend.phoneNumber.includes(text))
      );
      setFilteredFriends(filtered);
    }
  };

  const toggleSelectFriend = (friend) => {
    if (!friend || !friend._id) return;

    const friendId = friend._id.toString();

    setSelectedFriends((prevSelected) => {
      // Kiểm tra xem người này đã được chọn chưa
      const alreadySelected = prevSelected.some(
        (f) => f._id && f._id.toString() === friendId
      );

      if (alreadySelected) {
        // Loại bỏ khỏi danh sách đã chọn
        return prevSelected.filter(
          (f) => f._id && f._id.toString() !== friendId
        );
      } else {
        // Thêm vào danh sách đã chọn
        return [...prevSelected, friend];
      }
    });
  };

  const confirmAddMembers = () => {
    if (selectedFriends.length === 0) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn ít nhất một người để thêm vào nhóm"
      );
      return;
    }

    // Kiểm tra nếu có thành viên đã trong nhóm
    const existingMemberIds = members
      .map((member) => member?._id?.toString())
      .filter(Boolean);
    const newMembers = selectedFriends.filter((friend) => {
      if (!friend || !friend._id) return false;
      const friendId = friend._id.toString();
      return !existingMemberIds.includes(friendId);
    });

    // Nếu không có thành viên mới nào được thêm
    if (newMembers.length === 0) {
      Alert.alert("Thông báo", "Những người bạn đã chọn đã có trong nhóm");
      setIsAddMemberModalVisible(false);
      return;
    }

    const memberIds = newMembers.map((friend) => friend._id);
    console.log(`Adding ${memberIds.length} new members to group`);

    console.log("h : ", memberIds);

    // Emit socket event để thêm thành viên
    socket.emit("addMemberConversation", {
      conversationId: conversation._id,
      members: memberIds,
    });

    // Cập nhật UI ngay lập tức
    setMembers((prevMembers) => [
      ...prevMembers,
      ...newMembers.map((friend) => ({
        ...friend,
        role: "member",
      })),
    ]);

    // Đóng modal
    setIsAddMemberModalVisible(false);

    // Thông báo thành công
    Alert.alert(
      "Thành công",
      `Đã thêm ${newMembers.length} thành viên vào nhóm`
    );
  };

  const handleRemoveMember = (memberId) => {

    console.log("memberId: ", memberId);
    
    if (!isAdmin) {
      Alert.alert("Thông báo", "Chỉ quản trị viên mới có thể xóa thành viên");
      return;
    }

    // Kiểm tra nếu là admin duy nhất trong nhóm
    const isTargetAdmin =
      members.find((m) => m._id === memberId)?.role === "admin";
    const adminCount = members.filter((m) => m.role === "admin").length;

    if (isTargetAdmin && adminCount <= 1) {
      Alert.alert("Thông báo", "Không thể xóa admin duy nhất khỏi nhóm");
      return;
    }

    Alert.alert(
      "Xóa thành viên",
      "Bạn có chắc chắn muốn xóa thành viên này khỏi nhóm?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => {
            // Cập nhật UI ngay lập tức để trải nghiệm tốt hơn
            setMembers((prevMembers) =>
              prevMembers.filter((member) => member._id !== memberId)
            );

            // Sau đó gửi sự kiện socket
            socket.emit("remove_member", {
              conversationId: conversation._id,
              memberId: memberId,
              adminId: user._id,
            });

            // Thông báo thành công
            Alert.alert("Thành công", "Đã xóa thành viên khỏi nhóm");
          },
        },
      ]
    );
  };

  const openRoleModal = (member) => {
    if (!isAdmin) {
      return;
    }

    if (member._id === user._id) {
      Alert.alert("Thông báo", "Bạn không thể thay đổi quyền của chính mình");
      return;
    }

    setSelectedMember(member);
    setIsRoleModalVisible(true);
  };

  const handleUpdateRole = (newRole) => {
    if (!selectedMember) return;

    // Kiểm tra nếu đang hạ cấp admin cuối cùng
    if (selectedMember.role === "admin" && newRole === "member") {
      const adminCount = members.filter((m) => m.role === "admin").length;
      if (adminCount <= 1) {
        Alert.alert("Thông báo", "Nhóm phải có ít nhất một admin");
        setIsRoleModalVisible(false);
        return;
      }
    }
    const handleRemoveMember = (memberId) => {
        console.log('Bắt đầu xử lý xóa thành viên:', memberId);

        if (!isAdmin) {
            console.log('Không có quyền xóa thành viên - không phải admin');
            Alert.alert('Thông báo', 'Chỉ quản trị viên mới có thể xóa thành viên');
            return;
        }

        // Tìm thông tin thành viên cần xóa
        const memberToRemove = members.find(m => m._id === memberId);
        if (!memberToRemove) {
            console.log('Không tìm thấy thông tin thành viên:', memberId);
            Alert.alert('Lỗi', 'Không tìm thấy thông tin thành viên');
            return;
        }

        // Kiểm tra không thể xóa chính mình
        if (memberId === user._id) {
            console.log('Không thể tự xóa chính mình');
            Alert.alert('Thông báo', 'Bạn không thể xóa chính mình khỏi nhóm');
            return;
        }

        // Kiểm tra nếu là admin
        const isTargetAdmin = memberToRemove.role === 'admin';
        if (isTargetAdmin) {
            console.log('Không thể xóa admin khỏi nhóm');
            Alert.alert('Thông báo', 'Không thể xóa quản trị viên khỏi nhóm');
            return;
        }

        Alert.alert(
            'Xóa thành viên',
            `Bạn có chắc chắn muốn xóa ${memberToRemove.username} khỏi nhóm?\n\nHành động này không thể hoàn tác.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        console.log('Xác nhận xóa thành viên:', memberToRemove.username);

                        // Gửi thông báo trong group chat
                        socket.emit("send_message", {
                            conversationId: conversation._id,
                            senderId: user._id,
                            content: `${memberToRemove.username} đã bị quản trị viên xóa khỏi nhóm`,
                            messageType: "system"
                        });

                        // Emit sự kiện xóa thành viên
                        socket.emit("remove_member", {
                            conversationId: conversation._id,
                            memberId: memberId,
                            adminId: user._id,
                            memberName: memberToRemove.username,
                            adminName: user.username
                        });

                        console.log('Đã gửi yêu cầu xóa thành viên');
                    }
                },
            ]
        );
    };

  const handleRenameGroup = () => {
    if (!isAdmin) {
      Alert.alert("Thông báo", "Chỉ quản trị viên mới có thể đổi tên nhóm");
      return;
    }

    setIsRenameModalVisible(true);
  };

  const submitRenameGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert("Thông báo", "Tên nhóm không được để trống");
      return;
    }
    const handleUpdateRole = (newRole) => {
        if (!selectedMember) {
            console.log('Không tìm thấy thành viên được chọn');
            return;
        }

        // Kiểm tra nếu người thực hiện không phải admin
        if (!isAdmin) {
            console.log('Người dùng không có quyền admin');
            Alert.alert('Thông báo', 'Chỉ quản trị viên mới có thể thay đổi quyền thành viên');
            setIsRoleModalVisible(false);
            return;
        }

        // Kiểm tra nếu đang thay đổi quyền của chính mình
        if (selectedMember._id === user._id) {
            console.log('Không thể tự thay đổi quyền của mình');
            Alert.alert('Thông báo', 'Bạn không thể thay đổi quyền của chính mình');
            setIsRoleModalVisible(false);
            return;
        }

        // Nếu đang thăng cấp lên admin
        if (newRole === 'admin') {
            Alert.alert(
                'Xác nhận',
                'Khi bạn chuyển quyền quản trị cho người này:\n\n' +
                '- Bạn sẽ trở thành thành viên thường\n' +
                '- Bạn sẽ không còn quyền quản trị\n' +
                '- Tất cả quyền quản trị sẽ được chuyển cho người này\n\n' +
                'Bạn có chắc chắn muốn thực hiện?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Đồng ý',
                        style: 'destructive',
                        onPress: () => {
                            console.log('Bắt đầu chuyển quyền admin cho:', selectedMember.username);
                            
                            // Emit socket event để cập nhật role
                            socket.emit("update_member_role", {
                                conversationId: conversation._id,
                                targetUserId: selectedMember._id,
                                newRole: 'admin',
                                previousAdminId: user._id,
                                groupName: conversation.name || 'Nhóm chat'
                            });

                            // Gửi thông báo trong group chat
                            socket.emit("send_message", {
                                conversationId: conversation._id,
                                senderId: user._id,
                                content: `${user.username} đã chuyển quyền quản trị viên cho ${selectedMember.username}`,
                                messageType: "system"
                            });

                            // Đóng modal
                            setIsRoleModalVisible(false);
                        }
                    }
                ]
            );
        } else {
            console.log('Không cho phép hạ cấp thành viên');
            Alert.alert('Thông báo', 'Không thể hạ cấp thành viên. Chỉ có thể chuyển quyền quản trị.');
            setIsRoleModalVisible(false);
        }
    };

    const handleRenameGroup = () => {
        if (!isAdmin) {
            Alert.alert('Thông báo', 'Chỉ quản trị viên mới có thể đổi tên nhóm');
            return;
        }

        setIsRenameModalVisible(true);
    };

    const submitRenameGroup = async () => {
        if (!newGroupName.trim()) {
            Alert.alert('Thông báo', 'Tên nhóm không được để trống');
            return;
        }

        if (groupInfo && newGroupName.trim() === groupInfo.name) {
            setIsRenameModalVisible(false);
            return;
        }

        setIsUpdating(true);
        try {
            // Sử dụng socket thay vì API vì hiện tại API endpoint không tồn tại
            socket.emit('update_group_name', {
                conversationId: conversation._id,
                name: newGroupName.trim(),
                userId: user._id
            });

            // Cập nhật giao diện
            setGroupInfo(prev => ({
                ...prev,
                name: newGroupName.trim()
            }));

            Alert.alert('Thành công', 'Đã đổi tên nhóm');
        } catch (error) {
            console.error('Error renaming group:', error);
            Alert.alert('Lỗi', 'Không thể đổi tên nhóm');
        } finally {
            setIsUpdating(false);
            setIsRenameModalVisible(false);
        }
    };

    const handleChangeGroupPhoto = async () => {
        if (!isAdmin) {
            Alert.alert('Thông báo', 'Chỉ quản trị viên mới có thể đổi ảnh nhóm');
            return;
        }
      );

      if (uploadResponse.data && uploadResponse.data.success) {
        const imageURL = uploadResponse.data.data;

        // Sử dụng socket thay vì API vì hiện tại API endpoint không tồn tại
        socket.emit("update_group_image", {
          conversationId: conversation._id,
          imageUrl: imageURL,
          userId: user._id,
        });

        // Cập nhật giao diện
        setGroupInfo((prev) => ({
          ...prev,
          imageGroup: imageURL,
        }));

        Alert.alert("Thành công", "Đã đổi ảnh nhóm");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading group image:", error);
      Alert.alert("Lỗi", "Không thể cập nhật ảnh nhóm");
    } finally {
      setIsChangingPhoto(false);
    }
  };

  const handleDeleteGroup = async () => {
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
          onPress: async () => {
            try {
              const response = await axiosInstance.post(
                "/api/conversation/groupDisbanded",
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (uploadResponse.data && uploadResponse.data.success) {
                const imageURL = uploadResponse.data.data;

                // Sử dụng socket thay vì API vì hiện tại API endpoint không tồn tại
                socket.emit('update_group_image', {
                    conversationId: conversation._id,
                    imageUrl: imageURL,
                    userId: user._id
                });

                // Cập nhật giao diện
                setGroupInfo(prev => ({
                    ...prev,
                    imageGroup: imageURL
                }));

                Alert.alert('Thành công', 'Đã đổi ảnh nhóm');
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading group image:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật ảnh nhóm');
        } finally {
            setIsChangingPhoto(false);
        }
    };

    const handleDeleteGroup = async () => {
        console.log('Bắt đầu xử lý giải tán nhóm');

        if (!isAdmin) {
            console.log('Không có quyền giải tán nhóm - không phải admin');
            Alert.alert('Thông báo', 'Chỉ quản trị viên mới có thể giải tán nhóm');
            return;
        }

        Alert.alert(
            'Giải tán nhóm',
            'CẢNH BÁO: Hành động này sẽ:\n\n' +
            '- Xóa vĩnh viễn tất cả tin nhắn\n' +
            '- Xóa toàn bộ dữ liệu nhóm\n' +
            '- Đưa tất cả thành viên ra khỏi nhóm\n' +
            '- Không thể khôi phục lại\n\n' +
            'Bạn có chắc chắn muốn giải tán nhóm này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Giải tán',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.log('Xác nhận giải tán nhóm:', conversation._id);

                            // Gửi thông báo cuối cùng
                            socket.emit("send_message", {
                                conversationId: conversation._id,
                                senderId: user._id,
                                content: "Nhóm chat đã bị giải tán bởi quản trị viên",
                                messageType: "system"
                            });

                            console.log('Đã gửi thông báo giải tán');

                            // Emit sự kiện giải tán nhóm
                            socket.emit("disband_group", {
                                conversationId: conversation._id,
                                adminId: user._id,
                                groupName: conversation.name || 'Nhóm chat',
                                members: members.map(member => ({
                                    _id: member._id,
                                    username: member.username
                                }))
                            });

                            console.log('Đã gửi yêu cầu giải tán nhóm');
                            // Không chuyển hướng ngay lập tức, đợi phản hồi từ server qua sự kiện 'group_disbanded'
                        } catch (error) {
                            console.error('Lỗi khi giải tán nhóm:', error);
                            Alert.alert('Lỗi', 'Không thể giải tán nhóm. Vui lòng thử lại sau.');
                        }
                    }
                }
            ]
        );
    };

    const renderMemberItem = ({ item }) => {
        const isCurrentUser = user && item && user._id === item._id;
        const isItemAdmin = item.role === 'admin';

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => isAdmin && openRoleModal(item)}
        disabled={!isAdmin}
      >
        <View style={styles.memberInfo}>
          <Image
            source={{
              uri:
                item?.avatarURL ||
                "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            }}
            style={styles.memberAvatar}
          />
          <View>
            <Text style={styles.memberName}>
              {item?.username || "Người dùng"} {isCurrentUser ? "(Bạn)" : ""}
            </Text>
            {isItemAdmin && (
              <Text style={styles.adminLabel}>Quản trị viên</Text>
            )}
          </View>
        </View>

        {isAdmin && !isCurrentUser && (
          <View style={styles.memberActions}>
            <TouchableOpacity
                style={styles.memberItem}
                onPress={() => isAdmin && !isCurrentUser && openRoleModal(item)}
                disabled={!isAdmin || isCurrentUser}
            >
                <View style={styles.memberInfo}>
                    <Image
                        source={{ uri: item?.avatarURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                        style={styles.memberAvatar}
                    />
                    <View>
                        <Text style={styles.memberName}>{item?.username || 'Người dùng'} {isCurrentUser ? '(Bạn)' : ''}</Text>
                        {isItemAdmin && <Text style={styles.adminLabel}>Quản trị viên</Text>}
                    </View>
                </View>

                {isAdmin && !isCurrentUser && (
                    <View style={styles.memberActions}>
                        {!isItemAdmin && (
                            <>
                                <TouchableOpacity
                                    style={styles.roleButton}
                                    onPress={() => openRoleModal(item)}
                                >
                                    <MaterialIcons name="admin-panel-settings" size={20} color="#297EFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveMember(item._id)}
                                >
                                    <MaterialIcons name="remove-circle" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Thêm useEffect để theo dõi thay đổi quyền
    useEffect(() => {
        if (!isAdmin) {
            console.log('Người dùng không còn quyền admin - Cập nhật giao diện');
            // Ẩn tất cả các chức năng quản trị
            setIsRoleModalVisible(false);
            setIsRenameModalVisible(false);
            setIsAddMemberModalVisible(false);
            
            // Disable các nút chức năng quản trị
            const adminButtons = document.querySelectorAll('.admin-function');
            adminButtons.forEach(button => {
                button.disabled = true;
            });
        }
    }, [isAdmin]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#297EFF" />
                <Text style={{ marginTop: 10 }}>Đang tải...</Text>
            </View>
        );
    }

  if (isLoading) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                {/* Phần thông tin nhóm */}
                <View style={styles.groupInfoContainer}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={handleChangeGroupPhoto}
                        disabled={!isAdmin || isChangingPhoto}
                    >
                        {isChangingPhoto ? (
                            <View style={styles.loadingAvatarContainer}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            </View>
                        ) : (
                            <>
                                <Image
                                    source={{ uri: groupInfo?.avatarURL || groupInfo?.imageGroup || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                                    style={styles.groupAvatar}
                                />
                                {isAdmin && (
                                    <View style={styles.editAvatarBadge}>
                                        <Ionicons name="camera" size={16} color="#FFFFFF" />
                                    </View>
                                )}
                            </>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.groupName}>{groupInfo?.name || 'Nhóm chat'}</Text>
                    <Text style={styles.memberCount}>{members?.length || 0} thành viên</Text>
                </View>

                {/* Phần chức năng */}
                <View style={styles.functionContainer}>
                    <TouchableOpacity style={styles.functionButton}>
                        <Ionicons name="search" size={24} color="#297EFF" />
                        <Text style={styles.functionText}>Tìm kiếm tin nhắn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.functionButton} onPress={handleAddMember}>
                        <Ionicons name="person-add" size={24} color="#297EFF" />
                        <Text style={styles.functionText}>Thêm thành viên</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.functionButton}
                        onPress={() => router.push({
                            pathname: '/(main)/ChatScreen',
                            params: {
                                conversation: params.conversation
                            }
                        })}
                    >
                        <Ionicons name="chatbubble-ellipses" size={24} color="#297EFF" />
                        <Text style={styles.functionText}>Nhắn tin</Text>
                    </TouchableOpacity>
                </View>

                {/* Phần cài đặt thông báo */}
                <View style={styles.settingSection}>
                    <Text style={styles.sectionTitle}>Thông báo</Text>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingText}>Bật thông báo</Text>
                        <Switch
                            value={isNotificationEnabled}
                            onValueChange={(value) => setIsNotificationEnabled(value)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={isNotificationEnabled ? '#297EFF' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Phần thành viên */}
                <View style={styles.memberSection}>
                    <View style={styles.memberHeader}>
                        <Text style={styles.sectionTitle}>Thành viên nhóm</Text>
                        <Text style={styles.memberCount}>{members?.length || 0}</Text>
                    </View>
                    {members && members.length > 0 ? (
                        <FlatList
                            data={members}
                            renderItem={renderMemberItem}
                            keyExtractor={(item, index) => item?._id || `member-${index}`}
                            scrollEnabled={false}
                        />
                    ) : (
                        <Text style={{ padding: 15, textAlign: 'center', color: 'gray' }}>
                            Không có thành viên nào
                        </Text>
                    )}
                </View>

                {/* Phần tùy chọn khác */}
                <View style={styles.otherOptionsSection}>
                    {isAdmin && (
                        <>
                            <TouchableOpacity style={styles.optionItem} onPress={() => {
                                router.push({
                                    pathname: "(main)/SettingGroup",
                                    params: {
                                        conversation: JSON.stringify(conversation),
                                    },
                                });
                            }}>
                                <Ionicons name="settings" size={24} color="#297EFF" />
                                <Text style={styles.optionText}>Cài đặt nhóm</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionItem} onPress={handleRenameGroup}>
                                <Entypo name="info-with-circle" size={24} color="#297EFF" />
                                <Text style={styles.optionText}>Đổi tên nhóm</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.optionItem} onPress={handleChangeGroupPhoto}>
                                <FontAwesome name="photo" size={24} color="#297EFF" />
                                <Text style={styles.optionText}>Đổi ảnh nhóm</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <TouchableOpacity style={styles.optionItem} onPress={handleLeaveGroup}>
                        <MaterialIcons name="exit-to-app" size={24} color="red" />
                        <Text style={[styles.optionText, styles.leaveText]}>Rời nhóm</Text>
                    </TouchableOpacity>
                </View>

                {/* Nút giải tán nhóm chỉ hiển thị cho admin */}
                {isAdmin && (
                  <View style={styles.editAvatarBadge}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.groupName}>{groupInfo?.name || "Nhóm chat"}</Text>
          <Text style={styles.memberCount}>
            {members?.length || 0} thành viên
          </Text>
        </View>

        {/* Phần chức năng */}
        <View style={styles.functionContainer}>
          <TouchableOpacity style={styles.functionButton}>
            <Ionicons name="search" size={24} color="#297EFF" />
            <Text style={styles.functionText}>Tìm kiếm tin nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.functionButton}
            onPress={handleAddMember}
          >
            <Ionicons name="person-add" size={24} color="#297EFF" />
            <Text style={styles.functionText}>Thêm thành viên</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.functionButton}
            onPress={() =>
              router.push({
                pathname: "/(main)/ChatScreen",
                params: {
                  conversation: params.conversation,
                },
              })
            }
          >
            <Ionicons name="chatbubble-ellipses" size={24} color="#297EFF" />
            <Text style={styles.functionText}>Nhắn tin</Text>
          </TouchableOpacity>
        </View>

        {/* Phần cài đặt thông báo */}
        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>Thông báo</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Bật thông báo</Text>
            <Switch
              value={isNotificationEnabled}
              onValueChange={(value) => setIsNotificationEnabled(value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isNotificationEnabled ? "#297EFF" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Phần thành viên */}
        <View style={styles.memberSection}>
          <View style={styles.memberHeader}>
            <Text style={styles.sectionTitle}>Thành viên nhóm</Text>
            <Text style={styles.memberCount}>{members?.length || 0}</Text>
          </View>
          {members && members.length > 0 ? (
            <FlatList
              data={members}
              renderItem={renderMemberItem}
              keyExtractor={(item, index) => item?._id || `member-${index}`}
              scrollEnabled={false}
            />
          ) : (
            <Text style={{ padding: 15, textAlign: "center", color: "gray" }}>
              Không có thành viên nào
            </Text>
          )}
        </View>

        {/* Phần tùy chọn khác */}
        <View style={styles.otherOptionsSection}>
          {isAdmin && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                router.push({
                  pathname: "(main)/SettingGroup",
                  params: {
                    conversation: JSON.stringify(conversation),
                  },
                });
              }}
            >
              <Ionicons name="settings" size={24} color="#297EFF" />
              <Text style={styles.optionText}>Cài đặt nhóm</Text>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                router.push({
                  pathname: "(main)/SettingGroup",
                  params: {
                    conversation: JSON.stringify(conversation),
                  },
                });
              }}
            >
              <Ionicons name="settings" size={24} color="#297EFF" />
              <Text style={styles.optionText}>Chuyển quyền trưởng nhóm</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.optionItem}
            onPress={handleRenameGroup}
          >
            <Entypo name="info-with-circle" size={24} color="#297EFF" />
            <Text style={styles.optionText}>Đổi tên nhóm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={handleChangeGroupPhoto}
          >
            <FontAwesome name="photo" size={24} color="#297EFF" />
            <Text style={styles.optionText}>Đổi ảnh nhóm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={handleLeaveGroup}
          >
            <MaterialIcons name="exit-to-app" size={24} color="red" />
            <Text style={[styles.optionText, styles.leaveText]}>Rời nhóm</Text>
          </TouchableOpacity>
        </View>

        {/* Nút giải tán nhóm dành riêng cho admin */}
        {isAdmin && (
          <View style={styles.deleteGroupContainer}>
            <TouchableOpacity
              style={styles.deleteGroupButton}
              onPress={handleDeleteGroup}
            >
              <MaterialIcons name="delete-forever" size={24} color="white" />
              <Text style={styles.deleteGroupText}>Giải tán nhóm</Text>
            </TouchableOpacity>
            <Text style={styles.deleteGroupNote}>
              Khi giải tán nhóm, tất cả tin nhắn và dữ liệu sẽ bị xóa vĩnh viễn.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal quản lý quyền thành viên */}
      <Modal
        visible={isRoleModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRoleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsRoleModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Quản lý quyền</Text>
              <Text style={styles.modalSubtitle}>
                {selectedMember?.username || "Thành viên"}
              </Text>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedMember?.role === "admin" && styles.selectedRole,
                ]}
                onPress={() => handleUpdateRole("admin")}
              >
                <MaterialIcons
                  name="admin-panel-settings"
                  size={24}
                  color="#297EFF"
                />
                <View style={styles.roleOptionContent}>
                  <Text style={styles.roleOptionTitle}>Quản trị viên</Text>
                  <Text style={styles.roleOptionDesc}>
                    Có thể quản lý thành viên và cài đặt nhóm
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  selectedMember?.role === "member" && styles.selectedRole,
                ]}
                onPress={() => handleUpdateRole("member")}
              >
                <FontAwesome5 name="user" size={24} color="#297EFF" />
                <View style={styles.roleOptionContent}>
                  <Text style={styles.roleOptionTitle}>Thành viên</Text>
                  <Text style={styles.roleOptionDesc}>
                    Chỉ có thể nhắn tin và xem thông tin nhóm
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsRoleModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal đổi tên nhóm */}
      <Modal
        visible={isRenameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRenameModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => !isUpdating && setIsRenameModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Đổi tên nhóm</Text>

              <TextInput
                style={styles.input}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Nhập tên nhóm mới"
                maxLength={50}
                editable={!isUpdating}
              />

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelModalButton]}
                  onPress={() => !isUpdating && setIsRenameModalVisible(false)}
                  disabled={isUpdating}
                >
                  <Text style={styles.modalButtonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmModalButton]}
                  onPress={submitRenameGroup}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[styles.modalButtonText, styles.confirmButtonText]}
                    >
                      Lưu
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal thêm thành viên */}
      <Modal
        visible={isAddMemberModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddMemberModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addMemberContainer}>
            <View style={styles.addMemberHeader}>
              <Text style={styles.modalTitle}>Thêm thành viên</Text>
              <TouchableOpacity
                onPress={() => setIsAddMemberModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Thanh tìm kiếm */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#777"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                value={searchText}
                onChangeText={handleSearchFriends}
              />
            </View>

            {/* Hiển thị danh sách bạn bè */}
            {isLoadingFriends ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#297EFF" />
                <Text style={{ marginTop: 10 }}>Đang tải...</Text>
              </View>
            ) : filteredFriends.length > 0 ? (
              <FlatList
                data={filteredFriends}
                keyExtractor={(item) =>
                  item._id?.toString() || Math.random().toString()
                }
                renderItem={({ item }) => {
                  // Chắc chắn rằng item có tồn tại và có _id
                  if (!item || !item._id) return null;

                  const friendId = item._id.toString();
                  const isSelected = selectedFriends.some(
                    (f) => f._id && f._id.toString() === friendId
                  );

                  return (
                    <TouchableOpacity
                      style={[
                        styles.friendItem,
                        isSelected && styles.selectedFriendItem,
                      ]}
                      onPress={() => toggleSelectFriend(item)}
                    >
                      <View style={styles.friendInfo}>
                        <Image
                          source={{
                            uri:
                              item.avatarURL ||
                              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
                          }}
                          style={styles.friendAvatar}
                        />
                        <View>
                          <Text style={styles.friendName}>
                            {item.username || "Người dùng"}
                          </Text>
                          {item.phoneNumber && (
                            <Text style={styles.friendPhone}>
                              {item.phoneNumber}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkedBox,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.friendList}
              />
            ) : (
              <View style={styles.noResultsContainer}>
                {searchText ? (
                  <Text style={styles.noResultsText}>
                    Không tìm thấy bạn bè phù hợp
                  </Text>
                ) : friendsList.length === 0 ? (
                  <View>
                    <Text style={styles.noResultsText}>
                      Bạn chưa có bạn bè nào
                    </Text>
                    <Text
                      style={[
                        styles.noResultsText,
                        { marginTop: 10, fontSize: 14 },
                      ]}
                    >
                      Thêm bạn bè trước khi mời họ vào nhóm
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noResultsText}>
                    Tất cả bạn bè đã có trong nhóm
                  </Text>
                )}
              </View>
            )}

            {/* Nút xác nhận thêm thành viên */}
            <View style={styles.addButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  selectedFriends.length === 0 && styles.disabledButton,
                ]}
                onPress={confirmAddMembers}
                disabled={selectedFriends.length === 0}
              >
                <Text style={styles.addButtonText}>
                  Thêm{" "}
                  {selectedFriends.length > 0
                    ? `(${selectedFriends.length})`
                    : ""}
                </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  groupInfoContainer: {
    backgroundColor: "white",
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  groupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#297EFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  loadingAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 14,
    color: "grey",
  },
  functionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    paddingVertical: 15,
    marginTop: 10,
  },
  functionButton: {
    alignItems: "center",
  },
  functionText: {
    marginTop: 5,
    fontSize: 12,
  },
  settingSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingText: {
    fontSize: 16,
  },
  memberSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
  },
  memberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
  },
  adminLabel: {
    fontSize: 12,
    color: "#297EFF",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleButton: {
    marginRight: 15,
  },
  otherOptionsSection: {
    backgroundColor: "white",
    marginTop: 10,
    padding: 15,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 15,
  },
  leaveText: {
    color: "red",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "gray",
    marginBottom: 20,
    textAlign: "center",
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  selectedRole: {
    backgroundColor: "#e0f0ff",
    borderWidth: 1,
    borderColor: "#297EFF",
  },
  roleOptionContent: {
    marginLeft: 15,
    flex: 1,
  },
  roleOptionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  roleOptionDesc: {
    fontSize: 12,
    color: "gray",
  },
  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "gray",
  },
  // Input styles
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginVertical: 15,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelModalButton: {
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  confirmModalButton: {
    backgroundColor: "#297EFF",
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555555",
  },
  confirmButtonText: {
    color: "#FFFFFF",
  },
  // Styles cho nút giải tán nhóm
  deleteGroupContainer: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  deleteGroupButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
  },
  deleteGroupText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  deleteGroupNote: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  // Styles cho modal thêm thành viên
  addMemberContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "90%",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  addMemberHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 15,
    padding: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 15,
    padding: 10,
    borderRadius: 10,
  },
  searchIcon: {
    marginHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    color: "#333",
  },
  friendList: {
    paddingHorizontal: 15,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedFriendItem: {
    backgroundColor: "#f0f7ff",
  },
  friendInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  friendAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "500",
  },
  friendPhone: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: {
    backgroundColor: "#297EFF",
    borderColor: "#297EFF",
  },
  addButtonContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addButton: {
    backgroundColor: "#297EFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#B0C4DE",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  noResultsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  }
});

export default GroupDetail;
