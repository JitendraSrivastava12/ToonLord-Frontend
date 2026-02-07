import React from 'react';
import { 
  CheckCircle2, Clock, FileText, ExternalLink, 
  Search, Filter, MoreVertical 
} from 'lucide-react';

const ContractManagement = () => {
  const stats = [
    { label: "Active Contracts", value: 1, icon: <CheckCircle2 className="text-green-600" />, bg: "bg-green-50" },
    { label: "Pending Signature", value: 0, icon: <Clock className="text-yellow-600" />, bg: "bg-yellow-50" },
    { label: "Drafts", value: 0, icon: <FileText className="text-blue-600" />, bg: "bg-blue-50" },
  ];

  const contracts = [
    {
      id: 1,
      title: "Shadow Warriors Academy",
      author: "Hiroshi Nakamura",
      price: "$4.99",
      revenueShare: "70% / 30%",
      duration: "12 months",
      status: "Signed"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contract Management</h1>
            <p className="text-gray-500 text-sm">Monitor premium manga legal agreements</p>
          </div>
          <button className="w-full md:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            + Create New Contract
          </button>
        </div>

        {/* Stats Row - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200 flex justify-between items-start shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* List Section */}
        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden">
          {/* Controls Header */}
          <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="font-bold text-gray-900">All Agreements</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                  type="text" 
                  placeholder="Search contracts..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
                 />
               </div>
               <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl border border-gray-200">
                <Filter size={18} />
               </button>
            </div>
          </div>

          {/* Desktop Table - Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-bold uppercase tracking-[0.1em] border-b border-gray-100">
                  <th className="px-6 py-4">Manga Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Revenue</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 font-bold text-gray-900">{contract.title}</td>
                    <td className="px-6 py-5 text-gray-600 text-sm">{contract.author}</td>
                    <td className="px-6 py-5 font-bold text-blue-600">{contract.price}</td>
                    <td className="px-6 py-5 text-gray-500 text-sm">{contract.revenueShare}</td>
                    <td className="px-6 py-5 text-gray-500 text-sm">{contract.duration}</td>
                    <td className="px-6 py-5">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-green-100">
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-gray-400 hover:text-blue-600 p-2 rounded-lg transition-colors">
                        <ExternalLink size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout - Hidden on Desktop */}
          <div className="md:hidden divide-y divide-gray-100">
            {contracts.map((contract) => (
              <div key={contract.id} className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900">{contract.title}</h4>
                    <p className="text-xs text-gray-500">{contract.author}</p>
                  </div>
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-[10px] font-black uppercase">
                    {contract.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Price</p>
                    <p className="text-sm font-bold text-blue-600">{contract.price}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Rev. Share</p>
                    <p className="text-sm font-medium text-gray-700">{contract.revenueShare}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Duration</p>
                    <p className="text-sm font-medium text-gray-700">{contract.duration}</p>
                  </div>
                  <div className="flex items-end justify-end">
                    <button className="flex items-center gap-1 text-xs font-bold text-blue-600">
                      View <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {contracts.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                <FileText size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No active contracts found.</p>
              <p className="text-xs text-gray-400 mt-1">Contracts will appear here once authors sign them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractManagement;