import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Mail } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { db as supabase } from '@/lib/db';

const themeRed = '#b42525';
const themeBg = '#FAF5E9';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/sign-up-login-screen'); return; }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase.from('notifications').select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${d.toLocaleTimeString('en-IN', { hour12: false })}`;
  };

  return (
    <div style={{ minHeight: '100vh', width: '100%', maxWidth: 480, margin: '0 auto', background: themeBg, fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif" }}>
      <Toaster position="top-center" richColors />

      {/* Header */}
      <div style={{
        background: '#fff', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #eee',
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
          <ArrowLeft size={22} color="#333" />
        </button>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#333' }}>Notification</span>
        <div style={{ width: 28 }} />
      </div>

      {/* Notifications List */}
      <div style={{ padding: '10px 12px', paddingBottom: 30 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: 8, padding: 16, height: 80 }}>
                <div style={{ height: 14, background: '#eee', borderRadius: 4, width: '60%', marginBottom: 10 }} />
                <div style={{ height: 10, background: '#f5f5f5', borderRadius: 4, width: '40%', marginBottom: 8 }} />
                <div style={{ height: 10, background: '#f5f5f5', borderRadius: 4, width: '80%' }} />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔔</div>
            <p style={{ fontSize: 13, color: '#bbb' }}>No notifications</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                background: '#fff', borderRadius: 8, padding: '14px 14px',
                border: '1px solid #eee', position: 'relative',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: '#fef2f2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Mail size={14} color={themeRed} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#333', textTransform: 'uppercase' }}>
                      {n.title}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(n.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                    <Trash2 size={16} color="#e8a020" />
                  </button>
                </div>
                <div style={{ marginTop: 4, marginLeft: 36 }}>
                  <div style={{ fontSize: 11, color: themeRed, marginBottom: 4 }}>
                    {formatDate(n.created_at)}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>
                    {n.message}
                  </div>
                </div>
              </div>
            ))}

            <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', padding: '12px 0' }}>No more</p>
          </div>
        )}
      </div>
    </div>
  );
}
