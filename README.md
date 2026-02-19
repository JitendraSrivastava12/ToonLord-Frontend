<h1 align="center">📚 ToonLord – Manga Reading Platform (Frontend)</h1>

<p align="center">
<b>A modern, full-stack manga & comics ecosystem</b><br/>
Read free manga • Unlock premium with coins • Support creators • Immersive UI
</p>

<p align="center">
🌐 Website: <a href="https://toonlord.vercel.app/" target="_blank">https://toonlord.vercel.app/</a>
</p>

<hr/>

<h2>🌟 About ToonLord</h2>

<p>
<strong>ToonLord</strong> is a feature-rich digital manga platform where:
</p>

<ul>
  <li>Readers can enjoy free manga</li>
  <li>Premium manga can be unlocked using coins</li>
  <li>VIP users enjoy an ad-free experience</li>
  <li>Creators can upload and monetize their content</li>
  <li>Admins manage users, revenue, and content</li>
</ul>

<p>
This repository contains the <b>Vite + React frontend</b> connected to a
<b>Node.js + Express + MongoDB (Atlas)</b> backend.
</p>

<hr/>

<h2>✨ Core Features</h2>

<h3>📖 Reading Experience</h3>
<ul>
  <li>Free manga available for all users</li>
  <li>Premium manga & chapters require unlocking with coins</li>
  <li>Coins can be earned by:
    <ul>
      <li>Watching ads</li>
      <li>Purchasing with real money</li>
    </ul>
  </li>
  <li>Clean & distraction-free reader UI</li>
  <li>High-quality premium manga</li>
  <li>Reading progress tracking</li>
  <li>Bookmarks & personal library</li>
  <li>Subscribe to manga series</li>
</ul>

<h3>💎 VIP Subscription</h3>
<ul>
  <li>VIP removes all advertisements</li>
  <li>VIP users still use coins for premium chapters</li>
  <li>Smooth reading without interruptions</li>
</ul>

<h3>🔍 Discover & Explore</h3>
<ul>
  <li>Public landing page for visitors</li>
  <li>Browse manga by genre, tags & creators</li>
  <li>Live search:
    <ul>
      <li>Manga search</li>
      <li>User search</li>
    </ul>
  </li>
  <li>Smart recommendation system</li>
  <li>View creator profiles & their uploaded manga</li>
</ul>

<hr/>

<h2>👤 User System</h2>
<ul>
  <li>Signup / Login authentication</li>
  <li>Secure sessions</li>
  <li>Role-based system:
    <ul>
      <li>Reader</li>
      <li>Creator</li>
      <li>Admin</li>
    </ul>
  </li>
  <li>User dashboard & profile</li>
  <li>Theme switcher (multiple themes)</li>
  <li>Follow & following system</li>
  <li>Reading history tracking</li>
</ul>

<h3>👥 Follow System</h3>
<ul>
  <li>Users can follow creators</li>
  <li>Users can follow other users</li>
  <li>Followers receive updates on new manga</li>
  <li>Used for personalized recommendations</li>
</ul>

<hr/>

<h2>✍️ Creator System</h2>

<h3>📝 Become a Creator</h3>
<ul>
  <li>User must sign a digital contract</li>
  <li>Admin approval required</li>
  <li>Creator role activated after approval</li>
</ul>

<h3>📂 Creator Dashboard</h3>
<ul>
  <li>My Manga management panel</li>
  <li>Upload new manga</li>
  <li>Upload chapters</li>
  <li>Creator can:
    <ul>
      <li>Select image compression level (quality vs size)</li>
      <li>Add external links while uploading manga or chapters</li>
    </ul>
  </li>
  <li>View analytics:
    <ul>
      <li>Views</li>
      <li>Earnings</li>
      <li>Subscribers</li>
      <li>Followers</li>
    </ul>
  </li>
  <li>Request manga to become Premium</li>
</ul>

