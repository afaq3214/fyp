import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DollarSign, Bookmark, BookmarkCheck, Send, TrendingUp,
  Users, Briefcase, CheckCircle, XCircle, Clock, Plus, Inbox
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

const CATEGORIES = ["AI/ML", "SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce", "Gaming", "Social", "Dev Tools", "Hardware", "Other"];
const STAGES = ["idea", "mvp", "growth", "scale"];

type Tab = 'investors' | 'profile' | 'applications' | 'bookmarks';

export default function InvestorConnect() {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState<Tab>('investors');
  const [investors, setInvestors] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    lookingFor: '', description: '', requirements: '',
    investmentFocus: [] as string[], stage: [] as string[],
    budget: { min: 0, max: 0 }
  });

  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
  const [applyForm, setApplyForm] = useState({ productId: '', pitch: '', fundingAmount: '', equity: '' });

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchInvestors();
    fetchProducts();
    if (token) {
      fetchMyProfile();
      fetchApplications();
      fetchMyApplications();
      fetchBookmarks();
    }
  }, [token]);

  const fetchInvestors = async () => {
    try {
      const r = await fetch(`${API}/api/investor/profiles`);
      const d = await r.json();
      setInvestors(d.data || []);
    } catch { /* silent */ }
  };

  const fetchMyProfile = async () => {
    try {
      const r = await fetch(`${API}/api/investor/profile/me`, { headers });
      const d = await r.json();
      if (d.data) {
        setMyProfile(d.data);
        setProfileForm({
          lookingFor: d.data.lookingFor || '',
          description: d.data.description || '',
          requirements: d.data.requirements || '',
          investmentFocus: d.data.investmentFocus || [],
          stage: d.data.stage || [],
          budget: d.data.budget || { min: 0, max: 0 }
        });
      }
    } catch { /* silent */ }
  };

  const fetchApplications = async () => {
    try {
      const r = await fetch(`${API}/api/investor/applications`, { headers });
      const d = await r.json();
      setApplications(d.data || []);
    } catch { /* silent */ }
  };

  const fetchMyApplications = async () => {
    try {
      const r = await fetch(`${API}/api/investor/my-applications`, { headers });
      const d = await r.json();
      setMyApplications(d.data || []);
    } catch { /* silent */ }
  };

  const fetchBookmarks = async () => {
    try {
      const r = await fetch(`${API}/api/investor/bookmarks`, { headers });
      const d = await r.json();
      setBookmarks(d.data || []);
    } catch { /* silent */ }
  };

  const fetchProducts = async () => {
    try {
      const r = await fetch(`${API}/api/products`);
      const d = await r.json();
      setProducts(Array.isArray(d) ? d : (d.products || []));
    } catch { /* silent */ }
  };

  const saveProfile = async () => {
    if (!token) { toast.error('Please sign in first'); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/investor/profile`, {
        method: 'POST', headers, body: JSON.stringify(profileForm)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMyProfile(d.data);
      toast.success('Profile saved');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally { setLoading(false); }
  };

  const submitApplication = async () => {
    if (!applyForm.pitch || !applyForm.productId) { toast.error('Select a product and write a pitch'); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/investor/apply`, {
        method: 'POST', headers,
        body: JSON.stringify({
          productId: applyForm.productId,
          investorId: selectedInvestor?.userId?._id || selectedInvestor?._id,
          pitch: applyForm.pitch,
          fundingAmount: applyForm.fundingAmount ? Number(applyForm.fundingAmount) : undefined,
          equity: applyForm.equity ? Number(applyForm.equity) : undefined
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success('Application submitted!');
      setApplyOpen(false);
      setApplyForm({ productId: '', pitch: '', fundingAmount: '', equity: '' });
      await fetchMyApplications();
      setActiveTab('applications');
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally { setLoading(false); }
  };

  const updateApplication = async (id: string, status: string) => {
    try {
      const r = await fetch(`${API}/api/investor/application/${id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(`Application ${status}`);
      fetchApplications();
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  const toggleBookmark = async (productId: string) => {
    if (!token) { toast.error('Please sign in first'); return; }
    try {
      const r = await fetch(`${API}/api/investor/bookmark`, {
        method: 'POST', headers, body: JSON.stringify({ productId })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(d.message);
      fetchBookmarks();
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    }
  };

  const seedDemoInvestors = async () => {
    try {
      const r = await fetch(`${API}/api/investor/seed`, { method: 'POST', headers });
      const d = await r.json();
      toast.success(d.message || 'Demo profiles created');
      fetchInvestors();
    } catch { toast.error('Seed failed'); }
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.productId?._id === id || b.productId === id);
  const toggleFocus = (cat: string) => setProfileForm(p => ({
    ...p, investmentFocus: p.investmentFocus.includes(cat)
      ? p.investmentFocus.filter(c => c !== cat) : [...p.investmentFocus, cat]
  }));
  const toggleStage = (s: string) => setProfileForm(p => ({
    ...p, stage: p.stage.includes(s) ? p.stage.filter(x => x !== s) : [...p.stage, s]
  }));

  const myProducts = products.filter((p: any) =>
    p.createdBy === userId || p.createdBy?._id === userId || p.author_id === userId
  );

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'investors', label: 'Investors', icon: Users },
    { id: 'profile', label: 'My Profile', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: Send },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-white" />
            <h1 className="text-3xl font-bold tracking-tight">Investor Connect</h1>
          </div>
          <p className="text-zinc-500 text-sm">Post investment criteria, apply for funding, and discover promising products.</p>
          {token && (
            <div className="flex gap-8 mt-6 pt-6 border-t border-zinc-900">
              <div><div className="text-2xl font-bold">{investors.length}</div><div className="text-xs text-zinc-500 mt-0.5">Active Investors</div></div>
              <div><div className="text-2xl font-bold">{myApplications.length}</div><div className="text-xs text-zinc-500 mt-0.5">My Applications</div></div>
              <div><div className="text-2xl font-bold">{bookmarks.length}</div><div className="text-xs text-zinc-500 mt-0.5">Bookmarks</div></div>
              {applications.length > 0 && <div><div className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</div><div className="text-xs text-zinc-500 mt-0.5">Pending Reviews</div></div>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tab bar */}
        <div className="flex border-b border-zinc-900 mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors
                ${activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* ── Investors Directory ── */}
        {activeTab === 'investors' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs text-zinc-600 uppercase tracking-wider">{investors.length} active investors</p>
              {token && (
                <Button size="sm" onClick={seedDemoInvestors}
                  className="text-xs h-7 bg-zinc-900 border border-zinc-700 text-white hover:text-white hover:bg-zinc-800">
                  <Plus className="w-3 h-3 mr-1" />Add Demo Investors
                </Button>
              )}
            </div>

            {investors.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                <p className="text-zinc-500 text-sm">No investor profiles yet.</p>
                <p className="text-zinc-700 text-xs mt-1">Click "Add Demo Investors" to populate, or create your own profile.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {investors.map((inv: any) => (
                  <div key={inv._id} className="bg-zinc-900 border border-zinc-800 hover:border-white/20 rounded-xl p-5 transition-colors">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="w-11 h-11 ring-1 ring-zinc-700">
                        <AvatarImage src={inv.userId?.profilePicture} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-zinc-800 text-white text-sm">
                          {inv.userId?.name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white">{inv.userId?.name}</h3>
                        <p className="text-xs text-zinc-500">{inv.userId?.jobTitle || inv.userId?.location}</p>
                      </div>
                    </div>

                    {inv.lookingFor && (
                      <p className="text-sm text-white/80 mb-3 italic leading-relaxed">"{inv.lookingFor}"</p>
                    )}
                    {inv.description && (
                      <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">{inv.description}</p>
                    )}

                    {inv.budget?.max > 0 && (
                      <p className="text-xs text-white mb-3">
                        Budget: <span className="text-white">${inv.budget.min?.toLocaleString()} – ${inv.budget.max?.toLocaleString()}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {inv.investmentFocus?.map((f: string) => (
                        <span key={f} className="text-[11px] border border-zinc-700 text-white px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                      {inv.stage?.map((s: string) => (
                        <span key={s} className="text-[11px] border border-zinc-800 text-zinc-600 px-2 py-0.5 rounded-full capitalize">{s}</span>
                      ))}
                    </div>

                    {token && inv.userId?._id !== userId && (
                      <Dialog open={applyOpen && selectedInvestor?._id === inv._id}
                        onOpenChange={(open) => { setApplyOpen(open); if (open) setSelectedInvestor(inv); }}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-white text-black hover:bg-zinc-200 h-8 text-xs">
                            <Send className="w-3 h-3 mr-1.5" />Apply for Funding
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Apply to {inv.userId?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div>
                              <label className="text-xs text-white mb-1.5 block uppercase tracking-wider">Select Your Product *</label>
                              <select value={applyForm.productId}
                                onChange={e => setApplyForm(p => ({ ...p, productId: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm">
                                <option value="">-- Choose a product --</option>
                                {myProducts.map((p: any) => <option key={p._id} value={p._id}>{p.title}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-white mb-1.5 block uppercase tracking-wider">Your Pitch *</label>
                              <Textarea placeholder="Describe your product, traction, and why this investor is a fit..."
                                value={applyForm.pitch} onChange={e => setApplyForm(p => ({ ...p, pitch: e.target.value }))}
                                className="bg-zinc-900 border-zinc-700 text-white min-h-32 placeholder-zinc-600 resize-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-white mb-1.5 block uppercase tracking-wider">Funding ($)</label>
                                <Input type="number" placeholder="10000" value={applyForm.fundingAmount}
                                  onChange={e => setApplyForm(p => ({ ...p, fundingAmount: e.target.value }))}
                                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600" />
                              </div>
                              <div>
                                <label className="text-xs text-white mb-1.5 block uppercase tracking-wider">Equity (%)</label>
                                <Input type="number" placeholder="5" value={applyForm.equity}
                                  onChange={e => setApplyForm(p => ({ ...p, equity: e.target.value }))}
                                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600" />
                              </div>
                            </div>
                            <Button onClick={submitApplication} disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200 h-10">
                              {loading ? 'Submitting...' : 'Submit Application'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── My Investor Profile ── */}
        {activeTab === 'profile' && (
          !token ? (
            <div className="text-center py-20 text-zinc-600 text-sm">Sign in to create your investor profile.</div>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold">{myProfile ? 'Edit Investor Profile' : 'Create Investor Profile'}</h2>
                <p className="text-xs text-zinc-500 mt-1">Tell creators what types of products you want to invest in.</p>
              </div>

              <div className="space-y-5">
                <Field label="What are you looking for?">
                  <Input placeholder="e.g. AI-powered productivity tools for remote teams"
                    value={profileForm.lookingFor} onChange={e => setProfileForm(p => ({ ...p, lookingFor: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600" />
                </Field>

                <Field label="About You / Investment Thesis">
                  <Textarea placeholder="Your background, what you bring beyond capital..."
                    value={profileForm.description} onChange={e => setProfileForm(p => ({ ...p, description: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white min-h-24 placeholder-zinc-600 resize-none" />
                </Field>

                <Field label="Requirements from Founders">
                  <Textarea placeholder="What do you expect? (e.g. technical team, existing revenue)"
                    value={profileForm.requirements} onChange={e => setProfileForm(p => ({ ...p, requirements: e.target.value }))}
                    className="bg-zinc-900 border-zinc-700 text-white min-h-20 placeholder-zinc-600 resize-none" />
                </Field>

                <Field label="Investment Focus">
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={() => toggleFocus(cat)}
                        className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                          profileForm.investmentFocus.includes(cat)
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent border-zinc-700 text-white hover:border-zinc-500'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Preferred Stage">
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map(s => (
                      <button key={s} onClick={() => toggleStage(s)}
                        className={`px-3 py-1 rounded-full text-xs border capitalize transition-colors ${
                          profileForm.stage.includes(s)
                            ? 'bg-white text-black border-white'
                            : 'bg-transparent border-zinc-700 text-white hover:border-zinc-500'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Min Budget ($)">
                    <Input type="number" value={profileForm.budget.min}
                      onChange={e => setProfileForm(p => ({ ...p, budget: { ...p.budget, min: Number(e.target.value) } }))}
                      className="bg-zinc-900 border-zinc-700 text-white" />
                  </Field>
                  <Field label="Max Budget ($)">
                    <Input type="number" value={profileForm.budget.max}
                      onChange={e => setProfileForm(p => ({ ...p, budget: { ...p.budget, max: Number(e.target.value) } }))}
                      className="bg-zinc-900 border-zinc-700 text-white" />
                  </Field>
                </div>

                <Button onClick={saveProfile} disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200 h-10">
                  {loading ? 'Saving...' : myProfile ? 'Update Profile' : 'Create Profile'}
                </Button>
              </div>
            </div>
          )
        )}

        {/* ── Applications ── */}
        {activeTab === 'applications' && (
          !token ? (
            <div className="text-center py-20 text-zinc-600 text-sm">Sign in to view applications.</div>
          ) : (
            <div className="space-y-8">
              {applications.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">
                    Incoming Applications — {applications.length}
                  </p>
                  <div className="space-y-3">
                    {applications.map((app: any) => (
                      <div key={app._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10 ring-1 ring-zinc-700 flex-shrink-0">
                            <AvatarImage src={app.creatorId?.profilePicture} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-zinc-800 text-white text-xs">
                              {app.creatorId?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-white text-sm">{app.creatorId?.name}</span>
                              <AppStatusPill status={app.status} />
                            </div>
                            <p className="text-xs text-zinc-500 mb-1">Product: <span className="text-zinc-300">{app.productId?.title}</span></p>
                            <p className="text-sm text-white line-clamp-3 mb-2">{app.pitch}</p>
                            {(app.fundingAmount || app.equity) && (
                              <p className="text-xs text-zinc-600">
                                {app.fundingAmount && `$${app.fundingAmount?.toLocaleString()}`}
                                {app.equity && ` · ${app.equity}% equity`}
                              </p>
                            )}
                          </div>
                          {app.status === 'pending' && (
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              <Button size="sm" onClick={() => updateApplication(app._id, 'accepted')}
                                className="bg-white text-black hover:bg-zinc-200 h-8 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />Accept
                              </Button>
                              <Button size="sm" onClick={() => updateApplication(app._id, 'rejected')}
                                className="bg-zinc-900 border border-zinc-700 text-white hover:text-white hover:bg-zinc-800 h-8 text-xs">
                                <XCircle className="w-3 h-3 mr-1" />Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">
                  My Submitted Applications — {myApplications.length}
                </p>
                {myApplications.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-xl p-10 text-center">
                    <Inbox className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                    <p className="text-zinc-500 text-sm">No applications submitted yet.</p>
                    <button onClick={() => setActiveTab('investors')}
                      className="mt-2 text-white text-sm underline underline-offset-2">
                      Browse investors
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myApplications.map((app: any) => (
                      <div key={app._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-10 h-10 ring-1 ring-zinc-700 flex-shrink-0">
                            <AvatarImage src={app.investorId?.profilePicture} referrerPolicy="no-referrer" />
                            <AvatarFallback className="bg-zinc-800 text-white text-xs">
                              {app.investorId?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs text-zinc-600 uppercase">To</span>
                              <span className="font-semibold text-white text-sm">{app.investorId?.name}</span>
                              <AppStatusPill status={app.status} />
                            </div>
                            <p className="text-xs text-zinc-500 mb-1">Product: <span className="text-zinc-300">{app.productId?.title}</span></p>
                            <p className="text-sm text-white line-clamp-2">{app.pitch}</p>
                            {app.investorNote && (
                              <p className="text-xs text-white mt-2 border-l-2 border-zinc-700 pl-2">{app.investorNote}</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {app.status === 'pending' && <Clock className="w-4 h-4 text-zinc-600" />}
                            {app.status === 'accepted' && <CheckCircle className="w-4 h-4 text-white" />}
                            {app.status === 'rejected' && <XCircle className="w-4 h-4 text-zinc-600" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ── Bookmarks ── */}
        {activeTab === 'bookmarks' && (
          !token ? (
            <div className="text-center py-20 text-zinc-600 text-sm">Sign in to view bookmarks.</div>
          ) : (
            <div className="space-y-8">
              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">Bookmarked Products — {bookmarks.length}</p>
                {bookmarks.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-xl p-10 text-center">
                    <Bookmark className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                    <p className="text-zinc-500 text-sm">No bookmarks yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {bookmarks.map((b: any) => {
                      const p = b.productId;
                      if (!p) return null;
                      return (
                        <div key={b._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3">
                          {p.media?.[0] && (
                            <img src={p.media[0]} alt={p.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-zinc-800" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-white text-sm leading-tight">{p.title}</h3>
                              <button onClick={() => toggleBookmark(p._id)} className="text-white hover:text-zinc-600 flex-shrink-0">
                                <BookmarkCheck className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{p.pitch}</p>
                            <button onClick={() => navigate(`/product/${p._id}`)}
                              className="text-xs text-white underline underline-offset-2 mt-2">
                              View product
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">Browse & Bookmark Products</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {products.slice(0, 9).map((p: any) => (
                    <div key={p._id} className="bg-zinc-900 border border-zinc-800 hover:border-white/20 rounded-xl p-3 transition-colors">
                      {p.media?.[0] && (
                        <img src={p.media[0]} alt={p.title} className="w-full h-24 object-cover rounded-lg mb-3 bg-zinc-800" />
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">{p.title}</h3>
                          <p className="text-xs text-zinc-600 line-clamp-1 mt-0.5">{p.pitch}</p>
                        </div>
                        <button onClick={() => toggleBookmark(p._id)}
                          className={`flex-shrink-0 transition-colors ${isBookmarked(p._id) ? 'text-white' : 'text-zinc-700 hover:text-white'}`}>
                          {isBookmarked(p._id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white mb-1.5 block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function AppStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'border-zinc-700 text-zinc-500',
    accepted: 'border-white/30 text-white',
    rejected: 'border-zinc-800 text-zinc-600',
    withdrawn: 'border-zinc-800 text-zinc-700'
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-full ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}
