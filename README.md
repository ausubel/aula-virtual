# Virtual Class

## Description
This is a project to recreate a backend for a school management app.

## Technologies
### Database
- MySQL

### Backend
- TypeScript
- Express
- JWT (JSON Web Token)
- Bcrypt
- Dotenv
- Nodemailer (Email Service)

### Frontend
- Next.js
- Tailwind CSS
- Shadcn UI

## Configuration

### Email Service Setup
1. Requirements:
   - Gmail account
   - Two-factor authentication enabled
   - App Password generated

2. Environment Variables (.env):
```env
GMAIL_USER = your_email@gmail.com
GMAIL_PASS = your_app_password
```

3. How to get Gmail App Password:
   - Go to Google Account Settings > Security
   - Enable 2-Step Verification if not enabled
   - Go to "App passwords"
   - Select "Mail" as app
   - Select your device
   - Use the generated password (format: xxxx xxxx xxxx xxxx)

4. Test Email Service:
```bash
# Using curl
curl -X POST http://localhost:3000/email/notification \
-H "Content-Type: application/json" \
-d "{
    \"email\":\"destination@gmail.com\",
    \"subject\":\"Test Email\",
    \"message\":\"Test message\"
}"
```


### Commands

Create mysql container (docker).

```sh
bash ./scripts/deploy_prod.sh -e prod -a create
```
Remove mysql container (docker).

```sh
bash ./scripts/deploy_prod.sh -e prod -a down
```

## API Endpoints
See [endpoints documentation](backend/docs/endpoints.md) for detailed API routes.
