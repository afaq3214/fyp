import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Search, ArrowRight, Tag, CornerDownLeft } from 'lucide-react';
import { toast } from 'sonner';

const API = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

const EXAMPLES = [
  "I spend too much time managing emails and can't focus on deep work",
  "My team struggles to collaborate on code reviews efficiently",
  "Learning a new programming language is slow without instant feedback",
  "Small businesses struggle to accept online payments easily",
  "I can't track my fitness progress across different workouts"
];

export default function ProblemDiscovery() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const analyze = async () => {
    if (!problem.trim()) { toast.error('Describe your problem first'); return; }
    setLoading(true);
    setSearched(false);
    try {
      const r = await fetch(`${API}/api/discover/problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResults(d.data || []);
      setKeywords(d.keywords || []);
      setSearched(true);
    } catch (e: any) {
      toast.error(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const scoreLabel = (score: number) => {
    if (score >= 10) return 'Strong match';
    if (score >= 5) return 'Good match';
    return 'Partial match';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
            <h1 className="text-3xl font-bold tracking-tight">Problem Discovery</h1>
          </div>
          <p className="text-zinc-500 text-sm mb-8">
            Describe any problem. Our AI ranks existing products by how well they solve it.
          </p>

          {/* Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="Describe the problem you're facing in detail..."
              value={problem}
              onChange={e => setProblem(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) analyze(); }}
              className="bg-zinc-900 border-zinc-800 text-white min-h-32 placeholder-zinc-600 resize-none text-sm leading-relaxed focus:border-white/30 transition-colors"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-700 flex items-center gap-1">
                <CornerDownLeft className="w-3 h-3" /> Ctrl + Enter to analyze
              </span>
              <Button onClick={analyze} disabled={loading || !problem.trim()}
                className="bg-white text-black hover:bg-zinc-200 px-6 h-9 text-sm">
                {loading ? (
                  <><div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />Analyzing...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 mr-2" />Discover Solutions</>
                )}
              </Button>
            </div>
          </div>

          {/* Example prompts */}
          {!searched && (
            <div className="mt-6">
              <p className="text-xs text-zinc-700 uppercase tracking-wider mb-3">Try an example</p>
              <div className="space-y-1.5">
                {EXAMPLES.map((ex, i) => (
                  <button key={i} onClick={() => { setProblem(ex); setResults([]); setSearched(false); }}
                    className="w-full text-left text-xs text-zinc-500 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all group flex items-center justify-between">
                    <span>{ex}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Keywords */}
          {keywords.length > 0 && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
              <span className="text-xs text-zinc-600 uppercase tracking-wider mr-1">Keywords</span>
              {keywords.map(kw => (
                <span key={kw} className="text-xs border border-zinc-800 text-white px-2 py-0.5 rounded-full">{kw}</span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-zinc-600 uppercase tracking-wider">
              {results.length > 0 ? `${results.length} products ranked` : 'No matches found'}
            </p>
            <button onClick={() => { setSearched(false); setResults([]); }}
              className="text-xs text-zinc-600 hover:text-white underline underline-offset-2">
              New search
            </button>
          </div>

          {results.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
              <Search className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-500 text-sm">No products matched your problem.</p>
              <p className="text-zinc-700 text-xs mt-1">Try rephrasing with different keywords.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((product: any, index: number) => (
                <div key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-white/20 rounded-xl p-5 cursor-pointer transition-all group">
                  <div className="flex gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 flex flex-col items-center pt-0.5 w-8">
                      <span className="text-lg font-bold text-zinc-700">#{index + 1}</span>
                    </div>

                    {/* Thumbnail */}
                    {product.media?.[0] && (
                      <img src={product.media[0]} alt={product.title}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-zinc-800" />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-white text-sm leading-tight group-hover:underline underline-offset-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-zinc-600">{product.relevanceScore} pts</span>
                          <span className="text-[10px] border border-zinc-700 text-zinc-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                            {scoreLabel(product.relevanceScore)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-500 mb-2 line-clamp-2 leading-relaxed">
                        {product.pitch || product.description}
                      </p>

                      {product.matchedKeywords?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-zinc-700">Matched:</span>
                          {product.matchedKeywords.map((kw: string) => (
                            <span key={kw}
                              className="text-[10px] bg-white/5 border border-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2">
                        {product.category && (
                          <span className="text-[10px] text-zinc-600">{product.category}</span>
                        )}
                        {product.autoTags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-[10px] text-zinc-700">#{tag}</span>
                        ))}
                        {product.createdBy && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Avatar className="w-4 h-4">
                              <AvatarFallback className="bg-zinc-800 text-[8px] text-white">
                                {product.createdBy?.name?.charAt(0)}
                              </AvatarFallback>
                              <AvatarImage src={product.createdBy?.profilePicture} />
                            </Avatar>
                            <span className="text-[10px] text-zinc-600">{product.createdBy?.name || product.author_name}</span>
                          </div>
                        )}
                        <ArrowRight className="w-3 h-3 text-zinc-700 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How it works (only before search) */}
      {!searched && !loading && (
        <div className="max-w-3xl mx-auto px-6 py-12">
          <p className="text-xs text-zinc-700 uppercase tracking-wider mb-6 text-center">How it works</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { n: '01', title: 'Describe', desc: 'Write your problem in plain language' },
              { n: '02', title: 'Extract', desc: 'AI pulls key concepts and terms' },
              { n: '03', title: 'Match', desc: 'TF-IDF scores every product description' },
              { n: '04', title: 'Rank', desc: 'Results sorted by relevance score' },
            ].map(step => (
              <div key={step.n} className="text-center">
                <div className="text-3xl font-bold text-zinc-800 mb-2">{step.n}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-zinc-700 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
