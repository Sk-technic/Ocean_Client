import api from "../../config/axiosconfig"

const GetNotifications = async (id:string)=>{
    try {
        const result = await api.get(`/notification/fetch/${id}`);
        return result.data
    } catch (error: any) {
        throw error.response?.data ||error
    }
}

export const notificationApi = {
    GetNotifications
}