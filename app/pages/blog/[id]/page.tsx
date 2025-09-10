"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    Heart,
    MessageCircle,
    Pencil,
    Trash2,
    Clock,
    User,
    Bookmark,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardContent,
    CardFooter,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import CommentPage from "@/components/Comment";
import { formatDate } from "@/lib/utils";
import LoadingScreen from "@/components/LoadingScreen";
import { FaBell, FaRegBellSlash } from "react-icons/fa";

type Blog = {
    _id: string;
    tittle: string;
    content: string;
    category: string;
    likesCount: number;
    commentCount: number;
    userId: string;
    isLike: boolean;
    createdAt: string;
    image: string;
};

export default function BlogDetail({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params); // ✅ unwrap params (Next.js 15)
    const { data: session } = useSession();
    const router = useRouter();

    const [blog, setBlog] = useState<Blog | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);

    // Fetch blog
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await fetch(`/api/blog/${id}`, { cache: "no-store" });
                if (!res.ok) throw new Error("Blog not found");

                const data = await res.json();
                setBlog(data.blog);
            } catch (error) {
                console.error("Error fetching blog:", error);
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlog();
    }, [id, router]);

    // Like
    const handleLike = async (blogId: string, isCurrentlyLike: boolean) => {
        try {
            setBtnLoading(true);
            const res = await fetch(`/api/like/${blogId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) return toast.error("Failed to like");

            setBlog((prev) =>
                prev
                    ? { ...prev, likesCount: data.likes, isLike: !isCurrentlyLike }
                    : null
            );

            toast.success(
                isCurrentlyLike ? "Unliked successfully" : "Liked successfully"
            );
        } catch (error) {
            console.error("Error liking blog", error);
        } finally {
            setBtnLoading(false);
        }
    };

    // Subscribe
    const handleSubscribe = async (blog: Blog) => {
        try {
            setBtnLoading(true);
            const res = await fetch(`/api/subscriber/${blog.userId}`, {
                method: isSubscribed ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (!res.ok) return toast.error(data.message || "Action failed");

            setIsSubscribed(!isSubscribed);
            toast.success(
                isSubscribed ? "Subscribed successfully" : "UnSubscribed successfully"
            );
        } catch {
            toast.error("Something went wrong");
        } finally {
            setBtnLoading(false);
        }
    };

    // Wishlist
    const handleWishlist = async (id: string) => {
        try {
            setBtnLoading(true);
            const res = await fetch(`/api/save/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Blog saved to wishlist");
                router.push("/pages/wishlist");
            } else {
                toast.error(data.message || "Failed to save blog");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setBtnLoading(false);
        }
    };

    // Delete
    const removeBlog = async (id: string) => {
        try {
            setBtnLoading(true);
            const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });

            if (res.status === 204) {
                toast.success("Blog deleted successfully");
                router.push("/pages/dashBoard");
            } else {
                const data = await res.json();
                toast.error(data.message || "Failed to delete blog");
            }
        } catch {
            toast.error("Error deleting blog");
        } finally {
            setBtnLoading(false);
        }
    };

    const EditBlog = (id: string) => router.push(`/editblog/${id}`);

    // Loading
    if (isLoading) return <LoadingScreen />;

    // Blog not found
    if (!blog) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Blog not found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>
                            The blog you&apos;re looking for doesn&apos;t exist or may have
                            been removed.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => router.push("/pages/dashBoard")}>
                            Back to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // ✅ Main Blog Detail
    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <Card className="overflow-hidden">
                {blog.image && (
                    <div className="relative h-64 w-full">
                        <img src={blog.image} alt={blog.tittle} className="object-cover w-full h-full" />
                    </div>
                )}

                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex flex-col">
                                <span className="text-sm font-medium leading-none ">
                                    {session?.user?.id === blog?.userId
                                        ? session.user.name
                                        : "Anonymous"}
                                </span>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Clock className="mr-1 h-4 w-4" />
                                    {formatDate(blog.createdAt)}
                                </div>
                                <Badge className="text-sm mt-2 w-fit">{blog.category}</Badge>
                            </div>
                        </div>

                        {/* Actions (only for owner) */}
                        {session?.user?.id === blog.userId && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={() => EditBlog(blog._id)}
                                    disabled={btnLoading}
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 bg-red-600 text-white hover:bg-red-700"
                                            disabled={btnLoading}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete your blog post.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => removeBlog(blog._id)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}

                        {/* Subscribe + Wishlist */}
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleSubscribe(blog)}
                                disabled={btnLoading}
                                className="flex items-center gap-1"
                            >
                                {isSubscribed ? <FaBell /> : <FaRegBellSlash />}
                                {isSubscribed ? "Subscribe" : "UnSubscribe"}
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleWishlist(blog._id)}
                                disabled={btnLoading}
                                className="flex items-center gap-1"
                            >
                                <Bookmark className="h-4 w-4" />
                                Save
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {blog.tittle}
                    </CardTitle>

                    <div
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => handleLike(blog._id, blog.isLike)}
                        disabled={btnLoading}
                    >
                        <Heart
                            className="h-5 w-5 transition-colors duration-200"
                            fill={blog.isLike ? "red" : "none"}
                            stroke={blog.isLike ? "red" : "gray"}
                        />
                        <span>{blog.likesCount} Likes</span>
                    </Button>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-6">
                    <div className="mt-8 p-4 border rounded-xl shadow-sm bg-muted/30 w-full">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Comments
                        </h3>
                        <CommentPage />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
