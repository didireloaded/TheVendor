// ============================================
// THE VENDOR — Chat List Screen
// ============================================

import { icons, navigateTo } from '../app.js';
import { renderChatConversation } from './chat-conversation.js';

// Mock Data for Chat List
const mockConversations = [
  {
    id: 'conv_1',
    vendorId: 'vendor_1',
    vendorName: 'VisionHaus Media',
    logoInitials: 'VH',
    logoGradient: 'linear-gradient(135deg, #1A6FEF, #0F2B4C)',
    verified: true,
    verifiedLevel: 'badge-blue',
    lastMessage: "Thanks for reaching out. We'll send your quote shortly.",
    timestamp: '10:42 AM',
    unreadCount: 2,
    onlineStatus: 'online',
    responseTime: 'Usually responds within 1 hour',
    type: 'quote'
  },
  {
    id: 'conv_2',
    vendorId: 'vendor_3',
    vendorName: 'Ondjamba Safaris',
    logoInitials: 'OS',
    logoGradient: 'linear-gradient(135deg, #D4A853, #8B6B23)',
    verified: true,
    verifiedLevel: 'badge-gold',
    lastMessage: 'Your booking for the 24th is confirmed. Here are the details...',
    timestamp: 'Yesterday',
    unreadCount: 0,
    onlineStatus: 'offline',
    responseTime: 'Highly Responsive',
    type: 'booking'
  },
  {
    id: 'conv_3',
    vendorId: 'vendor_5',
    vendorName: 'Windhoek Auto Masters',
    logoInitials: 'WA',
    logoGradient: 'linear-gradient(135deg, #EF4444, #991B1B)',
    verified: false,
    lastMessage: 'Yes, we can fix the brakes by tomorrow afternoon.',
    timestamp: 'Mon',
    unreadCount: 0,
    onlineStatus: 'offline',
    responseTime: 'Usually responds within 4 hours',
    type: 'general'
  }
];

export function renderChatScreen(container) {
  container.innerHTML = `
    <div class="screen-chat">
      <div class="chat-header" style="padding: var(--space-4) var(--space-4) 0; background: white; position: sticky; top: 0; z-index: 10;">
        <h1 style="font-size: var(--text-2xl); font-weight: 800; margin: 0 0 var(--space-3);">Messages</h1>
        
        <!-- Search Bar -->
        <div class="chat-search" style="position: relative; margin-bottom: var(--space-3);">
          <i data-lucide="search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray-400); width: 20px; height: 20px;"></i>
          <input type="text" placeholder="Search messages, vendors, or quotes..." style="width: 100%; padding: 12px 12px 12px 40px; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); background: var(--gray-50); font-size: var(--text-sm); transition: all 0.2s;" />
        </div>

        <!-- Filters -->
        <div class="chat-filters" style="display: flex; gap: var(--space-2); overflow-x: auto; padding-bottom: var(--space-3); scrollbar-width: none;">
          <button class="chat-filter-btn active" style="padding: 6px 14px; border-radius: 100px; background: var(--gray-900); color: white; border: none; font-size: var(--text-xs); font-weight: 500; white-space: nowrap;">All</button>
          <button class="chat-filter-btn" style="padding: 6px 14px; border-radius: 100px; background: var(--gray-100); color: var(--gray-700); border: none; font-size: var(--text-xs); font-weight: 500; white-space: nowrap;">Unread <span style="background: var(--primary-500); color: white; padding: 2px 6px; border-radius: 10px; font-size: 10px; margin-left: 4px;">2</span></button>
          <button class="chat-filter-btn" style="padding: 6px 14px; border-radius: 100px; background: var(--gray-100); color: var(--gray-700); border: none; font-size: var(--text-xs); font-weight: 500; white-space: nowrap;">Quotes</button>
          <button class="chat-filter-btn" style="padding: 6px 14px; border-radius: 100px; background: var(--gray-100); color: var(--gray-700); border: none; font-size: var(--text-xs); font-weight: 500; white-space: nowrap;">Bookings</button>
          <button class="chat-filter-btn" style="padding: 6px 14px; border-radius: 100px; background: var(--gray-100); color: var(--gray-700); border: none; font-size: var(--text-xs); font-weight: 500; white-space: nowrap;">Support</button>
        </div>
      </div>

      <div class="chat-list" style="padding: var(--space-2) var(--space-4); padding-bottom: 100px;">
        ${mockConversations.length > 0 ? mockConversations.map(conv => `
          <div class="chat-card" data-conv-id="${conv.id}" style="display: flex; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--gray-100); cursor: pointer; align-items: flex-start;">
            
            <div class="chat-avatar" style="position: relative; flex-shrink: 0;">
              <div style="width: 52px; height: 52px; border-radius: 50%; background: ${conv.logoGradient}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px;">
                ${conv.logoInitials}
              </div>
              ${conv.onlineStatus === 'online' ? `<div style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--success-500); border: 2px solid white;"></div>` : ''}
            </div>

            <div class="chat-content" style="flex-grow: 1; min-width: 0;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                <div class="chat-vendor-name" style="font-weight: 600; font-size: var(--text-md); color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px;">
                  ${conv.vendorName}
                  ${conv.verified ? `<span class="badge-verified ${conv.verifiedLevel}" style="transform: scale(0.8);">${icons.verifiedBadge}</span>` : ''}
                </div>
                <div class="chat-time" style="font-size: 11px; color: ${conv.unreadCount > 0 ? 'var(--primary-600)' : 'var(--gray-400)'}; font-weight: ${conv.unreadCount > 0 ? '600' : '400'}; white-space: nowrap;">
                  ${conv.timestamp}
                </div>
              </div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="chat-preview" style="font-size: var(--text-sm); color: ${conv.unreadCount > 0 ? 'var(--gray-900)' : 'var(--gray-500)'}; font-weight: ${conv.unreadCount > 0 ? '500' : '400'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: var(--space-2);">
                  ${conv.type === 'quote' ? `<i data-lucide="file-text" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px; color: var(--primary-500);"></i>` : ''}
                  ${conv.lastMessage}
                </div>
                ${conv.unreadCount > 0 ? `
                  <div class="chat-badge" style="background: var(--primary-500); color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;">
                    ${conv.unreadCount}
                  </div>
                ` : ''}
              </div>
            </div>

          </div>
        `).join('') : `
          <div class="empty-state" style="padding: 60px 20px; text-align: center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:80px;height:80px;color:var(--gray-300); margin: 0 auto 16px;">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3 style="font-size: 18px; font-weight: 600; color: var(--gray-900); margin-bottom: 8px;">No Conversations Yet</h3>
            <p style="color: var(--gray-500); font-size: 14px; margin-bottom: 24px;">Start chatting with vendors by requesting a quote, sending an inquiry, or booking a service.</p>
            <button class="btn btn-primary" id="chat-explore-btn">Explore Vendors</button>
          </div>
        `}
      </div>
    </div>
  `;

  // Filter clicks
  container.querySelectorAll('.chat-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      container.querySelectorAll('.chat-filter-btn').forEach(b => {
        b.style.background = 'var(--gray-100)';
        b.style.color = 'var(--gray-700)';
      });
      e.target.style.background = 'var(--gray-900)';
      e.target.style.color = 'white';
    });
  });

  // Open Chat
  container.querySelectorAll('.chat-card').forEach(card => {
    card.addEventListener('click', () => {
      const convId = card.dataset.convId;
      const convData = mockConversations.find(c => c.id === convId);
      renderChatConversation(convData);
    });
  });

  document.getElementById('chat-explore-btn')?.addEventListener('click', () => {
    navigateTo('explore');
  });
}
