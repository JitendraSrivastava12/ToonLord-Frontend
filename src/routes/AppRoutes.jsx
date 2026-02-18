import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Layout & Components
import Layout from '../components/Layout'
import UploadPage from '../components/UploadPage'

// Pages
import ToonLordLanding from '../pages/ToonLordLanding'
import LibraryPage from '../pages/LibraryPage'
import ProfilePage from '../pages/ProfilePage'
import BrowsePage from '../pages/BrowsePage'
import AdvancedViewPage from '../pages/MangaDetail'
import MangaReader from '../pages/MangaPageView'
import ToonLordHome from '../pages/ToonLordHomePage'
import MangaRealmLanding from '../pages/MangaRealmLanding'
import AuthScreen from '../pages/UserLogin'
import CreateSeries from '../pages/createseries'
import MySeries from '../pages/myseries'
import Settings from '../pages/Settings' // Added this import
import Activity from '../components/Activity';
import CreatorDashboard from '../pages/dashboard'
import CreatorComments from '../pages/commentsdemo'
import Notification from '../pages/Notifications'
import Analytics from '../pages/Analytics'
import AdminLayout from '../AdminComponents/AdminLayout'
import AdminDashboard from '../AdminPages/AdminDashoard'
import AsdminPremiumRequest from '../AdminPages/AdminPremiumRequest'
import ReportsManagement from '../AdminPages/AdminReport'
import ContractManagement from '../AdminPages/AdminContracts'
import UserManagement from '../AdminPages/AdminUserManagement'
import AdminLogin from '../AdminPages/AdminLogin'
import MangaManagement from '../AdminPages/MangaList'
import WalletPage from '../pages/Wallet'
import CoinShopPage from '../pages/CoinShop'
import PaymentSuccess from '../pages/PaymentSucess'
import EditChapterPage from '../pages/EditChapter'
import VisitorProfile from '../pages/Profile2'
import Subscription from '../pages/Subscription'
import NotFound from '../pages/NotFound'
import LogsPage from '../AdminPages/LogPage'
import UserSafety from '../pages/Safety'
import PrivacyPolicy from '../pages/Privacy'
import TermsOfService from '../pages/Terms'
import AdminSettings from '../AdminComponents/AdminSetting'
function AppRoutes({ currentTheme, setTheme }) {
  return (
    <Routes>
      {/* Layout wraps all internal pages. 
        We pass currentTheme and setTheme so the Sidebar and NavBar can use them.
      */}
      
      <Route element={<Layout  />}>
        <Route index element={<ToonLordLanding  />} />
        <Route path='/home' element={<ToonLordHome />} />
        <Route path='/library' element={<LibraryPage  />} />
        <Route path='/profile' element={<ProfilePage  />} />
      <Route path="/profile/:id" element={<VisitorProfile/>} />
        <Route path='/browse' element={<BrowsePage  />} />
        <Route path='/upload' element={<UploadPage  />} />
        <Route path='/manga/:mangaId' element={<AdvancedViewPage  />} />
        
        <Route path='/loginlanding' element={<MangaRealmLanding  />} />
        <Route path='/wallet' element={<WalletPage  />} />
        <Route path='/shop' element={<CoinShopPage  />} />
        
        <Route path="/create-series" element={<CreateSeries  />} />
      <Route path="/create-series/:id" element={<CreateSeries />} />
        <Route path='/my-series' element={<MySeries  />} />
        <Route path='/settings' element={<Settings/>} />
          <Route path='/dashboard' element={<CreatorDashboard/>} />
          <Route path="/edit-chapter/:mangaId/:chapterId" element={<EditChapterPage/>} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/safety" element={<UserSafety/>} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
        
        {/* Optional: You can reuse CoinShopPage for cancels or make a custom one */}
        <Route path="/payment-cancel" element={<CoinShopPage />} />
          
      <Route path='/notifications' element={<Notification/>}/>
              <Route path='/analytics' element={<Analytics/>}/>
        
      </Route>
      <Route path='/manga/:id/:chapterNum' element={<MangaReader  />} />
      <Route path='/adminlogin' element={<AdminLogin />} />

      {/* Auth screen usually sits outside the main layout */}
      <Route path='/UserLogin' element={<AuthScreen />} />
      <Route path='/act' element={<Activity/>}/>
      <Route path='/commentcreator' element={<CreatorComments/>}/>
      
      <Route path="/admin" element={<AdminLayout />}>
          {/* This renders at /admin */}
          <Route index element={<AdminDashboard />} />
          <Route path='/admin/request' element={<AsdminPremiumRequest/>}/>
          <Route path='/admin/settings' element={<AdminSettings/>}/>
          <Route path='/admin/reports' element={<ReportsManagement/>}/>
          
          <Route path='/admin/contracts' element={<ContractManagement/>}/>
          <Route path='/admin/users' element={<UserManagement/>}/>
           <Route path="/admin/logs" element={<LogsPage />} />
          <Route path='/admin/manga' element={<MangaManagement/>}/>
        </Route>
        <Route path="*" element={<NotFound />} />
    </Routes>
    
    
  )
}

export default AppRoutes