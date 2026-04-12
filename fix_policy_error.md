# Fix Authentication and Buffering Issues

The user is experiencing 401 Unauthorized errors on `/api/auth/me` and `/api/auth/refresh` endpoints, and the website hangs (buffering) when opening. This is likely due to a combination of restrictive cookie policies, broken CORS logic, and a deadlock in the frontend API client's token refresh logic.

## User Review Required

> [!IMPORTANT]
> Change to Cookie Policy: I will change the `refreshToken` cookie's `SameSite` attribute from `Strict` to `None` in production. This is necessary because the frontend and backend are hosted on different domains (Vercel and Render), and `Strict` prevents cookies from being sent in cross-site requests.

## Proposed Changes

---

### Backend Components

#### [MODIFY] [app.js](file:///c:/Users/windows-11/Desktop/ruchiragam/backend/src/app.js)
- Fix the CORS `origin` check to correctly handle regular expressions in `allowedOrigins`.
- Update `allowedOrigins` to include common production domains if necessary (already contains Vercel regex but the check is broken).

#### [MODIFY] [authController.js](file:///c:/Users/windows-11/Desktop/ruchiragam/backend/src/controllers/authController.js)
- Update `COOKIE_OPTIONS` to use `sameSite: 'none'` and `secure: true` in production to allow cross-site cookie transmission.

---

### Frontend Components

#### [MODIFY] [apiClient.ts](file:///c:/Users/windows-11/Desktop/ruchiragam/frontend/src/lib/apiClient.ts)
- Update the response interceptor to skip refresh logic if the failed request was already directed at the `/auth/refresh` endpoint. This prevents the infinite queuing/deadlock causing the "buffering" issue.

## Verification Plan

### Automated Tests
- Since this is a production-only issue (related to Cross-Site cookies and Render/Vercel domains), it is hard to simulate locally with `localhost`. However, I can:
  - Verify that the CORS logic now correctly matches regex patterns.
  - Verify that the frontend interceptor correctly redirects to `/login` when `/auth/refresh` fails instead of hanging.

### Manual Verification
- I will check the code logic to ensure it covers the failing cases.
- The user will need to deploy these changes to Render/Vercel to confirm the fix on the actual environment.
