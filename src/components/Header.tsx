import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img className="h-10 w-auto" src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/b7f8892a-250e-417a-ad23-8285bbf5ba9a/chupasys-logo-gp5yqhf-1764444847190.webp" alt="ChupaSys Logo" />
            <span className="text-2xl font-bold text-gray-800">ChupaSys</span>
          </Link>
        </div>
      </div>
    </header>
  );
}