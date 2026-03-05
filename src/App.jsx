import { AuthProvider } from './contexts/AuthContext';
import { ContentProvider } from './contexts/ContentContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Editable from './components/Editable';

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <div className="min-h-screen bg-[#111] text-white flex flex-col font-sans selection:bg-[#a41e32] selection:text-white">
          <Header />

          <main className="flex-grow flex flex-col">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
              {/* Abstract Background */}
              {/* Abstract Background */}
              <Editable
                id="hero-background"
                type="background"
                className="absolute inset-0 z-0"
              >
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#a41e32] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4a0e16] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
              </Editable>

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

                <div className="pt-4">
                  <Editable
                    id="hero-cta"
                    initialValue="Become a Member"
                    as="button"
                    className="bg-[#a41e32] hover:bg-[#8e192b] text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:scale-105 shadow-[0_0_20px_rgba(164,30,50,0.3)]"
                  />
                </div>
              </div>
            </section>

            {/* Feature Section Placeholder */}
            <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6">
                <Editable
                  id="features-title"
                  initialValue="Why Baccus?"
                  as="h2"
                  className="text-3xl font-bold mb-12 text-center"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-[#111] p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                      <div className="w-12 h-12 bg-[#a41e32]/10 rounded-full flex items-center justify-center mb-6 text-[#a41e32]">
                        <span className="font-serif italic text-xl">{i}</span>
                      </div>
                      <Editable
                        id={`feature-title-${i}`}
                        initialValue="Premium Selection"
                        as="h3"
                        className="text-xl font-semibold mb-3"
                      />
                      <Editable
                        id={`feature-desc-${i}`}
                        initialValue="Our sommeliers travel the globe to find hidden gems and established classics just for you."
                        as="p"
                        multiline={true}
                        className="text-gray-400 leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
