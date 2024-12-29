// components/Navbar.js
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-200">
          Quiz Maker
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-200">Home</Link>
          <Link href="/dashboard" className="hover:text-gray-200">Dashboard</Link>
          <Link href="/auth/login" className="hover:text-gray-200">Login</Link>
        </div>
      </div>
    </nav>
  );
}
