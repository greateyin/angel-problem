import './globals.css';
import Analytics from './components/Analytics';

export const metadata = {
  title: {
    default: 'Angel vs Demon - The Angel Problem Game',
    template: '%s | Angel vs Demon'
  },
  description: 'Experience John Conway\'s famous Angel Problem. Play as the Angel trying to escape to infinity, or the Demon trying to trap it forever. A mathematical strategy game.',
  keywords: ['Angel Problem', 'Game Theory', 'Math Game', 'John Conway', 'AI Simulation', 'Strategy Game', 'Mathematics'],
  authors: [{ name: 'Angel Game Team' }],
  creator: 'Angel Game Team',
  openGraph: {
    title: 'Angel vs Demon - Can You Escape to Infinity?',
    description: 'Play the interactive simulation of Conway\'s Angel Problem. Test your strategy against an AI Demon or challenge a friend.',
    url: 'https://angel-game.vercel.app', // Replace with actual URL if known, or keep generic
    siteName: 'Angel vs Demon Game',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Angel vs Demon Game - Mathematical Strategy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Angel vs Demon - The Angel Problem Game',
    description: 'Can the Angel escape the Demon\'s trap? Play the interactive math strategy game now.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
