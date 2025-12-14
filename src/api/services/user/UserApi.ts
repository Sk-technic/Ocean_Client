import api from "../../config/axiosconfig";

const updateCoverImage = async (formData: FormData) => {
  try {
    const response = await api.post("/user/coverImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // only return data, not full AxiosResponse
  } catch (error: any) {
    console.error("❌ Error updating cover image:", error);
    throw error.response?.data || error; // allow React Query to catch cleanly
  }
};

const UpdateProfileImage = async (formData: FormData) => {
  try {
    const response = await api.post("/user/profileImage", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // only return data, not full AxiosResponse
  } catch (error: any) {
    console.error("❌ Error updating profile image:", error);
    throw error.response?.data || error; // allow React Query to catch cleanly
  }
};

const deleteProfileImage = async () => {
  try {
    const response = await api.delete("/user/removeProfileImage");    
    return response.data; 
  } catch (error: any) {
    console.error("❌ Error deleting profile image:", error);
    throw error.response?.data || error; 
  }
};

const deleteCoverImage = async () => {
  try {
    const response = await api.delete("/user/removeCoverImage");    
    return response.data; 
  } catch (error: any) {
    console.error("❌ Error deleting Cover image:", error);
    throw error.response?.data || error; // allow React Query to catch cleanly
  }
};

const updateProfile = async (data: Record<string, any>) => {
  try {
    const response = await api.put("/user/updateProfile", data);  
    return response.data; 
  } catch (error: any) {
    console.error("❌ Error updating profile :", error);
    throw error.response?.data || error; 
  }
};

const findUser = async (query:string)=>{
  try {
    const response = await api.post(`user/${query}`);
    return response.data;
  } catch (error:any) {
    console.error("something wents wrong")
    throw error.response?.data || error
  }
}

const GetUser = async (roomId:string)=>{
  try {
    const response = await api.get(`user/${roomId}`);    
    return response.data;
  } catch (error:any) {
    console.error("something wents wrong")
    throw error.response?.data || error
  }
}

const updatePrivacy = async (userId: string, key: string) => {
  try {
    const response = await api.post(`user/privacy/${userId}`, null, {
      params: { key }
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const blockUser = async (blockedUser:string) => {
 try {
    const response = await api.post(`user/block_user/${blockedUser}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
}

const GetBlockedUsers = async (cursor?:string) => {
  try {
    const response = await api.get("user/block_user/list",{params:cursor ? {cursor} : {} });  
    return response.data.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

const UnblockUser = async (blockedUser:string) => {
  try {
     const response = await api.delete(`user/Unblock_user/${blockedUser}`);   
      return response.data; 
    } catch (error: any) {
      throw error.response?.data || error;
    }
 };


export const UserApi = {
  updateCoverImage,
  UpdateProfileImage,
  deleteProfileImage,
  deleteCoverImage,
  updateProfile,
  findUser,
  GetUser,
  updatePrivacy,
  blockUser,
  GetBlockedUsers,
  UnblockUser
};
