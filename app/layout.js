import Navbar from '../components/Navbar';
import { LanguageProvider } from '../context/LanguageContext';
import './globals.css';

export const metadata = {
  title: 'Quiz Maker',
  description: 'Create and take quizzes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <LanguageProvider>
          <Navbar />
          <main className="container mx-auto p-6">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
