import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar, Scatter } from 'recharts';
import type { CandlestickData } from '../components/ui/csvParser';

interface Marker {
  date: string;
  type: 'BUY' | 'SELL' | string;
  price: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  showVolume?: boolean;
  // indicator keys correspond to data properties on each data point (e.g., 'SMA_5', 'SMA_20', 'MACD', 'MACD_Signal', 'RSI')
  indicatorKeys?: string[];
  // markers to display on the primary chart
  markers?: Marker[];
}

const CandlestickChart = ({ data, showVolume = true, indicatorKeys = [], markers = [] }: CandlestickChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 bg-gradient-to-b from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">📊 Load data to see the chart</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value: string | number | Date) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
            // defensive formatter: avoid calling toFixed on undefined/non-numbers
            formatter={(value: any) => {
              if (value === null || value === undefined) return ['-', ''];
              if (typeof value === 'number' && Number.isFinite(value)) return [`$${value.toFixed(2)}`, ''];
              // fallback to string representation
              try { return [String(value), '']; } catch { return ['-', '']; }
            }}
          />
          <Legend />
          
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="hsl(var(--success))" 
            strokeWidth={1}
            dot={false}
            name="High"
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            stroke="hsl(var(--destructive))" 
            strokeWidth={1}
            dot={false}
            name="Low"
          />
          
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 3 }}
            fill="url(#colorPrice)"
            name="Close"
          />

          {/* Render indicator series if provided */}
          {indicatorKeys.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={['#FDB022', '#66A3FF', '#9B5DE5', '#FF6B6B', '#4BC0C0'][idx % 5]}
              strokeWidth={key.toLowerCase().includes('macd') ? 1.5 : 1.5}
              dot={false}
              name={key}
            />
          ))}

          {/* Buy/Sell markers as Scatter points */}
          {markers && markers.length > 0 && (
            <>
              <Scatter
                data={markers.filter(m => m.type === 'BUY').map(m => ({ date: m.date, price: m.price }))}
                dataKey="price"
                fill="#22c55e"
                shape={(props: any) => {
                  const { cx, cy } = props;
                  return <path d={`M${cx} ${cy - 6} L${cx - 6} ${cy + 6} L${cx + 6} ${cy + 6} Z`} fill="#22c55e" />;
                }}
              />
              <Scatter
                data={markers.filter(m => m.type === 'SELL').map(m => ({ date: m.date, price: m.price }))}
                dataKey="price"
                fill="#ef4444"
                shape={(props: any) => {
                  const { cx, cy } = props;
                  return <path d={`M${cx} ${cy + 6} L${cx - 6} ${cy - 6} L${cx + 6} ${cy - 6} Z`} fill="#ef4444" />;
                }}
              />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {showVolume && (
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={data} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value: string | number | Date) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              formatter={(value: any) => {
                if (value === null || value === undefined) return ['-', 'Volume'];
                if (typeof value === 'number' && Number.isFinite(value)) return [value.toLocaleString(), 'Volume'];
                try { return [String(value), 'Volume']; } catch { return ['-', 'Volume']; }
              }}
            />
            <Bar dataKey="volume" fill="hsl(var(--secondary))" opacity={0.6} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default CandlestickChart;
