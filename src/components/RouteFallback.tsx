import { useLocation } from 'react-router-dom';
import PageLoader from './PageLoader';
import {
  DashboardSkeleton,
  WalletSkeleton,
  ProfileSkeleton,
  GameSkeleton,
  SpinSkeleton,
  ActivitySkeleton,
} from './SkeletonScreens';

function pickSkeleton(pathname: string) {
  if (pathname.startsWith('/main-dashboard') || pathname === '/') return <DashboardSkeleton />;
  if (
    pathname.startsWith('/wallet') ||
    pathname.startsWith('/deposit') ||
    pathname.startsWith('/withdraw') ||
    pathname.startsWith('/transaction-history')
  )
    return <WalletSkeleton />;
  if (
    pathname.startsWith('/profile-management') ||
    pathname.startsWith('/avatar-select') ||
    pathname.startsWith('/language') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/sign-up-login-screen') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  )
    return <ProfileSkeleton />;
  if (
    pathname.startsWith('/game-screen') ||
    pathname.startsWith('/win-go') ||
    pathname.startsWith('/bet-history') ||
    pathname.startsWith('/game-statistics')
  )
    return <GameSkeleton />;
  if (pathname.startsWith('/spin-wheel') || pathname.startsWith('/gift')) return <SpinSkeleton />;
  if (pathname.startsWith('/activity-history') || pathname.startsWith('/promotions-detail'))
    return <ActivitySkeleton />;
  return <DashboardSkeleton />;
}

export default function RouteFallback() {
  const { pathname } = useLocation();
  return (
    <>
      {pickSkeleton(pathname)}
      <PageLoader />
    </>
  );
}
