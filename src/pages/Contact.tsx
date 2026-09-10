import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Clock, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsSent(true);
    showToast('Your message has been sent to our concierge desk.', 'success');
  };

  return (
    <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
          Concierge Support
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-light text-charcoal-900">
          WE ARE HERE TO HELP
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-sans font-light">
          Have a question regarding product dimensions, dispatch timelines, or custom inquiries? Reach out directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Contact Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-ivory-100 border border-stone/30 space-y-4">
            <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
              Direct Channels
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-sage-700 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-sans">
                    Email Desk
                  </span>
                  <a href="mailto:concierge@nexoralife.com" className="font-medium text-charcoal-900 hover:text-sage-800">
                    concierge@nexoralife.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-sage-700 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-sans">
                    Concierge Hotline
                  </span>
                  <span className="font-medium text-charcoal-900">+91 98765 43210</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-sage-700 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-sans">
                    Support Hours
                  </span>
                  <span className="text-charcoal-700">Monday – Saturday: 10:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 bg-ivory-100 p-6 sm:p-8 rounded-2xl border border-stone/30 shadow-sm">
          {isSent ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-sage-100 text-sage-800 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-charcoal-950 font-light">Inquiry Received</h3>
              <p className="text-xs text-charcoal-600 font-sans max-w-sm mx-auto">
                Thank you, {name}. A member of our concierge desk will respond to {email} within 24 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-2xl font-light text-charcoal-950 pb-2 border-b border-stone/20">
                Send an Inquiry
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Varun K."
                    className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. varun@example.com"
                    className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Product Inquiry / Order NX-..."
                  className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you?"
                  className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-8 py-3.5 rounded transition-colors"
              >
                <span>Transmit Message</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
