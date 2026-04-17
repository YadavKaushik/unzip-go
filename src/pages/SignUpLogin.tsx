import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { Eye, EyeOff, Crown, Lock, Mail, Phone, Gift, X, Sparkles, Wallet, ChevronLeft, ChevronDown, MessageCircle, Headphones, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type LoginForm = { email: string; password: string };
type PhoneLoginForm = { phone: string; password: string };
type RegisterForm = { email: string; password: string; confirmPassword: string; referral: string; agree: boolean };
type PhoneRegisterForm = { phone: string; password: string; confirmPassword: string; referral: string; agree: boolean };

/* ── Popups ── */
function WelcomeBackPopup({ onClose }: { onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.7, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="relative w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(160deg, #1a0505 0%, #8B0000 50%, #2d0a0a 100%)' }} className="p-6 text-center">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"><X size={16} /></button>
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-600/40 flex items-center justify-center">
              <Crown size={40} className="text-yellow-500" />
            </div>
          </div>
          <h2 className="text-white font-bold text-2xl mb-1">Welcome Back!</h2>
          <p className="text-yellow-500 font-bold text-lg mb-1">to 𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴ 👑</p>
          <p className="text-white/60 text-sm mb-5">Great to see you again!</p>
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-[15px]"
            style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)', color: '#fff' }}>
            🎮 Start Playing Now!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function WelcomeBonusPopup({ username, onClose }: { username: string; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.7, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="relative w-full max-w-[340px] rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div style={{ background: 'linear-gradient(160deg, #1a0505 0%, #8B0000 50%, #2d0a0a 100%)' }} className="p-6 text-center">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70"><X size={16} /></button>
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-yellow-400/10 border-2 border-yellow-600/40 flex items-center justify-center">
                <Gift size={40} className="text-yellow-500" />
              </div>
              <Sparkles size={18} className="text-yellow-500 absolute -top-1 -right-1" />
            </div>
          </div>
          <h2 className="text-white font-bold text-xl mb-1">Congratulations{username ? `, ${username}` : ''}! 🎊</h2>
          <p className="text-white/60 text-sm mb-4">Your account has been created!</p>
          <div className="bg-white/5 border border-yellow-600/30 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Wallet size={20} className="text-yellow-500" />
              <span className="text-white/60 text-sm font-semibold">Bonus Added to Wallet</span>
            </div>
            <div className="text-yellow-500 font-black text-4xl">₹49</div>
          </div>
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl font-bold text-[15px]"
            style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)', color: '#fff' }}>
            🎮 Claim & Play Now!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Shared Components ── */
const inputClass = "w-full px-3.5 py-3 rounded-lg border border-white/10 bg-white/5 text-[13px] text-white/90 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all";

function FormLabel({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <label className="flex items-center gap-1.5 text-[13px] font-bold text-white/80 mb-1.5">
      <Icon size={14} className="text-yellow-500" /> {text}
    </label>
  );
}

const PasswordInput = React.forwardRef<HTMLInputElement, { show: boolean; toggle: () => void } & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ show, toggle, ...props }, ref) => {
    return (
      <div className="relative">
        <input ref={ref} type={show ? 'text' : 'password'} {...props} className={inputClass + " pr-10"} />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 active:text-white/60">
          {show ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    );
  }
);

function SubmitButton({ loading, text }: { loading: boolean; text: string }) {
  return (
    <button type="submit" disabled={loading}
      className="w-full py-3 rounded-full font-bold text-white text-[14px] shadow-lg transition-all active:scale-[0.97] disabled:opacity-60"
      style={{ background: 'linear-gradient(135deg, #C8102E, #8B0000)' }}>
      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : text}
    </button>
  );
}

function SwitchButton({ onClick, text }: { onClick: () => void; text: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full py-2.5 rounded-full font-semibold text-[13px] border border-yellow-600/40 text-yellow-500 bg-transparent transition-all active:scale-[0.97] active:bg-yellow-500/5">
      {text}
    </button>
  );
}