<h3>💰 Premium Manga Flow</h3>
<ol>
  <li>Creator requests premium status</li>
  <li>Admin reviews request</li>
  <li>Admin sends contract</li>
  <li>Revenue split is decided</li>
  <li>Manga becomes premium</li>
  <li>Creator earns more from premium reads</li>
</ol>

<hr/>

<h2>🛡 Admin System</h2>

<h3>📊 Admin Dashboard</h3>
<ul>
  <li>Revenue tracking</li>
  <li>User management</li>
  <li>Manga management</li>
  <li>Creator management</li>
  <li>Premium request management</li>
  <li>Contract management</li>
  <li>VIP subscription monitoring</li>
</ul>

<h3>🚨 Report & Moderation System</h3>
<ul>
  <li>Users can report:
    <ul>
      <li>Manga</li>
      <li>Chapter</li>
      <li>Comment</li>
      <li>User</li>
    </ul>
  </li>
  <li>Admin can:
    <ul>
      <li>Review reports</li>
      <li>Delete content</li>
      <li>Warn users</li>
      <li>Ban users</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>💬 Comment System</h2>
<ul>
  <li>Users can comment on manga & chapters</li>
  <li>Threaded reply system</li>
  <li>Like & interact with comments</li>
  <li>Report inappropriate comments</li>
</ul>

<hr/>

<h2>🎨 UI & Experience</h2>
<ul>
  <li>Modern responsive design</li>
  <li>Multiple theme switcher</li>
  <li>Advanced reader UI</li>
  <li>Smooth animations</li>
  <li>Mobile-friendly layout</li>
</ul>

<hr/>

<h2>🧠 Recommendation System</h2>
<ul>
  <li>Smart manga suggestions based on:
    <ul>
      <li>Reading history</li>
      <li>Subscriptions</li>
      <li>Followed creators</li>
      <li>Popular content</li>
      <li>Premium manga</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>🪙 Economy System</h2>
<ul>
  <li>Coin-based unlocking system</li>
  <li>Coins earned via ads or purchase</li>
  <li>Transaction & unlock history</li>
  <li>VIP ad bypass logic</li>
</ul>

<hr/>

<h2>⚙️ How To Run The Project (Vite)</h2>

<h3>1️⃣ Clone Repository</h3>
<pre>
git clone https://github.com/YOUR_USERNAME/ToonLord_Frontend.git
cd toonlord-frontend
</pre>

<h3>2️⃣ Install Dependencies</h3>
<pre>
npm install
</pre>

<h3>3️⃣ Create Environment File</h3>
<pre>
VITE_API_URL=http://localhost:5000
</pre>

<h3>4️⃣ Start Development Server</h3>
<pre>
npm run dev
</pre>

<p>Open in browser:</p>
<pre>http://localhost:5173</pre>

<h3>5️⃣ Production Build</h3>
<pre>
npm run build
</pre>

<h3>6️⃣ Preview Production Build</h3>
<pre>
npm run preview
</pre>

<hr/>

<h2>📂 Project Structure</h2>

<pre>
src/
 ┣ components/
 ┣ pages/
 ┣ context/
 ┣ api/
 ┣ ui/
 ┣ assets/
 ┣ App.jsx
 ┗ main.jsx
</pre>

<hr/>

<h2>🚀 Future Features</h2>
<ul>
  <li>🌍 Global & Local dashboards</li>
  <li>🤖 AI chatbot for help & support</li>
  <li>🎯 Daily challenges with rewards</li>
  <li>💬 Real-time chat system</li>
  <li>📱 Progressive Web App (PWA)</li>
  <li>🧩 Community forums</li>
</ul>

<hr/>

<h2>👨‍💻 Author</h2>
<p>
<strong>Jitendra Srivastava</strong>
</p>

<hr/>

<h2>⭐ Support</h2>
<p>
If you found this project useful, consider giving it a ⭐  
It really helps and motivates future development ❤️
</p>
