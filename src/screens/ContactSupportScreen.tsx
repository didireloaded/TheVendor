import { useState } from 'react';
import { ArrowUpRight, Mail, MessageSquare, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContactSupportScreen() {
  const { setCurrentScreen, showToast, createSupportConversation, setActiveConversationId } = useApp();
  const [topic, setTopic] = useState('General');
  const [message, setMessage] = useState('');

  const openSupportChat = () => {
    const supportConversation = createSupportConversation();
    setActiveConversationId(supportConversation.id);
    setCurrentScreen('chat');
  };

  const submitForm = () => {
    if (!message.trim()) {
      showToast('Please enter a message');
      return;
    }
    showToast('Support request submitted', 'success');
    setMessage('');
  };

  return (
    <div className="px-5 pt-6 pb-10">
      <TopBar title="Contact Support" onBack={() => setCurrentScreen('profile')} />

      <div className="card mb-5">
        <p className="t-body font-semibold">Need help?</p>
        <p className="t-meta mt-1">Choose the fastest way to contact The Vendor support team.</p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button className="card-tile text-left active:scale-[0.98] transition" onClick={openSupportChat}>
            <div className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center mb-3"><MessageSquare size={16} /></div>
            <p className="t-body font-semibold">Open Support Chat</p>
            <p className="t-meta mt-1">Get help inside the app</p>
          </button>
          <a className="card-tile text-left active:scale-[0.98] transition" href="mailto:support@thevendor.na?subject=Support%20Request">
            <div className="w-10 h-10 rounded-full bg-cream-100 flex items-center justify-center mb-3"><Mail size={16} /></div>
            <p className="t-body font-semibold">Email Support</p>
            <p className="t-meta mt-1">support@thevendor.na</p>
          </a>
        </div>
      </div>

      <div className="card">
        <p className="t-body font-semibold mb-3">Send a request</p>
        <label className="t-label mb-1.5 block">Topic</label>
        <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-cream-100 rounded-xl px-3.5 py-3 text-sm outline-none mb-3">
          <option>General</option>
          <option>Account</option>
          <option>Payments</option>
          <option>Vendor issue</option>
          <option>Bug report</option>
        </select>

        <label className="t-label mb-1.5 block">Message</label>
        <textarea
          rows={5}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell us what you need help with..."
          className="w-full bg-cream-100 rounded-2xl px-3.5 py-3 text-sm outline-none resize-none"
        />

        <button
          onClick={submitForm}
          className="mt-4 w-full py-3.5 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition"
        >
          <Send size={15} /> Send request
        </button>
      </div>
    </div>
  );
}

function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center justify-between mb-6">
      <button onClick={onBack} className="btn-circle" aria-label="Back">
        <ArrowUpRight size={18} className="rotate-180" />
      </button>
      <h1 className="t-h1">{title}</h1>
      <div className="w-11 h-11" />
    </header>
  );
}
