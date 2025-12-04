import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { FoodCatalogItem, FoodItem } from '@/types';
import { foodCatalog } from '@/data/foodCatalog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FoodItemSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFood: (food: FoodItem) => void;
  dietType?: string;
}

const categoryColors: Record<string, string> = {
  protein: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  carbs: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  vegetables: 'bg-green-500/20 text-green-700 dark:text-green-300',
  fruits: 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
  dairy: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  fats: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  beverages: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  snacks: 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
};

export const FoodItemSearch = ({
  open,
  onOpenChange,
  onSelectFood,
  dietType,
}: FoodItemSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quantity, setQuantity] = useState('1 serving');

  const filteredFoods = useMemo(() => {
    let foods = foodCatalog;

    // Filter by diet type
    if (dietType === 'vegetarian') {
      foods = foods.filter((f) => f.isVegetarian);
    } else if (dietType === 'vegan') {
      foods = foods.filter((f) => f.isVegan);
    }

    // Filter by search query
    if (searchQuery) {
      foods = foods.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      foods = foods.filter((f) => f.category === selectedCategory);
    }

    return foods;
  }, [searchQuery, selectedCategory, dietType]);

  const categories = [
    'all',
    'protein',
    'carbs',
    'vegetables',
    'fruits',
    'dairy',
    'fats',
    'beverages',
    'snacks',
  ];

  const handleSelectFood = (catalogItem: FoodCatalogItem) => {
    const foodItem: FoodItem = {
      id: `item_${Date.now()}`,
      name: catalogItem.name,
      quantity: quantity || catalogItem.servingSize,
      calories: catalogItem.calories,
      protein: catalogItem.protein,
      carbs: catalogItem.carbs,
      fat: catalogItem.fat,
      image: catalogItem.image,
    };
    onSelectFood(foodItem);
    setSearchQuery('');
    setQuantity('1 serving');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Food Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </Badge>
            ))}
          </div>

          {/* Quantity Input */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <Input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 100g, 1 cup"
              className="w-40"
            />
          </div>

          {/* Food List */}
          <ScrollArea className="h-[350px]">
            <div className="space-y-2 pr-4">
              {filteredFoods.map((food) => (
                <div
                  key={food.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleSelectFood(food)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {food.image && (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="h-12 w-12 rounded-md object-cover bg-muted"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{food.name}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${categoryColors[food.category]}`}
                        >
                          {food.category}
                        </Badge>
                        {food.isVegan && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Vegan
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{food.servingSize}</span>
                        <span>{food.calories} cal</span>
                        <span>P: {food.protein}g</span>
                        <span>C: {food.carbs}g</span>
                        <span>F: {food.fat}g</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {filteredFoods.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No foods found matching your search.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
