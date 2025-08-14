# Products API Integration

This document explains how the products page now integrates with the backend API at `http://localhost:3001/api/products`.

## API Endpoint

The main endpoint is: `http://localhost:3001/api/products`

## Supported Query Parameters

The API supports the following filter parameters:

### Basic Parameters
- `limit` (number): Number of products to return (default: 100)
- `offset` (number): Number of products to skip for pagination (default: 0)
- `includeDeleted` (boolean): Whether to include deleted products (default: false)

### Search & Filtering
- `search` (string): Search term for product names
- `category` (string[]): Array of category names to filter by
- `brand` (string[]): Array of brand names to filter by
- `status` (string[]): Array of product statuses to filter by
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `color` (string[]): Array of colors to filter by
- `size` (string[]): Array of sizes to filter by
- `style` (string[]): Array of styles to filter by

## Example API Calls

### Basic Products Request
```
GET /api/products?limit=20&offset=0
```

### Filtered Products Request
```
GET /api/products?category=Tops&category=Bottoms&minPrice=20&maxPrice=100&color=blue&size=M
```

### Search with Filters
```
GET /api/products?search=shirt&category=Tops&brand=Nike&status=active
```

## Frontend Implementation

### API Service (`src/lib/api.ts`)
- `fetchProducts(filters)`: Main function to fetch products with filters
- `fetchFilterOptions()`: Fetches available filter options (categories, sizes, colors, etc.)

### Products Component (`src/components/products/index.tsx`)
- Implements all filter types as interactive UI elements
- Uses debounced API calls to prevent excessive requests
- Supports pagination with configurable items per page
- Handles loading states and error scenarios
- Responsive design with mobile filter overlay

### Custom Hooks (`src/lib/hooks.ts`)
- `useDebounce`: Debounces filter changes to optimize API calls
- `useApiCall`: Generic hook for managing API call states

## Filter Options Endpoint

The component also calls `/api/products/filter-options` to get available filter values. If this endpoint is not available, it falls back to default values.

## Features

1. **Real-time Filtering**: All filters trigger API calls with debouncing
2. **Pagination**: Server-side pagination with configurable page sizes
3. **Search**: Text search across product names
4. **Price Range**: Min/max price filtering
5. **Multiple Selection**: Support for selecting multiple values in array-based filters
6. **Responsive Design**: Mobile-friendly filter interface
7. **Error Handling**: Graceful error handling with retry options
8. **Loading States**: Visual feedback during API calls

## Usage

1. Navigate to `/products` page
2. Use the search bar to find products by name
3. Apply filters using the sidebar checkboxes and inputs
4. Navigate through pages using pagination controls
5. Reset all filters using the "Reset All" button

## Backend Requirements

Your backend API should:
- Accept all the query parameters listed above
- Return products in the expected format
- Support pagination with `limit` and `offset`
- Handle array parameters (multiple values for category, brand, etc.)
- Return total count for pagination
- Provide a `/filter-options` endpoint for available filter values

## Response Format

The API should return data in this format:

```json
{
  "products": [
    {
      "id": "1",
      "name": "Product Name",
      "price": 29.99,
      "image": "image_url",
      "rating": 4.5,
      "reviewCount": 128,
      "category": "Tops",
      "sizes": ["S", "M", "L"],
      "colors": ["blue", "red"],
      "style": "Casual"
    }
  ],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```
