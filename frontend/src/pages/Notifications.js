import React, { useEffect, useState } from "react";
import { FaGift } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Footer from "../components/Footer";
import Header from "../components/Header";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.token) {
      console.log("Utilisateur non connecté, pas de récupération des notifications.");
      return; 
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch("https://diapo-app.onrender.com/api/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Erreur lors du chargement des notifications");

        const data = await response.json();
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error("Erreur chargement notifications :", error.message);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`https://diapo-app.onrender.com/api/notifications/read/${notificationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Échec lors de la mise à jour de la notification.");
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme lu :", error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="bg-blue-700 text-white px-10 py-10 flex items-center h-[250px] space-x-4">
         <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full bg-white text-blue-700 hover:bg-gray-100 shadow"
              title="Retour au tableau de bord"
            >
              <FaArrowLeft />
            </button>
            <h1 className="text-3xl font-semibold">Notifications</h1>
        </div>
      
      </div>

      <div className="flex flex-1">
        <div className="w-1/3 bg-gray-300 border-r">
          <div className="bg-white text-gray-900 p-4 text-lg font-semibold">
            Notifications
          </div>
          <div className="p-2 overflow-y-auto h-full">
            {notifications.length === 0 ? (
              <p className="text-gray-500">Aucune notification</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-md shadow-sm p-3 mb-2 flex items-start justify-between hover:bg-blue-50 cursor-pointer ${
                      notification.vu ? 'opacity-50' : 'opacity-100'
                    }`}                  
                    onClick={async () => {
                      await markAsRead(notification._id);
                      setNotifications(prev =>
                        prev.map(n => n._id === notification._id ? { ...n, vu: true } : n)
                      );
                      setSelectedNotification(notification);
                    }}
                >
                  <div className="flex gap-2">
                    <div className="p-2 bg-gray-200 rounded-full">
                      <FaGift className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {notification.emetteur?.pseudo || "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-1">
                        Intérêt pour le don : {notification.don?.titre || ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 whitespace-nowrap">
                    {new Date(notification.createdAt).toLocaleString("fr-FR", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 p-6 bg-white ">
          <h2 className="text-xl font-bold mb-4">Détail du Don</h2>
          {selectedNotification ? (
            <div>
              <img
                src={
                  selectedNotification.don?.url_image?.[0] || 
                  "https://via.placeholder.com/150"
                }
                alt="Don"
                className="w-48 h-48 object-cover rounded mb-4"
              />

              <h3 className="text-lg font-semibold mb-2">
                {selectedNotification.don?.titre || "Titre non disponible"}
              </h3>

              <p className="mb-2 text-gray-600">
                <strong>Description :</strong>{" "}
                {selectedNotification.don?.description || "Aucune description"}
              </p>

              <p className="mb-2 text-gray-600">
                <strong>Ville :</strong>{" "}
                {selectedNotification.don?.ville_don || "Ville inconnue"}
              </p>

              <button
  onClick={async () => {
    const notif = selectedNotification;
    const donId = notif.don?._id;
    const donorId = JSON.parse(localStorage.getItem("user"))?._id;
    const receiverId = notif.emetteur?._id;

    try {
      const response = await fetch("https://diapo-app.onrender.com/api/conversations/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ donorId, receiverId, donId }),
      });

      if (!response.ok) throw new Error("Erreur lors de la création de la conversation");

      const conversation = await response.json();

      navigate(`/messagerie/${conversation._id}`);
    } catch (error) {
      console.error("Erreur lors de la redirection vers la messagerie :", error);
    }
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Contacter
</button>

            </div>
          ) : (
            <p>Sélectionnez une notification pour voir le détail du don.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationPage;
