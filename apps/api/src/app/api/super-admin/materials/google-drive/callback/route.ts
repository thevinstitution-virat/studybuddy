import { defaultAppUrl } from '@/lib/hw/eval-tools/invite-content'
import { auth } from '@/auth';
import { isPlatformStaff, type Role } from '@/auth/permissions';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server'
/**
 * GET /api/super-admin/materials/google-drive/callback
 * OAuth callback endpoint for Google Drive authorization
 */
export async function GET(request: NextRequest) {
  // Every redirect below goes to a page of the WEB app, so it is built from the configured web address.
  // request.url is this API's own address (an internal host name when the call arrives through the web proxy).
  const webBase = defaultAppUrl()
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', webBase))
    }

    const userRole = session?.user?.role
    if (!isPlatformStaff((userRole ?? '') as Role)) {
      return NextResponse.redirect(new URL('/dashboard', webBase))
    }

    // Get the authorization code from query parameters
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      // Handle OAuth error
      const errorDescription = url.searchParams.get('error_description') || 'Unknown error'
      const redirectUrl = new URL('/dashboard/super-admin/materials', webBase)
      redirectUrl.searchParams.set('error', `OAuth Error: ${errorDescription}`)
      return NextResponse.redirect(redirectUrl)
    }

    if (!code) {
      // No authorization code received
      const redirectUrl = new URL('/dashboard/super-admin/materials', webBase)
      redirectUrl.searchParams.set('error', 'No authorization code received')
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect back to admin materials page with the authorization code
    const redirectUrl = new URL('/dashboard/super-admin/materials', webBase)
    redirectUrl.searchParams.set('code', code)
    redirectUrl.searchParams.set('tab', 'settings')
    redirectUrl.searchParams.set('success', 'Authorization code received. Please complete the setup in the Settings tab.')

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error in Google Drive OAuth callback:', error)
    
    // Redirect to admin materials page with error
    const redirectUrl = new URL('/dashboard/super-admin/materials', webBase)
    redirectUrl.searchParams.set('error', 'OAuth callback failed. Please try again.')
    return NextResponse.redirect(redirectUrl)
  }
}
