// API route for commercetools authentication
import { NextRequest, NextResponse } from 'next/server';
import config from '@/lib/config';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

export async function GET(request: NextRequest) {
  try {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return NextResponse.json({ access_token: cachedToken });
    }

    const credentials = Buffer.from(
      `${config.commercetools.clientId}:${config.commercetools.clientSecret}`
    ).toString('base64');

    // Use exact scopes from your API client credentials
    const scopes = [
      'view_discount_codes:prueba-estafeta',
      'view_categories:prueba-estafeta',
      'view_cart_discounts:prueba-estafeta',
      'manage_customers:prueba-estafeta',
      'manage_order_edits:prueba-estafeta',
      'view_products:prueba-estafeta',
      'view_project_settings:prueba-estafeta',
      'manage_orders:prueba-estafeta',
      'view_product_selections:prueba-estafeta',
      'view_shipping_methods:prueba-estafeta',
      'view_sessions:prueba-estafeta',
      'view_types:prueba-estafeta',
      'create_anonymous_token:prueba-estafeta',
      'view_tax_categories:prueba-estafeta',
      'view_published_products:prueba-estafeta',
      'manage_sessions:prueba-estafeta',
      'view_standalone_prices:prueba-estafeta',
      'manage_shopping_lists:prueba-estafeta',
    ];

    const response = await fetch(`${config.commercetools.authUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&scope=${scopes.join('%20')}`,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Auth API error:', response.statusText, error);
      return NextResponse.json(
        { error: 'Authentication failed', details: error },
        { status: 401 }
      );
    }

    const data = await response.json();
    cachedToken = data.access_token;
    // Cache for 55 minutes (token expires in 60)
    tokenExpiry = Date.now() + data.expires_in * 1000 - 300000;

    console.log('Token obtained successfully, expires in:', data.expires_in, 'seconds');
    return NextResponse.json({ access_token: cachedToken });
  } catch (error: any) {
    console.error('Token endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to get token', details: error.message },
      { status: 500 }
    );
  }
}
