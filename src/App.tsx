import { useState, useCallback, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { I18nProvider } from "@/hooks/useI18n";
import AuthGuard from "@/components/AuthGuard";
import SplashScreen from "@/components/SplashScreen";
import PageLoader from "@/components/PageLoader";

const MainDashboard = lazy(() => import("./pages/MainDashboard"));
const GameScreen = lazy(() => import("./pages/GameScreen"));
const SignUpLogin = lazy(() => import("./pages/SignUpLogin"));
const Wallet = lazy(() => import("./pages/Wallet"));
const DepositPage = lazy(() => import("./pages/DepositPage"));
const WithdrawPage = lazy(() => import("./pages/WithdrawPage"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));
const DepositHistory = lazy(() => import("./pages/DepositHistory"));
const WithdrawHistory = lazy(() => import("./pages/WithdrawHistory"));
const SpinWheel = lazy(() => import("./pages/SpinWheel"));
const ProfileManagement = lazy(() => import("./pages/ProfileManagement"));
const ActivityHistory = lazy(() => import("./pages/ActivityHistory"));
const PromotionsDetail = lazy(() => import("./pages/PromotionsDetail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AvatarSelect = lazy(() => import("./pages/AvatarSelect"));
const BetHistory = lazy(() => import("./pages/BetHistory"));
const Notifications = lazy(() => import("./pages/Notifications"));
const GiftPage = lazy(() => import("./pages/GiftPage"));
const GameStatistics = lazy(() => import("./pages/GameStatistics"));
const LanguagePage = lazy(() => import("./pages/LanguagePage"));

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <I18nProvider>
          <AuthProvider>
            {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/main-dashboard" replace />} />
                  <Route path="/main-dashboard" element={<MainDashboard />} />
                  <Route path="/game-screen" element={<GameScreen />} />
                  <Route path="/sign-up-login-screen" element={<SignUpLogin />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/deposit" element={<AuthGuard><DepositPage /></AuthGuard>} />
                  <Route path="/withdraw" element={<AuthGuard><WithdrawPage /></AuthGuard>} />
                  <Route path="/transaction-history" element={<AuthGuard><TransactionHistory /></AuthGuard>} />
                  <Route path="/deposit-history" element={<AuthGuard><DepositHistory /></AuthGuard>} />
                  <Route path="/withdraw-history" element={<AuthGuard><WithdrawHistory /></AuthGuard>} />
                  <Route path="/spin-wheel" element={<AuthGuard><SpinWheel /></AuthGuard>} />
                  <Route path="/profile-management" element={<AuthGuard><ProfileManagement /></AuthGuard>} />
                  <Route path="/avatar-select" element={<AuthGuard><AvatarSelect /></AuthGuard>} />
                  <Route path="/bet-history" element={<AuthGuard><BetHistory /></AuthGuard>} />
                  <Route path="/notifications" element={<AuthGuard><Notifications /></AuthGuard>} />
                  <Route path="/gift" element={<AuthGuard><GiftPage /></AuthGuard>} />
                  <Route path="/game-statistics" element={<AuthGuard><GameStatistics /></AuthGuard>} />
                  <Route path="/language" element={<AuthGuard><LanguagePage /></AuthGuard>} />
                  <Route path="/activity-history" element={<AuthGuard><ActivityHistory /></AuthGuard>} />
                  <Route path="/promotions-detail" element={<AuthGuard><PromotionsDetail /></AuthGuard>} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ForgotPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
