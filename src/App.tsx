import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Home, Compass, MapPinned, MessagesSquare, UserRound } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { supabase } from './lib/supabase';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';

// Lazy load screens
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const ExploreScreen = lazy(() => import('./screens/ExploreScreen'));
const MapScreen = lazy(() => import('./screens/MapScreen'));
const ChatScreen = lazy(() => import('./screens/ChatScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const SavedVendorsScreen = lazy(() => import('./screens/SavedVendorsScreen'));
const SearchScreen = lazy(() => import('./screens/SearchScreen'));
const VendorProfileScreen = lazy(() => import('./screens/VendorProfileScreen'));
const VendorRegistrationScreen = lazy(() => import('./screens/VendorRegistrationScreen'));
const NotificationsScreen = lazy(() => import('./screens/NotificationsScreen'));
const AdminScreen = lazy(() => import('./screens/AdminScreen'));
const PrivacySecurityScreen = lazy(() => import('./screens/PrivacySecurityScreen'));
const BusinessDashboardScreen = lazy(() => import('./screens/BusinessDashboardScreen'));
const ContactSupportScreen = lazy(() => import('./screens/ContactSupportScreen'));
const TermsPrivacyScreen = lazy(() => import('./screens/TermsPrivacyScreen'));
const AppSettingsScreen = lazy(() => import('./screens/AppSettingsScreen'));

function ScreenFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-cream-50">
      <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

function AppContent() {
  const { currentScreen, setCurrentScreen, conversations } = useApp();
  const [appPhase, setAppPhase] = useState<'splash' | 'onboarding' | 'auth' | 'app'>('splash');

  // Check Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const hasOnboarded = localStorage.getItem('tv_onboarded');
      
      if (session) {
        setAppPhase(hasOnboarded ? 'app' : 'onboarding');
      } else {
        setAppPhase('splash');
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN' && session) {
        localStorage.setItem('tv_authed', 'true');
        const hasOnboarded = localStorage.getItem('tv_onboarded');
        setAppPhase(hasOnboarded ? 'app' : 'onboarding');
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('tv_authed');
        setAppPhase('auth');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSplashComplete = useCallback(() => {
    const hasOnboarded = localStorage.getItem('tv_onboarded');
    if (hasOnboarded) setAppPhase('app');
    else setAppPhase('onboarding');
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setAppPhase('auth');
  }, []);

  if (appPhase === 'splash') return <SplashScreen onComplete={handleSplashComplete} />;
  if (appPhase === 'onboarding') return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  if (appPhase === 'auth') return <AuthScreen />;

  const unreadCount = conversations.reduce((s, c) => s + c.unread, 0);

  const NAV_ITEMS = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'map', icon: MapPinned, label: 'Map', fab: true },
    { id: 'chat', icon: MessagesSquare, label: 'Chat', badge: unreadCount },
    { id: 'profile', icon: UserRound, label: 'Profile' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'explore': return <ExploreScreen />;
      case 'map': return <MapScreen />;
      case 'chat': return <ChatScreen />;
      case 'saved-vendors': return <SavedVendorsScreen />;
      case 'profile': return <ProfileScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'privacy-security': return <PrivacySecurityScreen />;
      case 'business-dashboard': return <BusinessDashboardScreen />;
      case 'contact-support': return <ContactSupportScreen />;
      case 'terms-privacy': return <TermsPrivacyScreen />;
      case 'app-settings': return <AppSettingsScreen />;
      case 'admin': return <AdminScreen />;
      default: return <HomeScreen />;
    }
  };

  const showSearch = currentScreen === 'search';
  const showVendorProfile = currentScreen === 'vendor-profile';
  const showVendorRegistration = currentScreen === 'vendor-registration';
  const showBottomNav = !showSearch && !showVendorProfile && !showVendorRegistration;

  return (
    <div className="app-shell">
      <div className="screen-container">
        <Suspense fallback={<ScreenFallback />}>
          {renderScreen()}
        </Suspense>
      </div>

      {showBottomNav && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            if (item.fab) {
              return (
                <button
                  key={item.id}
                  className="nav-item nav-item-fab"
                  onClick={() => setCurrentScreen(item.id)}
                  aria-label={item.label}
                >
                  <Icon />
                </button>
              );
            }
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentScreen(item.id)}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon size={22} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center leading-none">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {showSearch && (
        <Suspense fallback={<ScreenFallback />}>
          <SearchScreen />
        </Suspense>
      )}
      {showVendorProfile && (
        <Suspense fallback={<ScreenFallback />}>
          <VendorProfileScreen />
        </Suspense>
      )}
      {showVendorRegistration && (
        <Suspense fallback={<ScreenFallback />}>
          <VendorRegistrationScreen />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
