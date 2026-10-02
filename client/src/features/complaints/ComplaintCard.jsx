import { Link } from 'react-router-dom';

const ComplaintCard = ({ complaint }) => {
  const dateStr = new Date(complaint.createdAt).toLocaleDateString();
  
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
    assigned: 'bg-purple-100 text-purple-800 border-purple-200',
    in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
  };

  const priorityColors = {
    low: 'text-sage-700 bg-sage-100',
    medium: 'text-orange-700 bg-orange-100',
    high: 'text-red-700 bg-red-100',
    critical: 'text-red-900 bg-red-200 font-bold',
  };

  const sColor = statusColors[complaint.status] || statusColors.pending;
  const pColor = priorityColors[complaint.priority] || priorityColors.low;

  return (
    <Link to={`/complaints/${complaint._id}`} className="block transition-transform hover:-translate-y-1">
      <div className="card hover:border-sage-400">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-dark-50 tracking-wider">
            {complaint.complaintNumber}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded border capitalize ${sColor}`}>
            {complaint.status.replace('_', ' ')}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-dark mb-1 truncate" title={complaint.title}>
          {complaint.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-3 text-xs">
          <span className="capitalize text-dark-50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-400"></span>
            {complaint.category}
          </span>
          <span className={`px-1.5 py-0.5 rounded capitalize ${pColor}`}>
            {complaint.priority}
          </span>
          <span className="text-dark-50 ml-auto">
            {dateStr}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ComplaintCard;
