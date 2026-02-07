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
        <Route path='/browse' element={<BrowsePage  />} />
        <Route path='/upload' element={<UploadPage  />} />
        <Route path='/manga/:mangaId' element={<AdvancedViewPage  />} />
        
        <Route path='/loginlanding' element={<MangaRealmLanding  />} />
        <Route path="/create-series" element={<CreateSeries  />} />
        <Route path="/edit-series/:id" element={<CreateSeries  />} />
        <Route path='/my-series' element={<MySeries  />} />
        <Route path='/settings' element={<Settings/>} />
          <Route path='/dashboard' element={<CreatorDashboard/>} />
          
      <Route path='/notifications' element={<Notification/>}/>
              <Route path='/analytics' element={<Analytics/>}/>
        {/* CRITICAL: Added the Settings route so you can actually change the theme */}
        
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
          <Route path='/admin/reports' element={<ReportsManagement/>}/>
          <Route path='/admin/contracts' element={<ContractManagement/>}/>
          <Route path='/admin/users' element={<UserManagement/>}/>
        </Route>
    </Routes>
  )
}

export default AppRoutes