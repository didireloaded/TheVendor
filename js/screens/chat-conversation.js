// ============================================
// THE VENDOR — Chat Conversation Screen
// ============================================

import { icons, openVendorProfileById, refreshIcons } from '../app.js';
import { escapeHtml, escapeAttr, safeCssColor } from '../lib/sanitize.js';

export function renderChatConversation(convData) {
  const overlay = document.getElementById('active-chat-overlay');
  
  // Example messages based on conversation type
  let messagesHtml = '';
  if (convData.type === 'quote') {
    messagesHtml = `
      <div class="chat-system-message">
        <span>Today</span>
      </div>
      
      <!-- System Quote Card -->
      <div class="message-quote-card">
        <div class="quote-card-header">
          <i data-lucide="file-text"></i>
          <span>Quote Request Created</span>
        </div>
        <div class="quote-card-body">
          <div class="quote-row"><span class="label">Service:</span> <span class="val">${escapeHtml(convData.quoteDetails?.service || 'Wedding Photography')}</span></div>
          <div class="quote-row"><span class="label">Budget:</span> <span class="val">${escapeHtml(convData.quoteDetails?.budget || 'N$15,000')}</span></div>
          <div class="quote-row"><span class="label">Date:</span> <span class="val">${escapeHtml(convData.quoteDetails?.date || '20 December')}</span></div>
          <div class="quote-row"><span class="label">Status:</span> <span class="val pending">Pending Vendor Response</span></div>
        </div>
      </div>
      
      <!-- Vendor Reply (Only show if not a new mock quote) -->
      ${convData.quoteDetails ? '' : `
      <div class="message-bubble received">
        ${escapeHtml(convData.lastMessage)}
        <div class="message-time">10:42 AM</div>
      </div>
      `}
    `;
  } else if (convData.type === 'booking') {
    messagesHtml = `
      <div class="chat-system-message">
        <span>Yesterday</span>
      </div>
      <div class="message-bubble received">
        ${escapeHtml(convData.lastMessage)}
        <div class="message-time">4:30 PM</div>
      </div>
    `;
  } else {
    messagesHtml = `
      <div class="chat-system-message">
        <span>Monday</span>
      </div>
      <div class="message-bubble sent">
        Hi, can you fix my brakes tomorrow?
        <div class="message-time">9:15 AM <i data-lucide="check-check" style="width:12px;height:12px;display:inline;color:var(--primary-500);"></i></div>
      </div>
      <div class="message-bubble received">
        ${escapeHtml(convData.lastMessage)}
        <div class="message-time">9:45 AM</div>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="chat-conv-container" style="display: flex; flex-direction: column; height: 100%; background: var(--bg-primary);">
      
      <!-- Chat Header -->
      <div class="chat-conv-header" style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-4) var(--space-3) var(--space-3); background: white; border-bottom: 1px solid var(--gray-100); z-index: 10;">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <button class="icon-btn" id="chat-back-btn" style="padding: 8px; margin-left: -8px;">
            ${icons.arrowLeft}
          </button>
          
          <div class="chat-header-info" style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;" id="chat-vendor-info">
            <div class="chat-avatar" style="position: relative;">
              <div style="width: 40px; height: 40px; border-radius: 50%; background: ${safeCssColor(convData.logoGradient)}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px;">
                ${escapeHtml(convData.logoInitials)}
              </div>
              ${convData.onlineStatus === 'online' ? `<div style="position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; border-radius: 50%; background: var(--success-500); border: 2px solid white;"></div>` : ''}
            </div>
            <div>
              <div style="font-weight: 600; font-size: var(--text-md); color: var(--gray-900); display: flex; align-items: center; gap: 4px;">
                ${escapeHtml(convData.vendorName)}
                ${convData.verified ? `<span class="badge-verified ${escapeAttr(convData.verifiedLevel)}" style="transform: scale(0.7);">${icons.verifiedBadge}</span>` : ''}
              </div>
              <div style="font-size: 11px; color: ${convData.onlineStatus === 'online' ? 'var(--success-600)' : 'var(--gray-500)'};">
                ${convData.onlineStatus === 'online' ? 'Online' : escapeHtml(convData.responseTime)}
              </div>
            </div>
          </div>
        </div>
        
        <div style="display: flex; gap: var(--space-1);">
          <button class="icon-btn" style="color: var(--primary-600);">
            <i data-lucide="phone" style="width: 20px; height: 20px;"></i>
          </button>
          <button class="icon-btn" style="color: var(--gray-600);">
            <i data-lucide="more-vertical" style="width: 20px; height: 20px;"></i>
          </button>
        </div>
      </div>

      <!-- Quick Actions Strip -->
      <div class="chat-quick-actions" style="padding: var(--space-2) var(--space-3); background: var(--gray-50); border-bottom: 1px solid var(--gray-100); display: flex; gap: var(--space-2); overflow-x: auto; scrollbar-width: none;">
        <button class="btn-quick-action"><i data-lucide="file-text"></i> Request Quote</button>
        <button class="btn-quick-action"><i data-lucide="calendar"></i> Check Availability</button>
        <button class="btn-quick-action"><i data-lucide="map-pin"></i> Share Location</button>
      </div>

      <!-- Messages Area -->
      <div class="chat-messages-area" style="flex-grow: 1; overflow-y: auto; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
        ${messagesHtml}
      </div>

      <!-- Input Area -->
      <div class="chat-input-area" style="padding: var(--space-3); background: white; border-top: 1px solid var(--gray-200); padding-bottom: calc(var(--space-3) + env(safe-area-inset-bottom));">
        <div style="display: flex; align-items: flex-end; gap: var(--space-2); background: var(--gray-50); border-radius: 24px; padding: 8px 12px; border: 1px solid var(--gray-200);">
          <button class="icon-btn" style="color: var(--gray-500); padding: 4px;">
            <i data-lucide="plus" style="width: 20px; height: 20px;"></i>
          </button>
          <textarea placeholder="Message..." rows="1" style="flex-grow: 1; border: none; background: transparent; padding: 6px 0; font-size: var(--text-md); outline: none; resize: none; max-height: 100px; font-family: inherit; color: var(--text-primary);"></textarea>
          <button class="icon-btn" style="color: var(--primary-600); padding: 4px; background: var(--primary-50); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="send" style="width: 16px; height: 16px; margin-left: -2px;"></i>
          </button>
        </div>
      </div>
      
    </div>
  `;

  overlay.classList.remove('hidden');
  
  refreshIcons();

  // Events
  document.getElementById('chat-back-btn')?.addEventListener('click', closeChatConversation);
  
  document.getElementById('chat-vendor-info')?.addEventListener('click', () => {
    openVendorProfileById(convData.vendorId);
  });

  // Auto scroll to bottom
  const msgArea = overlay.querySelector('.chat-messages-area');
  if (msgArea) {
    msgArea.scrollTop = msgArea.scrollHeight;
  }
}

export function closeChatConversation() {
  const overlay = document.getElementById('active-chat-overlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    overlay.classList.add('closing');
    setTimeout(() => {
      overlay.classList.add('hidden');
      overlay.classList.remove('closing');
      overlay.innerHTML = '';
    }, 300); // Matches animation duration
  }
}
