import { useNavigate } from "react-router-dom";

export default function ConversationList({ conversations = [], currentUser }) {
  const navigate = useNavigate();

  return (
    <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>

      {conversations.length === 0 ? (
        <p className="text-gray-500">Aucune conversation</p>
      ) : (
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv._id}
              className="p-4 mb-2 border rounded hover:bg-gray-100 cursor-pointer flex items-center space-x-4"
              onClick={() =>
                navigate(`/message/${conv._id}`, {
                  state: {
                    user: {
                      pseudo: conv.interlocuteur || "Preneur inconnu",
                      avatar: conv.avatar || "https://via.placeholder.com/50",
                      _id: null, // facultatif : à ajouter côté backend si besoin
                    },
                    messageInitial: "",
                  },
                })
              }
            >
              <img
                src={conv.avatar || "https://via.placeholder.com/50"}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold">{conv.interlocuteur}</div>
                <div className="text-sm text-gray-500 truncate">
                  {conv.description || "Aucun message"}
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
          ))}
        </ul>
      )}
    </div>
  );
}