function BottomActions({ navigate }: { navigate: (path: string) => void }) {
  return (
    <div className="flex items-center justify-center gap-14 pt-4 pb-1">
      <button type="button" className="flex flex-col items-center gap-1" onClick={() => navigate('/forgot-password')}>
        <div className="w-11 h-11 rounded-full border border-yellow-600/30 flex items-center justify-center bg-yellow-500/10">
          <Lock size={18} className="text-yellow-500" />
        </div>
        <span className="text-[10px] text-white/40 font-medium mt-0.5">Forgot password</span>
      </button>
      <a href="https://t.me/techie_404" target="_blank" rel="noopener noreferrer"
        className="flex flex-col items-center gap-1">
        <div className="w-11 h-11 rounded-full border border-yellow-600/30 flex items-center justify-center bg-yellow-500/10">
          <Headphones size={18} className="text-yellow-500" />
        </div>
        <span className="text-[10px] text-white/40 font-medium mt-0.5">Customer Service</span>
      </a>
    </div>
  );
}

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-red-400 text-[11px] mt-0.5">{msg}</p>;
}

/* ── Main Component ── */
export default function SignUpLoginScreen() {
  const navigate = useNavigate();
  const { signIn, signUp, signUpWithPhone, signInWithPhone } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [registerMethod, setRegisterMethod] = useState<'phone' | 'email'>('phone');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);

  // Capture ?ref= from URL
  const refFromUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('ref') ?? '';
  }, []);

  const loginForm = useForm<LoginForm>({ defaultValues: { email: '', password: '' } });
  const phoneLoginForm = useForm<PhoneLoginForm>({ defaultValues: { phone: '', password: '' } });
  const registerForm = useForm<RegisterForm>({ defaultValues: { email: '', password: '', confirmPassword: '', referral: refFromUrl, agree: true } });
  const phoneRegisterForm = useForm<PhoneRegisterForm>({ defaultValues: { phone: '', password: '', confirmPassword: '', referral: refFromUrl, agree: true } });

  // If a ref code is in URL, switch to register tab automatically
  useEffect(() => { if (refFromUrl) setTab('register'); }, [refFromUrl]);

  const onLogin = loginForm.handleSubmit(async (data) => {
    setIsSubmitting(true);
    const { error } = await signIn(data.email, data.password);
    setIsSubmitting(false);
    if (error) { loginForm.setError('email', { message: error.message || 'Invalid credentials' }); return; }
    setShowWelcomeBack(true);
  });

  const onPhoneLogin = phoneLoginForm.handleSubmit(async (data) => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) { phoneLoginForm.setError('phone', { message: 'Enter valid 10-digit number' }); return; }
    setIsSubmitting(true);
    const { error } = await signInWithPhone('+91' + cleanPhone, data.password);
    setIsSubmitting(false);
    if (error) { phoneLoginForm.setError('phone', { message: error.message || 'Invalid credentials' }); return; }
    setShowWelcomeBack(true);
  });

  const handleWelcomeBackClose = () => { setShowWelcomeBack(false); navigate('/main-dashboard'); };

  const onRegister = registerForm.handleSubmit(async (data) => {
    if (data.password !== data.confirmPassword) { registerForm.setError('confirmPassword', { message: 'Passwords do not match' }); return; }
    if (!data.agree) { registerForm.setError('agree', { message: 'You must agree' }); return; }
    setIsSubmitting(true);
    const { error } = await signUp(data.email, data.password, { referral: data.referral || undefined });
    setIsSubmitting(false);
    if (error) {
      const msg = error.message || 'Registration failed';
      if (msg.includes('already registered')) {
        registerForm.setError('email', { message: 'This email is already registered. Please login instead.' });
      } else {
        registerForm.setError('email', { message: msg });
      }
      return;
    }
    navigate('/main-dashboard');
  });

  const onPhoneRegister = phoneRegisterForm.handleSubmit(async (data) => {
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) { phoneRegisterForm.setError('phone', { message: 'Enter valid 10-digit number' }); return; }
    if (data.password !== data.confirmPassword) { phoneRegisterForm.setError('confirmPassword', { message: 'Passwords do not match' }); return; }
    if (!data.agree) { phoneRegisterForm.setError('agree', { message: 'You must agree' }); return; }
    setIsSubmitting(true);
    const { error } = await signUpWithPhone('+91' + cleanPhone, data.password, { referral: data.referral || undefined });
    setIsSubmitting(false);
    if (error) {
      const msg = error.message || 'Registration failed';
      if (msg.includes('already registered')) {
        phoneRegisterForm.setError('phone', { message: 'This number is already registered. Please login instead.' });
      } else {
        phoneRegisterForm.setError('phone', { message: msg });
      }
      return;
    }
    navigate('/main-dashboard');
  });

  const handleWelcomeBonusClose = () => { setShowWelcomeBonus(false); navigate('/main-dashboard'); };

  const PhoneInput = ({ register, error }: { register: any; error?: string }) => (
    <div>
      <FormLabel icon={Phone} text="Phone number" />
      <div className="flex gap-2">
        <div className="flex items-center px-3 py-3 rounded-lg border border-white/10 bg-white/5 text-white/60 text-[13px] gap-1 min-w-[65px] font-medium">
          +91 <ChevronDown size={12} className="text-white/30" />
        </div>
        <input type="tel" placeholder="Please enter the phone number" {...register} className={inputClass + " flex-1"} />
      </div>
      <ErrorText msg={error} />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col w-full max-w-[420px] mx-auto overflow-x-hidden" style={{ background: 'linear-gradient(180deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)' }}>
      <Toaster position="top-center" richColors />

      <AnimatePresence>{showWelcomeBack && <WelcomeBackPopup onClose={handleWelcomeBackClose} />}</AnimatePresence>
      <AnimatePresence>{showWelcomeBonus && <WelcomeBonusPopup username={registeredUsername} onClose={handleWelcomeBonusClose} />}</AnimatePresence>

      {/* ─── Header ─── */}
      <div className="pt-4 pb-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate('/main-dashboard')} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/70 active:scale-90 transition">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-1.5">
            <Crown size={20} className="text-yellow-500" />
            <span className="text-yellow-500 font-black text-[16px] tracking-wider" style={{ fontStyle: 'italic' }}>𝐓𝐞𝐜𝐡𝐢𝐞⁴⁰⁴</span>
          </div>
          <div className="w-8" />
        </div>
        <h1 className="text-white font-bold text-[18px]">{tab === 'login' ? 'Log in' : 'Register'}</h1>
        <p className="text-white/40 text-[11px] mt-1 leading-[1.5]">
          {tab === 'login'
            ? 'Please log in with your phone number or email\nIf you forget your password, please contact customer service'
            : 'Please register by phone number or email'}
        </p>
      </div>

      {/* ─── Form ─── */}
      <div className="flex-1 px-4 pb-4">
        {/* Tabs */}
        <div className="flex mb-5 border-b border-white/10">
          {tab === 'login' ? (
            <>
              {(['phone', 'email'] as const).map(m => (
                <button key={m} onClick={() => setLoginMethod(m)}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-all border-b-2 ${loginMethod === m ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-white/30'}`}>
                  {m === 'phone' ? <Phone size={15} /> : <Mail size={15} />}
                  {m === 'phone' ? 'phone number' : 'Email Login'}
                </button>
              ))}
            </>
          ) : (
            <>
              {(['phone', 'email'] as const).map(m => (
                <button key={m} onClick={() => setRegisterMethod(m)}
                  className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[12px] font-semibold transition-all border-b-2 ${registerMethod === m ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-white/30'}`}>
                  {m === 'phone' ? <Phone size={15} /> : <Mail size={15} />}
                  {m === 'phone' ? 'phone number' : 'Email'}
                </button>
              ))}
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.div key={`login-${loginMethod}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>

              {loginMethod === 'phone' ? (
                <form onSubmit={onPhoneLogin} className="space-y-4">
                  <PhoneInput register={phoneLoginForm.register('phone', { required: 'Phone number is required' })} error={phoneLoginForm.formState.errors.phone?.message} />

                  <div>
                    <FormLabel icon={Lock} text="Password" />
                    <PasswordInput show={showPass} toggle={() => setShowPass(s => !s)}
                      placeholder="Password"
                      {...phoneLoginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    <ErrorText msg={phoneLoginForm.formState.errors.password?.message} />
                  </div>

                  <button type="button" onClick={() => setRememberPassword(!rememberPassword)} className="flex items-center gap-2 py-0.5">
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${rememberPassword ? 'border-yellow-500 bg-yellow-500' : 'border-white/20 bg-transparent'}`}>
                      {rememberPassword && <CheckCircle size={10} className="text-black" />}
                    </div>
                    <span className="text-white/40 text-[11px]">Remember password</span>
                  </button>

                  <SubmitButton loading={isSubmitting} text="Log in" />
                  <SwitchButton onClick={() => setTab('register')} text="Register" />
                  <BottomActions navigate={navigate} />
                </form>
              ) : (
                <form onSubmit={onLogin} className="space-y-4">
                  <div>
                    <FormLabel icon={Mail} text="Mail" />
                    <input type="email" placeholder="please input your email"
                      {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                      className={inputClass} />
                    <ErrorText msg={loginForm.formState.errors.email?.message} />
                  </div>

                  <div>
                    <FormLabel icon={Lock} text="Password" />
                    <PasswordInput show={showPass} toggle={() => setShowPass(s => !s)}
                      placeholder="Password"
                      {...loginForm.register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                    <ErrorText msg={loginForm.formState.errors.password?.message} />
                  </div>

                  <button type="button" onClick={() => setRememberPassword(!rememberPassword)} className="flex items-center gap-2 py-0.5">
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center transition-all ${rememberPassword ? 'border-yellow-500 bg-yellow-500' : 'border-white/20 bg-transparent'}`}>
                      {rememberPassword && <CheckCircle size={10} className="text-black" />}
                    </div>
                    <span className="text-white/40 text-[11px]">Remember password</span>
                  </button>

                  <SubmitButton loading={isSubmitting} text="Log in" />
                  <SwitchButton onClick={() => setTab('register')} text="Register" />
                  <BottomActions navigate={navigate} />
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div key={`register-${registerMethod}`} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>

              {registerMethod === 'phone' ? (
                <form onSubmit={onPhoneRegister} className="space-y-4">
                  <PhoneInput register={phoneRegisterForm.register('phone', { required: 'Phone number is required' })} error={phoneRegisterForm.formState.errors.phone?.message} />

                  <div>
                    <FormLabel icon={Lock} text="Set password" />
                    <PasswordInput show={showPass} toggle={() => setShowPass(s => !s)}
                      placeholder="Set password"
                      {...phoneRegisterForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                    <ErrorText msg={phoneRegisterForm.formState.errors.password?.message} />
                  </div>

                  <div>
                    <FormLabel icon={Lock} text="Confirm password" />
                    <PasswordInput show={showConfirmPass} toggle={() => setShowConfirmPass(s => !s)}
                      placeholder="Confirm password"
                      {...phoneRegisterForm.register('confirmPassword', { required: 'Please confirm password' })} />
                    <ErrorText msg={phoneRegisterForm.formState.errors.confirmPassword?.message} />
                  </div>

                  <div>
                    <FormLabel icon={Gift} text="Invite code" />
                    <input type="text" placeholder="Optional" {...phoneRegisterForm.register('referral')} className={inputClass} />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input type="checkbox" {...phoneRegisterForm.register('agree')} className="w-4 h-4 accent-red-600 rounded" />
                    <span className="text-white/50 text-[11px]">I have read and agree <span className="text-yellow-500 font-bold">【Privacy Agreement】</span></span>
                  </label>
                  <ErrorText msg={phoneRegisterForm.formState.errors.agree?.message} />

                  <SubmitButton loading={isSubmitting} text="Register" />
                  <SwitchButton onClick={() => setTab('login')} text={<>I have an account <span className="font-black">Login</span></>} />
                  <BottomActions navigate={navigate} />
                </form>
              ) : (
                <form onSubmit={onRegister} className="space-y-4">
                  <div>
                    <FormLabel icon={Mail} text="Email" />
                    <input type="email" placeholder="Enter your email"
                      {...registerForm.register('email', { required: 'Email is required', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' } })}
                      className={inputClass} />
                    <ErrorText msg={registerForm.formState.errors.email?.message} />
                  </div>

                  <div>
                    <FormLabel icon={Lock} text="Set password" />
                    <PasswordInput show={showPass} toggle={() => setShowPass(s => !s)}
                      placeholder="Set password"
                      {...registerForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })} />
                    <ErrorText msg={registerForm.formState.errors.password?.message} />
                  </div>

                  <div>
                    <FormLabel icon={Lock} text="Confirm password" />
                    <PasswordInput show={showConfirmPass} toggle={() => setShowConfirmPass(s => !s)}
                      placeholder="Confirm password"
                      {...registerForm.register('confirmPassword', { required: 'Please confirm password' })} />
                    <ErrorText msg={registerForm.formState.errors.confirmPassword?.message} />
                  </div>

                  <div>
                    <FormLabel icon={Gift} text="Invite code" />
                    <input type="text" placeholder="Optional" {...registerForm.register('referral')} className={inputClass} />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer py-0.5">
                    <input type="checkbox" {...registerForm.register('agree')} className="w-4 h-4 accent-red-600 rounded" />
                    <span className="text-white/50 text-[11px]">I have read and agree <span className="text-yellow-500 font-bold">【Privacy Agreement】</span></span>
                  </label>
                  <ErrorText msg={registerForm.formState.errors.agree?.message} />

                  <SubmitButton loading={isSubmitting} text="Register" />
                  <SwitchButton onClick={() => setTab('login')} text={<>I have an account <span className="font-black">Login</span></>} />
                  <BottomActions navigate={navigate} />
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
