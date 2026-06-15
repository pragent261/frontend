function svg(content: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content)}`;
}

// Sidebar logo — stylized "J" mark for 聚风
export const sidebarStar = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <rect width="24" height="24" rx="6" fill="#fb6011"/>
    <text x="12" y="17" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="white">聚</text>
  </svg>`
);

// Topbar banner — coins/reward icon
export const campaignBanner = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 29">
    <circle cx="15" cy="14.5" r="12" fill="#ffb84d"/>
    <circle cx="15" cy="14.5" r="9" fill="#ffa726"/>
    <text x="15" y="19" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="white">¥</text>
    <circle cx="43" cy="14.5" r="12" fill="#fb6011"/>
    <circle cx="43" cy="14.5" r="9" fill="#e65c00"/>
    <text x="43" y="19" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="white">+</text>
  </svg>`
);

// Top-right user avatar placeholder
export const topAvatar = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#e8e0f8"/>
    <circle cx="24" cy="19" r="9" fill="#c4aff0"/>
    <path d="M6 43c0-9.9 8.1-18 18-18s18 8.1 18 18z" fill="#c4aff0"/>
  </svg>`
);

// Empty-state illustration
export const emptyState = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 190">
    <rect x="30" y="65" width="130" height="95" rx="12" fill="#f5f5f5" stroke="#e8e8e8" stroke-width="2"/>
    <rect x="50" y="82" width="90" height="8" rx="4" fill="#e0e0e0"/>
    <rect x="50" y="98" width="65" height="8" rx="4" fill="#ebebeb"/>
    <rect x="50" y="114" width="75" height="8" rx="4" fill="#ebebeb"/>
    <path d="M60 55 L95 25 L130 55 Z" fill="#fb6011" opacity="0.12"/>
    <circle cx="95" cy="52" r="22" fill="#fff" stroke="#e8e8e8" stroke-width="2"/>
    <text x="95" y="59" font-family="Arial" font-size="20" text-anchor="middle" fill="#d9d9d9">✓</text>
    <rect x="65" y="148" width="60" height="8" rx="4" fill="#eeeeee"/>
  </svg>`
);

// Support tab avatar
export const supportAvatar = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 28">
    <circle cx="13" cy="11" r="7" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="1.5"/>
    <circle cx="13" cy="9" r="3.5" fill="white" opacity="0.85"/>
    <path d="M4 24c0-5 4.1-9 9-9s9 4 9 9z" fill="white" opacity="0.85"/>
  </svg>`
);

// Chat modal background (only used in ChatModal, not routed)
export const backgroundOverlay = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
    <rect width="1440" height="900" fill="#1a1a2e"/>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2d2b55"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </radialGradient>
    <rect width="1440" height="900" fill="url(#g)"/>
  </svg>`
);

// Chat contact avatars
export const avatarJane = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#7c3aed"/>
    <circle cx="24" cy="19" r="9" fill="rgba(255,255,255,0.75)"/>
    <path d="M6 43c0-9.9 8.1-18 18-18s18 8.1 18 18z" fill="rgba(255,255,255,0.75)"/>
  </svg>`
);

export const avatarAhmed = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#0891b2"/>
    <circle cx="24" cy="19" r="9" fill="rgba(255,255,255,0.75)"/>
    <path d="M6 43c0-9.9 8.1-18 18-18s18 8.1 18 18z" fill="rgba(255,255,255,0.75)"/>
  </svg>`
);
