import React from 'react'
import ToonLordLanding from './pages/ToonLordLanding'
import Layout from './components/Layout'
import { Routes, Route } from 'react-router-dom'
import ToonLordHomePage from './pages/ToonLordHomePage'
import LibraryPage from './pages/LibraryPage'
import ProfilePage from './pages/ProfilePage'
import BrowsePage from './pages/BrowsePage'
import UploadPage from './components/UploadPage'
import Lund from './pages/Form'
import AdvancedViewPage from './pages/MangaDetail'
import MangaReader from './pages/MangaPageView'
import ToonLordHome from './pages/ToonLordHomePage'
import MangaRealmLanding from './pages/MangaRealmLanding'
import AuthScreen from './pages/UserLogin'
import CreateSeries from './pages/createseries'
import MySeries from './pages/myseries'
function App() {
  return (
    <Routes>
      {/* Layout is the Parent Route */}
      <Route  element={<Layout />}>
        {/* All pages here are "children" of Layout */}
        <Route index element={<ToonLordLanding />} />
        {/* Example of another page: 
        <Route path="browse" element={<BrowseManga />} /> 
        */}
        <Route path='/home' element={<ToonLordHome />} />
        <Route path='/library' element={<LibraryPage />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/browse' element={<BrowsePage/>} />
         <Route path='/upload' element={<UploadPage/>} />
          <Route path='/manga/:mangaId' element={<AdvancedViewPage/>} />
          <Route path='/manga/:id/:chapterNum' element={<MangaReader/>} />
          <Route path='/loginlanding' element={<MangaRealmLanding/>} />
           <Route path="/create-series" element={<CreateSeries />} />
              <Route path="/edit-series/:id" element={<CreateSeries />} />
            <Route path='/my-series' element={<MySeries/>} />
      </Route>
       <Route path='/UserLogin' element={<AuthScreen/>} />
      <Route path = "/lund" element={<Lund/>}/>
    </Routes>
  )
}

export default App