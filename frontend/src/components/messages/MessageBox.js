import { useEffect, useState } from 'react';
import MessageInput from './MessageInput';
import { socket } from '../../socket'; 
import MessageBubble from './MessageBubble'; 

export default function MessageBox({ conversation }) {
  console.log(conversation)
  const {
    messageInitial,
    don,
    pseudo: destinatairePseudo,
    avatar: destinataireAvatar,
  } = conversation || {};

  const user = JSON.parse(localStorage.getItem("user"));
  const [messages, setMessages] = useState([]);

  const conversationId = conversation?._id;

  useEffect(() => {
    if (!user || !conversationId) return;

    // Rejoindre la room
    socket.emit('joinRoom', conversationId);

    // Recevoir les messages en temps réel
    const handleReceiveMessage = (msg) => {
      if (
        msg.conversationId === conversationId &&
        (msg.envoye_par === user._id || msg.recu_par === user._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    // Charger l'historique des messages
    fetch(`https://diapo-app.onrender.com/api/message/${conversationId}`)
      .then((res) => res.json())
      .then(setMessages)
      .catch((err) => console.error("Erreur lors du chargement des messages :", err));

    return () => {
      socket.emit('leaveRoom', conversationId);
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [user, conversationId]);

  const handleSendMessage = async (content) => {
    if (!content || !user || !destinatairePseudo || !conversationId) return;

    const newMessage = {
      contenu: content,
      conversationId,
      envoye_par: user._id,
      recu_par: messageInitial?.recu_par, // à adapter si besoin
    };

    try {
      // Enregistrement dans la base
      const res = await fetch('https://diapo-app.onrender.com/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement du message");

      const savedMessage = await res.json();

      // Envoi via socket
      socket.emit('sendMessage', savedMessage);

      // Ajout local
      setMessages((prev) => [...prev, savedMessage]);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  if (!conversation || !conversationId || !user) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 italic">
        Chargement de la conversation...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-2/3 bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 border-b p-4">
        <img
          src={destinataireAvatar || 'https://via.placeholder.com/50'}
          alt="avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold text-lg">
            {destinatairePseudo || "Utilisateur"}
          </h3>
        </div>
      </div>

      {/* Zone messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-2">
        {/* Affichage du don */}
        {don && (
          <div className="mb-4 p-4 border rounded bg-purple-50">
            <h3 className="text-lg font-bold text-purple-800 mb-2">
              {don.titre}
            </h3>
            {don.image_url && (
              <img
                src={don.image_url}
                alt="don"
                className="w-32 h-32 object-cover rounded mb-2"
              />
            )}
            <p className="text-gray-700 text-sm">{don.description}</p>
          </div>
        )}

        {/* Affichage du message initial s'il existe */}
        {messageInitial && messages.length === 0 && (
          <div className="mb-2 flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
              {messageInitial.image && (
                <img
                  src={messageInitial.image}
                  alt="don"
                  className="w-32 h-32 object-cover rounded mb-2"
                />
              )}
              <p className="text-sm mb-2">{messageInitial.description}</p>
              <div className="bg-white text-black rounded px-3 py-2 text-sm shadow">
                Merci pour les infos, je suis intéressé.
              </div>
            </div>
          </div>
        )}

        {/* Affichage des messages */}
        {messages.map((msg, index) => {
          const isSender = msg.envoye_par === user._id;
          return (
            <MessageBubble
              key={index}
              sender={isSender ? 'me' : 'other'}
              message={msg.contenu}
              time={msg.envoye_le}
            />
          );
        })}
      </div>

      {/* Zone d'envoi */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2 mb-2">
          {["Demain", "Ce soir", "Peut-être la semaine prochaine"].map((text) => (
            <button
              key={text}
              className="px-3 py-1 bg-purple-100 text-sm rounded-full hover:bg-purple-200"
              onClick={() => handleSendMessage(text)}
            >
              {text}
            </button>
          ))}
        </div>
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
