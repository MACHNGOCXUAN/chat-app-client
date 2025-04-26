import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    Alert,
    Image,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';
import socket from '../../utils/socket';

const AddGroupMember = () => {
    const params = useLocalSearchParams();
    const conversationId = params.conversationId;
    const existingMembers = params.existingMembers ? JSON.parse(params.existingMembers) : [];
    const { user, accessToken } = useSelector(state => state.auth);

    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (accessToken) {
            fetchContacts();
        } else {
            Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
            router.back();
        }
    }, [accessToken]);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            // Gọi API lấy danh sách bạn bè với token xác thực
            const response = await axiosInstance.get('/api/friend/friends', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (response.data.success) {
                // Lọc ra các bạn bè chưa có trong nhóm
                const friends = response.data.acceptedFriends || [];
                const filteredFriends = friends.filter(friend =>
                    !existingMembers.includes(friend._id)
                );
                setContacts(filteredFriends);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách liên hệ');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelectContact = (contact) => {
        if (selectedContacts.some(item => item._id === contact._id)) {
            setSelectedContacts(selectedContacts.filter(item => item._id !== contact._id));
        } else {
            setSelectedContacts([...selectedContacts, contact]);
        }
    };

    const handleAddMembers = async () => {
        if (selectedContacts.length === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một người để thêm vào nhóm');
            return;
        }

        try {
            setIsLoading(true);
            const memberIds = selectedContacts.map(contact => contact._id);

            const response = await axiosInstance.post('/api/conversation/addMembers', {
                conversationId,
                memberIds
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (response.data.success) {
                Alert.alert('Thành công', 'Đã thêm thành viên vào nhóm');
                router.back();
            } else {
                Alert.alert('Lỗi', response.data.message || 'Không thể thêm thành viên');
            }
        } catch (error) {
            console.error('Error adding members:', error);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm thành viên vào nhóm');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredContacts = searchQuery
        ? contacts.filter(contact =>
            contact.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : contacts;

    const renderContactItem = ({ item }) => {
        const isSelected = selectedContacts.some(contact => contact._id === item._id);

        return (
            <TouchableOpacity
                style={[styles.contactItem, isSelected && styles.selectedItem]}
                onPress={() => toggleSelectContact(item)}
                activeOpacity={0.7}
            >
                <View style={styles.contactInfo}>
                    <Image
                        source={{ uri: item.avatarURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                        style={styles.avatar}
                    />
                    <Text style={styles.contactName}>{item.username}</Text>
                </View>

                <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
                    {isSelected && <FontAwesome name="check" size={16} color="white" />}
                </View>
            </TouchableOpacity>
        );
    };

    // Hiển thị danh sách các liên hệ đã chọn ở dưới cùng
    const renderBottomSelectedContacts = () => {
        if (selectedContacts.length === 0) return null;

        return (
            <View style={styles.bottomBarContainer}>
                <View style={styles.selectedContactsContainer}>
                    <FlatList
                        data={selectedContacts}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={item => `selected-${item._id}`}
                        renderItem={({ item }) => (
                            <View style={styles.selectedContact}>
                                <Image
                                    source={{ uri: item.avatarURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y' }}
                                    style={styles.selectedAvatar}
                                />
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => toggleSelectContact(item)}
                                >
                                    <MaterialIcons name="close" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddMembers}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <MaterialIcons name="check" size={24} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.title}>Thêm thành viên nhóm</Text>
                <View style={styles.rightPlaceholder} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={22} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm bạn bè..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Danh sách bạn bè */}
            {isLoading && contacts.length === 0 ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#297EFF" />
                    <Text style={{ marginTop: 10, color: 'gray' }}>Đang tải danh sách bạn bè...</Text>
                </View>
            ) : contacts.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="people" size={50} color="#ccc" />
                    <Text style={{ marginTop: 10, color: 'gray', textAlign: 'center' }}>
                        Không có bạn bè nào để thêm vào nhóm{'\n'}hoặc tất cả bạn bè đã có trong nhóm
                    </Text>
                </View>
            ) : filteredContacts.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="search" size={50} color="#ccc" />
                    <Text style={{ marginTop: 10, color: 'gray' }}>Không tìm thấy bạn bè phù hợp</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredContacts}
                    renderItem={renderContactItem}
                    keyExtractor={item => item._id}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Selected contacts bottom bar */}
            {renderBottomSelectedContacts()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: StatusBar.currentHeight || 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
        width: 40,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    rightPlaceholder: {
        width: 40,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 12,
        margin: 15,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 8,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 100, // Space for bottom bar
    },
    contactItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    selectedItem: {
        backgroundColor: '#f0f7ff',
    },
    contactInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    contactName: {
        fontSize: 16,
        fontWeight: '500',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    checkedBox: {
        backgroundColor: '#297EFF',
        borderColor: '#297EFF',
    },
    bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    selectedContactsContainer: {
        flex: 1,
        marginRight: 10,
    },
    selectedContact: {
        marginRight: 10,
        position: 'relative',
    },
    selectedAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    removeButton: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#ff4d4d',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButton: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: '#297EFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AddGroupMember; 