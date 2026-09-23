import React, { useState, useEffect, useMemo } from 'react';
import bannerPosterImg from './assets/images/key_to_my_rock_1790175098962.jpg';
import {
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Search,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  LogOut,
  FileText,
  Smartphone,
  Zap,
  X,
  ChevronRight,
  Send,
  MessageSquare,
  QrCode,
  Heart,
  Calendar,
  MapPin,
  Clock,
  Mail,
  Guitar,
  Copy,
  Check,
  ExternalLink,
  History,
  Radio
} from 'lucide-react';

interface Member {
  id: string | number;
  name: string;
  initials: string;
  badge: 'Platinum VIP' | 'Gold Fan' | 'Diamond VIP' | 'Backstage Pass' | 'Tour Insider' | 'Founding Fan';
  joinDate: string;
  city: string;
}

interface TourEvent {
  id: string;
  tour: string;
  city: string;
  venue: string;
  date: string;
  type: 'upcoming' | 'past';
  status: 'Selling Fast' | 'VIP Available' | 'Almost Sold Out' | 'Presale Live' | 'Historic Record' | 'Sold Out Landmark';
  specialGuests: string;
  attendance?: string;
}

interface ChatMessage {
  id: string;
  author: string;
  city: string;
  badge: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
}

interface MemberProfile {
  name: string;
  initials: string;
  memberId: string;
  since: string;
  points: number;
  badge: Member['badge'];
  city: string;
  role: string;
}

// Persistent Storage Utility
const storage = {
  get: <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`kr_vip_v3_${key}`);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set: <T,>(key: string, val: T): void => {
    try {
      localStorage.setItem(`kr_vip_v3_${key}`, JSON.stringify(val));
    } catch {
      // Storage full or unavailable
    }
  }
};

const PAST_AND_UPCOMING_EVENTS: TourEvent[] = [
  // Upcoming 2026 Tour Dates
  {
    id: 't-1',
    tour: 'Rock the Country 2026 Tour',
    city: 'Nashville, TN',
    venue: 'Nissan Stadium & Big Ass Honky Tonk Takeover',
    date: 'MAY 15 - 16, 2026',
    type: 'upcoming',
    status: 'VIP Available',
    specialGuests: 'Jason Aldean, Brantley Gilbert, Travis Tritt'
  },
  {
    id: 't-2',
    tour: 'Detroit Homecoming Celebration',
    city: 'Detroit, MI',
    venue: 'Little Caesars Arena (2-Night Residency)',
    date: 'JUNE 12 - 13, 2026',
    type: 'upcoming',
    status: 'Selling Fast',
    specialGuests: 'Hometown Special Guests'
  },
  {
    id: 't-3',
    tour: 'Rock the Country Festival',
    city: 'Anderson, SC',
    venue: 'Anderson Sports & Entertainment Center',
    date: 'JULY 24 - 25, 2026',
    type: 'upcoming',
    status: 'Almost Sold Out',
    specialGuests: 'Hank Williams Jr., Lee Greenwood'
  },
  {
    id: 't-4',
    tour: 'Freedom & Country Stadium Fest',
    city: 'Dallas, TX',
    venue: 'AT&T Stadium Outdoor Plaza Arena',
    date: 'AUGUST 21, 2026',
    type: 'upcoming',
    status: 'Presale Live',
    specialGuests: 'Big & Rich, Gretchen Wilson'
  },
  // Iconic Past Landmark Shows
  {
    id: 't-past-1',
    tour: 'Pine Knob 10-Night Historic Run',
    city: 'Clarkston, MI',
    venue: 'Pine Knob Music Theatre (Sold Out)',
    date: 'HISTORIC RUN',
    type: 'past',
    status: 'Historic Record',
    attendance: '150,000+ Fans',
    specialGuests: 'Uncle Kracker, Twisted Brown Trucker Band'
  },
  {
    id: 't-past-2',
    tour: 'Rock the South Festival',
    city: 'Cullman, AL',
    venue: 'Heritage Park Outdoor Amp',
    date: 'SUMMER ARCHIVE',
    type: 'past',
    status: 'Sold Out Landmark',
    attendance: '65,000+ Fans',
    specialGuests: 'Lynyrd Skynyrd, Jamey Johnson'
  },
  {
    id: 't-past-3',
    tour: 'Billy Bob\'s Texas 2-Night Residency',
    city: 'Fort Worth, TX',
    venue: 'Billy Bob\'s Texas',
    date: 'ACOUSTIC & ELECTRIC',
    type: 'past',
    status: 'Sold Out Landmark',
    attendance: 'Full Arena Capacity',
    specialGuests: 'Special Storyteller Acoustic Set'
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm-1',
    author: 'Colt Montgomery',
    city: 'Nashville, TN',
    badge: 'Platinum VIP',
    text: "Heard the acoustic preview of 'Key to My Rock' at the private soundcheck in Nashville. Unbelievable feeling—he wrote it for someone truly special and you can feel every chord.",
    time: '3m ago',
    likes: 42,
    isLiked: true
  },
  {
    id: 'm-2',
    author: 'Savannah Drake',
    city: 'Detroit, MI',
    badge: 'Diamond VIP',
    text: "Pine Knob & Little Caesars Arena shows are going to be wild! Anyone else doing the full 2-night VIP pit pass in Detroit this June?",
    time: '8m ago',
    likes: 29,
    isLiked: false
  },
  {
    id: 'm-3',
    author: 'Travis Callahan',
    city: 'Fort Worth, TX',
    badge: 'Backstage Pass',
    text: "'Key to My Rock' combines that soulful Southern rock storytelling with Detroit grit. Hands down going to be his biggest anthem yet.",
    time: '14m ago',
    likes: 38,
    isLiked: false
  }
];

const QUICK_PROMPTS = [
  "🎸 'Key to My Rock' sounds like an instant classic!",
  "🎟️ Who is hitting the Detroit Homecoming arena shows?",
  "🔥 The Nashville stadium tailgate is going to be massive!",
  "🤠 Born Free & Key to My Rock back to back live!"
];

