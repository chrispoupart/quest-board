# Notification System

The Quest Board application now includes a comprehensive notification system that keeps users informed about important events and activities.

## Features

### 🔔 Real-time Notifications

- **Quest Notifications**: When quests are claimed, completed, approved, or
  rejected
- **Store Notifications**: When store purchases are made, approved, or rejected
- **Level Up Notifications**: When users gain levels or experience
- **System Notifications**: For important system events

### 📱 Push Notifications

- Browser-based push notifications using the Notification API
- Automatic permission requests
- Configurable notification types and importance levels
- Click-to-focus functionality

### 🎯 Smart Notification Management

- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications
- Automatic cleanup of old read notifications (30 days)
- Unread count badge in the header

## Notification Types

### Quest-Related Notifications

- **QUEST_CLAIMED**: When someone claims your quest
- **QUEST_COMPLETED**: When someone completes your quest
- **QUEST_APPROVED**: When your quest completion is approved
- **QUEST_REJECTED**: When your quest completion is rejected

### Store-Related Notifications

- **STORE_PURCHASE**: When you make a purchase request
- **STORE_APPROVED**: When your purchase is approved
- **STORE_REJECTED**: When your purchase is rejected

### User Progress Notifications

- **LEVEL_UP**: When you gain a new level
- **SKILL_LEVEL_UP**: When you improve a skill (future feature)

### Admin Notifications

- **ADMIN_APPROVAL_NEEDED**: When there are pending quest completions or store
  purchases that need admin approval

## Admin Approval Notifications

### Automatic Admin Notifications

Admins receive notifications in the following scenarios:

- **Immediate Notifications**: When a quest is completed or a store purchase is
  made
- **Periodic Reminders**: Every 4 hours if there are still pending approvals
- **Push Notifications**: Browser notifications for urgent approval requests

### Notification Content

Admin notifications include:

- **Total count** of pending items
- **Breakdown** by type (quest completions vs store purchases)
- **Direct link** to the admin approval panel
- **Urgent styling** with orange/red colors to draw attention

### Admin Workflow

1. **Receive notification** via bell icon or push notification
2. **Click notification** to go directly to admin panel
3. **Review pending items** in the approval workflow
4. **Approve or reject** items with comments
5. **Notifications are automatically cleared** when items are processed

## Database Schema

```sql
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data TEXT, -- JSON string for additional data
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    read_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Get User Notifications

```text
GET /api/notifications?page=1&limit=20&unreadOnly=false
```

### Get Unread Count

```text
GET /api/notifications/unread-count
```

### Mark Notification as Read

```text
PUT /api/notifications/{id}/read
```

### Mark All Notifications as Read

```text
PUT /api/notifications/mark-all-read
```

### Delete Notification

```text
DELETE /api/notifications/{id}
```

### Cleanup Old Notifications (Admin Only)

```text
DELETE /api/notifications/cleanup/old?daysOld=30
```

## Frontend Components

### NotificationBell

- Displays unread count badge
- Handles push notification permissions
- Opens notification center

### NotificationCenter

- Modal dialog showing all notifications
- Pagination support
- Mark as read/delete functionality
- Real-time updates

### usePushNotifications Hook

- Manages browser notification permissions
- Provides notification display methods
- Handles notification interactions

## Backend Services

### NotificationService

- Creates notifications for various events
- Manages notification lifecycle
- Provides cleanup functionality

### Integration Points

- **QuestController**: Sends notifications for quest events
- **StoreController**: Sends notifications for store events
- **JobService**: Automatically cleans up old notifications

## Configuration

### Environment Variables

```bash
# Notification cleanup settings (optional)
NOTIFICATION_CLEANUP_DAYS=30
```

### Frontend Configuration

```typescript
// Notification polling interval (30 seconds)
const POLLING_INTERVAL = 30000;

// Auto-close notifications after 5 seconds
const NOTIFICATION_TIMEOUT = 5000;
```

## Usage Examples

### Creating a Notification (Backend)

```typescript
import { NotificationService } from '../services/notificationService';

// Quest approval notification
await NotificationService.createQuestApprovalNotification(
    userId,
    questId,
    questTitle,
    bounty,
    experience
);

// Store purchase notification
await NotificationService.createStorePurchaseNotification(
    userId,
    itemId,
    itemName,
    cost
);
```

### Using Push Notifications (Frontend)

```typescript
import { usePushNotifications } from '../hooks/usePushNotifications';

const { showQuestNotification, requestPermission } = usePushNotifications();

// Request permission
await requestPermission();

// Show notification
showQuestNotification('Quest Approved!', 'Your quest has been approved!');
```

## Testing

### Run Notification Tests

```bash
cd backend
node test-notifications.js
```

### Manual Testing

1. Start the backend and frontend servers
2. Create a quest and have it approved/rejected
3. Make a store purchase and have it approved/rejected
4. Check the notification bell in the header
5. Open the notification center to view all notifications
6. Test push notifications by granting permission

## Security Considerations

- Notifications are user-scoped and can only be accessed by the owner
- Admin cleanup endpoint requires admin privileges
- Notification data is sanitized to prevent XSS
- Push notifications require explicit user permission

## Performance Considerations

- Notifications are paginated to handle large volumes
- Automatic cleanup prevents database bloat
- Polling interval is configurable (default: 30 seconds)
- Push notifications are throttled to prevent spam

## Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Notification preferences per user
- [ ] Notification templates
- [ ] Real-time WebSocket notifications
- [ ] Notification sound effects
- [ ] Mobile push notifications (PWA)

## Troubleshooting

### Common Issues

1. **Push notifications not working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Verify Notification API support

2. **Notifications not appearing**
   - Check database connectivity
   - Verify notification service is running
   - Check browser console for errors

3. **High notification count**
   - Run cleanup job manually
   - Check for notification loops
   - Verify cleanup schedule

### Debug Commands

```bash
# Check notification count
curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/notifications/unread-count

# Cleanup old notifications
curl -X DELETE -H "Authorization: Bearer ADMIN_TOKEN" http://localhost:8000/api/notifications/cleanup/old
```
