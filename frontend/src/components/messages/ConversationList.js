import { useNavigate } from "react-router-dom";

export default function ConversationList({ conversations = [], currentUser }) {
  const navigate = useNavigate();

  return (
    <div className="w-1/3 bg-white border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>

      <ul>
        {conversations.length === 0 ? (
          <p className="text-gray-500">Aucune conversation</p>
        ) : (
          conversations.map((conv) => {
            // 🔐 Vérification sécurisée
            const otherUser =
              Array.isArray(conv.participants) &&
              conv.participants.find((user) => user._id !== currentUser._id);

            return (
              <li
                key={conv._id}
                className="p-2 border-b hover:bg-gray-100 cursor-pointer"
           onClick={() => {
            const otherUser = conv.participants?.find(u => u._id !== currentUser._id);

            navigate("/message", {
              state: {
                conversationId: conv._id,
                user: {
                  _id: otherUser?._id,
                  pseudo: otherUser?.pseudo || "Preneur inconnu",
                  avatar: otherUser?.avatar || "https://via.placeholder.com/50",
                },
                currentUser,
                don_id: conv.don_id || null,
              },
            });
          }}


              >
                <div className="font-semibold">
                  {otherUser?.pseudo || "Preneur inconnu"}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {conv.dernierMessage?.contenu || "Aucun message"}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
