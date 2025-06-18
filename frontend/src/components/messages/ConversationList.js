import { useNavigate } from "react-router-dom";

export default function ConversationList({ conversations = [], currentUser }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getInterlocutorInfo = (conv) => {
if (!conv || !conv.envoye_par || !conv.recu_par) {
    console.error("Données de conversation incomplètes:", conv);
    return { pseudo: "Utilisateur inconnu", avatar: "", _id: null };
  }

  if (!token || !currentUser?._id) {
    console.warn("currentUser non défini");
    return { pseudo: "Utilisateur inconnu", avatar: "", _id: null };
  }

  console.log("Conversation:", conv);

  const isCurrentUserSender = conv.envoye_par?._id === currentUser._id;
  const interlocutor = isCurrentUserSender ? conv.recu_par : conv.envoye_par;

  return {
    pseudo: interlocutor?.pseudo || "Utilisateur inconnu",
    avatar: interlocutor?.avatar || "https://via.placeholder.com/50",
    _id: interlocutor?._id || null,
  };
};


  return (
    <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>

      {conversations.length === 0 ? (
        <p className="text-gray-500">Aucune conversation</p>
      ) : (
        <ul>
          {conversations.map((conv) => {
            const interlocutor = getInterlocutorInfo(conv);

            return (
              <li
                key={conv._id}
                className="p-4 mb-2 border rounded hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
                onClick={() =>
                  navigate(`/message/${conv._id}`, {
                    state: {
                      user: interlocutor,
                      messageInitial: "",
                    },
                  })
                }
              >
                <img
                  src={interlocutor.avatar}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div className="flex-1">
                  <div className="font-semibold">{interlocutor.pseudo}</div>
                  <div className="text-sm text-gray-500 truncate">
                    {conv.dernierMessage?.contenu || "Aucun message"}
                  </div>
                </div>

                {conv.image && (
                  <img
                    src={conv.image}
                    alt="don"
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
