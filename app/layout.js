// app/layout.js
import Navbar from '../components/Navbar';
import './globals.css'; // Global styles for Tailwind

export const metadata = {
  title: 'Quiz Maker',
  description: 'Create and take quizzes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* Navbar is included here */}
        <Navbar />
        
        {/* Page content */}
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
