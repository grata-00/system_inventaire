
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import NotificationsPanel from "@/components/notifications/NotificationsPanel"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { getUnreadNotifications } from "@/services/projectRecord.service"

export function Toaster() {
  const { toasts } = useToast()
  const { user } = useAuth()
  const [hasNotifications, setHasNotifications] = useState(false)
  
  // Vérifier les notifications non lues pour l'utilisateur actuel
  useEffect(() => {
    if (user) {
      const checkNotifications = () => {
        const notifications = getUnreadNotifications(user.role);
        setHasNotifications(notifications.length > 0);
      };
      
      checkNotifications();
      
      // Vérifier les notifications toutes les 30 secondes
      const interval = setInterval(checkNotifications, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="z-[100]">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="z-[100]" />
    </ToastProvider>
  )
}
