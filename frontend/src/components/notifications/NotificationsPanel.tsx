
import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getUnreadNotifications, markNotificationAsRead } from '@/services/projectRecord.service';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationsPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);

  // Charger les notifications selon le rôle de l'utilisateur
  React.useEffect(() => {
    if (user) {
      const unreadNotifications = getUnreadNotifications(user.role);
      setNotifications(unreadNotifications);
    }
  }, [user, open]);

  // Gérer le clic sur une notification
  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    
    if (notification.type === 'new_project') {
      navigate('/project-records');
    } else if (notification.type === 'new_delivery') {
      navigate('/delivery?tab=delivery');
    } else if (notification.type === 'new_order') {
      navigate('/delivery?tab=orders');
    }
    
    setOpen(false);
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative p-0 h-9 w-9" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] text-[10px]">
              {notifications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <div className="font-medium">Notifications</div>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-center text-gray-500">
              Aucune nouvelle notification
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium">
                      {notification.type === 'new_project' && 'Nouvelle fiche projet'}
                      {notification.type === 'new_delivery' && 'Nouvelle demande de livraison'}
                      {notification.type === 'new_order' && 'Nouvelle commande à traiter'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                    </div>
                  </div>
                  <div className="text-sm mt-1">
                    {notification.type === 'new_project' && `Projet: ${notification.projectName}`}
                    {notification.type === 'new_delivery' && `Livraison pour: ${notification.projectName}`}
                    {notification.type === 'new_order' && `Commande: ${notification.productName}`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    De: {notification.source === 'commercial' ? 'Service Commercial' : 
                         notification.source === 'service_facturation' ? 'Service Facturation' : 
                         'Responsable Achat'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel;
