"use client";

import { useState } from 'react';
import { MiningResult, AssociationRule } from '@/lib/mining/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp } from 'lucide-react';

interface RecommendationsProps {
  aprioriResult: MiningResult | null;
  eclatResult: MiningResult | null;
  minConfidence: number;
}

interface RecommendationItem {
  item: string;
  strength: number;
  confidence: number;
  lift: number;
  rule: AssociationRule;
}

export const Recommendations = ({
  aprioriResult,
  eclatResult,
  minConfidence,
}: RecommendationsProps) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);

  // Get all unique products from results
  const getAllProducts = (): string[] => {
    const products = new Set<string>();
    
    if (aprioriResult) {
      aprioriResult.frequentItemsets.forEach((itemset) => {
        itemset.items.forEach((item) => products.add(item));
      });
    }
    
    if (eclatResult) {
      eclatResult.frequentItemsets.forEach((itemset) => {
        itemset.items.forEach((item) => products.add(item));
      });
    }
    
    return Array.from(products).sort();
  };

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    
    // Find all rules where the selected product is in the antecedent
    const relevantRules: RecommendationItem[] = [];
    
    const processRules = (rules: AssociationRule[]) => {
      for (const rule of rules) {
        if (
          rule.confidence >= minConfidence &&
          rule.antecedent.includes(product) &&
          rule.consequent.length > 0
        ) {
          // Calculate strength as a combination of confidence and lift
          const strength = (rule.confidence * 0.7 + Math.min(rule.lift / 2, 0.3)) * 100;
          
          rule.consequent.forEach((item) => {
            relevantRules.push({
              item,
              strength,
              confidence: rule.confidence,
              lift: rule.lift,
              rule,
            });
          });
        }
      }
    };
    
    if (aprioriResult) {
      processRules(aprioriResult.rules);
    }
    
    if (eclatResult) {
      processRules(eclatResult.rules);
    }
    
    // Aggregate by item (take highest strength)
    const itemMap = new Map<string, RecommendationItem>();
    for (const rec of relevantRules) {
      const existing = itemMap.get(rec.item);
      if (!existing || rec.strength > existing.strength) {
        itemMap.set(rec.item, rec);
      }
    }
    
    // Sort by strength descending
    const sorted = Array.from(itemMap.values()).sort((a, b) => b.strength - a.strength);
    setRecommendations(sorted);
  };

  const products = getAllProducts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5" />
          Product Recommendations
        </CardTitle>
        <CardDescription>
          Select a product to see co-purchased items and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => handleProductSelect(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">-- Select a product --</option>
            {products.map((product) => (
              <option key={product} value={product}>
                {product.charAt(0).toUpperCase() + product.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Recommendations List */}
        {selectedProduct && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="size-4" />
              Recommended Items
            </h4>
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 bg-muted rounded-md">
                No recommendations found for this product with the current confidence threshold.
              </p>
            ) : (
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-muted rounded-md border hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium capitalize">{rec.item}</span>
                      <span className="text-sm font-semibold text-primary">
                        {rec.strength.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence: {(rec.confidence * 100).toFixed(1)}% • Lift: {rec.lift.toFixed(2)}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground italic">
                      Rule: {rec.rule.antecedent.join(', ')} → {rec.rule.consequent.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

