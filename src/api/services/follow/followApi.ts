import api from "../../config/axiosconfig"

const sendRequest = async (id: string) => {
    try {
        const result = await api.post(`/follow/${id}`);
        return result.data
    } catch (error: any) {
        throw error.response?.data || error
    }
}

const acceptRequest = async (data: { userId: string; notificationId: string }) => {
    try {
        const result = await api.post(`/accept`, data)
        return result.data
    } catch (error: any) {
        throw error.response?.data || error
    }
}

const rejectRequest = async (data: { userId: string; notificationId: string }) => {
    try {
        const result = await api.post(`/reject`, data)
        return result.data
    } catch (error: any) {
        throw error.response?.data || error
    }
}

const blockfollowRequest = async (id: string) => {
    try {
        const response = await api.post(`block_request/${id}`)
        return response?.data
    } catch (error: any) {
        throw error.response?.data || error
    }
}

const UnblockFollowRequest = async (id: string) => {
    try {
        console.log(id);
        
        const response = await api.delete(`unblock_request/${id}`)
        return response?.data
    } catch (error: any) {
        throw error.response?.data || error
    }
}

const GetMutedUsers = async (cursor?: string | null, limit: number = 8) => {
    try {
        const params: any = { limit };
        if (cursor) {
            params.cursor = cursor;
        }
        const response = await api.get("muteUsers", { params });
        return response?.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

const UnFollowUser = async (id: string) => {
    try {
        const response = await api.delete(`unfollow/${id}`);    
        return response?.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }   
};

export const followApi = {
    sendRequest,
    acceptRequest,
    rejectRequest,
    blockfollowRequest,
    UnblockFollowRequest,
    GetMutedUsers,
    UnFollowUser
}