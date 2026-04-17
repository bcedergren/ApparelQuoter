import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import authOptions from '@/pages/api/auth/[...nextauth]';
import { CustomSession } from '@/types/CustomUser';

/**
 * Authentication Middleware
 * 
 * This module provides authentication and authorization helpers for API routes.
 * All protected endpoints should use these helpers to verify user access.
 */

/**
 * Require user authentication
 * Returns session if authenticated, null otherwise (and sends 401 response)
 */
export async function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<CustomSession | null> {
  const session = await getServerSession(req, res, authOptions) as CustomSession | null;

  if (!session || !session.user) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication required. Please log in.' 
    });
    return null;
  }

  return session;
}

/**
 * Require user to have access to specific company
 * Verifies that the authenticated user belongs to the requested company
 */
export async function requireCompanyAccess(
  req: NextApiRequest,
  res: NextApiResponse,
  companyId: string
): Promise<CustomSession | null> {
  const session = await requireAuth(req, res);
  if (!session) return null;

  // Verify user belongs to this company
  if (session.user.companyId !== companyId) {
    res.status(403).json({ 
      error: 'Forbidden',
      message: 'Access denied. You do not have permission to access this company\'s data.' 
    });
    return null;
  }

  return session;
}

/**
 * Require user to have admin role
 * Only company admins can perform certain operations
 */
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<CustomSession | null> {
  const session = await requireAuth(req, res);
  if (!session) return null;

  if (session.user.role !== 'admin') {
    res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required. Only administrators can perform this action.' 
    });
    return null;
  }

  return session;
}

/**
 * Verify resource ownership
 * Helper to check if a resource belongs to the user's company
 */
export function verifyResourceOwnership(
  resourceCompanyId: string | undefined,
  sessionCompanyId: string,
  res: NextApiResponse
): boolean {
  if (!resourceCompanyId || resourceCompanyId !== sessionCompanyId) {
    res.status(403).json({ 
      error: 'Forbidden',
      message: 'Access denied. This resource belongs to another company.' 
    });
    return false;
  }
  return true;
}

/**
 * Verify user can modify resource
 * User can modify if they own it OR they're an admin in the same company
 */
export function canModifyResource(
  resourceUserId: string | undefined,
  session: CustomSession
): boolean {
  const isOwnResource = resourceUserId === session.user.id;
  const isAdmin = session.user.role === 'admin';
  
  return isOwnResource || isAdmin;
}
