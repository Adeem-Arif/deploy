'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TipTapEditor from "@/components/TipTap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Category = "technology" | "LifeStyle" | "travel";

export default function CreateBlogPage() {
  const [tittle, setTittle] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [content, setContent] = useState("");
  const [image, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCategory = (value: Category) => {
    setCategory(value);
  };

  const handleSubmit = async () => {
    // Client-side validation before sending to server
    if (!tittle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter blog content");
      return;
    }
    if (!image) {
      toast.error("Please upload an image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("tittle", tittle);
    formData.append("content", content);
    formData.append("category", category);
    formData.append("image", image);

    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Blog created successfully");
        setTittle('');
        setContent('');
        setCategory('');
        setImageFile(null);
        router.push("/pages/dashBoard");
      } else {
        toast.error(data.message || "Invalid fields");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Blog</h1>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            onChange={(e) => setTittle(e.target.value)}
            value={tittle}
            id="title"
            placeholder="Enter blog title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            type="file"
            id="image"
            accept="image/*"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={handleCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="LifeStyle">Lifestyle</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>

        <div className="pt-4 text-right">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Blog"}
          </Button>
        </div>
      </div>
    </div>
  );
}
