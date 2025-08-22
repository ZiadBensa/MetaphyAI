# Admin System Guide

## Overview
The admin system provides comprehensive control over user management, usage monitoring, and API testing for the SaaS application.

## Access
- **URL**: `/admin`
- **Password**: `admin123` (configurable in `/app/api/admin/auth/route.ts`)
- **Access Point**: Available from the signin page via "Admin Access" button

## Features

### 1. Overview Dashboard
- **Total Users**: Count of all registered users
- **Subscriptions**: Count of active subscriptions
- **Usage Records**: Total usage tracking records
- **Chat Sessions**: Total PDF chat sessions
- **Monthly Usage Summary**: Breakdown of feature usage across all users

### 2. User Management
- **User List**: View all users with their details
- **User Information**: Name, email, join date, subscription plan
- **Usage Statistics**: Current month usage for each feature
- **User Actions**:
  - **Reset All Usage**: Clear all usage counters for a specific user
  - **Delete User**: Permanently remove user and all associated data

### 3. API Testing
- **Endpoint Testing**: Test all major API endpoints
- **Test Data Inputs**: Customize test parameters
- **Real-time Results**: View API responses and status codes
- **Supported Endpoints**:
  - PDF Chat (`/api/pdf-summarizer/chat`)
  - Image Generation (`/api/image-generator/generate`)
  - Text Humanizer (`/api/text-humanizer/humanize`)
  - Subscription (`/api/subscription`)
  - Usage (`/api/usage`)

## Security Features

### Authentication
- **Password Protection**: Hardcoded password (change in production)
- **Session Management**: HTTP-only cookies with 24-hour expiration
- **Secure Logout**: Immediate session termination

### Access Control
- **Admin-only Routes**: All admin endpoints require authentication
- **Cookie Validation**: Server-side session verification
- **CSRF Protection**: SameSite cookie policy

## Configuration

### Changing Admin Password
Edit `/app/api/admin/auth/route.ts`:
```typescript
const ADMIN_PASSWORD = 'your-new-password';
```

### Session Duration
Modify the `maxAge` in the admin auth route:
```typescript
maxAge: 24 * 60 * 60, // 24 hours in seconds
```

## API Endpoints

### Authentication
- `POST /api/admin/auth` - Admin login
- `GET /api/admin/auth` - Check authentication status
- `POST /api/admin/logout` - Admin logout

### Dashboard
- `GET /api/admin/dashboard` - Fetch user data and statistics
- `POST /api/admin/dashboard` - Perform admin actions

### Testing
- `POST /api/admin/test-endpoints` - Test API endpoints

## Admin Actions

### Usage Management
```json
{
  "action": "reset_usage",
  "userId": "user_id_here",
  "feature": "pdf_chat"
}
```

### User Management
```json
{
  "action": "reset_all_usage",
  "userId": "user_id_here"
}
```

```json
{
  "action": "delete_user",
  "userId": "user_id_here"
}
```

## Usage Examples

### Testing PDF Chat
1. Go to Admin Dashboard → API Testing
2. Enter test message in "PDF Chat Message" field
3. Click "Test PDF Chat"
4. View results in "Recent Test Results" section

### Resetting User Usage
1. Go to Admin Dashboard → User Management
2. Find target user
3. Click "Reset All Usage" button
4. Confirm action

### Monitoring System Health
1. Go to Admin Dashboard → Overview
2. Check system statistics
3. Review monthly usage patterns
4. Identify high-usage users

## Best Practices

### Security
- Change default password immediately
- Use strong, unique passwords
- Regularly review admin access logs
- Limit admin access to trusted personnel

### Monitoring
- Check dashboard regularly for system health
- Monitor usage patterns for anomalies
- Review user management actions
- Test critical endpoints periodically

### Maintenance
- Regular password updates
- Session timeout adjustments
- User data cleanup
- API endpoint validation

## Troubleshooting

### Common Issues

#### Authentication Failed
- Verify password is correct
- Check browser cookie settings
- Clear browser cache and cookies
- Restart application if needed

#### API Tests Failing
- Verify backend services are running
- Check network connectivity
- Review endpoint configurations
- Validate test data format

#### User Data Not Loading
- Check database connection
- Verify Prisma client status
- Review database permissions
- Check for migration issues

### Error Messages
- **"Unauthorized"**: Invalid or expired admin session
- **"Missing userId or feature"**: Incomplete action parameters
- **"Action failed"**: Database operation error
- **"Test failed"**: API endpoint error

## Production Considerations

### Security Hardening
- Use environment variables for passwords
- Implement rate limiting
- Add IP whitelisting
- Enable audit logging

### Performance
- Implement caching for dashboard data
- Add pagination for large user lists
- Optimize database queries
- Monitor response times

### Monitoring
- Set up alerts for admin actions
- Log all administrative operations
- Monitor system resource usage
- Track API test results

## Support

For technical issues or feature requests:
1. Check this documentation
2. Review error logs
3. Test with minimal data
4. Contact development team

---

**Note**: This admin system provides powerful control over the application. Use responsibly and ensure proper access controls are in place for production environments.
