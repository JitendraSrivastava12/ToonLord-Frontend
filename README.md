<h1>📚 ToonLord – Manga Reading Platform (Frontend)</h1>

<p>
A premium, full-stack manga & comics ecosystem where users can read free manga, unlock premium content using coins, support creators, and enjoy a modern themed UI — built with React.
</p>

<p>
<strong>ToonLord</strong> is a complete digital manga platform combining:
</p>

<ul>
  <li>Free & premium manga reading</li>
  <li>Coin-based economy</li>
  <li>VIP ad-free subscription</li>
  <li>Creator publishing tools</li>
  <li>Admin management panel</li>
  <li>Recommendation system</li>
  <li>Social features (follow system & comments)</li>
  <li>Modern UI with theme switcher</li>
</ul>

<p>
This repository contains the <strong>React frontend client</strong> connected to a
<strong>Node.js + Express + MongoDB (Atlas)</strong> backend.
</p>

<hr/>

<h2>✨ Core Features</h2>

<h3>📖 Reading System</h3>
<ul>
  <li>Free manga available for all users</li>
  <li>Premium manga & chapters require unlocking with coins</li>
  <li>Coins can be obtained by:
    <ul>
      <li>Watching ads</li>
      <li>Purchasing with real money</li>
    </ul>
  </li>
  <li>Clean distraction-free reader UI</li>
  <li>High-quality premium manga</li>
  <li>Reading progress tracking</li>
  <li>Bookmark chapters</li>
  <li>Personal manga library</li>
  <li>Subscribe to manga series</li>
</ul>

<h3>💎 VIP Reader System</h3>
<ul>
  <li>VIP subscription removes all advertisements</li>
  <li>VIP users still need coins to unlock premium manga</li>
  <li>No interruption while reading</li>
</ul>

<h3>🔍 Discovery & Browsing</h3>
<ul>
  <li>Landing page for public users</li>
  <li>Browse manga by genre, tags, and creators</li>
  <li>Live search:
    <ul>
      <li>Manga search</li>
      <li>User search</li>
    </ul>
  </li>
  <li>Recommendation system for free & premium manga</li>
  <li>Anyone can view creator profiles</li>
  <li>View all manga uploaded by any creator</li>
</ul>

<h3>👤 User System</h3>
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
  <li>Personal profile & dashboard</li>
  <li>User manga library</li>
  <li>Theme switcher (multiple themes)</li>
  <li>History tracking</li>
</ul>

<h3>👥 Follow & Following System</h3>
<ul>
  <li>Users can follow creators</li>
  <li>Users can follow other users</li>
  <li>Followers can see creator’s uploaded manga</li>
  <li>Following list maintained in user profile</li>
  <li>Used for personalized recommendations</li>
</ul>

<hr/>

<h2>✍️ Creator System</h2>

<h3>📝 Become a Creator</h3>
<ul>
  <li>User must sign a contract to become a creator</li>
  <li>Admin approval required</li>
  <li>Creator role is activated after approval</li>
</ul>

<h3>📂 Creator Dashboard</h3>
<ul>
  <li>My Manga section</li>
  <li>Upload new manga</li>
  <li>Upload chapters</li>
  <li>While uploading chapters, creator can choose image compression level (quality vs file size)</li>
  <li>Supports optimized upload for slow networks and mobile users</li>
  <li>View analytics:
    <ul>
      <li>Views</li>
      <li>Earnings</li>
      <li>Subscribers</li>
      <li>Followers</li>
    </ul>
  </li>
  <li>Request manga to be marked as Premium</li>
</ul>

<h3>💰 Premium Manga Approval Flow</h3>
<ol>
  <li>Creator requests premium status</li>
  <li>Admin reviews request</li>
  <li>Admin sends contract</li>
  <li>Profit split is decided</li>
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
  <li>Premium request management</li>
  <li>Contract management</li>
  <li>Creator management</li>
  <li>VIP subscription monitoring</li>
</ul>

<h3>🚨 Report System</h3>
<ul>
  <li>Any user can report:
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
  <li>Users can comment on manga and chapters</li>
  <li>Reply system for threaded discussions</li>
  <li>Like and interact with comments</li>
  <li>Report inappropriate comments</li>
  <li>Admin moderation panel</li>
</ul>

<hr/>

<h2>🎨 UI & Experience</h2>
<ul>
  <li>Modern responsive design</li>
  <li>Multiple theme switcher</li>
  <li>Advanced reader UI</li>
  <li>Smooth animations</li>
  <li>Dynamic content pages</li>
  <li>Mobile-friendly layout</li>
</ul>

<hr/>

<h2>🧠 Recommendation System</h2>
<ul>
  <li>Smart manga suggestions</li>
  <li>Based on:
    <ul>
      <li>Reading history</li>
      <li>Subscriptions</li>
      <li>Followed creators</li>
      <li>Popular manga</li>
      <li>Premium content</li>
    </ul>
  </li>
</ul>

<hr/>

<h2>🪙 Economy System</h2>
<ul>
  <li>Coin-based chapter unlocking</li>
  <li>Coins earned via ads or purchase</li>
  <li>Transaction history</li>
  <li>Unlock history</li>
  <li>VIP ad bypass system</li>
</ul>

<hr/>

<h2>🛠 Tech Stack</h2>

<h3>Frontend</h3>
<ul>
  <li>React</li>
  <li>React Router</li>
  <li>Axios</li>
  <li>Context API</li>
  <li>Tailwind CSS</li>
</ul>

<h3>Backend (separate repo)</h3>
<ul>
  <li>Node.js</li>
  <li>Express</li>
  <li>MongoDB Atlas</li>
  <li>Cloudinary</li>
  <li>REST APIs</li>
</ul>

<hr/>

<h2>⚙️ How To Run The Project</h2>

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
<p>Create a <code>.env</code> file in the root directory:</p>
<pre>
REACT_APP_API_URL=http://localhost:5000
</pre>

<h3>4️⃣ Start Development Server</h3>
<pre>
npm start
</pre>

<p>Open in browser:</p>
<pre>
http://localhost:3000
</pre>

<h3>5️⃣ Production Build</h3>
<pre>
npm run build
</pre>

<p>Build files will be generated inside:</p>
<pre>
/build
</pre>

<hr/>

<h2>📂 Project Structure</h2>

<pre>
src/
 ┣ components/
 ┣ pages/
 ┣ context/
 ┣ hooks/
 ┣ api/
 ┣ ui/
 ┣ assets/
 ┣ App.js
 ┗ index.js
</pre>

<hr/>

<h2>👨‍💻 Author</h2>
<p>
<strong>Saurabh Sharma</strong><br/>
Full Stack Developer
</p>

<ul>
  <li>React</li>
  <li>Node.js</li>
  <li>MongoDB</li>
  <li>Blockchain</li>
  <li>Recommendation Systems</li>
</ul>

<hr/>

<h2>⭐ Support</h2>
<p>
If you found this project useful, consider giving it a ⭐  
It really helps and motivates future development ❤️
</p>
