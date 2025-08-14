import { NextRequest, NextResponse } from 'next/server';
import { Cart } from '@/lib/cart';
import fs from 'fs/promises';
import path from 'path';

const CART_DATA_DIR = path.join(process.cwd(), 'data', 'carts');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(CART_DATA_DIR);
  } catch {
    await fs.mkdir(CART_DATA_DIR, { recursive: true });
  }
}

// Get cart file path
function getCartFilePath(cartId: string): string {
  return path.join(CART_DATA_DIR, `${cartId}.json`);
}

// GET /api/cart - Retrieve cart by ID from query params
export async function GET(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id');
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }
    
    const cartFilePath = getCartFilePath(cartId);
    
    try {
      const cartData = await fs.readFile(cartFilePath, 'utf-8');
      const cart: Cart = JSON.parse(cartData);
      
      return NextResponse.json(cart);
    } catch (error) {
      // Cart file doesn't exist, return empty cart
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error retrieving cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Save or update cart
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const cart: Cart = await request.json();
    
    if (!cart.id) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }
    
    // Validate cart structure
    if (!Array.isArray(cart.items)) {
      return NextResponse.json(
        { error: 'Invalid cart structure' },
        { status: 400 }
      );
    }
    
    // Update timestamps
    cart.updatedAt = new Date().toISOString();
    if (!cart.createdAt) {
      cart.createdAt = cart.updatedAt;
    }
    
    // Calculate totals
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (parseFloat(item.variant.price) * item.quantity), 0);
    
    const cartFilePath = getCartFilePath(cart.id);
    
    // Save cart to file
    await fs.writeFile(cartFilePath, JSON.stringify(cart, null, 2), 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'Cart saved successfully',
      cart
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove cart
export async function DELETE(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const { searchParams } = new URL(request.url);
    const cartId = searchParams.get('id');
    
    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }
    
    const cartFilePath = getCartFilePath(cartId);
    
    try {
      await fs.unlink(cartFilePath);
      
      return NextResponse.json({
        success: true,
        message: 'Cart removed successfully'
      });
    } catch (error) {
      // Cart file doesn't exist
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error removing cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
