'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function CommentPage() {
    const { data: session } = useSession();
    const params = useParams();
    const blogId = params?.id as string;

    const [message, setMessage] = useState('');
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch all comments
    const fetchComments = async (blogId: string) => {
        try {
            const res = await fetch(`/api/comment/${blogId}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error("Fetching comments failed:", error);
        }
    };

    // Add a new comment
    const addComment = async (blogId: string) => {
        if (!message.trim()) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/comment/${blogId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ comment: message }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to post comment");

            setMessage('');
            await fetchComments(blogId);
        } catch (error) {
            console.error("Adding comment failed:", error);
        } finally {
            setLoading(false); // ✅ always stop loading
        }
    };
    // Load comments when blogId changes
    useEffect(() => {
        if (blogId) fetchComments(blogId);
    }, [blogId]);

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Comment Section</h1>

            {session ? (
                <form
                    className="space-y-4 mb-8"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await addComment(blogId);
                    }}
                >
                    <Textarea
                        placeholder="Your comment"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? "Posting..." : "Post Comment"}
                    </Button>
                </form>
            ) : (
                <p className="text-gray-500">Please sign in to post a comment.</p>
            )}

            <h2 className="text-2xl font-semibold mb-4">
                All Comments {comments.length}
            </h2>

            <div className="space-y-4">
                {comments.map((c: any) => {
                    const userEmail = session?.user?.email;
                    const isOwnComment = userEmail ? userEmail === c.email : false;

                    return (
                        <div key={c._id} className="border rounded p-2">
                            <strong>{isOwnComment ? "You" : c.name || "Anonymous"}</strong>
                            <p>{c.comment}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
