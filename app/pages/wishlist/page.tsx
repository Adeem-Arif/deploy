"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FaBookmark } from "react-icons/fa";



interface Blog {
  _id: string;
  tittle: string;
  content: string;
}

export default function WishList() {
  const [wishlist, setWishlist] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch("/api/save");
        if (!res.ok) throw new Error("Failed to load wishlist");
        const data = await res.json();
        setWishlist(data.blogs || []);
      } catch (err) {
        toast.error("Error loading wishlist");
      }
    };

    fetchWishlist();
  }, []);


  const removeWishlistItem = async (blogId: string) => {
    try {
      const res=await fetch(`/api/save/${blogId}`, {
        method:"PUT",
        headers:{
          "Content-Type": "application/json",
        
      },
      body: JSON.stringify({ blogId }),
      
    }
    )
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove item");
      }
      const updateWishlist = wishlist.filter((item) => item._id !== blogId);
      setWishlist(updateWishlist)
      toast.success("Removed from wishlist");
    }
    
    catch (error) {
     
      console.error("Error removing item from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    }
  }
      




  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-zinc-100 dark:from-zinc-900 dark:to-black text-zinc-900 dark:text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Heart className="text-red-500" />
          My Wishlist
        </h1>

        {wishlist.length === 0 ? (
          <p className="text-center text-zinc-500">
            Your wishlist is empty. Start adding some favorites!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <Card key={item._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5 space-y-2">
                  <h3 className="text-xl font-semibold">{item.tittle}</h3>
                  <p
                    className="text-zinc-600 dark:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  ></p>
                  <Button variant="outline" onClick={()=>removeWishlistItem(item._id)} >
                    <FaBookmark  />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
