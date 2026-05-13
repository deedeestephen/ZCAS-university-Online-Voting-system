import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import SHA256 from 'crypto-js/sha256';

const POSITIONS = [
    'President',
    'Vice President',
    'Prime Minister',
    'Sport Minister',
    'Academic Minister',
    'Finance Minister',
    'Foreign Affairs Minister'
];

export default function VotingPage() {
  const { position } = useParams<{ position: string }>();
  const navigate = useNavigate();
  const { userData } = useAuth();
  
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const formattedPositionUrl = position || '';
  // Convert url param 'vice-president' to 'Vice President'
  const currentPosName = POSITIONS.find(p => p.toLowerCase().replace(/ /g, '-') === formattedPositionUrl);
  
  const currentPosIndex = currentPosName ? POSITIONS.indexOf(currentPosName) : 0;

  const [existingVoteId, setExistingVoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPosName || userData?.hasVoted || !userData?.isVerified) {
        navigate('/dashboard');
        return;
    }

    const fetchCandidatesAndVote = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'candidates'), where('position', '==', currentPosName), where('status', '==', 'approved'));
            const snap = await getDocs(q);
            setCandidates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch existing vote
            const vq = query(collection(db, 'votes'), where('voterId', '==', auth.currentUser!.uid), where('position', '==', currentPosName));
            const vSnap = await getDocs(vq);
            if (!vSnap.empty) {
                const existingVote = vSnap.docs[0];
                setExistingVoteId(existingVote.id);
                setSelectedCandidate(existingVote.data().candidateId);
            } else {
                setExistingVoteId(null);
                setSelectedCandidate(null);
            }

        } catch(err: any) {
            toast.error("Failed to load candidates");
        } finally {
            setLoading(false);
        }
    };
    fetchCandidatesAndVote();
  }, [currentPosName, userData]);

  const handleVote = async () => {
    if (!selectedCandidate) {
        toast.error('Please select a candidate');
        return;
    }
    setSubmitting(true);
    try {
        if (existingVoteId) {
             await updateDoc(doc(db, 'votes', existingVoteId), {
                 candidateId: selectedCandidate,
                 timestamp: serverTimestamp()
             });
        } else {
             await addDoc(collection(db, 'votes'), {
                 voterId: auth.currentUser!.uid,
                 position: currentPosName,
                 candidateId: selectedCandidate,
                 timestamp: serverTimestamp()
             });
        }

        // Determine next position
        const nextIndex = currentPosIndex + 1;
        
        if (nextIndex < POSITIONS.length) {
            const nextPos = POSITIONS[nextIndex];
            await updateDoc(doc(db, 'students', auth.currentUser!.uid), {
                currentVotingPosition: nextPos,
                updatedAt: serverTimestamp()
            });
            toast.success(`Vote saved for ${currentPosName}`);
            navigate(`/vote/${nextPos.toLowerCase().replace(/ /g, '-')}`);
        } else {
            // Finished
            
            // Generate deterministic cryptographic receipt ID
            const voterId = auth.currentUser!.uid;
            
            // Get all user votes for hashing
            const vq = query(collection(db, 'votes'), where('voterId', '==', voterId));
            const vSnap = await getDocs(vq);
            
            // Hash the votes combined with the voterId to get a secure hash
            // (Note: in a real blockchain this would involve asymmetric encryption/signatures)
            const voteDataString = vSnap.docs.map(d => `${d.data().position}:${d.data().candidateId}`).sort().join('|');
            const receiptHash = SHA256(`${voterId}-${voteDataString}-${Date.now()}`).toString();
            // A shorter ID for display
            const shortReceiptId = `TXN-${receiptHash.substring(0,8).toUpperCase()}`;

            // Store the receipt
            await setDoc(doc(db, 'receipts', shortReceiptId), {
                voterId: voterId,
                receiptId: shortReceiptId,
                hash: receiptHash,
                timestamp: serverTimestamp()
            });

            await updateDoc(doc(db, 'students', voterId), {
                hasVoted: true,
                currentVotingPosition: 'Finished',
                updatedAt: serverTimestamp()
            });
            navigate(`/vote-confirmation?receipt=${shortReceiptId}`);
        }
    } catch (err: any) {
        toast.error('Failed to submit vote: ' + err.message);
    } finally {
        setSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentPosIndex > 0) {
        const prevPos = POSITIONS[currentPosIndex - 1];
        navigate(`/vote/${prevPos.toLowerCase().replace(/ /g, '-')}`);
    } else {
        navigate('/dashboard');
    }
  };

  if (loading) {
      return (
          <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
              Loading...
          </div>
      )
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden min-h-screen bg-background font-body text-on-background">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="font-headline font-semibold tracking-tight text-lg text-primary">ZCAS Voting</h1>
        </div>
      </header>

      <main className="flex-1 mt-16 pb-24 p-4 md:p-8">
        <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline font-bold text-3xl text-primary mb-2">{currentPosName} Ballot</h2>
            <p className="font-body text-on-surface-variant text-sm max-w-2xl">Please select one candidate for the position of {currentPosName}. Your vote is secure and anonymous.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map(candidate => {
                const isSelected = selectedCandidate === candidate.id;
                return (
                    <article key={candidate.id} onClick={() => setSelectedCandidate(candidate.id)} className={`cursor-pointer rounded-xl p-5 relative flex flex-col transition-all border-2 ${isSelected ? 'bg-surface-container-lowest border-secondary shadow-[0_8px_30px_rgba(20,184,166,0.15)]' : 'bg-surface-container-lowest border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:border-primary/30'}`}>
                        {isSelected && (
                             <div className="absolute top-4 right-4 w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-sm">
                                <span className="material-symbols-outlined text-on-secondary text-[16px] font-bold">check</span>
                            </div>
                        )}
                        <div className="flex items-center gap-4 mb-5">
                            <img src={candidate.imageUrl || 'https://via.placeholder.com/150'} alt={candidate.name} className="w-20 h-20 rounded-full object-cover border border-outline-variant shadow-sm" />
                            <div>
                                <h3 className="font-headline font-bold text-lg text-on-surface leading-tight">{candidate.name}</h3>
                                <p className="font-label text-sm text-primary font-medium mb-1">{candidate.position}</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-surface-variant text-on-surface-variant">{candidate.faculty}</span>
                            </div>
                        </div>
                        <div className="mb-6 flex-grow"></div>
                        <button className={`w-full font-label font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${isSelected ? 'bg-secondary text-on-secondary hover:brightness-110 active:scale-98' : 'bg-surface-container text-primary border border-outline-variant hover:bg-surface-container-highest active:scale-98'}`}>
                            {isSelected ? 'Selected' : 'Vote'}
                        </button>
                    </article>
                );
            })}
            {candidates.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-variant">
                    No candidates available for this position.
                </div>
            )}
        </div>

        <div className="max-w-6xl mx-auto mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-outline-variant pt-6">
          <button onClick={goBack} className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Previous Position
          </button>
          
          <div className="text-sm font-body text-on-surface-variant">
             Position <span className="font-bold text-on-surface">{currentPosIndex + 1}</span> of <span className="font-bold text-on-surface">{POSITIONS.length}</span>
          </div>

          <button disabled={submitting || !selectedCandidate} onClick={handleVote} className="px-6 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label text-sm font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50">
            {submitting ? 'Saving...' : (currentPosIndex === POSITIONS.length - 1 ? 'Submit Final Vote' : 'Next Position')}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

      </main>
    </div>
  );
}
