export default function MessageBubble({ sender, message, time }) {
  const isSender = sender === 'me';

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`px-4 py-2 rounded-lg max-w-xs ${isSender ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-black'}`}>
        <p className="text-sm">{message}</p>
        <p className="text-xs mt-1 text-right opacity-70">{new Date(time).toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
