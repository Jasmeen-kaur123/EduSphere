// Notification System
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close">×</button>
    </div>
  `;

  // Add styles for notification
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      font-weight: 500;
      z-index: 3000;
      animation: slideInRight 0.3s ease;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-success {
      background-color: rgba(126, 217, 87, 0.1);
      color: #7ED957;
      border-left: 4px solid #7ED957;
    }

    .notification-error {
      background-color: rgba(255, 107, 129, 0.1);
      color: #FF6B81;
      border-left: 4px solid #FF6B81;
    }

    .notification-info {
      background-color: rgba(108, 74, 182, 0.1);
      color: #6C4AB6;
      border-left: 4px solid #6C4AB6;
    }

    .notification-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .notification-close:hover {
      opacity: 1;
    }
  `;

  if (!document.querySelector('style[data-notification]')) {
    style.setAttribute('data-notification', 'true');
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Close button functionality
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// Notification Bell Click - Show All Notifications
function initNotificationBell() {
  document.getElementById('notificationBell')?.addEventListener('click', () => {
    const notifications = [
      { type: 'success', message: 'New student enrolled in Web Development course' },
      { type: 'success', message: 'Assignment "JavaScript Basics" has been submitted by 45 students' },
      { type: 'info', message: 'Exam "Mid Term - Web Development" will start in 2 hours' }
    ];

    // Create notification panel
    const notificationPanel = document.createElement('div');
    notificationPanel.className = 'notification-panel';
    notificationPanel.innerHTML = `
      <div class="notification-panel-header">
        <h3>Notifications</h3>
        <button class="close-panel">&times;</button>
      </div>
      <div class="notification-list">
        ${notifications.map(notif => `
          <div class="notification-item notification-item-${notif.type}">
            <span class="notification-icon">
              ${notif.type === 'success' ? '✓' : 'ℹ'}
            </span>
            <span class="notification-text">${notif.message}</span>
            <span class="notification-time">just now</span>
          </div>
        `).join('')}
      </div>
    `;

    // Remove existing panel if open
    const existingPanel = document.querySelector('.notification-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }

    document.body.appendChild(notificationPanel);

    // Add styles if not already added
    if (!document.querySelector('style[data-notification-panel]')) {
      const style = document.createElement('style');
      style.setAttribute('data-notification-panel', 'true');
      style.textContent = `
        .notification-panel {
          position: fixed;
          top: 70px;
          right: 20px;
          width: 350px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 2500;
          animation: slideDown 0.3s ease;
          max-height: 500px;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .notification-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #E8E4F0;
        }

        .notification-panel-header h3 {
          margin: 0;
          color: #2E2E2E;
          font-size: 16px;
          font-weight: 600;
        }

        .close-panel {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #8A8A8A;
          padding: 0;
        }

        .close-panel:hover {
          color: #2E2E2E;
        }

        .notification-list {
          overflow-y: auto;
          max-height: 420px;
        }

        .notification-item {
          display: flex;
          gap: 12px;
          padding: 15px 20px;
          border-bottom: 1px solid #F0F0F0;
          align-items: flex-start;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background-color: #F6F3FB;
        }

        .notification-item-success {
          border-left: 4px solid #7ED957;
        }

        .notification-item-info {
          border-left: 4px solid #6C4AB6;
        }

        .notification-icon {
          font-weight: 600;
          font-size: 16px;
        }

        .notification-item-success .notification-icon {
          color: #7ED957;
        }

        .notification-item-info .notification-icon {
          color: #6C4AB6;
        }

        .notification-text {
          flex: 1;
          color: #2E2E2E;
          font-size: 13px;
          line-height: 1.4;
        }

        .notification-time {
          color: #8A8A8A;
          font-size: 11px;
          white-space: nowrap;
          margin-left: 10px;
        }

        @media (max-width: 480px) {
          .notification-panel {
            width: calc(100vw - 40px);
            right: 20px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Close panel functionality
    notificationPanel.querySelector('.close-panel').addEventListener('click', () => {
      notificationPanel.remove();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!notificationPanel.contains(e.target) && !document.getElementById('notificationBell').contains(e.target)) {
        notificationPanel.remove();
      }
    });
  });
}
