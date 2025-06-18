import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ConversationList from '../components/messages/ConversationList';
import MessageBox from '../components/messages/MessageBox';
import Footer from "../components/Footer";
import AlerteReservation from "../components/AlerteReservation";
import Header from '../components/Header';

const Message = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [showAlert, setShowAlert] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversation, setConversation] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const { state } = location;

  const receiver = location.state?.user;
  const messageInitial = location.state?.messageInitial || "";


  console.log("🟢 conversationId :", conversationId);
  console.log("🟡 données passées :", state);
  // Afficher une alerte si besoin
  useEffect(() => {
    if (location.state?.showReservationAlert) {
      setShowAlert(true);
    }
  }, [location.state]);

  // Charger la conversation sélectionnée
  useEffect(() => {
  const fetchConversation = async () => {
      
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?._id) {
      console.error("Redirection vers login - Authentification manquante");
      navigate('/login'); // Rediriger vers la page de connexion
      return;
    }
      const response = await fetch(`https://diapo-app.onrender.com/api/conversations/id/${conversationId}/${currentUser._id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

     if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

      const data = await response.json();
      console.log("Conversations récupérées:", data);
      setConversation(data);
      console.log("✅ Conversation chargée :", data);
    } catch (error) {
    }
  };

  fetchConversation();
}, [conversationId, currentUser?._id, navigate]);


  // Charger toutes les conversations de l'utilisateur
  useEffect(() => {
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !currentUser?._id) {
        console.error("Token ou currentUser manquant");
        return;
      }

      const response = await fetch(`https://diapo-app.onrender.com/api/conversations/${currentUser._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("📦 Conversations récupérées :", data); // 👈 ajoute ceci
      setConversations(data);
    } catch (error) {
      console.error("Erreur lors du chargement des conversations", error);
    }
  };

  if (currentUser?._id) {
    fetchConversations();
  }
}, [currentUser]);



  // Ajouter une nouvelle conversation localement si elle n'existe pas déjà
  useEffect(() => {
    if (conversationId && receiver) {
      const exists = conversations.some(c => c._id === conversationId);

      if (!exists) {
        const fetchNewConversation = async () => {
          try {
            const res = await fetch(`https://diapo-app.onrender.com/api/conversations/id/${conversationId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
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
  }, [conversationId, receiver, conversations, token]);
console.log("📦 Données de la conversation :", conversation);
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
        {/* Liste des conversations */}
        <ConversationList conversations={conversations} currentUser={currentUser} />

        {/* Zone de messages */}
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
