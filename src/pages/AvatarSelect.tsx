import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { ArrowLeft, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

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
    <div className="min-h-screen w-full max-w-[430px] mx-auto pb-20" style={{ background: '#f2f2f7' }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'linear-gradient(160deg, #e81c2e 0%, #a00a1a 100%)' }}>
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={20} style={{ color: '#fff' }} />
        </button>
        <h1 className="text-[15px] font-bold" style={{ color: '#fff' }}>Change Avatar</h1>
      </div>

      {/* Current Avatar */}
      <div className="flex flex-col items-center py-5">
        <img src={currentAvatar} alt="Current avatar" className="w-20 h-20 rounded-full object-cover" style={{ border: '3px solid #dc2626' }} />
        <span className="text-[11px] mt-2" style={{ color: '#999' }}>Current avatar</span>
      </div>

      {/* Avatar Grid */}
      <div className="mx-3">
        <div className="rounded-2xl p-3" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <span className="text-[12px] font-bold block mb-3" style={{ color: '#333' }}>Choose Avatar</span>
          <div className="grid grid-cols-4 gap-2.5">
            {AVATAR_LIST.map((av, i) => (
              <button
                key={i}
                onClick={() => handleSelect(av)}
                disabled={saving}
                className="relative rounded-xl overflow-hidden transition-all active:scale-95"
                style={{ border: currentAvatar === av ? '2.5px solid #dc2626' : '2.5px solid transparent' }}
              >
                <img src={av} alt={`Avatar ${i + 1}`} className="w-full aspect-square object-cover" loading="lazy" />
                {currentAvatar === av && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#dc2626' }}>
                    <Check size={10} style={{ color: '#fff' }} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
