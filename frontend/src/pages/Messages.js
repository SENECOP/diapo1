import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

import ConversationList from '../components/messages/ConversationList';
import MessageBox from '../components/messages/MessageBox';
import AlerteReservation from "../components/AlerteReservation";
import Header from '../components/Header';

const Message = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?._id;

  const [showAlert, setShowAlert] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { id: conversationId } = useParams(); // Récupère l'ID de la conversation depuis l'URL
const { user} = location.state || {};

  const receiver = location.state?.user;
  const messageInitial = location.state?.messageInitial || "";

  // Gérer l’alerte de réservation
  useEffect(() => {
    if (location.state?.showReservationAlert) {
      setShowAlert(true);
    }
  }, [location.state]);

  // Charger toutes les conversations de l'utilisateur
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`https://diapo-app.onrender.com/api/conversations/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

        if (!response.ok) throw new Error("Erreur lors du chargement des conversations");

        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error("❌ Erreur récupération conversations :", error);
      }
    };

    fetchConversations();
  }, [userId]);

  // Charger la conversation demandée par l'URL
  useEffect(() => {
    if (!conversationId) return;

    const fetchConversation = async () => {
      try {
        const response = await fetch(`https://diapo-app.onrender.com/api/conversations/id/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });

        if (!response.ok) throw new Error("Erreur lors du chargement de la conversation");

        const data = await response.json();
        setConversation(data);
      } catch (error) {
        console.error("❌ Erreur récupération conversation :", error);
      }
    };

    fetchConversation();
  }, [conversationId]);

useEffect(() => {
  if (conversationId && user) {
    const exists = conversations.some(c => c._id === conversationId);

    if (!exists) {
      // Requête pour récupérer la vraie conversation depuis l'API
      const fetchNewConversation = async () => {
        try {
          const res = await fetch(`https://diapo-app.onrender.com/api/conversations/id/${conversationId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          });

          if (!res.ok) throw new Error("Échec récupération conversation");

          const data = await res.json();
          setConversations(prev => [data, ...prev]);
        } catch (err) {
          console.error("❌ Erreur fetchNewConversation :", err);
        }
      };

      fetchNewConversation();
    }
  }
}, [conversationId, user, conversations]);


  return (
    <div className="p-4">
      <Header />

      <div className="bg-blue-700 text-white px-10 py-10 flex items-center h-[250px] space-x-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full bg-white text-blue-700 hover:bg-gray-100 shadow"
            title="Retour au tableau de bord"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-semibold">Messages</h1>
        </div>
      </div>

      {showAlert && <AlerteReservation onClose={() => setShowAlert(false)} />}

      <div className="flex h-screen">
        {/* Liste des conversations à gauche */}
        <ConversationList conversations={conversations} currentUser={currentUser} />

        {/* Zone des messages à droite */}
        {conversation ? (
          <MessageBox
            user={receiver}
            messageInitial={messageInitial}
            conversationId={conversationId}
            conversation={conversation}
            currentUser={currentUser}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Chargement de la conversation...
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
