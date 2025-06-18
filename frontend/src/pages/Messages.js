import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ConversationList from '../components/messages/ConversationList';
import MessageBox from '../components/messages/MessageBox';
import Footer from "../components/Footer";
import AlerteReservation from "../components/AlerteReservation";
import Header from '../components/Header';

const Message = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const conversationId = location.state?.conversationId || params.id;
  const { state } = location;

  const token = localStorage.getItem("token");
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      return null;
    }
  }, []);

  const receiver = state?.user;
  const messageInitial = state?.messageInitial || "";

  const [showAlert, setShowAlert] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);

  // 🔔 Alerte réservation
  useEffect(() => {
    if (state?.showReservationAlert) {
      setShowAlert(true);
    }
  }, [state]);

  // 📥 Charger la conversation
  useEffect(() => {
    const fetchConversation = async () => {
      if (!token || !currentUser?._id) {
        console.error("Redirection vers login - Authentification manquante");
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(
          `https://diapo-app.onrender.com/api/conversations/id/${conversationId}/${currentUser._id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            console.error("Non autorisé - redirection");
            navigate('/login');
            return;
          }
          const text = await response.text();
          console.error("Erreur serveur :", response.status, text);
          return;
        }

        const data = await response.json();
        console.log("✅ Conversation chargée :", data);
        setConversation(data);
      } catch (error) {
        console.error("Erreur lors du chargement de la conversation :", error);
      }
    };

    if (conversationId && currentUser?._id) {
      fetchConversation();
    }
  }, [conversationId, currentUser?._id, navigate, token]);

  // 📥 Charger toutes les conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!token || !currentUser?._id) {
        console.error("Token ou currentUser manquant");
        return;
      }

      try {
        const response = await fetch(
          `https://diapo-app.onrender.com/api/conversations/${currentUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        console.log("📦 Conversations récupérées :", data);
        setConversations(data);
      } catch (error) {
        console.error("Erreur lors du chargement des conversations", error);
      }
    };

    if (currentUser?._id) {
      fetchConversations();
    }
  }, [currentUser, token]);

  // ➕ Ajouter la conversation si elle n'existe pas localement
  useEffect(() => {
    if (conversationId && receiver) {
      const exists = conversations.some(c => c._id === conversationId);

      if (!exists) {
        const fetchNewConversation = async () => {
          try {
            const res = await fetch(
              `https://diapo-app.onrender.com/api/conversations/${conversationId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

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
  }, [conversationId, receiver, conversations, token]);

  return (
    <div className="p-4">
      <Header />

      <div className="bg-blue-700 text-white px-10 py-10 flex items-center h-[250px] space-x-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 rounded-full bg-white text-blue-700 hover:bg-gray-100 shadow"
            title="Retour aux notifications"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-semibold">Messages</h1>
        </div>
      </div>

      {showAlert && <AlerteReservation onClose={() => setShowAlert(false)} />}

      <div className="flex h-screen">
        <ConversationList
          conversations={conversations}
          currentUser={currentUser}
        />

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

      <Footer />
    </div>
  );
};

export default Message;
