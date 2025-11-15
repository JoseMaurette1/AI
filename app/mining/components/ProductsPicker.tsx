"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample products (10+ items)
const PRODUCTS = [
  'milk', 'bread', 'butter', 'eggs', 'cheese', 'yogurt',
  'apple', 'banana', 'orange', 'grape', 'tomato', 'potato',
  'chicken', 'beef', 'pork', 'rice', 'pasta', 'noodles',
  'coffee', 'tea', 'juice', 'jam', 'honey', 'sauce'
];

interface ProductsPickerProps {
  onAddToTransaction: (product: string) => void;
  disabled?: boolean;
}

export const ProductsPicker = ({ onAddToTransaction, disabled = false }: ProductsPickerProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const handleProductClick = (product: string) => {
    if (disabled) return;
    setSelectedProduct(product);
    onAddToTransaction(product);
    // Reset selection after a brief moment for visual feedback
    setTimeout(() => setSelectedProduct(null), 200);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="size-5" />
          Products
        </CardTitle>
        <CardDescription>
          Click on a product to add it to the current transaction
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {PRODUCTS.map((product) => (
            <Button
              key={product}
              variant="outline"
              size="sm"
              onClick={() => handleProductClick(product)}
              disabled={disabled}
              className={cn(
                "h-auto py-2 px-3 text-sm capitalize transition-all",
                selectedProduct === product && "bg-primary text-primary-foreground scale-95",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Plus className="size-3 mr-1" />
              {product}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

