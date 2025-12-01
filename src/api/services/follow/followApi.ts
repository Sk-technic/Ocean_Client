import api from "../../config/axiosconfig"

const sendRequest = async (id:string)=>{
    try {
        const result = await api.post(`/follow/${id}`);
        return result.data
    } catch (error: any) {
        throw error.response?.data || error
    }
}

const acceptRequest = async (data:{userId:string;notificationId:string}) => {
    try {
        const result = await api.post(`/accept`,data)
        return result.data
    } catch (error:any) {
      throw error.response?.data || error  
    }
}

const rejectRequest = async (data:{userId:string;notificationId:string}) => {
    try {
        const result = await api.post(`/reject`,data)
        return result.data
    } catch (error:any) {
      throw error.response?.data || error  
    }
}

export const followApi = {
    sendRequest,
    acceptRequest,
    rejectRequest
}