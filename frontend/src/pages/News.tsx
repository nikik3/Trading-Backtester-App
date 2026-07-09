import { Newspaper } from "lucide-react";

const News = () => {
  const newsItems = [
    {
      title: "Markets Rally on Strong Economic Data",
      source: "Financial Times",
      time: "2 hours ago",
      summary: "Major indices surge as employment figures exceed expectations"
    },
    {
      title: "Tech Stocks Lead Market Recovery",
      source: "Bloomberg",
      time: "4 hours ago",
      summary: "Technology sector rebounds with strong earnings reports"
    },
    {
      title: "Federal Reserve Maintains Interest Rates",
      source: "Reuters",
      time: "6 hours ago",
      summary: "Central bank holds rates steady amid inflation concerns"
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient">Market News</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest market developments
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {newsItems.map((item, index) => (
            <div key={index} className="card-glass rounded-xl p-6 hover:border-accent/50 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Newspaper className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground mb-3">{item.summary}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;