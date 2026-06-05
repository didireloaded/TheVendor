// ============================================
// THE VENDOR — Notifications Screen
// ============================================

import { icons, navigateTo, refreshIcons } from '../app.js';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'quote',
    title: 'New Quote Request',
    message: 'Sarah M. requested a quote for Wedding Photography.',
    time: '12 min ago',
    group: 'today',
    read: false,
    icon: 'file-text',
    color: 'var(--primary-500)',
    bgColor: 'var(--primary-50)',
  },
  {
    id: 'n2',
    type: 'review',
    title: 'New Review',
    message: 'Thomas K. left a 5-star review on your profile.',
    time: '1 hr ago',
    group: 'today',
    read: false,
    icon: 'star',
    color: 'var(--gold-500)',
    bgColor: 'var(--gold-50)',
  },
  {
    id: 'n3',
    type: 'milestone',
    title: 'Profile Milestone',
    message: 'Your profile reached 500 views this month!',
    time: '3 hrs ago',
    group: 'today',
    read: true,
    icon: 'eye',
    color: 'var(--purple-500)',
    bgColor: 'var(--purple-50)',
  },
  {
    id: 'n4',
    type: 'verification',
    title: 'Verification Approved',
    message: 'Congratulations! Your business has been verified.',
    time: 'Yesterday',
    group: 'yesterday',
    read: true,
    icon: 'badge-check',
    color: 'var(--success-500)',
    bgColor: 'var(--success-50)',
  },
  {
    id: 'n5',
    type: 'quote',
    title: 'Quote Reminder',
    message: 'David N. is waiting for your response on Corporate Event Photography.',
    time: 'Yesterday',
    group: 'yesterday',
    read: true,
    icon: 'clock',
    color: 'var(--warning-500)',
    bgColor: 'var(--warning-50)',
  },
  {
    id: 'n6',
    type: 'platform',
    title: 'Platform Update',
    message: 'The Vendor now supports business portfolio galleries. Update yours today!',
    time: '3 days ago',
    group: 'earlier',
    read: true,
    icon: 'megaphone',
    color: 'var(--text-secondary)',
    bgColor: 'var(--gray-50)',
  },
  {
    id: 'n7',
    type: 'review',
    title: 'New Review',
    message: 'Anna L. left a 4-star review with photos.',
    time: '5 days ago',
    group: 'earlier',
    read: true,
    icon: 'star',
    color: 'var(--gold-500)',
    bgColor: 'var(--gold-50)',
  },
];

export function renderNotificationsScreen(container) {
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
  const groups = {
    today: MOCK_NOTIFICATIONS.filter(n => n.group === 'today'),
    yesterday: MOCK_NOTIFICATIONS.filter(n => n.group === 'yesterday'),
    earlier: MOCK_NOTIFICATIONS.filter(n => n.group === 'earlier'),
  };

  container.innerHTML = `
    <div class="screen-notifications">
      <div class="notif-header">
        <button class="notif-back-btn" id="notif-back-btn">
          <i data-lucide="arrow-left"></i>
        </button>
        <h1 class="notif-title">Notifications</h1>
        ${unreadCount > 0 ? `<span class="notif-unread-badge">${unreadCount}</span>` : ''}
        <button class="notif-mark-read" id="notif-mark-all">Mark all read</button>
      </div>

      <div class="notif-list">
        ${renderNotifGroup('Today', groups.today)}
        ${renderNotifGroup('Yesterday', groups.yesterday)}
        ${renderNotifGroup('Earlier', groups.earlier)}
      </div>
    </div>
  `;

  // Back
  document.getElementById('notif-back-btn')?.addEventListener('click', () => {
    navigateTo('home');
  });

  // Mark all read
  document.getElementById('notif-mark-all')?.addEventListener('click', () => {
    MOCK_NOTIFICATIONS.forEach(n => n.read = true);
    renderNotificationsScreen(container);
  });

  // Individual notification clicks
  container.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.notifId;
      const notif = MOCK_NOTIFICATIONS.find(n => n.id === id);
      if (notif) {
        notif.read = true;
        item.classList.remove('unread');
        item.querySelector('.notif-unread-dot')?.remove();
      }
    });
  });

  refreshIcons();
}

function renderNotifGroup(label, items) {
  if (items.length === 0) return '';
  return `
    <div class="notif-group">
      <div class="notif-group-label">${label}</div>
      ${items.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
          <div class="notif-icon" style="background: ${n.bgColor}; color: ${n.color};">
            <i data-lucide="${n.icon}"></i>
          </div>
          <div class="notif-content">
            <div class="notif-item-title">${n.title}</div>
            <div class="notif-item-message">${n.message}</div>
            <div class="notif-item-time">${n.time}</div>
          </div>
          ${!n.read ? '<div class="notif-unread-dot"></div>' : ''}
        </div>
      `).join('')}
    </div>
  `;
}
