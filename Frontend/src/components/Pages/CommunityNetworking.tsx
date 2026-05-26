import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/context/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users, UserPlus, UserMinus, GitBranch, Network,
  CheckCircle, XCircle, Clock, Send, Eye, ArrowRight, Inbox, Radio
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "https://fyp-1ejm.vercel.app";

type Tab = 'discover' | 'network' | 'collaborations' | 'feed';
type CollabView = 'incoming' | 'sent';

export default function CommunityNetworking() {
  const { userId } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const [collabView, setCollabView] = useState<CollabView>('incoming');

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [incomingCollabs, setIncomingCollabs] = useState<any[]>([]);
  const [sentCollabs, setSentCollabs] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [btnLoading, setBtnLoading] = useState<Record<string, boolean>>({});

  const [collabOpen, setCollabOpen] = useState(false);
  const [collabTarget, setCollabTarget] = useState<any>(null);
  const [collabMessage, setCollabMessage] = useState('');
  const [collabSkills, setCollabSkills] = useState('');
  const [collabProductId, setCollabProductId] = useState('');
  const [searchPeople, setSearchPeople] = useState('');

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetchAllUsers();
    if (token && userId) {
      fetchNetwork();
      fetchCollaborations();
      fetchFeed();
      fetchMyProducts();
    }
  }, [token, userId]);

  const fetchAllUsers = async () => {
    try {
      const r = await fetch(`${API}/api/community/users`);
      const d = await r.json();
      setAllUsers(d.data || []);
    } catch { /* silent */ }
  };

  const fetchNetwork = async () => {
    try {
      const r = await fetch(`${API}/api/community/network/${userId}`);
      const d = await r.json();
      setFollowers(d.data?.followers || []);
      setFollowing(d.data?.following || []);
      const map: Record<string, boolean> = {};
      (d.data?.following || []).forEach((u: any) => { map[u._id] = true; });
      setFollowStatus(map);
    } catch { /* silent */ }
  };

  const fetchCollaborations = async () => {
    try {
      const [inc, sent] = await Promise.all([
        fetch(`${API}/api/community/collaborations`, { headers }),
        fetch(`${API}/api/community/sent-collaborations`, { headers })
      ]);
      const [incD, sentD] = await Promise.all([inc.json(), sent.json()]);
      setIncomingCollabs(incD.data || []);
      setSentCollabs(sentD.data || []);
    } catch { /* silent */ }
  };

  const fetchFeed = async () => {
    try {
      const r = await fetch(`${API}/api/community/feed/${userId}`);
      const d = await r.json();
      setFeed(d.data || []);
    } catch { /* silent */ }
  };

  const fetchMyProducts = async () => {
    try {
      const r = await fetch(`${API}/api/products`);
      const d = await r.json();
      const all = Array.isArray(d) ? d : (d.products || []);
      setMyProducts(all.filter((p: any) =>
        p.createdBy === userId || p.createdBy?._id === userId || p.author_id === userId
      ));
    } catch { /* silent */ }
  };

  const handleFollow = async (targetId: string) => {
    if (!token) { toast.error('Please sign in first'); return; }
    setBtnLoading(p => ({ ...p, [targetId]: true }));
    try {
      if (followStatus[targetId]) {
        const r = await fetch(`${API}/api/community/unfollow/${targetId}`, { method: 'DELETE', headers });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setFollowStatus(p => ({ ...p, [targetId]: false }));
        toast.success('Unfollowed');
      } else {
        const r = await fetch(`${API}/api/community/follow`, {
          method: 'POST', headers, body: JSON.stringify({ userId: targetId })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setFollowStatus(p => ({ ...p, [targetId]: true }));
        toast.success('Following!');
      }
      fetchNetwork();
    } catch (e: any) {
      toast.error(e.message || 'Action failed');
    } finally {
      setBtnLoading(p => ({ ...p, [targetId]: false }));
    }
  };

  const submitCollab = async () => {
    if (!collabMessage.trim()) { toast.error('Message is required'); return; }
    setBtnLoading(p => ({ ...p, collab: true }));
    try {
      const r = await fetch(`${API}/api/community/collaborate`, {
        method: 'POST', headers,
        body: JSON.stringify({
          toUserId: collabTarget._id,
          productId: collabProductId || undefined,
          message: collabMessage,
          skills: collabSkills.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success('Collaboration request sent!');
      setCollabOpen(false);
      setCollabMessage(''); setCollabSkills(''); setCollabProductId('');
      await fetchCollaborations();
      // Navigate user to see their sent request
      setActiveTab('collaborations');
      setCollabView('sent');
    } catch (e: any) {
      toast.error(e.message || 'Failed to send');
    } finally {
      setBtnLoading(p => ({ ...p, collab: false }));
    }
  };

  const updateCollab = async (id: string, status: 'accepted' | 'rejected') => {
    setBtnLoading(p => ({ ...p, [id]: true }));
    try {
      const r = await fetch(`${API}/api/community/collaborate/${id}`, {
        method: 'PUT', headers, body: JSON.stringify({ status })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(`Request ${status}`);
      fetchCollaborations();
    } catch (e: any) {
      toast.error(e.message || 'Failed');
    } finally {
      setBtnLoading(p => ({ ...p, [id]: false }));
    }
  };

  const pendingIncoming = incomingCollabs.filter(c => c.status === 'pending').length;

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'discover', label: 'Find People', icon: Users },
    { id: 'network', label: 'My Network', icon: Network },
    { id: 'collaborations', label: 'Collaborations', icon: GitBranch },
    { id: 'feed', label: 'Network Feed', icon: Eye },
  ];

  const filteredUsers = allUsers.filter(u =>
    u._id !== userId &&
    (!searchPeople || u.name?.toLowerCase().includes(searchPeople.toLowerCase()) ||
      u.bio?.toLowerCase().includes(searchPeople.toLowerCase()) ||
      u.jobTitle?.toLowerCase().includes(searchPeople.toLowerCase()))
  );

  // ── User card ──
  const UserCard = ({ u }: { u: any }) => (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-white/30 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="w-11 h-11 ring-1 ring-zinc-700 cursor-pointer"
            onClick={() => navigate(`/product-owner/${u._id}`)}>
            <AvatarFallback className="bg-zinc-800 text-white text-sm">
              {u.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
            <AvatarImage src={u.profilePicture} referrerPolicy="no-referrer" />
          </Avatar>
          <div className="flex-1 min-w-0">
            <button onClick={() => navigate(`/product-owner/${u._id}`)}
              className="font-semibold text-white hover:underline text-sm text-left">
              {u.name}
            </button>
            {u.jobTitle && <p className="text-xs text-zinc-400 mt-0.5">{u.jobTitle}</p>}
            {u.location && <p className="text-xs text-zinc-600">{u.location}</p>}
            {u.bio && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{u.bio}</p>}
          </div>
        </div>

        {token && u._id !== userId && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleFollow(u._id)}
              disabled={btnLoading[u._id]}
              className={`flex-1 text-xs h-8 ${followStatus[u._id]
                ? 'bg-zinc-800 hover:bg-red-900/30 hover:text-red-400 hover:border-red-800 text-zinc-300 border border-zinc-700'
                : 'bg-white text-black hover:bg-zinc-200'}`}>
              {btnLoading[u._id] ? '...' : followStatus[u._id]
                ? <><UserMinus className="w-3 h-3 mr-1" />Unfollow</>
                : <><UserPlus className="w-3 h-3 mr-1" />Follow</>}
            </Button>

            <Dialog open={collabOpen && collabTarget?._id === u._id}
              onOpenChange={(open) => { setCollabOpen(open); if (open) setCollabTarget(u); }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline"
                  className="flex-1 text-xs h-8 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <GitBranch className="w-3 h-3 mr-1" />Collaborate
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-white">Collaborate with {u.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1.5 block uppercase tracking-wider">Your Message *</label>
                    <Textarea placeholder="What would you like to work on together?"
                      value={collabMessage} onChange={e => setCollabMessage(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white min-h-24 placeholder-zinc-600 resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1.5 block uppercase tracking-wider">Skills You Offer</label>
                    <Input placeholder="e.g. React, Node.js, UI Design (comma-separated)"
                      value={collabSkills} onChange={e => setCollabSkills(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600" />
                  </div>
                  {myProducts.length > 0 && (
                    <div>
                      <label className="text-xs text-zinc-400 mb-1.5 block uppercase tracking-wider">Related Product</label>
                      <select value={collabProductId} onChange={e => setCollabProductId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-white text-sm">
                        <option value="">No specific product</option>
                        {myProducts.map((p: any) => <option key={p._id} value={p._id}>{p.title}</option>)}
                      </select>
                    </div>
                  )}
                  <Button onClick={submitCollab} disabled={btnLoading['collab']}
                    className="w-full bg-white text-black hover:bg-zinc-200 h-10">
                    {btnLoading['collab'] ? 'Sending...' : <><Send className="w-4 h-4 mr-2" />Send Request</>}
                  </Button>
                  <p className="text-xs text-zinc-600 text-center">
                    After sending, you'll be taken to your Sent Requests to track status.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-6 h-6 text-white" />
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
          </div>
          <p className="text-zinc-500 text-sm">Follow makers, collaborate, and stay connected with your network.</p>

          {token && (
            <div className="flex gap-8 mt-6 pt-6 border-t border-zinc-900">
              <div>
                <div className="text-2xl font-bold">{followers.length}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Followers</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{following.length}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Following</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingIncoming}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Pending Requests</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{sentCollabs.length}</div>
                <div className="text-xs text-zinc-500 mt-0.5">Sent Requests</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Tab Bar */}
        <div className="flex border-b border-zinc-900 mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors relative
                ${activeTab === tab.id
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'collaborations' && pendingIncoming > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-black text-[10px] rounded-full flex items-center justify-center font-bold">
                  {pendingIncoming}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Find People ── */}
        {activeTab === 'discover' && (
          <div>
            <div className="mb-4">
              <Input placeholder="Search by name, role, or bio..."
                value={searchPeople} onChange={e => setSearchPeople(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 max-w-sm h-9" />
            </div>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-16 text-zinc-600">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No users found.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredUsers.map((u: any) => <UserCard key={u._id} u={u} />)}
              </div>
            )}
          </div>
        )}

        {/* ── My Network ── */}
        {activeTab === 'network' && (
          !token ? (
            <div className="text-center py-20 text-zinc-600 text-sm">Sign in to view your network.</div>
          ) : (
            <div className="space-y-10">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                    Following — {following.length}
                  </h3>
                </div>
                {following.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center">
                    <p className="text-zinc-600 text-sm">You're not following anyone.</p>
                    <button onClick={() => setActiveTab('discover')}
                      className="mt-2 text-white text-sm underline underline-offset-2 flex items-center gap-1 mx-auto">
                      Find people <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {following.map((u: any) => u && <UserCard key={u._id} u={u} />)}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                  Followers — {followers.length}
                </h3>
                {followers.length === 0 ? (
                  <div className="border border-dashed border-zinc-800 rounded-xl p-8 text-center">
                    <p className="text-zinc-600 text-sm">No followers yet.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {followers.map((u: any) => u && <UserCard key={u._id} u={u} />)}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ── Collaborations ── */}
        {activeTab === 'collaborations' && (
          !token ? (
            <div className="text-center py-20 text-zinc-600 text-sm">Sign in to view collaboration requests.</div>
          ) : (
            <div>
              {/* Sub-nav */}
              <div className="flex gap-1 mb-6 bg-zinc-900 p-1 rounded-lg w-fit">
                <button onClick={() => setCollabView('incoming')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    collabView === 'incoming' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
                  <Inbox className="w-3.5 h-3.5" />
                  Incoming
                  {pendingIncoming > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      collabView === 'incoming' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                      {pendingIncoming}
                    </span>
                  )}
                </button>
                <button onClick={() => setCollabView('sent')}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    collabView === 'sent' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
                  <Send className="w-3.5 h-3.5" />
                  Sent
                  {sentCollabs.length > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      collabView === 'sent' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                      {sentCollabs.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Incoming */}
              {collabView === 'incoming' && (
                <div className="space-y-3">
                  {incomingCollabs.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 rounded-xl p-10 text-center">
                      <Inbox className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                      <p className="text-zinc-500 text-sm">No incoming collaboration requests.</p>
                      <p className="text-zinc-700 text-xs mt-1">When someone sends you a request, it will appear here.</p>
                    </div>
                  ) : incomingCollabs.map((req: any) => (
                    <div key={req._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10 ring-1 ring-zinc-700 flex-shrink-0">
                          <AvatarImage src={req.fromUserId?.profilePicture} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-zinc-800 text-white text-xs">
                            {req.fromUserId?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-white text-sm">{req.fromUserId?.name}</span>
                            {req.fromUserId?.jobTitle && (
                              <span className="text-xs text-zinc-500">{req.fromUserId.jobTitle}</span>
                            )}
                            <StatusPill status={req.status} />
                          </div>
                          <p className="text-sm text-zinc-300 mb-2 leading-relaxed">{req.message}</p>
                          {req.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="text-xs text-zinc-600 mr-1">Offers:</span>
                              {req.skills.map((s: string) => (
                                <span key={s} className="text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {req.productId && (
                            <p className="text-xs text-zinc-600">
                              Re: <span className="text-zinc-400">{req.productId?.title}</span>
                            </p>
                          )}
                          <p className="text-xs text-zinc-700 mt-2">
                            {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Button size="sm" onClick={() => updateCollab(req._id, 'accepted')}
                              disabled={btnLoading[req._id]}
                              className="bg-white text-black hover:bg-zinc-200 h-8 text-xs px-3">
                              <CheckCircle className="w-3 h-3 mr-1" />Accept
                            </Button>
                            <Button size="sm" onClick={() => updateCollab(req._id, 'rejected')}
                              disabled={btnLoading[req._id]}
                              className="bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 text-xs px-3">
                              <XCircle className="w-3 h-3 mr-1" />Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sent */}
              {collabView === 'sent' && (
                <div className="space-y-3">
                  {sentCollabs.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 rounded-xl p-10 text-center">
                      <Radio className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
                      <p className="text-zinc-500 text-sm">No sent collaboration requests.</p>
                      <button onClick={() => setActiveTab('discover')}
                        className="mt-2 text-white text-sm underline underline-offset-2 flex items-center gap-1 mx-auto">
                        Find people to collaborate with <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : sentCollabs.map((req: any) => (
                    <div key={req._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10 ring-1 ring-zinc-700 flex-shrink-0">
                          <AvatarImage src={req.toUserId?.profilePicture} referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-zinc-800 text-white text-xs">
                            {req.toUserId?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">To</span>
                            <span className="font-semibold text-white text-sm">{req.toUserId?.name}</span>
                            <StatusPill status={req.status} />
                          </div>
                          <p className="text-sm text-zinc-300 mb-2 leading-relaxed">{req.message}</p>
                          {req.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              <span className="text-xs text-zinc-600 mr-1">Skills offered:</span>
                              {req.skills.map((s: string) => (
                                <span key={s} className="text-xs border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {req.productId && (
                            <p className="text-xs text-zinc-600">
                              Re: <span className="text-zinc-400">{req.productId?.title}</span>
                            </p>
                          )}
                          <p className="text-xs text-zinc-700 mt-2">
                            Sent {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {req.status === 'pending' && <Clock className="w-4 h-4 text-zinc-600" />}
                          {req.status === 'accepted' && <CheckCircle className="w-4 h-4 text-white" />}
                          {req.status === 'rejected' && <XCircle className="w-4 h-4 text-zinc-600" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}

        {/* ── Network Feed ── */}
        {activeTab === 'feed' && (
          !token ? (
            <div className="text-center py-20 text-zinc-600 text-sm">Sign in to see your network feed.</div>
          ) : feed.length === 0 ? (
            <div className="border border-dashed border-zinc-800 rounded-xl p-12 text-center">
              <Eye className="w-8 h-8 mx-auto mb-3 text-zinc-700" />
              <p className="text-zinc-500 text-sm">Nothing in your feed yet.</p>
              <button onClick={() => setActiveTab('discover')}
                className="mt-2 text-white text-sm underline underline-offset-2 flex items-center gap-1 mx-auto">
                Follow people to see what they're building <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-4">Recent launches from people you follow</p>
              {feed.map((product: any) => (
                <div key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-zinc-900 border border-zinc-800 hover:border-white/20 rounded-xl p-4 cursor-pointer transition-colors flex gap-4">
                  {product.media?.[0] && (
                    <img src={product.media[0]} alt={product.title}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-zinc-800" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-4 h-4">
                        <AvatarFallback className="bg-zinc-700 text-white text-[8px]">
                          {product.createdBy?.name?.charAt(0)}
                        </AvatarFallback>
                        <AvatarImage src={product.createdBy?.profilePicture} />
                      </Avatar>
                      <span className="text-xs text-zinc-500">{product.createdBy?.name}</span>
                      <span className="text-xs text-zinc-700">·</span>
                      <span className="text-xs text-zinc-700">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-sm">{product.title}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{product.pitch}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-700 self-center flex-shrink-0" />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'border-zinc-700 text-zinc-500',
    accepted: 'border-white/30 text-white',
    rejected: 'border-zinc-800 text-zinc-600'
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider border px-2 py-0.5 rounded-full ${map[status] || map.pending}`}>
      {status}
    </span>
  );
}
