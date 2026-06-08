import { useState } from 'react';
import { Camera, Tag, MapPin, CalendarClock, LayoutGrid } from 'lucide-react';

export default function Content() {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="p-4 bg-background border-b sticky top-0 z-10 flex items-center justify-between">
        <h2 className="text-xl font-bold">Content</h2>
        <div className="flex bg-muted rounded-lg p-0.5">
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'create' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Create
          </button>
          <button 
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'manage' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
          >
            Manage
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'create' ? (
          <div className="space-y-6 max-w-lg mx-auto pb-8">
            {/* Image Upload Area */}
            <div className="aspect-square bg-muted/30 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden group">
              <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
              <p className="font-medium">Tap to upload photos</p>
              <p className="text-xs mt-1 opacity-70">Up to 10 images</p>
            </div>

            {/* Form Details */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Caption</label>
                <textarea 
                  rows={4}
                  placeholder="Write a caption..."
                  className="w-full p-3 bg-card border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 bg-card border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Post Type</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Portfolio Work &gt;</span>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-card border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Add Location</span>
                  </div>
                  <span className="text-sm text-muted-foreground">&gt;</span>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-card border rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Tag Service/Product</span>
                  </div>
                  <span className="text-sm text-muted-foreground">&gt;</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button className="flex-1 bg-muted text-foreground py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors">
                <CalendarClock className="w-4 h-4" /> Schedule
              </button>
              <button className="flex-[2] bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-sm shadow-primary/25 hover:bg-primary/90 transition-colors">
                Publish Now
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-muted relative group overflow-hidden rounded-md cursor-pointer">
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                  <span className="text-xs font-medium">1.2k Views</span>
                  <span className="text-[10px] mt-1">45 Likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
