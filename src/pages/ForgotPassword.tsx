import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Phone, Lock, Eye, EyeOff, ShieldCheck, Mail, CheckCircle2, Send, Crown, ChevronLeft, ChevronDown, MessageCircle, Headphones } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const inputClass = "w-full px-3.5 py-3 rounded-lg border border-white/10 bg-white/5 text-[13px] text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all";

function FormLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <label className="flex items-center gap-1.5 text-[13px] font-bold text-white/80 mb-1.5">
      <Icon size={14} className="text-yellow-500" /> {text}
    </label>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReset = searchParams.get('type') === 'recovery';

  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [agree, setAgree] = useState(false);

  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resetMethod, setResetMethod] = useState<'phone' | 'email'>('phone');

  const handleSendOtp = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) { toast.error('Enter valid 10-digit phone number'); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: '+91' + cleanPhone });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setOtpSent(true);
    toast.success('Verification code sent!');
  };

  const handlePhoneReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast.error('Please agree to the Privacy Agreement'); return; }
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (verificationCode.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    const fullPhone = '+91' + phone.replace(/\D/g, '');
    const { error: otpError } = await supabase.auth.verifyOtp({ phone: fullPhone, token: verificationCode, type: 'sms' });
    if (otpError) { setLoading(false); toast.error(otpError.message); return; }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) { toast.error(updateError.message); return; }
    toast.success('Password reset successfully!');
    setTimeout(() => navigate('/sign-up-login-screen'), 1500);
  };

  const handleEmailReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?type=recovery`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setEmailSent(true);
    toast.success('Reset link sent to your email!');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Password updated successfully!');
    setTimeout(() => navigate('/sign-up-login-screen'), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[420px] mx-auto overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)' }}>
      <Toaster position="top-center" richColors />

      {/* ─── Header ─── */}
      <div className="pt-4 pb-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 active:scale-90 transition">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <Crown size={20} className="text-yellow-500" />
            <span className="text-yellow-500 font-black text-[16px] tracking-wider" style={{ fontStyle: 'italic' }}>𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴</span>
          </div>
          <div className="w-8" />
        </div>
        <h1 className="text-white font-bold text-[18px]">Forgot password</h1>
        <p className="text-white/40 text-[11px] mt-1 leading-[1.5]">
          Please retrieve/change your password through your mobile phone number or email
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">

        {isReset ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                <ShieldCheck size={30} className="text-white" />
              </div>
            </div>
            <p className="text-center text-white/40 text-[12px] mb-1">Create a new password for your account</p>

            <div>
              <FormLabel icon={Lock} text="A new password" />
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="A new password" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} className={inputClass + " pr-10"} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <div>
              <FormLabel icon={Lock} text="Confirm new password" />
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} className={inputClass + " pr-10"} />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-full font-bold text-white text-[14px] shadow-lg transition-all active:scale-[0.97] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Reset'}
            </button>
          </form>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex mb-5 border-b border-white/10">
              {(['phone', 'email'] as const).map(m => (
                <button key={m} onClick={() => setResetMethod(m)}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-all border-b-2 ${resetMethod === m ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-white/30'}`}>
                  {m === 'phone' ? <Phone size={15} /> : <Mail size={15} />}
                  {m === 'phone' ? 'Phone reset' : 'Email reset'}
                </button>
              ))}
            </div>

            {resetMethod === 'phone' ? (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
                <form onSubmit={handlePhoneReset} className="space-y-4">
                  <div>
                    <FormLabel icon={Phone} text="Phone number" />
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-3 rounded-lg border border-white/10 bg-white/5 text-white/60 text-[13px] gap-1 min-w-[65px] font-medium">
                        +91 <ChevronDown size={12} className="text-white/30" />
                      </div>
                      <input type="tel" placeholder="Please enter the phone number" value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={inputClass + " flex-1"} />
                    </div>
                  </div>

                  <div>
                    <FormLabel icon={Lock} text="A new password" />
                    <div className="relative">
                      <input type={showPass ? 'text' : 'password'} placeholder="A new password" value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} className={inputClass + " pr-10"} />
                      <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                        {showPass ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <FormLabel icon={Lock} text="Confirm new password" />
                    <div className="relative">
                      <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)} className={inputClass + " pr-10"} />
                      <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                        {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <FormLabel icon={ShieldCheck} text="Verification Code" />
                    <div className="flex gap-2">
                      <input type="text" maxLength={6} placeholder="Enter confirmation code" value={verificationCode}
                        onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={inputClass + " flex-1"} />
                      <button type="button" onClick={handleSendOtp} disabled={loading || otpSent}
                        className="px-4 py-3 rounded-lg font-bold text-white text-[11px] whitespace-nowrap disabled:opacity-50 transition-all active:scale-95 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                        {otpSent ? (
                          <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Sent</span>
                        ) : (
                          <span className="flex items-center gap-1"><Send size={13} /> Send</span>
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                      className="w-4 h-4 accent-red-600 rounded" />
                    <span className="text-white/50 text-[11px]">
                      I have read and agree <span className="text-yellow-500 font-bold">【Privacy Agreement】</span>
                    </span>
                  </label>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-full font-bold text-white text-[14px] shadow-lg transition-all active:scale-[0.97] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Reset'}
                  </button>

                  <button type="button" onClick={() => navigate('/sign-up-login-screen')}
                    className="w-full py-2.5 rounded-full font-semibold text-[13px] border border-yellow-600/40 text-yellow-500 bg-transparent transition-all active:scale-[0.97]">
                    Back to Login
                  </button>
                </form>
              </motion.div>
            ) : emailSent ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 pt-8">
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                  <Mail size={30} className="text-white" />
                </div>
                <h2 className="text-[16px] font-bold text-white">Email Sent!</h2>
                <p className="text-white/50 text-[12px] px-4 leading-relaxed">
                  We've sent a password reset link to <span className="font-bold text-yellow-500">{email}</span>
                </p>
                <button onClick={() => setEmailSent(false)} className="text-yellow-500 font-bold text-[12px] underline">Resend email</button>
                <button onClick={() => navigate('/sign-up-login-screen')}
                  className="w-full py-3 rounded-full font-bold text-white text-[14px] shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                  Back to Login
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
                <form onSubmit={handleEmailReset} className="space-y-4">
                  <div>
                    <FormLabel icon={Mail} text="Email Address" />
                    <input type="email" placeholder="Enter your registered email" value={email}
                      onChange={e => setEmail(e.target.value)} className={inputClass} />
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full py-3 rounded-full font-bold text-white text-[14px] shadow-lg transition-all active:scale-[0.97] disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Send Reset Link'}
                  </button>

                  <button type="button" onClick={() => navigate('/sign-up-login-screen')}
                    className="w-full py-2.5 rounded-full font-semibold text-[13px] border border-yellow-600/40 text-yellow-500 bg-transparent transition-all active:scale-[0.97]">
                    Back to Login
                  </button>
                </form>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Floating support */}
      <a href="https://t.me/techie_404" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-5 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg z-40"
        style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
        <MessageCircle size={18} className="text-white" />
      </a>
    </div>
  );
}
