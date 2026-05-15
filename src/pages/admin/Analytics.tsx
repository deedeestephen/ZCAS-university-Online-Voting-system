import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { collection, getDocs, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebase';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [turnout, setTurnout] = useState(0);
  const [schoolTrends, setSchoolTrends] = useState({ Business: 0, Law: 0, IT: 0, Finance: 0 });
  const [peakHour, setPeakHour] = useState('10:00 AM - 11:00 AM');
  const [lowHour, setLowHour] = useState('02:00 PM - 03:00 PM');
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [electionResults, setElectionResults] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    // Listen to changes in students and votes
    const unsubscribeCandidates = onSnapshot(collection(db, 'candidates'), (snap) => {
        setAllCandidates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'candidates');
    });

    const unsubscribeStudents = onSnapshot(collection(db, 'students'), (snap) => {
        setTotalStudents(snap.size);
        const docs = snap.docs.map(d => ({id: d.id, ...d.data()}));
        setAllStudents(docs);
        
        let businessVoters = 0; let businessTotal = 0;
        let lawVoters = 0; let lawTotal = 0;
        let itVoters = 0; let itTotal = 0;
        let financeVoters = 0; let financeTotal = 0;

        docs.forEach((s: any) => {
          const p = (s.program || s.programme || '').toLowerCase();
          const hasVoted = s.hasVoted;
          let category = '';
          if (p.includes('business') || p.includes('admin') || p.includes('bba')) category = 'Business';
          else if (p.includes('law') || p.includes('llb')) category = 'Law';
          else if (p.includes('it') || p.includes('computer') || p.includes('software') || p.includes('tech')) category = 'IT';
          else if (p.includes('finance') || p.includes('account') || p.includes('econ')) category = 'Finance';

          if (category === 'Business') { businessTotal++; if (hasVoted) businessVoters++; }
          if (category === 'Law') { lawTotal++; if (hasVoted) lawVoters++; }
          if (category === 'IT') { itTotal++; if (hasVoted) itVoters++; }
          if (category === 'Finance') { financeTotal++; if (hasVoted) financeVoters++; }
        });

        setSchoolTrends({
            Business: businessTotal > 0 ? Math.round((businessVoters / businessTotal) * 100) : 0,
            Law: lawTotal > 0 ? Math.round((lawVoters / lawTotal) * 100) : 0,
            IT: itTotal > 0 ? Math.round((itVoters / itTotal) * 100) : 0,
            Finance: financeTotal > 0 ? Math.round((financeVoters / financeTotal) * 100) : 0,
        });
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });

    const unsubscribeVotes = onSnapshot(collection(db, 'votes'), (snap) => {
        // Technically this gives total votes cast across all positions, 
        // to get unique voters we might need to count by user.
        // Assuming we count unique voters by filtering unique voterId
        const uniqueVoters = new Set();
        const hourlyCounts: Record<number, number> = {};
        const results: Record<string, Record<string, number>> = {};
        
        snap.forEach(doc => {
            const data = doc.data();
            uniqueVoters.add(data.voterId);
            
            const pos = data.position;
            const candId = data.candidateId;
            if (pos && candId) {
                if (!results[pos]) results[pos] = {};
                results[pos][candId] = (results[pos][candId] || 0) + 1;
            }

            if (data.timestamp) {
               const date = data.timestamp.toDate();
               const hour = date.getHours();
               hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
            }
        });
        setTotalVotes(uniqueVoters.size);
        setElectionResults(results);

        let maxHour = -1; let maxCount = -1;
        let minHour = -1; let minCount = Infinity;
        const dataArr = [];
        for (let i = 8; i <= 18; i++) {
           const c = hourlyCounts[i] || 0;
           if (c > maxCount) { maxCount = c; maxHour = i; }
           if (c < minCount) { minCount = c; minHour = i; }
           
           const hourKey = `${i === 12 ? 12 : i % 12}:00 ${i >= 12 ? 'PM' : 'AM'}`;
           dataArr.push({ time: hourKey, votes: c });
        }
        setHourlyData(dataArr);
        
        if (maxHour !== -1) {
            setPeakHour(`${maxHour === 0 ? 12 : maxHour > 12 ? maxHour - 12 : maxHour}:00 ${maxHour >= 12 ? 'PM' : 'AM'} - ${maxHour + 1 === 24 ? 12 : (maxHour + 1) > 12 ? (maxHour + 1) - 12 : (maxHour + 1)}:00 ${(maxHour + 1) >= 12 && (maxHour + 1) < 24 ? 'PM' : 'AM'}`);
        }
        if (minHour !== -1) {
            setLowHour(`${minHour === 0 ? 12 : minHour > 12 ? minHour - 12 : minHour}:00 ${minHour >= 12 ? 'PM' : 'AM'} - ${minHour + 1 === 24 ? 12 : (minHour + 1) > 12 ? (minHour + 1) - 12 : (minHour + 1)}:00 ${(minHour + 1) >= 12 && (minHour + 1) < 24 ? 'PM' : 'AM'}`);
        }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'votes');
    });

    return () => {
        unsubscribeCandidates();
        unsubscribeStudents();
        unsubscribeVotes();
    }
  }, []);

  useEffect(() => {
    if (totalStudents > 0) {
        setTurnout(Number(((totalVotes / totalStudents) * 100).toFixed(1)));
    }
  }, [totalStudents, totalVotes]);

  return (
    <AdminLayout>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-surface pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="mb-6">
            <h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Analytics Dashboard</h2>
            <p className="text-on-surface-variant mt-1 text-sm">Real-time overview of the current electoral process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric Card 1 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-8xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-on-surface-variant font-label uppercase tracking-wider group-hover:text-primary transition-colors">Total Registered Voters</p>
                <h3 className="text-4xl font-headline font-bold text-on-surface mt-2">{totalStudents}</h3>
              </div>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <span className="flex items-center text-secondary text-sm font-medium bg-secondary-container px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[16px] mr-1">trending_up</span> 4.2%
                </span>
                <span className="text-xs text-outline">vs last election</span>
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-8xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_vote</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-on-surface-variant font-label uppercase tracking-wider group-hover:text-primary transition-colors">Total Votes Cast</p>
                <h3 className="text-4xl font-headline font-bold text-primary mt-2">{totalVotes}</h3>
              </div>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                <span className="flex items-center text-secondary text-sm font-medium bg-secondary-container px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[16px] mr-1">bolt</span> Live
                </span>
                <span className="text-xs text-outline">Polling stations active</span>
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-primary-container text-on-primary-container rounded-xl p-6 shadow-[0_4px_20px_rgba(30,58,138,0.15)] flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 border border-primary-container">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary opacity-90"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-primary-fixed-dim font-label uppercase tracking-wider">Turnout Percentage</p>
                <h3 className="text-5xl font-headline font-black text-on-primary mt-2 group-hover:scale-105 origin-left transition-transform duration-300">{turnout}%</h3>
              </div>
              <div className="mt-4 relative z-10">
                <div className="w-full bg-black/20 rounded-full h-2 mt-2">
                  <div className="bg-secondary-fixed h-2 rounded-full transition-all duration-1000 ease-out group-hover:animate-pulse" style={{ width: `${turnout}%` }}></div>
                </div>
                <p className="text-xs text-primary-fixed mt-2 text-right">Target: 80%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart Area */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-headline font-semibold text-on-surface">Voting Trends by School</h3>
                <button className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-[20px]">filter_list</span>
                </button>
              </div>
              
              <div className="h-64 flex items-end gap-4 px-2">
                <div className="flex-1 flex flex-col justify-end group">
                  <div className="w-full bg-primary-container rounded-t-md hover:opacity-80 transition-all duration-300 relative" style={{ height: `${schoolTrends.Business || 5}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{schoolTrends.Business}%</span>
                  </div>
                  <span className="text-xs text-center mt-2 text-on-surface-variant font-medium">Business</span>
                </div>
                <div className="flex-1 flex flex-col justify-end group">
                  <div className="w-full bg-secondary rounded-t-md hover:opacity-80 transition-all duration-300 relative" style={{ height: `${schoolTrends.Law || 5}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{schoolTrends.Law}%</span>
                  </div>
                  <span className="text-xs text-center mt-2 text-on-surface-variant font-medium">Law</span>
                </div>
                <div className="flex-1 flex flex-col justify-end group">
                  <div className="w-full bg-primary rounded-t-md hover:opacity-80 transition-all duration-300 relative" style={{ height: `${schoolTrends.IT || 5}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{schoolTrends.IT}%</span>
                  </div>
                  <span className="text-xs text-center mt-2 text-on-surface-variant font-medium">IT</span>
                </div>
                <div className="flex-1 flex flex-col justify-end group">
                  <div className="w-full bg-surface-tint rounded-t-md hover:opacity-80 transition-all duration-300 relative" style={{ height: `${schoolTrends.Finance || 5}%` }}>
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">{schoolTrends.Finance}%</span>
                  </div>
                  <span className="text-xs text-center mt-2 text-on-surface-variant font-medium">Finance</span>
                </div>
              </div>
            </div>

            {/* Line Chart Area */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6 flex flex-col">
              <div className="mb-4">
                <h3 className="text-lg font-headline font-semibold text-on-surface">Hourly Activity</h3>
                <p className="text-xs text-on-surface-variant">Votes cast per hour</p>
              </div>
              <div className="flex-1 relative w-full h-40 bg-surface-container-low rounded-lg overflow-hidden border border-outline-variant/20 mt-2 hover:border-secondary/50 transition-colors duration-300">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} minTickGap={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                      itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="votes" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-outline-variant/20 pb-2">
                  <span className="text-on-surface-variant flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary"></span> Peak Hour</span>
                  <span className="font-semibold">{peakHour}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-on-surface-variant flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-outline"></span> Low Point</span>
                  <span className="font-semibold">{lowHour}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Results Area */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-headline font-semibold text-on-surface">Real-Time Election Results</h3>
              <p className="text-xs text-on-surface-variant">Live vote counts per candidate</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Object.entries(
                 allCandidates.reduce((acc, candidate) => {
                   const pos = candidate.position;
                   if (!acc[pos]) acc[pos] = [];
                   acc[pos].push(candidate);
                   return acc;
                 }, {} as Record<string, any[]>)
              ).map(([position, candidates]: [string, any]) => {
                 // Sort candidates by votes
                 const sortedCandidates = candidates.sort((a: any, b: any) => {
                     const votesA = electionResults[position]?.[a.id] || 0;
                     const votesB = electionResults[position]?.[b.id] || 0;
                     return votesB - votesA;
                 });
                 const totalVotesPos = sortedCandidates.reduce((sum: number, c: any) => sum + (electionResults[position]?.[c.id] || 0), 0);
          
                 return (
                   <div key={position} className="bg-surface-container-low rounded-lg p-5 border border-outline-variant/20">
                     <h4 className="text-md font-semibold text-on-surface mb-4 flex justify-between items-center">
                        <span className="font-headline tracking-wide uppercase text-sm text-primary">{position}</span>
                        <span className="text-xs font-medium text-on-surface-variant bg-surface-variant px-2 py-1 rounded-full">{totalVotesPos} total votes</span>
                     </h4>
                     <div className="space-y-4">
                       {sortedCandidates.map((candidate: any) => {
                          const votes = electionResults[position]?.[candidate.id] || 0;
                          const percentage = totalVotesPos > 0 ? ((votes / totalVotesPos) * 100).toFixed(1) : '0.0';
                          return (
                            <div key={candidate.id} className="relative transition-all hover:bg-surface p-2 rounded-lg -mx-2">
                               <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-3">
                                     {candidate.imageUrl ? (
                                         <img src={candidate.imageUrl} alt={candidate.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant shadow-sm" />
                                     ) : (
                                         <div className="w-10 h-10 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm border border-outline-variant shadow-sm">
                                            {candidate.name?.charAt(0) || '?'}
                                         </div>
                                     )}
                                     <div>
                                        <div className="text-sm font-medium text-on-surface">{candidate.name}</div>
                                        <div className="text-xs text-on-surface-variant">{candidate.faculty}</div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-sm font-bold text-on-surface">{votes}</div>
                                     <div className="text-[10px] text-outline font-medium">{percentage}%</div>
                                  </div>
                               </div>
                               <div className="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }}></div>
                               </div>
                            </div>
                          );
                       })}
                     </div>
                   </div>
                 );
              })}
              {allCandidates.length === 0 && (
                  <div className="col-span-1 md:col-span-2 py-12 text-center text-on-surface-variant text-sm bg-surface-container rounded-lg border border-dashed border-outline-variant/50">
                     No candidates available to show results.
                  </div>
              )}
            </div>
          </div>

          {/* Student Search Area */}
          <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-lg font-headline font-semibold text-on-surface">Student Search</h3>
                <p className="text-xs text-on-surface-variant">Find students by name, ID, or email</p>
              </div>
              <div className="relative w-full md:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            {searchQuery && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-max">
                  <thead>
                    <tr className="border-b border-outline-variant/40">
                      <th className="pb-3 px-4 text-sm font-semibold text-on-surface-variant flex-1 whitespace-nowrap">Student ID</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-on-surface-variant flex-1 whitespace-nowrap">Name</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-on-surface-variant flex-1 whitespace-nowrap">Email</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-on-surface-variant flex-1 whitespace-nowrap">Program</th>
                      <th className="pb-3 px-4 text-sm font-semibold text-on-surface-variant flex-1 whitespace-nowrap text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.filter(s => {
                      const q = searchQuery.toLowerCase();
                      return (
                        s.studentId?.toLowerCase().includes(q) ||
                        s.name?.toLowerCase().includes(q) ||
                        s.fullName?.toLowerCase().includes(q) ||
                        s.email?.toLowerCase().includes(q)
                      );
                    }).slice(0, 10).map((student) => (
                      <tr key={student.id} className="border-b border-outline-variant/20 hover:bg-surface-container/50 transition-colors">
                        <td className="py-3 px-4 text-sm text-on-surface font-mono whitespace-nowrap">{student.studentId}</td>
                        <td className="py-3 px-4 text-sm text-on-surface font-medium whitespace-nowrap">{student.name || student.fullName}</td>
                        <td className="py-3 px-4 text-sm text-on-surface-variant whitespace-nowrap">{student.email}</td>
                        <td className="py-3 px-4 text-sm text-on-surface-variant whitespace-nowrap">{student.program || student.programme}</td>
                        <td className="py-3 px-4 text-sm text-right whitespace-nowrap">
                          {student.hasVoted ? (
                            <span className="px-2 py-1 bg-secondary-container text-secondary rounded-full text-xs font-medium">Voted</span>
                          ) : student.isVerified ? (
                            <span className="px-2 py-1 bg-primary-container text-primary rounded-full text-xs font-medium">Verified</span>
                          ) : (
                            <span className="px-2 py-1 bg-surface-container rounded-full text-xs text-on-surface-variant">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {allStudents.filter(s => {
                      const q = searchQuery.toLowerCase();
                      return s.studentId?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q) || s.fullName?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-on-surface-variant text-sm">
                          No students found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </AdminLayout>
  );
}
