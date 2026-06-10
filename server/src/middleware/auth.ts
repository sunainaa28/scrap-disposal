import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';

// Define custom properties on Request object
declare global {
  namespace Express {
    interface Request {
      user?: {
        name: string;
        email: string;
        role: 'initiator' | 'reviewer' | 'approver';
        employeeId?: string;
        designation?: string;
      };
    }
  }
}

const tenantId = process.env.VITE_MSAL_TENANT_ID || 'common';
const clientId = process.env.VITE_MSAL_CLIENT_ID;

// Configure JWKS client to fetch Microsoft's keys
const jwksClient = jwksRsa({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('No Key ID (kid) in token header'));
  }
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  // Mock token pathway for testing/local development
  if (token.startsWith('mock-token-')) {
    try {
      const payloadBase64 = token.substring('mock-token-'.length);
      const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const mockUser = JSON.parse(decodedPayload);
      req.user = mockUser;
      return next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid mock token structure' });
    }
  }

  // Real MSAL JWT token validation
  if (!clientId || clientId === 'mock') {
    return res.status(401).json({ error: 'Server configured for Mock Mode, but real token received.' });
  }

  const options: jwt.VerifyOptions = {
    audience: clientId,
    issuer: [
      `https://login.microsoftonline.com/${tenantId}/v2.0`,
      `https://sts.windows.net/${tenantId}/`,
    ],
  };

  jwt.verify(token, getKey, options, (err, decoded) => {
    if (err) {
      console.error('JWT verification failed:', err.message);
      return res.status(401).json({ error: `Authentication failed: ${err.message}` });
    }

    const payload = decoded as any;
    
    // Map email/UPN from Azure token
    const email = payload.preferred_username || payload.upn || payload.email || '';
    const name = payload.name || 'Azure AD User';

    // Simple role determination mapping
    // Can be refined based on Azure AD app roles/groups.
    // For demo purposes, we can read a custom claim or fallback to initiator
    let role: 'initiator' | 'reviewer' | 'approver' = 'initiator';
    if (payload.roles && Array.isArray(payload.roles)) {
      if (payload.roles.includes('Reviewer') || payload.roles.includes('DepotManager')) {
        role = 'reviewer';
      } else if (payload.roles.includes('Approver') || payload.roles.includes('HOD')) {
        role = 'approver';
      }
    } else {
      // Fallback check based on email keyword or mock parameters to allow role mapping via login config
      const lowercaseEmail = email.toLowerCase();
      if (lowercaseEmail.includes('priya') || lowercaseEmail.includes('reviewer') || lowercaseEmail.includes('manager')) {
        role = 'reviewer';
      } else if (lowercaseEmail.includes('arun') || lowercaseEmail.includes('approver') || lowercaseEmail.includes('hod')) {
        role = 'approver';
      }
    }

    req.user = {
      name,
      email,
      role,
      employeeId: payload.employeeId || `HMRL-EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: payload.designation || (role === 'reviewer' ? 'Depot Manager' : role === 'approver' ? 'Head of Operations' : 'Senior Engineer'),
    };

    next();
  });
}
