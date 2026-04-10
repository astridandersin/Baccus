import { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ContentProvider, useContent } from './contexts/ContentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Editable from './components/Editable';
import EventCalendar from './components/EventCalendar';
import BlogCarousel from './components/BlogCarousel';
import AboutToggles from './components/AboutToggles';
import GalleryModal from './components/GalleryModal';
import { Plus, MapPin, Clock, X, Euro, Shirt, Languages, Ticket, FileText } from 'lucide-react';
import RedWineFluidBackground from './components/RedWineFluidBackground';

function formatTime(doorTime, startTime, endTime) {
  const parts = [];
  if (doorTime) parts.push(`Doors ${doorTime}`);
  if (startTime && endTime) parts.push(`${startTime} – ${endTime}`);
  else if (startTime) parts.push(`Starts ${startTime}`);
  else if (endTime) parts.push(`Ends ${endTime}`);
  return parts.join(' · ');
}

function AppContent() {
  const { isLoggedIn } = useAuth();
  const { getContent } = useContent();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [formStatus, setFormStatus] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('sending');
    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formsubmit.co/ajax/baccus@ky.fi", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(formData))
      });

      if (response.ok) {
        setFormStatus('success');
        e.target.reset();
        setTimeout(() => setFormStatus(''), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus(''), 5000);
      }
    } catch (error) {
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 5000);
    }
  };

  // Build sorted event lists from calendar data
  const calendarEvents = getContent('calendar-events', {});
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const upcomingEvents = useMemo(() => {
    return Object.entries(calendarEvents)
      .filter(([dateKey, evts]) => dateKey >= today && evts && evts.length > 0 && evts[0].title)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, evts]) => ({ dateKey, ...evts[0] }));
  }, [calendarEvents, today]);

  const pastEvents = useMemo(() => {
    return Object.entries(calendarEvents)
      .filter(([dateKey, evts]) => dateKey < today && evts && evts.length > 0 && evts[0].title)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([dateKey, evts]) => ({ dateKey, ...evts[0] }));
  }, [calendarEvents, today]);

  return (
    <div className="relative min-h-screen bg-[#111] text-white flex flex-col font-sans selection:bg-[#a41e32] selection:text-white">
      <RedWineFluidBackground />
      <div className="relative z-10 flex flex-col flex-grow">
        <Header onOpenGallery={() => setShowGalleryModal(true)} />

        <main className="flex-grow flex flex-col">
          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">

            <div className="relative z-10 text-center max-w-4xl mx-auto px-6 space-y-8">
              <Editable
                id="hero-title"
                initialValue="Curated Wines for the Connoisseur"
                as="h1"
                className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
              />

              <Editable
                id="hero-subtitle"
                initialValue="Join Baccus for exclusive access to the world's finest vintages, delivered directly to your door."
                as="p"
                multiline={true}
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light"
              />

            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-24 bg-transparent scroll-mt-20 relative z-10">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <Editable
                id="about-title"
                initialValue="Our Philosophy"
                as="h2"
                className="text-3xl font-bold mb-10 text-white"
              />
              <div className="bg-[#111]/80 backdrop-blur-md border border-white/5 hover:border-[#a41e32]/30 rounded-2xl p-8 md:p-12 transition-all duration-300 hover:shadow-[0_0_30px_rgba(164,30,50,0.08)]">
                <Editable
                  id="about-content"
                  initialValue="Baccus is dedicated to the discovery and celebration of exceptional wines. We traverse the globe, seeking out independent winemakers who pour their souls into every bottle. Our mission is to connect connoisseurs with these hidden gems, fostering a community built around shared passion, uncompromising quality, and the timeless art of winemaking."
                  as="p"
                  multiline={true}
                  className="text-lg text-gray-300 leading-relaxed font-light text-left md:text-center"
                />

                <button
                  onClick={() => setShowAboutModal(true)}
                  className="mt-8 bg-transparent border border-white/20 hover:border-[#a41e32] text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:bg-white/5 cursor-pointer"
                >
                  Read more...
                </button>
              </div>
            </div>
          </section>

          {/* Events Section */}
          <section id="upcoming-events" className="py-24 bg-transparent scroll-mt-24">
            <div className="max-w-4xl mx-auto px-6">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-12">
                <Editable
                  id="events-title"
                  initialValue="Upcoming Events"
                  as="h2"
                  className="text-3xl font-bold"
                />
                {isLoggedIn && (
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="flex items-center gap-2 bg-[#a41e32] hover:bg-[#8e192b] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105 shadow-[0_0_15px_rgba(164,30,50,0.25)] border-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    New Event
                  </button>
                )}
              </div>

              {/* Event Cards */}
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-16 text-gray-600">
                    <p className="text-lg">No upcoming events</p>
                    {isLoggedIn && (
                      <p className="text-sm mt-2">Click "New Event" to add one</p>
                    )}
                  </div>
                )}
                {upcomingEvents.map((event) => {
                  const d = new Date(event.dateKey + 'T00:00:00');
                  const timeStr = formatTime(event.doorTime, event.startTime, event.endTime);
                  return (
                    <div
                      key={event.dateKey}
                      className="group relative bg-[#111]/80 backdrop-blur-md border border-white/5 hover:border-[#a41e32]/30 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(164,30,50,0.08)]"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-5">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-16 h-16 bg-[#a41e32]/10 border border-[#a41e32]/20 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-[#a41e32] text-xl font-bold leading-none">
                            {d.getDate()}
                          </span>
                          <span className="text-[#a41e32]/70 text-xs font-medium uppercase mt-0.5">
                            {d.toLocaleDateString('en-GB', { month: 'short' })}
                          </span>
                        </div>

                        {/* Event Details */}
                        <div className="flex-grow min-w-0">
                          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-gray-100 transition-colors">
                            {event.title}
                          </h3>

                          {event.description && (
                            <p className="text-gray-400 text-sm leading-relaxed mb-3">
                              {event.description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500 mt-3">
                            {timeStr && (
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {timeStr}
                              </span>
                            )}
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {event.location}
                              </span>
                            )}
                            {event.price && (
                              <span className="flex items-center gap-1.5">
                                <Euro className="w-3.5 h-3.5" />
                                {event.price}
                              </span>
                            )}
                            {event.dressCode && (
                              <span className="flex items-center gap-1.5">
                                <Shirt className="w-3.5 h-3.5" />
                                {event.dressCode}
                              </span>
                            )}
                            {event.language && (
                              <span className="flex items-center gap-1.5">
                                <Languages className="w-3.5 h-3.5" />
                                {event.language}
                              </span>
                            )}
                          </div>

                          {(event.ticketLink || event.ticketSalesOpen) && (
                            <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5">
                              <Ticket className="w-3.5 h-3.5 text-[#a41e32]" />
                              {event.ticketLink ? (
                                <a
                                  href={event.ticketLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#a41e32] hover:text-[#c9253d] font-medium transition-colors"
                                >
                                  Buy Tickets →
                                </a>
                              ) : null}
                              {event.ticketSalesOpen && (
                                <span className="text-xs text-gray-600">
                                  Sales open: {event.ticketSalesOpen}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="max-w-4xl mx-auto px-6 mt-20">
                <h2 className="text-2xl font-bold text-gray-500 mb-10">Past Events</h2>
                <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
                  {pastEvents.map((event) => {
                    const d = new Date(event.dateKey + 'T00:00:00');
                    const timeStr = formatTime(event.doorTime, event.startTime, event.endTime);
                    return (
                      <div
                        key={event.dateKey}
                        className="group relative bg-[#111]/60 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8 opacity-60"
                      >
                        <div className="flex flex-col md:flex-row md:items-start gap-5">
                          <div className="flex-shrink-0 w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-gray-400 text-xl font-bold leading-none">
                              {d.getDate()}
                            </span>
                            <span className="text-gray-500 text-xs font-medium uppercase mt-0.5">
                              {d.toLocaleDateString('en-GB', { month: 'short' })}
                            </span>
                          </div>
                          <div className="flex-grow min-w-0">
                            <h3 className="text-xl font-semibold text-gray-400 mb-1">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                {event.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600 mt-2">
                              {timeStr && (
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  {timeStr}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Blog Section */}
          <section id="blog" className="py-24 bg-transparent scroll-mt-20 relative z-10">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <Editable
                  id="blog-title"
                  initialValue="Baccus Blog"
                  as="h2"
                  className="text-3xl font-bold text-white mb-4"
                />
                <Editable
                  id="blog-subtitle"
                  initialValue="Stories, tasting notes, and behind-the-scenes from the winemaking world."
                  as="p"
                  className="text-gray-400 text-lg"
                />
              </div>

            </div>

            <BlogCarousel />
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 bg-transparent scroll-mt-20 relative z-10">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <Editable
                  id="contact-title"
                  initialValue="Contact Baccus"
                  as="h2"
                  className="text-3xl font-bold text-white mb-4"
                />
                <Editable
                  id="contact-subtitle"
                  initialValue="Have questions about our events or wish to inquire about a private tasting? We're here to help."
                  as="p"
                  className="text-gray-400 text-lg"
                />
              </div>

              <div className="max-w-2xl mx-auto bg-[#111]/80 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-[0_0_30px_rgba(164,30,50,0.08)]">
                <form className="space-y-6" onSubmit={handleContactSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                      <input type="text" name="name" required className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a41e32] transition-colors" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                      <input type="email" name="email" required className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a41e32] transition-colors" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                    <textarea name="message" rows="4" required className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#a41e32] transition-colors resize-none" placeholder="How can we help you?"></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={formStatus === 'sending'}
                    className="w-full bg-[#a41e32] hover:bg-[#8e192b] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors shadow-[0_0_15px_rgba(164,30,50,0.25)] border-none cursor-pointer"
                  >
                    {formStatus === 'sending' ? 'Sending...' : formStatus === 'success' ? 'Message Sent! (See note)' : formStatus === 'error' ? 'Failed to Send' : 'Send Message'}
                  </button>
                  {formStatus === 'success' && (
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Note to Master: check baccus@ky.fi inbox for the first-time activation link from FormSubmit!
                    </p>
                  )}
                </form>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>

      {/* Calendar Modal */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCalendar(false)}
        >
          <div
            className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-5xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer z-10"
              aria-label="Close calendar"
            >
              <X className="w-5 h-5" />
            </button>
            <EventCalendar
              className="pt-6"
              onEventSave={(dateKey, eventData) => {
                console.log('Event saved:', dateKey, eventData);
              }}
            />
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/80 backdrop-blur-md px-4 pt-20 pb-8"
          onClick={() => setShowAboutModal(false)}
        >
          <div
            className="relative bg-[#111] border border-white/10 rounded-2xl p-6 md:p-10 w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors bg-[#111] md:bg-transparent border-none cursor-pointer z-10"
              aria-label="Close about"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="overflow-y-auto custom-scrollbar pr-2 md:pr-6 pt-4 text-left">
              <Editable
                id="about-modal-title"
                initialValue="About Baccus"
                as="h2"
                className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight pr-8 md:pr-0"
              />
              <div className="w-full pb-8">
                <AboutToggles />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <GalleryModal onClose={() => setShowGalleryModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <AppContent />
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;

