import { ShieldCheck, MessageSquareX, UserCheck } from 'lucide-react'; // Optional: if you use Lucide icons

const UserSafety = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 md:pt-12 text-gray-800 leading-relaxed">
      <h1 className="text-4xl font-bold mb-8 text-blue-700">User Safety & Community Guidelines</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-12 text-center">
        <div className="p-6 bg-blue-50 rounded-2xl">
          <ShieldCheck className="mx-auto mb-3 text-blue-600" size={40} />
          <h3 className="font-bold">Privacy First</h3>
          <p className="text-sm">Never share your real address or phone number in comments.</p>
        </div>
        <div className="p-6 bg-red-50 rounded-2xl">
          <MessageSquareX className="mx-auto mb-3 text-red-600" size={40} />
          <h3 className="font-bold">No Harassment</h3>
          <p className="text-sm">Bullying authors or readers will result in immediate suspension.</p>
        </div>
        <div className="p-6 bg-green-50 rounded-2xl">
          <UserCheck className="mx-auto mb-3 text-green-600" size={40} />
          <h3 className="font-bold">Report Content</h3>
          <p className="text-sm">Use the 'Report' button on any story that promotes hate speech.</p>
        </div>
      </div>

      <section className="mb-8 text-[var(--text-main)]">
        <h2 className="text-2xl font-semibold mb-4">Content Warnings</h2>
        <p>ToonLord requires authors to tag stories with appropriate maturity ratings. If you encounter untagged explicit or violent content, please report it immediately to our moderation team.</p>
      </section>

      <section className="mb-8 text-[var(--text-main)]">
        <h2 className="text-2xl font-semibold mb-4">Interaction Safety</h2>
        <p>Be wary of users asking for financial help or personal information outside of ToonLord. All legitimate transactions are handled exclusively through our ToonCoin system.</p>
      </section>
    </div>
  );
};

export default UserSafety;