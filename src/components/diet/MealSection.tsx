import { useState } from 'react';
import { Plus, GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
import { FoodItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FoodItemSearch } from './FoodItemSearch';

interface MealSectionProps {
  title: string;
  icon: React.ReactNode;
  items: FoodItem[];
  onItemsChange: (items: FoodItem[]) => void;
  dietType?: string;
}

export const MealSection = ({
  title,
  icon,
  items,
  onItemsChange,
  dietType,
}: MealSectionProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddFood = (food: FoodItem) => {
    onItemsChange([...items, food]);
  };

  const handleRemoveFood = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onItemsChange(newItems);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditQuantity(items[index].quantity);
  };

  const handleSaveEdit = (index: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], quantity: editQuantity };
    onItemsChange(newItems);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditQuantity('');
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    onItemsChange(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0);

  return (
    <>
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              {icon}
              {title}
            </CardTitle>
            <div className="text-xs text-muted-foreground">
              {totalCalories} cal | P: {totalProtein}g | C: {totalCarbs}g | F: {totalFat}g
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No items added yet
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id || index}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors ${draggedIndex === index ? 'opacity-50' : ''
                  }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-8 w-8 rounded-md object-cover bg-muted"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {editingIndex === index ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          className="h-6 w-24 text-xs"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleSaveEdit(index)}
                        >
                          <Check className="h-3 w-3 text-green-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <span>{item.quantity}</span>
                    )}
                    <span>•</span>
                    <span>{item.calories} cal</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-blue-500">P: {item.protein}g</span>
                  <span className="text-amber-500">C: {item.carbs}g</span>
                  <span className="text-red-500">F: {item.fat}g</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleStartEdit(index)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveFood(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setIsSearchOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Food Item
          </Button>
        </CardContent>
      </Card>

      <FoodItemSearch
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectFood={handleAddFood}
        dietType={dietType}
      />
    </>
  );
};
