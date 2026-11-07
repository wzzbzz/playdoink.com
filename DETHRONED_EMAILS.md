# Dethroned Email Notification System

## Overview
When a player beats the #1 daily or all-time leaderboard score, the previous leader receives an email notification challenging them to reclaim their throne.

## Implementation

### Backend Changes

#### 1. ScoreRepository.php
- **Updated `checkLeaderboardPosition()`** to return dethroned leader info:
  - `dethronedDailyLeader` - Info about previous daily #1
  - `dethronedAllTimeLeader` - Info about previous all-time #1
  - Includes: userId, email, username, score

#### 2. EmailService.php (NEW)
- **`sendDethronedEmail()`** - Sends notification to dethroned player
  - Recipient info (email, username)
  - Old vs new score
  - New leader's name
  - Leaderboard type (daily/all-time)
  
- **Email Template Features:**
  - 👑 Crown emoji and dramatic header
  - Old score (strikethrough) vs new score
  - "PLAY NOW" button with magic login link
  - Responsive HTML design
  - DO!NK branding

- **`generateMagicLink()`** - Creates auto-login link
  - Currently returns placeholder
  - TODO: Implement token storage and validation

#### 3. LeaderboardController.php
- **Updated `submitScore()`** to send emails:
  - Checks if all-time leader was dethroned
  - Checks if daily leader was dethroned
  - Prevents duplicate emails:
    - Won't email if player beat their own record
    - Won't email daily leader if they're also all-time leader
  - Handles email failures gracefully (logs but doesn't fail request)

## Email Logic

### When Emails Are Sent
```
✅ All-time #1 beaten → Email previous all-time leader
✅ Daily #1 beaten → Email previous daily leader
❌ Player beat their own record → No email
❌ Same person holds both spots → Only one email (all-time takes priority)
```

### Email Content Example
```
Subject: 👑 Your DO!NK All-Time Record Has Fallen!

Hey Alice,

Bob just scored 47 and claimed the #1 all-time spot on DO!NK!

[Your Record: 42]
[New Record: 47]

Time to reclaim your crown! 👑

[PLAY NOW button with magic login link]

This link will log you in automatically and is valid for 24 hours.
```

## Next Steps (TODO)

### Magic Login Implementation
1. Create `MagicToken` entity
   - token (string, unique)
   - email (string)
   - expiresAt (datetime)
   - used (boolean)

2. Store tokens when generating links
3. Create `/auth/magic` endpoint
   - Validates token
   - Checks expiration (24 hours)
   - Logs user in
   - Marks token as used

### Email Configuration
1. Configure Symfony Mailer in `.env`:
   ```
   MAILER_DSN=smtp://user:pass@smtp.example.com:587
   ```

2. Update "from" address in EmailService.php
3. Test email delivery

### Optional Enhancements
- Rate limiting (prevent spam if someone keeps beating records)
- Email preferences (let users opt out)
- Weekly digest instead of instant notifications
- Include player stats in email
- Add social sharing buttons in email
- Track email opens/clicks

## Testing

### Manual Test
1. Have Player A achieve #1 score
2. Have Player B beat that score
3. Check Player A's email for notification
4. Click magic link (once implemented)
5. Verify auto-login works

### Edge Cases to Test
- Player beats their own record (no email)
- Same player holds both daily and all-time (one email only)
- Invalid email address (graceful failure)
- SMTP server down (graceful failure, logged)
- Token expired (show error, redirect to login)
- Token already used (show error, redirect to login)

## Files Modified/Created

### New Files
- `api/src/Service/EmailService.php`
- `DETHRONED_EMAILS.md`

### Modified Files  
- `api/src/Repository/ScoreRepository.php`
- `api/src/Controller/LeaderboardController.php`

## Configuration Needed

Add to `.env`:
```env
MAILER_DSN=smtp://smtp.sendgrid.net:587?username=apikey&password=YOUR_SENDGRID_API_KEY
# or
MAILER_DSN=smtp://smtp.gmail.com:587?username=YOUR_EMAIL&password=YOUR_APP_PASSWORD
```
