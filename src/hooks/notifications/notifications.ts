import { useMutation, useQuery } from "@tanstack/react-query";
import { notificationApi } from "../../api/services/notifications/notificationApi";
import { useAppDispatch } from "../../store/hooks";
import { markAllAsRead, setNotifications } from "../../store/slices/notification/notificationSlice";


export const useGetNotification = (Id:string) => {
    const dispatch = useAppDispatch()
  const query = useQuery({
    queryKey: ["getNotification", Id],
    queryFn: async () => {
      if (!Id) throw new Error("user fot found.");
      const res = await notificationApi.GetNotifications(Id)
      console.log("notification fetched: ",res.data);
        dispatch(setNotifications(res.data))
    },
    enabled: !!Id,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false
  });
  return query
};

export const useReadAllNotification = () => {
    const dispatch = useAppDispatch() 
    return useMutation({
        mutationFn:async (id:string)=>await notificationApi.readAllNotifications(id),
        onSuccess:()=>{
          dispatch(markAllAsRead())
        }
      })
};