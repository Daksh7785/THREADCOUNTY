import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !subject || !message) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact request.');
      }

      setSuccess('Your message has been submitted. Our support team will respond shortly!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to contact server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">Contact Our Team</h2>
        <p className="text-slate-500 text-sm">
          Have questions about the platform, enterprise plans, or custom integration? Send us a message.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel border rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-bold font-heading">Reach Out Directly</h3>
            <p className="text-xs text-slate-500">
              Our engineering and sales teams operate Monday through Friday, 9am to 6pm EST.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
              {/* Email */}
              <div className="flex gap-3 text-xs items-center">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Support Email</span>
                  <span className="font-semibold">support@threadcounty.com</span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-3 text-xs items-center">
                <div className="p-2.5 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-lg">
                  <Phone className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Telephone</span>
                  <span className="font-semibold">+1 (555) 839-8268</span>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-3 text-xs items-center">
                <div className="p-2.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded-lg">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block">Office Address</span>
                  <span className="font-semibold">500 Innovation Way, Suite 40, Boston, MA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map Mock Widget */}
          <div className="glass-panel border rounded-2xl overflow-hidden aspect-[4/3] relative flex items-center justify-center bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            {/* Mocking google map view with CSS styles */}
            <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?center=Boston,MA&zoom=13&size=400x300&key=')` }}></div>
            <div className="absolute inset-0 moving-grid-bg opacity-30"></div>
            <div className="relative z-10 text-center space-y-2 p-6">
              <MapPin className="h-8 w-8 text-rose-500 mx-auto animate-bounce" />
              <h4 className="font-bold text-xs">Boston Head Office</h4>
              <p className="text-[10px] text-slate-400 max-w-xs">Map display active for premium verification logs.</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 glass-panel border rounded-2xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold font-heading mb-6">Send a Message</h3>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-bold text-slate-500 block">Name *</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daksh Kumar"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 block">Email *</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label htmlFor="subject" className="text-xs font-bold text-slate-500 block">Subject *</label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enterprise API integration inquiries"
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label htmlFor="message" className="text-xs font-bold text-slate-500 block">Message *</label>
              <textarea
                id="message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi ThreadCounty support team, we would like to know if..."
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm hover:scale-[1.01] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ContactPage;
