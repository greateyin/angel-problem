import './globals.css';
import Analytics from './components/Analytics';

export const metadata = {
  title: 'Angel vs Demon Game',
  description: 'Interactive angel problem simulation with human/AI modes.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
