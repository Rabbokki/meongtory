import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductRecommendationCardProps {
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    category: string;
    recommendationReason: string;
  };
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
}

export function ProductRecommendationCard({
  product,
  onAddToCart,
  onAddToWishlist
}: ProductRecommendationCardProps) {
  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-4 pb-2">
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg"
          />
          <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600">
            AI 추천
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
          {product.name}
        </CardTitle>
        
        <div className="mb-3">
          <p className="text-2xl font-bold text-primary">
            {product.price.toLocaleString()}원
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">추천 이유:</span>
          </p>
          <p className="text-sm text-gray-700 line-clamp-3">
            {product.recommendationReason}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onAddToCart?.(product.id)}
            className="flex-1"
            size="sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            장바구니
          </Button>
          <Button
            onClick={() => onAddToWishlist?.(product.id)}
            variant="outline"
            size="sm"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
