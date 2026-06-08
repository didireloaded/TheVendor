import { Star, MoreVertical, MessageSquareReply } from 'lucide-react';

export default function Reviews() {
  const reviews = [
    { id: 1, author: 'Sarah N.', rating: 5, date: '2 days ago', text: 'Amazing service! The photos turned out better than we could have ever imagined. Highly recommend.', replied: true },
    { id: 2, author: 'Michael T.', rating: 4, date: '1 week ago', text: 'Great experience overall. Was a little late to arrive but made up for it with quality work.', replied: false },
    { id: 3, author: 'Jessica L.', rating: 5, date: '1 month ago', text: 'Simply the best in Windhoek.', replied: false },
  ];

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 bg-background border-b sticky top-0 z-10">
        <h2 className="text-xl font-bold">Reviews</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold">4.8</h3>
            <p className="text-sm text-muted-foreground mt-1">Based on 124 reviews</p>
          </div>
          <div className="flex text-yellow-500">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="bg-card border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{review.author}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm mt-3">{review.text}</p>
              
              {!review.replied && (
                <div className="mt-3 pt-3 border-t">
                  <button className="text-sm text-primary font-medium flex items-center gap-1.5 hover:text-primary-dark transition-colors">
                    <MessageSquareReply className="w-4 h-4" />
                    Respond
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
