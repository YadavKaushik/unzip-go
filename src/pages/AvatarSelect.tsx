import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';
import { motion } from 'framer-motion';

const AVATAR_LIST = Array.from({ length: 16 }, (_, i) => `/avatars/avatar-${i + 1}.jpg`);

export default function AvatarSelect() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const currentAvatar = profile?.avatar_url || '/avatars/avatar-1.jpg';

  if (!user || !profile) { navigate('/sign-up-login-screen'); return null; }

  const handleSelect = async (url: string) => {
    if (url === currentAvatar || saving) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error('Failed to update avatar'); return; }
    toast.success('Avatar updated!');
    await refreshProfile();
  };

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-20" style={{ background: '#FAF5E9' }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)' }}>
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={20} color="#fff" />
        </button>
        <h1 className="text-[16px] font-bold flex-1 text-center" style={{ color: '#fff' }}>Change Avatar</h1>
        <div style={{ width: 28 }} />
      </div>

      {/* Current Avatar Preview */}
      <div className="flex flex-col items-center py-6">
        <div className="relative">
          <motion.div
            key={currentAvatar}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <img
              src={currentAvatar}
              alt="Current avatar"
              className="w-24 h-24 rounded-full object-cover"
              style={{ border: '4px solid #C8102E', boxShadow: '0 4px 20px rgba(200,16,46,0.3)' }}
            />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)', boxShadow: '0 2px 8px rgba(200,16,46,0.4)' }}>
            <Check size={14} color="#fff" />
          </div>
        </div>
        <span className="text-[12px] mt-3 font-medium" style={{ color: '#888' }}>Current Avatar</span>
      </div>

      {/* Avatar Grid */}
      <div className="mx-3">
        <div className="rounded-2xl p-4" style={{ background: '#fff', boxShadow: '0 4px 20px rgba(200,16,46,0.08)', border: '1px solid rgba(200,16,46,0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} color="#C8102E" />
            <span className="text-[13px] font-bold" style={{ color: '#C8102E' }}>Choose Avatar</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_LIST.map((av, i) => {
              const isSelected = currentAvatar === av;
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSelect(av)}
                  disabled={saving}
                  className="relative rounded-2xl overflow-hidden transition-all"
                  style={{
                    border: isSelected ? '3px solid #C8102E' : '3px solid transparent',
                    boxShadow: isSelected ? '0 4px 15px rgba(200,16,46,0.25)' : '0 2px 8px rgba(0,0,0,0.06)',
                    background: '#fff',
                  }}
                >
                  <img
                    src={av}
                    alt={`Avatar ${i + 1}`}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                    width={512}
                    height={512}
                  />
                  {isSelected && (
                    <div
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#C8102E', boxShadow: '0 2px 6px rgba(200,16,46,0.4)' }}
                    >
                      <Check size={12} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl px-8 py-4 shadow-xl">
            <p className="text-sm font-semibold" style={{ color: '#C8102E' }}>Saving...</p>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
