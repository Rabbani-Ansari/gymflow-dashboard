import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Macros } from '@/types';

interface MacroPieChartProps {
  macros: Macros;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
}

const COLORS = {
  protein: 'hsl(217, 91%, 60%)',
  carbs: 'hsl(38, 92%, 50%)',
  fat: 'hsl(0, 84%, 60%)',
};

export const MacroPieChart = ({ macros, size = 'md', showLegend = true }: MacroPieChartProps) => {
  const data = [
    { name: 'Protein', value: macros.protein, color: COLORS.protein },
    { name: 'Carbs', value: macros.carbs, color: COLORS.carbs },
    { name: 'Fat', value: macros.fat, color: COLORS.fat },
  ];

  const totalGrams = macros.protein + macros.carbs + macros.fat;

  const sizeConfig = {
    sm: { height: 80, innerRadius: 15, outerRadius: 30 },
    md: { height: 150, innerRadius: 30, outerRadius: 55 },
    lg: { height: 200, innerRadius: 40, outerRadius: 75 },
  };

  const config = sizeConfig[size];

  return (
    <div className="w-full" style={{ height: config.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value}g (${totalGrams > 0 ? Math.round((value / totalGrams) * 100) : 0}%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          {showLegend && size !== 'sm' && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
