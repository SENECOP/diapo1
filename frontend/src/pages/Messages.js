import ConversationList from '../components/messages/ConversationList';
import MessageBox from '../components/messages/MessageBox';
import { useEffect, useState } from "react";
import AlerteReservation from "../components/AlerteReservation";
import Header from '../components/Header';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const Message = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?._id;

  const [showAlert, setShowAlert] = useState(false);
  const [conversations, setConversations] = useState([]);
   const addConversation = (conversation) => {
    // Évite les doublons si conversation déjà dans la liste
    setConversations((prev) => {
      if (prev.find((c) => c.don_id === conversation.don_id)) return prev;
      return [...prev, conversation];
    });
  };

  const navigate = useNavigate();
  const location = useLocation();
  const { user, messageInitial, conversationId } = location.state || {};

  // Gérer l'alerte de réservation
  useEffect(() => {
  if (location.state?.showReservationAlert) {
    setShowAlert(true);
  }
}, [location.state]);


  // Charger les conversations depuis une API (exemple)
  useEffect(() => {
    if (!userId) return;

    const fetchConversations = async () => {
      try {
        const response = await fetch(`https://diapo-app.onrender.com/api/conversations/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) throw new Error("Erreur lors du chargement des conversations");
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchConversations();
  }, [userId]);

  // Ajouter automatiquement le preneur à la liste des conversations si pas déjà présent (cas particulier)
  useEffect(() => {
    if (user?.pseudo) {
      setConversations(prev => {
        const exists = prev.find(conv => conv.pseudo === user.pseudo);
        if (exists) return prev;

        return [
          ...prev,
          {
            _id: Date.now(), // ID temporaire
            pseudo: user.pseudo,
            avatar: user.avatar || "https://via.placeholder.com/50",
            dernierMessage: "Merci pour les infos, je suis intéressé.",
            messageInitial: messageInitial,
          }
        ];
      });
    }
  }, [user, messageInitial]);

  useEffect(() => {
    async function fetchConversations() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/conversations/${userId}`);
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        console.error('Erreur chargement conversations', err);
      }
    }
    fetchConversations();
  }, [userId]);

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
        <MessageBox user={user} messageInitial={messageInitial}  conversationId={conversationId} onAddConversation={addConversation}/>
      </div>
    </div>
  );
};

export default Message;