const MEMBER_NAMES = [
  'Colt Montgomery', 'Savannah Drake', 'Travis Callahan', 'Garrett Vance',
  'Sierra Miller', 'Wyatt Stone', 'Cheyenne Reed', 'Austin Hayes',
  'Dakota Cross', 'Boone Walker', 'Mackenzie Cole', 'Brody Dalton',
  'Kallie Brooks', 'Hunter Sterling', 'Shelby Lawson'
];
const MEMBER_CITIES = [
  'Nashville, TN', 'Detroit, MI', 'Dallas, TX', 'Atlanta, GA',
  'Charlotte, NC', 'Kansas City, MO', 'Tampa, FL', 'Cleveland, OH',
  'Houston, TX', 'Louisville, KY'
];
const BADGES: Member['badge'][] = [
  'Platinum VIP', 'Gold Fan', 'Diamond VIP', 'Backstage Pass',
  'Tour Insider', 'Founding Fan'
];

export default function App() {
  // PERSISTENT DATA LAYER
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    storage.get('auth', false)
  );

  const [currentMember, setCurrentMember] = useState<MemberProfile>(() =>
    storage.get('member', {
      name: 'Jordan Vance',
      initials: 'JV',
      memberId: 'TDR-2603-KR',
      since: '2022',
      points: 4850,
      badge: 'Platinum VIP',
      city: 'Detroit / Nashville',
      role: 'Inner Circle VIP'
    })
  );

  const [isAccountActive, setIsAccountActive] = useState<boolean>(() =>
    storage.get('active', false)
  );

  const [isSubscribedToSong, setIsSubscribedToSong] = useState<boolean>(() =>
    storage.get('subscribed_song', false)
  );

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    storage.get('chat_messages', INITIAL_CHAT_MESSAGES)
  );

  const [selectedTour, setSelectedTour] = useState<TourEvent>(() => {
    const savedId = storage.get('selected_tour_id', 't-1');
    return (
      PAST_AND_UPCOMING_EVENTS.find(e => e.id === savedId) ||
      PAST_AND_UPCOMING_EVENTS[0]
    );
  });

  // UI States
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [eventTab, setEventTab] = useState<'upcoming' | 'past'>('upcoming');

  const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);
  const [isActivateModalOpen, setIsActivateModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isVerificationCertOpen, setIsVerificationCertOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [memberSearch, setMemberSearch] = useState<string>('');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState<string>('All');
  const [newChatText, setNewChatText] = useState<string>('');

  // Voice Assistant Settings (Speaks only key milestones)
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Card 3D tilt & flip
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Sync to persistent storage whenever key states update
  useEffect(() => {
    storage.set('auth', isAuthenticated);
  }, [isAuthenticated]);

  useEffect(() => {
    storage.set('member', currentMember);
  }, [currentMember]);

  useEffect(() => {
    storage.set('active', isAccountActive);
  }, [isAccountActive]);

  useEffect(() => {
    storage.set('subscribed_song', isSubscribedToSong);
  }, [isSubscribedToSong]);

  useEffect(() => {
    storage.set('chat_messages', chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    storage.set('selected_tour_id', selectedTour.id);
  }, [selectedTour]);

  // Check URL query parameters for instant credential verification page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verify') === 'pass') {
      setIsVerificationCertOpen(true);
    }
  }, []);

  // Directory of Fans
  const [members] = useState<Member[]>(() => {
    const list: Member[] = [];
    for (let i = 0; i < 500; i++) {
      const name = MEMBER_NAMES[i % MEMBER_NAMES.length] + (i > 14 ? ` #${i + 10}` : '');
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
      list.push({
        id: `M-${2000 + i}`,
        name,
        initials,
        badge: BADGES[i % BADGES.length],
        city: MEMBER_CITIES[i % MEMBER_CITIES.length],
        joinDate: `${(i % 12) + 1}h ago`
      });
    }
    return list;
  });

  const [recentNewMembers] = useState<Member[]>([
    { id: 'rm-1', name: 'Colt Montgomery', initials: 'CM', badge: 'Platinum VIP', city: 'Nashville, TN', joinDate: 'Just now' },
    { id: 'rm-2', name: 'Savannah Drake', initials: 'SD', badge: 'Diamond VIP', city: 'Detroit, MI', joinDate: '5m ago' },
    { id: 'rm-3', name: 'Travis Callahan', initials: 'TC', badge: 'Backstage Pass', city: 'Dallas, TX', joinDate: '11m ago' },
    { id: 'rm-4', name: 'Garrett Vance', initials: 'GV', badge: 'Tour Insider', city: 'Atlanta, GA', joinDate: '24m ago' }
  ]);

  // Web Audio Synthesizer for feedback
  const playGuitarChime = (freq = 440, type: OscillatorType = 'triangle', duration = 0.25) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // safe fallback
    }
  };

  // Speaks ONLY key moments
  const speakKeyUpdate = (text: string) => {
    setToastMessage(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3800);

    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch {
      // safe fallback
    }
  };

  // Strict Login Check: Only 2603 is accepted
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pin = pinInput.trim();

    if (pin === '2603') {
      playGuitarChime(587.33, 'triangle', 0.3);
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
      setTimeout(() => {
        speakKeyUpdate('Access granted. Welcome to the Kid Rock VIP Fan Portal.');
      }, 400);
    } else {
      playGuitarChime(220, 'sawtooth', 0.25);
      setIsShaking(true);
      setPinError('Access Denied. Security code is incorrect.');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  const handleLogout = () => {
    playGuitarChime(330, 'sine', 0.15);
    setIsAuthenticated(false);
    speakKeyUpdate('Session locked. Portal access closed.');
  };

  // Instant Activation
  const handleActivateAccount = () => {
    playGuitarChime(880, 'sine', 0.35);
    setIsAccountActive(true);
    setCurrentMember(prev => ({
      ...prev,
      points: prev.points + 500,
      badge: 'Diamond VIP' as const
    }));
    setIsActivateModalOpen(false);
    speakKeyUpdate('VIP status verified. Welcome to the Kid Rock Inner Circle.');
  };

  // Handle Subscribe to "Key to My Rock"
  const handleSubscribeKeyToMyRock = () => {
    playGuitarChime(784, 'triangle', 0.3);
    setIsSubscribedToSong(true);
    setCurrentMember(prev => ({
      ...prev,
      points: prev.points + 250
    }));

    // Open direct email composition to org.topdawgrecords@gmail.com
    const subject = encodeURIComponent("VIP Master Streaming Subscription - 'Key to My Rock' by Kid Rock");
    const body = encodeURIComponent(
      `Hello Kid Rock VIP Management,\n\nI would like to subscribe to full exclusive streaming access for Kid Rock's new song 'Key to My Rock' and receive the private master audio link.\n\nMember Name: ${currentMember.name}\nMember ID: ${currentMember.memberId}\nRegion: ${currentMember.city}\nVIP Points: ${currentMember.points + 250}\n\nThank you!`
    );
    const mailtoUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=org.topdawgrecords@gmail.com&su=${subject}&body=${body}`;

    window.open(mailtoUrl, '_blank', 'noopener,noreferrer');
    speakKeyUpdate("Subscription initiated. Opening VIP support request at org.topdawgrecords@gmail.com.");
  };

  // Real-time simulated fan chat updates
  useEffect(() => {
    if (!isAuthenticated) return;

    const fanRemarks = [
      { author: 'Boone Walker', city: 'Dallas, TX', badge: 'Tour Insider', text: "Kid Rock said on radio that 'Key to My Rock' is the most personal track he's written in ten years. The acoustic bridge gives you chills." },
      { author: 'Sierra Miller', city: 'Charlotte, NC', badge: 'Gold Fan', text: "Just locked in two pit passes for the Rock the Country tour! Who is tailgating early with the flags?" },
      { author: 'Wyatt Stone', city: 'Louisville, KY', badge: 'Founding Fan', text: "The Detroit sound meets Nashville soul in Key to My Rock. You can hear that gritty Les Paul tone all over the chorus." },
      { author: 'Cheyenne Reed', city: 'Kansas City, MO', badge: 'Platinum VIP', text: "Support email confirmed my soundcheck wristband for May 16! Make sure you activate your account to get the presale access." },
      { author: 'Hunter Sterling', city: 'Atlanta, GA', badge: 'Diamond VIP', text: "Still remember seeing him tear down Pine Knob in 2019. Nobody puts on a rock show with more heart and energy." }
    ];

    const interval = setInterval(() => {
      const pick = fanRemarks[Math.floor(Math.random() * fanRemarks.length)];
      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        author: pick.author,
        city: pick.city,
        badge: pick.badge,
        text: pick.text,
        time: 'Just now',
        likes: Math.floor(Math.random() * 8) + 1
      };

      setChatMessages(prev => [newMsg, ...prev.slice(0, 14)]);
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Post comment to live fan chat
  const handlePostChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    playGuitarChime(659.25, 'triangle', 0.1);
    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      author: currentMember.name,
      city: currentMember.city,
      badge: currentMember.badge,
      text: newChatText.trim(),
      time: 'Just now',
      likes: 1
    };

    setChatMessages(prev => [newMsg, ...prev.slice(0, 14)]);
    setNewChatText('');
  };

  // Like a chat comment
  const handleLikeChat = (id: string) => {
    playGuitarChime(880, 'sine', 0.08);
    setChatMessages(prev =>
      prev.map(m => (m.id === id ? { ...m, isLiked: !m.isLiked, likes: m.likes + (m.isLiked ? -1 : 1) } : m))
    );
  };

  // 3D Card Parallax
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setCardRotation({
      x: ((y - centerY) / centerY) * -10,
      y: ((x - centerX) / centerX) * 10
    });
  };

  // Generate realistic confirmation link
  const verificationUrl = `${window.location.origin}/?verify=pass&id=${encodeURIComponent(currentMember.memberId)}&name=${encodeURIComponent(currentMember.name)}&tier=${encodeURIComponent(currentMember.badge)}&status=${isAccountActive ? 'ACTIVE' : 'PENDING'}`;
  const realisticQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(verificationUrl)}&color=000000&bgcolor=ffffff&margin=8`;

  const handleCopyVerificationUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopiedLink(true);
      playGuitarChime(880, 'sine', 0.15);
      setTimeout(() => setCopiedLink(false), 2400);
      speakKeyUpdate('Verification link copied to clipboard.');
    }
  };

  // High-Res VIP Pass PNG Export
  const handleExportPNG = () => {
    playGuitarChime(784, 'sine', 0.15);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 1200, 700);
    bg.addColorStop(0, '#0a0d16');
    bg.addColorStop(0.5, '#141829');
    bg.addColorStop(1, '#080a10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 700);

    ctx.save();
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 40;
    ctx.strokeStyle = '#FFD966';
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, 1100, 600);
    ctx.restore();

    ctx.fillStyle = '#FFD966';
    ctx.font = 'bold 44px Inter, sans-serif';
    ctx.fillText('KID ROCK · OFFICIAL VIP PASS', 100, 150);

    ctx.fillStyle = '#a0a6c4';
    ctx.font = '600 22px Inter, sans-serif';
    ctx.fillText("EXCLUSIVE FAN MEMBERSHIP & SOUNDCHECK CREDENTIAL", 100, 195);

    ctx.fillStyle = '#FFD966';
    ctx.fillRect(100, 220, 1000, 3);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(currentMember.name, 100, 325);

    ctx.fillStyle = '#FFD966';
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillText(`#${currentMember.memberId}`, 100, 395);

    ctx.fillStyle = isAccountActive ? '#4ade80' : '#ff7b7b';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(isAccountActive ? '● STATUS: VERIFIED VIP' : '○ STATUS: PENDING ACTIVATION', 100, 455);

    ctx.fillStyle = '#FFE599';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(`TIER: ${currentMember.badge.toUpperCase()} · HOMETOWN: ${currentMember.city}`, 100, 505);

    ctx.fillStyle = '#d4af37';
    ctx.fillRect(940, 110, 140, 95);

    const link = document.createElement('a');
    link.download = `KidRock_VIP_Pass_${currentMember.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    speakKeyUpdate('Kid Rock VIP Pass exported as high-resolution image.');
  };

  // Apple Wallet Pass export
  const handleExportWallet = () => {
    playGuitarChime(659, 'sine', 0.15);
    const passData = {
      passType: 'Kid Rock Official VIP Pass',
      member: currentMember.name,
      id: currentMember.memberId,
      tier: currentMember.badge,
      city: currentMember.city,
      status: isAccountActive ? 'ACTIVE VIP' : 'PENDING'
    };
    const blob = new Blob([JSON.stringify(passData, null, 2)], { type: 'application/vnd.apple.pkpass' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KidRock_Pass_${currentMember.name.replace(/\s+/g, '_')}.pkpass`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    speakKeyUpdate('Apple Wallet pass downloaded.');
  };

  // Certificate Document
  const handleExportDoc = () => {
    playGuitarChime(523, 'sine', 0.15);
    const doc = `=====================================================
KID ROCK · OFFICIAL VIP MEMBERSHIP CERTIFICATE
=====================================================

Member Name    : ${currentMember.name}
Credential ID  : ${currentMember.memberId}
Membership     : ${currentMember.badge}
Fan Region     : ${currentMember.city}
Status         : ${isAccountActive ? 'VERIFIED ACTIVE VIP' : 'PENDING ACTIVATION'}
Fan Points     : ${currentMember.points.toLocaleString()}
Enrolled Since : ${currentMember.since}

This official document certifies active enrollment in the 
Kid Rock VIP Fan Network with priority presales, advance tour 
tickets, and private soundcheck listening party access.

Official Inquiries: org.topdawgrecords@gmail.com
Timestamp         : ${new Date().toISOString()}
=====================================================`;
    const blob = new Blob([doc], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KidRock_VIP_Certificate_${currentMember.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    speakKeyUpdate('Official VIP Certificate downloaded.');
  };

  // Filtered members for directory modal
  const filteredMembersList = useMemo(() => {
    const q = memberSearch.toLowerCase().trim();
    return members.filter(m => {
      const matchText = !q || m.name.toLowerCase().includes(q) || m.city.toLowerCase().includes(q);
      const matchBadge = selectedBadgeFilter === 'All' || m.badge === selectedBadgeFilter;
      return matchText && matchBadge;
    });
  }, [members, memberSearch, selectedBadgeFilter]);

  // Filtered Events
  const displayedEvents = useMemo(() => {
    return PAST_AND_UPCOMING_EVENTS.filter(e => e.type === eventTab);
  }, [eventTab]);

  return (
    <div className="min-h-screen bg-[#07090f] text-[#f0f2ff] relative overflow-x-hidden flex items-center justify-center p-2 sm:p-4 md:p-6 font-['Inter',sans-serif]">
      {/* Background Ambient Glows */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none ambient-blob" />
      <div className="fixed -bottom-24 -right-24 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none ambient-blob" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Voice Assistant Toast */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        } bg-gradient-to-r from-[#FFE599] via-[#FFD966] to-[#E6B422] text-[#0a0c14] font-bold text-xs sm:text-sm border-amber-300`}
      >
        <Volume2 className="w-4 h-4 text-black shrink-0 animate-bounce" />
        <span className="max-w-[70vw] truncate">{toastMessage}</span>
      </div>

      {!isAuthenticated ? (
        /* ================= AUTHENTICATION ACCESS SCREEN ================= */
        <div className="w-full max-w-md mx-auto relative z-10 p-4">
          <div
            className={`rainbow-glow-card p-8 sm:p-10 text-center relative overflow-hidden transition-transform shadow-2xl shadow-black/90 ${
              isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
            }`}
          >
            {/* Logo Emblem */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#2a3048] to-[#141724] rounded-2xl flex items-center justify-center border border-[#FFD966]/40 shadow-lg shadow-black/80 transition-transform hover:scale-105">
              <Guitar className="w-10 h-10 text-[#FFD966] filter drop-shadow-[0_0_12px_rgba(255,217,102,0.8)]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#FFE599] via-[#FFD966] to-[#E6B422] bg-clip-text text-transparent mb-1">
              Top Dog Records
            </h1>
            <div className="text-xs font-mono uppercase tracking-widest text-[#FFD966] mb-2 font-bold">
              Kid Rock VIP Fan Portal
            </div>
            <p className="text-xs sm:text-sm text-[#a0a6c4] mb-8 font-normal">
              Enter authorized 4-digit security code to access VIP tour dates, exclusive single access, and verified community stream.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Key className="w-5 h-5 text-[#5e6480] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="ENTER 4-DIGIT ACCESS PIN"
                  maxLength={4}
                  autoFocus
                  className="w-full bg-[#07090f]/80 border border-[#2a2f44] focus:border-[#FFD966] rounded-full py-4 pl-12 pr-4 text-center font-mono font-bold tracking-widest text-lg text-[#f0f2ff] placeholder:text-[#414659] placeholder:tracking-normal placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-[#FFD966]/40 transition-all shadow-inner"
                />
              </div>

              {pinError && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-b from-[#FFE599] via-[#FFD966] to-[#E6B422] hover:brightness-110 active:scale-[0.99] text-[#0a0c14] font-extrabold py-4 px-6 rounded-full shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 text-sm tracking-wide cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-black" />
                <span>Verify & Enter Portal</span>
              </button>
            </form>

            {/* Clean bottom security badge without displaying the access code */}
            <div className="mt-8 pt-5 border-t border-[#2e3348]/60 flex items-center justify-center gap-2 text-xs text-[#5e6480]">
              <Lock className="w-3.5 h-3.5 text-[#FFD966]" />
              <span>Encrypted 256-bit VIP Access Verification</span>
            </div>
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED DASHBOARD ================= */
        <div className="w-full max-w-[1360px] bg-gradient-to-b from-[#141724]/95 to-[#0c0e17]/95 backdrop-blur-3xl rounded-3xl border border-[#FFD966]/20 shadow-2xl shadow-black/95 p-4 sm:p-6 md:p-8 relative z-10 flex flex-col gap-6">
          
          {/* INACTIVE / ACTIVE VIP STATUS BANNER */}
          <div
            className={`rounded-2xl p-4 sm:px-6 transition-all duration-500 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isAccountActive
                ? 'bg-gradient-to-r from-emerald-950/40 via-[#0a1f14]/50 to-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-gradient-to-r from-rose-950/40 via-[#1e0a0d]/50 to-rose-950/40 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              {isAccountActive ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 animate-pulse" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 animate-bounce" />
              )}
              <div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2 flex-wrap">
                  <span>{isAccountActive ? 'Kid Rock Inner Circle VIP · Fully Activated' : 'Account Status: Pending VIP Activation'}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase ${
                    isAccountActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {isAccountActive ? 'Synchronized Live' : 'Action Required'}
                  </span>
                </div>
                <p className="text-xs opacity-80 mt-0.5">
                  {isAccountActive
                    ? 'Tour presales unlocked, backstage pass verification verified, and private audio stems available.'
                    : 'Activate your membership now to unlock tour soundcheck registration and 500 bonus fan points.'}
                </p>
              </div>
            </div>

            {!isAccountActive ? (
              <button
                type="button"
                onClick={() => setIsActivateModalOpen(true)}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Activate VIP Now</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active VIP Access</span>
              </div>
            )}
          </div>

          {/* TOP BAR / BRAND HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2e3348]/60 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2a3048] to-[#141724] rounded-2xl flex items-center justify-center border border-[#FFD966]/40 shadow-md">
                <Guitar className="w-6 h-6 text-[#FFD966]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                  <span>Kid Rock</span>
                  <span className="text-[#FFD966]">VIP Portal</span>
                  <span className="text-[10px] bg-[#FFD966]/15 text-[#FFD966] font-mono px-2 py-0.5 rounded-full border border-[#FFD966]/30">
                    TOP DOG RECORDS
                  </span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#a0a6c4] flex-wrap">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-mono text-emerald-400 font-semibold">Live Member Network</span>
                  <span>•</span>
                  <span>Rock the Country 2026 Headliner Tour</span>
                </div>
              </div>
            </div>

            {/* Header Controls: Voice Toggle & Exit */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const next = !voiceEnabled;
                  setVoiceEnabled(next);
                  playGuitarChime(next ? 880 : 330, 'sine', 0.15);
                  if (next) speakKeyUpdate('Voice announcements enabled.');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                  voiceEnabled
                    ? 'bg-[#1c1f30] text-[#f0f2ff] border-[#FFD966]/40 hover:border-[#FFD966]'
                    : 'bg-[#141724] text-[#5e6480] border-[#2e3348]'
                }`}
                title="Toggle Voice Announcements"
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="w-4 h-4 text-[#FFD966]" />
                    <span>Voice On</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-[#5e6480]" />
                    <span>Voice Off</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
                title="Lock Session and Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock / Exit</span>
              </button>
            </div>
          </div>

          {/* ================= TOP SECTION: PAST & UPCOMING EVENTS + LIVE FAN CONVERSATION ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: PAST & UPCOMING EVENTS & SHOWS (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="gold-sunset-card p-5 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#FFD966]" />
                    <h3 className="font-extrabold text-base sm:text-lg text-white">
                      Past & Upcoming Events & Shows
                    </h3>
                  </div>

                  {/* Tabs: Upcoming 2026 vs Historic Past */}
                  <div className="flex items-center gap-1.5 bg-[#0c0e17] p-1 rounded-xl border border-[#2e3348]">
                    <button
                      type="button"
                      onClick={() => setEventTab('upcoming')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        eventTab === 'upcoming'
                          ? 'bg-[#FFD966] text-black shadow'
                          : 'text-[#a0a6c4] hover:text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Upcoming 2026 Tour</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventTab('past')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        eventTab === 'past'
                          ? 'bg-[#FFD966] text-black shadow'
                          : 'text-[#a0a6c4] hover:text-white'
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>Landmark Past Shows</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {displayedEvents.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTour(t)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedTour.id === t.id
                          ? 'bg-[#1e2338] border-[#FFD966] shadow-md shadow-amber-500/10'
                          : 'bg-[#151827]/70 border-[#2e3348] hover:border-[#FFD966]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#FFD966] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{t.city}</span>
                          </span>
                          <span className="text-xs text-white/50 font-normal">· {t.tour}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.status === 'VIP Available' || t.status === 'Historic Record'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-black text-sm sm:text-base text-white">{t.venue}</h4>
                      <div className="text-xs text-[#a0a6c4] mt-1 font-semibold flex items-center gap-3 flex-wrap">
                        <span>{t.date}</span>
                        {t.attendance && (
                          <span className="text-[#FFD966] font-mono">Attendance: {t.attendance}</span>
                        )}
                      </div>
                      <div className="text-xs text-[#5e6480] mt-1">Special Guests: {t.specialGuests}</div>
                    </div>
                  ))}
                </div>

                {/* Event Inquiry CTA */}
                <div className="mt-4 pt-3 border-t border-[#2e3348]/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs text-[#a0a6c4]">
                    Selected: <span className="font-bold text-white">{selectedTour.venue} ({selectedTour.city})</span>
                  </div>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=org.topdawgrecords@gmail.com&su=${encodeURIComponent(
                      `VIP Ticket & Soundcheck Request - ${selectedTour.tour} (${selectedTour.city})`
                    )}&body=${encodeURIComponent(
                      `Hello Kid Rock VIP Management,\n\nI would like to request soundcheck and VIP pit credentials for ${selectedTour.venue} (${selectedTour.city}) on ${selectedTour.date}.\n\nMember: ${currentMember.name}\nCredential ID: ${currentMember.memberId}\nRegion: ${currentMember.city}\n\nThank you!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#FFD966] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request VIP Pit Credentials</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* COLUMN 2: REAL-TIME ENGAGING FAN CHAT (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rainbow-glow-card p-5 sm:p-6 shadow-lg flex flex-col h-full min-h-[440px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#FFD966]" />
                    <h3 className="font-extrabold text-base text-white">Live VIP Fan Wall</h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    PERSISTENT MEMORY
                  </span>
                </div>

                <p className="text-xs text-[#a0a6c4] mb-3">
                  Join real-time fan discussions on tour sets, tailgate meetups, and the upcoming single.
                </p>

                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewChatText(prompt)}
                      className="px-2.5 py-1 rounded-lg bg-[#1c2035] hover:bg-[#282e4d] text-[11px] text-[#cdd1e6] whitespace-nowrap border border-[#2e3348] transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Scrollable messages with persistent likes and replies */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[260px]">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl bg-[#141727]/80 border border-[#2e3348]/60 hover:border-[#FFD966]/30 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{msg.author}</span>
                          <span className="text-[10px] text-[#FFD966] font-mono">({msg.city})</span>
                        </div>
                        <span className="text-[10px] text-[#5e6480]">{msg.time}</span>
                      </div>

                      <p className="text-[#cdd1e6] leading-relaxed break-words">{msg.text}</p>

                      <div className="mt-2 pt-1.5 border-t border-[#2e3348]/40 flex items-center justify-between">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#FFD966]/10 text-[#FFD966]">
                          {msg.badge}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleLikeChat(msg.id)}
                          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            msg.isLiked
                              ? 'text-rose-400 font-bold'
                              : 'text-[#a0a6c4] hover:text-rose-300'
                          }`}
                        >
                          <Heart className={`w-3 h-3 ${msg.isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
                          <span>{msg.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Post chat message */}
                <form onSubmit={handlePostChatMessage} className="mt-3 pt-3 border-t border-[#2e3348] flex gap-2">
                  <input
                    type="text"
                    value={newChatText}
                    onChange={e => setNewChatText(e.target.value)}
                    placeholder="Broadcast to persistent fan wall..."
                    maxLength={140}
                    className="flex-1 bg-[#0c0e17] border border-[#2e3348] focus:border-[#FFD966] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#5e6480] outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#FFD966] hover:bg-amber-300 text-black px-4 py-2.5 rounded-xl text-xs font-extrabold transition-transform active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>

          </div>

          {/* ================= MIDDLE OF THE PAGE: "KEY TO MY ROCK" BANNER SHOWCASE ================= */}
          <div className="rainbow-glow-card overflow-hidden relative shadow-2xl my-2 border border-[#FFD966]/40">
            {/* Background Graphic Poster Image with Vignette & Gradients */}
            <div className="relative w-full min-h-[440px] lg:min-h-[480px] flex flex-col justify-end p-6 sm:p-10 lg:p-12 overflow-hidden">
              
              {/* Background Poster Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: `url(${bannerPosterImg})` }}
              />

              {/* Layered cinematic overlays: dark gradient from bottom and left */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080a10]/95 via-[#080a10]/75 to-transparent" />

              {/* Floating ambient badge */}
              <div className="relative z-10 space-y-4 max-w-3xl">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#FFD966]/25 text-[#FFD966] text-xs font-black uppercase tracking-wider border border-[#FFD966]/60 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 text-[#FFD966]" />
                    <span>Soon to be Released Single</span>
                  </span>

                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500/25 text-rose-200 text-xs font-black uppercase tracking-wider border border-rose-500/50 backdrop-blur-md shadow-lg">
                    Dedicated VIP Master
                  </span>

                  {isSubscribedToSong && (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Subscribed Member Access</span>
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                    "Key to My Rock"
                  </h2>
                  <div className="text-xl sm:text-2xl font-black text-[#FFD966] mt-1 flex items-center gap-2 drop-shadow-md">
                    <span>by Kid Rock</span>
                    <span className="text-xs sm:text-sm text-[#a0a6c4] font-normal font-mono">· 24-Bit / 96kHz Lossless VIP Master</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base lg:text-lg text-[#e0e4fc] leading-relaxed max-w-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  A deeply emotional and heartfelt Southern rock anthem that blends raw Detroit electric grit with soulful acoustic resonance.
                  Kid Rock has shared that this upcoming single was written straight from the depths of his heart,{' '}
                  <span className="text-[#FFD966] font-extrabold underline decoration-[#FFD966]/60 underline-offset-4">
                    dedicated to someone he holds extraordinarily special in his personal life
                  </span>.
                </p>

                {/* Song Meta specifications */}
                <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#cdd1e6] flex-wrap pt-1 font-medium">
                  <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <Clock className="w-4 h-4 text-[#FFD966]" />
                    <span>Duration: 4:18</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <Guitar className="w-4 h-4 text-[#FFD966]" />
                    <span>Lead Guitar: Kenny Olson & Kid Rock</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <Award className="w-4 h-4 text-[#FFD966]" />
                    <span>Nashville Studio 5 Master</span>
                  </div>
                </div>

                {/* ONLY SUBSCRIBE BUTTON (Listen to Preview removed as requested) */}
                <div className="pt-3 flex items-center gap-4 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSubscribeKeyToMyRock}
                    className="bg-gradient-to-r from-[#FFE599] via-[#FFD966] to-[#E6B422] hover:brightness-110 active:scale-95 text-[#0a0c14] font-black py-4 px-8 rounded-full shadow-2xl shadow-amber-500/40 flex items-center gap-3 transition-transform text-sm sm:text-base cursor-pointer"
                  >
                    <Mail className="w-5 h-5 text-black" />
                    <span>{isSubscribedToSong ? 'Subscribed · Re-send VIP Access Email' : 'Subscribe Now to Full Track Master'}</span>
                  </button>

                  <span className="text-xs text-[#a0a6c4] font-medium bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    Direct VIP verification via <code className="text-[#FFD966] font-mono font-bold">org.topdawgrecords@gmail.com</code>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ================= BOTTOM SECTION: DIGITAL PASS CREDENTIAL + VERIFIED MEMBERS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: DIGITAL 3D CARD & EXPORT ACTIONS (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="gold-sunset-card p-5 sm:p-6 shadow-lg flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#FFD966]" />
                    <h3 className="font-extrabold text-base sm:text-lg text-white">Official VIP Digital Pass</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="text-xs text-[#a0a6c4] hover:text-[#FFD966] flex items-center gap-1.5 cursor-pointer bg-[#1c1f30] px-3 py-1.5 rounded-full border border-[#2e3348]"
                    title="View Realistic Scannable Venue QR Code"
                  >
                    <QrCode className="w-4 h-4 text-[#FFD966]" />
                    <span>Scan Venue QR</span>
                  </button>
                </div>

                {/* Badge & Points */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gradient-to-r from-amber-500/15 to-transparent border border-[#FFD966]/30 rounded-full px-4 py-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#FFD966]" />
                    <span className="font-extrabold text-xs sm:text-sm text-[#FFD966]">
                      {currentMember.badge}
                    </span>
                  </div>

                  <div className="bg-[#1c1f30] border border-[#2e3348] rounded-full px-4 py-2 flex items-center gap-1.5 text-xs text-[#a0a6c4]">
                    <span className="font-extrabold text-sm sm:text-base text-[#FFD966]">
                      {currentMember.points.toLocaleString()}
                    </span>
                    <span>pts</span>
                  </div>
                </div>

                {/* Interactive 3D Card with Tilt */}
                <div
                  className="perspective-1000 my-1 cursor-pointer select-none"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={() => setCardRotation({ x: 0, y: 0 })}
                  onClick={() => {
                    setIsFlipped(!isFlipped);
                    playGuitarChime(650, 'sine', 0.1);
                  }}
                  title="Click to flip pass"
                >
                  <div
                    className="relative w-full aspect-[1.58/1] rounded-2xl p-5 shadow-2xl transition-transform duration-300 preserve-3d holo-border"
                    style={{
                      transform: `rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y + (isFlipped ? 180 : 0)}deg)`
                    }}
                  >
                    {/* Front Face */}
                    <div
                      className={`absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-[#1b1f33] via-[#0f121d] to-[#07090f] p-5 flex flex-col justify-between backface-hidden overflow-hidden ${
                        isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <Guitar className="w-5 h-5 text-[#FFD966]" />
                          <span className="font-black text-xs tracking-widest text-white uppercase">
                            Kid Rock VIP Pass
                          </span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFD966]/20 text-[#FFD966] font-bold">
                          SOUNDCHECK
                        </span>
                      </div>

                      <div className="relative z-10">
                        <div className="text-xl sm:text-2xl font-black text-white tracking-wide">
                          {currentMember.name}
                        </div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-[#FFD966] tracking-wider mt-0.5">
                          #{currentMember.memberId}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-[#5e6480] mt-1 font-semibold">
                          Rock the Country 2026 · Valid Worldwide
                        </div>
                      </div>

                      <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10">
                        <div className="w-10 h-7 rounded bg-gradient-to-br from-[#ffd966] via-[#b38f2a] to-[#d4af37] border border-amber-300/40 shadow-inner flex items-center justify-center">
                          <div className="w-6 h-4 border border-black/20 rounded-sm" />
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold">
                          <span> Apple Wallet</span>
                        </div>
                      </div>
                    </div>

                    {/* Back Face */}
                    <div
                      className={`absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-[#10131e] to-[#07090f] p-5 flex flex-col justify-between backface-hidden overflow-hidden [transform:rotateY(180deg)] ${
                        !isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                      }`}
                    >
                      <div className="w-full h-8 bg-black/80 rounded my-1" />
                      <div className="space-y-1 text-center font-mono text-xs">
                        <div className="text-[#a0a6c4]">Official Kid Rock Fan Club Credential</div>
                        <div className="text-[#FFD966] font-bold">SECURITY: KR-2603-VIP-ACCESS</div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#5e6480] border-t border-[#2e3348] pt-2">
                        <span>Non-transferable</span>
                        <span>Click to flip back</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-[11px] text-[#5e6480]">
                  💡 Hover for 3D tilt · Click pass to flip
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleExportPNG}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#1c1f30] hover:bg-[#252a40] border border-[#2e3348] hover:border-[#FFD966]/40 text-xs font-bold text-[#f0f2ff] transition-all cursor-pointer"
                    title="Export High-Res PNG Pass"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FFD966]" />
                    <span>PNG Pass</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportWallet}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#1c1f30] hover:bg-[#252a40] border border-[#2e3348] hover:border-[#FFD966]/40 text-xs font-bold text-[#f0f2ff] transition-all cursor-pointer"
                    title="Download Apple Wallet Pass"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#FFD966]" />
                    <span>Wallet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDoc}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#1c1f30] hover:bg-[#252a40] border border-[#2e3348] hover:border-[#FFD966]/40 text-xs font-bold text-[#f0f2ff] transition-all cursor-pointer"
                    title="Download Certificate Document"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#FFD966]" />
                    <span>Certificate</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: VERIFIED MEMBERS DIRECTORY (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="cyber-emerald-card p-5 sm:p-6 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-sm sm:text-base text-white">Live Verified Fans</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMembersModalOpen(true)}
                    className="text-xs text-[#FFD966] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>Directory (500+)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {recentNewMembers.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#151827]/60 border border-[#2e3348]/40 text-xs hover:border-[#FFD966]/30 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#2a3048] to-[#141724] border border-[#FFD966]/30 flex items-center justify-center font-bold text-[#FFD966] text-xs shrink-0">
                          {m.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{m.name}</div>
                          <div className="text-[11px] text-[#a0a6c4] truncate">{m.city}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFD966]/10 text-[#FFD966] border border-[#FFD966]/20 shrink-0">
                        {m.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: REALISTIC SCANNABLE VENUE QR CODE & CONFIRMATION REDIRECT ================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#181c2d] to-[#0e1019] border border-[#FFD966]/40 rounded-3xl w-full max-w-sm p-6 sm:p-8 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 text-[#a0a6c4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-white mb-1">Official Venue Entry QR</h3>
            <p className="text-xs text-[#a0a6c4] mb-4">
              Scannable with any mobile phone camera to verify VIP status at venue gates and soundchecks.
            </p>

            {/* REALISTIC SCANNABLE QR CODE */}
            <div className="p-3 bg-white rounded-2xl inline-block shadow-2xl mb-3 border-4 border-[#FFD966]">
              <img
                src={realisticQrImgUrl}
                alt="Kid Rock Official VIP Pass QR Code"
                className="w-52 h-52 object-contain"
              />
            </div>

            <div className="font-mono text-xs font-bold text-[#FFD966] mb-1">
              #{currentMember.memberId}
            </div>
            <div className="text-xs text-white font-semibold mb-4">
              Credential Holder: {currentMember.name} ({currentMember.badge})
            </div>

            {/* Action Buttons to open confirmation or copy link */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsQrModalOpen(false);
                  setIsVerificationCertOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FFD966] hover:bg-amber-300 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Open Confirmation Page</span>
              </button>

              <button
                type="button"
                onClick={handleCopyVerificationUrl}
                className="w-full py-2 px-4 rounded-xl bg-[#1c1f30] hover:bg-[#252a40] text-xs font-semibold text-[#cdd1e6] border border-[#2e3348] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Verification URL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIVE CONFIRMATION & CREDENTIAL VERIFICATION PAGE ================= */}
      {isVerificationCertOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#161a29] to-[#0a0d16] border-2 border-[#FFD966] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-center">
            <button
              type="button"
              onClick={() => setIsVerificationCertOpen(false)}
              className="absolute top-4 right-4 text-[#a0a6c4] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-3xl">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">
              Live Verified Security Confirmation
            </div>
            <h3 className="text-2xl font-black text-white mb-1">
              VIP Pass Verification Approved
            </h3>
            <p className="text-xs text-[#a0a6c4] mb-5">
              Official verification record registered on the Top Dog Records concert security network.
            </p>

            <div className="bg-[#0c0f18] rounded-2xl p-4 border border-[#2e3348] text-left space-y-2 text-xs font-mono mb-6">
              <div className="flex justify-between border-b border-[#2e3348]/60 pb-1.5">
                <span className="text-[#5e6480]">HOLDER NAME</span>
                <span className="text-white font-bold">{currentMember.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#2e3348]/60 pb-1.5">
                <span className="text-[#5e6480]">MEMBER ID</span>
                <span className="text-[#FFD966] font-bold">#{currentMember.memberId}</span>
              </div>
              <div className="flex justify-between border-b border-[#2e3348]/60 pb-1.5">
                <span className="text-[#5e6480]">ACCESS TIER</span>
                <span className="text-white font-bold">{currentMember.badge}</span>
              </div>
              <div className="flex justify-between border-b border-[#2e3348]/60 pb-1.5">
                <span className="text-[#5e6480]">STATUS</span>
                <span className={isAccountActive ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {isAccountActive ? '● VERIFIED ACTIVE VIP' : '○ PENDING FINAL ACTIVATION'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#2e3348]/60 pb-1.5">
                <span className="text-[#5e6480]">SECURITY HASH</span>
                <span className="text-[#cdd1e6]">KR-9284-SECURE-TDR</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-[#5e6480]">VENUE PRIVILEGE</span>
                <span className="text-[#FFD966]">Pit Access & Soundcheck Registered</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsVerificationCertOpen(false)}
              className="w-full py-3 rounded-xl bg-[#FFD966] hover:bg-amber-300 text-black font-extrabold text-xs transition-colors cursor-pointer"
            >
              Close Confirmation Record
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: ALL MEMBERS DIRECTORY ================= */}
      {isMembersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#181c2d] to-[#0e1019] border border-[#FFD966]/30 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#2e3348] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#FFD966]" />
                <div>
                  <h3 className="font-extrabold text-lg text-white">Kid Rock VIP Member Directory</h3>
                  <p className="text-xs text-[#a0a6c4]">Official verified fan network across North America</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMembersModalOpen(false)}
                className="w-9 h-9 rounded-full bg-[#1c1f30] hover:bg-rose-500/20 text-[#a0a6c4] hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:px-6 bg-[#0c0e17]/60 border-b border-[#2e3348] flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5e6480] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Search members by name or city..."
                  className="w-full bg-[#141724] border border-[#2e3348] focus:border-[#FFD966] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-[#5e6480] outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Platinum VIP', 'Diamond VIP', 'Backstage Pass', 'Gold Fan'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedBadgeFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedBadgeFilter === tab
                        ? 'bg-[#FFD966] text-black'
                        : 'bg-[#1c1f30] text-[#a0a6c4] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-2 bg-[#121522] border-b border-[#2e3348] text-xs text-[#a0a6c4] flex items-center justify-between">
              <span>Showing {filteredMembersList.length} registered VIP fans</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Real-Time Network
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
              {filteredMembersList.slice(0, 80).map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#1c1f30]/40 hover:bg-[#1c1f30] border border-[#2e3348]/40 hover:border-[#FFD966]/20 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2a3048] to-[#141724] border border-[#FFD966]/30 flex items-center justify-center font-bold text-[#FFD966] text-xs shrink-0">
                      {m.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{m.name}</div>
                      <div className="text-xs text-[#a0a6c4] flex items-center gap-2">
                        <span>{m.city}</span>
                        <span>•</span>
                        <span className="text-[#5e6480]">{m.joinDate}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFD966]/10 text-[#FFD966] border border-[#FFD966]/20">
                    {m.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSTANT VIP ACCOUNT ACTIVATION ================= */}
      {isActivateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#181c2d] to-[#0e1019] border border-rose-500/40 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 text-3xl">
              ⚡
            </div>

            <h3 className="text-2xl font-black text-white mb-2">Activate Kid Rock VIP Status</h3>
            <p className="text-sm text-[#a0a6c4] mb-6 leading-relaxed">
              Activation immediately enables tour soundcheck registration, unlocks 500 bonus fan points, and validates your backstage digital pass.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleActivateAccount}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Activate VIP Status (+500 pts)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsActivateModalOpen(false)}
                className="w-full py-2.5 text-xs text-[#5e6480] hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
