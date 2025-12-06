import React, { useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import ChatInterface from './components/ChatInterface';
import { useGeolocation } from './hooks/useGeolocation';
import { sendMessageToGemini } from './services/geminiService';
import { ChatMessage, Role, MapLocation } from './types';
import { nanoid } from 'nanoid'; // Using nanoid for simple IDs would be good, but standard random string is enough for now to reduce imports
const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const { location: userLocation, error: geoError } = useGeolocation();
  
  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // On Mobile, close sidebar when we find locations so user can see map
  useEffect(() => {
    if (window.innerWidth < 768 && mapLocations.length > 0) {
        setIsSidebarOpen(false);
    }
  }, [mapLocations]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: Role.USER,
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Call Gemini Service
      const response = await sendMessageToGemini(text, userLocation ? { lat: userLocation.lat, lng: userLocation.lng } : null, history);

      const botMsg: ChatMessage = {
        id: generateId(),
        role: Role.MODEL,
        text: response.text,
        timestamp: Date.now(),
        locations: response.locations
      };

      setMessages(prev => [...prev, botMsg]);
      
      // Update map if locations found
      if (response.locations.length > 0) {
        setMapLocations(response.locations);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: Role.MODEL,
        text: "I'm having trouble connecting to the map service right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden relative bg-gray-100">
      
      {/* Sidebar Chat */}
      <ChatInterface 
        messages={messages} 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative h-full w-full">
        <MapComponent 
            userLocation={userLocation} 
            locations={mapLocations}
        />
        
        {/* Geolocation Warning if failed */}
        {geoError && messages.length < 2 && (
            <div className="absolute top-4 right-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-red-100 text-xs text-red-500 max-w-[200px]">
                ⚠️ {geoError}. Map defaults to San Francisco.
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
