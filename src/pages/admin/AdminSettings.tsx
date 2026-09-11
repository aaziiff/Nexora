import React, { useState, useEffect } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { SiteSettings } from '../../types';
import { db } from '../../lib/database';
import { useToast } from '../../context/ToastContext';
import { DEFAULT_SITE_SETTINGS } from '../../data/products';

import { useAuth } from '../../context/AuthContext';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { setCustomAdminPassword } = useAuth();

  useEffect(() => {
    db.getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveSettings(settings);

    if (newPassword.trim()) {
      setCustomAdminPassword(newPassword.trim());
      showToast(`Store settings and new admin passcode updated successfully!`, 'success');
      setNewPassword('');
    } else {
      showToast('Store settings and announcement parameters saved', 'success');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-charcoal-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone/30">
        <div>
          <span className="text-[10px] uppercase tracking-luxury text-sage-800 font-semibold block">
            Store Parameters
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-charcoal-950">
            Brand & Checkout Settings
          </h1>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Announcement Bar Settings */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            Announcement Bar
          </h3>

          <div>
            <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
              Top Announcement Text
            </label>
            <input
              type="text"
              value={settings.announcement_text}
              onChange={(e) => setSettings({ ...settings, announcement_text: e.target.value })}
              className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
            />
          </div>

          <label className="flex items-center gap-3 p-3 rounded bg-ivory-50 border border-stone/40 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.announcement_enabled}
              onChange={(e) => setSettings({ ...settings, announcement_enabled: e.target.checked })}
              className="rounded text-charcoal-900"
            />
            <span className="text-xs font-medium text-charcoal-900">Enable Announcement Bar</span>
          </label>
        </div>

        {/* Shipping & Payment Settings */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            Payment & Shipping Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Complimentary Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Official Merchant UPI ID
              </label>
              <input
                type="text"
                value={settings.upi_id}
                onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Merchant / Account Name
              </label>
              <input
                type="text"
                value={settings.upi_name || ''}
                onChange={(e) => setSettings({ ...settings, upi_name: e.target.value })}
                placeholder="e.g. ASIF MUHAMMED"
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                UPI QR Code Scanner Image (URL or /path)
              </label>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    value={settings.upi_qr_image || ''}
                    onChange={(e) => setSettings({ ...settings, upi_qr_image: e.target.value })}
                    placeholder="/upi-qr-code.jpg"
                    className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono"
                  />
                  <p className="text-[10px] text-charcoal-500 mt-1">
                    Customers will see this QR code scanner at checkout to pay directly via PhonePe, GPay, Paytm, etc.
                  </p>
                </div>
                {(settings.upi_qr_image || '/upi-qr-code.jpg') && (
                  <div className="p-1.5 bg-ivory-50 border border-stone/40 rounded-lg shadow-sm shrink-0">
                    <img
                      src={settings.upi_qr_image || '/upi-qr-code.jpg'}
                      alt="UPI QR Scanner Preview"
                      className="w-16 h-16 object-contain rounded"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Concierge Support Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
                Support Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={settings.support_phone}
                onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Security & Access Settings */}
        <div className="bg-ivory-100 p-6 sm:p-8 rounded-xl border border-stone/30 shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-normal text-charcoal-950 pb-2 border-b border-stone/20">
            Operator Security & Passcode
          </h3>

          <div>
            <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
              New Admin Login Passcode
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new operator passcode"
              className="w-full px-4 py-2.5 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 font-mono"
            />
            <p className="text-[10px] text-charcoal-400 mt-1">
              You can also set <code>VITE_ADMIN_PASSCODE</code> in your <code>.env</code> file.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury px-8 py-3.5 rounded transition-colors shadow"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
